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
  const [roundId, setRoundId] = useState(null);

  // ✅ Total score + rounds played
  const [totalScore, setTotalScore] = useState(
    Number(localStorage.getItem("finalScore")) || 0
  );
  const [roundsPlayed, setRoundsPlayed] = useState(
    Number(localStorage.getItem("roundsPlayed")) || 0
  );

  // ✅ Result Modal (only after submit)
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultData, setResultData] = useState({
    correct: false,
    score: 0,
  });

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

      setRoundId(data.round_id);
      setWords(data.tiles.map((t) => t.text));
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

  // ✅ Timer Countdown
  useEffect(() => {
    if (!gameStarted) return;

    intervalRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          setGameStarted(false);
          endTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [gameStarted]);

  // ✅ Drag start
  const handleDragStart = (e, word) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", word);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  /**
   * ✅ Drop logic:
   * - remove dropped word from left list
   * - if already selected, put old selection back into left list
   */
  const handleDrop = (e) => {
    e.preventDefault();
    const droppedWord = e.dataTransfer.getData("text/plain");
    if (!droppedWord) return;

    setWords((prevWords) => {
      let updated = prevWords.filter((w) => w !== droppedWord);

      // if already selected, return it to the list
      if (selectedWord) {
        updated.push(selectedWord);
      }

      return updated;
    });

    setSelectedWord(droppedWord);
  };

  // ✅ Remove selected word using X mark
  const handleRemoveSelected = () => {
    if (!selectedWord) return;

    setWords((prev) => {
      // prevent duplicates
      if (prev.includes(selectedWord)) return prev;
      return [...prev, selectedWord];
    });

    setSelectedWord(null);
  };

  // ✅ Submit answer
  const handleSubmitAnswer = async () => {
    if (!selectedWord || !roundId) return;

    setGameStarted(false);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/round/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          round_id: roundId,
          selected_text: selectedWord,
          time_taken: ROUND_TIME - timer,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data?.message || data?.error || "Submission failed");
        setGameStarted(true);
        return;
      }

      // ✅ Score logic: correct = score_awarded, wrong = 0
      const earnedScore = data.is_correct ? Number(data.score_awarded || 0) : 0;

      setResultData({
        correct: data.is_correct,
        score: earnedScore,
      });

      // update total
      const newTotal = totalScore + earnedScore;
      const newRounds = roundsPlayed + 1;

      setTotalScore(newTotal);
      setRoundsPlayed(newRounds);

      localStorage.setItem("finalScore", newTotal);
      localStorage.setItem("roundsPlayed", newRounds);

      setShowResultModal(true);
    } catch (err) {
      console.error(err);
      alert("Submit failed");
      setGameStarted(true);
    }
  };

  /**
   * ✅ Continue after result popup
   * Correct -> next question
   * Wrong -> same question again and restore word back to left list (so 4 options)
   */
  const handleContinue = () => {
    setShowResultModal(false);

    if (resultData.correct) {
      fetchRound();
    } else {
      // ✅ WRONG -> restore removed option back to left list
      if (selectedWord) {
        setWords((prev) => {
          if (prev.includes(selectedWord)) return prev;
          return [...prev, selectedWord];
        });
      }

      // reset selection
      setSelectedWord(null);
      setGameStarted(true);
    }
  };

  // ✅ Exit game
  const endTest = () => {
    localStorage.setItem("finalScore", totalScore);
    localStorage.setItem("roundsPlayed", roundsPlayed);
    navigate("/final-result");
  };

  return (
    <div className="page-wrapper">
      <div className="game-container">
        <h1>Odd One Out Game</h1>

        {/* Timer */}
        <div className="timer">
          <h2>
            Time:{" "}
            <span className={timer < 10 ? "timer-warning" : ""}>
              {timer}s
            </span>
          </h2>
        </div>

        {/* Score */}
        <div className="score-bar">
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

            <div className="drop-area">
              {selectedWord ? (
                <div className="drop-selected-tile">
                  <span className="drop-word">{selectedWord}</span>
                  <button
                    type="button"
                    className="drop-remove-btn"
                    onClick={handleRemoveSelected}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <p className="placeholder">Drag a word here</p>
              )}
            </div>
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

          <button className="exit-btn" onClick={endTest}>
            Exit Game
          </button>
        </div>

        {/* Result Popup */}
        {showResultModal && (
          <div className="modal-overlay">
            <div className="result-modal">
              <h2 className={resultData.correct ? "correct" : "wrong"}>
                {resultData.correct ? "Correct ✓" : "Wrong ✕"}
              </h2>

              <p className="result-score">Score: {resultData.score}</p>

              <button className="continue-btn" onClick={handleContinue}>
                Continue
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GamePage;