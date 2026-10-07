// ICANN RDAP (Registration Data Access Protocol) Client
// Legitimate, open protocol for querying public domain registration status

export async function lookupDomainRdap(domain) {
  const cleanDomain = domain.toLowerCase().trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  
  // Skip top-level domains that don't look valid
  if (!cleanDomain.includes('.') || cleanDomain.endsWith('.')) {
    return null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);

  try {
    const res = await fetch(`https://rdap.org/domain/${cleanDomain}`, {
      headers: { 'Accept': 'application/rdap+json, application/json' },
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (!res.ok) return null;

    const data = await res.json();
    
    // Extract key registration events
    let creationDate = null;
    let expirationDate = null;
    let lastUpdated = null;

    if (Array.isArray(data.events)) {
      for (const ev of data.events) {
        if (ev.eventAction === 'registration') creationDate = ev.eventDate;
        if (ev.eventAction === 'expiration') expirationDate = ev.eventDate;
        if (ev.eventAction === 'last changed' || ev.eventAction === 'last update') lastUpdated = ev.eventDate;
      }
    }

    // Extract registrar entity
    let registrar = 'Unknown Registrar';
    if (Array.isArray(data.entities)) {
      const regEntity = data.entities.find(e => Array.isArray(e.roles) && e.roles.includes('registrar'));
      if (regEntity && regEntity.vcardArray && regEntity.vcardArray[1]) {
        const fn = regEntity.vcardArray[1].find(item => item[0] === 'fn');
        if (fn) registrar = fn[3];
      }
    }

    // Evaluate domain age
    let domainAgeDays = null;
    let isNewlyRegistered = false;
    if (creationDate) {
      const createdTime = new Date(creationDate).getTime();
      domainAgeDays = Math.floor((Date.now() - createdTime) / (1000 * 60 * 60 * 24));
      if (domainAgeDays < 90) {
        isNewlyRegistered = true;
      }
    }

    const findings = [];
    if (isNewlyRegistered) {
      findings.push({
        source: 'RDAP / Domain Registry',
        finding: 'Young / Newly Registered Domain (< 90 Days)',
        evidence: `Registered on ${creationDate.split('T')[0]} (${domainAgeDays} days old).`,
        confidence: 'High',
        risk: 'Low',
        whyItMatters: 'Newly registered domains lack established email reputation and may face temporary delivery greylisting by security filters.',
        recommendedAction: 'Warm up outbound email volume gradually and ensure SPF, DKIM, and DMARC records are configured.'
      });
    }

    return {
      domain: cleanDomain,
      registrar,
      creationDate,
      expirationDate,
      lastUpdated,
      domainAgeDays,
      status: Array.isArray(data.status) ? data.status : [],
      nameservers: Array.isArray(data.nameservers) ? data.nameservers.map(ns => ns.ldhName || ns.handle) : [],
      findings
    };
  } catch (err) {
    clearTimeout(timeout);
    return null;
  }
}
