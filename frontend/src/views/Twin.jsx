import React, { useState } from 'react';
import { BrainCircuit, ShieldAlert, Sparkles, CheckCircle, Shield, AlertTriangle } from 'lucide-react';
import { api } from '../apiService';

export default function Twin({ user, onUserUpdate }) {
  const [scanning, setScanning] = useState(false);
  const twin = user?.twin || {};

  const handleScanPrivacy = async () => {
    setScanning(true);
    // Trigger the scan API (which handles mock timing)
    try {
      await api.scanPrivacy();
      setTimeout(async () => {
        const profileRes = await api.getProfile();
        if (profileRes?.user) {
          onUserUpdate(profileRes.user);
        }
        setScanning(false);
      }, 1500);
    } catch (err) {
      setScanning(false);
    }
  };

  const handleFixPermissions = async () => {
    try {
      const res = await api.fixPermissions();
      if (res?.user) {
        onUserUpdate(res.user);
      }
    } catch (err) {
      alert('Failed to revoke permission');
    }
  };

  const getRiskBadge = (val) => {
    if (val < 40) return <span className="badge badge-success">Low Risk</span>;
    if (val < 75) return <span className="badge badge-warning">Med Risk</span>;
    return <span className="badge badge-danger">High Risk</span>;
  };

  const getBarColor = (val) => {
    if (val < 40) return 'var(--accent-emerald)';
    if (val < 75) return 'var(--accent-amber)';
    return 'var(--accent-danger)';
  };

  return (
    <div>
      <div className="flex-between mb-2">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.50rem' }}>
            <BrainCircuit size={28} className="text-success" /> AI Cyber Twin Profiler
          </h1>
          <p className="text-secondary" style={{ fontSize: '0.95rem' }}>
            Your digital reflection analyzing behavior patterns and exposure.
          </p>
        </div>
        <span className="badge badge-success">Active Profiler Mode</span>
      </div>

      <div className="dashboard-grid">
        {/* Behavior & Risk Score Summary */}
        <div style={{ display: 'flex', flexDrawing: 'column', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Cyber Personality Card */}
          <div className="card">
            <h3 className="card-title text-success"><Sparkles size={18} /> Personality Portrait</h3>
            <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', margin: '1rem 0' }}>
              <div style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                {twin.personality}
              </div>
              <p className="text-secondary" style={{ fontSize: '0.85rem', lineHeight: '1.5' }}>
                {twin.summary}
              </p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Cognitive Risk Factor Analysis</h4>
              
              <div>
                <div className="flex-between mb-1" style={{ fontSize: '0.8rem' }}>
                  <span className="text-secondary">Phishing Susceptibility</span>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span className="text-mono" style={{ fontWeight: 600 }}>{twin.phishingRisk}%</span>
                    {getRiskBadge(twin.phishingRisk)}
                  </div>
                </div>
                <div className="gauge-meter-wrapper">
                  <div 
                    className="gauge-meter-bar" 
                    style={{ width: `${twin.phishingRisk}%`, backgroundColor: getBarColor(twin.phishingRisk) }}
                  />
                </div>
              </div>

              <div>
                <div className="flex-between mb-1" style={{ fontSize: '0.8rem' }}>
                  <span className="text-secondary">Social Engineering Trust Score</span>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span className="text-mono" style={{ fontWeight: 600 }}>{twin.socialRisk}%</span>
                    {getRiskBadge(twin.socialRisk)}
                  </div>
                </div>
                <div className="gauge-meter-wrapper">
                  <div 
                    className="gauge-meter-bar" 
                    style={{ width: `${twin.socialRisk}%`, backgroundColor: getBarColor(twin.socialRisk) }}
                  />
                </div>
              </div>

              <div>
                <div className="flex-between mb-1" style={{ fontSize: '0.8rem' }}>
                  <span className="text-secondary">Privacy Footprint Leaks</span>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span className="text-mono" style={{ fontWeight: 600 }}>{twin.privacyRisk}%</span>
                    {getRiskBadge(twin.privacyRisk)}
                  </div>
                </div>
                <div className="gauge-meter-wrapper">
                  <div 
                    className="gauge-meter-bar" 
                    style={{ width: `${twin.privacyRisk}%`, backgroundColor: getBarColor(twin.privacyRisk) }}
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Behavior Analyzer Summary */}
          <div className="card">
            <h3 className="card-title"><Shield size={18} /> Behavior Analyzer</h3>
            <p className="text-secondary" style={{ fontSize: '0.85rem', margin: '0.5rem 0 1rem' }}>
              Dynamic observations mapped from your simulation actions:
            </p>
            <div style={{ fontSize: '0.85rem', padding: '1rem', borderLeft: '3px solid var(--accent-emerald)', backgroundColor: 'var(--bg-secondary)', borderRadius: '0 var(--radius-md) var(--radius-md) 0' }}>
              "You tend to react under emotional timers. In the last test, you selected verification without reviewing domain extensions. CyberDNA has generated custom micro-learning modules on link components."
            </div>
          </div>
        </div>

        {/* Privacy Scanner and Permission Intelligence */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Privacy Scanner Card */}
          <div className="card">
            <div className="flex-between mb-1">
              <h3 className="card-title"><ShieldAlert size={18} /> Privacy Scanner</h3>
              <span className="text-mono" style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--accent-emerald)' }}>
                Score: {twin.privacyScore}%
              </span>
            </div>
            
            {scanning ? (
              <div className="loader-container" style={{ padding: '1.5rem 0' }}>
                <div className="spinner" style={{ width: '30px', height: '30px', marginBottom: '1rem' }}></div>
                <p style={{ fontSize: '0.8rem' }} className="text-secondary">Scanning databases and data-broker networks...</p>
              </div>
            ) : (
              <div>
                {twin.privacyIssues?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', margin: '1rem 0' }}>
                    {twin.privacyIssues.map((issue) => (
                      <div key={issue.id} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', backgroundColor: 'rgba(224, 82, 82, 0.05)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(224, 82, 82, 0.15)', fontSize: '0.8rem' }}>
                        <AlertTriangle size={14} className="text-danger" />
                        <span>{issue.text}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', backgroundColor: 'rgba(24, 165, 114, 0.05)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(24, 165, 114, 0.15)', fontSize: '0.8rem', margin: '1rem 0' }}>
                    <CheckCircle size={14} className="text-success" />
                    <span>No critical data exposures detected in broker lists.</span>
                  </div>
                )}
                
                <button 
                  className="btn btn-primary w-full" 
                  onClick={handleScanPrivacy}
                  disabled={scanning}
                >
                  Scan Exposure Database
                </button>
              </div>
            )}
          </div>

          {/* Permission Intelligence Card */}
          <div className="card">
            <h3 className="card-title"><BrainCircuit size={18} /> Permission Intelligence</h3>
            <p className="text-secondary" style={{ fontSize: '0.8rem', marginBottom: '1rem' }}>
              Active background app permission vulnerability audit:
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
              {twin.permissions?.map((p) => (
                <div key={p.id} className="flex-between" style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{p.app}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                      Access: {p.contacts ? `Contacts (${p.contacts})` : ''} {p.camera ? `Camera (${p.camera})` : ''} {p.location ? `Location (${p.location})` : ''}
                    </div>
                  </div>
                  {p.risk === 'High' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.50rem' }}>
                      <span className="badge badge-danger">High Risk</span>
                    </div>
                  ) : (
                    <span className="badge badge-success">Low Risk</span>
                  )}
                </div>
              ))}
            </div>

            {twin.permissions?.some(p => p.app === 'Unknown Wallpaper App' && p.risk === 'High') && (
              <button className="btn btn-danger w-full" onClick={handleFixPermissions}>
                Revoke Risky Permissions
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
