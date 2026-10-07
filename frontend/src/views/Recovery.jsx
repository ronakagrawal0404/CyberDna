import React, { useState } from 'react';
import { LifeBuoy, AlertTriangle, ShieldCheck, Check, Info } from 'lucide-react';
import { api } from '../apiService';

export default function Recovery({ user, onUserUpdate }) {
  const activeRecovery = user?.recovery || {};
  const [loading, setLoading] = useState(false);

  const incidents = [
    { text: 'Clicked suspicious link', icon: AlertTriangle },
    { text: 'Paid scammer', icon: AlertTriangle },
    { text: 'Account hacked', icon: AlertTriangle },
    { text: 'Lost device', icon: AlertTriangle },
    { text: 'Shared information', icon: AlertTriangle }
  ];

  const handleIncidentSelect = async (incidentText) => {
    setLoading(true);
    try {
      const res = await api.startRecovery(incidentText);
      if (res?.recovery) {
        // Fetch fresh profile state to trigger update
        const profileRes = await api.getProfile();
        if (profileRes?.user) {
          onUserUpdate(profileRes.user);
        }
      }
      setLoading(false);
    } catch (err) {
      alert('Failed to launch recovery playbook');
      setLoading(false);
    }
  };

  const handleCheckboxToggle = async (stepId, currentDone) => {
    try {
      const res = await api.stepRecovery(stepId, !currentDone);
      if (res?.recovery) {
        onUserUpdate(res.user);
      }
    } catch (err) {
      alert('Failed to update step progress');
    }
  };

  return (
    <div>
      <div className="flex-between mb-2">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.50rem' }}>
            <LifeBuoy size={28} className="text-success" /> Attack Recovery Center
          </h1>
          <p className="text-secondary" style={{ fontSize: '0.95rem' }}>
            Emergency response checklists to isolate and secure compromised profiles.
          </p>
        </div>
        <span className="badge badge-danger">Emergency Playbooks</span>
      </div>

      <div className="dashboard-grid">
        {/* Left Card: Incident Declarator */}
        <div className="card">
          <h3 className="card-title text-danger" style={{ marginBottom: '0.5rem' }}>
            Declare Incident Status
          </h3>
          <p className="text-secondary" style={{ fontSize: '0.8rem', marginBottom: '1.5rem' }}>
            What security compromise happened? Selecting an incident spins up our containment protocols.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {incidents.map((inc, idx) => {
              const Icon = inc.icon;
              return (
                <button
                  key={idx}
                  className={`btn btn-secondary w-full`}
                  style={{ 
                    textAlign: 'left', 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    padding: '1rem 1.25rem', 
                    fontWeight: 600,
                    borderColor: activeRecovery.incident === inc.text ? 'var(--accent-danger)' : 'var(--border-color)',
                    backgroundColor: activeRecovery.incident === inc.text ? 'rgba(224, 82, 82, 0.05)' : 'var(--bg-card)'
                  }}
                  onClick={() => handleIncidentSelect(inc.text)}
                  disabled={loading}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Icon size={16} className={activeRecovery.incident === inc.text ? 'text-danger' : 'text-secondary'} />
                    <span>{inc.text}</span>
                  </span>
                  {activeRecovery.incident === inc.text && (
                    <span className="badge badge-danger" style={{ fontSize: '0.7rem' }}>Active Case</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Card: Recovery Checklist Actions */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {loading && (
            <div className="loader-container">
              <div className="spinner"></div>
              <p className="text-secondary">Generating response playbook checklist...</p>
            </div>
          )}

          {!loading && !activeRecovery.incident && (
            <div className="text-center text-secondary" style={{ padding: '2rem' }}>
              <ShieldCheck size={36} className="text-success" style={{ margin: '0 auto 1rem', strokeWidth: 1.5 }} />
              <h3>Safe & Isolated</h3>
              <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
                No active compromise cases currently declared. If you suspect an attack, declare it on the left.
              </p>
            </div>
          )}

          {!loading && activeRecovery.incident && (
            <div>
              <div className="flex-between mb-1" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-danger)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                    Active Checklist // {activeRecovery.incident}
                  </div>
                  <h3 style={{ fontSize: '1.25rem', marginTop: '0.2rem' }}>Playbook Container</h3>
                </div>
                <span className="badge badge-danger" style={{ fontSize: '0.7rem' }}>
                  Risk: {activeRecovery.risk}
                </span>
              </div>

              <div style={{ margin: '1.5rem 0' }}>
                <div className="flex-between mb-1" style={{ fontSize: '0.8rem' }}>
                  <span className="text-secondary">Mitigation Tasks Completed</span>
                  <span style={{ fontWeight: 600, color: 'var(--accent-emerald)' }}>
                    {activeRecovery.progress}%
                  </span>
                </div>
                <div className="gauge-meter-wrapper">
                  <div 
                    className="gauge-meter-bar" 
                    style={{ width: `${activeRecovery.progress}%`, backgroundColor: 'var(--accent-emerald)' }}
                  />
                </div>
              </div>

              <div className="recovery-list">
                {activeRecovery.steps?.map((step) => (
                  <div 
                    key={step.id} 
                    className="recovery-item"
                    onClick={() => handleCheckboxToggle(step.id, step.done)}
                  >
                    <div className={`recovery-checkbox ${step.done ? 'checked' : ''}`}>
                      {step.done && <Check size={14} style={{ color: '#fff' }} />}
                    </div>
                    <span className={`recovery-item-text ${step.done ? 'checked' : ''}`} style={{ fontSize: '0.85rem' }}>
                      {step.text}
                    </span>
                  </div>
                ))}
              </div>

              {activeRecovery.progress === 100 && (
                <div style={{ display: 'flex', gap: '0.75rem', backgroundColor: 'rgba(24,165,114,0.06)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(24,165,114,0.15)', fontSize: '0.8rem' }} className="mt-2">
                  <Info size={16} className="text-success" style={{ marginTop: '0.1rem', flexShrink: 0 }} />
                  <div>
                    <strong className="text-success">Playbook Mitigation Successful!</strong>
                    <div style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      You have secured your primary vectors and restored system baseline. Earning +8 Security immunity points.
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
