import React from 'react';
import { X, CheckSquare, Square, Sparkles, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
export default function TaskBreakdownModal({ task, onClose, onUpdateTask }) {
  if (!task) return null;
  const totalSteps = task.breakdownSteps ? task.breakdownSteps.length : 0;
  const completedStepsCount = task.breakdownCompleted
    ? task.breakdownCompleted.filter(Boolean).length
    : 0;
  const completionPercentage =
    totalSteps > 0 ? Math.round((completedStepsCount / totalSteps) * 100) : 0;
  const handleToggleStep = (index) => {
    if (!task.breakdownCompleted || !task.breakdownSteps) return;
    const updatedCompleted = [...task.breakdownCompleted];
    updatedCompleted[index] = !updatedCompleted[index];

    // If all micro-steps are completed, let's mark the entire task completed, and vice-versa
    const allDone = updatedCompleted.every(Boolean);
    const updatedTask = {
      ...task,
      breakdownCompleted: updatedCompleted,
      completed: allDone ? true : task.completed,
    };
    onUpdateTask(updatedTask);
  };
  const getStressBadgeClass = (score) => {
    if (score >= 80) return 'bg-rose-500/10 text-rose-400 border-rose-500/35';
    if (score >= 50)
      return 'bg-amber-500/10 text-amber-400 border-amber-500/35';
    return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/35';
  };
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
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
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{
            scale: 0.95,
            opacity: 0,
            y: 15,
          }}
          animate={{
            scale: 1,
            opacity: 1,
            y: 0,
          }}
          exit={{
            scale: 0.95,
            opacity: 0,
            y: 15,
          }}
          className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl overflow-hidden relative z-10 shadow-2xl p-6 text-slate-100"
        >
          {/* Top colored stripe */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 to-violet-500" />

          {/* Modal Header */}
          <div className="flex items-start justify-between gap-4 mb-4 pb-3 border-b border-white/5">
            <div className="space-y-1">
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded">
                {task.category || 'Triage Task'}
              </span>
              <h3 className="text-sm font-bold text-white font-display leading-snug tracking-tight mt-1">
                {task.title}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-300 transition-colors p-1 hover:bg-white/5 rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body stats block */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-slate-950/40 border border-white/5 p-3 rounded-xl">
              <span className="text-[8.5px] font-mono font-black text-slate-500 uppercase tracking-wider block">
                Stress Level
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                <span
                  className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${getStressBadgeClass(task.stressScore)}`}
                >
                  {task.stressScore} / 100
                </span>
              </div>
            </div>
            <div className="bg-slate-950/40 border border-white/5 p-3 rounded-xl">
              <span className="text-[8.5px] font-mono font-black text-slate-500 uppercase tracking-wider block">
                Time Allocation
              </span>
              <span className="text-xs font-bold text-slate-200 mt-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                {task.estimatedMinutes} mins
              </span>
            </div>
          </div>

          {/* Progression Header */}
          <div className="space-y-1.5 mb-5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                Tactical Checklist
              </span>
              <span className="font-mono font-bold text-indigo-400">
                {completedStepsCount} of {totalSteps} done (
                {completionPercentage}%)
              </span>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-slate-950/60 rounded-full overflow-hidden border border-white/5">
              <motion.div
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                initial={{
                  width: 0,
                }}
                animate={{
                  width: `${completionPercentage}%`,
                }}
                transition={{
                  duration: 0.35,
                  ease: 'easeOut',
                }}
              />
            </div>
          </div>

          {/* Micro-steps Checklist */}
          {totalSteps === 0 ? (
            <div className="text-center py-6 text-slate-500 border border-dashed border-white/5 rounded-xl">
              <p className="text-xs">
                No micro-steps generated yet. Feed this milestone to our coach
                to deconstruct.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1 custom-scrollbar-panel">
              {task.breakdownSteps.map((step, idx) => {
                const isDone = task.breakdownCompleted
                  ? task.breakdownCompleted[idx]
                  : false;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleToggleStep(idx)}
                    className={`w-full text-left p-3 rounded-xl border transition-all duration-150 flex items-start gap-3 group cursor-pointer ${isDone ? 'bg-emerald-500/5 border-emerald-500/15 text-slate-400' : 'bg-slate-950/20 border-white/5 hover:border-white/10 text-slate-200 hover:bg-slate-950/40'}`}
                  >
                    <div className="shrink-0 mt-0.5">
                      {isDone ? (
                        <CheckSquare className="w-4.5 h-4.5 text-emerald-400" />
                      ) : (
                        <Square className="w-4.5 h-4.5 text-slate-500 group-hover:text-slate-400" />
                      )}
                    </div>
                    <span
                      className={`text-[11.5px] leading-relaxed transition-all ${isDone ? 'line-through text-slate-500' : ''}`}
                    >
                      {step}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Info Banner */}
          <div className="bg-slate-950/50 border border-white/5 p-3 rounded-xl flex items-start gap-2.5 mt-5">
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5 animate-pulse" />
            <p className="text-[10px] text-slate-400 leading-normal">
              Box-checking micro-steps triggers defensive state updates. If all
              steps are complete, the milestone is flagged as completed.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
