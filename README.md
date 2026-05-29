# 🤖 InterviewIQ.AI — AI Powered Smart Interview Platform

A full-stack MERN application that simulates real interview experiences using AI. Features include role-based question generation, voice interaction (speech-to-text & text-to-speech), timer-based simulation, AI answer evaluation, downloadable PDF reports, and interview history analytics.

![MERN Stack](https://img.shields.io/badge/Stack-MERN-green) ![AI Powered](https://img.shields.io/badge/AI-Gemini-blue) ![Voice](https://img.shields.io/badge/Voice-Web_Speech_API-orange)

---

## ✨ Features

- **🔐 Google OAuth Login** — Secure authentication with Google
- **📄 Resume Parsing** — Upload PDF resume for personalized questions
- **🎙️ Voice Interview** — Speak your answers using Web Speech API
- **🔊 AI Reads Questions** — Text-to-speech for interview questions
- **⏱️ Timer Simulation** — 60-second countdown per question
- **🤖 AI Question Generation** — Role, experience & resume-based questions via Gemini
- **📊 AI Answer Evaluation** — Real-time scoring with detailed feedback
- **📋 Performance Report** — Strengths, weaknesses, improvement suggestions
- **📥 PDF Download** — Export detailed interview report as PDF
- **📈 Interview History** — Track all past interviews with analytics

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router v6 |
| Styling | Vanilla CSS (custom design system) |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| AI Engine | Google Gemini API |
| Auth | Google OAuth 2.0 + JWT |
| Voice | Web Speech API (browser) |
| PDF | jsPDF (client-side) |

---

## 📋 Prerequisites

Before you begin, make sure you have:

1. **Node.js** (v18 or later) — [Download](https://nodejs.org/)
2. **MongoDB** — Either:
   - [MongoDB Community](https://www.mongodb.com/try/download/community) installed locally, OR
   - A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) free cluster (recommended)
3. **Google Cloud Console** account — For OAuth & Gemini API
4. **Chrome browser** — For Web Speech API support

---

## 🚀 Step-by-Step Setup Instructions

### Step 1: Clone/Download the Project

```bash
cd project0
```

### Step 2: Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Navigate to **APIs & Services → Credentials**
4. Click **Create Credentials → OAuth 2.0 Client IDs**
5. Choose **Web application**
6. Add these Authorized JavaScript origins:
   ```
   http://localhost:5173
   ```
7. Add these Authorized redirect URIs:
   ```
   http://localhost:5173
   ```
8. Copy the **Client ID** — you'll need it in Step 5

### Step 3: Get Google Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click **Create API Key**
3. Copy the API key — you'll need it in Step 5

### Step 4: Setup MongoDB

**Option A: MongoDB Atlas (Recommended)**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user (username/password)
4. Get your connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/interviewiq
   ```

**Option B: Local MongoDB**
1. Install MongoDB Community Edition
2. Start MongoDB service
3. Connection string: `mongodb://localhost:27017/interviewiq`

### Step 5: Configure Environment Variables

**Backend (server/.env)**
```bash
cd server
copy .env.example .env
```

Edit `server/.env` and fill in your values:
```env
MONGODB_URI=mongodb+srv://your_username:your_password@cluster0.xxxxx.mongodb.net/interviewiq
JWT_SECRET=generate_a_random_string_here_at_least_32_chars
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GEMINI_API_KEY=your_gemini_api_key
PORT=5000
CLIENT_URL=http://localhost:5173
```

> 💡 **Tip:** Generate a JWT secret using: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

**Frontend (client/.env)**
```bash
cd client
copy .env.example .env
```

Edit `client/.env`:
```env
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

> ⚠️ The Google Client ID must be the SAME in both server and client .env files.

### Step 6: Install Dependencies

Open **two terminal windows**:

**Terminal 1 — Backend:**
```bash
cd server
npm install
```

**Terminal 2 — Frontend:**
```bash
cd client
npm install
```

### Step 7: Run the Application

**Terminal 1 — Start Backend:**
```bash
cd server
npm run dev
```
You should see:
```
🚀 InterviewIQ Server running on port 5000
📡 API: http://localhost:5000/api
❤️  Health: http://localhost:5000/api/health
MongoDB Connected: ...
```

**Terminal 2 — Start Frontend:**
```bash
cd client
npm run dev
```
You should see:
```
  VITE v6.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

### Step 8: Open in Browser

1. Open **Chrome** and go to `http://localhost:5173`
2. You should see the InterviewIQ.AI landing page
3. Click **Login** → **Continue with Google**
4. After login, you'll be redirected to the Dashboard

---

## 🎮 How to Use

1. **Login** — Click Login and sign in with Google
2. **Upload Resume** (Optional) — Upload your PDF resume on the Dashboard
3. **Start Interview** — Click "Start Interview", fill in:
   - Your target role (e.g., "Frontend Developer")
   - Experience level (e.g., "2 years")
   - Interview mode (Technical / HR / Combined)
   - Number of questions (5, 10, or 15)
4. **Answer Questions** — 
   - Listen to the AI read the question aloud
   - Type or speak your answer (click the 🎙️ mic button)
   - Submit before the 60-second timer runs out
   - View instant feedback after each answer
5. **View Report** — After all questions:
   - See your overall score and detailed breakdown
   - Review strengths, weaknesses, and improvement suggestions
   - Download the full report as a PDF
6. **Track Progress** — View all past interviews in the History page

---

## 📁 Project Structure

```
project0/
├── client/                  # React Frontend (Vite)
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # React Context (Auth)
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service
│   │   ├── styles/          # CSS stylesheets
│   │   ├── App.jsx          # Root component
│   │   └── main.jsx         # Entry point
│   └── package.json
│
├── server/                  # Express Backend
│   ├── config/              # DB config
│   ├── controllers/         # Route handlers
│   ├── middleware/           # Auth middleware
│   ├── models/              # Mongoose models
│   ├── routes/              # API routes
│   ├── services/            # AI service (Gemini)
│   ├── uploads/             # Temp resume uploads
│   ├── server.js            # Entry point
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|---------|-------------|
| POST | `/api/auth/google` | Google OAuth login |
| GET | `/api/auth/profile` | Get user profile |
| POST | `/api/resume/upload` | Upload & parse resume |
| GET | `/api/resume` | Get resume info |
| DELETE | `/api/resume` | Delete resume |
| POST | `/api/interview/start` | Start new interview |
| POST | `/api/interview/:id/answer` | Submit answer |
| POST | `/api/interview/:id/complete` | Complete & generate report |
| GET | `/api/interview/:id` | Get interview details |
| GET | `/api/interview/history` | Get interview history |

---

## ⚠️ Troubleshooting

| Issue | Solution |
|-------|---------|
| Google login not working | Check that the Client ID matches in both .env files and that `http://localhost:5173` is in your OAuth authorized origins |
| MongoDB connection failed | Verify your connection string and that MongoDB is running |
| Voice recording not working | Use Chrome browser and allow microphone permissions |
| AI questions not generating | Check your Gemini API key is valid and has quota remaining |
| CORS errors | Make sure `CLIENT_URL` in server .env is `http://localhost:5173` |

---

## 📝 License

This project is built for educational purposes as a final year CSE project.

---

Built with ❤️ using MERN Stack + Google Gemini AI
