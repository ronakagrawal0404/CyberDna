import React, { useState } from 'react';
import { Users, Info, ShieldAlert, Heart, Plus, Send } from 'lucide-react';

export default function Family({ user, onUserUpdate }) {
  const family = user?.family || [];
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [showInviteForm, setShowInviteForm] = useState(false);

  const handleInvite = (e) => {
    e.preventDefault();
    if (!inviteName || !inviteEmail) return alert('Name and email required');

    // Create a new mock family member and update the user state
    const newMember = {
      name: inviteName,
      score: 80,
      risk: 'Low Risk',
      alerts: 0,
      weaknesses: ['New account, profiling in progress']
    };

    const updatedFamily = [...family, newMember];
    onUserUpdate({
      ...user,
      family: updatedFamily
    });

    setInviteName('');
    setInviteEmail('');
    setShowInviteForm(false);
    alert(`Invitation sent to ${inviteName}! They will be added to your dashboard once they authenticate.`);
  };

  const getRiskClass = (risk) => {
    if (risk === 'Low Risk') return 'badge-success';
    if (risk === 'Medium Risk') return 'badge-warning';
    return 'badge-danger';
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'var(--accent-emerald)';
    if (score >= 65) return 'var(--accent-amber)';
    return 'var(--accent-danger)';
  };

  return (
    <div>
      <div className="flex-between mb-2">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.50rem' }}>
            <Users size={28} className="text-success" /> Family Cyber Protection
          </h1>
          <p className="text-secondary" style={{ fontSize: '0.95rem' }}>
            Coordinate safety assessments and threat intelligence across trusted family accounts.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowInviteForm(!showInviteForm)}>
          <Plus size={16} /> Invite Member
        </button>
      </div>

      {/* Privacy disclaimer */}
      <div style={{ display: 'flex', gap: '0.75rem', backgroundColor: 'rgba(24, 165, 114, 0.05)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(24, 165, 114, 0.15)', fontSize: '0.85rem', lineHeight: '1.5', marginBottom: '2rem' }}>
        <Info size={18} className="text-success" style={{ marginTop: '0.1rem', flexShrink: 0 }} />
        <div>
          <strong className="text-success">Privacy Isolation Guarantee:</strong>
          <div style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            CyberDNA respects human privacy parameters. We **never** access private messages, browser chats, or personal history. The profiler only calculates metrics from security habits, simulation choices, public database exposures, and active app permissions.
          </div>
        </div>
      </div>

      {showInviteForm && (
        <div className="card mb-2" style={{ maxWidth: '500px' }}>
          <h3 className="mb-1">Invite Family Member</h3>
          <p className="text-secondary mb-2" style={{ fontSize: '0.8rem' }}>
            They will receive a secure portal link to construct their Cyber Twin profile.
          </p>
          <form onSubmit={handleInvite} className="auth-form">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. Grandma Helen"
                value={inviteName}
                onChange={e => setInviteName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input 
                type="email" 
                className="form-input" 
                placeholder="helen@family.com"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                required
              />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button type="submit" className="btn btn-primary">
                <Send size={14} /> Send Invite
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowInviteForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Members profiles listing */}
      <div className="family-list">
        {family.map((member, idx) => (
          <div className="family-member-card" key={idx}>
            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifycontent: 'center', justifyContent: 'center' }}>
                <Heart size={20} style={{ color: getScoreColor(member.score) }} />
              </div>

              <div className="family-meta">
                <div style={{ fontWeight: 700, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>{member.name}</span>
                  <span className={`badge ${getRiskClass(member.risk)}`}>
                    {member.risk}
                  </span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.25rem' }}>
                  {member.weaknesses.map((w, i) => (
                    <span key={i} className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.03)', color: 'var(--text-secondary)', fontSize: '0.7rem' }}>
                      {w}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Security Index</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: getScoreColor(member.score), fontFamily: 'var(--font-heading)', lineHeight: 1 }}>
                {member.score}<span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>/100</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
