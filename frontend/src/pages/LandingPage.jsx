import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import "../pages/LandingPage.css";

const LandingPage = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const onPlayGame = () => {
    navigate("/game");
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  return (
    <div className="landing-wrapper">
      {/* ✅ Logout */}
      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>

      <main className="landing-center" aria-live="polite">
        <h1 className="landing-title">Odd One Out</h1>
        <p className="landing-subtitle">
          Drag • Drop • Decide — find the odd word in each round.
        </p>

        <section className="instruction-card">
          <h2 className="instruction-heading">How to Play</h2>
          <ul className="instruction-list">
            <li>Each round shows 4 words in the blue box.</li>
            <li>3 words belong to the same category, 1 word is different.</li>
            <li>Drag the odd word and drop it into the red box.</li>
            <li>You can change your selection anytime before submit.</li>
          </ul>

          <h2 className="instruction-heading">Scoring</h2>
          <ul className="instruction-list">
            <li>+1 point for every correct answer.</li>
            <li>Bonus points added based on remaining time.</li>
            <li>Final total score is shown when you exit the game.</li>
          </ul>
        </section>

        <div className="landing-button-container">
          <button
            className="btn btn-primary btn-lg play-btn"
            type="button"
            onClick={onPlayGame}
          >
            ▶ Play Game
          </button>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
