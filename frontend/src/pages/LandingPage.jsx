import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../pages/LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  const onPlayGame = () => {
    navigate('/game');
  };

  return (
    <div className="landing-wrapper">
      <main className="landing-center" aria-live="polite">
        <h1 className="landing-title">Welcome to hackathon</h1>
        <p className="landing-subtitle">This is your Starting point of your hackathon.</p>
        
        {/* Play Game Button with Extra Padding */}
        <div className="landing-button-container">
          <button 
            className="btn btn-primary btn-lg" 
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