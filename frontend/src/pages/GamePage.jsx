import React, { useState, useEffect } from 'react';
import '../styles/GamePage.css';

const GamePage = () => {
  const [words, setWords] = useState(['Apple', 'Banana', 'Carrot', 'Dog']);
  const [selectedWord, setSelectedWord] = useState(null);
  const [timer, setTimer] = useState(30);
  const [gameStarted, setGameStarted] = useState(true);

  // Countdown Timer
  useEffect(() => {
    if (gameStarted && timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameStarted, timer]);

  // Handle Drag Start
  const handleDragStart = (e, word) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', word);
  };

  // Handle Drag Over
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // Handle Drop
  const handleDrop = (e) => {
    e.preventDefault();
    const word = e.dataTransfer.getData('text/plain');
    setSelectedWord(word);
  };

  // Handle Submit
  const handleSubmit = () => {
    if (selectedWord) {
      alert(`You selected: ${selectedWord}`);
      // Send to backend for validation
    } else {
      alert('Please select a word');
    }
  };

  // Remove word from red box
  const handleRemoveSelected = () => {
    setSelectedWord(null);
  };

  return (
    <div className="game-container">
      <h1>Odd One Out Game</h1>
      
      {/* Timer */}
      <div className="timer">
        <h2>Time: <span className={timer < 10 ? 'timer-warning' : ''}>{timer}s</span></h2>
      </div>

      {/* Game Board */}
      <div className="game-board">
        
        {/* Blue Box - Words */}
        <div className="word-box blue-box">
          <h3>Select the Odd One Out</h3>
          <div className="words-container">
            {words.map((word, index) => (
              <div
                key={index}
                className="word-tile"
                draggable
                onDragStart={(e) => handleDragStart(e, word)}
              >
                {word}
              </div>
            ))}
          </div>
        </div>

        {/* Red Box - Drop Zone */}
        <div
          className="word-box red-box"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <h3>Drop Here</h3>
          {selectedWord ? (
            <div className="word-tile selected" onClick={handleRemoveSelected}>
              {selectedWord}
              <span className="remove-btn">✕</span>
            </div>
          ) : (
            <p className="placeholder">Drag a word here</p>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="button-group">
        <button className="submit-btn" onClick={handleSubmit}>Submit Answer</button>
        <button className="exit-btn">Exit Game</button>
      </div>
    </div>
  );
};

export default GamePage;