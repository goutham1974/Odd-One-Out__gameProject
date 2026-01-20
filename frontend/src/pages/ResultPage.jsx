import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/ResultPage.css';

const ResultPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [score, setScore] = useState(0);
  const [timeSaved, setTimeSaved] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    // Get data from previous page
    const state = location.state;
    if (state) {
      setScore(state.score || 0);
      setTimeSaved(state.timeSaved || 0);
      setTotalPoints(state.totalPoints || 0);
      setIsCorrect(state.isCorrect || false);
    }
  }, [location.state]);

  const handlePlayAgain = () => {
    navigate('/game');
  };

  const handleGoHome = () => {
    navigate('/landing');
  };

  const handleShare = () => {
    const message = `I scored ${totalPoints} points in Odd One Out Game! 🎮`;
    if (navigator.share) {
      navigator.share({
        title: 'Odd One Out Game',
        text: message,
      });
    } else {
      alert(message);
    }
  };

  return (
    <div className="result-container">
      <div className="result-card">
        {/* Result Status */}
        <div className={`result-status ${isCorrect ? 'correct' : 'incorrect'}`}>
          {isCorrect ? (
            <>
              <div className="result-icon correct-icon">✓</div>
              <h1>Correct Answer!</h1>
            </>
          ) : (
            <>
              <div className="result-icon incorrect-icon">✕</div>
              <h1>Wrong Answer!</h1>
            </>
          )}
        </div>

        {/* Score Breakdown */}
        <div className="score-breakdown">
          <div className="score-item">
            <label>Base Score</label>
            <span className="score-value">{score}</span>
          </div>

          <div className="score-item">
            <label>Time Bonus</label>
            <span className="score-value bonus">+{(timeSaved * 0.1).toFixed(2)}</span>
          </div>

          <div className="score-divider"></div>

          <div className="score-item total">
            <label>Total Points</label>
            <span className="score-value total-value">{totalPoints.toFixed(2)}</span>
          </div>
        </div>

        {/* Details */}
        <div className="result-details">
          <p>Time Saved: <strong>{timeSaved} seconds</strong></p>
          <p>Calculation: {score} + ({timeSaved} × 0.1) = {totalPoints.toFixed(2)}</p>
        </div>

        {/* Action Buttons */}
        <div className="result-buttons">
          <button className="btn btn-primary" onClick={handlePlayAgain}>
            Play Again
          </button>
          <button className="btn btn-secondary" onClick={handleShare}>
            Share Score
          </button>
          <button className="btn btn-tertiary" onClick={handleGoHome}>
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;