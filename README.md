# Persona AI — Chat with Hitesh & Piyush

An AI-powered chat website that simulates conversations with two popular Indian tech educators: **Hitesh Choudhary** (Chai Aur Code) and **Piyush Garg** (@piyushgargdev). The AI uses carefully engineered system prompts to reproduce each person's communication style, teaching approach, and personality.

Website link - https://persona-ai-website-6tna.vercel.app/

---

## Features

- **Real-time streaming responses** via Server-Sent Events (SSE)
- **Switch between personas** — Hitesh Choudhary and Piyush Garg
- **Persona profile header** — real photo, subscriber count, online status, and skill tags per persona
- **Suggested prompts** — clickable topic suggestions that refresh, shown before first message
- **Dark / Light theme toggle** — persisted across sessions via localStorage
- **Real profile photos** fetched from public GitHub avatars
- **Message timestamps** on every message
- **Markdown rendering** with syntax-highlighted code blocks
- **Stop generation** mid-response with a single click
- **Conversation history** preserved per session
- **Model indicator** — GPT-4o-mini badge in the input bar
- **Responsive layout** — adapts to mobile and tablet

---

## Prerequisites

- **Node.js** v18 or later
- **npm** v9 or later
- An **OpenAI API key** ([get one here](https://platform.openai.com/api-keys))

---

## Setup

### 1. Clone the project

```bash
git clone https://github.com/YOUR_USERNAME/Persona-AI-Website.git
cd Persona-AI-Website
```

### 2. Set up the backend

```bash
cd backend
npm install
```

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Open `backend/.env` and add your OpenAI API key:

```
OPENAI_API_KEY=sk-your-key-here
PORT=3001
FRONTEND_ORIGIN=http://localhost:5173
```

### 3. Set up the frontend

```bash
cd ../frontend
npm install
```

---

## Running Locally

You need **two terminal windows** running simultaneously.

**Terminal 1 — Backend:**

```bash
cd backend
npm run dev
```

You should see: `Persona AI backend running on http://localhost:3001`

**Terminal 2 — Frontend:**

```bash
cd frontend
npm run dev
```

You should see: `Local: http://localhost:5173`

Open **http://localhost:5173** in your browser.

---

## Usage

1. **Select a persona** from the left sidebar — Hitesh Choudhary or Piyush Garg
2. **Use a suggested prompt** or type your own question and press **Enter**
3. Watch the response stream in real time
4. **Switch personas** at any time — you'll be asked to confirm since it clears the conversation
5. Click **■ Stop** to halt a response mid-stream
6. **Toggle the theme** using the ☀️ / 🌙 button in the top-right corner

### What to ask

- JavaScript, TypeScript, Node.js, React questions
- "How do I learn [topic]?"
- "What's the difference between X and Y?"
- "Can you help me debug this error?"
- "Should I learn [technology]?"

---

## Project Structure

```
Persona AI website/
├── backend/
│   ├── src/
│   │   ├── index.js              Express server
│   │   ├── routes/chat.js        POST /api/chat — SSE streaming
│   │   └── personas/
│   │       ├── hitesh.js         Hitesh system prompt + config
│   │       ├── piyush.js         Piyush system prompt + config
│   │       └── index.js          Persona registry
│   ├── api/index.js              Vercel serverless entry point
│   ├── vercel.json               Vercel routing config
│   ├── .env                      Your API key (gitignored)
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx               Theme state + root layout
│   │   ├── main.jsx
│   │   ├── index.css             CSS variables for dark/light themes + all styles
│   │   ├── data/personas.js      Persona metadata (name, photo, tags, suggested prompts)
│   │   ├── hooks/useChat.js      SSE streaming + message state + timestamps
│   │   └── components/
│   │       ├── Header.jsx        Top bar with logo and theme toggle
│   │       ├── PersonaSelector.jsx   Sidebar cards with photo, verified badge, skills
│   │       ├── PersonaHeader.jsx     Profile banner (photo, bio, tags, online status)
│   │       ├── ChatWindow.jsx        Message list + auto-scroll
│   │       ├── MessageBubble.jsx     Single message with markdown + timestamp
│   │       ├── SuggestedPrompts.jsx  Clickable topic pills with refresh
│   │       └── ChatInput.jsx         Textarea + model badge + send button
│   ├── index.html
│   ├── vite.config.js            Proxies /api → localhost:3001 in dev
│   ├── vercel.json               Vercel SPA routing fix
│   └── package.json
├── docs/
│   ├── persona-research.md       How personas were researched
│   ├── prompt-engineering.md     Prompt design strategy
│   └── sample-conversations.md  Sample conversations for both personas
└── README.md
```

---

## Technical Architecture

```
Browser (React + Vite :5173)
        │
        │ POST /api/chat   (Vite proxy in dev / direct URL in prod)
        ▼
Backend (Express :3001)
        │
        │ Injects system prompt + trims history to last 20 messages
        ▼
OpenAI GPT-4o-mini  (stream: true)
        │
        │ text/event-stream  (SSE tokens)
        ▼
Browser updates message bubble in real time
```

**Key design choices:**
- System prompt lives exclusively on the backend — never sent to the browser
- Backend is stateless — frontend sends the full message history each request
- Streaming uses native SSE over `fetch` + `ReadableStream` (no extra libraries)
- Theme preference stored in `localStorage` under `persona-ai-theme`
- Profile photos loaded from public GitHub avatar URLs (`github.com/<username>.png`)

---

## Deploying to Vercel

### Backend

1. Create a new Vercel project, set **Root Directory** to `backend`
2. Add environment variables:
   - `OPENAI_API_KEY` — your OpenAI key
   - `FRONTEND_ORIGIN` — your frontend's Vercel URL

### Frontend

1. Create a new Vercel project, set **Root Directory** to `frontend`
2. Add environment variable:
   - `VITE_API_URL` — your backend's Vercel URL (e.g. `https://persona-ai-backend.vercel.app`)

---

## Documentation

| File | Contents |
|------|----------|
| [docs/persona-research.md](docs/persona-research.md) | How persona data was collected and prepared |
| [docs/prompt-engineering.md](docs/prompt-engineering.md) | Prompt design strategy and context management |
| [docs/sample-conversations.md](docs/sample-conversations.md) | Sample conversations for both personas |

---

## Customisation

### Add a new persona
1. Create `backend/src/personas/yourpersona.js` following the existing format
2. Register it in `backend/src/personas/index.js`
3. Add UI metadata in `frontend/src/data/personas.js` — include `name`, `subtitle`, `skills`, `tags`, `color`, `image`, `suggestedPrompts`, and `greeting`

### Change the model
Edit `model` in the persona file (e.g. `'gpt-4o'` for higher quality, `'gpt-4o-mini'` for lower cost).

### Adjust context window
Edit `maxContextMessages` in the persona file (default: 20).

### Theming
All colors are CSS variables in `frontend/src/index.css`. Dark theme is defined under `:root` / `[data-theme="dark"]`; light theme under `[data-theme="light"]`. Add or override variables there to customize either theme.
