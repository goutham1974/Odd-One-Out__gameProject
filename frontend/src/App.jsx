import { Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from './pages/LoginPage.jsx'
import LandingPage from './pages/LandingPage.jsx'
import GamePage from './pages/GamePage.jsx'
import FinalResultPage from './pages/FinalResultPage.jsx'
import RequireAuth from './auth/RequireAuth.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/landing"
        element={
          <RequireAuth>
            <LandingPage />
          </RequireAuth>
        }
      />

      <Route
        path="/game"
        element={
          <RequireAuth>
            <GamePage />
          </RequireAuth>
        }
      />

      {/* ✅ ADDED FINAL RESULT ROUTE */}
      <Route
        path="/final-result"
        element={
          <RequireAuth>
            <FinalResultPage />
          </RequireAuth>
        }
      />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
