/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Settings,
  Cpu,
  Sliders,
  ToggleLeft,
  ToggleRight,
  Database,
} from 'lucide-react';
export default function SettingsView() {
  const [allowDND, setAllowDND] = useState(true);
  const [highRiskEmail, setHighRiskEmail] = useState(true);
  const [slackAlert, setSlackAlert] = useState(false);
  const [calendarSync, setCalendarSync] = useState(true);
  const [copiedMessage, setCopiedMessage] = useState(null);
  return (
    <div
      id="settings-view-container"
      className="flex flex-col gap-6 p-4 md:p-6 animate-fade-in relative z-10 w-full"
    >
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl md:text-2xl font-bold font-display text-white tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-indigo-400" />
            Suite Settings
          </h2>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Tweak stress score models, communication channels, and autonomic
            threshold factors.
          </p>
        </div>
        {copiedMessage && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs px-3 py-1.5 rounded-lg font-mono font-bold animate-pulse">
            ✓ {copiedMessage}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PARAMS LIST */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="glassmorphism-card rounded-2xl p-5 border border-white/5">
            <h3 className="text-sm font-semibold text-slate-100 font-display mb-3.5 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              Triage Coefficients
            </h3>

            <div className="flex flex-col gap-4">
              {/* Parameter Row */}
              <div className="flex items-start justify-between gap-4 border-b border-white/5 pb-4">
                <div className="max-w-[75%]">
                  <h4 className="text-xs font-bold text-slate-200 tracking-wide mb-1">
                    Auto-trigger Pomodoro Blocks
                  </h4>
                  <p className="text-[11px] text-slate-450 leading-relaxed">
                    Trigger strict 25-minute Do-Not-Disturb Focus Blocks on the
                    calendar if active Stress Scores exceed 80 points.
                  </p>
                </div>
                <button
                  onClick={() => setAllowDND(!allowDND)}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  {allowDND ? (
                    <ToggleRight className="w-8 h-8 text-indigo-400" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-slate-600" />
                  )}
                </button>
              </div>

              {/* Parameter Row */}
              <div className="flex items-start justify-between gap-4 border-b border-white/5 pb-4">
                <div className="max-w-[75%]">
                  <h4 className="text-xs font-bold text-slate-200 tracking-wide mb-1">
                    Critical Calendar Renegotiation
                  </h4>
                  <p className="text-[11px] text-slate-450 leading-relaxed">
                    Intermittently analyze upcoming meeting agendas for
                    low-stakes keywords to enable auto-proposing delay emails.
                  </p>
                </div>
                <button
                  onClick={() => setHighRiskEmail(!highRiskEmail)}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  {highRiskEmail ? (
                    <ToggleRight className="w-8 h-8 text-indigo-400" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-slate-600" />
                  )}
                </button>
              </div>

              {/* Parameter Row */}
              <div className="flex items-start justify-between gap-4 pb-1">
                <div className="max-w-[75%]">
                  <h4 className="text-xs font-bold text-slate-200 tracking-wide mb-1">
                    Auto-notifying Slack Team Channels
                  </h4>
                  <p className="text-[11px] text-slate-455 leading-relaxed">
                    Instantly declare your Deep Work Focus block status on Slack
                    profiles so coworkers know you are offline.
                  </p>
                </div>
                <button
                  onClick={() => setSlackAlert(!slackAlert)}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  {slackAlert ? (
                    <ToggleRight className="w-8 h-8 text-indigo-400" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-slate-600" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* SYSTEM SPECS BOX */}
          <div className="glassmorphism-card rounded-2xl p-5 border border-white/5">
            <h3 className="text-sm font-semibold text-slate-100 font-display mb-2 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-400" />
              Agent Core Telemetry
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="bg-white/[0.01] border border-white/5 p-3 rounded-xl text-center">
                <span className="text-[9px] font-mono text-slate-500 font-bold block mb-1">
                  MODEL LATENCY
                </span>
                <span className="text-sm font-mono font-bold text-emerald-400 leading-none">
                  12ms
                </span>
              </div>
              <div className="bg-white/[0.01] border border-white/5 p-3 rounded-xl text-center">
                <span className="text-[9px] font-mono text-slate-500 font-bold block mb-1">
                  MEMORY CAPACITY
                </span>
                <span className="text-sm font-mono font-bold text-indigo-300 leading-none">
                  99.8%
                </span>
              </div>
              <div className="bg-white/[0.01] border border-white/5 p-3 rounded-xl text-center">
                <span className="text-[9px] font-mono text-slate-500 font-bold block mb-1">
                  CONFIDENCE RANK
                </span>
                <span className="text-sm font-mono font-bold text-indigo-300 leading-none">
                  0.86 (High)
                </span>
              </div>
              <div className="bg-white/[0.01] border border-white/5 p-3 rounded-xl text-center">
                <span className="text-[9px] font-mono text-slate-500 font-bold block mb-1">
                  RESTRICTED ERRORS
                </span>
                <span className="text-sm font-mono font-bold text-slate-400 leading-none">
                  0/100
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* INTEGRATION PIPELINES (RIGHT COLUMN) */}
        <div className="flex flex-col gap-4">
          <div className="glassmorphism-card rounded-2xl p-5 border border-white/5 flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-slate-100 font-display flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-400" />
              Connected pipelines
            </h3>

            <div className="flex flex-col gap-3">
              {/* Channel 1 */}
              <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-950/5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100 mb-0.5">
                      Google Workspace Cal
                    </h4>
                    <span className="text-[10px] font-mono text-slate-450 uppercase leading-none block">
                      ACTIVE AND SYNCED
                    </span>
                  </div>
                </div>
                <span className="text-[9px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded uppercase">
                  Connected
                </span>
              </div>

              {/* Channel 2 */}
              <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-950/5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100 mb-0.5">
                      Slack Workspace
                    </h4>
                    <span className="text-[10px] font-mono text-slate-450 uppercase leading-none block">
                      INTERCEPT SHIELDS ON
                    </span>
                  </div>
                </div>
                <span className="text-[9px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded uppercase">
                  Connected
                </span>
              </div>

              {/* Channel 3 */}
              <div className="p-3.5 rounded-xl border border-white/5 bg-white/[0.01] flex items-center justify-between gap-3 opacity-55 hover:opacity-100 transition-all">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 bg-slate-650 rounded-full"></div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-350 mb-0.5 font-display">
                      Outlook Workspace
                    </h4>
                    <span className="text-[10px] font-mono text-slate-500 uppercase leading-none block">
                      STBY - PIN NOT CONFIGURED
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="text-[9px] font-mono bg-indigo-600 hover:bg-indigo-500 text-white px-2 py-1 rounded"
                >
                  Boot
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DEVELOPER PORT CONTROL: GOOGLE AI STUDIO CONFIG CONTROL PANEL */}
      <div className="glassmorphism-card rounded-2xl p-6 border border-white/5 relative overflow-hidden bg-slate-925/40 mt-2">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 pb-5 border-b border-white/5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono font-extrabold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2.5 py-0.5 rounded border border-indigo-500/15">
                AI Studio Console Integration
              </span>
            </div>
            <h3 className="text-base font-bold font-display text-white mt-1.5 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-400" />
              Google AI Studio Master Prompt & Protocol Console
            </h3>
            <p className="text-xs text-slate-400 font-sans mt-0.5 max-w-2xl">
              Equip your Google AI Studio Gemini model with this high-precision
              setup to achieve perfect, unified Full-Stack agentic planning and
              autonomous rescheduling.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(`
# ROLE
You are the "Last-Minute Life Saver" AI Agent. Your goal is to prevent students and professionals from failing their deadlines. You are proactive, analytical, and highly organized.

# CORE CAPABILITIES
1. Task Deconstruction: Every task must be broken into 3-5 micro-tasks.
2. Priority Analysis: Assign an updated overall stress score (0-100) based on deadlines and complexity.
3. Proactive Scheduling: Suggest specific time blocks based on a 24-hour day.
4. Motivational Coaching: Use a "firm but supportive" tone.
`);
                setCopiedMessage('Master System Prompt copied!');
                setTimeout(() => setCopiedMessage(null), 3000);
              }}
              type="button"
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-mono font-bold transition-all cursor-pointer shadow-md"
            >
              📋 Copy Master Prompt
            </button>
            <button
              onClick={() => {
                const schema = {
                  analysis:
                    'Brief 1-sentence analytical summary of the situation.',
                  stressScore: 85,
                  agentNudge:
                    "I've cleared your afternoon. Let's start with the research phase.",
                  tasksToAdd: [
                    {
                      title: 'Micro-task name',
                      category: 'Work',
                      deadline: 'Today, 5:00 PM',
                      stressScore: 90,
                      breakdownSteps: [
                        'Research & Draft',
                        'Design Solutions',
                        'Verify Outlines',
                      ],
                      estimatedMinutes: 60,
                    },
                  ],
                  tasksToModify: [],
                  timelineToReplace: [],
                  panicModeTriggered: true,
                  focusSprintTriggered: false,
                };
                navigator.clipboard.writeText(JSON.stringify(schema, null, 2));
                setCopiedMessage('JSON Schema copied!');
                setTimeout(() => setCopiedMessage(null), 3000);
              }}
              type="button"
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer"
            >
              📋 Copy Schema
            </button>
          </div>
        </div>

        {/* ACTIVE SPECS SUB-GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-950/50 border border-white/5 p-4 rounded-xl">
            <span className="text-[9px] font-mono text-slate-500 font-bold block mb-2 uppercase tracking-wide">
              SYSTEM INSTRUCTIONS SPEC SHEET
            </span>
            <pre className="text-[10px] font-mono text-slate-350 bg-slate-950/80 p-3 rounded-lg border border-white/5 h-64 overflow-y-auto leading-normal whitespace-pre-wrap select-all">
              {`# ROLE
You are the "Last-Minute Life Saver" AI Agent. Your goal is to prevent students and professionals from failing their deadlines. You are proactive, analytical, and highly organized.

# CORE CAPABILITIES
1. Task Deconstruction: Every task must be broken into 3-5 micro-tasks.
2. Priority Analysis: Assign a "Stress Score" (0-100) based on deadline and complexity.
3. Proactive Scheduling: Suggest specific time blocks based on a 24-hour day.
4. Motivational Coaching: Use a "firm but supportive" tone.

# RESPONSE FORMAT
You must ALWAYS respond in a structured JSON format so the React frontend can parse your data.

# RESPONSE SCHEMA CONTRACT:
{
  "analysis": "Brief 1-sentence summary of the situation.",
  "stressScore": 85,
  "agentNudge": "I've cleared your afternoon. Let's start with the research phase.",
  "tasksToAdd": [
    { "title": "Micro-task name", "category": "Work", "deadline": "Today, 5:00 PM", "stressScore": 90, "breakdownSteps": ["Task Step 1"] }
  ],
  "tasksToModify": [],
  "timelineToReplace": [],
  "panicModeTriggered": false,
  "focusSprintTriggered": false
}`}
            </pre>
          </div>

          <div className="bg-slate-950/50 border border-white/5 p-4 rounded-xl flex flex-col justify-between">
            <div>
              <span className="text-[9px] font-mono text-slate-500 font-bold block mb-2 uppercase tracking-wide">
                THE CORE REASONING MECHANISM
              </span>

              <div className="flex flex-col gap-3 mt-1.5">
                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-[10px] font-mono font-black text-indigo-400 shrink-0">
                    A
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">
                      Sentiment & Stress Evaluation
                    </h4>
                    <p className="text-[10.5px] text-slate-400 leading-normal mt-0.5">
                      Detects "High Stress" and parses panic keywords inside
                      incoming text to alter safety indices.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-[10px] font-mono font-black text-indigo-400 shrink-0">
                    B
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">
                      Auto Task Deconstructor
                    </h4>
                    <p className="text-[10.5px] text-slate-400 leading-normal mt-0.5">
                      Breaks general prompts (e.g. "Presentation") into 3-5
                      distinct steps with estimated completion times.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-[10px] font-mono font-black text-indigo-400 shrink-0">
                    C
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">
                      Autonomous Panic Rescheduling
                    </h4>
                    <p className="text-[10.5px] text-slate-400 leading-normal mt-0.5">
                      Scrapes low priority calendar sessions and defers them to
                      open massive 3-hour focus chunks.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-[10px] font-mono font-black text-indigo-400 shrink-0">
                    D
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">
                      Smart G-Workspace Cal Sync
                    </h4>
                    <p className="text-[10.5px] text-slate-400 leading-normal mt-0.5">
                      Fills empty gaps and writes real proposed slots directly
                      on the interactive layout for double-click confirmation.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[10.5px]">
              <span className="text-slate-500 font-mono text-[9px] font-bold uppercase">
                REASONING BACKEND TYPE:
              </span>
              <span className="text-emerald-400 font-bold uppercase bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                ✔ Active JSON Protocol
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
