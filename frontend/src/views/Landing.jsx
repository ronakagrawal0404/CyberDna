import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, 
  BrainCircuit, 
  Sword, 
  ShieldAlert, 
  LifeBuoy, 
  Users, 
  Globe, 
  CheckCircle,
  FileText,
  Lock,
  Search,
  Users2,
  AlertOctagon,
  UserCheck,
  Fingerprint
} from 'lucide-react';

export default function Landing({ setView }) {
  const [twinStep, setTwinStep] = useState(0);

  // Auto-cycle the Cyber Twin steps on the Hero visual
  useEffect(() => {
    const interval = setInterval(() => {
      setTwinStep((prev) => (prev + 1) % 3);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const problems = [
    { title: 'Phishing Attacks', desc: 'Highly personalized spear-phishing messages targeting your login credentials.' },
    { title: 'Fake Internships', desc: 'Scam job offers collecting verification fees and identity documents.' },
    { title: 'Banking Scams', desc: 'Spoofed transactions panicking you into wiring funds to fake check accounts.' },
    { title: 'Privacy Leaks', desc: 'Unchecked online profiles leaking metadata and private emails to data brokers.' },
    { title: 'Social Engineering', desc: 'Pretext calls manipulating personal details to bypass multi-factor safety.' }
  ];

  const solutions = [
    { step: '01', title: 'Analyze', desc: 'Map public exposure and digital habits.' },
    { step: '02', title: 'Understand', desc: 'Generate your personal Cyber Twin behavior model.' },
    { step: '03', title: 'Train', desc: 'Deploy tailored attack simulations in Cyber Arena.' },
    { step: '04', title: 'Protect', desc: 'Shield real-time threats and secure family profiles.' },
    { step: '05', title: 'Improve', desc: 'Track your immunity index and evolve defense skills.' }
  ];

  const features = [
    {
      icon: Fingerprint,
      title: 'Digital Footprint Scanner',
      desc: 'Audit your public surface across legitimate OSINT indices, DNS, repositories, and accounts with an explainable 0–100 risk engine.'
    },
    {
      icon: BrainCircuit,
      title: 'AI Cyber Twin',
      desc: 'Generates your custom behavioral cyber identity to benchmark attack risk.'
    },
    {
      icon: Sword,
      title: 'Cyber Arena',
      desc: 'Interactive training rooms loaded with realistic QR, job, and payment scams.'
    },
    {
      icon: ShieldAlert,
      title: 'Scam Shield',
      desc: 'Real-time analyzer to process suspicious links, texts, and screenshot attachments.'
    },
    {
      icon: LifeBuoy,
      title: 'Attack Recovery Mode',
      desc: 'Guided step-by-step checklists to secure accounts immediately post-compromise.'
    },
    {
      icon: Users,
      title: 'Family Protection',
      desc: 'Monitors risk exposure of children and parents without breaching personal chat privacy.'
    },
    {
      icon: Globe,
      title: 'Threat Intel Network',
      desc: 'Community-sourced threat feeds that immediately deploy protection rules to all nodes.'
    }
  ];

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Hero Section */}
      <section className="hero">
        <span className="hero-tagline">Cybersecurity Evolution Platform</span>
        <h1>Your Digital Identity.<br />Your Cyber Defense.<br /><span style={{ color: 'var(--accent-emerald)' }}>Your Evolution.</span></h1>
        <p>CyberDNA learns your cyber behavior, predicts vulnerabilities, trains your awareness, and protects you from evolving digital threats.</p>
        
        <div className="hero-actions">
          <button className="btn btn-primary" onClick={() => setView('auth')}>
            Start Your Cyber Evolution <ChevronRight size={16} />
          </button>
          <button className="btn btn-secondary" onClick={() => setView('footprint')} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Fingerprint size={16} color="var(--accent-emerald)" />
            Scan Footprint Now
          </button>
        </div>

        {/* Dynamic Cyber Twin Visual */}
        <div className="hero-visual">
          <div className="visual-header">
            <div className="flex-gap-1">
              <BrainCircuit size={18} className="text-success" />
              <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>AI Cyber Twin Profiler</span>
            </div>
            <span className="badge badge-success">Active Engine</span>
          </div>

          <div className={`visual-step ${twinStep === 0 ? 'active' : ''}`}>
            <div className="feature-icon-wrapper" style={{ margin: 0, width: 36, height: 36 }}>
              <Search size={16} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>1. Learning Behavior</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Auditing link reaction and email validation habits...</div>
            </div>
          </div>

          <div style={{ paddingLeft: '2rem', margin: '-0.25rem 0 0.5rem', color: 'var(--border-color)', fontSize: '0.8rem' }}>↓</div>

          <div className={`visual-step ${twinStep === 1 ? 'active' : ''}`}>
            <div className="feature-icon-wrapper" style={{ margin: 0, width: 36, height: 36, color: 'var(--accent-amber)', backgroundColor: 'rgba(244,163,64,0.08)' }}>
              <AlertOctagon size={16} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>2. Analyzing Risk Factors</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Mapping cognitive biases and urgent message triggers...</div>
            </div>
          </div>

          <div style={{ paddingLeft: '2rem', margin: '-0.25rem 0 0.5rem', color: 'var(--border-color)', fontSize: '0.8rem' }}>↓</div>

          <div className={`visual-step ${twinStep === 2 ? 'active' : ''}`}>
            <div className="feature-icon-wrapper" style={{ margin: 0, width: 36, height: 36, color: 'var(--accent-emerald)' }}>
              <UserCheck size={16} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>3. Building Cyber Immunity</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Strengthening defensive rules and alert mechanisms...</div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section id="how-it-works" style={{ padding: '6rem 10%', backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)' }}>
        <div className="section-header">
          <span className="section-subtitle">Real-World Vulnerability</span>
          <h2>The Human Firewall is Failing</h2>
          <p>Traditional training uses boring slides. Attackers use targeted social engineering. We help you train where it matters.</p>
        </div>

        <div className="problem-grid">
          {problems.map((prob, idx) => (
            <div className="card problem-card" key={idx}>
              <h3>{prob.title}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{prob.desc}</p>
            </div>
          ))}
        </div>

        <p className="problem-statement">
          "Humans are often the weakest security layer. CyberDNA transforms users into an active security defense."
        </p>
      </section>

      {/* Solution Section */}
      <section style={{ padding: '6rem 10%', borderTop: '1px solid var(--border-color)' }}>
        <div className="section-header">
          <span className="section-subtitle">The Evolution Framework</span>
          <h2>How CyberDNA Secures You</h2>
          <p>A continuous lifecycle that turns vulnerability into verified defense capabilities.</p>
        </div>

        <div className="timeline">
          {solutions.map((sol, idx) => (
            <div className="timeline-node" key={idx}>
              <div className="timeline-dot">{sol.step}</div>
              <span className="timeline-label">{sol.title}</span>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>{sol.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Section */}
      <section id="features" style={{ padding: '6rem 10%', backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="section-header">
          <span className="section-subtitle">Platform Modules</span>
          <h2>Enterprise-Grade Security Features</h2>
          <p>Everything you need to inspect threat exposure, train skills, and defend credentials.</p>
        </div>

        <div className="feature-grid">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div className="card feature-card" key={idx}>
                <div className="feature-icon-wrapper">
                  <Icon size={20} />
                </div>
                <h3>{feat.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '3rem 5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        <div>&copy; 2026 CyberDNA. All rights reserved.</div>
        <div className="flex-gap-1">
          <span style={{ cursor: 'pointer' }}>Privacy Policy</span>
          <span>&bull;</span>
          <span style={{ cursor: 'pointer' }}>Terms of Service</span>
        </div>
      </footer>
    </div>
  );
}
