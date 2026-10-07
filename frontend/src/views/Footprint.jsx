import React, { useState, useEffect } from 'react';
import { 
  Fingerprint, 
  Search, 
  Globe, 
  User, 
  Mail, 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  ExternalLink, 
  Code2, 
  Server, 
  RefreshCw, 
  Lock, 
  History, 
  TrendingDown, 
  TrendingUp, 
  Info, 
  Copy, 
  Check,
  ChevronRight,
  Share2,
  FileText
} from 'lucide-react';
import { api } from '../apiService';

export default function Footprint() {
  const [targetType, setTargetType] = useState('username'); // 'username' | 'email' | 'domain'
  const [targetQuery, setTargetQuery] = useState('');
  const [scanning, setScanning] = useState(false);
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [scanResult, setScanResult] = useState(null);
  const [historyDelta, setHistoryDelta] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [activeTab, setActiveTab] = useState('findings'); // 'findings' | 'topology' | 'remediation' | 'timeline' | 'history'
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [activeRemediationModal, setActiveRemediationModal] = useState(null);
  const [copiedText, setCopiedText] = useState(false);
  const [reverifyingId, setReverifyingId] = useState(null);
  const [reverifyMessage, setReverifyMessage] = useState(null);

  const stagesList = [
    'Initializing scan & parameter validation',
    'Discovering public profiles (GitHub, Gravatar, Keybase, Dev networks)',
    'Checking associated domains & DNS security (SPF, DMARC, RDAP)',
    'Analyzing public exposure & breach indicators',
    'Verifying findings & evaluating confidence levels',
    'Calculating explainable 0–100 risk score engine',
    'Generating report & interactive relationship topology'
  ];

  // Load history on mount
  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    try {
      const res = await api.getFootprintHistory();
      if (res && res.scans) {
        setScanHistory(res.scans);
        setTimeline(res.timeline || []);
        if (res.scans.length > 0 && !scanResult) {
          setScanResult(res.scans[0]);
        }
      }
    } catch (err) {
      console.warn('Failed to load scan history:', err);
    }
  }

  const handleStartScan = async (e) => {
    if (e) e.preventDefault();
    if (!targetQuery.trim()) return;

    setScanning(true);
    setCurrentStageIdx(0);
    setReverifyMessage(null);

    // Progressive stage simulation animation while awaiting backend
    const interval = setInterval(() => {
      setCurrentStageIdx(prev => {
        if (prev < stagesList.length - 1) return prev + 1;
        return prev;
      });
    }, 650);

    try {
      const res = await api.scanFootprint(targetType, targetQuery.trim());
      clearInterval(interval);
      setCurrentStageIdx(stagesList.length);

      if (res && res.scan) {
        setScanResult(res.scan);
        setHistoryDelta(res.historyDelta || null);
        loadHistory();
      }
    } catch (err) {
      clearInterval(interval);
      console.error('Scan failed:', err);
    } finally {
      setScanning(false);
    }
  };

  const handleRemediateStatus = async (findingId, newStatus) => {
    if (!scanResult) return;
    try {
      const res = await api.remediateFinding(scanResult.scanId, findingId, newStatus);
      if (res && res.scan) {
        setScanResult(res.scan);
      }
      loadHistory();
    } catch (err) {
      console.error('Failed to update remediation status:', err);
    }
  };

  const handleAutomatedReverify = async (finding) => {
    if (!scanResult) return;
    setReverifyingId(finding.id);
    setReverifyMessage(null);

    const domainToCheck = scanResult.targetType === 'domain' 
      ? scanResult.targetQuery 
      : (scanResult.domains && scanResult.domains[0]) || '';

    try {
      const res = await api.verifyAutomatedFinding(scanResult.scanId, finding.id, domainToCheck);
      setReverifyMessage({
        findingId: finding.id,
        verified: res.verified,
        text: res.message
      });
      if (res.verified) {
        handleRemediateStatus(finding.id, 'remediated');
      }
    } catch (err) {
      setReverifyMessage({
        findingId: finding.id,
        verified: false,
        text: 'Automated live check failed to connect to DNS resolver.'
      });
    } finally {
      setReverifyingId(null);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const filteredFindings = (scanResult?.findings || []).filter(f => {
    if (filterSeverity === 'all') return true;
    if (filterSeverity === 'high') return f.risk === 'Critical' || f.risk === 'High';
    if (filterSeverity === 'medium') return f.risk === 'Medium';
    if (filterSeverity === 'low') return f.risk === 'Low';
    return true;
  });

  return (
    <div className="view-container animate-fade-in" style={{ paddingBottom: '4rem' }}>
      {/* Header Banner */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <div style={{ 
            backgroundColor: 'rgba(24, 165, 114, 0.15)', 
            border: '1px solid var(--accent-emerald)', 
            padding: '0.5rem', 
            borderRadius: '8px',
            color: 'var(--accent-emerald)'
          }}>
            <Fingerprint size={28} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '800', margin: 0, letterSpacing: '-0.02em' }}>
              Digital Footprint <span style={{ color: 'var(--accent-emerald)' }}>Scanner</span>
            </h1>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Self-assessment reconnaissance engine analyzing public profiles, developer platforms, DNS resilience & exposure indicators.
            </p>
          </div>
        </div>

        {/* Self-Assessment Notice */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem', 
          backgroundColor: 'rgba(27, 31, 35, 0.8)', 
          border: '1px solid var(--border-dark)', 
          borderLeft: '4px solid var(--accent-emerald)',
          borderRadius: '6px', 
          padding: '0.75rem 1rem',
          fontSize: '0.82rem',
          color: 'var(--text-secondary)'
        }}>
          <Lock size={16} color="var(--accent-emerald)" style={{ flexShrink: 0 }} />
          <span>
            <strong>Authorized Testing Protocol:</strong> Scans run strictly against verified, legitimate public records (APIs, public Git histories, ICANN RDAP, DNS-over-HTTPS). No private boundaries or authenticated accounts are probed.
          </span>
        </div>
      </div>

      {/* 1. SCAN INTERFACE */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem', border: '1px solid var(--border-dark)' }}>
        <form onSubmit={handleStartScan}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
              TARGET CLASSIFICATION:
            </span>
            <div style={{ display: 'inline-flex', backgroundColor: '#111315', borderRadius: '8px', padding: '3px', border: '1px solid var(--border-dark)' }}>
              {[
                { id: 'username', label: 'Username / Handle', icon: User },
                { id: 'email', label: 'Email Address', icon: Mail },
                { id: 'domain', label: 'Domain Name', icon: Globe }
              ].map(t => {
                const Icon = t.icon;
                const active = targetType === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => { setTargetType(t.id); setTargetQuery(''); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.45rem 0.9rem',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: active ? 'var(--card-bg)' : 'transparent',
                      color: active ? 'var(--accent-emerald)' : 'var(--text-muted)',
                      fontWeight: active ? '600' : '400',
                      cursor: 'pointer',
                      fontSize: '0.82rem',
                      boxShadow: active ? '0 2px 4px rgba(0,0,0,0.4)' : 'none',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Icon size={14} />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ flex: '1', minWidth: '280px', position: 'relative' }}>
              <input
                type="text"
                value={targetQuery}
                onChange={(e) => setTargetQuery(e.target.value)}
                placeholder={
                  targetType === 'username' 
                    ? 'Enter username handle (e.g. torvalds, octocat, defunkt)...' 
                    : targetType === 'email' 
                    ? 'Enter email address (e.g. security@company.com, developer@gmail.com)...' 
                    : 'Enter domain name (e.g. cloudflare.com, github.com)...'
                }
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem 0.85rem 2.75rem',
                  backgroundColor: '#111315',
                  border: '1px solid var(--border-dark)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '0.95rem',
                  fontFamily: 'monospace',
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
                }}
                disabled={scanning}
              />
              <Search 
                size={18} 
                color="var(--text-muted)" 
                style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} 
              />
            </div>

            <button
              type="submit"
              disabled={scanning || !targetQuery.trim()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'var(--accent-emerald)',
                color: '#000',
                border: 'none',
                borderRadius: '8px',
                padding: '0.85rem 1.75rem',
                fontWeight: '700',
                fontSize: '0.9rem',
                cursor: scanning || !targetQuery.trim() ? 'not-allowed' : 'pointer',
                opacity: scanning || !targetQuery.trim() ? 0.6 : 1,
                boxShadow: '0 0 15px rgba(24, 165, 114, 0.3)',
                transition: 'all 0.2s ease'
              }}
            >
              {scanning ? (
                <>
                  <RefreshCw size={16} className="spin-animation" />
                  Scanning OSINT Pipeline...
                </>
              ) : (
                <>
                  <Fingerprint size={18} />
                  Start Footprint Scan
                </>
              )}
            </button>
          </div>
        </form>

        {/* Real-time Scan Progress Stages */}
        {scanning && (
          <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-dark)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--accent-emerald)', fontWeight: '600' }}>
                LIVE OSINT EXECUTION PIPELINE
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                Stage {Math.min(currentStageIdx + 1, stagesList.length)} of {stagesList.length}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
              {stagesList.map((stg, i) => {
                const isPassed = i < currentStageIdx;
                const isCurrent = i === currentStageIdx;
                return (
                  <div
                    key={i}
                    style={{
                      padding: '0.6rem 0.8rem',
                      borderRadius: '6px',
                      backgroundColor: isCurrent ? 'rgba(24, 165, 114, 0.12)' : isPassed ? 'rgba(27, 31, 35, 0.6)' : 'rgba(17, 19, 21, 0.4)',
                      border: isCurrent ? '1px solid var(--accent-emerald)' : '1px solid var(--border-dark)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.75rem',
                      color: isCurrent ? 'white' : isPassed ? 'var(--text-secondary)' : 'var(--text-muted)',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {isPassed ? (
                      <CheckCircle2 size={14} color="var(--accent-emerald)" style={{ flexShrink: 0 }} />
                    ) : isCurrent ? (
                      <RefreshCw size={14} color="var(--accent-emerald)" className="spin-animation" style={{ flexShrink: 0 }} />
                    ) : (
                      <Clock size={14} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                    )}
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {stg}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Delta Notification Badge (Score Diff 72 -> 54) */}
      {historyDelta && (
        <div style={{
          marginBottom: '1.5rem',
          backgroundColor: historyDelta.scoreDelta >= 0 ? 'rgba(24, 165, 114, 0.12)' : 'rgba(224, 82, 82, 0.12)',
          border: `1px solid ${historyDelta.scoreDelta >= 0 ? 'var(--accent-emerald)' : 'var(--threat-red)'}`,
          borderRadius: '8px',
          padding: '1rem 1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {historyDelta.scoreDelta >= 0 ? (
              <TrendingDown size={28} color="var(--accent-emerald)" />
            ) : (
              <TrendingUp size={28} color="var(--threat-red)" />
            )}
            <div>
              <div style={{ fontWeight: '700', fontSize: '1rem', color: 'white' }}>
                Footprint Comparison: {historyDelta.previousScore} → {historyDelta.currentScore}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {historyDelta.message} ({historyDelta.resolvedFindingsCount} resolved issues, {historyDelta.newFindingsCount} new detections)
              </div>
            </div>
          </div>
          <span style={{ 
            fontFamily: 'monospace', 
            fontWeight: '700', 
            fontSize: '1.1rem', 
            color: historyDelta.scoreDelta >= 0 ? 'var(--accent-emerald)' : 'var(--threat-red)' 
          }}>
            {historyDelta.scoreDelta >= 0 ? `-${historyDelta.scoreDelta} PTS EXPOSURE` : `+${Math.abs(historyDelta.scoreDelta)} PTS RISK`}
          </span>
        </div>
      )}

      {/* RESULTS DISPLAY */}
      {scanResult && (
        <>
          {/* Top KPI Cards & Explainable Risk Gauge */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            {/* Risk Gauge Card */}
            <div className="card" style={{ padding: '1.5rem', border: '1px solid var(--border-dark)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Explainable Exposure Score
                  </span>
                  <h3 style={{ margin: '0.25rem 0', fontSize: '1.2rem', color: 'white' }}>
                    Target Risk Assessment
                  </h3>
                </div>
                <span style={{
                  padding: '0.3rem 0.6rem',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  backgroundColor: `${scanResult.risk.badgeColor}22`,
                  color: scanResult.risk.badgeColor,
                  border: `1px solid ${scanResult.risk.badgeColor}`
                }}>
                  {scanResult.risk.riskLevel}
                </span>
              </div>

              {/* Big Score Display */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', margin: '1rem 0' }}>
                <span style={{ fontSize: '3.5rem', fontWeight: '900', lineHeight: '1', color: scanResult.risk.badgeColor, fontFamily: 'monospace' }}>
                  {scanResult.risk.score}
                </span>
                <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>/ 100</span>
              </div>

              {/* Exposure Progress Bar */}
              <div style={{ width: '100%', height: '8px', backgroundColor: '#111315', borderRadius: '4px', overflow: 'hidden', marginBottom: '1rem' }}>
                <div style={{ 
                  width: `${scanResult.risk.score}%`, 
                  height: '100%', 
                  backgroundColor: scanResult.risk.badgeColor,
                  transition: 'width 0.8s ease'
                }} />
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Target: <strong style={{ color: 'white', fontFamily: 'monospace' }}>{scanResult.targetQuery}</strong> ({scanResult.targetType})
              </div>
            </div>

            {/* Footprint Discovery Telemetry Card */}
            <div className="card" style={{ padding: '1.5rem', border: '1px solid var(--border-dark)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Public Asset Discovery
              </span>
              <h3 style={{ margin: '0.25rem 0 1rem 0', fontSize: '1.2rem', color: 'white' }}>
                Discovered Footprint Metrics
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <div style={{ backgroundColor: '#111315', padding: '0.85rem', borderRadius: '6px', border: '1px solid var(--border-dark)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Findings</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'white' }}>{scanResult.summary.totalFindings}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--threat-red)' }}>
                    {scanResult.risk.highCount} Critical/High
                  </div>
                </div>

                <div style={{ backgroundColor: '#111315', padding: '0.85rem', borderRadius: '6px', border: '1px solid var(--border-dark)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Discovered Accounts</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--accent-emerald)' }}>{scanResult.summary.accountsDiscovered}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {scanResult.summary.confirmedAccounts} Confirmed
                  </div>
                </div>

                <div style={{ backgroundColor: '#111315', padding: '0.85rem', borderRadius: '6px', border: '1px solid var(--border-dark)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Public Repositories</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'white' }}>{scanResult.summary.repositoriesDiscovered}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Open Source Code</div>
                </div>

                <div style={{ backgroundColor: '#111315', padding: '0.85rem', borderRadius: '6px', border: '1px solid var(--border-dark)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Associated Domains</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'white' }}>{scanResult.summary.domainsDiscovered}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>DNS Verified</div>
                </div>
              </div>
            </div>

            {/* Score Factors / Why It Matters Breakdown */}
            <div className="card" style={{ padding: '1.5rem', border: '1px solid var(--border-dark)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Score Explainability Engine
              </span>
              <h3 style={{ margin: '0.25rem 0 0.75rem 0', fontSize: '1.2rem', color: 'white' }}>
                Primary Exposure Drivers
              </h3>

              <div style={{ maxHeight: '180px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                {scanResult.risk.scoreFactors.length === 0 ? (
                  <div style={{ fontSize: '0.85rem', color: 'var(--accent-emerald)', padding: '0.5rem 0' }}>
                    <CheckCircle2 size={16} style={{ verticalAlign: 'middle', marginRight: '0.4rem' }} />
                    Zero negative exposure drivers detected. Clean public hygiene!
                  </div>
                ) : (
                  scanResult.risk.scoreFactors.map((sf, idx) => (
                    <div key={idx} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      padding: '0.5rem 0',
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      fontSize: '0.8rem'
                    }}>
                      <span style={{ color: 'var(--text-secondary)', maxWidth: '80%' }}>
                        {sf.factor}
                      </span>
                      <span style={{ 
                        fontFamily: 'monospace', 
                        fontWeight: '700', 
                        color: sf.risk === 'Critical' || sf.risk === 'High' ? 'var(--threat-red)' : 'var(--alert-amber)' 
                      }}>
                        +{sf.points} pts
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div style={{ 
            display: 'flex', 
            gap: '0.5rem', 
            borderBottom: '1px solid var(--border-dark)', 
            marginBottom: '1.5rem',
            overflowX: 'auto',
            paddingBottom: '0.25rem'
          }}>
            {[
              { id: 'findings', label: `Findings & Remediation (${scanResult.findings.length})`, icon: ShieldAlert },
              { id: 'topology', label: `Footprint Graph Topology (${scanResult.topologyGraph.nodes.length} Nodes)`, icon: Share2 },
              { id: 'accounts', label: `Discovered Profiles (${scanResult.accounts.length})`, icon: User },
              { id: 'timeline', label: 'Security Timeline', icon: Clock },
              { id: 'history', label: `Scan History (${scanHistory.length})`, icon: History }
            ].map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.25rem',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: active ? '2px solid var(--accent-emerald)' : '2px solid transparent',
                    color: active ? 'white' : 'var(--text-muted)',
                    fontWeight: active ? '700' : '500',
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Icon size={16} color={active ? 'var(--accent-emerald)' : 'var(--text-muted)'} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* TAB 1: DETAILED FINDINGS & REMEDIATION */}
          {activeTab === 'findings' && (
            <div>
              {/* Filter Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>SEVERITY FILTER:</span>
                  {['all', 'high', 'medium', 'low'].map(lvl => (
                    <button
                      key={lvl}
                      onClick={() => setFilterSeverity(lvl)}
                      style={{
                        padding: '0.3rem 0.75rem',
                        borderRadius: '4px',
                        border: filterSeverity === lvl ? '1px solid var(--accent-emerald)' : '1px solid var(--border-dark)',
                        backgroundColor: filterSeverity === lvl ? 'rgba(24, 165, 114, 0.15)' : 'transparent',
                        color: filterSeverity === lvl ? 'var(--accent-emerald)' : 'var(--text-muted)',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        cursor: 'pointer'
                      }}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {filteredFindings.length === 0 ? (
                <div className="card" style={{ padding: '3rem', textAlign: 'center', border: '1px solid var(--border-dark)' }}>
                  <ShieldCheck size={48} color="var(--accent-emerald)" style={{ margin: '0 auto 1rem auto' }} />
                  <h3 style={{ color: 'white', margin: '0 0 0.5rem 0' }}>No findings matching filter criteria</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>
                    Either all issues are resolved or the target exhibits exceptional privacy posture.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {filteredFindings.map((finding) => {
                    const isRemediated = finding.status === 'remediated';
                    const isHigh = finding.risk === 'Critical' || finding.risk === 'High';
                    const badgeColor = isHigh ? 'var(--threat-red)' : finding.risk === 'Medium' ? 'var(--alert-amber)' : 'var(--accent-emerald)';

                    return (
                      <div
                        key={finding.id}
                        className="card"
                        style={{
                          padding: '1.25rem',
                          border: isRemediated ? '1px solid rgba(24, 165, 114, 0.3)' : `1px solid var(--border-dark)`,
                          borderLeft: `4px solid ${isRemediated ? 'var(--accent-emerald)' : badgeColor}`,
                          opacity: isRemediated ? 0.75 : 1,
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                              <span style={{ 
                                fontSize: '0.7rem', 
                                padding: '0.2rem 0.5rem', 
                                borderRadius: '4px', 
                                backgroundColor: '#111315', 
                                border: '1px solid var(--border-dark)',
                                color: 'var(--text-muted)',
                                fontFamily: 'monospace'
                              }}>
                                {finding.source}
                              </span>

                              <span style={{ 
                                fontSize: '0.7rem', 
                                padding: '0.2rem 0.5rem', 
                                borderRadius: '4px', 
                                backgroundColor: `${badgeColor}22`,
                                border: `1px solid ${badgeColor}`,
                                color: badgeColor,
                                fontWeight: '700'
                              }}>
                                {finding.risk} Risk
                              </span>

                              <span style={{ 
                                fontSize: '0.7rem', 
                                padding: '0.2rem 0.5rem', 
                                borderRadius: '4px', 
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                color: 'var(--text-secondary)'
                              }}>
                                Confidence: {finding.confidence}
                              </span>

                              {isRemediated && (
                                <span style={{ 
                                  fontSize: '0.7rem', 
                                  padding: '0.2rem 0.5rem', 
                                  borderRadius: '4px', 
                                  backgroundColor: 'rgba(24, 165, 114, 0.2)',
                                  color: 'var(--accent-emerald)',
                                  fontWeight: '700'
                                }}>
                                  ✓ Remediated
                                </span>
                              )}
                            </div>

                            <h4 style={{ margin: '0.5rem 0 0.25rem 0', fontSize: '1.05rem', color: 'white' }}>
                              {finding.finding}
                            </h4>
                          </div>

                          {/* Remediation Status Selector */}
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <select
                              value={finding.status || 'open'}
                              onChange={(e) => handleRemediateStatus(finding.id, e.target.value)}
                              style={{
                                backgroundColor: '#111315',
                                color: isRemediated ? 'var(--accent-emerald)' : 'white',
                                border: '1px solid var(--border-dark)',
                                borderRadius: '6px',
                                padding: '0.4rem 0.6rem',
                                fontSize: '0.78rem',
                                outline: 'none',
                                cursor: 'pointer'
                              }}
                            >
                              <option value="open">Status: Open</option>
                              <option value="in_progress">Status: In Progress</option>
                              <option value="remediated">Status: Remediated</option>
                              <option value="accepted">Status: Accepted Risk</option>
                            </select>

                            {finding.guide && (
                              <button
                                onClick={() => setActiveRemediationModal(finding)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.35rem',
                                  backgroundColor: 'rgba(24, 165, 114, 0.15)',
                                  color: 'var(--accent-emerald)',
                                  border: '1px solid var(--accent-emerald)',
                                  borderRadius: '6px',
                                  padding: '0.4rem 0.75rem',
                                  fontSize: '0.78rem',
                                  fontWeight: '600',
                                  cursor: 'pointer'
                                }}
                              >
                                <FileText size={14} />
                                Guided Fix
                              </button>
                            )}

                            {/* Live Automated Verification Button for DNS/Domain */}
                            {finding.remediationType === 'dns_config' && (
                              <button
                                onClick={() => handleAutomatedReverify(finding)}
                                disabled={reverifyingId === finding.id}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.35rem',
                                  backgroundColor: '#1E2328',
                                  color: 'white',
                                  border: '1px solid var(--border-dark)',
                                  borderRadius: '6px',
                                  padding: '0.4rem 0.75rem',
                                  fontSize: '0.78rem',
                                  cursor: reverifyingId === finding.id ? 'not-allowed' : 'pointer'
                                }}
                              >
                                <RefreshCw size={13} className={reverifyingId === finding.id ? 'spin-animation' : ''} />
                                Live Re-Check
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Automated Re-verify Message Toast */}
                        {reverifyMessage && reverifyMessage.findingId === finding.id && (
                          <div style={{
                            margin: '0.5rem 0',
                            padding: '0.5rem 0.75rem',
                            borderRadius: '4px',
                            backgroundColor: reverifyMessage.verified ? 'rgba(24, 165, 114, 0.2)' : 'rgba(244, 163, 64, 0.2)',
                            color: reverifyMessage.verified ? 'var(--accent-emerald)' : 'var(--alert-amber)',
                            fontSize: '0.78rem'
                          }}>
                            {reverifyMessage.text}
                          </div>
                        )}

                        {/* Finding 7-Tuple Body */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.75rem', marginTop: '0.75rem', fontSize: '0.82rem' }}>
                          <div style={{ backgroundColor: '#111315', padding: '0.75rem', borderRadius: '6px' }}>
                            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem', marginBottom: '0.2rem' }}>
                              EVIDENCE DISCOVERED
                            </span>
                            <span style={{ color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                              {finding.evidence}
                            </span>
                          </div>

                          <div style={{ backgroundColor: '#111315', padding: '0.75rem', borderRadius: '6px' }}>
                            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem', marginBottom: '0.2rem' }}>
                              WHY IT MATTERS
                            </span>
                            <span style={{ color: 'var(--text-secondary)' }}>
                              {finding.whyItMatters}
                            </span>
                          </div>
                        </div>

                        <div style={{ marginTop: '0.75rem', padding: '0.75rem', backgroundColor: 'rgba(27, 31, 35, 0.5)', borderRadius: '6px', fontSize: '0.82rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                          <Shield size={16} color="var(--accent-emerald)" style={{ flexShrink: 0, marginTop: '2px' }} />
                          <div>
                            <span style={{ fontWeight: '700', color: 'white' }}>Recommended Action: </span>
                            <span style={{ color: 'var(--text-secondary)' }}>{finding.recommendedAction}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: INTERACTIVE RELATIONSHIP TOPOLOGY GRAPH */}
          {activeTab === 'topology' && (
            <div className="card" style={{ padding: '1.5rem', border: '1px solid var(--border-dark)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h3 style={{ margin: 0, color: 'white', fontSize: '1.15rem' }}>
                    Asset Relationship Topology Graph
                  </h3>
                  <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                    Visual correlation map: Email → Usernames → Profiles → Code Repositories → Domains
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <div style={{ width: '12px', height: '2px', backgroundColor: 'var(--accent-emerald)' }} />
                    <span style={{ color: 'var(--text-secondary)' }}>Confirmed (High Confidence)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <div style={{ width: '12px', height: '2px', borderTop: '2px dashed var(--alert-amber)' }} />
                    <span style={{ color: 'var(--text-secondary)' }}>Potential (Medium/Low)</span>
                  </div>
                </div>
              </div>

              {/* Topology SVG Canvas */}
              <div style={{ 
                backgroundColor: '#0c0f12', 
                borderRadius: '8px', 
                border: '1px solid var(--border-dark)', 
                minHeight: '420px', 
                position: 'relative',
                overflow: 'hidden',
                padding: '1.5rem'
              }}>
                <svg width="100%" height="400" viewBox="0 0 800 400" style={{ overflow: 'visible' }}>
                  <defs>
                    <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#18A572" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#24282D" stopOpacity="0.3" />
                    </linearGradient>
                  </defs>

                  {/* Render Edges */}
                  {scanResult.topologyGraph.nodes.map((node, i) => {
                    if (node.isRoot) return null;
                    // Calculate radial or tree positions
                    const total = scanResult.topologyGraph.nodes.length - 1;
                    const angle = ((i - 1) / Math.max(1, total)) * Math.PI * 1.5 - Math.PI * 0.75;
                    const cx = 400 + Math.cos(angle) * 220;
                    const cy = 200 + Math.sin(angle) * 140;

                    const isConfirmed = node.confidence === 'High';

                    return (
                      <g key={`edge-${node.id}`}>
                        <line
                          x1="400"
                          y1="200"
                          x2={cx}
                          y2={cy}
                          stroke={isConfirmed ? 'var(--accent-emerald)' : 'var(--alert-amber)'}
                          strokeWidth="2"
                          strokeDasharray={isConfirmed ? 'none' : '5,5'}
                          opacity="0.6"
                        />
                      </g>
                    );
                  })}

                  {/* Render Root Center Node */}
                  <g 
                    transform="translate(400, 200)" 
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelectedNode(scanResult.topologyGraph.nodes[0])}
                  >
                    <circle r="42" fill="#18A572" opacity="0.2" className="pulse-glow" />
                    <circle r="32" fill="#111315" stroke="var(--accent-emerald)" strokeWidth="2.5" />
                    <text textAnchor="middle" y="-6" fill="white" fontSize="10" fontWeight="bold">QUERY</text>
                    <text textAnchor="middle" y="8" fill="var(--accent-emerald)" fontSize="8" fontFamily="monospace">
                      {scanResult.targetQuery.slice(0, 12)}
                    </text>
                  </g>

                  {/* Render Child Nodes */}
                  {scanResult.topologyGraph.nodes.map((node, i) => {
                    if (node.isRoot) return null;
                    const total = scanResult.topologyGraph.nodes.length - 1;
                    const angle = ((i - 1) / Math.max(1, total)) * Math.PI * 1.5 - Math.PI * 0.75;
                    const cx = 400 + Math.cos(angle) * 220;
                    const cy = 200 + Math.sin(angle) * 140;

                    const isConfirmed = node.confidence === 'High';
                    const nodeFill = node.type === 'account' ? '#1B1F23' : node.type === 'repository' ? '#142019' : '#221919';
                    const borderColor = isConfirmed ? 'var(--accent-emerald)' : 'var(--alert-amber)';

                    return (
                      <g 
                        key={node.id} 
                        transform={`translate(${cx}, ${cy})`}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setSelectedNode(node)}
                      >
                        <circle r="24" fill={nodeFill} stroke={borderColor} strokeWidth="1.5" />
                        <text textAnchor="middle" y="4" fill="white" fontSize="9" fontWeight="600">
                          {node.type === 'account' ? 'ACC' : node.type === 'repository' ? 'GIT' : 'DOM'}
                        </text>
                        <text textAnchor="middle" y="38" fill="var(--text-secondary)" fontSize="9" fontFamily="monospace">
                          {node.label.length > 16 ? node.label.slice(0, 15) + '…' : node.label}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Selected Node Details Box */}
                {selectedNode && (
                  <div style={{
                    position: 'absolute',
                    bottom: '1rem',
                    right: '1rem',
                    backgroundColor: 'rgba(17, 19, 21, 0.95)',
                    border: '1px solid var(--border-dark)',
                    borderRadius: '8px',
                    padding: '1rem',
                    maxWidth: '300px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 10
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--accent-emerald)' }}>
                        NODE INSPECTOR
                      </span>
                      <button 
                        onClick={() => setSelectedNode(null)} 
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem' }}
                      >
                        ×
                      </button>
                    </div>
                    <div style={{ fontWeight: '700', color: 'white', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                      {selectedNode.label}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      {selectedNode.sublabel}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Confidence: <strong>{selectedNode.confidence}</strong>
                    </div>
                    {selectedNode.url && (
                      <a 
                        href={selectedNode.url} 
                        target="_blank" 
                        rel="noreferrer" 
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--accent-emerald)', fontSize: '0.75rem', marginTop: '0.5rem', textDecoration: 'none' }}
                      >
                        Inspect Public Source <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: DISCOVERED ACCOUNTS & PLATFORMS */}
          {activeTab === 'accounts' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
              {scanResult.accounts.map((acc, idx) => (
                <div key={idx} className="card" style={{ padding: '1.25rem', border: '1px solid var(--border-dark)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    {acc.avatarUrl ? (
                      <img 
                        src={acc.avatarUrl} 
                        alt={acc.handle} 
                        style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-dark)' }} 
                      />
                    ) : (
                      <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: '#111315', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-dark)' }}>
                        <User size={20} color="var(--accent-emerald)" />
                      </div>
                    )}
                    <div>
                      <h4 style={{ margin: 0, color: 'white', fontSize: '0.95rem' }}>
                        {acc.displayName || acc.handle}
                      </h4>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {acc.platform} • @{acc.handle}
                      </div>
                    </div>
                    <span style={{ 
                      marginLeft: 'auto', 
                      fontSize: '0.7rem', 
                      padding: '0.2rem 0.5rem', 
                      borderRadius: '4px',
                      backgroundColor: acc.confidence === 'High' ? 'rgba(24, 165, 114, 0.15)' : 'rgba(244, 163, 64, 0.15)',
                      color: acc.confidence === 'High' ? 'var(--accent-emerald)' : 'var(--alert-amber)',
                      fontWeight: '700'
                    }}>
                      {acc.confidence}
                    </span>
                  </div>

                  {acc.bio && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.5rem 0', fontStyle: 'italic' }}>
                      "{acc.bio}"
                    </p>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-dark)', fontSize: '0.75rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>
                      {acc.location ? `📍 ${acc.location}` : 'No location specified'}
                    </span>
                    {acc.url && (
                      <a 
                        href={acc.url} 
                        target="_blank" 
                        rel="noreferrer" 
                        style={{ color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '0.2rem', textDecoration: 'none' }}
                      >
                        Public Profile <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: SECURITY TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="card" style={{ padding: '1.5rem', border: '1px solid var(--border-dark)' }}>
              <h3 style={{ margin: '0 0 1rem 0', color: 'white', fontSize: '1.15rem' }}>
                Footprint Security Audit Trail
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', paddingLeft: '1.5rem' }}>
                <div style={{ position: 'absolute', left: '7px', top: '10px', bottom: '10px', width: '2px', backgroundColor: 'var(--border-dark)' }} />

                {timeline.map((item, idx) => (
                  <div key={idx} style={{ position: 'relative' }}>
                    <div style={{
                      position: 'absolute',
                      left: '-1.5rem',
                      top: '4px',
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: item.type === 'remediation_update' ? 'var(--accent-emerald)' : 'var(--alert-amber)',
                      border: '2px solid #111315'
                    }} />

                    <div style={{ backgroundColor: '#111315', padding: '0.85rem 1rem', borderRadius: '6px', border: '1px solid var(--border-dark)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: '700', color: 'white', fontSize: '0.88rem' }}>
                          {item.title}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                          {new Date(item.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: SCAN HISTORY */}
          {activeTab === 'history' && (
            <div className="card" style={{ padding: '1.5rem', border: '1px solid var(--border-dark)' }}>
              <h3 style={{ margin: '0 0 1rem 0', color: 'white', fontSize: '1.15rem' }}>
                Historical Self-Assessment Records
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {scanHistory.map((h, i) => (
                  <div
                    key={h.scanId || i}
                    onClick={() => { setScanResult(h); }}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '1rem',
                      backgroundColor: scanResult?.scanId === h.scanId ? 'rgba(24, 165, 114, 0.1)' : '#111315',
                      border: scanResult?.scanId === h.scanId ? '1px solid var(--accent-emerald)' : '1px solid var(--border-dark)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '700', color: 'white', fontSize: '0.9rem' }}>
                        {h.targetQuery} ({h.targetType})
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(h.timestamp).toLocaleString()} • {h.summary.totalFindings} findings • {h.summary.accountsDiscovered} accounts
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.6rem',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        fontWeight: '700',
                        fontFamily: 'monospace',
                        color: h.risk.badgeColor,
                        backgroundColor: `${h.risk.badgeColor}22`
                      }}>
                        Score: {h.risk.score}/100
                      </span>
                      <ChevronRight size={16} color="var(--text-muted)" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* GUIDED REMEDIATION MODAL / DRAWER */}
      {activeRemediationModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#16191D',
            border: '1px solid var(--border-dark)',
            borderRadius: '12px',
            maxWidth: '560px',
            width: '100%',
            padding: '1.75rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.8)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--accent-emerald)', fontWeight: '700', textTransform: 'uppercase' }}>
                  ACTIONABLE REMEDIATION WORKFLOW
                </span>
                <h3 style={{ margin: '0.25rem 0 0 0', color: 'white', fontSize: '1.15rem' }}>
                  {activeRemediationModal.finding}
                </h3>
              </div>
              <button
                onClick={() => setActiveRemediationModal(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.25rem', cursor: 'pointer' }}
              >
                ×
              </button>
            </div>

            <div style={{ backgroundColor: '#111315', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-dark)', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                RECOMMENDED CONFIGURATION / STEPS:
              </div>

              {activeRemediationModal.guide?.steps && (
                <ol style={{ margin: '0.5rem 0', paddingLeft: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                  {activeRemediationModal.guide.steps.map((step, idx) => (
                    <li key={idx} style={{ marginBottom: '0.35rem' }}>{step}</li>
                  ))}
                </ol>
              )}

              {activeRemediationModal.guide?.value && (
                <div style={{ marginTop: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--accent-emerald)', fontFamily: 'monospace' }}>
                      {activeRemediationModal.guide.recordType} RECORD (HOST: {activeRemediationModal.guide.host})
                    </span>
                    <button
                      onClick={() => copyToClipboard(activeRemediationModal.guide.value)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        background: 'none',
                        border: 'none',
                        color: copiedText ? 'var(--accent-emerald)' : 'var(--text-muted)',
                        fontSize: '0.72rem',
                        cursor: 'pointer'
                      }}
                    >
                      {copiedText ? <Check size={12} /> : <Copy size={12} />}
                      {copiedText ? 'Copied' : 'Copy Record'}
                    </button>
                  </div>
                  <pre style={{
                    backgroundColor: '#0c0f12',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    color: 'white',
                    fontFamily: 'monospace',
                    fontSize: '0.8rem',
                    margin: 0,
                    overflowX: 'auto',
                    border: '1px solid var(--border-dark)'
                  }}>
                    {activeRemediationModal.guide.value}
                  </pre>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                onClick={() => setActiveRemediationModal(null)}
                style={{
                  padding: '0.6rem 1.25rem',
                  borderRadius: '6px',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--border-dark)',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}
              >
                Close Guide
              </button>
              <button
                onClick={() => {
                  handleRemediateStatus(activeRemediationModal.id, 'remediated');
                  setActiveRemediationModal(null);
                }}
                style={{
                  padding: '0.6rem 1.25rem',
                  borderRadius: '6px',
                  backgroundColor: 'var(--accent-emerald)',
                  color: '#000',
                  border: 'none',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}
              >
                Mark as Remediated
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
