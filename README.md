# 🎯 Rescue CoPilot (Remix: Last-Minute Life Saver)

> **"Because deadlines don't wait, and panic isn't a strategy."**

**Rescue CoPilot** is a high-fidelity, full-stack, AI-driven workspace assistant built to rescue developers and creators from imminent deadline crashes. It translates high-stress, chaotic prompts into structured, highly-actionable, and scheduled micro-milestones. 

Powered by the modern **Google GenAI SDK (Gemini 3.5 Flash)** and **React with Tailwind CSS**, it bridges the gap between passive calendar tools and active, agentic task intervention.

---

## 🚀 Key Features

### 1. 🧠 Agentic Task Decomposition
- **Goal Chunking**: Inputs a massive, vague objective (e.g., *"Deploy my SaaS before tomorrow morning"*), and parses it through Gemini to extract logical, sequenced micro-milestones.
- **Stress-Risk Indexing**: Calculates dynamic priority ratings and identifies hidden complexities before they become bottlenecks.
- **Suggested Time Slots**: Automatically assigns smart, context-aware focus slots based on task complexity.

### 2. ⚡ Autonomous Emergency Rescheduling (Panic Rescue Mode)
- When a high-stress deadline looms, trigger **Panic Mode**.
- The Express backend agent actively evaluates your schedule, deferring lower-priority tasks (e.g., secondary chores, administrative tasks) into later open slots, creating an uninterrupted **Deep-Work Focus Block** for your primary objective.

### 3. 📅 Interactive Live Planner & Google Calendar Syncer
- Visual calendar interface displaying current focus blocks, chores, and deadlines.
- **Bi-Directional Mapping**: Sync tasks straight into the local planner database.
- **Real Google Workspace OAuth Ready**: Supports real upstream writes to Google Calendar using `googleapis` when standard OAuth credentials are provided.

### 4. 💬 The LifeSaver Copilot Chat
- Ask the agent questions, request schedule summaries, or trigger quick tasks.
- Returns **dynamic action states** containing structured prompts, enabling you to apply changes to your workspace with a single click.

---

## 🛠️ Architecture & Tech Stack

The application is structured as a **full-stack Express + Vite React application** running entirely on a single-port ingress (Port 3000), making it perfectly suited for cloud container hosting (such as Cloud Run) and static code platforms.

- **Frontend**:
  - React 18, Vite
  - Tailwind CSS (configured with beautiful **Inter**, **Space Grotesk**, and **JetBrains Mono** font pairings)
  - `motion` (Framer Motion) for buttery smooth animations and state transitions
  - Lucide React for consistent modern iconography

- **Backend**:
  - Node.js & Express
  - **`@google/genai`**: Utilizes the official modern SDK with structured output mapping
  - **JSON-Backed Database Engine**: Provides clean, local-first state persistence for tasks, timeline blocks, and notifications
  - **Google APIs Support**: Integrated `googleapis` module ready to connect with actual Google accounts

---

## 📋 Environment Configuration

Create a `.env` file in the root folder with the following variables:

```env
# Google Gemini Key (Required for task breakdown and AI agent chatting)
GEMINI_API_KEY=your_gemini_api_key_here

# Google OAuth Credentials (Optional - to enable live Google Calendar syncing)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

---

## 💻 Quick Start & Deployment

### Local Development
1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Start the Dev Server**:
   ```bash
   npm run dev
   ```
3. Open your browser and navigate to `http://localhost:3000`.

### Production Build
To bundle the assets and compile the Express server into a standalone executable:
```bash
npm run build
npm start
```
The application will automatically bundle all frontend files and compile the backend into `dist/server.cjs` for high-performance cold starts in production containers.

---

## 🌟 Hackathon "Vibe & Ship" Highlights

- **No Mock "Tech-Larping"**: All AI calls utilize genuine schema-enforced prompt structures to return actual payload-compliant JSON data, rather than plain text or pre-scripted responses.
- **True Ingress Independence**: Binds natively to host `0.0.0.0` and port `3000` to satisfy strict production hosting limits.
- **Premium Custom Aesthetics**: Hand-designed dark-cockpit layout using rich negative space, custom slate-zinc color systems, elegant gradients, and beautiful typography.
- **Type-Safe throughout**: Full TypeScript schema mapping across both frontend view-states and backend APIs.
