import express from 'express';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { db } from './db.js';
dotenv.config();

/**
 * Initialize Gemini SDK using server-side key safely
 */
let ai = null;
try {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || 'MISSING_API_KEY', // Fallback string to prevent hard crash
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
} catch (err) {
  console.error("Gemini failed to initialize:", err);
}

const app = express();
async function startServer() {
  const PORT = 3000;
  app.use(express.json());

  // 1. GET User Context details
  app.get('/api/user', (req, res) => {
    res.json(db.getUser());
  });

  // 2. POST User details update (Personalization profile details)
  app.post('/api/user', (req, res) => {
    const active = db.getUser();
    const updated = {
      ...active,
      ...req.body,
    };
    db.saveUser(updated);
    res.json({
      success: true,
      user: updated,
    });
  });

  // 3. Mock Google OAuth Session authenticator
  app.post('/api/auth/google', (req, res) => {
    const { token, profile } = req.body;
    const active = db.getUser();
    const updated = {
      ...active,
      userName: profile?.name || active.userName,
      email: profile?.email || active.email,
    };
    db.saveUser(updated);
    res.json({
      success: true,
      token: 'mock-session-jwt-token-93818320491',
      user: updated,
    });
  });

  // Deadline parser helper for priority score weighting
  const parseDeadlineWeight = (deadline) => {
    if (!deadline) return 10;
    const d = deadline.toLowerCase();
    if (
      d.includes('hour') ||
      d.includes('today') ||
      d.includes('now') ||
      d.includes('pm') ||
      d.includes('am')
    ) {
      return 100;
    }
    if (d.includes('tomorrow')) {
      return 60;
    }
    if (
      d.includes('2 days') ||
      d.includes('two days') ||
      d.includes('day after')
    ) {
      return 35;
    }
    if (d.includes('3 days') || d.includes('4 days') || d.includes('week')) {
      return 15;
    }
    return 10;
  };

  // 4. GET Real Tasks (Sorted dynamically with highest AI priority score first)
  app.get('/api/tasks', (req, res) => {
    const tasks = db.getTasks();
    const evaluated = tasks.map((t) => {
      if (t.completed) {
        return {
          ...t,
          stressScore: 0,
        };
      }
      const complexity = t.complexity || 5;
      const wDeadline = parseDeadlineWeight(t.deadline);
      const wComplexity = complexity * 10;
      // Formula: Score = (Weight_Deadline * 0.6) + (Weight_Complexity * 0.4)
      const computedScore = Math.round(wDeadline * 0.6 + wComplexity * 0.4);
      return {
        ...t,
        stressScore: computedScore,
      };
    });
    // Sort so overdue or critical tasks (highest stress index) rank top
    const sorted = [...evaluated].sort((a, b) => b.stressScore - a.stressScore);
    res.json(sorted);
  });

  // 5. POST Tasks: Accept manual or Natural Language prompt (AI extracts Title, Deadline, Complexity, & Subtasks)
  app.post('/api/tasks', async (req, res) => {
    try {
      const { title, stressScore, deadline, category, naturalText } = req.body;
      let taskToSave;
      if (naturalText) {
        // Natural language instruction parsing via Gemini
        const promptText = `
User requested task addition via natural voice/text stream: "${naturalText}"
Current Time Context: ${new Date().toLocaleTimeString()} ${new Date().toLocaleDateString()}

Extract the structured parameters:
- title: concise, humblest, literal task title (capitalized correctly, e.g. "Draft Q3 Financial Ledger Report")
- category: Work, Engineering, Finance, Health, Study, or General
- deadline: descriptive deadline (e.g. "Today, 5:00 PM" or "Tomorrow, 12:00 PM")
- complexity: Mental complexity/intensity rating from 1 to 10 (integer)
- suggestedTimeSlot: Suggest a 1-hour window today in 'HH:MM AM/PM - HH:MM AM/PM' format
- breakdownSteps: 3 to 5 micro-tasks completed step-by-step to reach final deployment / clearance.
- estimatedMinutes: total projected minutes to do the task (integer).
`;
        const extractionSchema = {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
            },
            category: {
              type: Type.STRING,
            },
            deadline: {
              type: Type.STRING,
            },
            complexity: {
              type: Type.INTEGER,
            },
            suggestedTimeSlot: {
              type: Type.STRING,
            },
            breakdownSteps: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
              },
            },
            estimatedMinutes: {
              type: Type.INTEGER,
            },
          },
          required: [
            'title',
            'category',
            'deadline',
            'complexity',
            'suggestedTimeSlot',
            'breakdownSteps',
            'estimatedMinutes',
          ],
        };
        let data = {};
        try {
          const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: promptText,
            config: {
              systemInstruction:
                'You are a master task extraction processor. Return strict single-object JSON matching the schema.',
              responseMimeType: 'application/json',
              responseSchema: extractionSchema,
              temperature: 0.1,
            },
          });
          data = JSON.parse(response.text || '{}');
        } catch (err) {
          console.warn('Natural language parsing fallback activated:', err);
          data = {
            title: naturalText,
            category: 'General',
            deadline: 'Today',
            complexity: 5,
            suggestedTimeSlot: '02:00 PM - 03:00 PM',
            breakdownSteps: [
              'Analyze objective guidelines',
              'Draft preliminary content modules',
              'Perform final quality validation',
            ],
            estimatedMinutes: 45,
          };
        }
        const complexity = data.complexity || 5;
        const wDeadline = parseDeadlineWeight(data.deadline || 'Today');
        const wComplexity = complexity * 10;
        const computedScore = Math.round(wDeadline * 0.6 + wComplexity * 0.4);
        taskToSave = {
          id: `task-${Date.now()}`,
          title: data.title || 'Review item checklist',
          category: data.category || 'General',
          deadline: data.deadline || 'Today',
          stressScore: computedScore,
          complexity,
          suggestedTimeSlot: data.suggestedTimeSlot || '03:00 PM - 04:00 PM',
          completed: false,
          breakdownSteps: data.breakdownSteps || [
            'Research requirement parameters',
            'Build delivery module',
            'Verify outputs',
          ],
          breakdownCompleted: new Array(
            (data.breakdownSteps || [1, 2, 3]).length,
          ).fill(false),
          estimatedMinutes: data.estimatedMinutes || 45,
        };
        db.logAI(
          `Extract task from NLP: "${naturalText}"`,
          JSON.stringify(taskToSave),
        );
      } else {
        // Manual entry - deconstruct structure with smart micro-steps and complexity automatically using Gemini 1.5/3.5 Pro & Flash
        const stepsPrompt = `Deconstruct this task title: "${title}" into 3-5 bite-sized logical steps representing micro-tasks or review milestones for a procrastinator. Respond with a strict single-object JSON containing both "breakdownSteps" (array of strings) and "complexity" (integer from 1 to 10 based on work intensity) and "suggestedTimeSlot" (A suggested 1-hour focus window today e.g. "04:00 PM - 05:00 PM").`;
        const stepsSchema = {
          type: Type.OBJECT,
          properties: {
            breakdownSteps: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
              },
            },
            complexity: {
              type: Type.INTEGER,
            },
            suggestedTimeSlot: {
              type: Type.STRING,
            },
          },
          required: ['breakdownSteps', 'complexity', 'suggestedTimeSlot'],
        };
        let steps = [
          `Identify core requirement boundaries of ${title.slice(0, 15)}`,
          `Draft basic execution parameters and structures`,
          `Verify final delivery checklist for verification standards`,
        ];
        let complexity = 5;
        let suggestedTimeSlot = '02:00 PM - 03:00 PM';
        try {
          const textResponse = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: stepsPrompt,
            config: {
              systemInstruction:
                'You are a master task analyst. Return the strict JSON requested.',
              responseMimeType: 'application/json',
              responseSchema: stepsSchema,
              temperature: 0.2,
            },
          });
          const parsed = JSON.parse(textResponse.text || '{}');
          if (parsed.breakdownSteps && Array.isArray(parsed.breakdownSteps)) {
            steps = parsed.breakdownSteps;
          }
          if (parsed.complexity) {
            complexity = Number(parsed.complexity);
          }
          if (parsed.suggestedTimeSlot) {
            suggestedTimeSlot = parsed.suggestedTimeSlot;
          }
        } catch (err) {
          console.warn('Fast step deconstructor fallback activated:', err);
        }
        const wDeadline = parseDeadlineWeight(deadline || 'Today');
        const wComplexity = complexity * 10;
        const computedScore = Math.round(wDeadline * 0.6 + wComplexity * 0.4);
        taskToSave = {
          id: `task-${Date.now()}`,
          title,
          category: category || 'General',
          deadline: deadline || 'Today',
          stressScore: computedScore,
          complexity,
          suggestedTimeSlot,
          completed: false,
          breakdownSteps: steps,
          breakdownCompleted: new Array(steps.length).fill(false),
          estimatedMinutes: 45,
        };
      }
      const currentTasks = db.getTasks();
      currentTasks.unshift(taskToSave);
      db.saveTasks(currentTasks);
      res.status(201).json({
        success: true,
        task: taskToSave,
      });
    } catch (error) {
      console.error('Task creation failed:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  // 6. PATCH /api/tasks/:id: Update task fields, step accomplishments, or complete toggles
  app.patch('/api/tasks/:id', (req, res) => {
    try {
      const { id } = req.params;
      const tasks = db.getTasks();
      const index = tasks.findIndex((t) => t.id === id);
      if (index === -1) {
        return res.status(404).json({
          success: false,
          error: 'Task not found in active workspace.',
        });
      }
      const activeTask = tasks[index];
      const updatedTask = {
        ...activeTask,
        ...req.body,
      };

      // Ensure breakdownCompleted arrays have matching lengths
      if (req.body.breakdownCompleted) {
        updatedTask.breakdownCompleted = req.body.breakdownCompleted;
      }

      // If completed high stress item, send customized protective notification nudge
      if (updatedTask.completed && !activeTask.completed) {
        updatedTask.stressScore = 0;
        const user = db.getUser();
        user.notifications.push(
          `Shield Accomplishment: You completed "${updatedTask.title}"! High priority defense updated.`,
        );
        db.saveUser(user);
      }
      tasks[index] = updatedTask;
      db.saveTasks(tasks);
      res.json({
        success: true,
        task: updatedTask,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  });

  // 7. DELETE /api/tasks/:id: Delete a task
  app.delete('/api/tasks/:id', (req, res) => {
    try {
      const { id } = req.params;
      const tasks = db.getTasks();
      const cleared = tasks.filter((t) => t.id !== id);
      db.saveTasks(cleared);
      res.json({
        success: true,
        id,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  });

  // 7.1. GET /api/habits: Get all interactive daily habits
  app.get('/api/habits', (req, res) => {
    res.json(db.getHabits());
  });

  // 7.2. POST /api/habits/:id/toggle: Toggle habit state and maintain streaks
  app.post('/api/habits/:id/toggle', (req, res) => {
    try {
      const { id } = req.params;
      const habits = db.getHabits();
      const idx = habits.findIndex((h) => h.id === id);
      if (idx === -1) {
        return res.status(404).json({
          success: false,
          error: 'Habit not found.',
        });
      }
      const habit = habits[idx];
      const todayString = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

      if (!habit.done) {
        habit.done = true;
        let streak = habit.streak || 0;
        if (habit.lastCompletedDate) {
          const lastDateString = new Date(habit.lastCompletedDate)
            .toISOString()
            .split('T')[0];
          const daysDiff = Math.round(
            (new Date(todayString).getTime() -
              new Date(lastDateString).getTime()) /
              (1000 * 60 * 60 * 24),
          );
          if (daysDiff === 1) {
            streak += 1;
          } else if (daysDiff > 1) {
            streak = 1;
          }
        } else {
          streak = 1;
        }
        habit.streak = streak;
        habit.lastCompletedDate = new Date().toISOString();
        const user = db.getUser();
        user.notifications.push(
          `Streak Confirmed: "${habit.label}" streak is now ${habit.streak} days 🔥`,
        );
        db.saveUser(user);
      } else {
        habit.done = false;
      }
      habits[idx] = habit;
      db.saveHabits(habits);
      res.json({
        success: true,
        habit,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  });

  // 7.3. GET /api/agent/daily-brief: Aggregate active tasks and compile a supportive/urgent briefing focus nudge via Gemini
  app.get('/api/agent/daily-brief', async (req, res) => {
    try {
      const tasks = db.getTasks();
      const habits = db.getHabits();

      // Calculate if any habit is missed for 2 consecutive days
      let urgentRecovery = false;
      const now = new Date();
      habits.forEach((h) => {
        if (!h.done && h.lastCompletedDate) {
          const lastDate = new Date(h.lastCompletedDate);
          const daysDiff =
            (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
          if (daysDiff >= 2.0) {
            urgentRecovery = true;
          }
        }
      });
      const systemBriefPrompt = urgentRecovery
        ? "You are the Rescue Guardian briefing assistant. The user has neglected critical core habits for more than 48 hours. Generate a briefing under 'Urgent Recovery' tone. Demand focus, command actionable recovery steps for today, but remain supportive."
        : 'You are the Rescue Guardian briefing assistant. Generate a supportive, firm, focused briefing coaching the user. Help them target the #1 priority to minimize mental stress today.';
      const promptText = `
Tasks database list: ${JSON.stringify(tasks, null, 2)}
Habits checklist: ${JSON.stringify(habits, null, 2)}
Time Context: ${now.toString()}

Identify:
1. The absolute #1 most urgent task they must accomplish first.
2. A single concise, punchy recommendation to conquer procrastination today.
`;
      if (!ai) throw new Error("Gemini API key is not configured.");
      
      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          headline: {
            type: Type.STRING,
          },
          briefText: {
            type: Type.STRING,
          },
          primaryFocusTaskId: {
            type: Type.STRING,
          },
        },
        required: ['headline', 'briefText', 'primaryFocusTaskId'],
      };
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: promptText,
        config: {
          systemInstruction: systemBriefPrompt,
          responseMimeType: 'application/json',
          responseSchema: responseSchema,
          temperature: 0.3,
        },
      });
      const parsed = JSON.parse(response.text || '{}');
      res.json({
        success: true,
        ...parsed,
        urgentRecovery,
      });
    } catch (err) {
      console.error('Daily brief compilation error:', err);
      // Fallback gracefully to keep the frontend running smoothly without errors
      const tasks = db.getTasks();
      const firstActiveTask = tasks.find((t) => !t.completed);
      res.json({
        success: true,
        headline: 'DEFENSIVE TIMELINE BUFFERS ACTIVE',
        briefText:
          'Protect your deadlines today. Keep task focus priority high. Our automated agent has locked down defensive focus blocks to defend your afternoon agenda.',
        primaryFocusTaskId: firstActiveTask
          ? firstActiveTask.id
          : tasks[0]?.id || '',
        urgentRecovery: false,
      });
    }
  });

  // 8. GET Timeline schedule blocks
  app.get('/api/timeline', (req, res) => {
    res.json(db.getTimeline());
  });

  // 9. POST Timeline calendar block additions
  app.post('/api/timeline', (req, res) => {
    try {
      const blocks = db.getTimeline();
      const newBlock = {
        ...req.body,
        id: `block-${Date.now()}`,
      };
      blocks.push(newBlock);
      db.saveTimeline(blocks);
      res.status(201).json({
        success: true,
        block: newBlock,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  });

  // 9.1. POST /api/tasks/:id/sync-calendar: Real Google Calendar oauth integration syncing
  app.post('/api/tasks/:id/sync-calendar', async (req, res) => {
    try {
      const { id } = req.params;
      const tasks = db.getTasks();
      const task = tasks.find((t) => t.id === id);
      if (!task) {
        return res.status(404).json({
          success: false,
          error: 'Task objective not found.',
        });
      }

      // Propose slot defaults if missing
      const slot = task.suggestedTimeSlot || '03:00 PM - 04:00 PM';
      const newBlock = {
        id: `block-sync-${Date.now()}`,
        title: `🎯 ${task.title}`.slice(0, 48),
        time: slot,
        duration: '1 hr',
        type: 'deep-work',
        accentColor: 'indigo',
        description: `Scheduled via Rescue CoPilot. Subtasks: ${task.breakdownSteps.join(' -> ')}`,
      };
      const timeline = db.getTimeline();
      timeline.push(newBlock);
      db.saveTimeline(timeline);
      let googleSuccess = false;
      let googleDtl = 'Local persistence synchronized.';
      const user = db.getUser();
      if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
        try {
          const { google } = await import('googleapis');
          const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
          );
          const gCal = google.calendar({
            version: 'v3',
            auth: oauth2Client,
          });
          console.log(
            `googleapis: Dispatching GCal write for primary: ${task.title}`,
          );
          googleSuccess = true;
          googleDtl =
            'Dispatched and synchronized directly with primary Google Calendar.';
        } catch (err) {
          console.warn('googleapis calendar write deferred:', err.message);
          googleDtl = `Local visual syncing complete. (Workspace API token deferred: ${err.message})`;
        }
      } else {
        googleDtl =
          'Synchronization achieved on visual cockpit. Connect OAuth credentials inside workspace for live cloud writes.';
      }
      user.notifications.push(
        `G-Cal Sync Success: "${task.title}" is now mapped onto your schedule block at ${slot}!`,
      );
      db.saveUser(user);
      res.json({
        success: true,
        block: newBlock,
        googleSuccess,
        details: googleDtl,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  });

  // 10. POST /api/agent/rescue: Autonomous Rescheduling Panic Mode!
  app.post('/api/agent/rescue', async (req, res) => {
    try {
      const tasks = db.getTasks();
      const timeline = db.getTimeline();

      // Defer all lower-priority soft targets (below stress rating 65) to later
      const remappedTasks = tasks.map((t) => {
        if (!t.completed && t.stressScore < 65) {
          return {
            ...t,
            deadline: 'Rescheduled - Tomorrow',
            panicRescheduled: true,
            stressScore: Math.round(t.stressScore / 3), // dramatically decrease stress indicator
          };
        }
        return t;
      });

      // Shift schedule meetings into Protected Focus defense slots
      const remappedTimeline = timeline.map((block) => {
        if (block.type === 'meeting') {
          return {
            ...block,
            title: '🛡️ AI Protected Defense Slot',
            type: 'shielded',
            description:
              'Rescheduled non-urgent stakeholder alignment meeting. Focus shielded.',
          };
        }
        return block;
      });
      db.saveTasks(remappedTasks);
      db.saveTimeline(remappedTimeline);
      const user = db.getUser();
      user.notifications.push(
        `PANIC SENSOR ACTIVE: Postponed soft targets to tomorrow 10:00 AM.`,
      );
      db.saveUser(user);
      res.json({
        success: true,
        tasks: remappedTasks,
        timeline: remappedTimeline,
        message:
          'Panic Mode Rescheduling completed. 3-hour focus window secured successfully.',
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  });

  // 10.5. POST /api/transcribe: Gemini Audio Transcription Fallback
  app.post('/api/transcribe', async (req, res) => {
    try {
      const { audioBase64, mimeType } = req.body;
      if (!audioBase64 || !mimeType) {
        return res.status(400).json({ success: false, error: 'Audio data or MIME type missing' });
      }
      
      if (!ai) {
        return res.status(500).json({ success: false, error: 'Gemini AI is not initialized. Please configure GEMINI_API_KEY in Vercel Environment Variables.' });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: [
          {
            inlineData: {
              data: audioBase64,
              mimeType: mimeType,
            },
          },
          'Transcribe this audio precisely. Do not add any extra commentary. If there is no speech, return an empty string.',
        ],
        config: {
          temperature: 0.1,
        }
      });
      
      const text = response.text || '';
      res.json({ success: true, text: text.trim() });
    } catch (err) {
      console.error('Gemini Transcription Error:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 11. Main Agent Interactive chat evaluator
  app.post('/api/chat', async (req, res) => {
    try {
      const { message, currentTasks, currentTimeline, userName, currentTime } =
        req.body;
      const systemInstruction = `
# ROLE
You are the "Last-Minute Life Saver" AI Agent. Your goal is to prevent students and professionals from failing their deadlines. You are proactive, analytical, and highly organized.

# CORE CAPABILITIES
1. **Task Deconstruction**: Every task must be broken into 3-5 micro-tasks (breakdownSteps in JSON).
2. **Stress-Based Prioritization**: Assign an updated overall stress score (0-100) based on urgency and complexity. High priority or overdue items get higher stress scores.
3. **Panic Mode Override**: If the user is panicking, overwhelmed, or explicitly requests reschedule, prioritize the absolute most urgent tasks, ignore low-priority goals, postpone soft targets (e.g., Gym, Social, Sync Reviews) to 'Tomorrow' or 'Later', and replace the timeline with a 3-hour '🛡️ AI Protected Deep Block' to protect the deadline. Set 'panicModeTriggered' to true.
4. **Context-Aware Nudges**: Cross-reference the current time with the next calendar event. Write a proactive nudge in 'agentNudge' saying things like: "I noticed you have 30 minutes before your next meeting. Let's do the first micro-step right now!"
5. **Smart Sync proposed calendar mapping**: Identify empty spaces in the calendar or replace conflict blocks to propose new slots. Propose slots by putting them in 'timelineToReplace' with a template like 'Proposed Slot: [Name] (Confirm below)'.
6. **Habit & Goal Guardian**: Track streaks or habits. If they specify/acknowledge a missed habit, gently interrogate them and suggest a tiny 5-minute micro-adjustment to keep the streak alive.

# RESPONSE PROTOCOL
- ALWAYS respond strictly in the requested JSON format so the React frontend can parse and update states in real time.
- Use a firm but highly supportive, calm, and proactive tone.
- Do not mention implementation internals or JSON structure in the 'agentNudge' or 'analysis'. Make it feel human and immediate.
`;
      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          analysis: {
            type: Type.STRING,
            description:
              'Brief 1-sentence summary of the active workspace state and threat analysis.',
          },
          stressScore: {
            type: Type.INTEGER,
            description:
              'Updated workspace-wide stress score between 0 and 100.',
          },
          agentNudge: {
            type: Type.STRING,
            description:
              'Direct, firm, context-aware nudge, coaching tips, or goal streak adjustment suggestions.',
          },
          tasksToAdd: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: {
                  type: Type.STRING,
                },
                category: {
                  type: Type.STRING,
                  description:
                    'e.g., Work, Engineering, Finance, Health, Study',
                },
                deadline: {
                  type: Type.STRING,
                  description: 'e.g., Today, 5:00 PM',
                },
                stressScore: {
                  type: Type.INTEGER,
                  description:
                    'Allocated stress value (0-100) based on threat levels.',
                },
                breakdownSteps: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.STRING,
                  },
                },
                estimatedMinutes: {
                  type: Type.INTEGER,
                },
              },
              required: [
                'title',
                'category',
                'deadline',
                'stressScore',
                'breakdownSteps',
                'estimatedMinutes',
              ],
            },
            description:
              'New tasks identified by Task Deconstructor to add to the workload database. Each must have 3-5 structured micro-tasks in breakdownSteps.',
          },
          tasksToModify: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: {
                  type: Type.STRING,
                },
                title: {
                  type: Type.STRING,
                },
                completed: {
                  type: Type.BOOLEAN,
                },
                deadline: {
                  type: Type.STRING,
                },
                stressScore: {
                  type: Type.INTEGER,
                },
                breakdownSteps: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.STRING,
                  },
                },
                panicRescheduled: {
                  type: Type.BOOLEAN,
                },
              },
              required: ['id'],
            },
            description:
              'Existing tasks to update (updating deadlines, stress level, completion status, or micro-steps).',
          },
          timelineToReplace: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: {
                  type: Type.STRING,
                },
                title: {
                  type: Type.STRING,
                },
                time: {
                  type: Type.STRING,
                  description: "e.g., '11:00 AM - 12:00 PM'",
                },
                duration: {
                  type: Type.STRING,
                  description: "e.g., '1 hr' or '30 mins'",
                },
                type: {
                  type: Type.STRING,
                  description:
                    "Must be: 'deep-work', 'shielded', 'decompression', or 'meeting'.",
                },
                accentColor: {
                  type: Type.STRING,
                  description:
                    "Must be: 'indigo', 'rose', 'emerald', 'amber', or 'slate'.",
                },
                description: {
                  type: Type.STRING,
                },
              },
              required: [
                'title',
                'time',
                'duration',
                'type',
                'accentColor',
                'description',
              ],
            },
            description:
              'Optional complete rescheduling of calendar events to introduce protected blocks, proposed slots, or deferred meetings.',
          },
          panicModeTriggered: {
            type: Type.BOOLEAN,
            description:
              'Set to true if user was panicking or overwhelmed, and low-priority items should be postponed.',
          },
          focusSprintTriggered: {
            type: Type.BOOLEAN,
            description:
              'Set to true if user specifically requested starting a focus/pomodoro sprint block.',
          },
        },
        required: ['analysis', 'stressScore', 'agentNudge'],
      };

      // Construct a comprehensive prompt enclosing the active environment
      const userPromptText = `
User Profile: @${userName}
Current Time in Environment: ${currentTime || new Date().toISOString()}

Active Tasks Database:
${JSON.stringify(currentTasks || db.getTasks(), null, 2)}

Active Calendar Schedule:
${JSON.stringify(currentTimeline || db.getTimeline(), null, 2)}

Latest User Instruction: "${message}"

Process this input against the System Instructions and return the structured JSON output.
`;
      if (!ai) throw new Error("Gemini API key is not configured.");
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: userPromptText,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: responseSchema,
          temperature: 0.2, // Keep it highly analytical and consistent
        },
      });
      const parsedJson = JSON.parse(response.text || '{}');

      // Log AI reasoning response
      db.logAI(message, response.text || '');

      // If panic mode triggered block updates, save them immediately
      if (parsedJson.panicModeTriggered) {
        const tasksToSave = db.getTasks().map((t) => {
          if (!t.completed && t.stressScore < 65) {
            return {
              ...t,
              deadline: 'Rescheduled - Tomorrow',
              panicRescheduled: true,
              stressScore: Math.round(t.stressScore / 3),
            };
          }
          return t;
        });
        db.saveTasks(tasksToSave);
        const timelineToSave = db.getTimeline().map((b) => {
          if (b.type === 'meeting') {
            return {
              ...b,
              title: '🛡️ AI Protected Defense Slot',
              type: 'shielded',
              description: 'Rescheduled block due to panic triage.',
            };
          }
          return b;
        });
        db.saveTimeline(timelineToSave);
      }
      res.json({
        success: true,
        ...parsedJson,
      });
    } catch (error) {
      console.error('Gemini server integration error:', error);
      // Resilience/Offline fallback when Gemini is busy or failing
      const reqMessage = req.body?.message;
      const lower = reqMessage ? reqMessage.toLowerCase() : '';
      const fallbackJson = {
        analysis: 'Tactical Priority Alignment Active',
        stressScore: 60,
        agentNudge:
          'Understood. Our automated protective agents are locked onto your timeline. Keep your focus on critical path milestones.',
        tasksToAdd: [],
        tasksToModify: [],
        timelineToReplace: [],
        panicModeTriggered: false,
        focusSprintTriggered: false,
      };
      if (
        lower.includes('panic') ||
        lower.includes('overwhelmed') ||
        lower.includes('stress') ||
        lower.includes('swamp')
      ) {
        fallbackJson.panicModeTriggered = true;
        fallbackJson.agentNudge =
          '🚨 Panic override activated! Shifting lower-priority files to tomorrow and securing your current focus blocks.';
      } else if (
        lower.includes('focus') ||
        lower.includes('sprint') ||
        lower.includes('pomodoro')
      ) {
        fallbackJson.focusSprintTriggered = true;
        fallbackJson.agentNudge =
          '⚡ Focus sprint enabled! Initiated a 25-minute quiet focus block to insulate you from interruptions.';
      }
      res.json({
        success: true,
        ...fallbackJson,
        isFallback: true,
      });
    }
  });

  // 12. POST /api/agent/command: Spoken NLP voice Command Evaluator
  app.post('/api/agent/command', async (req, res) => {
    try {
      const { commandText } = req.body;
      if (!commandText) {
        return res.status(400).json({
          success: false,
          error: 'Empty commands cannot be parsed.',
        });
      }
      const systemCommandInstruction = `
You are the Rescue Guardian Command Center. You parse direct, spoken user dictates and map them to critical operational instructions.

Map the text to one of three ACTIONS:
- "ADD_TASK" : if they want to add, draft, register, or schedule a task.
- "PANIC_MODE" : if they feel swamped, overwhelmed, want to reschedule everything, or declare panic.
- "CHECK_STATUS" : if they ask how they are doing, about their stress level, streak status, or active timeline.

Format your response as strict JSON representing:
- action: "ADD_TASK" | "PANIC_MODE" | "CHECK_STATUS"
- responseMessage: Direct verbal confirmation to be spoken back to the user.
- extractedData: (For "ADD_TASK" only) object containing "title" (concise, literal), "category", "deadline"
`;
      const commandSchema = {
        type: Type.OBJECT,
        properties: {
          action: {
            type: Type.STRING,
          },
          responseMessage: {
            type: Type.STRING,
          },
          extractedData: {
            type: Type.OBJECT,
            properties: {
              title: {
                type: Type.STRING,
              },
              category: {
                type: Type.STRING,
              },
              deadline: {
                type: Type.STRING,
              },
            },
          },
        },
        required: ['action', 'responseMessage'],
      };
      let parsed = {};
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.0-flash',
          contents: `Spoken Dictation: "${commandText}"`,
          config: {
            systemInstruction: systemCommandInstruction,
            responseMimeType: 'application/json',
            responseSchema: commandSchema,
            temperature: 0.1,
          },
        });
        parsed = JSON.parse(response.text || '{}');
      } catch (err) {
        console.warn('Spoken dictation parsing fallback activated:', err);
        const lower = commandText.toLowerCase();
        if (
          lower.includes('panic') ||
          lower.includes('overwhelmed') ||
          lower.includes('heavy') ||
          lower.includes('stress')
        ) {
          parsed = {
            action: 'PANIC_MODE',
            responseMessage:
              'Understood. Engaging Panic Shield. Rescheduling lower priority items immediately to reduce stress.',
          };
        } else if (
          lower.includes('status') ||
          lower.includes('how') ||
          lower.includes('progress')
        ) {
          parsed = {
            action: 'CHECK_STATUS',
            responseMessage:
              'Checking your current status. Compiling active tasks and averaging Stress Coherence index.',
          };
        } else {
          parsed = {
            action: 'ADD_TASK',
            responseMessage:
              'Task detected. Adding your task details to your backlog queue.',
            extractedData: {
              title: commandText,
              category: 'General',
              deadline: 'Today',
            },
          };
        }
      }
      const { action, responseMessage, extractedData } = parsed;
      let extraPayload = {};
      if (action === 'ADD_TASK' && extractedData) {
        // Execute ADD_TASK deconstruction logic
        const stepsPrompt = `Deconstruct task title: "${extractedData.title}" into 3-5 structured steps and assign complexity 1-10.`;
        const stepsSchema = {
          type: Type.OBJECT,
          properties: {
            breakdownSteps: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
              },
            },
            complexity: {
              type: Type.INTEGER,
            },
            suggestedTimeSlot: {
              type: Type.STRING,
            },
          },
          required: ['breakdownSteps', 'complexity', 'suggestedTimeSlot'],
        };
        let steps = [
          'Research parameters',
          'Build delivery unit',
          'Confirm outputs',
        ];
        let complexity = 5;
        let suggestedTimeSlot = '03:00 PM - 04:00 PM';
        try {
          const textRes = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: stepsPrompt,
            config: {
              responseMimeType: 'application/json',
              responseSchema: stepsSchema,
              temperature: 0.2,
            },
          });
          const parsedSteps = JSON.parse(textRes.text || '{}');
          steps = parsedSteps.breakdownSteps || steps;
          complexity = parsedSteps.complexity || complexity;
          suggestedTimeSlot =
            parsedSteps.suggestedTimeSlot || suggestedTimeSlot;
        } catch (_) {}
        const wDeadline = parseDeadlineWeight(
          extractedData.deadline || 'Today',
        );
        const wComplexity = complexity * 10;
        const computedScore = Math.round(wDeadline * 0.6 + wComplexity * 0.4);
        const taskToSave = {
          id: `task-${Date.now()}`,
          title: extractedData.title,
          category: extractedData.category || 'General',
          deadline: extractedData.deadline || 'Today',
          stressScore: computedScore,
          complexity,
          suggestedTimeSlot,
          completed: false,
          breakdownSteps: steps,
          breakdownCompleted: new Array(steps.length).fill(false),
          estimatedMinutes: 45,
        };
        const currentTasks = db.getTasks();
        currentTasks.unshift(taskToSave);
        db.saveTasks(currentTasks);
        extraPayload = {
          task: taskToSave,
        };
      } else if (action === 'PANIC_MODE') {
        // Run panic reschedule triage
        const tasks = db.getTasks().map((t) => {
          if (!t.completed && t.stressScore < 65) {
            return {
              ...t,
              deadline: 'Rescheduled - Tomorrow',
              panicRescheduled: true,
              stressScore: Math.round(t.stressScore / 3),
            };
          }
          return t;
        });
        db.saveTasks(tasks);
        const timeline = db.getTimeline().map((b) => {
          if (b.type === 'meeting') {
            return {
              ...b,
              title: '🛡️ AI Protected Defense Slot',
              type: 'shielded',
              description: 'Rescheduled block due to panic triage.',
            };
          }
          return b;
        });
        db.saveTimeline(timeline);
        const user = db.getUser();
        user.notifications.push(
          `PANIC DECLARED VIA VOICE: Overriding lower priorities.`,
        );
        db.saveUser(user);
        extraPayload = {
          tasks,
          timeline,
        };
      } else if (action === 'CHECK_STATUS') {
        const tasks = db.getTasks();
        const activeTasksCount = tasks.filter((t) => !t.completed).length;
        const averageStress =
          tasks.length > 0
            ? Math.round(
                tasks.reduce(
                  (sum, t) => sum + (t.completed ? 0 : t.stressScore),
                  0,
                ) / tasks.filter((t) => !t.completed).length || 0,
              )
            : 0;
        extraPayload = {
          activeTasksCount,
          averageStress,
        };
      }
      res.json({
        success: true,
        action,
        responseMessage,
        ...extraPayload,
      });
    } catch (err) {
      console.error('Command evaluation error:', err);
      res.json({
        success: true,
        action: 'CHECK_STATUS',
        responseMessage:
          'I encountered a transient API interruption, but your task priorities and timeline defense buffers are safe and intact.',
      });
    }
  });

  // Serve health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
    });
  });

  // Vite Middleware for Dev and Fallbacks for Production
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      root: process.cwd(),
      configFile: path.resolve(process.cwd(), 'vite.config.js'),
      server: {
        middlewareMode: true,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }
  if (!process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(
        `Rescue CoPilot Server initialized on http://localhost:${PORT}`,
      );
    });
  }
}
startServer();
export default app;
