// Explainable Digital Exposure Risk Engine (0 - 100)
// Deterministic calculation based strictly on confirmed/potential findings and exposure telemetry.

export function calculateDigitalExposureScore(findings, accounts, dnsResult, repos = []) {
  let score = 0;
  const scoreFactors = [];

  // Severity Weight Table
  const SEVERITY_BASE = {
    'Critical': 30,
    'High': 20,
    'Medium': 12,
    'Low': 5
  };

  const CONFIDENCE_MULTIPLIER = {
    'High': 1.0,
    'Medium': 0.75,
    'Low': 0.45
  };

  // 1. Process explicit findings
  for (const f of findings) {
    const basePts = SEVERITY_BASE[f.risk] || 10;
    const mult = CONFIDENCE_MULTIPLIER[f.confidence] || 0.8;
    const points = Math.round(basePts * mult);

    score += points;
    scoreFactors.push({
      factor: f.finding,
      source: f.source,
      points,
      risk: f.risk,
      confidence: f.confidence,
      reason: f.whyItMatters
    });
  }

  // 2. Structural footprint modifiers
  // A. Multi-platform account presence
  if (accounts.length >= 3) {
    const pts = Math.min(15, (accounts.length - 2) * 4);
    score += pts;
    scoreFactors.push({
      factor: `Broad Surface Footprint (${accounts.length} Discovered Public Profiles)`,
      source: 'Cross-Platform Topology',
      points: pts,
      risk: 'Medium',
      confidence: 'High',
      reason: 'Having multiple public profiles across independent ecosystems broadens the reconnaissance surface for social engineering.'
    });
  }

  // B. Public Repositories Volume
  if (repos.length >= 8) {
    const pts = 8;
    score += pts;
    scoreFactors.push({
      factor: `High Volume of Public Repositories (${repos.length} active repos)`,
      source: 'Developer Surface',
      points: pts,
      risk: 'Low',
      confidence: 'High',
      reason: 'Large public codebases increase the attack surface for accidental credential commits and dependency vulnerabilities.'
    });
  }

  // C. Cap score at 100 max, 0 min
  const finalScore = Math.min(100, Math.max(0, score));

  // Determine Exposure Level
  let riskLevel = 'Low Exposure';
  let badgeColor = 'var(--accent-emerald)';
  if (finalScore >= 75) {
    riskLevel = 'Critical Exposure';
    badgeColor = 'var(--threat-red)';
  } else if (finalScore >= 50) {
    riskLevel = 'Elevated Exposure';
    badgeColor = 'var(--alert-amber)';
  } else if (finalScore >= 25) {
    riskLevel = 'Moderate Exposure';
    badgeColor = '#eab308';
  } else {
    riskLevel = 'Low Exposure';
    badgeColor = 'var(--accent-emerald)';
  }

  // Categorize findings by risk
  const criticalFindings = findings.filter(f => f.risk === 'Critical');
  const highFindings = findings.filter(f => f.risk === 'High');
  const mediumFindings = findings.filter(f => f.risk === 'Medium');
  const lowFindings = findings.filter(f => f.risk === 'Low');

  // Summary categories
  const categories = {
    identitySurface: scoreFactors.filter(s => s.source.includes('Profile') || s.source.includes('Networks') || s.source.includes('Cross-Platform')).reduce((acc, c) => acc + c.points, 0),
    contactPrivacy: scoreFactors.filter(s => s.source.includes('Email') || s.source.includes('Commits') || s.source.includes('Gravatar')).reduce((acc, c) => acc + c.points, 0),
    infrastructureDns: scoreFactors.filter(s => s.source.includes('DNS') || s.source.includes('RDAP')).reduce((acc, c) => acc + c.points, 0),
    credentialsBreach: scoreFactors.filter(s => s.source.includes('Breach') || s.source.includes('Compromised')).reduce((acc, c) => acc + c.points, 0)
  };

  return {
    score: finalScore,
    riskLevel,
    badgeColor,
    scoreFactors: scoreFactors.sort((a, b) => b.points - a.points),
    highCount: criticalFindings.length + highFindings.length,
    mediumCount: mediumFindings.length,
    lowCount: lowFindings.length,
    categories
  };
}
