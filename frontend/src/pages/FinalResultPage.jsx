import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import "../styles/FinalResultPage.css";

const FinalResultPage = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const finalScore = Number(localStorage.getItem("finalScore")) || 0;
  const roundsPlayed = Number(localStorage.getItem("roundsPlayed")) || 0;

  const handlePlayAgain = () => {
    localStorage.removeItem("finalScore");
    localStorage.removeItem("roundsPlayed");
    navigate("/game");
  };

  const handleGoHome = () => {
    navigate("/landing");
  };

  const handleLogout = async () => {
    await signOut();
    localStorage.removeItem("finalScore");
    localStorage.removeItem("roundsPlayed");
    navigate("/login", { replace: true });
  };

  return (
    <div className="final-result-page">
      {/* ✅ Logout Button */}
      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>

      <div className="final-card">
        <h1 className="final-title">🎉 Game Over!</h1>

        <div className="final-score-box">
          <p>
            <span className="label">Rounds Played:</span>
            <span className="value">{roundsPlayed}</span>
          </p>

          <p>
            <span className="label">Total Score:</span>
            <span className="value">{finalScore}</span>
          </p>
        </div>

        <div className="final-buttons">
          <button className="playagain-btn" onClick={handlePlayAgain}>
            Play Again
          </button>

          <button className="home-btn" onClick={handleGoHome}>
            Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinalResultPage;
