import React from 'react';
import { 
  ShieldAlert, 
  BrainCircuit, 
  Sword, 
  LifeBuoy, 
  Users, 
  Globe, 
  Activity, 
  CheckCircle, 
  AlertTriangle,
  ArrowRight,
  Fingerprint
} from 'lucide-react';

export default function Dashboard({ user, setView }) {
  const score = user?.score || 82;
  const strokeDashoffset = 380 - (380 * score) / 100;

  const getRiskColor = (status) => {
    if (status === 'Low Risk') return 'var(--accent-emerald)';
    if (status === 'Medium Risk') return 'var(--accent-amber)';
    return 'var(--accent-danger)';
  };

  const getRiskBadgeClass = (status) => {
    if (status === 'Low Risk') return 'badge-success';
    if (status === 'Medium Risk') return 'badge-warning';
    return 'badge-danger';
  };

  const shortcuts = [
    { 
      id: 'footprint', 
      title: 'Footprint Scanner', 
      desc: 'OSINT & public exposure audit', 
      icon: Fingerprint,
      color: 'var(--accent-emerald)'
    },
    { 
      id: 'twin', 
      title: 'AI Cyber Twin', 
      desc: `Profile: ${user?.twin?.personality || 'Fast Decision Maker'}`, 
      icon: BrainCircuit,
      color: 'var(--accent-emerald)'
    },
    { 
      id: 'arena', 
      title: 'Cyber Arena', 
      desc: `Streak: ${user?.streak || 0} active days`, 
      icon: Sword,
      color: 'var(--accent-emerald)'
    },
    { 
      id: 'shield', 
      title: 'Scam Shield', 
      desc: 'Check links, screenshots, SMS', 
      icon: ShieldAlert,
      color: 'var(--accent-emerald)'
    },
    { 
      id: 'recovery', 
      title: 'Recovery Center', 
      desc: user?.recovery?.incident ? `Active: ${user.recovery.incident}` : 'No active incident', 
      icon: LifeBuoy,
      color: 'var(--accent-emerald)'
    },
    { 
      id: 'family', 
      title: 'Family Protection', 
      desc: `${user?.family?.length || 0} family members monitored`, 
      icon: Users,
      color: 'var(--accent-emerald)'
    },
    { 
      id: 'threatnet', 
      title: 'Threat Intelligence', 
      desc: 'Trending community threats', 
      icon: Globe,
      color: 'var(--accent-emerald)'
    }
  ];

  const activities = [
    { text: 'Passed phishing simulation: QR scam', type: 'success', date: 'Today' },
    { text: 'Privacy score improved +5 pts (Scanner completed)', type: 'success', date: 'Yesterday' },
    { text: 'Weakness detected: Unknown Wallpaper App allowed contacts access', type: 'danger', date: '2 days ago' }
  ];

  return (
    <div className="dashboard-content">
      {/* Upper Welcome Header */}
      <div className="flex-between mb-2">
        <div>
          <h1 style={{ fontSize: '2.2rem' }}>Hello {user?.name || 'User'} 👋</h1>
          <p className="text-secondary" style={{ fontSize: '0.95rem' }}>
            Welcome to your cybersecurity control command center.
          </p>
        </div>
        <div className="flex-gap-1">
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Security Profile Level:</span>
          <span className="badge badge-success">{user?.level || 'Cyber Defender'}</span>
        </div>
      </div>

      {/* Main Score and Risk Board */}
      <div className="dashboard-grid mb-2">
        <div className="card score-panel">
          <div>
            <h2 className="mb-1" style={{ fontSize: '1.4rem' }}>Security Immunity Index</h2>
            <p className="text-secondary" style={{ fontSize: '0.85rem', maxWidth: '350px', marginBottom: '1.5rem' }}>
              Your index represents cognitive defense skills in simulations combined with digital profile exposures.
            </p>
            <div className="flex-gap-1">
              <span className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)' }}>
                Risk Classification:
              </span>
              <span className={`badge ${getRiskBadgeClass(user?.riskStatus)}`}>
                {user?.riskStatus || 'Medium Risk'}
              </span>
            </div>
          </div>

          <div className="score-gauge-container">
            <svg className="score-svg" width="140" height="140">
              <circle className="score-circle-bg" cx="70" cy="70" r="60" />
              <circle 
                className="score-circle-fg" 
                cx="70" 
                cy="70" 
                r="60" 
                strokeDasharray="380"
                strokeDashoffset={strokeDashoffset}
                style={{ stroke: getRiskColor(user?.riskStatus) }}
              />
            </svg>
            <div className="score-text">
              <span className="score-value">{score}</span>
              <span className="score-max">/100</span>
            </div>
          </div>
        </div>

        {/* Recent Activity Logger */}
        <div className="card">
          <h3 className="card-title"><Activity size={18} /> Recent Activity</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            {activities.map((act, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '0.50rem', alignItems: 'flex-start' }}>
                  {act.type === 'success' ? (
                    <CheckCircle size={16} className="text-success" style={{ marginTop: '0.1rem' }} />
                  ) : (
                    <AlertTriangle size={16} className="text-danger" style={{ marginTop: '0.1rem' }} />
                  )}
                  <span style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>{act.text}</span>
                </div>
                <span className="text-secondary" style={{ fontSize: '0.75rem', whiteSpace: 'nowrap', paddingLeft: '1rem' }}>
                  {act.date}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modules shortcuts grid */}
      <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>Defense Modules</h3>
      <div className="grid-3 mb-2">
        {shortcuts.map((shortcut) => {
          const Icon = shortcut.icon;
          return (
            <div 
              key={shortcut.id} 
              className="card" 
              onClick={() => setView(shortcut.id)}
              style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '140px' }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span className="card-title" style={{ margin: 0 }}>{shortcut.title}</span>
                  <div className="feature-icon-wrapper" style={{ margin: 0, width: 32, height: 32 }}>
                    <Icon size={16} />
                  </div>
                </div>
                <p className="text-secondary" style={{ fontSize: '0.8rem' }}>{shortcut.desc}</p>
              </div>
              <div className="flex-between mt-1" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-emerald)' }}>
                <span>Access Module</span>
                <ArrowRight size={14} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
