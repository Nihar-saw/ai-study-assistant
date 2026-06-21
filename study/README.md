# 📚 Lumina AI — Premium AI-Powered Study Platform

Lumina AI is a state-of-the-art, premium study platform designed to elevate learning, note-taking, assessment, and revision. By leveraging advanced AI models (both local models via **Ollama** and cloud APIs via **Groq** and **Google Gemini**), Lumina AI parses study documents, designs intelligent study plans, generates active-recall flashcards, and pinpoints knowledge gaps with detailed weakness analytics.

---

## 🚀 Key Features

*   **📂 Document Management Hub**: Upload, manage, and process study materials in PDF format.
*   **💬 Context-Aware AI Chat**: Real-time interactive Q&A with your uploaded documents to ask questions, explain complex formulas, or summarize concepts.
*   **🗓️ AI Study Planner**: Generate customized, step-by-step study plans based on target dates and page count.
*   **🧭 Visual Learning Roadmaps**: Interactive graph layouts powered by ReactFlow mapping out learning stages for complex subjects.
*   **📝 Smart Notes Editor**: Rich-text notes editor (React Quill) with AI-powered expansion, summarization, and LaTeX rendering.
*   **🃏 Flashcard Decks**: Dynamically generated flashcards with flip animations and active-recall tracking.
*   **⏱️ Quizzes & Exam Simulations**: Custom quizzes and timed exam preps generated from your documents or topics.
*   **📈 Weakness & Analytics Dashboard**: Visualized insights tracking daily XP, study streaks, and specific topic gaps based on your performance.
*   **🔁 Revision Queue**: Spaced repetition tracking to resurface concepts before they fade from memory.
*   **🏆 Gamification**: Interactive achievements, experience points (XP), scholar levels, and daily streaks.

---

## 🛠️ Technology Stack

### Frontend
*   **Core**: React 19, Vite
*   **Styling & UI**: Tailwind CSS (v4), Framer Motion, Material Symbols
*   **Interactive Components**: React Quill (Notes), LaTeX & KaTeX (Equations), Lucide React (Icons)
*   **Navigation**: React Router (v7)

### Backend
*   **Core**: Node.js, Express
*   **Database**: MongoDB (via Mongoose ODM)
*   **File Handling**: Multer & PDF.js (for client-side/server-side document parsing)
*   **Security**: JSON Web Tokens (JWT) & Bcrypt.js

### AI Engines
*   **Local Inference**: [Ollama](https://ollama.com/) (defaults to `llama3.2:3b` for local, private PDF analysis)
*   **Cloud Inference**: Google Generative AI (Gemini) & Groq API

---

## 📁 Repository Structure

```text
ai-study-assistant/
├── backend/
│   ├── src/
│   │   ├── config/       # Database & API configuration
│   │   ├── controllers/  # API business logic handlers
│   │   ├── middleware/   # JWT authentication & upload validators
│   │   ├── models/       # Mongoose schemas (User, Notes, Quiz, Roadmap, etc.)
│   │   ├── routes/       # Express route handlers
│   │   ├── services/     # AI model & external API connections
│   │   ├── utils/        # Loggers & PDF parsers
│   │   ├── app.js        # Express application setup
│   │   └── server.js     # Entry point
│   ├── package.json
│   └── .env
│
├── frontend/
│   └── study/            # Vite-React workspace
│       ├── src/
│       │   ├── api/          # Axios instance & endpoints
│       │   ├── components/   # Common components (Sidebar, Card, Modal)
│       │   ├── context/      # Auth & Study state providers
│       │   ├── layouts/      # Dashboard and Auth wrappers
│       │   ├── pages/        # Dashboard, Flashcards, Analytics, etc.
│       │   ├── routes/       # React Router configurations
│       │   └── App.jsx       # App shell
│       ├── package.json
│       └── .env
└── README.md
```

---

## ⚙️ Getting Started

### Prerequisites
*   [Node.js](https://nodejs.org/) (v18 or higher recommended)
*   [MongoDB](https://www.mongodb.com/) (Local server or MongoDB Atlas cluster)
*   [Ollama](https://ollama.com/) (Optional, if running local LLMs)

### Step 1: Clone the Repository
```bash
git clone https://github.com/Nihar-saw/study-platform.git
cd study-platform
```

### Step 2: Setup Backend
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend/` directory and set up the variables:
   ```env
   PORT=8000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   
   # AI Setup
   AI_PROVIDER=ollama # Options: ollama, groq, gemini
   OLLAMA_BASE_URL=http://127.0.0.1:11434
   OLLAMA_MODEL=llama3.2:3b
   
   # Cloud API Keys (optional if using local Ollama)
   groq_api_key=your_groq_api_key
   GEMINI_API_KEY=your_gemini_api_key
   ```
4. Start the backend dev server:
   ```bash
   npm run dev
   ```

### Step 3: Setup Frontend
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend/study
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `frontend/study/` directory:
   ```env
   VITE_API_BASE_URL=http://localhost:8000/api
   ```
4. Start the frontend Vite dev server:
   ```bash
   npm run dev
   ```

---

## 🤖 Running with Local LLM (Ollama)

Lumina AI supports fully local AI text generation & PDF chat.
1. Download and install [Ollama](https://ollama.com/).
2. Pull your model of choice (e.g. `llama3.2:3b`):
   ```bash
   ollama pull llama3.2:3b
   ```
3. Make sure Ollama is running in the background (`http://localhost:11434`).
4. Set `AI_PROVIDER=ollama` and `OLLAMA_MODEL=llama3.2:3b` in the backend `.env`.

---

## 📜 License

This project is licensed under the ISC License.
