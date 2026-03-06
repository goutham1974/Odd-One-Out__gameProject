# 🎮 Odd One Out Game (Team28)

A fun interactive **Odd One Out** word game built with **React + Django**. Players identify the semantically odd word from a set of four, using a drag-and-drop interface with timer-based scoring.

**Live Demo:** [https://odd-one-out.onrender.com](https://odd-one-out.onrender.com)

---

## 📌 Project Title

**ODD ONE OUT GAME**

---

## 👥 Team Members

- **Goutham Reddy**
- **Bhavya**
- **Praveen**
- **Sree Lakshmi**

---

## 🛠️ Technologies Used

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 19, Vite 7, React Router v7 | SPA with client-side routing |
| **Backend** | Django 5.2, Gunicorn | REST API server |
| **Database** | MySQL (Aiven Cloud) | Persistent data storage |
| **Auth** | PBKDF2-SHA256 + Bearer tokens | Secure password hashing & session management |
| **Deployment** | Render (Blueprint) | Backend as web service, frontend as static site |
| **Static Files** | WhiteNoise | Serve Django static files in production |
| **Styling** | Custom CSS (no framework) | Responsive game UI |

---

## 🏗️ Project Architecture

```
┌─────────────────────┐        ┌─────────────────────┐        ┌──────────────┐
│   React Frontend    │──API──▶│   Django Backend     │──SQL──▶│  Aiven MySQL │
│  (Vite Static Site) │        │  (Gunicorn on Render)│        │   (Cloud DB) │
└─────────────────────┘        └─────────────────────┘        └──────────────┘
   odd-one-out.onrender.com      odd-one-out-api.onrender.com
```

### Frontend Structure
```
frontend/src/
├── App.jsx                  # Route definitions
├── main.jsx                 # React entry point
├── api/
│   ├── http.js              # Base fetch wrapper with Bearer token injection
│   └── authApi.js           # Login, register, logout, me API calls
├── auth/
│   ├── AuthContext.jsx       # React Context for auth state management
│   ├── RequireAuth.jsx       # Route guard – redirects unauthenticated users
│   └── tokenStorage.js       # localStorage helpers for JWT-like tokens
├── pages/
│   ├── LoginPage.jsx         # Login + Register form (tabbed UI)
│   ├── LandingPage.jsx       # Game instructions + "Play Game" button
│   ├── GamePage.jsx          # Core game: drag-drop, timer, submit
│   └── FinalResultPage.jsx   # Score summary after game ends
└── styles/                   # CSS for each page
```

### Backend Structure
```
backend/
├── manage.py
├── build.sh                  # Render build script (pip install, collectstatic, migrate)
├── requirements.txt
├── backend/
│   ├── settings.py           # Django config (env-based DB, CORS, SSL)
│   ├── urls.py               # Root URL config
│   └── wsgi.py               # WSGI entry point for Gunicorn
└── hackathon/
    ├── models.py             # AppUser, AppUserMember, AuthSession, WordDataset, GameResult
    ├── views.py              # All API views (auth + game logic)
    ├── auth.py               # Password hashing (PBKDF2), session token generation
    ├── middleware.py          # Custom CORS middleware
    └── urls.py               # API route definitions
```

---

## 🔐 Authentication System

### How It Works

1. **Registration**: User provides name, email/phone, and password → password is hashed with **PBKDF2-SHA256** (260,000 iterations) using a random 16-byte salt → stored in DB
2. **Login**: User submits credentials → server verifies password hash using constant-time comparison (`hmac.compare_digest`) → returns a **session token** (32-byte URL-safe random string)
3. **Session Management**: Token is SHA-256 hashed before storage in DB → expires after **7 days** → sent as `Authorization: Bearer <token>` header on every API call
4. **Route Protection**: React's `RequireAuth` component checks `AuthContext` → redirects to `/login` if no active session

### Security Features
- **PBKDF2-SHA256** with 260,000 iterations for password hashing
- **Random salt** per password (16 bytes, base64 encoded)
- **Constant-time comparison** to prevent timing attacks
- **Token hashing** — raw tokens are never stored in the database
- **CORS middleware** — only allows requests from the frontend origin
- **SSL/TLS** — enforced for all database connections in production

---

## 🎮 Game Flow

```
Login/Register → Landing Page → Game Page → (repeating rounds) → Final Result Page
```

### Step-by-Step

1. **Login/Register** (`/login`)
   - Users can login with email/phone + password, or register a new account
   - On success, a Bearer token is stored in `localStorage`

2. **Landing Page** (`/landing`)
   - Shows game instructions and scoring rules
   - "Play Game" button navigates to the game

3. **Game Page** (`/game`)
   - Fetches a random round from `GET /api/round/random`
   - Displays **4 word tiles** in a blue box (3 synonyms + 1 antonym)
   - Player **drags** the odd word into the red **drop box**
   - **30-second countdown timer** per round
   - On submit → `POST /api/round/submit` → shows correct/wrong modal
   - Player clicks "Continue" for the next round
   - When timer hits 0, navigates to final results

4. **Final Result Page** (`/final-result`)
   - Shows total score and rounds played (from `localStorage`)
   - Options: **Play Again** (resets score) or **Home** (back to landing)

---

## 📊 Scoring Formula

```python
def calculate_score(is_correct, time_limit, time_taken):
    base = 1.0 if is_correct else 0.0
    saved = max(0.0, time_limit - time_taken)
    bonus = round(saved * 0.1, 2)
    return round(base + bonus, 2)
```

### Formula Breakdown

| Component | Formula | Description |
|-----------|---------|-------------|
| **Base Score** | `1.0` if correct, `0.0` if wrong | Binary correctness reward |
| **Time Saved** | `max(0, 30 - time_taken)` | Seconds remaining when answered |
| **Time Bonus** | `time_saved × 0.1` | 0.1 points per second saved |
| **Total Score** | `base + bonus` | Final score for the round |

### Scoring Examples

| Answer | Time Taken | Base | Time Saved | Bonus | **Total** |
|--------|-----------|------|------------|-------|-----------|
| ✅ Correct | 5s | 1.0 | 25s | 2.5 | **3.5** |
| ✅ Correct | 15s | 1.0 | 15s | 1.5 | **2.5** |
| ✅ Correct | 28s | 1.0 | 2s | 0.2 | **1.2** |
| ❌ Wrong | 10s | 0.0 | 20s | 0.0 | **0.0** |

> **Key insight:** Wrong answers always score **0** — the bonus only applies when the base score is positive. Fast correct answers are rewarded with up to **4.0 points** per round.

---

## 🧩 How the Word Data Works

### Database Table: `sortonym_words`

| Column | Description |
|--------|-------------|
| `anchor_word` | The reference word (e.g., "Happy") |
| `synonym1–4` | Up to 4 synonyms (e.g., Joyful, Cheerful, Delighted, Glad) |
| `antonym1–4` | Up to 4 antonyms (e.g., Sad, Miserable, Gloomy, Sorrowful) |

### How Rounds Are Generated

```
1. Pick a random row from sortonym_words (ORDER BY RAND)
2. Select 3 random synonyms from synonym1–4
3. Select 1 random antonym from antonym1–4 (this is the "odd one out")
4. Combine into 4 tiles and shuffle randomly
5. Send to frontend: { round_id, anchor_word, tiles[], time_limit }
```

### How Answers Are Validated

```
1. Player submits: { round_id, selected_text, time_taken }
2. Server looks up the WordDataset row by round_id
3. Collects all non-null antonyms [antonym1, antonym2, antonym3, antonym4]
4. Checks if selected_text is IN the antonyms list
5. If yes → correct; if no → incorrect
6. Calculates score using the formula above
7. Saves result to gameresults table
```

---

## 🗄️ Database Models

### AppUser
Stores team/player accounts with hashed passwords.

### AppUserMember
Stores individual member info (name, email, phone) linked to an AppUser.

### AuthSession
Tracks active login sessions with hashed tokens and expiry times.

### WordDataset (`sortonym_words`)
Stores anchor words with their synonyms and antonyms for game rounds.

### GameResult (`gameresults`)
Logs every round submission with scores, timing, and session data as JSON.

---

## 🌐 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/` | No | Health check → `{"status": "ok"}` |
| `POST` | `/api/login` | No | Login with email/phone + password |
| `POST` | `/api/register` | No | Register new account |
| `GET` | `/api/me` | Yes | Get current user + member info |
| `POST` | `/api/logout` | Yes | Revoke current session |
| `GET` | `/api/round/random` | No | Get a random game round |
| `POST` | `/api/round/submit` | Yes | Submit answer for a round |
| `GET` | `/api/my/results` | Yes | Get last 20 game results |

---

## 🚀 Deployment

### Infrastructure

| Service | Platform | URL |
|---------|----------|-----|
| Backend API | Render (Web Service) | `https://odd-one-out-api.onrender.com` |
| Frontend | Render (Static Site) | `https://odd-one-out.onrender.com` |
| Database | Aiven (MySQL, Free Tier) | Cloud-hosted with SSL |

### Environment Variables

**Backend:**
| Variable | Description |
|----------|-------------|
| `SECRET_KEY` | Django secret key (auto-generated) |
| `DEBUG` | `False` in production |
| `ALLOWED_HOSTS` | Render backend hostname |
| `CSRF_TRUSTED_ORIGINS` | Frontend URL with `https://` prefix |
| `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT` | Aiven MySQL credentials |

**Frontend:**
| Variable | Description |
|----------|-------------|
| `VITE_API_BASE` | Backend API URL (baked in at build time) |

---

## 💻 Local Development Setup

### Prerequisites
- Python 3.12+
- Node.js 18+
- MySQL 8.0+

### Backend
```bash
cd backend
pip install -r requirements.txt
# Create .env file with DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, SECRET_KEY, DEBUG=True
python manage.py migrate
python manage.py runserver
```

### Frontend
```bash
cd frontend
npm install
# Optionally create .env with VITE_API_BASE=http://127.0.0.1:8000
npm run dev
```

---

## 🔑 Key Concepts

- **Drag and Drop**: HTML5 native drag-and-drop API (`onDragStart`, `onDragOver`, `onDrop`) for word selection
- **SPA Routing**: React Router v7 with protected routes via `RequireAuth` component
- **Context API**: Global auth state management using React's `createContext` + `useContext`
- **Token-based Auth**: Custom Bearer token system (not JWT) with server-side session storage
- **Time-based Scoring**: Incentivizes both accuracy and speed with a linear time bonus
- **Random Round Generation**: `ORDER BY ?` (MySQL `RAND()`) for unpredictable round selection
- **Unmanaged Models**: `managed = False` for WordDataset and GameResult to use pre-existing DB tables
- **CORS Middleware**: Custom Django middleware that mirrors the request `Origin` header
- **SSL in Production**: `ssl_mode = REQUIRED` for secure database connections to Aiven
