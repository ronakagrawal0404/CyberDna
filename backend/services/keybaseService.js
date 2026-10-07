// Keybase Public Identity Proofs Service
// Discovers cryptographically proven social accounts and PGP public keys

export async function lookupKeybase(username) {
  const cleanUsername = username.trim().replace(/^@/, '');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(`https://keybase.io/_/api/1.0/user/lookup.json?usernames=${encodeURIComponent(cleanUsername)}`, {
      headers: { 'User-Agent': 'CyberDNA-Footprint-Scanner' },
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!res.ok) return { exists: false };
    const data = await res.json();

    if (data.status?.code !== 0 || !data.them || data.them.length === 0 || !data.them[0]) {
      return { exists: false };
    }

    const user = data.them[0];
    const proofs = [];
    const accounts = [{
      platform: 'Keybase',
      handle: user.basics?.username || cleanUsername,
      url: `https://keybase.io/${cleanUsername}`,
      displayName: user.profile?.full_name || cleanUsername,
      bio: user.profile?.bio,
      location: user.profile?.location
    }];

    // Parse cryptographic proofs
    if (user.proofs_summary && Array.isArray(user.proofs_summary.all)) {
      for (const proof of user.proofs_summary.all) {
        proofs.push({
          proofType: proof.proof_type,
          service: proof.proof_type,
          handle: proof.nametag,
          state: proof.state,
          serviceUrl: proof.service_url
        });

        accounts.push({
          platform: proof.proof_type.toUpperCase(),
          handle: proof.nametag,
          url: proof.service_url || '#',
          verified: proof.state === 1,
          proofType: 'Cryptographic Identity Proof'
        });
      }
    }

    const findings = [];
    if (proofs.length > 0) {
      findings.push({
        source: 'Keybase / Cryptographic Registry',
        finding: `Cryptographically Verified Identity Web (${proofs.length} Services Linked)`,
        evidence: `Proven accounts: ${proofs.map(p => `${p.service}:${p.handle}`).join(', ')}.`,
        confidence: 'High',
        risk: 'Low',
        whyItMatters: 'Keybase provides publicly verifiable cryptographic proofs linking multiple handles to one single human operator. While useful for trust, it maps your complete cross-platform identity.',
        recommendedAction: 'Verify that all linked services in your Keybase identity tree represent public personas you intend to link publicly.'
      });
    }

    return {
      exists: true,
      user,
      proofs,
      accounts,
      findings
    };
  } catch (err) {
    clearTimeout(timeout);
    return { exists: false, error: err.message };
  }
}
