// HaveIBeenPwned & Public Breach Indicators Service
// Adheres strictly to production rule: No synthetic breach data. 
// If HIBP_API_KEY is omitted, indicates API status clearly.

export async function checkBreaches(account) {
  const apiKey = process.env.HIBP_API_KEY;
  const cleanAccount = account.trim();

  if (!apiKey) {
    return {
      available: false,
      reason: 'HIBP_API_KEY is not configured in backend/.env. Public breach catalog enrichment was omitted.',
      breaches: [],
      findings: []
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);

  try {
    const res = await fetch(`https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(cleanAccount)}?truncateResponse=false`, {
      headers: {
        'hibp-api-key': apiKey,
        'user-agent': 'CyberDNA-Footprint-Scanner'
      },
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (res.status === 404) {
      return {
        available: true,
        breached: false,
        breaches: [],
        findings: []
      };
    }

    if (!res.ok) {
      return {
        available: false,
        reason: `HIBP API responded with status ${res.status}`,
        breaches: [],
        findings: []
      };
    }

    const breaches = await res.json();
    const findings = [];

    if (Array.isArray(breaches) && breaches.length > 0) {
      const breachNames = breaches.map(b => b.Title || b.Name).slice(0, 5).join(', ');
      findings.push({
        source: 'HaveIBeenPwned / Compromised Credentials Index',
        finding: `Account Discovered in ${breaches.length} Historical Public Breach(es) (${breachNames})`,
        evidence: `Disclosed records in: ${breachNames}${breaches.length > 5 ? ` and ${breaches.length - 5} more` : ''}.`,
        confidence: 'High',
        risk: breaches.length >= 3 ? 'Critical' : 'High',
        whyItMatters: 'Breached accounts often have past plaintext passwords or credential hashes traded in underground markets, enabling credential stuffing attacks.',
        recommendedAction: 'Rotate passwords on all affected services, ensure password uniqueness across platforms, and activate Multi-Factor Authentication (MFA).',
        remediationType: 'password_rotation',
        guide: {
          title: 'Remediate Leaked Credentials',
          steps: [
            'Change master credentials on any service sharing passwords with breached sites',
            'Adopt a dedicated password manager to generate unique 16+ character passwords',
            'Enable Authenticator App (TOTP) or Hardware Security Keys (YubiKey/FIDO2)'
          ]
        }
      });
    }

    return {
      available: true,
      breached: breaches.length > 0,
      breaches: breaches.map(b => ({
        name: b.Name,
        title: b.Title,
        domain: b.Domain,
        breachDate: b.BreachDate,
        addedDate: b.AddedDate,
        pwnCount: b.PwnCount,
        dataClasses: b.DataClasses
      })),
      findings
    };
  } catch (err) {
    clearTimeout(timeout);
    return {
      available: false,
      reason: err.message,
      breaches: [],
      findings: []
    };
  }
}
