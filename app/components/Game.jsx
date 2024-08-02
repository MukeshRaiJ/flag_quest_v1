"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Image from "next/image";
import styles from "./game.module.css";

const FlagQuest = () => {
  const [countries, setCountries] = useState([]);
  const [currentCountry, setCurrentCountry] = useState(null);
  const [options, setOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [showFact, setShowFact] = useState(false);
  const [highlightCorrect, setHighlightCorrect] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);
  const [gameDuration, setGameDuration] = useState(300);

  useEffect(() => {
    fetch("/countries.json")
      .then((response) => response.json())
      .then((data) => {
        setCountries(data);
        loadNewQuestion(data);
      });
  }, []);

  useEffect(() => {
    if (gameStarted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      alert(`Time's up! Your final score is: ${score}`);
      setGameStarted(false);
    }
  }, [gameStarted, timeLeft]);

  const loadNewQuestion = (data) => {
    const randomCountry = data[Math.floor(Math.random() * data.length)];
    setCurrentCountry(randomCountry);

    const shuffledOptions = [...data]
      .sort(() => 0.5 - Math.random())
      .slice(0, 4);

    if (!shuffledOptions.includes(randomCountry)) {
      shuffledOptions[Math.floor(Math.random() * 4)] = randomCountry;
    }

    setOptions(shuffledOptions);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const droppedCountryName = event.dataTransfer.getData("text/plain");
    if (droppedCountryName === currentCountry.name) {
      setScore(score + 1);
    } else {
      alert("Wrong answer! Try again.");
      setHighlightCorrect(true);
    }
    setShowFact(true);
    setTimeout(() => {
      setShowFact(false);
      setHighlightCorrect(false);
      loadNewQuestion(countries);
    }, 3000);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(gameDuration);
    setGameStarted(true);
  };

  const setDuration = (duration) => {
    setGameDuration(duration);
  };

  return (
    <div className={styles.container}>
      {!gameStarted ? (
        <Card className={styles.card}>
          <CardHeader className={styles.header}>
            <div className={styles.headerContent}>
              <div className={styles.title}>
                <Image
                  src="/logo.png"
                  alt="Flag Quest Logo"
                  width={50}
                  height={50}
                  className={styles.logo}
                />
                Flag Quest
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className={styles.intro}>
              <h2 className={styles.welcome}>Welcome to Flag Quest!</h2>
              <p className={styles.rules}>
                Select the game duration and start playing.
              </p>
            </div>
            <div className={styles.gameSettings}>
              <div className={styles.durationButtons}>
                <button
                  onClick={() => setDuration(180)}
                  className={`${styles.durationButton} ${
                    gameDuration === 180 ? styles.selectedButton : ""
                  }`}
                >
                  3 Minutes
                </button>
                <button
                  onClick={() => setDuration(300)}
                  className={`${styles.durationButton} ${
                    gameDuration === 300 ? styles.selectedButton : ""
                  }`}
                >
                  5 Minutes
                </button>
              </div>
              <button onClick={startGame} className={styles.startButton}>
                Let's play the game!
              </button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className={styles.card}>
          <CardHeader className={styles.header}>
            <div className={styles.headerContent}>
              <div className={styles.title}>
                <Image
                  src="/logo.png"
                  alt="Flag Quest Logo"
                  width={50}
                  height={50}
                  className={styles.logo}
                />
                Flag Quest
              </div>
              <div className={styles.score}>Score: {score}</div>
              <div className={styles.timer}>
                Time Left:{" "}
                {`${Math.floor(timeLeft / 60)}:${
                  timeLeft % 60 < 10 ? "0" : ""
                }${timeLeft % 60}`}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {currentCountry && (
              <div>
                <div className={styles.question}>
                  <h2>Which country is {currentCountry.name}?</h2>
                  <div
                    className={styles.dropZone}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                  >
                    Drop the flag here
                  </div>
                </div>
                <div className={styles.options}>
                  {options.map((option) => (
                    <Image
                      key={option.name}
                      src={option.flag}
                      alt={option.name}
                      width={100}
                      height={70}
                      className={`${styles.flag} ${
                        highlightCorrect && option.name === currentCountry.name
                          ? styles.correctFlag
                          : ""
                      }`}
                      draggable
                      onDragStart={(event) =>
                        event.dataTransfer.setData("text/plain", option.name)
                      }
                    />
                  ))}
                </div>
                {showFact && (
                  <div className={styles.fact}>
                    <p>
                      {currentCountry.name} is a beautiful country situated in{" "}
                      {currentCountry.continent}.
                    </p>
                    <p>{currentCountry.fact}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FlagQuest;
