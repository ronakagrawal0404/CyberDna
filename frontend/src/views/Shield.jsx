import React, { useState } from 'react';
import { ShieldAlert, Link, MessageSquare, Image, Mail, HelpCircle, Shield, AlertOctagon, CheckCircle, QrCode } from 'lucide-react';
import { api } from '../apiService';

export default function ShieldView() {
  const [activeTab, setActiveTab] = useState('url'); // 'url', 'message', 'screenshot', 'email'
  const [inputVal, setInputVal] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);

  const tabItems = [
    { id: 'url', label: 'Paste URL', icon: Link, placeholder: 'e.g. http://secure-banking-verify-login.xyz' },
    { id: 'message', label: 'Check SMS Message', icon: MessageSquare, placeholder: 'e.g. URGENT: Your account will be locked, click here to unlock...' },
    { id: 'screenshot', label: 'Upload Screenshot', icon: Image, placeholder: 'e.g. alert_screen.png' },
    { id: 'email', label: 'Analyze Email Header', icon: Mail, placeholder: 'e.g. From: security-desk@paypal-verify-support.net...' }
  ];

  const currentPlaceholder = tabItems.find(t => t.id === activeTab)?.placeholder;

  const handleScan = async (e) => {
    e.preventDefault();
    if (!inputVal) return alert('Please input content to analyze');

    setScanning(true);
    setResult(null);

    try {
      const res = await api.scanScam(activeTab, inputVal);
      // Simulate scan process
      setTimeout(() => {
        setResult(res);
        setScanning(false);
      }, 1000);
    } catch (err) {
      alert('Analysis error');
      setScanning(false);
    }
  };

  const getVerdictBadge = (verdict) => {
    if (verdict === 'SECURE') return <span className="badge badge-success">SECURE STATUS</span>;
    if (verdict === 'WARNING') return <span className="badge badge-warning">SUSPICIOUS WARNING</span>;
    return <span className="badge badge-danger">HIGH RISK VERDICT</span>;
  };

  const getVerdictIcon = (verdict) => {
    if (verdict === 'SECURE') return <CheckCircle size={28} className="text-success" />;
    if (verdict === 'WARNING') return <AlertOctagon size={28} className="text-warning" />;
    return <ShieldAlert size={28} className="text-danger" />;
  };

  const getVerdictColor = (verdict) => {
    if (verdict === 'SECURE') return 'var(--accent-emerald)';
    if (verdict === 'WARNING') return 'var(--accent-amber)';
    return 'var(--accent-danger)';
  };

  return (
    <div>
      <div className="flex-between mb-2">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.50rem' }}>
            <Shield size={28} className="text-success" /> Scam Shield Analyzer
          </h1>
          <p className="text-secondary" style={{ fontSize: '0.95rem' }}>
            Inspect potential phishing links, SMS alerts, and screenshot exposures in real-time.
          </p>
        </div>
        <span className="badge badge-success">AI Scanning Engine</span>
      </div>

      <div className="dashboard-grid">
        {/* Left: Interactive Input Panel */}
        <div className="card">
          <h3 className="card-title mb-1">Threat Analyzer Terminal</h3>
          <p className="text-secondary" style={{ fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Select your input channel, paste suspicious contents, and run our AI verification heuristics.
          </p>

          <div className="shield-tab-nav">
            {tabItems.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  className={`shield-tab ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setInputVal('');
                    setResult(null);
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                    <Icon size={14} />
                    <span>{tab.label.split(' ')[1] || tab.label}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <form onSubmit={handleScan}>
            <div className="form-group mb-1">
              <label className="form-label">Inspectable Content</label>
              {activeTab === 'screenshot' ? (
                /* Screenshot Dropzone Mock */
                <div 
                  style={{ border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-md)', padding: '2rem', textAlign: 'center', cursor: 'pointer', backgroundColor: 'var(--bg-secondary)', transition: 'var(--transition)' }}
                  onClick={() => setInputVal('security_alert_popup.png')}
                >
                  <Image size={32} className="text-secondary mb-1" style={{ margin: '0 auto' }} />
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                    {inputVal ? `Selected: ${inputVal}` : 'Click to drop mock scam screenshot'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    Supports PNG, JPG (Simulated audit)
                  </div>
                </div>
              ) : (
                <textarea
                  className="form-input"
                  rows={4}
                  placeholder={currentPlaceholder}
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  required
                  style={{ resize: 'none', width: '100%', fontSize: '0.9rem' }}
                />
              )}
            </div>

            <button 
              type="submit" 
              className="btn btn-primary w-full"
              disabled={scanning || !inputVal}
            >
              {scanning ? 'Running AI Diagnostics...' : 'Verify Content Safety'}
            </button>
          </form>
        </div>

        {/* Right: AI Analysis Response Panel */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '320px' }}>
          {scanning && (
            <div className="loader-container">
              <div className="spinner"></div>
              <h3 className="mb-1">Inspecting Signatures</h3>
              <p className="text-secondary" style={{ fontSize: '0.8rem' }}>
                Querying domain registries, analyzing linguistic urgency, and matching heuristics...
              </p>
            </div>
          )}

          {!scanning && !result && (
            <div className="text-center text-secondary" style={{ padding: '2rem' }}>
              <HelpCircle size={36} style={{ margin: '0 auto 1rem', strokeWidth: 1.5 }} />
              <h3>Awaiting Diagnostics</h3>
              <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
                Paste an active link or message in the terminal on the left to review telemetry reports.
              </p>
            </div>
          )}

          {!scanning && result && (
            <div>
              <div className="flex-between mb-1" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  {getVerdictIcon(result.verdict)}
                  <div>
                    <h3 style={{ fontSize: '1.15rem' }}>Scan Summary Report</h3>
                    <p className="text-secondary" style={{ fontSize: '0.75rem' }}>Heuristics Version: 4.8.2-AI</p>
                  </div>
                </div>
                {getVerdictBadge(result.verdict)}
              </div>

              <div style={{ margin: '1.5rem 0' }}>
                <div className="flex-between mb-1">
                  <span className="text-secondary" style={{ fontSize: '0.85rem' }}>Verified Content Trust Level</span>
                  <span className="text-mono" style={{ fontWeight: 'bold', color: getVerdictColor(result.verdict) }}>
                    {result.trustScore}/100
                  </span>
                </div>
                <div className="gauge-meter-wrapper">
                  <div 
                    className="gauge-meter-bar" 
                    style={{ width: `${result.trustScore}%`, backgroundColor: getVerdictColor(result.verdict) }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {result.type === 'url' && (
                  <div className="flex-between" style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem' }}>
                    <span className="text-secondary">Domain Registrant Age:</span>
                    <span className="text-mono" style={{ fontWeight: 600 }}>{result.domainAge}</span>
                  </div>
                )}

                <div style={{ padding: '1rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', fontWeight: 600 }}>
                    Detected Attack Indicators
                  </div>
                  {result.suspiciousKeywords?.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {result.suspiciousKeywords.map((kw, idx) => (
                        <span key={idx} className="badge badge-danger" style={{ fontSize: '0.7rem' }}>
                          {kw}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>
                      No malicious signature matches found in this payload.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
