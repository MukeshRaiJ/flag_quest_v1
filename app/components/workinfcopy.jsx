














"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { MoonIcon, SunIcon } from "lucide-react";
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
  const [selectedRegion, setSelectedRegion] = useState("World");
  const [showHint, setShowHint] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [darkMode, setDarkMode] = useState(false);

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
    const filteredCountries = selectedRegion === "World" 
      ? data 
      : data.filter(country => country.continent === selectedRegion);
    
    const randomCountry = filteredCountries[Math.floor(Math.random() * filteredCountries.length)];
    setCurrentCountry(randomCountry);

    const shuffledOptions = [...filteredCountries]
      .sort(() => 0.5 - Math.random())
      .slice(0, 4);

    if (!shuffledOptions.includes(randomCountry)) {
      shuffledOptions[Math.floor(Math.random() * 4)] = randomCountry;
    }

    setOptions(shuffledOptions);
  };

  const handleOptionClick = (countryName) => {
    if (countryName === currentCountry.name) {
      setScore(score + 1);
      setShowFact(true);
    } else {
      alert("Wrong answer! Try again.");
      setHighlightCorrect(true);
    }
    
    setTimeout(() => {
      setShowFact(false);
      setShowHint(false);
      setHighlightCorrect(false);
      loadNewQuestion(countries);
    }, 3000);
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(gameDuration);
    setHintsUsed(0);
    setGameStarted(true);
  };

  const handleShowHint = () => {
    setShowHint(true);
    setHintsUsed(hintsUsed + 1);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`${styles.container} ${darkMode ? styles.dark : ''}`}>
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
            <div className={styles.darkModeToggle}>
              <SunIcon className={styles.darkModeIcon} />
              <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
              <MoonIcon className={styles.darkModeIcon} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!gameStarted ? (
            <div className={styles.gameSettings}>
              <h2 className={styles.welcome}>Welcome to Flag Quest!</h2>
              <p className={styles.rules}>
                Select the game duration and region, then start playing.
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
                  <button
                    onClick={() => setGameDuration(180)}
                    className={`${styles.durationButton} ${
                      gameDuration === 180 ? styles.selectedButton : ""
                    }`}
                  >
                    3 Minutes
                  </button>
                  <button
                    onClick={() => setGameDuration(300)}
                    className={`${styles.durationButton} ${
                      gameDuration === 300 ? styles.selectedButton : ""
                    }`}
                  >
                    5 Minutes
                  </button>
                </div>
              </div>
              <button onClick={startGame} className={styles.startButton}>
                Let's play the game!
              </button>
            </div>
          ) : (
            <div className={styles.gameArea}>
              <div className={styles.gameInfo}>
                <div className={styles.score}>Score: {score}</div>
                <div className={styles.timer}>
                  Time Left:{" "}
                  {`${Math.floor(timeLeft / 60)}:${
                    timeLeft % 60 < 10 ? "0" : ""
                  }${timeLeft % 60}`}
                </div>
              </div>
              {currentCountry && (
                <div className={styles.questionArea}>
                  <h2 className={styles.question}>Which country is {currentCountry.name}?</h2>
                  <div className={styles.options}>
                    {options.map((option) => (
                      <div
                        key={option.name}
                        className={`${styles.flagContainer} ${
                          highlightCorrect && option.name === currentCountry.name
                            ? styles.correctFlag
                            : ""
                        }`}
                        onClick={() => handleOptionClick(option.name)}
                      >
                        <Image
                          src={option.flag}
                          alt={option.name}
                          width={100}
                          height={70}
                          className={styles.flag}
                        />
                      </div>
                    ))}
                  </div>
                  <button onClick={handleShowHint} className={styles.hintButton}>
                    Get Hint
                  </button>
                  {showHint && (
                    <div className={styles.hint}>
                      Hint: The capital city is {currentCountry.capital}
                    </div>
                  )}
                  {showFact && (
                    <div className={styles.fact}>
                      <p>Correct! Here's an interesting fact about {currentCountry.name}:</p>
                      <p>{currentCountry.fact}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FlagQuest;