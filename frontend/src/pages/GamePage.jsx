import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/GamePage.css";

const ROUND_TIME = 30;

// ✅ Static dataset (later replace with DB words)
const WORD_BANK = [
  "Apple", "Banana", "Carrot", "Dog",
  "Lion", "Tiger", "Elephant", "Car",
  "Rose", "Lily", "Lotus", "Chair",
  "Red", "Blue", "Green", "Table",
  "Gold", "Silver", "Copper", "Pen",
  "Delhi", "Mumbai", "Chennai", "Laptop",
  "Cricket", "Football", "Hockey", "Pizza",
  "Sun", "Moon", "Earth", "Bottle",
];

const getRandomWords = () => {
  const shuffled = [...WORD_BANK].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 4);
};

const GamePage = () => {
  const navigate = useNavigate();

  const [words, setWords] = useState(getRandomWords());
  const [selectedWord, setSelectedWord] = useState(null);

  const [timer, setTimer] = useState(ROUND_TIME);
  const [gameStarted, setGameStarted] = useState(true);

  // ✅ round count
  const [round, setRound] = useState(1);

  // ✅ only current question score (live display)
  const [currentRoundScore, setCurrentRoundScore] = useState(0);

  // ✅ total score (not displayed live, only used in final page)
  const [totalScore, setTotalScore] = useState(0);

  const intervalRef = useRef(null);

  // Countdown Timer
  useEffect(() => {
    if (!gameStarted) return;

    intervalRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          setGameStarted(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [gameStarted]);

  // Handle Drag Start
  const handleDragStart = (e, word) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", word);
  };

  // Drag Over
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  // Drop logic
  const handleDrop = (e) => {
    e.preventDefault();
    const droppedWord = e.dataTransfer.getData("text/plain");
    if (!droppedWord) return;

    setWords((prevWords) => {
      let updated = prevWords.filter((w) => w !== droppedWord);

      // If old selected exists, return it to blue
      if (selectedWord) {
        updated.push(selectedWord);
      }

      return updated;
    });

    setSelectedWord(droppedWord);
  };

  // Remove selected from red box
  const handleRemoveSelected = () => {
    if (!selectedWord) return;
    setWords((prev) => [...prev, selectedWord]);
    setSelectedWord(null);
  };

  // ✅ Submit Answer
  const handleSubmitAnswer = () => {
    if (!selectedWord) {
      alert("Please select a word");
      return;
    }

    setGameStarted(false);

    // ✅ calculate score for ONLY this round
    // +1 base + bonus 0.1 per second saved
    const roundScore = +(1 + timer * 0.1).toFixed(2);

    // ✅ update current round score display
    setCurrentRoundScore(roundScore);

    // ✅ update total score in background
    setTotalScore((prev) => +(prev + roundScore).toFixed(2));

    // ✅ next round in same page
    setTimeout(() => {
      setRound((prev) => prev + 1);
      setWords(getRandomWords());
      setSelectedWord(null);
      setTimer(ROUND_TIME);
      setGameStarted(true);
      setCurrentRoundScore(0); // reset current round score display
    }, 500);
  };

  // ✅ Exit Game → Final Result Page
  const handleExitGame = () => {
    // ✅ store final results
    localStorage.setItem("finalScore", totalScore);
    localStorage.setItem("roundsPlayed", round);

    navigate("/final-result");
  };

  return (
    <div className="game-container">
      <h1>Odd One Out Game</h1>

      {/* ✅ Round */}
      <h3 className="round-text">Round: {round}</h3>

      {/* ✅ Current Round Score Only */}
      <h3 className="score-text">
        Current Question Score: {currentRoundScore}
      </h3>

      {/* Timer */}
      <div className="timer">
        <h2>
          Time:{" "}
          <span className={timer < 10 ? "timer-warning" : ""}>{timer}s</span>
        </h2>
      </div>

      {/* Game Board */}
      <div className="game-board">
        {/* Blue Box */}
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

        {/* Red Box */}
        <div
          className="word-box red-box"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <h3>Drop Here</h3>

          {selectedWord ? (
            <div className="word-tile selected" onClick={handleRemoveSelected}>
              <span>{selectedWord}</span>
              <span className="remove-btn">✕</span>
            </div>
          ) : (
            <p className="placeholder">Drag a word here</p>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="button-group">
        <button
          className="submit-btn"
          onClick={handleSubmitAnswer}
          disabled={!selectedWord}
        >
          Submit Answer
        </button>

        <button className="exit-btn" onClick={handleExitGame}>
          Exit Game
        </button>
      </div>
    </div>
  );
};

export default GamePage;
