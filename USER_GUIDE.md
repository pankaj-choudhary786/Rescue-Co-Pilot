# 🚀 Rescue Co-Pilot - Complete User Guide

Welcome to the **Rescue Co-Pilot**! This application is designed to act as your autonomous intelligent assistant, managing your tasks, calendars, and habits to maximize productivity and eliminate procrastination.

Even if you have absolutely no technical experience, getting this tool up and running is extremely straightforward.

---

## 🛠️ Prerequisites
You only need two things to run this natively on your machine:
1. **Node.js**: The engine that runs this software. [Download Node.js here](https://nodejs.org/) (Choose the LTS version).
2. **A Gemini AI API Key**: The intelligence behind your assistant. You can get one for free from Google at [Google AI Studio](https://aistudio.google.com/).

---

## ⚙️ Initial Setup & Hosting (Vercel)

### Deploying Instantly to Vercel (Recommended)
This repository is pre-configured to be deployed for free on [Vercel](https://vercel.com).
1. Create a free account on Vercel.
2. Click **Add New** -> **Project**.
3. Import this GitHub repository.
4. Expand the **Environment Variables** section and add `GEMINI_API_KEY` with the Google Gemini API key you generated.
5. Click **Deploy**. Within 60 seconds, your application will be live globally!

*(Note: In the Vercel cloud environment, your AI dashboard runs "Serverlessly". This means your tasks will reset periodically. It functions as a powerful presentation, portfolio, or daily tactical scratchpad.)*

### Running on your Local Machine (Persistent Data)
1. Clone or download this code to your computer.
2. Open your terminal and type `npm install` inside the project folder.
3. Rename the `.env.example` file to exactly `.env`.
4. Paste your API key inside it: `GEMINI_API_KEY="paste_your_key_here"`
5. Type `npm run dev` and open `http://localhost:3000` in your browser!

---

## 🔥 Features In Detail

### 1. The Autonomous Task Deconstructor (Natural Language)
Instead of typing bullet-points mentally breaking down big goals, your AI Co-Pilot does it for you. 
**How to use it:** Go to the Add Task input in your dashboard and type *exactly how you speak*. 
> **You type:** *"I absolutely have to file my quarterly taxes before this coming Friday afternoon or I'm in massive trouble."*
> 
> **AI Does the rest:** The Co-Pilot intercepts the text, assigns a high "Priority Stress Threat Level", and automatically breaks your task down into 3-5 tactical micro-actions (e.g. *1. Gather AWS Receipts, 2. Download Form 1099, 3. Upload to TurboTax*).

### 2. Panic Mode (Emergency Triage Override)
When you are completely overwhelmed with deadlines, the AI serves as your defense shield.
**How to use it:** Using voice interactions or text commands in the agent terminal, declare a Panic State (e.g., *"I'm drowning, help me clear my schedule!"*).
> **What it does:** The API will scan all tasks. Low-stress "soft-targets" (like Gym, Networking calls) are aggressively postponed to *"Tomorrow"*. Your timeline is automatically cleared, and a massive **"🛡️ AI Protected Deep Block"** is placed on your calendar to force you to focus entirely on your top priority.

### 3. Stress Score Indexer (Predictive Urgency)
Not all goals are equal. Our mathematical backend algorithm (integrated within the Gemini extraction) weights Tasks automatically.
**How it works:** A task categorized as `Work` due `Today, 5:00 PM` with high complexity will yield an aggressive Stress Score (e.g., 90/100) forcing it to the top of your visual dashboard. If it's a minor errand due `Next Week`, it drops safely to the bottom.

### 4. Interactive Daily Habits & Gamification
Protect your mental health dynamically.
**How to use it:** View your top-right habits module. Check off *"No-Meeting Tactical Buffer"* or *"Liquid Intake"*.
> **What it does:** It tracks completion streaks on your cloud dashboard. If you continuously fail them, the Daily AI Briefing aggressively adapts its tone to coach you back onto a healthy schedule.

---

## 👥 Real-World Use Cases (Target Personas)

### For the "Procrastinating Freelancer"
* **Scenario:** You have a major pitch deck to deliver, but you are paralyzed by the magnitude of the work.
* **Workflow:** You open **Rescue Co-Pilot** and type: *"Design the pitch deck for Apple by tonight."* The AI responds instantly by isolating 4 micro-tasks that take merely 5 minutes each. It schedules a blocking session at 11 AM precisely for it. Panic dissipates. You execute.

### For the "Overloaded Engineering Student" 
* **Scenario:** Mid-terms are approaching, and your calendar is packed with unstructured study goals.
* **Workflow:** You look at the "Stress Capacity Score" which averages out your workload. It is surging. You hit the **Panic Triage** button. The AI intelligently postpones your laundry and your optional networking sync call to tomorrow, isolating a clean 3-hour window specifically focused on your Systems Architecture exam study guide. 

### For the "Neurodivergent Professional (ADHD Management)"
* **Scenario:** You struggle with estimating how long things take and when to do them. Memory streaks drop off frequently.
* **Workflow:** You use the Daily Gamified Habit tracker to secure streaks on basic functions (e.g., *25-min Pomodoro Sprints*). If you miss 48 hours of baseline habits, your Morning Agent Briefing shifts its personality dynamically—demanding focus and assigning you to execute immediately. You get constant dynamic coaching natively embedded in your local terminal.

---

Enjoy absolute productivity. Autonomic defense mechanisms engaged. 🚀
