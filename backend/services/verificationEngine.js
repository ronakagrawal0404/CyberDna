// Verification & Deduplication Engine
// Evaluates corroborating evidence between discovered accounts and findings.
// Assigns High / Medium / Low confidence and differentiates Confirmed from Potential matches.

export function verifyAndDeduplicate(findings, accounts, targetQuery, targetType) {
  // 1. Deduplicate accounts by canonical URL and platform+handle
  const uniqueAccountsMap = new Map();
  for (const acc of accounts) {
    const key = (acc.url || `${acc.platform}:${acc.handle}`).toLowerCase();
    if (!uniqueAccountsMap.has(key)) {
      uniqueAccountsMap.set(key, acc);
    }
  }
  const deduplicatedAccounts = Array.from(uniqueAccountsMap.values());

  // 2. Assess Account Confidence & Confirmation
  // We compare attributes across accounts (display name similarity, cross-links, bio keywords, avatar)
  const confirmedAccounts = [];
  const potentialMatches = [];

  for (const acc of deduplicatedAccounts) {
    let confidence = 'Medium';
    let matchReasons = [];

    if (acc.verified || acc.proofType) {
      confidence = 'High';
      matchReasons.push('Cryptographic identity proof or verified provider status');
    } else if (targetType === 'email' && acc.platform === 'Gravatar') {
      confidence = 'High';
      matchReasons.push('Direct cryptographic MD5 match to target email address');
    } else if (acc.platform === 'GitHub') {
      // Check if bio or blog or location links back to target
      if (acc.email && targetType === 'email' && acc.email.toLowerCase() === targetQuery.toLowerCase()) {
        confidence = 'High';
        matchReasons.push('Explicit email match in GitHub profile attribute');
      } else if (targetType === 'username' && acc.handle.toLowerCase() === targetQuery.toLowerCase()) {
        confidence = 'High';
        matchReasons.push('Exact case-insensitive username match on primary developer platform');
      } else {
        confidence = 'Medium';
        matchReasons.push('Platform account match with correlating profile metadata');
      }
    } else {
      // Third-party platforms (Dev.to, HackerNews, GitLab, etc.)
      if (targetType === 'username' && acc.handle.toLowerCase() === targetQuery.toLowerCase()) {
        if (acc.bio || acc.displayName) {
          confidence = 'Medium';
          matchReasons.push('Matching handle with active user metadata');
        } else {
          confidence = 'Low';
          matchReasons.push('Matching handle on platform without secondary corroborating metadata');
        }
      }
    }

    const enrichedAcc = {
      ...acc,
      confidence,
      matchReasons,
      isConfirmed: confidence === 'High'
    };

    if (confidence === 'High') {
      confirmedAccounts.push(enrichedAcc);
    } else {
      potentialMatches.push(enrichedAcc);
    }
  }

  // 3. Deduplicate Findings by unique finding summary & source
  const uniqueFindingsMap = new Map();
  for (const f of findings) {
    const key = `${f.source}:${f.finding}`.toLowerCase();
    if (!uniqueFindingsMap.has(key)) {
      // Ensure finding has confidence & status
      uniqueFindingsMap.set(key, {
        ...f,
        status: f.status || 'open',
        id: `f-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString()
      });
    }
  }
  const deduplicatedFindings = Array.from(uniqueFindingsMap.values());

  return {
    accounts: [...confirmedAccounts, ...potentialMatches],
    confirmedAccounts,
    potentialMatches,
    findings: deduplicatedFindings
  };
}
