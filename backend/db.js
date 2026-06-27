import fs from 'fs';
import path from 'path';
const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');
// Default initial records standard
const INITIAL_TASKS = [
  {
    id: 't1',
    title: 'Deliver Final Pitch Deck to Venture Partners',
    category: 'Work',
    deadline: 'Today, 5:00 PM',
    stressScore: 94,
    completed: false,
    estimatedMinutes: 90,
    breakdownSteps: [
      'Refine the financial growth chart with corrected Q2 projections',
      'Script the 3-minute opening hook addressing market size shifts',
      'Export secure PDF and verify slide transitions on mobile screens',
    ],
    breakdownCompleted: [false, false, false],
  },
  {
    id: 't2',
    title: 'Resolve critical database locks in staging environment',
    category: 'Engineering',
    deadline: 'Today, 7:30 PM',
    stressScore: 82,
    completed: false,
    estimatedMinutes: 60,
    breakdownSteps: [
      'Analyze Postgres active query logs to localize blocking transactions',
      'Draft a migration to introduce proper composite indexes and optimize query execution planner',
      'Deploy index changes and verify transaction latencies fall back below 50ms',
    ],
    breakdownCompleted: [false, false, false],
  },
  {
    id: 't3',
    title: 'Finalize quarterly internal tax reviews',
    category: 'Finance',
    deadline: 'Tomorrow, 12:00 PM',
    stressScore: 58,
    completed: false,
    estimatedMinutes: 120,
    breakdownSteps: [
      'Collate SaaS infrastructure expense receipts from AWS & Stripe',
      'Compile contractor hour reports and update master ledger',
      'Sign and upload Form 1099 equivalents under safe harbor standards',
    ],
    breakdownCompleted: [false, false, false],
  },
  {
    id: 't4',
    title: 'Pre-schedule Q3 team performance synchronization sessions',
    category: 'People',
    deadline: 'In 2 Days',
    stressScore: 35,
    completed: false,
    estimatedMinutes: 45,
    breakdownSteps: [
      'Draft evaluation feedback bullets focusing on scope ownership and communication',
      'Create custom calendar booking invite slots via shared calendar',
      'Share brief goal-setting pre-reads to prompt collaborative alignment',
    ],
    breakdownCompleted: [false, false, false],
  },
  {
    id: 't5',
    title: 'Review production pull-request for auth middleware standard',
    category: 'Code',
    deadline: 'In 3 Days',
    stressScore: 22,
    completed: true,
    estimatedMinutes: 30,
    breakdownSteps: [
      'Inspect JSON Web Token validation headers and claim expirations',
      'Verify unit testing suite retains coverage on expired refresh tokens',
      'Approve and request staging staging deploy trigger',
    ],
    breakdownCompleted: [true, true, true],
  },
];
const INITIAL_SCHEDULE = [
  {
    id: 's1',
    title: 'Deep Work: Pitch Deck Finalization',
    time: '09:00 AM - 10:30 AM',
    duration: '1.5 hrs',
    type: 'deep-work',
    accentColor: 'indigo',
    description:
      'Focus solely on refining market projections and slide animations without notifications.',
  },
  {
    id: 's2',
    title: 'AI Shielded Time: Focus Block',
    time: '11:00 AM - 12:00 PM',
    duration: '1 hr',
    type: 'shielded',
    accentColor: 'emerald',
    description:
      'Incoming notification redirection active. Priority communication filtered through assistant.',
  },
  {
    id: 's3',
    title: 'Decompression & Breathing Sprint',
    time: '12:30 PM - 01:00 PM',
    duration: '30 mins',
    type: 'decompression',
    accentColor: 'amber',
    description:
      'Tactical mental reboot. Standard notification and messaging silencing block.',
  },
  {
    id: 's4',
    title: 'Interactive Code Sync (Staging Defect)',
    time: '02:00 PM - 03:00 PM',
    duration: '1 hr',
    type: 'meeting',
    accentColor: 'rose',
    description:
      'Alignment sync with team on Redis memory optimization configurations.',
  },
  {
    id: 's5',
    title: 'Autonomous Clean-up Block',
    time: '04:00 PM - 05:00 PM',
    duration: '1 hr',
    type: 'deep-work',
    accentColor: 'indigo',
    description: 'Secondary workspace organization and minor task cleanup.',
  },
];
const INITIAL_HABITS = [
  {
    id: 'hab-1',
    label: 'Inhaled Breathing Cycles',
    done: true,
    points: 15,
    key: 'breath',
    streak: 8,
    lastCompletedDate: '2026-06-22T10:00:00Z',
  },
  {
    id: 'hab-2',
    label: '25m Focus Sprint Block',
    done: false,
    points: 25,
    key: 'sprint',
    streak: 3,
  },
  {
    id: 'hab-3',
    label: 'Slack Shield Silence',
    done: false,
    points: 20,
    key: 'slack',
    streak: 5,
  },
  {
    id: 'hab-4',
    label: 'No-Meeting Tactical Buffers',
    done: true,
    points: 15,
    key: 'buffer',
    streak: 7,
    lastCompletedDate: '2026-06-22T12:00:00Z',
  },
  {
    id: 'hab-5',
    label: 'Hydration Intake Cycle',
    done: false,
    points: 10,
    key: 'hydrate',
    streak: 12,
  },
  {
    id: 'hab-6',
    label: 'Inbox Decongestion',
    done: false,
    points: 15,
    key: 'inbox',
    streak: 2,
  },
];
export function initDb() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, {
      recursive: true,
    });
  }
  if (!fs.existsSync(DB_FILE)) {
    const defaultData = {
      tasks: INITIAL_TASKS,
      timeline: INITIAL_SCHEDULE,
      habits: INITIAL_HABITS,
      user: {
        userName: 'Pankaj',
        email: 'pankajkhicharabc3@gmail.com',
        stressTolerance: 'moderate',
        notifications: ['System initial defense shield initialized.'],
      },
      aiLogs: [],
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2), 'utf-8');
  }
}
function readDb() {
  initDb();
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const data = JSON.parse(raw);
    // Backward compatibility for existing runs with older DB stores
    if (!data.habits) {
      data.habits = INITIAL_HABITS;
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    }
    return data;
  } catch (err) {
    console.error('Database reading error, restoring default state:', err);
    return {
      tasks: INITIAL_TASKS,
      timeline: INITIAL_SCHEDULE,
      habits: INITIAL_HABITS,
      user: {
        userName: 'Pankaj',
        email: 'pankajkhicharabc3@gmail.com',
        stressTolerance: 'moderate',
        notifications: [],
      },
      aiLogs: [],
    };
  }
}
function writeDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Database writing atomic transaction failed:', err);
  }
}
export const db = {
  getTasks: () => {
    return readDb().tasks;
  },
  saveTasks: (newTasks) => {
    const data = readDb();
    data.tasks = newTasks;
    writeDb(data);
  },
  getTimeline: () => {
    return readDb().timeline;
  },
  saveTimeline: (newTimeline) => {
    const data = readDb();
    data.timeline = newTimeline;
    writeDb(data);
  },
  getHabits: () => {
    return readDb().habits;
  },
  saveHabits: (newHabits) => {
    const data = readDb();
    data.habits = newHabits;
    writeDb(data);
  },
  getUser: () => {
    return readDb().user;
  },
  saveUser: (user) => {
    const data = readDb();
    data.user = user;
    writeDb(data);
  },
  logAI: (prompt, response) => {
    const data = readDb();
    data.aiLogs.push({
      timestamp: new Date().toISOString(),
      prompt,
      response,
    });
    if (data.aiLogs.length > 100) {
      data.aiLogs.shift(); // keep it lightweight
    }
    writeDb(data);
  },
};
