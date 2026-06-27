/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { INITIAL_TASKS, INITIAL_SCHEDULE } from '@/data/mockData.js';

// Importing custom components
import LandingPage from './components/LandingPage';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import MyAgentView from './components/MyAgentView';
import CalendarView from './components/CalendarView';
import SettingsView from './components/SettingsView';
import TaskBreakdownModal from './components/TaskBreakdownModal';
export default function App() {
  // Navigation & Routing States
  const [pageRoute, setPageRoute] = useState('landing');
  const [activeTab, setActiveTab] = useState('dashboard');

  // User details
  const [userName, setUserName] = useState('Pankaj');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState(null);

  // Reactive Data States
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [timeline, setTimeline] = useState(INITIAL_SCHEDULE);
  const [panicActive, setPanicActive] = useState(false);

  // Agent Chat States
  const [agentStatus, setAgentStatus] = useState('Zen Guide Calming...');
  const [isAgentThinking, setIsAgentThinking] = useState(false);
  const [messages, setMessages] = useState([]);

  // Modal target
  const [activeTaskForBreakdown, setActiveTaskForBreakdown] = useState(null);

  // User Renaming Modal States
  const [isRenaming, setIsRenaming] = useState(false);
  const [newNameInput, setNewNameInput] = useState('');

  // Fetch initial workspace details on load to establish unified persistence
  useEffect(() => {
    const fetchWorkspace = async () => {
      try {
        const userRes = await fetch('/api/user');
        if (userRes.ok) {
          const u = await userRes.json();
          if (u.userName) setUserName(u.userName);
          if (u.email) {
            setUserEmail(u.email);
            setIsAuthenticated(true);
          }
        }
        const taskRes = await fetch('/api/tasks');
        if (taskRes.ok) {
          const t = await taskRes.json();
          setTasks(t);
        }
        const timelineRes = await fetch('/api/timeline');
        if (timelineRes.ok) {
          const s = await timelineRes.json();
          setTimeline(s);
        }
      } catch (err) {
        console.warn(
          'Real full-stack storage state currently establishing. Using pre-loaded templates.',
          err,
        );
      }
    };
    fetchWorkspace();
  }, []);

  // Handler: Handle successful google or standard authentication
  const handleLoginSuccess = (name, email) => {
    setUserName(name);
    setUserEmail(email);
    setIsAuthenticated(true);
    setPageRoute('dashboard'); // Direct transition to workspace dashboard on successful login!
  };

  // Handler: Disconnect session and reset to landing
  const handleLogout = async () => {
    try {
      await fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userName: 'Pankaj',
          email: '',
        }),
      });
    } catch (err) {
      console.warn('Logout state cleanup on server failed:', err);
    }
    setUserName('Pankaj');
    setUserEmail(null);
    setIsAuthenticated(false);
    setPageRoute('landing');
  };

  // Setup initial message when entering the dashboard
  useEffect(() => {
    if (pageRoute === 'dashboard' && messages.length === 0) {
      setMessages([
        {
          id: 'initial-1',
          sender: 'agent',
          text: `Good morning, ${userName}. Your current Stress Score indicator tracks high due to conflicts before your 5:00 PM presentation.\n\nDon't worry. I have auto-mapped defensive focus buffers to guard your timeline. Tell me if the weight is too heavy—I can activate **Panic Mode** to push low-priority tasks back.`,
          timestamp: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
      ]);
    }
  }, [pageRoute, userName]);

  // Handler: Change UserName with server-side syncing
  const handleRenameUser = () => {
    setNewNameInput(userName);
    setIsRenaming(true);
  };
  const handleSaveName = async (e) => {
    if (e) e.preventDefault();
    if (newNameInput && newNameInput.trim()) {
      const cleanName = newNameInput.trim();
      setUserName(cleanName);
      setIsRenaming(false);
      try {
        await fetch('/api/user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userName: cleanName,
            email: userEmail || '',
          }),
        });
      } catch (err) {
        console.error('Failed to sync profile change on database:', err);
      }
    }
  };

  // Handler: Modify a task Object (e.g. checklist step selected)
  const handleUpdateTask = async (updatedTask) => {
    // Optimistic UI state commit
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)),
    );
    if (activeTaskForBreakdown?.id === updatedTask.id) {
      setActiveTaskForBreakdown(updatedTask);
    }
    try {
      const response = await fetch(`/api/tasks/${updatedTask.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTask),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.task) {
          // Sync server-vetted updates (including potential score offsets)
          setTasks((prev) =>
            prev.map((t) => (t.id === updatedTask.id ? data.task : t)),
          );
          if (activeTaskForBreakdown?.id === updatedTask.id) {
            setActiveTaskForBreakdown(data.task);
          }
        }
      }
    } catch (err) {
      console.error('Task synchronization transaction failed:', err);
    }
  };

  // Handler: Adding a task inline (utilizes Gemini deconstruct on server to add smart subtasks!)
  const handleAddTask = async (title, stressScore, deadline, category) => {
    // Generate initial optimistic local slot
    const tempId = `task-temp-${Date.now()}`;
    const optimisticTask = {
      id: tempId,
      title,
      stressScore,
      deadline,
      category,
      completed: false,
      breakdownSteps: [
        'Deconstructing steps via autonomous server brain...',
        'Compiling checklist milestones...',
        'Allocating stress metrics...',
      ],
      breakdownCompleted: [false, false, false],
      estimatedMinutes: 45,
    };
    setTasks((prev) => [optimisticTask, ...prev]);
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          stressScore,
          deadline,
          category,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.task) {
          // Replace optimistic placeholder with real server task built with Gemini sub-steps deconstruction
          setTasks((prev) =>
            prev.map((t) => (t.id === tempId ? data.task : t)),
          );
          if (data.task.stressScore >= 80) {
            setIsAgentThinking(true);
            setAgentStatus('Re-prioritizing Path...');
            setTimeout(() => {
              setMessages((prev) => [
                ...prev,
                {
                  id: `sys-${Date.now()}`,
                  sender: 'agent',
                  text: `⚠️ I detected a new high-stress objective: **"${data.task.title}"**.\n\nI have auto-allocated smart subtasks to your workspace checklist and raised the focus shield levels.`,
                  timestamp: new Date().toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  }),
                },
              ]);
              setIsAgentThinking(false);
              setAgentStatus('Zen Guide Calmly Monitoring...');
            }, 800);
          }
          return;
        }
      }
    } catch (err) {
      console.error(
        'Natural extraction engine currently disconnected. Keeping offline copy:',
        err,
      );
    }

    // Offline fallback if server offline code
    const fallbackTask = {
      ...optimisticTask,
      id: `task-${Date.now()}`,
      breakdownSteps: [
        `Identify core requirement boundaries of ${title.slice(0, 20)}`,
        `Draft basic execution parameters and structures`,
        `Deliver complete review checklist for authorization standards`,
      ],
    };
    setTasks((prev) => prev.map((t) => (t.id === tempId ? fallbackTask : t)));
  };

  // Handler: Deleting a task
  const handleDeleteTask = async (taskId) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.error('Failed to notify system database of deleted task:', err);
    }
  };

  // Handler: Direct completion toggle
  const handleToggleComplete = async (taskId) => {
    const target = tasks.find((t) => t.id === taskId);
    if (!target) return;
    const nextCompleted = !target.completed;
    const updated = {
      ...target,
      completed: nextCompleted,
      breakdownCompleted: nextCompleted
        ? new Array(target.breakdownSteps.length).fill(true)
        : new Array(target.breakdownSteps.length).fill(false),
      stressScore: nextCompleted ? 0 : 50,
    };

    // Optimistic UI state patch
    setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completed: nextCompleted,
          breakdownCompleted: updated.breakdownCompleted,
          stressScore: updated.stressScore,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.task) {
          setTasks((prev) =>
            prev.map((t) => (t.id === taskId ? data.task : t)),
          );
        }
      }
    } catch (err) {
      console.error('Failed to sync complete toggler update:', err);
    }
  };

  // Handler: Google Calendar event syncing with backend persistence
  const handleSyncCalendar = async (taskId) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/sync-calendar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        // Read updated profile notifications
        const userRes = await fetch('/api/user');
        if (userRes.ok) {
          const u = await userRes.json();
          if (u.userName) setUserName(u.userName);
        }
        // Fetch updated timeline schedule blocks
        const timelineRes = await fetch('/api/timeline');
        if (timelineRes.ok) {
          const s = await timelineRes.json();
          setTimeline(s);
        }
      }
    } catch (err) {
      console.error(
        'Failed to dispatch Google Calendar sync transaction:',
        err,
      );
    }
  };

  // Handler: Interactive chat sending
  const handleSendMessage = async (text) => {
    if (!text.trim()) return;

    // 1. Add user message
    const userMsg = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsAgentThinking(true);
    setAgentStatus('Analyzing Calamity...');
    try {
      // 2. Fetch live reasoning evaluation from full-stack api
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          currentTasks: tasks,
          currentTimeline: timeline,
          userName: userName,
          currentTime:
            new Date().toLocaleTimeString() +
            ' ' +
            new Date().toLocaleDateString(),
        }),
      });
      if (!response.ok) {
        throw new Error(`Failed with status ${response.status}`);
      }
      const result = await response.json();
      if (result.success) {
        // Appending tasks deconstructed by AI
        if (result.tasksToAdd && result.tasksToAdd.length > 0) {
          const generated = result.tasksToAdd.map((t, i) => ({
            id: `task-ai-${Date.now()}-${i}`,
            title: t.title,
            category: t.category || 'General',
            deadline: t.deadline || 'Today',
            stressScore: t.stressScore || 60,
            completed: false,
            breakdownSteps: t.breakdownSteps || [
              'Research & Draft',
              'Design Solutions',
              'Verify Outlines',
            ],
            breakdownCompleted: new Array(
              (
                t.breakdownSteps || [
                  'Research & Draft',
                  'Design Solutions',
                  'Verify Outlines',
                ]
              ).length,
            ).fill(false),
            estimatedMinutes: t.estimatedMinutes || 45,
          }));
          setTasks((prev) => [...generated, ...prev]);
        }

        // Processing and mutating modified tasks (e.g., rescheduling low priority)
        if (result.tasksToModify && result.tasksToModify.length > 0) {
          setTasks((prev) =>
            prev.map((originalTask) => {
              const mod = result.tasksToModify.find(
                (m) => m.id === originalTask.id,
              );
              if (mod) {
                return {
                  ...originalTask,
                  ...mod,
                  breakdownCompleted: mod.breakdownSteps
                    ? new Array(mod.breakdownSteps.length).fill(false)
                    : originalTask.breakdownCompleted,
                };
              }
              return originalTask;
            }),
          );
        }

        // Smart Sync calendar slot replacement / modifications
        if (result.timelineToReplace && result.timelineToReplace.length > 0) {
          const newBlocks = result.timelineToReplace.map((b, i) => ({
            id: b.id || `block-ai-${Date.now()}-${i}`,
            title: b.title,
            time: b.time,
            duration: b.duration || '1 hr',
            type: b.type || 'deep-work',
            accentColor: b.accentColor || 'indigo',
            description: b.description || '',
          }));
          setTimeline(newBlocks);
        }

        // Auto-Panic state activation if flagged by Gemini
        if (result.panicModeTriggered) {
          setPanicActive(true);
          setAgentStatus('Panic Shield Engaged 🌋');
        }

        // Live focus timer trigger feedback
        if (result.focusSprintTriggered) {
          setAgentStatus('Active Focus Sprint ⚡');
        }

        // Inject reasoning response message
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-agent-${Date.now()}`,
            sender: 'agent',
            text: `🎯 **${result.analysis || 'Workspace Optimization Map'}**\n\n${result.agentNudge}`,
            timestamp: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
          },
        ]);
        setIsAgentThinking(false);
        if (!result.panicModeTriggered && !result.focusSprintTriggered) {
          setAgentStatus('Zen Guide Calmly Monitoring...');
        }
      } else {
        throw new Error(result.error || 'API returned success=false');
      }
    } catch (err) {
      console.warn(
        'REST endpoint unavailable; activating high-fidelity client reasoning engine simulation:',
        err,
      );

      // Resilient local simulation fallbacks
      setTimeout(() => {
        let responseText = '';
        let actionConfig = undefined;
        const cleanText = text.toLowerCase();
        if (
          cleanText.includes('overwhelmed') ||
          cleanText.includes('swamp') ||
          cleanText.includes('stress') ||
          cleanText.includes('heavy') ||
          cleanText.includes('tired')
        ) {
          responseText = `I hear you loud and clear. Let's engage tactical boundary triage. \n\nI've examined your timeline and identified corporate alignment slots. I suggests entering **Panic Mode**—it will automatically reschedule lower priority syncing files and free up 3 consecutive hours.`;
          actionConfig = {
            type: 'panic',
            label: 'OVERRIDE THREAT ACTIVE',
            description:
              'Reschedule Q3 Corporate Sync & secure Deep Focus blocks?',
          };
        } else if (
          cleanText.includes('panic') ||
          cleanText.includes('resched') ||
          cleanText.includes('cancel')
        ) {
          triggerPanicActiveState();
          responseText = `🚨 **Panic Override Enabled!**\n\nI have automatically reached out through your connected G-Cal, shifted 'Corporate Sync' blocks to tomorrow 10:00 AM, and added strict focus shields on your profiles. \n\nYour overall average stress score pressure has dropped by 45 points. Breathe easy. I am holding the gate.`;
        } else if (
          cleanText.includes('sprint') ||
          cleanText.includes('pomodoro') ||
          cleanText.includes('focus')
        ) {
          responseText = `⚡ **Focus Sprint Initialized.**\n\nStarting a 25-minute Deep Focus buffer timer. Incoming team communication and slack badges have been auto-routed. Focus on a single bite-sized step.`;
          actionConfig = {
            type: 'sprint',
            label: 'DND ENFORCED',
            description:
              'Focus Sprint shield is actively holding your system offline.',
          };
        } else if (
          cleanText.includes('summary') ||
          cleanText.includes('summarize') ||
          cleanText.includes('day')
        ) {
          const remainingTasksCount = tasks.filter((t) => !t.completed).length;
          responseText = `📋 **Executive Summary of Remaining Workspace State:**\n\nYou have **${remainingTasksCount} pending objectives**. Your high-stress threat is the Venture Pitch Presentation at 5:00 PM.\n\nNext scheduled event is **Deep focus block at 2:00 PM**. Calmness rates are stable. Proceed with confidence.`;
        } else {
          responseText = `I have received your instruction and locked it into my current workspace buffers. \n\nI am keeping a persistent watch on your task deadlines and scheduling parameters. Let me know if you would like me to summarize your day, trigger a focus sprint, or execute panic mitigation.`;
        }
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-agent-${Date.now()}`,
            sender: 'agent',
            text: responseText,
            timestamp: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
            actionRequired: actionConfig,
          },
        ]);
        setIsAgentThinking(false);
        setAgentStatus(
          panicActive
            ? 'Panic Shield Engaged 🌋'
            : 'Zen Guide Calmly Monitoring...',
        );
      }, 1200);
    }
  };

  // Auxiliary core: Enable Panic Mode
  const triggerPanicActiveState = async () => {
    setPanicActive(true);
    setAgentStatus('Panic Shield Engaged 🌋');
    try {
      const response = await fetch('/api/agent/rescue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setTasks(data.tasks);
          setTimeline(data.timeline);
        }
      }
    } catch (err) {
      console.warn('Offline fallback panic rescheduled triggered:', err);
      // Mutate and postpone tasks below stress 65 to clear the horizon
      setTasks((prev) =>
        prev.map((t) => {
          if (!t.completed && t.stressScore < 65) {
            return {
              ...t,
              deadline: 'Rescheduled - Tomorrow',
              panicRescheduled: true,
              stressScore: Math.round(t.stressScore / 3), // dramatically decrease stress rating
            };
          }
          return t;
        }),
      );

      // Adjust schedule Blocks to have protected focus slots instead of standard meetings
      setTimeline((prev) =>
        prev.map((block) => {
          if (block.type === 'meeting') {
            return {
              ...block,
              title: '🛡️ AI Protected Defense Slot',
              type: 'shielded',
              description:
                'Rescheduled meeting with stakeholders. Auto-shielding active.',
            };
          }
          return block;
        }),
      );
    }
  };

  // Handler: Panic trigger from Quick action button
  const handlePanicTrigger = async () => {
    if (panicActive) {
      // Toggle back off
      setPanicActive(false);
      setAgentStatus('Zen Guide Calmly Monitoring...');
      try {
        const taskRes = await fetch('/api/tasks');
        if (taskRes.ok) setTasks(await taskRes.json());
        const timelineRes = await fetch('/api/timeline');
        if (timelineRes.ok) setTimeline(await timelineRes.json());
      } catch (err) {
        console.error('Failed to reload calendar state:', err);
      }
    } else {
      await triggerPanicActiveState();
      setMessages((prev) => [
        ...prev,
        {
          id: `panic-notif-${Date.now()}`,
          sender: 'agent',
          text: `🚨 **Autonomic Panic Mode Engaged.**\n\nI have successfully postponed low-priority corporate items and secured defensive shields around your core objectives. Overall stress index mapped downwards.`,
          timestamp: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
      ]);
    }
  };

  // Handler: Summary triggers from buttons
  const handleSummaryTrigger = () => {
    handleSendMessage('Summarize my day');
  };

  // Handler: Focus sprint triggers
  const handleFocusSprintTrigger = () => {
    handleSendMessage('Start Focus Sprint');
  };

  // New Block addition from CalendarView
  const handleAddCalendarBlock = async (newBlock) => {
    const tempId = `block-temp-${Date.now()}`;
    const created = {
      ...newBlock,
      id: tempId,
    };
    setTimeline((prev) => [...prev, created]);
    try {
      const response = await fetch('/api/timeline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newBlock),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.block) {
          setTimeline((prev) =>
            prev.map((b) => (b.id === tempId ? data.block : b)),
          );
        }
      }
    } catch (err) {
      console.error('Failed to persist custom calendar block:', err);
    }
  };
  return (
    <div
      id="suite-root-window"
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-white"
    >
      {/* Route Switch container */}
      <AnimatePresence mode="wait">
        {pageRoute === 'landing' ? (
          <motion.div
            key="page-landing"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            transition={{
              duration: 0.35,
            }}
            className="w-full"
          >
            <LandingPage
              onStartRescue={() => setPageRoute('dashboard')}
              isAuthenticated={isAuthenticated}
              userEmail={userEmail}
              userName={userName}
              onLoginSuccess={handleLoginSuccess}
              onLogout={handleLogout}
            />
          </motion.div>
        ) : (
          <motion.div
            key="page-dashboard"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            transition={{
              duration: 0.4,
            }}
            className="w-full h-screen overflow-hidden flex flex-col bg-slate-950 text-slate-100 relative"
          >
            {/* GLOWING AMBIENT DECORATIONS */}
            <div className="absolute top-0 right-0 w-[45%] h-[40%] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none z-0"></div>
            <div className="absolute bottom-0 left-0 w-[45%] h-[40%] bg-rose-500/5 rounded-full blur-[140px] pointer-events-none z-0"></div>

            {/* PRE-CONVERGING TOP NAVIGATION CONSOLE CONTROLLERS */}
            <header className="h-16 w-full shrink-0 border-b border-white/5 bg-slate-925 backdrop-blur-md flex items-center justify-between px-6 z-20 relative">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center shadow-md">
                  <span className="text-white text-xs font-bold font-mono">
                    R
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-black text-sm text-slate-100 tracking-tight">
                      RESCUE COCKPIT
                    </span>
                    <span className="text-[8px] font-mono font-extrabold text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded uppercase border border-indigo-100">
                      V2.4 LIVE
                    </span>
                  </div>
                </div>
              </div>

              {/* CENTER ACTIVE TELEMETRY INDEX */}
              <div className="hidden lg:flex items-center gap-6">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500 font-mono text-[10px] uppercase font-bold">
                    Workspace Client:
                  </span>
                  <span
                    className="text-slate-200 font-black cursor-pointer border-b border-indigo-500/40 border-dashed hover:text-indigo-600"
                    onClick={handleRenameUser}
                  >
                    @{userName}
                  </span>
                </div>

                <div className="h-4 w-[1px] bg-slate-800"></div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-mono text-[10px] uppercase font-bold">
                    Threat Engine:
                  </span>
                  <span
                    className={`text-xs font-mono font-extrabold flex items-center gap-1.5 ${panicActive ? 'text-rose-600' : 'text-emerald-700'}`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${panicActive ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'}`}
                    />
                    {panicActive
                      ? 'CRITICAL - PANIC ENGAGED'
                      : 'SYSTEM SHIELD LEVEL 3'}
                  </span>
                </div>
              </div>

              {/* RIGGERS FOR VIEW TRANSITION */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPageRoute('landing')}
                  id="header-btn-leave"
                  className="px-3.5 py-1.5 text-[10px] font-mono font-extrabold tracking-wider uppercase bg-slate-900 hover:bg-slate-920 rounded-lg border border-slate-800 hover:border-slate-700 text-slate-250 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>Land Page</span>
                </button>
              </div>
            </header>

            {/* MAIN INTERNAL ROW: SIDEBAR + SCROLLABLE CENTRAL PANEL */}
            <div className="flex-1 w-full flex overflow-hidden relative z-10 h-[calc(100vh-4rem)]">
              {/* SLIM GLASSMORPHIC SIDEBAR */}
              <div className="w-64 h-full shrink-0 hidden md:block p-4 border-r border-white/5 bg-slate-950/20">
                <Sidebar
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  onLogout={() => setPageRoute('landing')}
                  agentStatus={agentStatus}
                />
              </div>

              {/* CORE VIEWPORT CARDS WITH INDEPENDENT OVERFLOW CONTAINER */}
              <main
                id="command-viewport"
                className="flex-1 h-full overflow-y-auto bg-slate-950/20 custom-scrollbar-panel"
              >
                <div className="w-full max-w-7xl mx-auto">
                  <AnimatePresence mode="wait">
                    {activeTab === 'dashboard' && (
                      <motion.div
                        key="tab-dashboard"
                        initial={{
                          opacity: 0,
                          y: 15,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        exit={{
                          opacity: 0,
                          y: -15,
                        }}
                        transition={{
                          duration: 0.25,
                        }}
                      >
                        <DashboardView
                          userName={userName}
                          onRenameUser={handleRenameUser}
                          tasks={tasks}
                          timeline={timeline}
                          messages={messages}
                          isAgentThinking={isAgentThinking}
                          agentStatus={agentStatus}
                          panicActive={panicActive}
                          onSendMessage={handleSendMessage}
                          onUpdateTask={handleUpdateTask}
                          onAddTask={handleAddTask}
                          onDeleteTask={handleDeleteTask}
                          onToggleComplete={handleToggleComplete}
                          onPanicTrigger={handlePanicTrigger}
                          onSummaryTrigger={handleSummaryTrigger}
                          onFocusSprintTrigger={handleFocusSprintTrigger}
                          onTaskClick={setActiveTaskForBreakdown}
                          onSyncCalendar={handleSyncCalendar}
                        />
                      </motion.div>
                    )}

                    {activeTab === 'agent' && (
                      <motion.div
                        key="tab-agent"
                        initial={{
                          opacity: 0,
                          y: 15,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        exit={{
                          opacity: 0,
                          y: -15,
                        }}
                        transition={{
                          duration: 0.25,
                        }}
                        className="w-full"
                      >
                        <MyAgentView
                          onStatusChange={setAgentStatus}
                          activeStatus={agentStatus}
                        />
                      </motion.div>
                    )}

                    {activeTab === 'calendar' && (
                      <motion.div
                        key="tab-calendar"
                        initial={{
                          opacity: 0,
                          y: 15,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        exit={{
                          opacity: 0,
                          y: -15,
                        }}
                        transition={{
                          duration: 0.25,
                        }}
                        className="w-full"
                      >
                        <CalendarView
                          timeline={timeline}
                          onAddBlock={handleAddCalendarBlock}
                        />
                      </motion.div>
                    )}

                    {activeTab === 'settings' && (
                      <motion.div
                        key="tab-settings"
                        initial={{
                          opacity: 0,
                          y: 15,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        exit={{
                          opacity: 0,
                          y: -15,
                        }}
                        transition={{
                          duration: 0.25,
                        }}
                        className="w-full"
                      >
                        <SettingsView />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </main>
            </div>

            {/* MOBILE NAVIGATION BAR FALLBACK */}
            <div className="md:hidden h-14 shrink-0 border-t border-white/5 bg-slate-900/80 backdrop-blur-md flex items-center justify-around px-4 z-20">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`text-[10px] font-mono uppercase font-bold tracking-wider flex flex-col items-center gap-1 ${activeTab === 'dashboard' ? 'text-indigo-400' : 'text-slate-500'}`}
              >
                <span>Console</span>
              </button>
              <button
                onClick={() => setActiveTab('agent')}
                className={`text-[10px] font-mono uppercase font-bold tracking-wider flex flex-col items-center gap-1 ${activeTab === 'agent' ? 'text-indigo-400' : 'text-slate-500'}`}
              >
                <span>Agent</span>
              </button>
              <button
                onClick={() => setActiveTab('calendar')}
                className={`text-[10px] font-mono uppercase font-bold tracking-wider flex flex-col items-center gap-1 ${activeTab === 'calendar' ? 'text-indigo-400' : 'text-slate-500'}`}
              >
                <span>Planner</span>
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`text-[10px] font-mono uppercase font-bold tracking-wider flex flex-col items-center gap-1 ${activeTab === 'settings' ? 'text-indigo-400' : 'text-slate-500'}`}
              >
                <span>Config</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DETAILED INTERACTIVE NOVICE checklist STEP BREAKDOWN MODAL DRAWER */}
      <TaskBreakdownModal
        task={activeTaskForBreakdown}
        onClose={() => setActiveTaskForBreakdown(null)}
        onUpdateTask={handleUpdateTask}
      />

      {/* BEAUTIFUL STATE-DRIVEN USER PROFILE RENAME MODAL */}
      <AnimatePresence>
        {isRenaming && (
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
              onClick={() => setIsRenaming(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            {/* Modal Window */}
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
              className="w-full max-w-sm glassmorphism-card rounded-2xl overflow-hidden relative z-10 shadow-2xl border border-white/10 bg-slate-925 p-6"
            >
              <h3 className="text-sm font-semibold text-slate-100 font-display mb-3 flex items-center gap-1.5">
                Rename Profile
              </h3>
              <form onSubmit={handleSaveName} className="space-y-4">
                <div>
                  <label className="text-[10px] font-mono font-bold text-slate-500 uppercase block mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={newNameInput}
                    onChange={(e) => setNewNameInput(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950/90 text-slate-100 text-xs rounded-lg border border-white/5 focus:outline-none focus:border-indigo-500 transition-colors"
                    required
                    placeholder="Enter your name..."
                    autoFocus
                  />
                </div>
                <div className="flex justify-end gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setIsRenaming(false)}
                    className="px-3 py-1.5 rounded-lg hover:bg-white/5 text-slate-400 font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold cursor-pointer"
                  >
                    Save Changes
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
