"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { MoonIcon, SunIcon, HelpCircle, Award } from "lucide-react";
import Image from "next/image";
import { Progress } from "@/components/ui/progress";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
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
  const [selectedRegion, setSelectedRegion] = useState("World");
  const [showHint, setShowHint] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [streak, setStreak] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [gameMode, setGameMode] = useState("flag"); // "flag" or "capital"

  useEffect(() => {
    fetch("/countries1.json")
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
      endGame();
    }
  }, [gameStarted, timeLeft]);

  const loadNewQuestion = (data) => {
    const filteredCountries =
      selectedRegion === "World"
        ? data
        : data.filter((country) => country.continent === selectedRegion);

    const randomCountry =
      filteredCountries[Math.floor(Math.random() * filteredCountries.length)];
    setCurrentCountry(randomCountry);

    const shuffledOptions = [...filteredCountries]
      .sort(() => 0.5 - Math.random())
      .slice(0, 4);

    if (!shuffledOptions.includes(randomCountry)) {
      shuffledOptions[Math.floor(Math.random() * 4)] = randomCountry;
    }

    setOptions(shuffledOptions);
    setShowDetails(false);
  };

  const handleOptionClick = (selectedOption) => {
    const isCorrect =
      gameMode === "flag"
        ? selectedOption.name === currentCountry.name
        : selectedOption === currentCountry.capital;

    if (isCorrect) {
      setScore(score + 1);
      setStreak(streak + 1);
      setShowDetails(true);
      if ((streak + 1) % 5 === 0) {
        confetti();
      }
    } else {
      setStreak(0);
      setHighlightCorrect(true);
    }

    setTimeout(() => {
      setShowDetails(false);
      setShowHint(false);
      setHighlightCorrect(false);
      loadNewQuestion(countries);
    }, 5000); // Increased timeout to allow reading details
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(gameDuration);
    setHintsUsed(0);
    setStreak(0);
    setGameStarted(true);
  };

  const endGame = () => {
    alert(`Time's up! Your final score is: ${score}`);
    setGameStarted(false);
  };

  const handleShowHint = () => {
    setShowHint(true);
    setHintsUsed(hintsUsed + 1);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const renderCountryDetails = () => {
    if (!showDetails) return null;

    return (
      <motion.div
        className={styles.countryDetails}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
      >
        <h3>{currentCountry.name}</h3>
        <p>
          {currentCountry.name} is a beautiful country situated in{" "}
          {currentCountry.continent}. The capital of {currentCountry.name} is{" "}
          {currentCountry.capital}, and the currency used there is the{" "}
          {currentCountry.currency}. The total area of {currentCountry.name} is{" "}
          {currentCountry.totalArea.toLocaleString()} km², with a GDP per capita
          of ${currentCountry.gdpPerCapita.toLocaleString()}. Some iconic places
          in {currentCountry.name} include{" "}
          {currentCountry.iconicPlaces.join(", ")}.
        </p>
        <p>{currentCountry.fact}</p>
        <a
          href={currentCountry.wikiLink}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.wikiLink}
        >
          Learn more on Wikipedia
        </a>
      </motion.div>
    );
  };

  const renderGameContent = () => {
    if (gameMode === "flag") {
      return (
        <>
          <h2 className={styles.question}>
            Which flag belongs to {currentCountry.name}?
          </h2>
          <div className={styles.options}>
            {options.map((option) => (
              <motion.div
                key={option.name}
                className={`${styles.flagContainer} ${
                  highlightCorrect && option.name === currentCountry.name
                    ? styles.correctFlag
                    : ""
                }`}
                onClick={() => handleOptionClick(option)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Image
                  src={option.flag}
                  alt={`Flag of ${option.name}`}
                  width={100}
                  height={70}
                  className={styles.flag}
                />
              </motion.div>
            ))}
          </div>
        </>
      );
    } else {
      return (
        <>
          <h2 className={styles.question}>
            What is the capital of {currentCountry.name}?
          </h2>
          <div className={styles.options}>
            {options.map((option) => (
              <motion.button
                key={option.capital}
                className={`${styles.optionButton} ${
                  highlightCorrect && option.capital === currentCountry.capital
                    ? styles.correctOption
                    : ""
                }`}
                onClick={() => handleOptionClick(option.capital)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {option.capital}
              </motion.button>
            ))}
          </div>
        </>
      );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`${styles.container} ${darkMode ? styles.dark : ""}`}
    >
      <Card className={styles.card}>
        <CardHeader className={styles.header}>
          <div className={styles.headerContent}>
            <motion.div
              className={styles.title}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Image
                src="/logo.png"
                alt="Flag Quest Logo"
                width={50}
                height={50}
                className={styles.logo}
              />
              Flag Quest
            </motion.div>
            <div className={styles.controls}>
              <div className={styles.darkModeToggle}>
                <SunIcon className={styles.darkModeIcon} />
                <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
                <MoonIcon className={styles.darkModeIcon} />
              </div>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowRules(!showRules)}
              >
                <HelpCircle className={styles.helpIcon} />
              </motion.div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <AnimatePresence>
            {showRules && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={styles.rules}
              >
                <h3>How to Play</h3>
                <p>1. Choose between guessing flags or capitals.</p>
                <p>2. Select the correct answer from the options provided.</p>
                <p>
                  3. Use hints if you're stuck, but they'll cost you points!
                </p>
                <p>4. Try to get the highest score before time runs out.</p>
                <p>
                  5. Learn interesting facts about each country after correct
                  answers.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          {!gameStarted ? (
            <motion.div
              className={styles.gameSettings}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className={styles.welcome}>Welcome to Flag Quest!</h2>
              <p className={styles.rules}>
                Select the game mode, duration, and region, then start playing.
              </p>
              <div className={styles.settingsGroup}>
                <Select
                  onValueChange={(value) => setSelectedRegion(value)}
                  defaultValue={selectedRegion}
                >
                  <SelectTrigger className={styles.selectTrigger}>
                    <SelectValue placeholder="Select Region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="World">World</SelectItem>
                    <SelectItem value="Africa">Africa</SelectItem>
                    <SelectItem value="Asia">Asia</SelectItem>
                    <SelectItem value="Europe">Europe</SelectItem>
                    <SelectItem value="North America">North America</SelectItem>
                    <SelectItem value="Oceania">Oceania</SelectItem>
                    <SelectItem value="South America">South America</SelectItem>
                  </SelectContent>
                </Select>
                <div className={styles.durationButtons}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setGameDuration(180)}
                    className={`${styles.durationButton} ${
                      gameDuration === 180 ? styles.selectedButton : ""
                    }`}
                  >
                    3 Minutes
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setGameDuration(300)}
                    className={`${styles.durationButton} ${
                      gameDuration === 300 ? styles.selectedButton : ""
                    }`}
                  >
                    5 Minutes
                  </motion.button>
                </div>
              </div>
              <div className={styles.gameModeSelector}>
                <button
                  onClick={() => setGameMode("flag")}
                  className={`${styles.modeButton} ${
                    gameMode === "flag" ? styles.selectedMode : ""
                  }`}
                >
                  Guess the Flag
                </button>
                <button
                  onClick={() => setGameMode("capital")}
                  className={`${styles.modeButton} ${
                    gameMode === "capital" ? styles.selectedMode : ""
                  }`}
                >
                  Guess the Capital
                </button>
              </div>
              <motion.button
                onClick={startGame}
                className={styles.startButton}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Let's play the game!
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              className={styles.gameArea}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className={styles.gameInfo}>
                <div className={styles.score}>
                  <Award className={styles.scoreIcon} />
                  Score: {score}
                </div>
                <div className={styles.streak}>Streak: {streak}</div>
                <div className={styles.timer}>
                  Time Left:{" "}
                  {`${Math.floor(timeLeft / 60)}:${
                    timeLeft % 60 < 10 ? "0" : ""
                  }${timeLeft % 60}`}
                </div>
              </div>
              <Progress
                value={(timeLeft / gameDuration) * 100}
                className={styles.progressBar}
              />
              {currentCountry && (
                <motion.div
                  className={styles.questionArea}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {renderGameContent()}
                  <motion.button
                    onClick={handleShowHint}
                    className={styles.hintButton}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Get Hint
                  </motion.button>
                  <AnimatePresence>
                    {showHint && (
                      <motion.div
                        className={styles.hint}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                      >
                        Hint:{" "}
                        {gameMode === "flag"
                          ? `The capital is ${currentCountry.capital}`
                          : `The country is in ${currentCountry.continent}`}
                      </motion.div>
                    )}
                    {renderCountryDetails()}
                  </AnimatePresence>
                </motion.div>
              )}
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FlagQuest;


