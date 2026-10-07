import React, { useState, useEffect, useRef } from 'react';
import { Sword, Clock, AlertOctagon, ShieldAlert, CheckCircle, ChevronRight, Award } from 'lucide-react';
import { api } from '../apiService';

export default function Arena({ user, onUserUpdate }) {
  const [simulations, setSimulations] = useState([]);
  const [history, setHistory] = useState([]);
  const [activeSim, setActiveSim] = useState(null);
  
  // Timer states
  const [reactionTime, setReactionTime] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef(null);

  // Results state
  const [reportCard, setReportCard] = useState(null);
  const [selectedChoice, setSelectedChoice] = useState(null);

  useEffect(() => {
    fetchSimulations();
  }, []);

  const fetchSimulations = async () => {
    try {
      const res = await api.getSimulations();
      if (res) {
        setSimulations(res.simulations || []);
        setHistory(res.history || []);
        if (res.simulations?.length > 0) {
          selectSimulation(res.simulations[0]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const selectSimulation = (sim) => {
    setActiveSim(sim);
    setReportCard(null);
    setSelectedChoice(null);
    setReactionTime(0);
    setTimerRunning(true);
    
    // Clear previous timer
    if (timerRef.current) clearInterval(timerRef.current);
    
    // Start stopwatch counting seconds (one decimal point)
    const startTime = Date.now();
    timerRef.current = setInterval(() => {
      setReactionTime(parseFloat(((Date.now() - startTime) / 1000).toFixed(1)));
    }, 100);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleMakeDecision = async (choiceValue) => {
    if (!timerRunning) return; // Prevent double submitting
    
    // Stop the timer
    setTimerRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setSelectedChoice(choiceValue);

    try {
      const res = await api.completeSimulation(activeSim.id, choiceValue, reactionTime);
      if (res?.success) {
        setReportCard(res.reportCard);
        setHistory(res.history);
        onUserUpdate(res.user);
      }
    } catch (err) {
      alert('Failed to register choice');
      setTimerRunning(true);
    }
  };

  const hasCompleted = (categoryName) => {
    return history.some(h => h.simulation === categoryName);
  };

  return (
    <div>
      <div className="flex-between mb-2">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.50rem' }}>
            <Sword size={28} className="text-success" /> Cyber Arena Simulations
          </h1>
          <p className="text-secondary" style={{ fontSize: '0.95rem' }}>
            Train your cognitive cybersecurity firewall in realistic simulated attacks.
          </p>
        </div>
        <div className="flex-gap-1">
          <span style={{ fontSize: '0.85rem' }} className="text-secondary">Current Streak:</span>
          <span className="badge badge-success">{user?.streak || 0} Days</span>
        </div>
      </div>

      <div className="arena-grid">
        {/* Left Side: Simulations Selector */}
        <div className="arena-menu">
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Missions Available
          </h3>
          {simulations.map((sim) => (
            <div 
              key={sim.id}
              className={`arena-menu-item ${activeSim?.id === sim.id ? 'active' : ''}`}
              onClick={() => selectSimulation(sim)}
            >
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{sim.category}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  {hasCompleted(sim.category) ? 'Replay Mission' : 'Not Attempted'}
                </div>
              </div>
              {hasCompleted(sim.category) ? (
                <CheckCircle size={16} className="text-success" />
              ) : (
                <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--accent-amber)' }} />
              )}
            </div>
          ))}

          {/* History list */}
          <div className="card mt-2" style={{ padding: '1.25rem' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Award size={14} /> Training Log
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {history.map((hist) => (
                <div key={hist.id} className="flex-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '0.5rem', fontSize: '0.75rem' }}>
                  <span style={{ fontWeight: 500 }}>{hist.simulation}</span>
                  <span className={hist.score >= 80 ? 'text-success' : 'text-danger'} style={{ fontWeight: 'bold' }}>
                    {hist.score}/100
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Simulation Execution Terminal */}
        <div className="simulation-window">
          {activeSim ? (
            <>
              <div className="simulation-header">
                <div>
                  <span className="badge badge-warning" style={{ marginRight: '0.5rem' }}>Simulation Node</span>
                  <span style={{ fontWeight: 600, fontSize: '1rem' }}>{activeSim.category}</span>
                </div>
                <div className="timer-tag">
                  <Clock size={16} />
                  <span>Reaction Clock: {reactionTime}s</span>
                </div>
              </div>

              <div className="simulation-body">
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  A message alert lands in your browser/device inbox:
                </div>

                <div className="mock-device">
                  <div className="mock-device-sender">FROM: SECURE-ALERT-GATEWAY // INCOMING TRANSMISSION</div>
                  <div style={{ color: 'var(--text-primary)', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                    {activeSim.message}
                  </div>
                </div>

                {reportCard ? (
                  /* Report Card Output */
                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginTop: '0.5rem' }}>
                    <div className="flex-between">
                      <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.15rem' }} className="text-success">
                        <CheckCircle size={18} /> Cyber Report Card Generated
                      </h3>
                      <span className="badge badge-success" style={{ fontSize: '0.8rem' }}>
                        Grade Score: {reportCard.score}/100
                      </span>
                    </div>

                    <div className="report-card-grid">
                      <div className="report-card-metric">
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Cognitive Strength</div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', marginTop: '0.2rem' }} className="text-success">
                          {reportCard.strength}
                        </div>
                      </div>
                      <div className="report-card-metric">
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Vulnerability Triggers</div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', marginTop: '0.2rem' }} className={reportCard.weakness === 'None' ? 'text-success' : 'text-danger'}>
                          {reportCard.weakness}
                        </div>
                      </div>
                    </div>

                    <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '0.85rem', lineHeight: '1.5', marginBottom: '1.5rem' }}>
                      <strong>AI Review Logic:</strong> {reportCard.reasoning}
                    </div>

                    <div className="flex-between">
                      <div style={{ fontSize: '0.85rem' }}>
                        Profile Score Adjustment:{' '}
                        <span className={reportCard.improvement >= 0 ? 'text-success' : 'text-danger'} style={{ fontWeight: 'bold' }}>
                          {reportCard.improvement >= 0 ? `+${reportCard.improvement}` : reportCard.improvement}
                        </span>
                      </div>
                      <button 
                        className="btn btn-primary"
                        onClick={() => {
                          const nextIdx = (simulations.findIndex(s => s.id === activeSim.id) + 1) % simulations.length;
                          selectSimulation(simulations[nextIdx]);
                        }}
                      >
                        Next Mission <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Action Options Selectors */
                  <div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                      Choose your actions carefully to train your AI twin.
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {activeSim.options.map((option, idx) => (
                        <button 
                          key={idx}
                          className="btn btn-secondary w-full"
                          style={{ textAlign: 'left', display: 'block', padding: '1rem 1.25rem', fontWeight: 500 }}
                          onClick={() => handleMakeDecision(option.value)}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="loader-container" style={{ minHeight: '300px' }}>
              <div className="spinner"></div>
              <p>Spinning up virtual Arena terminals...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
