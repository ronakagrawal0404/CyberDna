const API_BASE = 'http://localhost:5000/api';

// Fallback Mock database defaults
const DEFAULT_DB = {
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
        { label: 'Verify using the provided link', value: 'verify', correct: false, reason: 'The link matches a typosquatted domain designed for credential harvesting.' },
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

// Initialize fallback local database
function getLocalDB() {
  const data = localStorage.getItem('cyberdna_db');
  if (!data) {
    localStorage.setItem('cyberdna_db', JSON.stringify(DEFAULT_DB));
    return DEFAULT_DB;
  }
  return JSON.parse(data);
}

function saveLocalDB(db) {
  localStorage.setItem('cyberdna_db', JSON.stringify(db));
}

// Global fetch wrapper with fallback
async function request(path, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options
    });
    if (!res.ok) throw new Error('Server responded with error');
    return await res.json();
  } catch (error) {
    console.warn(`[API] Fallback to local storage for: ${path} (Reason: ${error.message})`);
    return handleFallback(path, options);
  }
}

// Fallback logic mimic
function handleFallback(path, options) {
  const db = getLocalDB();
  const body = options.body ? JSON.parse(options.body) : {};

  if (path === '/auth/login') {
    db.user.email = body.email || 'user@cyberdna.io';
    db.user.name = db.user.email.split('@')[0];
    db.user.isAuthenticated = true;
    saveLocalDB(db);
    return { user: db.user };
  }

  if (path === '/auth/logout') {
    db.user.isAuthenticated = false;
    saveLocalDB(db);
    return { success: true };
  }

  if (path === '/user/profile') {
    return { user: db.user };
  }

  if (path === '/onboarding') {
    const { answers } = body;
    let scorePoints = 100;
    if (answers[0] === 'Sometimes') scorePoints -= 15;
    if (answers[0] === 'Never') scorePoints -= 30;
    if (answers[1] === 'Yes') scorePoints -= 25;
    if (answers[1] === 'Non-critical') scorePoints -= 10;
    if (answers[2] === 'Yes') scorePoints -= 15;
    if (answers[2] === 'caught') scorePoints -= 5;
    if (answers[3] === 'Low') scorePoints -= 15;
    if (answers[3] === 'Moderate') scorePoints -= 5;

    db.user.score = Math.max(30, scorePoints);
    db.user.hasCompletedOnboarding = true;

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
    saveLocalDB(db);
    return { user: db.user };
  }

  if (path === '/user/scan-privacy') {
    db.user.twin.privacyScore = 92;
    db.user.twin.privacyIssues = [];
    db.user.score = Math.min(100, db.user.score + 5);
    saveLocalDB(db);
    return { success: true };
  }

  if (path === '/user/fix-permissions') {
    db.user.twin.permissions = db.user.twin.permissions.map(p => {
      if (p.app === 'Unknown Wallpaper App') {
        return { ...p, contacts: 'Denied', location: 'Denied', risk: 'Low' };
      }
      return p;
    });
    db.user.score = Math.min(100, db.user.score + 3);
    saveLocalDB(db);
    return { success: true, user: db.user };
  }

  if (path === '/simulations') {
    return { simulations: db.simulations, history: db.simulationHistory };
  }

  if (path === '/simulations/complete') {
    const { id, choice, reactionTime } = body;
    const sim = db.simulations.find(s => s.id === id);
    const selectedOption = sim.options.find(o => o.value === choice);
    
    let scoreAwarded = selectedOption.correct ? 95 : 40;
    if (selectedOption.bonus) scoreAwarded = 100;
    if (reactionTime > 20 && !selectedOption.correct) {
      scoreAwarded = Math.max(20, scoreAwarded - 15);
    }
    
    const scoreDiff = selectedOption.correct ? 4 : -5;
    const oldScore = db.user.score;
    db.user.score = Math.min(100, Math.max(10, db.user.score + scoreDiff));
    db.user.streak = selectedOption.correct ? db.user.streak + 1 : 0;

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

    db.simulationHistory.unshift({
      id: Date.now(),
      simulation: sim.category,
      score: scoreAwarded,
      strength: reportCard.strength,
      weakness: reportCard.weakness,
      date: new Date().toISOString().split('T')[0]
    });

    saveLocalDB(db);
    return {
      success: true,
      reportCard,
      user: db.user,
      history: db.simulationHistory
    };
  }

  if (path === '/scans/analyze') {
    const { type, input } = body;
    let domainAge = 'N/A';
    let trustScore = 85;
    let verdict = 'SECURE';
    let suspiciousKeywords = [];
    const lowerInput = input.toLowerCase();

    if (type === 'url') {
      domainAge = '1.2 years';
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
      if (lowerInput.includes('alert') || lowerInput.includes('hacked') || lowerInput.includes('invoice') || lowerInput.includes('receipt')) {
        trustScore = 30;
        verdict = 'HIGH RISK';
        suspiciousKeywords = ['visual-spoofing', 'scam-template-detected'];
      }
    }

    return { type, input, domainAge, trustScore, verdict, suspiciousKeywords };
  }

  if (path === '/recovery/start') {
    const { incident } = body;
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

    db.user.recovery = { incident, risk, progress: 0, steps };
    saveLocalDB(db);
    return { recovery: db.user.recovery };
  }

  if (path === '/recovery/step') {
    const { stepId, done } = body;
    db.user.recovery.steps = db.user.recovery.steps.map(step => {
      if (step.id === stepId) return { ...step, done };
      return step;
    });

    const completed = db.user.recovery.steps.filter(s => s.done).length;
    db.user.recovery.progress = Math.round((completed / db.user.recovery.steps.length) * 100);

    if (db.user.recovery.progress === 100) {
      db.user.score = Math.min(100, db.user.score + 8);
    }

    saveLocalDB(db);
    return { recovery: db.user.recovery, user: db.user };
  }

  if (path === '/threats') {
    if (options.method === 'POST') {
      const { name, category, details } = body;
      const newThreat = {
        id: Date.now(),
        name,
        affected: Math.floor(Math.random() * 500) + 10,
        details,
        status: 'Protection Added',
        category: category || 'General Scam'
      };
      db.threats.unshift(newThreat);
      saveLocalDB(db);
    }
    return { threats: db.threats };
  }

  if (path === '/footprint/scan') {
    const { targetType, targetQuery } = body || {};
    const mockReport = {
      scanId: `scan-offline-${Date.now()}`,
      targetType: targetType || 'username',
      targetQuery: targetQuery || 'offline_target',
      timestamp: new Date().toISOString(),
      durationMs: 850,
      summary: {
        totalFindings: 2,
        accountsDiscovered: 2,
        confirmedAccounts: 1,
        potentialMatches: 1,
        domainsDiscovered: 1,
        repositoriesDiscovered: 3,
        breachCount: 0,
        breachStatus: 'Offline Cache Active'
      },
      risk: {
        score: 35,
        riskLevel: 'Moderate Exposure',
        badgeColor: '#eab308',
        scoreFactors: [
          { factor: 'Multiple Public Platform Identifiers', points: 15, risk: 'Medium', confidence: 'High', reason: 'Cross-platform correlation increases reconnaissance surface.' },
          { factor: 'Public Repository Without License/Strict Branch Protection', points: 10, risk: 'Low', confidence: 'Medium', reason: 'Public codebase hygiene.' }
        ],
        highCount: 0,
        mediumCount: 1,
        lowCount: 1,
        categories: { identitySurface: 15, contactPrivacy: 0, infrastructureDns: 10, credentialsBreach: 0 }
      },
      findings: [
        {
          id: 'f-1',
          source: 'Developer Networks',
          finding: 'Identified Active Developer Footprint',
          evidence: `Account matching query '${targetQuery}' detected on developer index.`,
          confidence: 'High',
          risk: 'Medium',
          status: 'open',
          whyItMatters: 'Public profiles can reveal technology stack, habits, and affiliations.',
          recommendedAction: 'Review profile privacy parameters and audit public repositories.',
          remediationType: 'privacy_settings'
        }
      ],
      accounts: [
        { platform: 'GitHub', handle: targetQuery, url: `https://github.com/${targetQuery}`, confidence: 'High', isConfirmed: true }
      ],
      domains: targetType === 'domain' ? [targetQuery] : [],
      repositories: [],
      topologyGraph: {
        nodes: [
          { id: 'root', label: targetQuery, type: targetType, confidence: 'High', isRoot: true },
          { id: 'acc-1', label: `GitHub: @${targetQuery}`, type: 'account', confidence: 'High', isConfirmed: true }
        ],
        edges: [
          { id: 'e-1', source: 'root', target: 'acc-1', label: 'Confirmed Handle', confidence: 'High', style: 'solid' }
        ]
      }
    };

    if (!db.footprintScans) db.footprintScans = [];
    if (!db.footprintTimeline) db.footprintTimeline = [];
    db.footprintScans.unshift(mockReport);
    db.footprintTimeline.unshift({
      id: `tl-${Date.now()}`,
      type: 'initial_scan',
      title: `Scan Completed: ${targetQuery}`,
      description: `Evaluated exposure level ${mockReport.risk.score}/100 in safe offline mode.`,
      timestamp: new Date().toISOString()
    });
    saveLocalDB(db);
    return { scan: mockReport, historyDelta: null };
  }

  if (path === '/footprint/history') {
    return {
      scans: db.footprintScans || [],
      timeline: db.footprintTimeline || []
    };
  }

  if (path === '/footprint/remediate') {
    const { scanId, findingId, status } = body || {};
    if (db.footprintScans) {
      const scan = db.footprintScans.find(s => s.scanId === scanId);
      if (scan) {
        const finding = scan.findings.find(f => f.id === findingId);
        if (finding) finding.status = status;
      }
    }
    saveLocalDB(db);
    return { scans: db.footprintScans || [], timeline: db.footprintTimeline || [] };
  }

  return {};
}

// API methods
export const api = {
  login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  getProfile: () => request('/user/profile'),
  completeOnboarding: (answers) => request('/onboarding', { method: 'POST', body: JSON.stringify({ answers }) }),
  scanPrivacy: () => request('/user/scan-privacy', { method: 'POST' }),
  fixPermissions: () => request('/user/fix-permissions', { method: 'POST' }),
  getSimulations: () => request('/simulations'),
  completeSimulation: (id, choice, reactionTime) => request('/simulations/complete', { method: 'POST', body: JSON.stringify({ id, choice, reactionTime }) }),
  scanScam: (type, input) => request('/scans/analyze', { method: 'POST', body: JSON.stringify({ type, input }) }),
  startRecovery: (incident) => request('/recovery/start', { method: 'POST', body: JSON.stringify({ incident }) }),
  stepRecovery: (stepId, done) => request('/recovery/step', { method: 'POST', body: JSON.stringify({ stepId, done }) }),
  getThreats: () => request('/threats'),
  reportThreat: (name, category, details) => request('/threats', { method: 'POST', body: JSON.stringify({ name, category, details }) }),
  
  // Digital Footprint Scanner APIs
  scanFootprint: (targetType, targetQuery) => request('/footprint/scan', { method: 'POST', body: JSON.stringify({ targetType, targetQuery }) }),
  getFootprintHistory: () => request('/footprint/history'),
  remediateFinding: (scanId, findingId, status) => request('/footprint/remediate', { method: 'POST', body: JSON.stringify({ scanId, findingId, status }) }),
  verifyAutomatedFinding: (scanId, findingId, domain) => request('/footprint/verify-automated', { method: 'POST', body: JSON.stringify({ scanId, findingId, domain }) })
};

