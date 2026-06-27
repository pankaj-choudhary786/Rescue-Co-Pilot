import React, { useState, useEffect } from 'react';
import {
  MessageSquareCode,
  Circle,
  Wind,
  Play,
  Square,
  Settings,
  Check,
} from 'lucide-react';
export default function MyAgentView({ onStatusChange, activeStatus }) {
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState('Inhale');
  const [breathingTimer, setBreathingTimer] = useState(4);
  const [disposition, setDisposition] = useState('zen');
  const dispositions = [
    {
      id: 'zen',
      name: 'Zen Calmer',
      status: 'Zen Guide Calming...',
      desc: 'Maintains low auditory and telemetry noise; speaks with gentle reassuring composure.',
    },
    {
      id: 'directive',
      name: 'Directive Sentry',
      status: 'Directive Sentry Guarding...',
      desc: 'Firm, actionable alerts; prioritizes immediate timeline corrections and buffer defense.',
    },
    {
      id: 'strategic',
      name: 'Strategic Overlord',
      status: 'Strategic Analysis Engine Live...',
      desc: 'Heavy analysis mode; evaluates long-term priority structures and provides telemetry scores.',
    },
  ];
  const handleSelectDisposition = (disp) => {
    setDisposition(disp.id);
    onStatusChange(disp.status);
  };

  // Breathing Loop Effect
  useEffect(() => {
    let interval = null;
    if (breathingActive) {
      interval = setInterval(() => {
        setBreathingTimer((prev) => {
          if (prev <= 1) {
            // Transition phases in box-breathing cycle (4s Inhale, 4s Hold, 4s Exhale)
            if (breathingPhase === 'Inhale') {
              setBreathingPhase('Hold');
              return 4;
            } else if (breathingPhase === 'Hold') {
              setBreathingPhase('Exhale');
              return 4;
            } else {
              setBreathingPhase('Inhale');
              return 4;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setBreathingTimer(4);
      setBreathingPhase('Inhale');
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [breathingActive, breathingPhase]);
  const getPhaseAnimationClass = () => {
    if (!breathingActive)
      return 'scale-100 bg-indigo-500/10 border-indigo-500/20';
    if (breathingPhase === 'Inhale')
      return 'scale-150 bg-emerald-500/20 border-emerald-500/40 transition-transform duration-[4000ms] ease-out';
    if (breathingPhase === 'Hold')
      return 'scale-150 bg-amber-500/20 border-amber-500/40';
    return 'scale-100 bg-indigo-500/20 border-indigo-500/40 transition-transform duration-[4000ms] ease-in';
  };
  return (
    <div
      id="my-agent-view-container"
      className="flex flex-col gap-6 p-4 md:p-6 animate-fade-in relative z-10 w-full text-slate-100"
    >
      {/* Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold font-display text-white tracking-tight flex items-center gap-2">
          <MessageSquareCode className="w-6 h-6 text-indigo-400" />
          Decompression Agent
        </h2>
        <p className="text-xs text-slate-400 font-sans mt-0.5">
          Tune your AI Guide’s coaching demeanor and trigger immersive
          neuro-somatic reboot cycles.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Disposition / Demeanor Tuning Card */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900/40 border border-white/5 p-4 rounded-2xl backdrop-blur-md">
            <h3 className="text-xs font-bold text-slate-300 font-display mb-4 flex items-center gap-1.5 uppercase tracking-wider">
              <Settings className="w-4 h-4 text-indigo-400" />
              Agent Demeanor & Disposition
            </h3>

            <div className="space-y-3">
              {dispositions.map((disp) => {
                const isSelected = disposition === disp.id;
                return (
                  <button
                    key={disp.id}
                    onClick={() => handleSelectDisposition(disp)}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer relative overflow-hidden flex items-start gap-3.5 group ${isSelected ? 'bg-indigo-600/10 border-indigo-500/30 text-white' : 'bg-slate-950/20 border-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
                  >
                    {/* Glowing Accent */}
                    {isSelected && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />
                    )}

                    <div className="pt-0.5 shrink-0">
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 text-indigo-400" />
                        </div>
                      ) : (
                        <Circle className="w-5 h-5 text-slate-500 group-hover:text-slate-400" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white block">
                          {disp.name}
                        </span>
                        {isSelected && (
                          <span className="text-[8px] font-mono font-black uppercase bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/20 animate-pulse">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[10.5px] text-slate-400 leading-relaxed mt-1">
                        {disp.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Breathing Guided Loop Panel */}
        <div className="space-y-4">
          <div className="bg-slate-900/40 border border-white/5 p-4 rounded-2xl backdrop-blur-md relative overflow-hidden flex flex-col items-center justify-center text-center">
            <h3 className="text-xs font-bold text-slate-300 font-display mb-4 self-start flex items-center gap-1.5 uppercase tracking-wider w-full pb-2 border-b border-white/5">
              <Wind className="w-4 h-4 text-emerald-400" />
              Tactical Reboot Breathing
            </h3>

            {/* Simulated Animated Breathing Circle */}
            <div className="h-56 flex flex-col items-center justify-center relative my-4 w-full">
              {/* Outer Pulsing Wave */}
              <div
                className={`w-28 h-28 rounded-full border flex flex-col items-center justify-center transition-all ${getPhaseAnimationClass()}`}
              >
                <span className="text-xs font-black tracking-wider text-white">
                  {breathingActive ? breathingPhase : 'Tactical'}
                </span>
                <span className="text-[10px] font-mono text-slate-400 mt-1">
                  {breathingActive ? `${breathingTimer}s` : 'Breathing'}
                </span>
              </div>

              {/* Background ambient light */}
              <div className="absolute w-36 h-36 bg-indigo-500/5 blur-2xl rounded-full -z-10 pointer-events-none" />
            </div>

            {/* Instruction Banner */}
            <p className="text-[11px] text-slate-400 max-w-xs leading-relaxed mb-6">
              {breathingActive
                ? breathingPhase === 'Inhale'
                  ? 'Slowly draw air into your abdomen. Feel the chest expand...'
                  : breathingPhase === 'Hold'
                    ? 'Maintain the capacity with calm composure. Retain focus...'
                    : 'Exhale slowly, letting go of any accumulated tension...'
                : 'Decompress during high-stress peaks using our 4s box breathing cycle to restore immediate focus.'}
            </p>

            {/* Control Buttons */}
            {breathingActive ? (
              <button
                onClick={() => setBreathingActive(false)}
                className="px-5 py-2.5 bg-rose-950/30 hover:bg-rose-900/40 text-rose-400 border border-rose-500/25 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
              >
                <Square className="w-4 h-4" />
                Terminate Session
              </button>
            ) : (
              <button
                onClick={() => setBreathingActive(true)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
              >
                <Play className="w-4 h-4" />
                Initialize Breathe Loop
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
