import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Sparkles,
  RefreshCw,
  Flame,
  Trash2,
  CheckCircle,
  Circle,
  Brain,
  AlertOctagon,
  ListTodo,
  CalendarRange,
  Mic,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
export default function DashboardView({
  userName,
  onRenameUser,
  tasks,
  timeline,
  messages,
  isAgentThinking,
  agentStatus,
  panicActive,
  onSendMessage,
  onUpdateTask,
  onAddTask,
  onDeleteTask,
  onToggleComplete,
  onPanicTrigger,
  onSummaryTrigger,
  onFocusSprintTrigger,
  onTaskClick,
  onSyncCalendar,
}) {
  // Input fields for adding tasks
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDeadline, setTaskDeadline] = useState('Today, 6:00 PM');
  const [taskCategory, setTaskCategory] = useState('Work');
  const [taskStress, setTaskStress] = useState(70);
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);

  // Chat message input
  const [chatInput, setChatInput] = useState('');

  // Voice Assistance State
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [voiceError, setVoiceError] = useState(null);

  // Initialize Web Speech API
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';
      rec.onstart = () => { setIsListening(true); setVoiceError(null); };
      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setChatInput((prev) => (prev ? prev + ' ' + transcript : transcript));
        }
      };
      rec.onerror = (event) => {
        console.warn('Speech recognition parameter error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setVoiceError('Microphone permission blocked. Please grant mic permission in your browser.');
        } else if (event.error === 'no-speech') {
          setVoiceError('No speech detected. Please speak clearly.');
        } else {
          setVoiceError(`Speech error detected: ${event.error}`);
        }
      };
      rec.onend = () => { setIsListening(false); };
      setRecognition(rec);
    }
  }, []);

  const toggleListening = () => {
    if (!recognition) {
      setVoiceError('Speech Recognition is not supported on this browser.');
      return;
    }
    if (isListening) {
      recognition.stop();
    } else {
      try {
        recognition.start();
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  };

  // Daily Habits State
  const [habits, setHabits] = useState([]);
  const [loadingHabits, setLoadingHabits] = useState(false);

  // Auto Scroll Chat Ref
  const chatBottomRef = useRef(null);

  // Load Habits from backend API
  const fetchHabits = async () => {
    setLoadingHabits(true);
    try {
      const res = await fetch('/api/habits');
      if (res.ok) {
        const data = await res.json();
        setHabits(data);
      }
    } catch (err) {
      console.error('Failed to load daily habits from API:', err);
    } finally {
      setLoadingHabits(false);
    }
  };
  useEffect(() => {
    fetchHabits();
  }, []);

  // Sync scroll for coaching chat on new messages
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({
        behavior: 'smooth',
      });
    }
  }, [messages, isAgentThinking]);

  // Handle toggling a daily habit via backend API
  const handleToggleHabit = async (id) => {
    try {
      // Optimistic UI update
      setHabits((prev) =>
        prev.map((h) =>
          h.id === id
            ? {
                ...h,
                done: !h.done,
                streak: h.done ? h.streak : h.streak + 1,
              }
            : h,
        ),
      );
      const res = await fetch(`/api/habits/${id}/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          // Sync state with precise server calculations
          setHabits((prev) => prev.map((h) => (h.id === id ? data.habit : h)));
        }
      }
    } catch (err) {
      console.error('Failed to toggle habit:', err);
    }
  };
  const handleTaskSubmit = (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    onAddTask(
      taskTitle.trim(),
      Number(taskStress),
      taskDeadline.trim(),
      taskCategory.trim(),
    );
    setTaskTitle('');
    setTaskDeadline('Today, 6:00 PM');
    setTaskStress(70);
    setShowAddTaskForm(false);
  };
  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    onSendMessage(chatInput.trim());
    setChatInput('');
  };

  // Calculate active stress statistics (average stress score of uncompleted milestones)
  const activeTasks = tasks.filter((t) => !t.completed);
  const totalActiveTasksCount = activeTasks.length;
  const averageStressScore =
    totalActiveTasksCount > 0
      ? Math.round(
          activeTasks.reduce((acc, t) => acc + t.stressScore, 0) /
            totalActiveTasksCount,
        )
      : 0;
  const getStressRating = (score) => {
    if (score >= 80)
      return {
        label: 'CRITICAL PRESSURE',
        color: 'text-rose-400 border-rose-500/35 bg-rose-500/10',
      };
    if (score >= 50)
      return {
        label: 'MODERATE TENSION',
        color: 'text-amber-400 border-amber-500/35 bg-amber-500/10',
      };
    return {
      label: 'STABLE ATMOSPHERE',
      color: 'text-emerald-400 border-emerald-500/35 bg-emerald-500/10',
    };
  };
  const stressRating = getStressRating(averageStressScore);
  return (
    <div
      id="dashboard-view-container"
      className="flex flex-col gap-6 p-4 md:p-6 animate-fade-in relative z-10 w-full text-slate-100"
    >
      {/* WELCOME / ALERTS HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/40 border border-white/5 p-4 rounded-2xl backdrop-blur-md relative overflow-hidden">
        {/* Neon glow backdrop */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 blur-3xl rounded-full pointer-events-none" />

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl md:text-2xl font-black font-display text-white tracking-tight">
              Console Room:{' '}
              <span className="bg-gradient-to-r from-indigo-400 to-indigo-300 bg-clip-text text-transparent">
                Hello, {userName}
              </span>
            </h2>
            <button
              onClick={onRenameUser}
              className="text-[10px] font-mono font-bold uppercase tracking-wider bg-white/5 border border-white/10 hover:bg-white/10 text-indigo-400 px-2 py-0.5 rounded cursor-pointer transition-colors"
            >
              Rename
            </button>
          </div>
          <p className="text-xs text-slate-400 font-sans leading-normal">
            Operational dashboard initialized. Timeline defense matrices are
            active and calibrated.
          </p>
        </div>

        {/* Action Triggers Grid */}
        <div className="flex flex-wrap items-center gap-3.5 shrink-0 z-10">
          <button
            onClick={() =>
              onSyncCalendar(
                tasks.find((t) => !t.completed)?.id || tasks[0]?.id || '',
              )
            }
            className="px-4 py-2 bg-slate-950/80 hover:bg-slate-950 border border-white/10 text-slate-300 hover:text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 animate-spin-slow" />
            Sync Calendar
          </button>

          <button
            onClick={onPanicTrigger}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-lg cursor-pointer border ${panicActive ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-500/30 animate-pulse shadow-rose-500/10' : 'bg-slate-900 hover:bg-rose-950/30 text-rose-400 border-rose-500/15'}`}
          >
            <AlertOctagon className="w-4 h-4" />
            {panicActive ? 'Deactivate Panic' : 'Activate Panic'}
          </button>
        </div>
      </div>

      {/* THREE-COLUMN TELEMETRY GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Core Average Stress telemetry */}
        <div className="bg-slate-900/40 border border-white/5 p-4 rounded-2xl flex flex-col justify-between backdrop-blur-md">
          <div>
            <span className="text-[9px] font-mono font-black text-slate-500 uppercase tracking-widest block mb-1">
              Atmospheric Stress index
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-4xl font-black font-display text-white tracking-tight">
                {averageStressScore}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                / 100 max
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-mono">
            <span className="text-slate-500 font-bold uppercase">STATUS:</span>
            <span
              className={`px-2 py-0.5 rounded border font-bold uppercase ${stressRating.color}`}
            >
              {stressRating.label}
            </span>
          </div>
        </div>

        {/* Milestone Queue metrics */}
        <div className="bg-slate-900/40 border border-white/5 p-4 rounded-2xl flex flex-col justify-between backdrop-blur-md">
          <div>
            <span className="text-[9px] font-mono font-black text-slate-500 uppercase tracking-widest block mb-1">
              Active Milestones
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-4xl font-black font-display text-white tracking-tight">
                {totalActiveTasksCount}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                pending defense
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-mono">
            <span className="text-slate-500 font-bold uppercase">
              TRIAGE BURDEN:
            </span>
            <span className="text-indigo-400 font-bold">
              {totalActiveTasksCount > 3 ? 'HIGH CAPACITY' : 'STABLE QUEUE'}
            </span>
          </div>
        </div>

        {/* AI Shield status */}
        <div className="bg-slate-900/40 border border-white/5 p-4 rounded-2xl flex flex-col justify-between backdrop-blur-md">
          <div>
            <span className="text-[9px] font-mono font-black text-slate-500 uppercase tracking-widest block mb-1">
              AI Coach Status
            </span>
            <p className="text-sm font-semibold text-white truncate mt-1.5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 fill-emerald-400 animate-pulse shrink-0" />
              {agentStatus}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-mono">
            <span className="text-slate-500 font-bold uppercase">
              COGNITIVE RATIO:
            </span>
            <span className="text-emerald-400 font-bold">1:1 DEDICATED</span>
          </div>
        </div>
      </div>

      {/* MAIN LAYOUT: MILESTONES (LEFT) + DECOMPRESSION CHAT (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        {/* LEFT COLUMN: ACTIVE MILESTONES BOARD & DAILY HABITS */}
        <div className="lg:col-span-3 space-y-6">
          {/* ACTIVE MILESTONES BOARD */}
          <div className="bg-slate-900/40 border border-white/5 p-4 rounded-2xl backdrop-blur-md">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
              <h3 className="text-xs font-bold text-slate-300 font-display uppercase tracking-wider flex items-center gap-1.5">
                <ListTodo className="w-4.5 h-4.5 text-indigo-400" />
                Active Milestones Triage
              </h3>
              <button
                onClick={() => setShowAddTaskForm(!showAddTaskForm)}
                className="text-[10px] font-mono font-bold uppercase text-indigo-400 hover:text-indigo-300 tracking-wider flex items-center gap-1 cursor-pointer"
              >
                {showAddTaskForm ? '✕ Close Form' : '+ Add Milestone'}
              </button>
            </div>

            {/* In-line form to add milestone */}
            <AnimatePresence>
              {showAddTaskForm && (
                <motion.form
                  onSubmit={handleTaskSubmit}
                  initial={{
                    opacity: 0,
                    height: 0,
                  }}
                  animate={{
                    opacity: 1,
                    height: 'auto',
                  }}
                  exit={{
                    opacity: 0,
                    height: 0,
                  }}
                  className="bg-slate-950/60 p-4 border border-white/5 rounded-xl space-y-4 mb-4 overflow-hidden"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[8.5px] font-mono font-black text-slate-500 uppercase block mb-1">
                        Milestone Name
                      </label>
                      <input
                        type="text"
                        value={taskTitle}
                        onChange={(e) => setTaskTitle(e.target.value)}
                        placeholder="e.g., Deploy core DB middleware"
                        className="w-full px-3 py-1.5 bg-slate-900 text-xs rounded-lg border border-white/5 focus:outline-none focus:border-indigo-500 transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[8.5px] font-mono font-black text-slate-500 uppercase block mb-1">
                        Category
                      </label>
                      <input
                        type="text"
                        value={taskCategory}
                        onChange={(e) => setTaskCategory(e.target.value)}
                        placeholder="e.g., Code, Finance, Work"
                        className="w-full px-3 py-1.5 bg-slate-900 text-xs rounded-lg border border-white/5 focus:outline-none focus:border-indigo-500 transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[8.5px] font-mono font-black text-slate-500 uppercase block mb-1">
                        Target Deadline
                      </label>
                      <input
                        type="text"
                        value={taskDeadline}
                        onChange={(e) => setTaskDeadline(e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-900 text-xs rounded-lg border border-white/5 focus:outline-none focus:border-indigo-500 transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[8.5px] font-mono font-black text-slate-500 uppercase block mb-1">
                        Stress Impact Score ({taskStress})
                      </label>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={taskStress}
                        onChange={(e) => setTaskStress(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-indigo-500 mt-2.5"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-mono font-bold uppercase tracking-wider cursor-pointer shadow-md transition-all"
                    >
                      Analyze and Queue
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Milestones Listing */}
            {tasks.length === 0 ? (
              <div className="text-center py-12 text-slate-500 border border-dashed border-white/5 rounded-xl">
                <p className="text-xs">
                  Operational queue clear. No milestones currently logged.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1 custom-scrollbar-panel">
                {tasks.map((task) => {
                  const hasSteps =
                    task.breakdownSteps && task.breakdownSteps.length > 0;
                  const completedSteps = task.breakdownCompleted
                    ? task.breakdownCompleted.filter(Boolean).length
                    : 0;
                  const totalSteps = task.breakdownSteps
                    ? task.breakdownSteps.length
                    : 0;
                  return (
                    <div
                      key={task.id}
                      className={`p-3.5 rounded-xl border transition-all duration-150 flex items-start justify-between gap-4 group ${task.completed ? 'bg-slate-950/20 border-white/5 opacity-60' : 'bg-slate-950/40 border-white/5 hover:border-white/10'}`}
                    >
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        {/* Toggle Checkbox */}
                        <button
                          onClick={() => onToggleComplete(task.id)}
                          className="pt-0.5 shrink-0 text-slate-500 hover:text-indigo-400 cursor-pointer"
                        >
                          {task.completed ? (
                            <CheckCircle className="w-5 h-5 text-indigo-400" />
                          ) : (
                            <Circle className="w-5 h-5" />
                          )}
                        </button>

                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[8.5px] font-mono font-bold uppercase tracking-wider text-slate-400 bg-white/5 border border-white/5 px-2 py-0.5 rounded">
                              {task.category}
                            </span>

                            {!task.completed && (
                              <span
                                className={`text-[8.5px] font-mono font-bold px-1.5 py-0.5 rounded border ${task.stressScore >= 80 ? 'text-rose-400 border-rose-500/20 bg-rose-500/5' : task.stressScore >= 50 ? 'text-amber-400 border-amber-500/20 bg-amber-500/5' : 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5'}`}
                              >
                                {task.stressScore} Stress Weight
                              </span>
                            )}
                          </div>

                          <h4
                            onClick={() => onTaskClick(task)}
                            className={`text-xs font-bold leading-relaxed truncate tracking-tight cursor-pointer hover:text-indigo-400 transition-colors ${task.completed ? 'line-through text-slate-500' : 'text-slate-100'}`}
                          >
                            {task.title}
                          </h4>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10.5px] text-slate-500 font-mono font-bold">
                            <span className="flex items-center gap-1">
                              <CalendarRange className="w-3 h-3 text-slate-500" />
                              {task.deadline}
                            </span>
                            {hasSteps && (
                              <span className="text-indigo-400 flex items-center gap-1">
                                <Sparkles className="w-3 h-3 shrink-0" />
                                {completedSteps} of {totalSteps} Checklist steps
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {!task.completed && (
                          <button
                            onClick={() => onSyncCalendar(task.id)}
                            className="p-1.5 bg-white/5 hover:bg-white/10 text-indigo-400 hover:text-indigo-300 border border-white/5 rounded-lg text-[10px] font-mono font-bold uppercase transition-all cursor-pointer flex items-center gap-1"
                            title="Sync deadline to planner"
                          >
                            <CalendarRange className="w-3.5 h-3.5" />
                            Sync
                          </button>
                        )}
                        <button
                          onClick={() => onTaskClick(task)}
                          className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 hover:border-white/10 rounded-lg text-[10px] font-mono font-bold uppercase transition-all cursor-pointer"
                        >
                          Deconstruct
                        </button>
                        <button
                          onClick={() => onDeleteTask(task.id)}
                          className="p-1.5 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 rounded-lg transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* DAILY HABITS CHECKLIST PANEL */}
          <div className="bg-slate-900/40 border border-white/5 p-4 rounded-2xl backdrop-blur-md">
            <h3 className="text-xs font-bold text-slate-300 font-display uppercase tracking-wider flex items-center gap-1.5 mb-3 pb-2 border-b border-white/5">
              <Flame className="w-4.5 h-4.5 text-amber-500" />
              Interactive Daily Habits
            </h3>

            {loadingHabits && habits.length === 0 ? (
              <p className="text-center py-6 text-xs text-slate-500 animate-pulse font-mono">
                Syncing defense logs...
              </p>
            ) : habits.length === 0 ? (
              <p className="text-center py-6 text-xs text-slate-500">
                No habit triggers active.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {habits.map((habit) => (
                  <button
                    key={habit.id}
                    onClick={() => handleToggleHabit(habit.id)}
                    className={`p-3 rounded-xl border transition-all duration-150 flex items-center justify-between text-left cursor-pointer group relative overflow-hidden ${habit.done ? 'bg-emerald-500/5 border-emerald-500/15 text-slate-400' : 'bg-slate-950/30 border-white/5 hover:border-white/10 text-slate-200 hover:bg-slate-950/50'}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {habit.done ? (
                        <CheckCircle className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
                      ) : (
                        <Circle className="w-4.5 h-4.5 text-slate-500 group-hover:text-slate-400 shrink-0" />
                      )}
                      <span
                        className={`text-[11px] font-medium leading-tight truncate ${habit.done ? 'line-through text-slate-500' : ''}`}
                      >
                        {habit.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 bg-white/5 border border-white/5 px-2 py-0.5 rounded-lg text-[10.5px] font-mono font-bold text-slate-400 group-hover:text-amber-400 group-hover:border-amber-500/10 transition-colors">
                      <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500/10 shrink-0" />
                      {habit.streak || 0}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: AI DECOMPRESSION COACH CHAT PANEL */}
        <div className="lg:col-span-2">
          <div className="bg-slate-900/40 border border-white/5 rounded-2xl flex flex-col h-[585px] relative overflow-hidden backdrop-blur-md">
            {/* Chat Panel Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-slate-900/20">
              <div className="flex items-center gap-2">
                <div className="w-6.5 h-6.5 rounded-lg bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center">
                  <Brain className="w-4 h-4 text-indigo-400 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white tracking-tight">
                    AI Decompression Sentry
                  </h4>
                  <span className="text-[8px] font-mono text-slate-500 uppercase font-black block">
                    Active connection • Online
                  </span>
                </div>
              </div>
            </div>

            {/* Chat Feed Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar-panel">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3.5">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-200">
                      Timeline Defense Room Open
                    </h5>
                    <p className="text-[10.5px] text-slate-400 max-w-xs leading-normal mt-1">
                      Ask me to "Deconstruct presentation", "Summarize my day",
                      or "I need to schedule deep work buffers".
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isAssistant =
                    msg.sender === 'assistant' || msg.sender === 'agent';
                  const isSystem = msg.sender === 'system';
                  if (isSystem) {
                    return (
                      <div key={index} className="flex justify-center">
                        <span className="text-[9.5px] font-mono text-slate-500 bg-white/5 border border-white/5 px-2.5 py-1 rounded-lg">
                          {msg.text}
                        </span>
                      </div>
                    );
                  }
                  return (
                    <div
                      key={index}
                      className={`flex ${isAssistant ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl p-3 border leading-relaxed text-xs shadow-md ${isAssistant ? 'bg-indigo-950/20 border-indigo-500/15 text-slate-200 rounded-tl-sm' : 'bg-indigo-600/15 border-indigo-500/25 text-white rounded-tr-sm'}`}
                      >
                        {/* Sender Label */}
                        <span className="text-[8px] font-mono font-black text-slate-500 uppercase block mb-1">
                          {isAssistant ? 'Sentry Assistant' : 'Defense Command'}
                        </span>

                        {/* Message body text */}
                        <p className="font-sans whitespace-pre-wrap leading-normal">
                          {msg.text}
                        </p>

                        {/* Timestamp */}
                        <span className="text-[8px] font-mono text-slate-500 block text-right mt-1.5">
                          {msg.timestamp || 'Just Now'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Loader Thinking State */}
              {isAgentThinking && (
                <div className="flex justify-start">
                  <div className="bg-indigo-950/20 border border-indigo-500/15 rounded-2xl rounded-tl-sm p-3.5 flex items-center gap-2 text-slate-400 text-xs shadow-md">
                    <div className="flex gap-1 items-center">
                      <div
                        className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"
                        style={{
                          animationDelay: '0ms',
                        }}
                      />
                      <div
                        className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"
                        style={{
                          animationDelay: '150ms',
                        }}
                      />
                      <div
                        className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"
                        style={{
                          animationDelay: '300ms',
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-mono font-black text-indigo-400 uppercase tracking-widest pl-1">
                      Reasoning...
                    </span>
                  </div>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* Quick Action presets */}
            <div className="px-4 py-2 bg-slate-900/15 border-t border-white/5 flex flex-wrap gap-1.5">
              <button
                onClick={onSummaryTrigger}
                className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/5 text-[9.5px] font-mono font-bold text-indigo-400 hover:text-indigo-300 rounded-lg uppercase tracking-wider cursor-pointer"
              >
                📝 Summarize Day
              </button>
              <button
                onClick={onFocusSprintTrigger}
                className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/5 text-[9.5px] font-mono font-bold text-indigo-400 hover:text-indigo-300 rounded-lg uppercase tracking-wider cursor-pointer"
              >
                🔥 Start Focus Sprint
              </button>
            </div>

            {/* VOICE ASSISTANCE ERROR BANNER */}
            {voiceError && (
              <div className="mx-4 mb-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-200 font-mono flex items-start justify-between gap-2.5 shrink-0">
                <div className="flex gap-2">
                  <span className="text-amber-400 font-black">ℹ️</span>
                  <span className="leading-relaxed">{voiceError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setVoiceError(null)}
                  className="text-slate-500 hover:text-slate-200 cursor-pointer font-black text-xs px-1"
                >
                  ×
                </button>
              </div>
            )}

            {/* Prompt input field */}
            <form
              onSubmit={handleChatSubmit}
              className="p-3 border-t border-white/5 bg-slate-900/20 flex gap-2"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={isListening ? "🎤 Listening to your voice..." : "Ask Sentry to organize or Calibrate..."}
                className={`flex-1 px-3 py-2 bg-slate-950 text-xs rounded-xl border transition-all duration-300 focus:outline-none ${isListening ? 'border-rose-500/80 text-rose-300 bg-rose-950/10 ring-2 ring-rose-500/20 placeholder:text-rose-400/70' : 'border-white/5 text-slate-200 focus:border-indigo-500 placeholder:text-slate-500'}`}
                disabled={isAgentThinking}
              />
              <button
                type="button"
                onClick={toggleListening}
                disabled={isAgentThinking}
                className={`px-3 py-2 rounded-xl border flex items-center justify-center shrink-0 cursor-pointer transition-all duration-300 ${isListening ? 'bg-rose-500/15 border-rose-500/40 text-rose-400 animate-pulse shadow-md shadow-rose-500/20' : 'bg-slate-920 border-slate-900 hover:border-indigo-500/30 text-slate-400 hover:text-indigo-400'}`}
                title={isListening ? 'Click to stop dictation' : 'Click to dictate command via Microphone'}
              >
                {isListening ? <Mic className="w-4 h-4 animate-bounce text-rose-450" /> : <Mic className="w-4 h-4" />}
              </button>
              <button
                type="submit"
                disabled={isAgentThinking || !chatInput.trim()}
                className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl transition-all shadow-md cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
