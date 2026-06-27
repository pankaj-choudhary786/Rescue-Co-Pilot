import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  Clock,
  ShieldAlert,
  Sparkles,
  BookOpen,
  Coffee,
  MessageSquare,
  X,
  AlertTriangle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
export default function CalendarView({ timeline, onAddBlock }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('10:00 AM - 11:00 AM');
  const [duration, setDuration] = useState('1 hr');
  const [type, setType] = useState('deep-work');
  const [accentColor, setAccentColor] = useState('indigo');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState('');
  const getTypeIcon = (blockType) => {
    switch (blockType) {
      case 'deep-work':
        return BookOpen;
      case 'shielded':
        return Sparkles;
      case 'decompression':
        return Coffee;
      case 'meeting':
        return MessageSquare;
      default:
        return Clock;
    }
  };
  const getAccentClass = (color) => {
    switch (color) {
      case 'indigo':
        return {
          bg: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400',
          badge: 'bg-indigo-500/25 text-indigo-300 border-indigo-500/20',
          bullet: 'bg-indigo-400 shadow-[0_0_8px_#6366f1]',
        };
      case 'emerald':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          badge: 'bg-emerald-500/25 text-emerald-300 border-emerald-500/20',
          bullet: 'bg-emerald-400 shadow-[0_0_8px_#10b981]',
        };
      case 'amber':
        return {
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
          badge: 'bg-amber-500/25 text-amber-300 border-amber-500/20',
          bullet: 'bg-amber-400 shadow-[0_0_8px_#f59e0b]',
        };
      case 'rose':
        return {
          bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
          badge: 'bg-rose-500/25 text-rose-300 border-rose-500/20',
          bullet: 'bg-rose-400 shadow-[0_0_8px_#f43f5e]',
        };
      default:
        return {
          bg: 'bg-slate-500/10 border-white/10 text-slate-400',
          badge: 'bg-slate-500/25 text-slate-300 border-white/10',
          bullet: 'bg-slate-400 shadow-none',
        };
    }
  };
  const handleFormSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    if (!title.trim() || !time.trim() || !duration.trim()) {
      setFormError('Please fill in a title, time range, and duration.');
      return;
    }
    onAddBlock({
      title: title.trim(),
      time: time.trim(),
      duration: duration.trim(),
      type,
      accentColor,
      description: description.trim(),
    });

    // Reset Form
    setTitle('');
    setTime('10:00 AM - 11:00 AM');
    setDuration('1 hr');
    setType('deep-work');
    setAccentColor('indigo');
    setDescription('');
    setShowAddForm(false);
  };
  return (
    <div
      id="calendar-view-container"
      className="flex flex-col gap-6 p-4 md:p-6 animate-fade-in relative z-10 w-full text-slate-100"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold font-display text-white tracking-tight flex items-center gap-2">
            <Calendar className="w-6 h-6 text-indigo-400" />
            Tactical Planner
          </h2>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Visualize scheduled buffers and configure autonomic timeline defense
            shields.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          Schedule Buffer
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Timeline Visualization */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900/40 border border-white/5 p-4 rounded-2xl relative overflow-hidden backdrop-blur-md">
            <h3 className="text-xs font-bold text-slate-300 font-display mb-4 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-400" />
              Defense Timeline (Today)
            </h3>

            {timeline.length === 0 ? (
              <div className="text-center py-12 text-slate-500 border border-dashed border-white/5 rounded-xl">
                <p className="text-xs">No blocks scheduled for today.</p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="mt-2 text-xs font-bold font-mono text-indigo-400 hover:text-indigo-300 uppercase cursor-pointer"
                >
                  Create initial block
                </button>
              </div>
            ) : (
              <div className="relative pl-6 border-l border-white/10 space-y-5 ml-2 py-1">
                {timeline.map((block, index) => {
                  const Icon = getTypeIcon(block.type);
                  const style = getAccentClass(block.accentColor);
                  return (
                    <div key={block.id} className="relative group">
                      {/* Timeline Dot Indicator */}
                      <div
                        className={`absolute -left-[30px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-slate-900 flex items-center justify-center ${style.bullet}`}
                      />

                      {/* Timeline Block Card */}
                      <div
                        className={`p-4 rounded-xl border backdrop-blur-sm transition-all hover:bg-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 ${style.bg}`}
                      >
                        <div className="space-y-1.5 min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`text-[9px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded border ${style.badge} flex items-center gap-1`}
                            >
                              <Icon className="w-3 h-3" />
                              {block.type.replace('-', ' ')}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 font-bold flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {block.time} ({block.duration})
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-white tracking-tight truncate group-hover:text-indigo-300 transition-colors">
                            {block.title}
                          </h4>
                          {block.description && (
                            <p className="text-xs text-slate-400 leading-relaxed font-sans line-clamp-2">
                              {block.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar / Informational Panel */}
        <div className="space-y-4">
          <div className="bg-slate-900/40 border border-white/5 p-4 rounded-2xl backdrop-blur-md">
            <h3 className="text-xs font-bold text-slate-300 font-display mb-3 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
              Timeline Autonomic Rules
            </h3>
            <div className="space-y-3.5 text-[11px] text-slate-400 leading-normal">
              <div className="flex gap-2.5 items-start">
                <div className="w-5 h-5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-mono font-bold shrink-0">
                  1
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">
                    Shield Protection
                  </h4>
                  <p className="mt-0.5 text-slate-400">
                    Scheduled <strong>AI Shielded Blocks</strong> automatically
                    put notifications in redirection mode.
                  </p>
                </div>
              </div>
              <div className="flex gap-2.5 items-start">
                <div className="w-5 h-5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-mono font-bold shrink-0">
                  2
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">
                    Decompression Autopilot
                  </h4>
                  <p className="mt-0.5 text-slate-400">
                    If localized stress climbs above 80%, the Coach
                    automatically schedules a 30m Decompression Block.
                  </p>
                </div>
              </div>
              <div className="flex gap-2.5 items-start">
                <div className="w-5 h-5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-mono font-bold shrink-0">
                  3
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">
                    Defensive Buffer Slots
                  </h4>
                  <p className="mt-0.5 text-slate-400">
                    Add personal buffers to protect your calendar from
                    downstream scheduling encroachments.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SCHEDULE BUFFER MODAL DIALOG */}
      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              onClick={() => setShowAddForm(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            <motion.div
              initial={{
                scale: 0.95,
                opacity: 0,
                y: 20,
              }}
              animate={{
                scale: 1,
                opacity: 1,
                y: 0,
              }}
              exit={{
                scale: 0.95,
                opacity: 0,
                y: 20,
              }}
              className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl overflow-hidden relative z-10 shadow-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5 font-display">
                  <Calendar className="w-4.5 h-4.5 text-indigo-400" />
                  Schedule Defense Buffer
                </h3>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                {formError && (
                  <div className="bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs p-3 rounded-lg flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    {formError}
                  </div>
                )}

                <div>
                  <label className="text-[9px] font-mono font-bold text-slate-500 uppercase block mb-1">
                    Activity Name / Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Refactoring Database layer..."
                    className="w-full px-3 py-2 bg-slate-950 text-slate-100 text-xs rounded-xl border border-white/5 focus:outline-none focus:border-indigo-500 transition-colors"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-mono font-bold text-slate-500 uppercase block mb-1">
                      Time Range
                    </label>
                    <input
                      type="text"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      placeholder="12:00 PM - 01:00 PM"
                      className="w-full px-3 py-2 bg-slate-950 text-slate-100 text-xs rounded-xl border border-white/5 focus:outline-none focus:border-indigo-500 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-mono font-bold text-slate-500 uppercase block mb-1">
                      Duration
                    </label>
                    <input
                      type="text"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="1 hr"
                      className="w-full px-3 py-2 bg-slate-950 text-slate-100 text-xs rounded-xl border border-white/5 focus:outline-none focus:border-indigo-500 transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-mono font-bold text-slate-500 uppercase block mb-1">
                      Shield Type
                    </label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 text-slate-100 text-xs rounded-xl border border-white/5 focus:outline-none focus:border-indigo-500 transition-colors"
                    >
                      <option value="deep-work">Deep Work</option>
                      <option value="shielded">AI Shielded</option>
                      <option value="decompression">Decompression</option>
                      <option value="meeting">Team Meeting</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-mono font-bold text-slate-500 uppercase block mb-1">
                      Accent Color
                    </label>
                    <select
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 text-slate-100 text-xs rounded-xl border border-white/5 focus:outline-none focus:border-indigo-500 transition-colors"
                    >
                      <option value="indigo">Indigo Glow</option>
                      <option value="emerald">Emerald Shield</option>
                      <option value="amber">Amber Decompress</option>
                      <option value="rose">Rose Priority</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-mono font-bold text-slate-500 uppercase block mb-1">
                    Activity Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide context or rules for defense block..."
                    className="w-full px-3 py-2 bg-slate-950 text-slate-100 text-xs rounded-xl border border-white/5 focus:outline-none focus:border-indigo-500 transition-colors h-16 resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 text-xs pt-2 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-3.5 py-2 rounded-xl hover:bg-white/5 text-slate-400 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold font-mono tracking-wider uppercase cursor-pointer"
                  >
                    Lock Schedule
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
