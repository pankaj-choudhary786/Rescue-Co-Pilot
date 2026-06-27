import React, { useState } from 'react';
import {
  Shield,
  Sparkles,
  AlertTriangle,
  Key,
  Cpu,
  User,
  ArrowRight,
  Clock,
  Lock,
} from 'lucide-react';
export default function LandingPage({
  onStartRescue,
  isAuthenticated,
  userEmail,
  userName,
  onLoginSuccess,
  onLogout,
}) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [inputName, setInputName] = useState('');
  const [inputEmail, setInputEmail] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const handleAuthSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!inputEmail || !inputPassword) {
      setErrorMessage('Please fill in all credentials.');
      return;
    }
    if (authMode === 'signup' && !inputName) {
      setErrorMessage('Please provide your name for suite personalization.');
      return;
    }

    // Standard simulation synced with App.tsx fullstack handler
    const displayName =
      authMode === 'signup' ? inputName : userName || 'Pankaj';
    onLoginSuccess(displayName, inputEmail);
    setShowAuthModal(false);
  };
  const handleQuickDemo = () => {
    onLoginSuccess('Pankaj', 'pankajkhicharabc3@gmail.com');
  };
  return (
    <div
      id="landing-page"
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-between relative overflow-hidden font-sans select-none"
    >
      {/* Background Decorative Mesh */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Decorative Border Accents */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />

      {/* HEADER SECTION */}
      <header className="w-full max-w-7xl px-6 py-5 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(79,70,229,0.15)]">
            <Shield className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-base font-bold font-display tracking-tight text-white flex items-center gap-1">
              RESCUE <span className="text-indigo-400">CO-PILOT</span>
            </h1>
            <span className="text-[9px] font-mono tracking-widest text-slate-500 block uppercase font-bold">
              Autonomic Defense Suite
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-4 bg-slate-900/60 border border-white/5 py-1.5 px-3.5 rounded-xl">
              <div className="flex flex-col text-right">
                <span className="text-xs font-bold text-slate-200">
                  {userName}
                </span>
                <span className="text-[9px] font-mono text-slate-500">
                  {userEmail}
                </span>
              </div>
              <button
                onClick={onLogout}
                className="text-[10px] font-mono uppercase text-slate-400 hover:text-rose-400 font-bold tracking-wider transition-colors cursor-pointer"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setAuthMode('login');
                setShowAuthModal(true);
              }}
              className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-white/5 rounded-xl text-xs font-semibold tracking-wide transition-all shadow-md cursor-pointer"
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* HERO / CENTRAL AREA */}
      <main className="w-full max-w-4xl px-6 py-12 flex flex-col items-center justify-center text-center relative z-10 my-auto">
        {/* Urgent Shield Tag */}
        <div className="inline-flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/30 px-3 py-1 rounded-full text-[10px] font-mono font-black text-indigo-400 tracking-wider uppercase mb-8 shadow-[0_0_15px_rgba(79,70,229,0.05)] animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          Tactical Overlap Protection Active
        </div>

        {/* Master Headline */}
        <h2 className="text-3xl md:text-5xl font-black font-display text-white tracking-tight leading-tight max-w-2xl">
          Shield Your Timeline From <br />
          <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-400 bg-clip-text text-transparent">
            Last-Minute Stress Cascades
          </span>
        </h2>

        {/* Subtitle */}
        <p className="text-slate-400 text-xs md:text-sm max-w-lg mt-4 leading-relaxed">
          Rescue Co-Pilot is an autonomous defense panel that ingests critical
          milestones, filters incoming notification streams, and deploys
          high-impact focus shields using local stress calculations.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-8 w-full max-w-md justify-center">
          {isAuthenticated ? (
            <button
              onClick={onStartRescue}
              className="w-full sm:w-auto px-7 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold font-mono tracking-wider uppercase transition-all shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer border border-indigo-500/20"
            >
              Enter Active Control Room
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <>
              <button
                onClick={() => {
                  setAuthMode('signup');
                  setShowAuthModal(true);
                }}
                className="w-full sm:w-auto px-7 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold font-mono tracking-wider uppercase transition-all shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer border border-indigo-500/20"
              >
                Initialize Security Core
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={handleQuickDemo}
                className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer"
              >
                Bypass via Quick Demo
              </button>
            </>
          )}
        </div>

        {/* Features Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16 w-full text-left">
          <div className="p-4 rounded-xl border border-white/5 bg-slate-900/20 backdrop-blur-sm flex flex-col gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <Cpu className="w-4 h-4 text-indigo-400" />
            </div>
            <h3 className="text-xs font-bold text-slate-200">
              Autonomous Restructure
            </h3>
            <p className="text-[10.5px] text-slate-400 leading-normal">
              Deconstructs overwhelming goals into clean, actionable,
              time-blocked checklists with localized stress weights.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-white/5 bg-slate-900/20 backdrop-blur-sm flex flex-col gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Shield className="w-4 h-4 text-emerald-400" />
            </div>
            <h3 className="text-xs font-bold text-slate-200">
              Atmospheric Shields
            </h3>
            <p className="text-[10.5px] text-slate-400 leading-normal">
              Redirection mechanisms for messaging channels to ensure full
              isolation during critical milestones.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-white/5 bg-slate-900/20 backdrop-blur-sm flex flex-col gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <h3 className="text-xs font-bold text-slate-200">
              Autonomic Coaching
            </h3>
            <p className="text-[10.5px] text-slate-400 leading-normal">
              A responsive verbal assistant that monitors pacing to guide deep
              work buffers and breathing sprints.
            </p>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full border-t border-white/5 py-4 px-6 flex flex-col sm:flex-row items-center justify-between text-[10px] font-mono text-slate-500 relative z-10 bg-slate-950/80">
        <span>SECURITY ENVELOPE: PERSONALIZED ENCRYPTED PROTOCOL</span>
        <span className="mt-1 sm:mt-0">
          Rescue CoPilot v1.0.4 • Active Secure Terminal
        </span>
      </footer>

      {/* DETAILED AUTH SIGNIN/SIGNUP MODAL */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            onClick={() => setShowAuthModal(false)}
          />

          <div className="w-full max-w-sm bg-slate-900 border border-white/10 rounded-2xl p-6 relative z-10 shadow-2xl overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500" />

            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5 font-display">
                <Key className="w-4 h-4 text-indigo-400" />
                {authMode === 'login'
                  ? 'Access Autonomic Core'
                  : 'Register Security Key'}
              </h3>
              <button
                onClick={() => setShowAuthModal(false)}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4 text-left">
              {errorMessage && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs p-2.5 rounded-lg flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  {errorMessage}
                </div>
              )}

              {authMode === 'signup' && (
                <div>
                  <label className="text-[9px] font-mono font-bold text-slate-500 uppercase block mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={inputName}
                      onChange={(e) => setInputName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 text-slate-200 text-xs rounded-xl border border-white/5 focus:outline-none focus:border-indigo-500 transition-colors"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-[9px] font-mono font-bold text-slate-500 uppercase block mb-1">
                  Secure Identity / Email
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={inputEmail}
                    onChange={(e) => setInputEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 text-slate-200 text-xs rounded-xl border border-white/5 focus:outline-none focus:border-indigo-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[9px] font-mono font-bold text-slate-500 uppercase block mb-1">
                  Access Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    value={inputPassword}
                    onChange={(e) => setInputPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 text-slate-200 text-xs rounded-xl border border-white/5 focus:outline-none focus:border-indigo-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold font-mono tracking-wider uppercase transition-all shadow-md cursor-pointer mt-2"
              >
                {authMode === 'login'
                  ? 'Acknowledge Clearance'
                  : 'Deploy credentials'}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() =>
                    setAuthMode(authMode === 'login' ? 'signup' : 'login')
                  }
                  className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold underline transition-colors cursor-pointer"
                >
                  {authMode === 'login'
                    ? "Don't have clearance keys? Register"
                    : 'Already registered? Login'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
