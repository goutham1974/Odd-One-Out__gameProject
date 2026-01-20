import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import "../styles/GamePage.css";

const ROUND_TIME = 30;

const GamePage = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [words, setWords] = useState([]);
  const [selectedWord, setSelectedWord] = useState(null);

  const [timer, setTimer] = useState(ROUND_TIME);
  const [gameStarted, setGameStarted] = useState(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [roundId, setRoundId] = useState(null);

  // ✅ total score and rounds
  const [totalScore, setTotalScore] = useState(
    Number(localStorage.getItem("finalScore")) || 0
  );
  const [roundsPlayed, setRoundsPlayed] = useState(
    Number(localStorage.getItem("roundsPlayed")) || 0
  );

  const intervalRef = useRef(null);

  // ✅ Fetch round from backend
  const fetchRound = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/round/random");
      const data = await res.json();

      if (!res.ok) {
        alert(data?.message || "Failed to load round");
        return;
      }

      const roundWords = data.tiles.map((t) => t.text);

      setRoundId(data.round_id);
      setWords(roundWords);
      setSelectedWord(null);

      setTimer(data.time_limit || ROUND_TIME);
      setGameStarted(true);
    } catch (err) {
      console.error(err);
      alert("Backend connection failed (random round)");
    }
  };

  useEffect(() => {
    fetchRound();
  }, []);

  // Countdown Timer
  useEffect(() => {
    if (!gameStarted) return;

    intervalRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          setGameStarted(false);

          alert("⏰ Time up! Round ended.");

          // End test automatically if no answer selected
          endTest();
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

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedWord = e.dataTransfer.getData("text/plain");
    if (!droppedWord) return;

    setWords((prevWords) => {
      let updated = prevWords.filter((w) => w !== droppedWord);

      if (selectedWord) {
        updated.push(selectedWord);
      }

      return updated;
    });

    setSelectedWord(droppedWord);
    setShowConfirmModal(true);
  };

  const handleRemoveSelected = () => {
    if (!selectedWord) return;
    setWords((prev) => [...prev, selectedWord]);
    setSelectedWord(null);
    setShowConfirmModal(false);
  };

  // ✅ Submit answer to backend
  const handleConfirmSubmit = async () => {
    if (!selectedWord || !roundId) return;

    setShowConfirmModal(false);
    setGameStarted(false);

    const timeTaken = ROUND_TIME - timer;

    const payload = {
      round_id: roundId,
      selected_text: selectedWord,
      time_taken: timeTaken,
    };

    try {
      const res = await fetch("http://127.0.0.1:8000/api/round/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ IMPORTANT
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data?.message || data?.error || "Submission failed");
        return;
      }

      alert(
        `✅ Result: ${data.is_correct ? "Correct" : "Wrong"}\nPoints: ${
          data.score_awarded
        }`
      );

      // ✅ update total score + rounds played
      const newTotal = totalScore + Number(data.score_awarded || 0);
      const newRounds = roundsPlayed + 1;

      setTotalScore(newTotal);
      setRoundsPlayed(newRounds);

      localStorage.setItem("finalScore", newTotal);
      localStorage.setItem("roundsPlayed", newRounds);

      // ✅ Load next round automatically
      fetchRound();
    } catch (err) {
      console.error(err);
      alert("Backend connection failed (submit)");
    }
  };

  const handleChangeSelection = () => {
    setShowConfirmModal(false);
  };

  // ✅ END TEST → go to FinalResultPage
  const endTest = () => {
    localStorage.setItem("finalScore", totalScore);
    localStorage.setItem("roundsPlayed", roundsPlayed);
    navigate("/final-result");
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

      {/* Score */}
      <div style={{ marginBottom: "10px", fontWeight: "bold" }}>
        Total Score: {totalScore} | Rounds Played: {roundsPlayed}
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
          onClick={() => setShowConfirmModal(true)}
          disabled={!selectedWord}
        >
          Submit Answer
        </button>

        {/* ✅ END TEST BUTTON */}
        <button className="exit-btn" onClick={endTest}>
          End Test
        </button>
      </div>

      {/* Confirmation Modal */}
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
