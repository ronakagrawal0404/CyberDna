import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Views
import Landing from './views/Landing';
import Auth from './views/Auth';
import Dashboard from './views/Dashboard';
import Twin from './views/Twin';
import Arena from './views/Arena';
import Shield from './views/Shield';
import Recovery from './views/Recovery';
import Family from './views/Family';
import ThreatNet from './views/ThreatNet';
import Footprint from './views/Footprint';

import { api } from './apiService';

function App() {
  const [view, setView] = useState('landing'); // 'landing', 'auth', 'dashboard', 'twin', etc.
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync profile details on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await api.getProfile();
        if (res?.user && res.user.isAuthenticated) {
          setUser(res.user);
          setView('dashboard');
        }
      } catch (err) {
        console.warn('Authentication baseline check failed. Safe offline state active.');
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await api.logout();
      setUser(null);
      setView('landing');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="auth-wrapper">
        <div className="card text-center" style={{ padding: '3rem' }}>
          <div className="spinner" style={{ margin: '0 auto 1.5rem' }}></div>
          <h3>Connecting to CyberDNA Nodes</h3>
          <p className="text-secondary" style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
            Synchronizing risk definitions and user profiles...
          </p>
        </div>
      </div>
    );
  }

  const isAuthenticated = user?.isAuthenticated && user?.hasCompletedOnboarding;

  return (
    <div className={isAuthenticated ? "app-container" : ""}>
      {/* Sidebar for App Dashboard */}
      {isAuthenticated && (
        <Sidebar 
          currentView={view} 
          setView={setView} 
          user={user} 
          onLogout={handleLogout} 
        />
      )}

      {/* Main Workspace Frame */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Navbar for Public pages */}
        {!isAuthenticated && (
          <Navbar 
            currentView={view} 
            setView={setView} 
            user={user} 
            onLogout={handleLogout} 
          />
        )}

        <main className={isAuthenticated ? "main-content" : (view === 'footprint' ? "landing-page" : "")} style={!isAuthenticated && view === 'footprint' ? { padding: '2rem 3rem', maxWidth: '1400px', margin: '0 auto', width: '100%' } : {}}>
          {view === 'landing' && <Landing setView={setView} />}
          
          {view === 'auth' && (
            <Auth 
              onLoginSuccess={(userData) => {
                setUser(userData);
                setView('dashboard');
              }} 
            />
          )}

          {view === 'footprint' && <Footprint />}

          {isAuthenticated && (
            <>
              {view === 'dashboard' && <Dashboard user={user} setView={setView} />}
              {view === 'twin' && <Twin user={user} onUserUpdate={setUser} />}
              {view === 'arena' && <Arena user={user} onUserUpdate={setUser} />}
              {view === 'shield' && <Shield />}
              {view === 'recovery' && <Recovery user={user} onUserUpdate={setUser} />}
              {view === 'family' && <Family user={user} onUserUpdate={setUser} />}
              {view === 'threatnet' && <ThreatNet />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
