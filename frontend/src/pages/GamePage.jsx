import React, { useState, useEffect, useRef } from "react";
import "../styles/GamePage.css";

const ROUND_TIME = 30;

const GamePage = () => {
  const initialWords = ["Apple", "Banana", "Carrot", "Dog"];

  const [words, setWords] = useState(initialWords);
  const [selectedWord, setSelectedWord] = useState(null);

  const [timer, setTimer] = useState(ROUND_TIME);
  const [gameStarted, setGameStarted] = useState(true);

  // ✅ modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const intervalRef = useRef(null);

  // Countdown Timer
  useEffect(() => {
    if (!gameStarted) return;

    intervalRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
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

  // ✅ Drop logic
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

    // ✅ show confirmation modal immediately after drop
    setShowConfirmModal(true);
  };

  // Remove selected from red box
  const handleRemoveSelected = () => {
    if (!selectedWord) return;
    setWords((prev) => [...prev, selectedWord]);
    setSelectedWord(null);
    setShowConfirmModal(false);
  };

  // ✅ Confirm submission
  const handleConfirmSubmit = async () => {
    if (!selectedWord) return;

    setShowConfirmModal(false);
    setGameStarted(false);

    const timeTaken = ROUND_TIME - timer;
    const secondsSaved = timer;

    const payload = {
      roundId: 1,
      selectedWord,
      timeTaken,
      secondsSaved,
    };

    try {
      const res = await fetch("http://127.0.0.1:8000/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data?.error || "Submission failed");
        return;
      }

      // ✅ optional: show result modal later
      alert(
        `✅ Result: ${data.correct ? "Correct" : "Wrong"}\nPoints: ${data.totalPoints}`
      );
    } catch (err) {
      console.error(err);
      alert("Backend connection failed");
    }
  };

  // ✅ close modal and allow reselect
  const handleChangeSelection = () => {
    setShowConfirmModal(false);
  };

  return (
    <div className="game-container">
      <h1>Odd One Out Game</h1>

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
            // ✅ ONLY UPDATED THIS PART (X spacing, no button box)
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
          onClick={() => setShowConfirmModal(true)}
          disabled={!selectedWord}
        >
          Submit Answer
        </button>
        <button className="exit-btn" onClick={() => alert("Exit Game")}>
          Exit Game
        </button>
      </div>

      {/* ✅ Confirmation Modal (centered) */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2>Confirm Selection</h2>
            <p>
              You selected: <b>{selectedWord}</b>
            </p>

            <div className="modal-buttons">
              <button className="modal-confirm" onClick={handleConfirmSubmit}>
                Confirm
              </button>
              <button className="modal-change" onClick={handleChangeSelection}>
                Change
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GamePage;
