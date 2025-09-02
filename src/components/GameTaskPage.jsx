import React, { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import Game from "./BordGame";
import { debounce, COMBO_GIFS, COMBO_SOUNDS, SOUND_CATCH, SOUND_OBSTACLE, API_BASE, ENDPOINT_SAVE, ENDPOINT_FETCH, GAME_DURATION_SEC } from "./utils";
import { Scorereveal, backgroundImage, replay, task } from "./assets";

export default function GameTaskPage() {
  const [currentTask, setCurrentTask] = useState(1);
  const [score, setScore] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION_SEC);
  const [comboGif, setComboGif] = useState(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showEndTask, setShowEndTask] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isReady, setIsReady] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.9);
  const [canvasSize, setCanvasSize] = useState({ w: 800, h: 520 });
  const [assetError, setAssetError] = useState(null);

  const audioCatchRef = useRef(null);
  const audioObstacleRef = useRef(null);
  const audioComboRefs = useRef([]);

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
    audioComboRefs.current = COMBO_SOUNDS.map(src => new Audio(src));

    const setAudioVolume = () => {
      audioCatchRef.current.volume = volume;
      audioObstacleRef.current.volume = volume;
      audioComboRefs.current.forEach(audio => audio.volume = volume);
    };
    setAudioVolume();

    const preloadImages = COMBO_GIFS.map(
      (src) =>
        new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            console.log(`Loaded GIF: ${src}`);
            resolve(true);
          };
          img.onerror = () => {
            console.warn(`Failed to load combo GIF: ${src}`);
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
          setIsReady(true);
        } else {
          setAssetError("Some assets failed to load. Game may not function correctly.");
        }
      }
    });

    const saved = JSON.parse(localStorage.getItem("leaderboard") || "[]");
    setLeaderboard(saved);

    return () => {
      mounted = false;
    };
  }, [volume]);

  // Audio helpers
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

  useEffect(() => {
    if (audioCatchRef.current) audioCatchRef.current.volume = volume;
    if (audioObstacleRef.current) audioObstacleRef.current.volume = volume;
    audioComboRefs.current.forEach(audio => audio.volume = volume);
  }, [volume]);

  // REST API handlers
  const fetchLeaderboardFromServer = useCallback(async () => {
    try {
      const res = await axios.get(ENDPOINT_FETCH, { timeout: 5000 });
      if (Array.isArray(res.data)) {
        setLeaderboard(res.data.slice(0, 10));
        localStorage.setItem("leaderboard", JSON.stringify(res.data.slice(0, 10)));
        return res.data.slice(0, 10);
      }
    } catch (err) {
      console.warn("Failed to fetch leaderboard, using local storage", err?.message);
      const local = JSON.parse(localStorage.getItem("leaderboard") || "[]");
      setLeaderboard(local);
      return local;
    }
  }, []);

  const saveHighScoreToServer = useCallback(async (entry) => {
    try {
      const res = await axios.post(ENDPOINT_SAVE, entry, { timeout: 5000 });
      if (res?.data && Array.isArray(res.data)) {
        setLeaderboard(res.data.slice(0, 10));
        localStorage.setItem("leaderboard", JSON.stringify(res.data.slice(0, 10)));
      } else {
        await fetchLeaderboardFromServer();
      }
    } catch (err) {
      console.warn("Failed to save high score, saving locally", err?.message);
      const local = JSON.parse(localStorage.getItem("leaderboard") || "[]");
      const updated = [...local, entry].sort((a, b) => b.score - a.score).slice(0, 10);
      localStorage.setItem("leaderboard", JSON.stringify(updated));
      setLeaderboard(updated);
    }
  }, [fetchLeaderboardFromServer]);

  // Gameplay handlers
  const handleScoreDelta = useCallback(
    (delta) => {
      if (delta > 0) {
        if (delta >= 30) playCombo();
        else playCatch();
      } else if (delta < 0) {
        playObstacle();
      }
      setScore((prev) => Math.max(0, prev + delta));
    },
    [playCatch, playObstacle, playCombo]
  );

  const handleComboTriggered = useCallback(
    (gifUrl) => {
      setComboGif(gifUrl);
      playCombo();
      setTimeout(() => setComboGif(null), 1400);
    },
    [playCombo]
  );

  const startGame = useCallback(() => {
    if (!isReady) {
      console.log("Cannot start game: assets not ready");
      return;
    }
    console.log(`Starting Task ${currentTask}`);
    setShowLeaderboard(false);
    setShowEndTask(false);
    setGameActive(true);
    setTimeLeft(GAME_DURATION_SEC);
    setComboGif(null);
  }, [currentTask, isReady]);

  const handleGameEnd = useCallback(() => {
    console.log(`Game ended for Task ${currentTask}`);
    setGameActive(false);
    setTimeLeft(GAME_DURATION_SEC);
    setComboGif(null);
    setCurrentTask((prev) => {
      const nextTask = prev + 1;
      console.log(`Transitioning to Task ${nextTask}`);
      if (nextTask <= 3) return nextTask;
      setShowLeaderboard(true);
      setShowEndTask(true);
      const entry = { score, player: "Player", date: new Date().toISOString() };
      saveHighScoreToServer(entry);
      return 4;
    });
  }, [score, saveHighScoreToServer]);

  const handleReplayAll = useCallback(() => {
    console.log("Replaying all tasks from Task 1");
    setCurrentTask(1);
    setScore(0);
    setTimeLeft(GAME_DURATION_SEC);
    setGameActive(false);
    setShowLeaderboard(false);
    setShowEndTask(false);
    setComboGif(null);
  }, []);

  const toggleMute = useCallback(() => setIsMuted((prev) => !prev), []);

  return (
    <div
      className="h-[100vh] md:h-[160vh] w-full flex flex-col items-center p-4 sm:p-6 md:p-10"
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
      <div className="flex flex-wrap w-full max-w-4xl items-center justify-between mb-4 gap-4">
        <div>
          <p className="text-sm text-slate-600">Task {currentTask <= 3 ? currentTask : 3} • Score: {score}</p>
        </div>
      
      </div>

      <div className="w-full max-w-4xl rounded-2xl shadow p-4 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-slate-500">Task: {currentTask <= 3 ? currentTask : 3}</div>
        </div>

        {!gameActive ? (
          <div className="flex flex-col items-center pt-20">
            <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-yellow-400 leading-snug font-malvie text-center">
              READY TO <br /> BECOME HOH?
            </p>
            <p className="text-white text-sm md:text-base lg:text-lg mt-4 leading-snug font-malvie">
              ENTER ARENA
            </p>
            <img src={Scorereveal} alt="Main" className="w-80 rounded-lg mb-4" />
            <div className="flex flex-wrap gap-3">
              {currentTask <= 3 && (
                <button
                  onClick={startGame}
                  className={`p-0 rounded-2xl overflow-hidden ${
                    !isReady ? "opacity-60 cursor-not-allowed" : "hover:brightness-110"
                  }`}
                  disabled={!isReady}
                >
                  <img src={task} alt="Task button" className="w-48 h-full object-cover" />
                </button>
              )}
              {currentTask > 1 && currentTask <= 3 && (
                <button
                  onClick={() => {
                    console.log(`Replaying Task ${currentTask}`);
                    setTimeLeft(GAME_DURATION_SEC);
                    setGameActive(true);
                    setComboGif(null);
                  }}
                >
                  <img
                    src={replay}
                    alt="Replay Button"
                    className="w-36 md:w-48 lg:w-56 object-contain"
                  />
                </button>
              )}
              {currentTask > 3 && (
                <>
                  <button
                    onClick={handleReplayAll}
                    className="px-5 py-2 rounded-2xl bg-emerald-600 text-white"
                  >
                    Play Again
                  </button>
                  <button
                    onClick={() => fetchLeaderboardFromServer().then(() => setShowLeaderboard(true))}
                    className="px-5 py-2 rounded-2xl bg-purple-600 text-white"
                  >
                    Leaderboard
                  </button>
                  <button
                    onClick={() => setShowEndTask(true)}
                    className="px-5 py-2 rounded-2xl bg-rose-600 text-white"
                  >
                    End Task
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="relative">
            <Game
              canvasW={canvasSize.w}
              canvasH={canvasSize.h}
              currentTask={currentTask}
              timeLeft={timeLeft}
              setTimeLeft={setTimeLeft}
              onGameEnd={handleGameEnd}
              onScoreDelta={handleScoreDelta}
              onComboTriggered={handleComboTriggered}
              isMuted={isMuted}
              volume={volume}
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
        )}

        <div className="mt-6">
          {showLeaderboard && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h3 className="text-xl font-bold mb-2">Leaderboard</h3>
              <div className="p-4 rounded-xl border bg-white">
                {leaderboard.length > 0 ? (
                  <ol className="list-decimal ml-5 space-y-1">
                    {leaderboard.map((entry, idx) => (
                      <li key={idx}>
                        <span className="font-medium">{entry.player ?? "Player"}</span>: {entry.score} pts{" "}
                        <span className="text-slate-400 text-xs">
                          ({new Date(entry.date).toLocaleDateString()})
                        </span>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <div className="text-sm text-slate-500">No scores yet — play to create the first one!</div>
                )}
              </div>
            </motion.div>
          )}

          {showEndTask && currentTask > 3 && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mt-4 text-center"
            >
              <h2 className="text-2xl font-bold">Well Done!</h2>
              <p className="text-lg text-slate-600 mt-2">Your final score: {score}</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}