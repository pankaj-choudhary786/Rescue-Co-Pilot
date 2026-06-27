import React from 'react';
import {
  Terminal,
  Calendar,
  Sliders,
  Shield,
  LogOut,
  MessageSquareCode,
  Circle,
} from 'lucide-react';
export default function Sidebar({
  activeTab,
  onTabChange,
  onLogout,
  agentStatus,
}) {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Control Console',
      icon: Terminal,
      desc: 'Central monitoring and triage',
    },
    {
      id: 'agent',
      label: 'Decompression Agent',
      icon: MessageSquareCode,
      desc: 'Coaching and breathing sprint',
    },
    {
      id: 'calendar',
      label: 'Tactical Planner',
      icon: Calendar,
      desc: 'Timeline defense & buffers',
    },
    {
      id: 'settings',
      label: 'Suite Config',
      icon: Sliders,
      desc: 'Threshold factors & overrides',
    },
  ];
  return (
    <div
      id="app-sidebar"
      className="h-full flex flex-col justify-between text-slate-100 font-sans select-none"
    >
      <div className="space-y-6">
        {/* Branding */}
        <div className="flex items-center gap-2 px-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-center">
            <Shield className="w-4.5 h-4.5 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xs font-black tracking-wider text-white">
              RESCUE CORE
            </h1>
            <span className="text-[8px] font-mono tracking-widest text-indigo-400 block uppercase font-bold">
              Shield Active
            </span>
          </div>
        </div>

        {/* System Active Status Indicator */}
        <div className="bg-slate-950/60 border border-white/5 p-3 rounded-xl">
          <div className="flex items-center gap-1.5 mb-1">
            <Circle className="w-2 h-2 text-emerald-400 fill-emerald-400 animate-pulse" />
            <span className="text-[9px] font-mono text-slate-400 uppercase font-bold tracking-wider">
              Coach Connection
            </span>
          </div>
          <p className="text-[10.5px] font-medium text-slate-200 truncate leading-snug">
            {agentStatus || 'Online'}
          </p>
        </div>

        {/* Navigation items */}
        <nav className="flex flex-col gap-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full text-left p-3 rounded-xl border transition-all duration-200 cursor-pointer flex items-start gap-3 relative overflow-hidden group ${isSelected ? 'bg-indigo-600/10 border-indigo-500/30 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]' : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
              >
                {/* Visual Active Glowing Side-Bar Accent */}
                {isSelected && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />
                )}

                <Icon
                  className={`w-5 h-5 mt-0.5 shrink-0 transition-transform group-hover:scale-105 ${isSelected ? 'text-indigo-400' : 'text-slate-400'}`}
                />

                <div className="min-w-0">
                  <span className="text-xs font-bold block">{item.label}</span>
                  <span className="text-[9.5px] text-slate-500 block truncate group-hover:text-slate-400 font-medium transition-colors mt-0.5">
                    {item.desc}
                  </span>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Logout / Session Disconnect Section */}
      <div className="pt-4 border-t border-white/5">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900/60 hover:bg-rose-950/20 text-slate-400 hover:text-rose-400 border border-white/5 hover:border-rose-500/10 rounded-xl text-xs font-semibold font-mono tracking-wide uppercase transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Disconnect Core
        </button>
      </div>
    </div>
  );
}
