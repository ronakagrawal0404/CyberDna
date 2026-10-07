import React from 'react';
import { Shield, ChevronRight } from 'lucide-react';

export default function Navbar({ currentView, setView, user, onLogout }) {
  const isLanding = ['landing', 'auth'].includes(currentView);

  return (
    <nav className="landing-navbar">
      <div className="brand" onClick={() => setView(user?.isAuthenticated ? 'dashboard' : 'landing')}>
        <Shield size={24} className="brand-dot" />
        <span>Cyber<span style={{ color: 'var(--accent-emerald)' }}>DNA</span></span>
      </div>

      {isLanding && (
        <ul className="nav-links">
          <li className="nav-link" onClick={() => setView('landing')}>Home</li>
          <li className="nav-link" style={{ color: currentView === 'footprint' ? 'var(--accent-emerald)' : 'inherit' }} onClick={() => setView('footprint')}>Footprint Scanner</li>
          <li className="nav-link" onClick={() => {
            setView('landing');
            setTimeout(() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }), 100);
          }}>How It Works</li>
          <li className="nav-link" onClick={() => {
            setView('landing');
            setTimeout(() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }), 100);
          }}>Features</li>
        </ul>
      )}

      <div className="nav-actions">
        {user?.isAuthenticated ? (
          <>
            <span className="text-secondary" style={{ fontSize: '0.9rem' }}>{user.email}</span>
            <button className="btn btn-secondary" onClick={() => setView('dashboard')}>Dashboard</button>
            <button className="btn btn-outline" onClick={onLogout}>Logout</button>
          </>
        ) : (
          <>
            <button className="btn btn-text" onClick={() => setView('auth')}>Login</button>
            <button className="btn btn-primary" onClick={() => setView('auth')}>
              Get Protected <ChevronRight size={16} />
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
