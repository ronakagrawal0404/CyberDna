import React from 'react';
import { 
  LayoutDashboard, 
  BrainCircuit, 
  Sword, 
  ShieldAlert, 
  LifeBuoy, 
  Users, 
  Globe, 
  LogOut,
  Shield,
  Fingerprint
} from 'lucide-react';

export default function Sidebar({ currentView, setView, user, onLogout }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'footprint', label: 'Footprint Scanner', icon: Fingerprint },
    { id: 'twin', label: 'AI Cyber Twin', icon: BrainCircuit },
    { id: 'arena', label: 'Cyber Arena', icon: Sword },
    { id: 'shield', label: 'Scam Shield', icon: ShieldAlert },
    { id: 'recovery', label: 'Recovery Center', icon: LifeBuoy },
    { id: 'family', label: 'Family Protection', icon: Users },
    { id: 'threatnet', label: 'Threat Intelligence', icon: Globe },
  ];

  return (
    <aside className="sidebar">
      <div>
        <div className="brand" onClick={() => setView('dashboard')} style={{ paddingLeft: '0.5rem' }}>
          <Shield size={24} className="brand-dot" />
          <span>Cyber<span style={{ color: 'var(--accent-emerald)' }}>DNA</span></span>
        </div>

        <ul className="sidebar-menu">
          {menuItems.map(item => {
            const Icon = item.icon;
            return (
              <li 
                key={item.id}
                className={`sidebar-item ${currentView === item.id ? 'active' : ''}`}
                onClick={() => setView(item.id)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="user-avatar">
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {user?.name || 'Defender'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {user?.level || 'Defender'}
            </div>
          </div>
        </div>
        
        <button 
          className="sidebar-item" 
          onClick={onLogout}
          style={{ width: '100%', border: 'none', background: 'none', marginTop: '0.5rem', paddingLeft: '1rem' }}
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
