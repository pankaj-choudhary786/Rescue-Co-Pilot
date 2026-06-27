# 🚀 Rescue Co-Pilot - User Guide

Welcome to the **Rescue Co-Pilot**! This application is designed to act as your autonomous intelligent assistant, managing your tasks, calendars, and habits to maximize productivity and eliminate procrastination.

Even if you have absolutely no technical experience, getting this tool up and running is extremely straightforward.

## 🛠️ Prerequisites
You only need two things to run this application:
1. **Node.js**: The engine that runs this software. [Download Node.js here](https://nodejs.org/) (Choose the LTS version).
2. **A Gemini AI API Key**: The intelligence behind your assistant. You can get one for free from Google at [Google AI Studio](https://aistudio.google.com/).

## ⚙️ Initial Setup Guide

### 1. Download & Prepare the Project
1. Clone or download this code to your computer.
2. Open your computer's terminal (or command prompt), and navigate to this folder. Like so:
   ```bash
   cd path/to/rescue-co-pilot
   ```
3. Request your computer to download all the necessary background packages the app requires by typing:
   ```bash
   npm install
   ```

### 2. Enter Your API Keys
In the main folder of the project, you need a secret configuration file named `.env`.
1. Locate the `.env.example` file in the folder.
2. Rename it to exactly `.env` (don't forget the dot!).
3. Open `.env` in any text editor (like Notepad), and change the API key to the one you generated on Google AI Studio:
   ```env
   GEMINI_API_KEY="paste_your_key_here"
   ```

*(This keeps your private key safely hidden on your computer. Note: Google Client API keys in the `.env` are completely optional if you just want to use the app out of the box).*

### 3. Launching the App
Now that you've told it where its brains come from, you can start the engine!
In your terminal where your project is open, type the following:
```bash
npm run dev
```

### 4. Use the Service!
Once the app boots up, you will see a text that says `Rescue CoPilot Server initialized on http://localhost:3000`.

- Open any internet browser (Chrome, Edge, Safari, etc.)
- In the address bar, type: **`http://localhost:3000`**
- Press **Enter**.

That's it! You are in. 🎯 

## 💡 How to use the Assistant
- **Landing Page**: Click the "Enter Active Control Room" to get started. 
- **Tasks Menu**: Add tasks you are putting off naturally by voice or typing! E.g. "I need to file my taxes by Thursday." The AI will intercept this phrase, generate a priority threat level, and immediately break down *Filing your taxes* into 3-4 bite-sized sub-tasks automatically.
- **Smart Analytics**: The AI tracks your 'Stress Capacity Score' against your impending deadlines to warn you visually!
- **Daily Habits**: Keep track of simple habits like Focus sprints and Inbox cleanups directly from the dashboard edge.

You don't need any complex installation. Welcome to autonomic productivity.
