import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { collection, doc, setDoc, query, orderBy, limit, getDocs, where, onSnapshot, getDoc } from "firebase/firestore";
import Game from "./BordGame";
import { debounce, COMBO_GIFS, COMBO_SOUNDS, SOUND_CATCH, SOUND_OBSTACLE, GAME_DURATION_SEC } from "./utils";
import { Scorereveal, backgroundImage, replay } from "./assets";
import indomieLogo from "../assets/Large Indomie log.png";
import welldone from "../assets/Weldone.png";
import leaderboard1 from "../assets/Leaderboard button.png";
import EndTask from "../assets/End task.png";
import share from "../assets/Share button.png";
import left from "../assets/Left Button.png";
import Crayfish from "../assets/Crayfish.png";
import Peppersoup from "../assets/Pepper soup noodle.png";
import OrientalNoodle from "../assets/Oriental Noodle.png";
import task1 from "../assets/Task 1b.png";
import task2 from "../assets/Task 2 b.png";
import task3 from "../assets/Task 3 b.png";

// Flavor definitions
const allFlavors = [
  { img: Crayfish, name: "Crayfish" },
  { img: Peppersoup, name: "Peppersoup" },
  { img: OrientalNoodle, name: "Oriental" },
];

export default function GameTaskPage() {
  const [currentTask, setCurrentTask] = useState(1);
  const [score, setScore] = useState(0);
  const [completedTaskScores, setCompletedTaskScores] = useState([0, 0, 0]);
  const [gameActive, setGameActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION_SEC);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [comboGif, setComboGif] = useState(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showEndTask, setShowEndTask] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isReady, setIsReady] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.9);
  const [canvasSize, setCanvasSize] = useState({ w: 800, h: 520 });
  const [assetError, setAssetError] = useState(null);
  const [basketHeight, setBasketHeight] = useState(150);
  const [activeSection, setActiveSection] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [leaderboardFilter, setLeaderboardFilter] = useState("all");
  const [notification, setNotification] = useState(null);
  const [selectedFlavors, setSelectedFlavors] = useState(() => {
    try {
      const saved = localStorage.getItem("taskFlavors");
      const selectedFlavor = localStorage.getItem("selectedFlavor");
      if (saved) {
        const parsed = JSON.parse(saved);
        console.log(`Loaded taskFlavors from localStorage: ${JSON.stringify(parsed)}`);
        return parsed;
      } else if (selectedFlavor) {
        console.log(`Initialized taskFlavors with selectedFlavor: ${selectedFlavor}`);
        return [selectedFlavor, null, null];
      }
      console.log("No taskFlavors or selectedFlavor in localStorage, initializing with [null, null, null]");
      return [null, null, null];
    } catch (error) {
      console.error("Failed to initialize selectedFlavors from localStorage:", error);
      return [null, null, null];
    }
  });

  const [showFlavorSelection, setShowFlavorSelection] = useState(false);

  // Task image mapping
  const taskImages = {
    1: task1,
    2: task2,
    3: task3,
  };

  const navigate = useNavigate();
  const audioCatchRef = useRef(null);
  const audioObstacleRef = useRef(null);
  const audioComboRefs = useRef([]);

  // Animation variants for flavor images
  const imageVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.8 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        type: "spring",
        bounce: 0.4,
        delay: i * 0.2,
      },
    }),
  };

  // Animation variants for border
  const borderVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1.1, transition: { duration: 0.3, ease: "easeOut" } },
  };

  // Monitor authentication state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      if (!user) {
        console.warn("No authenticated user found, redirecting to login");
        navigate("/form");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Clear notification after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Save selected flavors to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("taskFlavors", JSON.stringify(selectedFlavors));
      console.log(`Saved taskFlavors to localStorage: ${JSON.stringify(selectedFlavors)}`);
    } catch (error) {
      console.error("Failed to save taskFlavors to localStorage:", error);
      setNotification({ type: "error", message: "Failed to save flavors to storage." });
    }
  }, [selectedFlavors]);

  // Check if flavor selection is needed before starting a task
  useEffect(() => {
    console.log(`useEffect: currentTask=${currentTask}, selectedFlavors=${JSON.stringify(selectedFlavors)}`);
    if (currentTask > 1 && !selectedFlavors[currentTask - 1]) {
      console.log(`Showing flavor selection for Task ${currentTask}`);
      setShowFlavorSelection(true);
    } else if (currentTask === 1 && !selectedFlavors[0]) {
      console.log("No flavor for Task 1, redirecting to /pack");
      navigate("/pack");
    } else {
      console.log(`Hiding flavor selection for Task ${currentTask}`);
      setShowFlavorSelection(false);
    }
  }, [currentTask, selectedFlavors, navigate]);

  // Get available flavors for the current task
  const getAvailableFlavors = useCallback(() => {
    return allFlavors.filter((flavor) => !selectedFlavors.includes(flavor.name));
  }, [selectedFlavors]);

  // Gameplay handlers
  const getPreviousSum = useCallback((taskNumber) => {
    const sum = completedTaskScores.slice(0, taskNumber - 1).reduce((a, b) => a + b, 0);
    console.log(`Calculating previous sum for task ${taskNumber}: ${completedTaskScores.slice(0, taskNumber - 1)}, Sum: ${sum}`);
    return sum;
  }, [completedTaskScores]);

  const startGame = useCallback(
    (taskNumber, flavor = null) => {
      console.log(`startGame called for Task ${taskNumber}, isReady=${isReady}, flavor=${flavor || selectedFlavors[taskNumber - 1]}`);
      if (!isReady) {
        console.log("Cannot start game: assets not ready");
        setNotification({ type: "error", message: "Assets not loaded yet. Please wait." });
        return;
      }
      if (!flavor && !selectedFlavors[taskNumber - 1]) {
        console.log(`No flavor selected for Task ${taskNumber}, showing flavor selection`);
        setShowFlavorSelection(true);
        setCurrentTask(taskNumber);
        return;
      }
      const previousSum = getPreviousSum(taskNumber);
      console.log(`Starting Task ${taskNumber} with score: ${previousSum}`);
      setCurrentTask(taskNumber);
      setScore(previousSum);
      setShowLeaderboard(false);
      setShowEndTask(false);
      setActiveSection(null);
      setGameActive(true);
      setGameOver(false);
      setLives(3);
      setTimeLeft(GAME_DURATION_SEC);
      setComboGif(null);
      console.log(`Game started: gameActive=true, task=${taskNumber}`);
    },
    [isReady, getPreviousSum, selectedFlavors]
  );

  // Handle flavor selection
  const handleFlavorSelect = useCallback(
    (flavorName) => {
      console.log(`handleFlavorSelect: flavor=${flavorName}, currentTask=${currentTask}`);
      setSelectedFlavors((prev) => {
        const newFlavors = [...prev];
        newFlavors[currentTask - 1] = flavorName;
        console.log(`Updated selectedFlavors: ${JSON.stringify(newFlavors)}`);
        try {
          localStorage.setItem("selectedFlavor", flavorName);
          localStorage.setItem("taskFlavors", JSON.stringify(newFlavors));
          console.log(`Saved selectedFlavor=${flavorName} and taskFlavors=${JSON.stringify(newFlavors)} to localStorage`);
        } catch (error) {
          console.error("Failed to save flavor data to localStorage:", error);
          setNotification({ type: "error", message: "Failed to save flavor selection." });
        }
        setShowFlavorSelection(false);
        setGameOver(false);
        setActiveSection(null);
        startGame(currentTask, flavorName); // Pass flavor directly
        return newFlavors;
      });
    },
    [currentTask, startGame]
  );

  const advanceTask = useCallback(() => {
    const nextTask = currentTask + 1;
    console.log(`Advancing from Task ${currentTask} to Task ${nextTask}`);
    if (nextTask <= 3) {
      setCurrentTask(nextTask);
      setShowFlavorSelection(true);
      setGameActive(false);
      setGameOver(false);
    }
  }, [currentTask]);

  const handleReplayAll = useCallback(() => {
    console.log("Replaying all tasks from Task 1");
    setCurrentTask(1);
    setScore(0);
    setCompletedTaskScores([0, 0, 0]);
    setSelectedFlavors([null, null, null]);
    try {
      localStorage.removeItem("taskFlavors");
      localStorage.removeItem("selectedFlavor");
      console.log("Cleared localStorage: taskFlavors, selectedFlavor");
    } catch (error) {
      console.error("Failed to clear localStorage:", error);
      setNotification({ type: "error", message: "Failed to clear storage." });
    }
    setTimeLeft(GAME_DURATION_SEC);
    setLives(3);
    setGameActive(false);
    setGameOver(false);
    setShowLeaderboard(false);
    setShowEndTask(false);
    setActiveSection(null);
    setComboGif(null);
    setShowFlavorSelection(true);
  }, []);

  const playCatch = useCallback(() => {
    if (!audioCatchRef.current || isMuted) return;
    audioCatchRef.current.currentTime = 0;
    audioCatchRef.current.play().catch(() => {});
  }, [isMuted]);

  const playObstacle = useCallback(() => {
    if (!audioObstacleRef.current || isMuted) return;
    audioObstacleRef.current.currentTime = 0;
    audioObstacleRef.current.play().catch(() => {});
  }, [isMuted]);

  const playCombo = useCallback(() => {
    if (!audioComboRefs.current.length || isMuted) return;
    const randomIndex = Math.floor(Math.random() * audioComboRefs.current.length);
    const audio = audioComboRefs.current[randomIndex];
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }, [isMuted]);

  const handleComboTriggered = useCallback(
    (gifUrl) => {
      console.log(`Combo triggered with GIF: ${gifUrl}`);
      setComboGif(gifUrl);
      playCombo();
      setTimeout(() => setComboGif(null), 1400);
    },
    [playCombo]
  );

  const saveTaskScore = useCallback(() => {
    const previousSum = getPreviousSum(currentTask);
    const contribution = Math.max(0, score - previousSum);
    console.log(`Saving score for Task ${currentTask}: Contribution: ${contribution}, Previous sum: ${previousSum}`);
    setCompletedTaskScores((prev) => {
      const newScores = [...prev];
      newScores[currentTask - 1] = contribution;
      const totalScore = newScores.reduce((a, b) => a + b, 0);
      console.log(`Updated scores: ${newScores}, Total: ${totalScore}`);
      setScore(totalScore);
      return newScores;
    });
  }, [score, currentTask, getPreviousSum]);

  const fetchLeaderboardFromServer = useCallback(() => {
    try {
      let q;
      if (leaderboardFilter === "week") {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        q = query(
          collection(db, "scores"),
          where("date", ">=", oneWeekAgo.toISOString()),
          orderBy("date", "desc"),
          orderBy("score", "desc"),
          limit(10)
        );
      } else if (leaderboardFilter === "month") {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        q = query(
          collection(db, "scores"),
          where("date", ">=", oneMonthAgo.toISOString()),
          orderBy("date", "desc"),
          orderBy("score", "desc"),
          limit(10)
        );
      } else {
        q = query(collection(db, "scores"), orderBy("score", "desc"), limit(10));
      }

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const leaderboardData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setLeaderboard(leaderboardData);
        console.log(`Fetched ${leaderboardFilter} leaderboard:`, leaderboardData);
      }, (err) => {
        console.error("Failed to fetch leaderboard from Firestore:", err.message);
        setLeaderboard([]);
        setNotification({ type: "error", message: "Failed to load leaderboard: " + err.message });
      });

      return () => unsubscribe();
    } catch (err) {
      console.error("Failed to fetch leaderboard from Firestore:", err.message);
      setLeaderboard([]);
      setNotification({ type: "error", message: "Failed to load leaderboard: " + err.message });
    }
  }, [leaderboardFilter]);

  const saveHighScoreToServer = useCallback(
    async (entry) => {
      if (!currentUser) {
        console.warn("No authenticated user, redirecting to login");
        navigate("/form");
        return;
      }
      try {
        const scoreEntry = {
          ...entry,
          player: currentUser.displayName || "Player",
          uid: currentUser.uid,
          date: new Date().toISOString(),
        };
        const scoreDocRef = doc(db, "scores", currentUser.uid);
        const scoreDoc = await getDoc(scoreDocRef);

        if (scoreDoc.exists()) {
          const existingScore = scoreDoc.data().score;
          console.log(`Existing score: ${existingScore}, New score: ${scoreEntry.score}`);
          if (existingScore >= scoreEntry.score) {
            console.log(`New score (${scoreEntry.score}) is not higher than existing score (${existingScore}), skipping update`);
            setNotification({
              type: "info",
              message: `Your score of ${scoreEntry.score} is not higher than your previous score of ${existingScore}. Keep trying!`,
            });
            await fetchLeaderboardFromServer();
            return;
          }
        }

        await setDoc(scoreDocRef, scoreEntry, { merge: true });
        console.log(`Saved score to Firestore: ${scoreEntry.score}`);
        setNotification({ type: "success", message: `New high score of ${scoreEntry.score} saved!` });
        await fetchLeaderboardFromServer();
      } catch (err) {
        console.error("Failed to save score to Firestore:", err.message);
        setNotification({ type: "error", message: "Failed to save score: " + err.message });
      }
    },
    [currentUser, fetchLeaderboardFromServer, navigate]
  );

  const handleGameEnd = useCallback(() => {
    console.log(`Game ended for Task ${currentTask}, current score: ${score}`);
    setGameActive(false);
    setTimeLeft(GAME_DURATION_SEC);
    setComboGif(null);
    saveTaskScore();
    if (currentTask === 3) {
      console.log("Task 3 completed, going to end game section");
      const totalScore = completedTaskScores.slice(0, 2).reduce((a, b) => a + b, 0) + (score - getPreviousSum(currentTask));
      const entry = { score: totalScore, player: currentUser?.displayName || "Player", date: new Date().toISOString() };
      console.log(`Saving final score to leaderboard: ${totalScore}`);
      saveHighScoreToServer(entry);
      setCurrentTask(4);
    } else {
      console.log(`Task ${currentTask} completed, showing task transition section`);
      setGameOver(true);
    }
  }, [score, currentTask, saveHighScoreToServer, saveTaskScore, completedTaskScores, getPreviousSum, currentUser]);

  const debouncedHandleScoreDelta = useCallback(
    debounce((delta) => {
      console.log(`Score delta: ${delta}, Current lives: ${lives}, Task: ${currentTask}`);
      if (delta > 0) {
        if (delta >= 30) playCombo();
        else playCatch();
        setScore((prev) => {
          const newScore = Math.max(0, prev + delta);
          console.log(`Score updated to ${newScore}`);
          return newScore;
        });
      } else if (delta < 0 && score > 0) {
        playObstacle();
        setLives((prev) => {
          const newLives = Math.max(0, prev - 1);
          console.log(`Lives reduced to ${newLives}`);
          if (newLives === 0) {
            setGameActive(false);
            saveTaskScore();
            if (currentTask === 3) {
              console.log("Task 3 ended with 0 lives, going to end game section");
              const totalScore = completedTaskScores.slice(0, 2).reduce((a, b) => a + b, 0) + (score - getPreviousSum(currentTask));
              const entry = { score: totalScore, player: currentUser?.displayName || "Player", date: new Date().toISOString() };
              console.log(`Saving final score to leaderboard: ${totalScore}`);
              saveHighScoreToServer(entry);
              setCurrentTask(4);
            } else {
              console.log(`Task ${currentTask} ended with 0 lives, showing game over`);
              setGameOver(true);
            }
          }
          return newLives;
        });
        setScore((prev) => {
          const newScore = Math.max(0, prev + delta);
          console.log(`Score updated to ${newScore}`);
          return newScore;
        });
      }
    }, 50),
    [playCatch, playObstacle, playCombo, score, currentTask, lives, saveHighScoreToServer, saveTaskScore, completedTaskScores, getPreviousSum, currentUser]
  );

  const toggleMute = useCallback(() => setIsMuted((prev) => !prev), []);

  // Responsive canvas sizing
  useEffect(() => {
    const updateSize = debounce(() => {
      const windowWidth = window.innerWidth;
      const padding = windowWidth < 640 ? 20 : 40;
      const maxWidth = Math.min(800, windowWidth - padding);
      const ratio = 520 / 800;
      setCanvasSize({ w: maxWidth, h: maxWidth * ratio });
    }, 100);

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Preload assets
  useEffect(() => {
    let mounted = true;
    audioCatchRef.current = new Audio(SOUND_CATCH);
    audioObstacleRef.current = new Audio(SOUND_OBSTACLE);
    audioComboRefs.current = COMBO_SOUNDS.map((src) => new Audio(src));

    const setAudioVolume = () => {
      audioCatchRef.current.volume = volume;
      audioObstacleRef.current.volume = volume;
      audioComboRefs.current.forEach((audio) => (audio.volume = volume));
    };
    setAudioVolume();

    const preloadImages = [...COMBO_GIFS, ...allFlavors.map((f) => f.img), task1, task2, task3].map(
      (src) =>
        new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            console.log(`Loaded image: ${src}`);
            resolve(true);
          };
          img.onerror = () => {
            console.warn(`Failed to load image: ${src}`);
            resolve(false);
          };
          img.src = src;
        })
    );

    const preloadAudio = [audioCatchRef.current, audioObstacleRef.current, ...audioComboRefs.current].map(
      (audio) =>
        new Promise((resolve) => {
          const cleanup = () => {
            audio.removeEventListener("canplaythrough", onLoad);
            audio.removeEventListener("error", onError);
          };
          const onLoad = () => {
            cleanup();
            console.log(`Loaded audio: ${audio.src}`);
            resolve(true);
          };
          const onError = () => {
            cleanup();
            console.warn(`Failed to load audio: ${audio.src}`);
            resolve(false);
          };

          audio.addEventListener("canplaythrough", onLoad, { once: true });
          audio.addEventListener("error", onError, { once: true });
          setTimeout(() => {
            cleanup();
            resolve(true);
          }, 1500);
        })
    );

    Promise.all([...preloadImages, ...preloadAudio]).then((results) => {
      if (mounted) {
        if (results.every(Boolean)) {
          console.log("All assets loaded successfully, setting isReady=true");
          setIsReady(true);
        } else {
          console.warn("Some assets failed to load");
          setAssetError("Some assets failed to load. Game may not function correctly.");
        }
      }
    });

    return () => {
      mounted = false;
    };
  }, [volume]);

  // Log rendering state
  useEffect(() => {
    console.log(`Rendering: gameActive=${gameActive}, showFlavorSelection=${showFlavorSelection}, currentTask=${currentTask}, activeSection=${activeSection}, gameOver=${gameOver}`);
  }, [gameActive, showFlavorSelection, currentTask, activeSection, gameOver]);

  return (
    <div
      className="h-[100vh] md:h-[160vh] w-full flex flex-col items-center p-4 sm:p-6 md:p-10 relative"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "top center",
        backgroundRepeat: "no-repeat",
        width: "100%",
      }}
    >
      {assetError && (
        <div className="absolute top-4 left-4 bg-red-500 text-white p-2 rounded">
          {assetError}
        </div>
      )}
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`absolute top-4 left-1/2 transform -translate-x-1/2 p-4 rounded-lg text-white ${
            notification.type === "error" ? "bg-red-500" : notification.type === "success" ? "bg-green-500" : "bg-blue-500"
          }`}
        >
          {notification.message}
        </motion.div>
      )}
      <div className="flex flex-wrap w-full max-w-4xl items-center justify-between mb-4 gap-4">
        {!gameActive && (
          <motion.div
            className="p-4"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            exit={{ opacity: 0 }}
          >
            <img
              src={indomieLogo}
              alt="Indomie Logo"
              className="w-16 md:w-20 lg:w-24 h-auto"
            />
          </motion.div>
        )}
      </div>

      <div className="w-full max-w-4xl rounded-2xl shadow p-4 sm:p-6">
        {showFlavorSelection && currentTask <= 3 ? (
          <div className="flex flex-col items-center pt-20">
            <motion.div
              className="text-center px-4 mb-16"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3, type: "spring" }}
              whileHover={{ scale: 1.05 }}
            >
              <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-yellow-400 leading-snug font-malvie w-[100%]">
                PICK YOUR FLAVOR FOR <br /> TASK {currentTask}
              </p>
            </motion.div>
            <div className="flex justify-center items-center space-x-4 md:space-x-6 lg:space-x-8 mb-20">
              {getAvailableFlavors().map((flavor, i) => (
                <div key={flavor.name} className="relative">
                  <motion.img
                    src={flavor.img}
                    alt={`${flavor.name} Pack`}
                    className="w-32 md:w-36 lg:w-40 object-contain cursor-pointer"
                    initial="hidden"
                    animate="visible"
                    variants={imageVariants}
                    custom={i}
                    onClick={() => handleFlavorSelect(flavor.name)}
                    role="button"
                    aria-label={`Select ${flavor.name} flavor`}
                  />
                  <AnimatePresence>
                    {selectedFlavors[currentTask - 1] === flavor.name && (
                      <motion.div
                        className="absolute inset-0 border-4 border-yellow-400 rounded-lg"
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        variants={borderVariants}
                      />
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
            {getAvailableFlavors().length === 1 && (
              <motion.button
                onClick={() => handleFlavorSelect(getAvailableFlavors()[0].name)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-0 rounded-2xl overflow-hidden"
              >
                <motion.img
                  src={taskImages[currentTask]}
                  alt={`Start Task ${currentTask}`}
                  className="w-48 h-full object-cover"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatType: "mirror" }}
                />
              </motion.button>
            )}
          </div>
        ) : !gameActive && currentTask <= 3 && !activeSection ? (
          <div className="flex flex-col items-center pt-20">
            {currentTask === 1 && !gameOver ? (
              <>
                <p className="text-4xl font-bold text-yellow-400 leading-snug font-malvie text-center">
                  READY TO <br /> BECOME HOH?
                </p>
                <p className="text-white text-4xl font-bold leading-snug font-malvie">
                  ENTER ARENA
                </p>
                <img src={Scorereveal} alt="Start Game" className="w-auto absolute bottom-5" />
                <button
                  onClick={() => startGame(1, selectedFlavors[0])}
                  className={`absolute bottom-5 left-0 w-full flex justify-center ${
                    !isReady || !selectedFlavors[0] ? "opacity-60 cursor-not-allowed" : "hover:brightness-110"
                  }`}
                  disabled={!isReady || !selectedFlavors[0]}
                >
                  <img
                    src={taskImages[1]}
                    alt="Task 1 button"
                    className="w-56 object-contain"
                  />
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center">
                <div className="flex space-x-4 mb-4">
                  <div className="flex flex-col items-center">
                    <span className="w-28 px-2 py-1 border-2 border-orange-500 text-center text-xl font-extrabold rounded-lg text-white">
                      Score
                    </span>
                    <span className="min-w-[150px] px-6 py-4 border-2 border-orange-500 text-center text-2xl font-extrabold rounded-lg text-white">
                      {score}
                    </span>
                  </div>
                </div>
                <img src={Scorereveal} alt={gameOver ? "Game Over" : "Task Transition"} className="absolute bottom-5" />
                <div className="flex flex-col gap-2 absolute bottom-5 left-0 w-full justify-center items-center">
                  <button
                    onClick={() => {
                      console.log(`Replaying Task ${currentTask}`);
                      startGame(currentTask, selectedFlavors[currentTask - 1]);
                    }}
                    className="p-0 rounded-2xl overflow-hidden hover:brightness-110"
                  >
                    <img
                      src={replay}
                      alt="Replay Button"
                      className="w-56 h-full object-cover"
                    />
                  </button>
                  {currentTask < 3 && completedTaskScores[currentTask - 1] > 0 && (
                    <button
                      onClick={advanceTask}
                      className={`p-0 rounded-2xl overflow-hidden ${
                        !isReady ? "opacity-60 cursor-not-allowed" : "hover:brightness-110"
                      }`}
                      disabled={!isReady}
                    >
                      <img
                        src={taskImages[currentTask + 1]}
                        alt={`Task ${currentTask + 1} button`}
                        className="w-56 h-full object-cover"
                      />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : gameActive && Array.isArray(selectedFlavors) ? (
          <div className="relative">
            <div className="absolute top-2 -right-8 z-10 flex flex-col space-y-1 text-white text-sm px-3 py-2 rounded-lg">
              <div className="flex flex-col items-center">
                <span className="w-[100px] px-4 border border-orange-500 text-center text-xl font-extrabold rounded-lg">Score</span>
                <span className="w-[150px] px-4 border border-orange-500 text-2xl text-center font-extrabold rounded-lg">{score}</span>
              </div>
              <p className="text-center text-3xl">{'❤️'.repeat(lives)}</p>
            </div>
            <Game
              canvasW={canvasSize.w}
              canvasH={canvasSize.h}
              currentTask={currentTask}
              timeLeft={timeLeft}
              setTimeLeft={setTimeLeft}
              onGameEnd={handleGameEnd}
              onScoreDelta={debouncedHandleScoreDelta}
              onComboTriggered={handleComboTriggered}
              isMuted={isMuted}
              volume={volume}
              basketHeight={basketHeight}
              selectedFlavors={selectedFlavors}
            />
            <AnimatePresence>
              {comboGif && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="pointer-events-none absolute inset-0 flex items-center justify-center"
                >
                  <img src={comboGif} alt="Combo" className="w-56 h-56 object-contain drop-shadow-2xl" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center text-white">
          </div>
        )}
        {currentTask > 3 && !activeSection && (
          <div className="flex flex-col items-center pt-20">
            <div className="flex flex-col items-center mb-4">
              <span className="w-[150px] px-2 py-1 border border-orange-500 text-center text-xl font-extrabold rounded-lg text-white">
                Final Score
              </span>
               <span className="min-w-[200px] px-6 py-2 border-2 border-orange-500 text-center text-2xl font-extrabold rounded-lg text-white">
                {score}
              </span>
            </div>
            <img src={Scorereveal} alt="End Game" className="w-auto absolute bottom-5" />
             <div className="flex flex-col gap-2 absolute bottom-5 left-0 w-full justify-center items-center">
              <button onClick={() => setActiveSection("endTask")}>
                <img src={EndTask} alt="End Task"     className="w-56 h-full object-cover" />
              </button>
              <button
                onClick={() => {
                  console.log("Fetching leaderboard");
                  fetchLeaderboardFromServer();
                  setActiveSection("leaderboard");
                }}
                
              >
                <img src={leaderboard1} alt="Leaderboard"     className="w-56 h-full object-cover" />
              </button>
            </div>
          </div>
        )}
        {activeSection === "endTask" && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center pt-20"
          >
            <img src={welldone} alt="Well Done" className="w-80 rounded-lg mt-4" />
            <button
              onClick={handleReplayAll}
              className="px-5 py-2 rounded-2xl bg-emerald-600 text-white"
            >
              Play Again
            </button>
          </motion.div>
        )}
        {activeSection === "leaderboard" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex flex-col items-center min-h-screen py-6">
              <div className="bg-[#6B3E1D] rounded-2xl p-4 w-[90%] max-w-md text-center shadow-xl relative">
                <h2 className="text-white text-xl font-bold mb-4 tracking-wide">LEADERBOARD</h2>
                <div className="flex justify-center gap-2 mb-6">
                  <button
                    className={`px-3 py-1 rounded-full text-sm font-bold ${
                      leaderboardFilter === "all" ? "bg-yellow-400" : "bg-[#4A2A14] text-white"
                    }`}
                    onClick={() => setLeaderboardFilter("all")}
                  >
                    All time
                  </button>
                  <button
                    className={`px-3 py-1 rounded-full text-sm font-bold ${
                      leaderboardFilter === "week" ? "bg-yellow-400" : "bg-[#4A2A14] text-white"
                    }`}
                    onClick={() => setLeaderboardFilter("week")}
                  >
                    This Week
                  </button>
                  <button
                    className={`px-3 py-1 rounded-full text-sm font-bold ${
                      leaderboardFilter === "month" ? "bg-yellow-400" : "bg-[#4A2A14] text-white"
                    }`}
                    onClick={() => setLeaderboardFilter("month")}
                  >
                    This Month
                  </button>
                </div>
                {leaderboard.length > 0 ? (
                  <>
                    <div className="flex justify-center items-end gap-4 mb-6">
                      {leaderboard[1] && (
                        <div className="flex flex-col items-center">
                          <div className="w-16 h-16 rounded-full bg-yellow-500 border-4 border-yellow-300 flex items-center justify-center text-white font-bold text-lg">
                            2
                          </div>
                          <p className="text-xs text-white mt-1">@{leaderboard[1].player}</p>
                          <p className="text-yellow-400 font-bold">{leaderboard[1].score}</p>
                        </div>
                      )}
                      {leaderboard[0] && (
                        <div className="flex flex-col items-center">
                          <div className="w-24 h-24 rounded-full bg-yellow-500 border-4 border-yellow-300 flex items-center justify-center text-white font-bold text-2xl relative">
                            👑
                          </div>
                          <p className="text-xs text-white mt-1">@{leaderboard[0].player}</p>
                          <p className="text-yellow-400 font-bold">{leaderboard[0].score}</p>
                        </div>
                      )}
                      {leaderboard[2] && (
                        <div className="flex flex-col items-center">
                          <div className="w-16 h-16 rounded-full bg-yellow-500 border-4 border-yellow-300 flex items-center justify-center text-white font-bold text-lg">
                            3
                          </div>
                          <p className="text-xs text-white mt-1">@{leaderboard[2].player}</p>
                          <p className="text-yellow-400 font-bold">{leaderboard[2].score}</p>
                        </div>
                      )}
                    </div>
                    <div className="space-y-3">
                      {leaderboard.slice(3, 8).map((entry, idx) => (
                        <div
                          key={entry.id}
                          className="flex items-center justify-between bg-[#5A2A12] text-white px-3 py-2 rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center text-xs font-bold">
                              {idx + 4}
                            </span>
                            <span>@{entry.player}</span>
                          </div>
                          <span className="text-yellow-400 font-bold">{entry.score} pts</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-slate-300">No scores yet — play to create the first one!</div>
                )}
              </div>
              <div className="mt-6 flex gap-4">
                <button
                  onClick={() => setActiveSection(null)}
                  className="text-white font-bold text-lg px-8 py-3 rounded-xl shadow-md"
                >
                  <img src={left} alt="Back" className="w-16 rounded-lg mt-4" />
                </button>
                <button className="text-yellow-400 font-bold text-lg px-8 py-3 rounded-xl shadow-md">
                  <img src={share} alt="Share" className="w-40 rounded-lg mt-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}