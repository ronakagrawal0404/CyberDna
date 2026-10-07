import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { runDigitalFootprintScan } from './services/footprintService.js';
import { analyzeDomainDns } from './services/dnsService.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Mock In-Memory Database
let db = {
  footprintScans: [],
  footprintTimeline: [
    {
      id: 'tl-init',
      type: 'system_initialized',
      title: 'Footprint Defense Engine Armed',
      description: 'Zero-knowledge public OSINT and security telemetry listeners ready for scans.',
      timestamp: new Date().toISOString()
    }
  ],
  user: {
    name: 'User',
    email: 'user@cyberdna.io',
    isAuthenticated: false,
    hasCompletedOnboarding: false,
    score: 82,
    level: 'Cyber Defender',
    riskStatus: 'Medium Risk',
    streak: 3,
    badges: ['Phishing Shield', 'OTP Guardian'],
    twin: {
      personality: 'Fast Decision Maker',
      summary: 'You usually trust urgent messages. Improve verification habits.',
      phishingRisk: 72,
      socialRisk: 84,
      privacyRisk: 45,
      scanning: false,
      privacyScore: 76,
      privacyIssues: [
        { id: 'p1', type: 'exposure', text: 'Public email exposure detected on hack-forums' },
        { id: 'p2', type: 'settings', text: 'Weak privacy settings on public social profiles' }
      ],
      permissions: [
        { id: 1, app: 'Instagram', camera: 'Allowed', location: 'Allowed', risk: 'Low' },
        { id: 2, app: 'Unknown Wallpaper App', camera: 'Denied', contacts: 'Allowed', location: 'Allowed', risk: 'High' },
        { id: 3, app: 'Mobile Banking App', camera: 'Allowed', location: 'Allowed', risk: 'Low' }
      ]
    },
    recovery: {
      incident: null,
      risk: null,
      progress: 0,
      steps: []
    },
    family: [
      { name: 'Mother', score: 88, risk: 'Low Risk', alerts: 0, weaknesses: ['Reuses passwords occasionally'] },
      { name: 'Father', score: 64, risk: 'High Risk', alerts: 2, weaknesses: ['Clicks unknown link shorteners', 'No MFA enabled'] },
      { name: 'Child', score: 79, risk: 'Medium Risk', alerts: 1, weaknesses: ['Public gaming accounts', 'Weak security questions'] }
    ]
  },
  simulations: [
    {
      id: 'internship',
      category: 'Internship Scam',
      message: 'Congratulations! You are selected for the remote data-entry internship at GlobalTech Inc. To verify your credentials and secure your laptop shipment, pay a $50 processing fee at verification-portal.net.',
      options: [
        { label: 'Pay the fee to secure the job', value: 'pay', correct: false, reason: 'Legitimate employers never ask candidates to pay onboarding or verification fees.' },
        { label: 'Verify using the provided link', value: 'verify', correct: false, reason: 'The link matches a known typosquatted domain designed for credential harvesting.' },
        { label: 'Ignore the message entirely', value: 'ignore', correct: true, reason: 'Safest response, but reporting it helps protect others.' },
        { label: 'Report as Scam to CyberDNA', value: 'report', correct: true, bonus: true, reason: 'Excellent! Reporting flags the domain in our Threat Network.' }
      ]
    },
    {
      id: 'banking',
      category: 'Banking Scam',
      message: 'ALERT: Suspicious transaction of $489.20 detected on your checking account. If this was not you, instantly lock your card and verify your identity: verify-identity-check.web.app/login.',
      options: [
        { label: 'Click link and type banking details to lock', value: 'pay', correct: false, reason: 'Banks never link to generic web.app pages to lock cards.' },
        { label: 'Call customer care from your bank card back-side', value: 'verify', correct: true, reason: 'Correct! Always call official numbers printed directly on your banking cards.' },
        { label: 'Ignore the SMS warning', value: 'ignore', correct: false, reason: 'Ignoring might be safe, but a quick check on your official app is safer if it were a real warning.' },
        { label: 'Report link to CyberDNA Scam Shield', value: 'report', correct: true, bonus: true, reason: 'Correct! Flags the fraudulent login portal in real-time.' }
      ]
    },
    {
      id: 'qr',
      category: 'QR Scam',
      message: 'A restaurant bill table has a sticker saying: "Scan for 20% Discount on your total bill today!". The QR code points to scan-pay-discount.click.',
      options: [
        { label: 'Scan and type credit card info', value: 'pay', correct: false, reason: 'Stickers placed over authentic table QRs are a common method for redirecting payments.' },
        { label: 'Check with waiter if it is official restaurant promo', value: 'verify', correct: true, reason: 'Smart move! Always verify out-of-band codes with staff.' },
        { label: 'Scan and pay using Apple Pay/Google Pay', value: 'ignore', correct: false, reason: 'Even tokenized payments can redirect to phished payment templates.' },
        { label: 'Report QR code link', value: 'report', correct: true, bonus: true, reason: 'Excellent check!' }
      ]
    },
    {
      id: 'giveaway',
      category: 'Giveaway Scam',
      message: 'You won a brand new iPhone 15 Pro Max from an official-looking Instagram contest! Claim code: WIN99. Click here: prize-delivery.club/shipping to pay a $2.99 shipping fee.',
      options: [
        { label: 'Pay $2.99 shipping via credit card', value: 'pay', correct: false, reason: 'Entering card details on prize websites leads to subscription traps or card compromise.' },
        { label: 'Ignore message and report user profile', value: 'report', correct: true, reason: 'Correct. Fake giveaways are designed to collect credit card info.' },
        { label: 'Message them asking for details', value: 'verify', correct: false, reason: 'Chatting with scammers gives them leverage to socially engineer you.' }
      ]
    },
    {
      id: 'support',
      category: 'Customer Support Scam',
      message: 'Your Windows laptop displays a flashing red alert: "CRITICAL VIRUS DETECTED! Call Microsoft Helpline at +1-888-555-0199 immediately. Do not restart."',
      options: [
        { label: 'Call the helpline number immediately', value: 'pay', correct: false, reason: 'Microsoft never prompts you to call support lines via browser alerts.' },
        { label: 'Restart the computer and check security software', value: 'verify', correct: true, reason: 'Correct. This is a browser lock screen pop-up designed to panic you.' },
        { label: 'Install remote access software they suggest', value: 'ignore', correct: false, reason: 'Allowing remote support gives absolute control to bad actors.' },
        { label: 'Close browser with Task Manager', value: 'report', correct: true, bonus: true, reason: 'Perfect! Terminating the browser script stops the fake warning loop.' }
      ]
    }
  ],
  simulationHistory: [
    { id: 1, simulation: 'QR Scam', score: 90, strength: 'Link checking', weakness: 'Visual verification', date: '2026-06-15' }
  ],
  threats: [
    { id: 1, name: 'Fake Scholarship Scam', affected: 2340, details: 'Students receive emails claiming a funded scholarship; requires a deposit.', status: 'Protection Added', category: 'Phishing' },
    { id: 2, name: 'Fake Delivery SMS Scam', affected: 980, details: 'SMS alerts state package is pending due to unpaid postage; harvests card info.', status: 'Protection Added', category: 'Smishing' }
  ]
};

// --- AUTHENTICATION ROUTES ---

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  
  db.user.email = email;
  db.user.name = email.split('@')[0];
  db.user.isAuthenticated = true;
  
  res.json({ user: db.user });
});

app.post('/api/auth/logout', (req, res) => {
  db.user.isAuthenticated = false;
  res.json({ success: true });
});

// --- ONBOARDING QUIZ ---

app.post('/api/onboarding', (req, res) => {
  const { answers } = req.body; // Array of choices
  
  // Custom logic to calculate score based on onboarding choices
  let scorePoints = 100;
  
  // Q1: Suspicious links (Always=0, Sometimes=-15, Never=-30)
  if (answers[0] === 'Sometimes') scorePoints -= 15;
  if (answers[0] === 'Never') scorePoints -= 30;
  
  // Q2: Password reuse (Yes=-25, Non-critical=-10, Never=0)
  if (answers[1] === 'Yes') scorePoints -= 25;
  if (answers[1] === 'Non-critical') scorePoints -= 10;
  
  // Q3: Scam experience (Yes=-15, caught=-5, No=0)
  if (answers[2] === 'Yes') scorePoints -= 15;
  if (answers[2] === 'caught') scorePoints -= 5;
  
  // Q4: Confidence (Low=-15, Moderate=-5, High=0)
  if (answers[3] === 'Low') scorePoints -= 15;
  if (answers[3] === 'Moderate') scorePoints -= 5;

  db.user.score = Math.max(30, scorePoints);
  db.user.hasCompletedOnboarding = true;
  
  // Assign personality profile based on responses
  if (db.user.score < 55) {
    db.user.level = 'Cyber Rookie';
    db.user.riskStatus = 'High Risk';
    db.user.twin.personality = 'Vulnerable Explorer';
    db.user.twin.summary = 'You rely heavily on digital conveniences without verifying sources. CyberDNA will focus on core threat awareness.';
    db.user.twin.phishingRisk = 88;
    db.user.twin.socialRisk = 92;
    db.user.twin.privacyRisk = 75;
  } else if (db.user.score < 80) {
    db.user.level = 'Cyber Defender';
    db.user.riskStatus = 'Medium Risk';
    db.user.twin.personality = 'Fast Decision Maker';
    db.user.twin.summary = 'You usually trust urgent messages. Improve verification habits and check domain age before typing passwords.';
    db.user.twin.phishingRisk = 72;
    db.user.twin.socialRisk = 84;
    db.user.twin.privacyRisk = 45;
  } else {
    db.user.level = 'Cyber Guardian';
    db.user.riskStatus = 'Low Risk';
    db.user.twin.personality = 'Analytical Protector';
    db.user.twin.summary = 'Superb awareness. You exhibit strong verification logic. Focus on advanced social engineering and zero-day protection.';
    db.user.twin.phishingRisk = 25;
    db.user.twin.socialRisk = 30;
    db.user.twin.privacyRisk = 20;
  }
  
  res.json({ user: db.user });
});

// --- PROFILE & USER ROUTES ---

app.get('/api/user/profile', (req, res) => {
  res.json({ user: db.user });
});

app.post('/api/user/scan-privacy', (req, res) => {
  db.user.twin.scanning = true;
  setTimeout(() => {
    db.user.twin.scanning = false;
    db.user.twin.privacyScore = 92;
    db.user.twin.privacyIssues = [];
    db.user.score = Math.min(100, db.user.score + 5);
  }, 1500);
  res.json({ success: true, message: 'Privacy scanning triggered' });
});

app.post('/api/user/fix-permissions', (req, res) => {
  // Simulates removing wallpaper app permission
  db.user.twin.permissions = db.user.twin.permissions.map(p => {
    if (p.app === 'Unknown Wallpaper App') {
      return { ...p, contacts: 'Denied', location: 'Denied', risk: 'Low' };
    }
    return p;
  });
  db.user.score = Math.min(100, db.user.score + 3);
  res.json({ success: true, user: db.user });
});

// --- ARENA SIMULATION ROUTES ---

app.get('/api/simulations', (req, res) => {
  res.json({ simulations: db.simulations, history: db.simulationHistory });
});

app.post('/api/simulations/complete', (req, res) => {
  const { id, choice, reactionTime } = req.body;
  const sim = db.simulations.find(s => s.id === id);
  
  if (!sim) {
    return res.status(404).json({ error: 'Simulation not found' });
  }
  
  const selectedOption = sim.options.find(o => o.value === choice);
  if (!selectedOption) {
    return res.status(400).json({ error: 'Invalid choice selected' });
  }
  
  let scoreAwarded = selectedOption.correct ? 95 : 40;
  if (selectedOption.bonus) scoreAwarded = 100;
  
  // Deduct based on high reaction time in seconds if incorrect/slow
  if (reactionTime > 20 && !selectedOption.correct) {
    scoreAwarded = Math.max(20, scoreAwarded - 15);
  }
  
  // Calculate score improvement and update user profile
  const scoreDiff = selectedOption.correct ? 4 : -5;
  const oldScore = db.user.score;
  db.user.score = Math.min(100, Math.max(10, db.user.score + scoreDiff));
  db.user.streak = selectedOption.correct ? db.user.streak + 1 : 0;
  
  // Evolve Level
  if (db.user.score > 90) {
    db.user.level = 'Cyber Guardian';
    db.user.riskStatus = 'Low Risk';
  } else if (db.user.score > 70) {
    db.user.level = 'Cyber Defender';
    db.user.riskStatus = 'Medium Risk';
  } else {
    db.user.level = 'Cyber Rookie';
    db.user.riskStatus = 'High Risk';
  }
  
  const reportCard = {
    simulation: sim.category,
    score: scoreAwarded,
    strength: selectedOption.correct ? 'Fast Verification' : 'None',
    weakness: selectedOption.correct ? 'None' : 'Emotional Pressure Response',
    improvement: db.user.score - oldScore,
    nextMission: 'Advanced Job Scam',
    reasoning: selectedOption.reason
  };
  
  // Add to history
  db.simulationHistory.unshift({
    id: Date.now(),
    simulation: sim.category,
    score: scoreAwarded,
    strength: reportCard.strength,
    weakness: reportCard.weakness,
    date: new Date().toISOString().split('T')[0]
  });
  
  res.json({
    success: true,
    reportCard,
    user: db.user,
    history: db.simulationHistory
  });
});

// --- SCAM SHIELD ROUTE ---

app.post('/api/scans/analyze', (req, res) => {
  const { type, input } = req.body;
  
  if (!input) {
    return res.status(400).json({ error: 'Input content is required' });
  }
  
  let domainAge = 'N/A';
  let trustScore = 85;
  let verdict = 'SECURE';
  let suspiciousKeywords = [];
  
  const lowerInput = input.toLowerCase();
  
  if (type === 'url') {
    domainAge = '1.2 years';
    // Test URL scams
    if (lowerInput.includes('verify') || lowerInput.includes('login-bank') || lowerInput.includes('free') || lowerInput.includes('.xyz') || lowerInput.includes('.club') || lowerInput.includes('secure-checking') || lowerInput.includes('.click')) {
      domainAge = '10 days';
      trustScore = 22;
      verdict = 'HIGH RISK';
      suspiciousKeywords = ['verification-link', 'unusual-domain-tld'];
    } else if (lowerInput.includes('promo') || lowerInput.includes('coupon')) {
      domainAge = '45 days';
      trustScore = 55;
      verdict = 'WARNING';
      suspiciousKeywords = ['marketing-redirect'];
    }
  } else if (type === 'message' || type === 'email') {
    const dangerWords = ['win', 'prize', 'gift card', 'pay fee', 'urgent', 'locked', 'social security', 'verify credential', 'inherited', 'lottery'];
    const count = dangerWords.filter(word => lowerInput.includes(word)).length;
    
    if (count >= 3) {
      trustScore = 15;
      verdict = 'HIGH RISK';
      suspiciousKeywords = ['urgent-panic-trigger', 'financial-claims', 'coercive-call-to-action'];
    } else if (count >= 1) {
      trustScore = 48;
      verdict = 'WARNING';
      suspiciousKeywords = ['unsolicited-offer'];
    }
  } else if (type === 'screenshot') {
    // Screenshot scanning mock
    if (lowerInput.includes('alert') || lowerInput.includes('hacked') || lowerInput.includes('invoice') || lowerInput.includes('receipt')) {
      trustScore = 30;
      verdict = 'HIGH RISK';
      suspiciousKeywords = ['visual-spoofing', 'scam-template-detected'];
    }
  }
  
  res.json({
    type,
    input,
    domainAge,
    trustScore,
    verdict,
    suspiciousKeywords
  });
});

// --- RECOVERY MODE ROUTES ---

app.post('/api/recovery/start', (req, res) => {
  const { incident } = req.body;
  
  let risk = 'Low Risk';
  let steps = [];
  
  switch (incident) {
    case 'Clicked suspicious link':
      risk = 'Account Exposure';
      steps = [
        { id: 1, text: 'Change passwords for key apps linked to that email', done: false },
        { id: 2, text: 'Enable Multi-Factor Authentication (MFA)', done: false },
        { id: 3, text: 'Review active browser and account sessions', done: false },
        { id: 4, text: 'Run local malware scanner on your device', done: false }
      ];
      break;
    case 'Paid scammer':
      risk = 'Financial Loss & Identity Exposure';
      steps = [
        { id: 1, text: 'Contact bank immediately to freeze credit card/account', done: false },
        { id: 2, text: 'File a complaint with official cybersecurity centers', done: false },
        { id: 3, text: 'Enable credit locks/alerts with bureaus', done: false },
        { id: 4, text: 'Monitor banking alerts for subsequent transactions', done: false }
      ];
      break;
    case 'Account hacked':
      risk = 'Identity Theft & Profile Exposure';
      steps = [
        { id: 1, text: 'Use official account recovery link to request password reset', done: false },
        { id: 2, text: 'Contact support to lock the compromise sessions', done: false },
        { id: 3, text: 'Notify friends/contacts not to trust recent chats', done: false },
        { id: 4, text: 'Update recovery emails and phone digits', done: false }
      ];
      break;
    case 'Lost device':
      risk = 'Device Hardware Access';
      steps = [
        { id: 1, text: 'Activate Find My Device / remote wipe options', done: false },
        { id: 2, text: 'Log out of device account cloud profile', done: false },
        { id: 3, text: 'Change passcode credentials on primary networks', done: false }
      ];
      break;
    case 'Shared information':
      risk = 'Credential Exposure';
      steps = [
        { id: 1, text: 'Instantly modify the specific leaked credentials', done: false },
        { id: 2, text: 'Enable authentication alerts', done: false },
        { id: 3, text: 'Draft alert checks for phished communications', done: false }
      ];
      break;
    default:
      risk = 'Unknown Risk';
      steps = [{ id: 1, text: 'Review security parameters with Scam Shield', done: false }];
  }
  
  db.user.recovery = {
    incident,
    risk,
    progress: 0,
    steps
  };
  
  res.json({ recovery: db.user.recovery });
});

app.post('/api/recovery/step', (req, res) => {
  const { stepId, done } = req.body;
  
  if (!db.user.recovery.incident) {
    return res.status(400).json({ error: 'No active recovery incident' });
  }
  
  db.user.recovery.steps = db.user.recovery.steps.map(step => {
    if (step.id === stepId) {
      return { ...step, done };
    }
    return step;
  });
  
  const completed = db.user.recovery.steps.filter(s => s.done).length;
  db.user.recovery.progress = Math.round((completed / db.user.recovery.steps.length) * 100);
  
  if (db.user.recovery.progress === 100) {
    db.user.score = Math.min(100, db.user.score + 8);
  }
  
  res.json({ recovery: db.user.recovery, user: db.user });
});

// --- THREAT INTELLIGENCE FEED ---

app.get('/api/threats', (req, res) => {
  res.json({ threats: db.threats });
});

app.post('/api/threats', (req, res) => {
  const { name, category, details } = req.body;
  if (!name || !details) {
    return res.status(400).json({ error: 'Name and details are required' });
  }
  
  const newThreat = {
    id: Date.now(),
    name,
    affected: Math.floor(Math.random() * 500) + 10,
    details,
    status: 'Protection Added',
    category: category || 'General Scam'
  };
  
  db.threats.unshift(newThreat);
  res.json({ threats: db.threats });
});

// --- DIGITAL FOOTPRINT SCANNER ENDPOINTS ---

app.post('/api/footprint/scan', async (req, res) => {
  const { targetType, targetQuery } = req.body;

  if (!targetType || !targetQuery) {
    return res.status(400).json({ error: 'targetType and targetQuery are required' });
  }

  const validTypes = ['email', 'username', 'domain'];
  if (!validTypes.includes(targetType.toLowerCase())) {
    return res.status(400).json({ error: 'targetType must be email, username, or domain' });
  }

  try {
    const report = await runDigitalFootprintScan(targetType.toLowerCase(), targetQuery);

    // Look for previous scan of same target or last user scan
    const previousScan = db.footprintScans.find(s => 
      s.targetType === report.targetType && 
      s.targetQuery.toLowerCase() === report.targetQuery.toLowerCase()
    );

    let historyDelta = null;
    if (previousScan) {
      const prevScore = previousScan.risk.score;
      const currScore = report.risk.score;
      const delta = prevScore - currScore; // positive = exposure decreased, negative = exposure increased

      // Compare finding IDs/names
      const prevFindingKeys = new Set(previousScan.findings.map(f => f.finding));
      const currFindingKeys = new Set(report.findings.map(f => f.finding));

      const newFindings = report.findings.filter(f => !prevFindingKeys.has(f.finding));
      const resolvedFindings = previousScan.findings.filter(f => !currFindingKeys.has(f.finding));

      historyDelta = {
        previousScore: prevScore,
        currentScore: currScore,
        scoreDelta: delta,
        message: delta > 0 
          ? `Your public exposure decreased by ${delta} points.` 
          : delta < 0 
          ? `Your public exposure increased by ${Math.abs(delta)} points.` 
          : 'Your public exposure score is unchanged.',
        newFindingsCount: newFindings.length,
        resolvedFindingsCount: resolvedFindings.length
      };

      // Add timeline entry
      db.footprintTimeline.unshift({
        id: `tl-${Date.now()}`,
        type: 'rescan_comparison',
        title: `Re-scan Analysis: ${report.targetQuery}`,
        description: `Exposure shifted from ${prevScore} -> ${currScore} (${delta >= 0 ? `-${delta}` : `+${Math.abs(delta)}`} pts). ${resolvedFindings.length} issue(s) resolved, ${newFindings.length} new exposure(s).`,
        timestamp: new Date().toISOString()
      });
    } else {
      // First scan timeline entry
      db.footprintTimeline.unshift({
        id: `tl-${Date.now()}`,
        type: 'initial_scan',
        title: `Initial Scan Completed: ${report.targetQuery}`,
        description: `Discovered ${report.summary.accountsDiscovered} accounts, ${report.summary.totalFindings} exposures. Risk score established at ${report.risk.score}/100.`,
        timestamp: new Date().toISOString()
      });
    }

    // Save scan to database
    db.footprintScans.unshift(report);

    // Keep max 50 scans
    if (db.footprintScans.length > 50) {
      db.footprintScans = db.footprintScans.slice(0, 50);
    }

    res.json({
      scan: report,
      historyDelta
    });
  } catch (err) {
    console.error('Footprint scan error:', err);
    res.status(500).json({ error: 'Failed to complete digital footprint scan', details: err.message });
  }
});

app.get('/api/footprint/history', (req, res) => {
  res.json({
    scans: db.footprintScans,
    timeline: db.footprintTimeline
  });
});

app.post('/api/footprint/remediate', (req, res) => {
  const { scanId, findingId, status } = req.body;

  if (!scanId || !findingId || !status) {
    return res.status(400).json({ error: 'scanId, findingId, and status are required' });
  }

  const scan = db.footprintScans.find(s => s.scanId === scanId);
  if (!scan) {
    return res.status(404).json({ error: 'Scan record not found' });
  }

  const finding = scan.findings.find(f => f.id === findingId);
  if (!finding) {
    return res.status(404).json({ error: 'Finding record not found' });
  }

  const oldStatus = finding.status;
  finding.status = status;

  // Log timeline event
  db.footprintTimeline.unshift({
    id: `tl-${Date.now()}`,
    type: 'remediation_update',
    title: `Remediation Updated: ${finding.finding}`,
    description: `Status changed from '${oldStatus}' to '${status}'.`,
    timestamp: new Date().toISOString()
  });

  // If remediated, dynamically improve the risk score by finding's impact
  if (status === 'remediated' && oldStatus !== 'remediated') {
    const factor = scan.risk.scoreFactors.find(sf => sf.factor === finding.finding);
    const reduction = factor ? factor.points : 10;
    scan.risk.score = Math.max(0, scan.risk.score - reduction);
    if (scan.risk.score < 25) scan.risk.riskLevel = 'Low Exposure';
    else if (scan.risk.score < 50) scan.risk.riskLevel = 'Moderate Exposure';
    else if (scan.risk.score < 75) scan.risk.riskLevel = 'Elevated Exposure';
  }

  res.json({
    scan,
    timeline: db.footprintTimeline
  });
});

app.post('/api/footprint/verify-automated', async (req, res) => {
  const { scanId, findingId, domain } = req.body;

  if (!domain) {
    return res.status(400).json({ error: 'domain is required for automated verification' });
  }

  try {
    const dnsRes = await analyzeDomainDns(domain);
    const stillHasIssue = dnsRes.findings.some(f => f.finding.toLowerCase().includes('dmarc') || f.finding.toLowerCase().includes('spf'));

    let verified = false;
    if (!stillHasIssue) {
      verified = true;
      if (scanId && findingId) {
        const scan = db.footprintScans.find(s => s.scanId === scanId);
        if (scan) {
          const finding = scan.findings.find(f => f.id === findingId);
          if (finding) {
            finding.status = 'remediated';
          }
        }
      }
    }

    res.json({
      verified,
      message: verified 
        ? 'Automated live DNS check passed! DNS records verified.' 
        : 'Automated live DNS check detected that the issue is still active.',
      dns: dnsRes
    });
  } catch (err) {
    res.status(500).json({ error: 'Verification check failed', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`CyberDNA Backend running at http://localhost:${PORT}`);
});
