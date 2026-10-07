import React, { useState } from 'react';
import { Mail, Shield, Smartphone, Globe, ArrowRight, BrainCircuit } from 'lucide-react';
import { api } from '../apiService';

export default function Auth({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('login'); // 'login', 'onboarding', 'loading'
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState([]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email) return alert('Please input email');
    try {
      const res = await api.login(email, password || 'password');
      if (res?.user) {
        if (res.user.hasCompletedOnboarding) {
          onLoginSuccess(res.user);
        } else {
          setMode('onboarding');
        }
      }
    } catch (err) {
      alert('Login failed');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const res = await api.login('google-user@gmail.com', 'google-auth');
      if (res?.user) {
        if (res.user.hasCompletedOnboarding) {
          onLoginSuccess(res.user);
        } else {
          setMode('onboarding');
        }
      }
    } catch (err) {
      alert('Google auth failed');
    }
  };

  const questions = [
    {
      question: 'How often do you verify suspicious links before clicking?',
      options: [
        { text: 'Never check, if it comes from friends I trust it', value: 'Never' },
        { text: 'Sometimes check, only if the message context looks weird', value: 'Sometimes' },
        { text: 'Always check the domain name and protocol security', value: 'Always' }
      ]
    },
    {
      question: 'Do you reuse passwords across online accounts?',
      options: [
        { text: 'Yes, I use the same password for convenience', value: 'Yes' },
        { text: 'Only for non-critical sites (streaming, forums)', value: 'Non-critical' },
        { text: 'Never. I use distinct passwords stored in a manager', value: 'Never' }
      ]
    },
    {
      question: 'Have you ever experienced online scams or unauthorized access?',
      options: [
        { text: 'Yes, and I suffered financial or account loss', value: 'Yes' },
        { text: 'Yes, but I realized in time and locked them out', value: 'caught' },
        { text: 'No, never experienced any scams', value: 'No' }
      ]
    },
    {
      question: 'How confident are you in spotting social engineering attempts?',
      options: [
        { text: 'Not confident, I feel vulnerable', value: 'Low' },
        { text: 'Moderately confident, I check basic signals', value: 'Moderate' },
        { text: 'Highly confident, I verify identities out-of-band', value: 'High' }
      ]
    }
  ];

  const handleAnswerSelect = (optionValue) => {
    const updatedAnswers = [...answers, optionValue];
    setAnswers(updatedAnswers);

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      submitAssessment(updatedAnswers);
    }
  };

  const submitAssessment = async (finalAnswers) => {
    setMode('loading');
    
    // Simulate AI model processing time for 2 seconds
    setTimeout(async () => {
      try {
        const res = await api.completeOnboarding(finalAnswers);
        if (res?.user) {
          onLoginSuccess(res.user);
        }
      } catch (err) {
        alert('Failed saving assessment');
        setMode('onboarding');
      }
    }, 2000);
  };

  if (mode === 'loading') {
    return (
      <div className="auth-wrapper">
        <div className="card auth-card text-center" style={{ padding: '3rem' }}>
          <div className="spinner" style={{ margin: '0 auto 1.5rem' }}></div>
          <BrainCircuit size={32} className="text-success mb-1" style={{ animation: 'pulse 1.5s infinite' }} />
          <h3 className="mb-1">Creating Your Cyber Twin</h3>
          <p className="text-secondary" style={{ fontSize: '0.9rem' }}>
            AI is analyzing your security index and mapping risk parameters...
          </p>
        </div>
      </div>
    );
  }

  if (mode === 'onboarding') {
    const currentQ = questions[currentStep];
    return (
      <div className="auth-wrapper">
        <div className="card auth-card">
          <div className="flex-between mb-1">
            <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>
              Cyber Assessment Onboarding
            </span>
            <span className="text-secondary" style={{ fontSize: '0.8rem' }}>
              Step {currentStep + 1} of {questions.length}
            </span>
          </div>

          <div className="quiz-steps">
            {questions.map((_, idx) => (
              <div 
                key={idx} 
                className={`quiz-step-dot ${idx <= currentStep ? 'active' : ''}`} 
              />
            ))}
          </div>

          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>{currentQ.question}</h3>

          <div className="quiz-options">
            {currentQ.options.map((opt, idx) => (
              <div 
                key={idx} 
                className="quiz-option"
                onClick={() => handleAnswerSelect(opt.value)}
              >
                <span>{opt.text}</span>
                <ArrowRight size={16} className="text-secondary" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-wrapper">
      <div className="card auth-card">
        <div className="auth-header">
          <div className="brand" style={{ justifyContent: 'center', marginBottom: '1rem' }}>
            <Shield size={28} className="brand-dot" />
            <span>Cyber<span style={{ color: 'var(--accent-emerald)' }}>DNA</span></span>
          </div>
          <h2 className="auth-title">Welcome to CyberDNA</h2>
          <p className="text-secondary" style={{ fontSize: '0.85rem' }}>
            Configure your cyber defense parameters and create your Cyber Twin
          </p>
        </div>

        <button className="btn btn-secondary w-full flex-center mb-1" onClick={handleGoogleLogin} style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
          <Globe size={18} />
          <span>Continue with Google</span>
        </button>

        <button className="btn btn-secondary w-full flex-center" style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <Smartphone size={18} />
          <span>Mobile One-Time Passcode (OTP)</span>
        </button>

        <div className="divider">or login with email</div>

        <form className="auth-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              className="form-input" 
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-input" 
              placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary w-full mt-1">
            Sign In to Platform
          </button>
        </form>
      </div>
    </div>
  );
}
