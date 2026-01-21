# 🎮 Odd One Out Game (Team28)

A fun interactive **Odd One Out** game where the player drags and drops the odd word from a set of 4 words into the drop box.  
The game supports **login (OTP + password)**, **round-based gameplay**, **timer-based scoring**, and a **final result page**.

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

## 🛠 Tech Stack
### Frontend
- **React.js**
- React Router DOM
- HTML + CSS

### Backend
- **Python**
- **Django / Django REST Framework**
- REST APIs

### Database
- **MySQL**
- (Optional / Mentioned) **Djongo** (if MongoDB integration used)

---

## ✨ Features
✅ Login Page with:
- OTP Login (Email / WhatsApp)
- Password Login
- Team selection (if required)

✅ Landing Page:
- Instructions + Rules
- Play Game button
- Logout button

✅ Game Page:
- Random round fetch from backend
- Drag & Drop interaction
- Countdown timer per round
- Submit Answer
- Popup result (Correct / Wrong + Score)
- Total score stored in localStorage
- Exit Game button → Final Result Page
- Logout button

✅ Final Result Page:
- Displays total score and rounds played
- Play Again
- Home
- Logout button

---

## 🎯 Game Rules
### Gameplay
- Each round shows **4 words**
- **3 words belong to one category**
- **1 word is the odd one out**
- Drag the odd word and drop it into the **Drop Here** box

### Scoring
- **Correct answer → score_awarded**
- **Wrong answer → score = 0**
- Bonus score can be added based on remaining time (backend logic)

---

## 🔗 API Endpoints Used
### Round APIs
| API | Method | Description |
|-----|--------|-------------|
| `/api/round/random` | GET | Fetch a random round with tiles |
| `/api/round/submit` | POST | Submit selected answer + time taken |

### Auth APIs
| API | Method | Description |
|-----|--------|-------------|
| `/api/auth/login` | POST | Login using username + password |
| `/api/auth/logout` | POST | Logout user |
| `/api/auth/me` | GET | Fetch current logged-in user |
| `/api/auth/otp/request` | POST | Request OTP (email/whatsapp) |
| `/api/auth/otp/verify` | POST | Verify OTP and login |

> ⚠️ Actual endpoint names may vary slightly based on your backend implementation.

---

## 📂 Folder Structure
```
team28/
│
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── ...
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── LandingPage.jsx
│   │   │   ├── GamePage.jsx
│   │   │   ├── FinalResultPage.jsx
│   │   │   └── ...
│   │   ├── styles/
│   │   │   ├── GamePage.css
│   │   │   └── ...
│   │   ├── auth/
│   │   │   ├── AuthContext.jsx
│   │   │   └── tokenStorage.js
│   │   └── api/
│   │       └── authApi.js
│   └── package.json
│
└── README.md
```

---

## ⚙️ Setup Instructions

### ✅ 1) Clone Repository
```bash
git clone <your-repo-url>
cd team28
```

---

## ▶️ Backend Setup (Django)

### Install dependencies
```bash
cd backend
pip install -r requirements.txt
```

### Run backend server
```bash
python manage.py runserver
```

Backend runs at:
```
http://127.0.0.1:8000/
```

---

## ▶️ Frontend Setup (React)

### Install dependencies
```bash
cd frontend
npm install
```

### Run frontend server
```bash
npm start
```

Frontend runs at:
```
http://localhost:3000/
```

---

## 🔐 Environment Variables (Important)
⚠️ Do NOT push `.env` files to GitHub.

Add these to `.gitignore`:
```
.env
backend/.env
frontend/.env
node_modules/
backend/node_modules/
frontend/node_modules/
```

---

## 🚀 How to Play (Flow)
1. Open the website
2. Login using OTP or Password
3. Read rules on Landing Page
4. Click **Play Game**
5. Drag & drop the odd word
6. Click **Submit Answer**
7. View popup result
8. Continue playing rounds
9. Exit game → Final Result Page

---

## 🧠 Authentication Flow
- Login stores JWT token using `tokenStorage.js`
- Token is used in API calls using:
```js
Authorization: `Bearer ${token}`
```

---

## 📌 Notes for Evaluators (Hackathon Explanation)
This project demonstrates:
- Real-time UI interactions (Drag & Drop)
- API integration (REST)
- Authentication using OTP + Password
- Timer-based gameplay logic
- Score management using localStorage
- Clean UI with responsive design

---

## 🧾 License
This project is developed for **Hackathon 2026** (Team28).
