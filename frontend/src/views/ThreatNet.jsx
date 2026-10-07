import React, { useState, useEffect } from 'react';
import { Globe, AlertTriangle, Users, CheckCircle, Plus, Send } from 'lucide-react';
import { api } from '../apiService';

export default function ThreatNet() {
  const [threats, setThreats] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Phishing');
  const [details, setDetails] = useState('');

  useEffect(() => {
    fetchThreats();
  }, []);

  const fetchThreats = async () => {
    try {
      const res = await api.getThreats();
      if (res?.threats) {
        setThreats(res.threats);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !details) return alert('Name and details are required');

    try {
      const res = await api.reportThreat(name, category, details);
      if (res?.threats) {
        setThreats(res.threats);
        setName('');
        setDetails('');
        setShowForm(false);
        alert('Threat report registered successfully! Our analysis nodes are profiling threat signatures.');
      }
    } catch (err) {
      alert('Failed to report threat');
    }
  };

  return (
    <div>
      <div className="flex-between mb-2">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.50rem' }}>
            <Globe size={28} className="text-success" /> Threat Intelligence Network
          </h1>
          <p className="text-secondary" style={{ fontSize: '0.95rem' }}>
            Live decentralized ledger syncing zero-day phishing signatures and social hacks.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={16} /> Report Threat
        </button>
      </div>

      <div className="dashboard-grid">
        {/* Left Card: Live threats list */}
        <div className="dashboard-full">
          {showForm && (
            <div className="card mb-2" style={{ maxWidth: '600px', margin: '0 auto 2rem' }}>
              <h3 className="mb-1">Report Scam Signature</h3>
              <p className="text-secondary mb-2" style={{ fontSize: '0.8rem' }}>
                Flag scam templates, email senders, or links to compile filter lists for all CyberDNA nodes.
              </p>
              
              <form onSubmit={handleSubmit} className="auth-form">
                <div className="grid-3" style={{ gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Scam Label / Title</label>
                    <input 
                      type="text"
                      className="form-input"
                      placeholder="e.g. FedEx Unpaid Customs Shortcode"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Attack Channel</label>
                    <select 
                      className="form-input"
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                    >
                      <option value="Phishing">Phishing Email</option>
                      <option value="Smishing">Smishing SMS</option>
                      <option value="Vishing">Vishing Call</option>
                      <option value="Payment">Payment Gateway</option>
                      <option value="QR Scam">QR Redirect</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Message Details or URLs</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    placeholder="Paste email sender address, message texts, URLs, or transaction demands..."
                    value={details}
                    onChange={e => setDetails(e.target.value)}
                    required
                    style={{ resize: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button type="submit" className="btn btn-primary">
                    <Send size={14} /> Submit Report
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="card">
            <h3 className="card-title mb-2">Decentralized Threat Ledger</h3>
            <div className="threat-feed">
              {threats.map((threat) => (
                <div className="threat-item" key={threat.id}>
                  <div className="threat-main">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="badge badge-danger" style={{ fontSize: '0.65rem' }}>
                        {threat.category}
                      </span>
                      <h4 style={{ fontSize: '1.05rem', margin: 0 }}>{threat.name}</h4>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      {threat.details}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                      <Users size={12} />
                      <span>{threat.affected} nodes targeted globally</span>
                    </div>
                  </div>

                  <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.35rem' }} className="text-success">
                    <CheckCircle size={14} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {threat.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
