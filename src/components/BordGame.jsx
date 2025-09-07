import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { clamp, rand, COMBO_GIFS, FRUIT_POINTS, OBSTACLE_PENALTY, COMBO_BONUS, SPAWN_INTERVAL_MS, BASE_CANVAS_W, BASE_CANVAS_H } from "./utils";
import { getImages } from "./images";
import backgroundImage from "../assets/Arena Interface.png";

function BordGame({
  canvasW = BASE_CANVAS_W,
  canvasH = BASE_CANVAS_H,
  currentTask,
  timeLeft,
  setTimeLeft,
  onGameEnd,
  onScoreDelta,
  onComboTriggered,
  basketHeight,
  isMuted,
  volume,
  selectedFlavors,
  isPaused,
  showTimeUp,
  setShowTimeUp,
  showGameOver,
  setShowGameOver,
  comboGifs,
}) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const spawnIntervalRef = useRef(null);
  const runningRef = useRef(false);
  const hasEndedRef = useRef(false);
  const scale = useMemo(() => canvasW / BASE_CANVAS_W, [canvasW]);
  const FRUITS = ["apple", "mango", "nut"];
  const BOMBS = ["bomb", "bomb2", "bomb3"];
  
  // Preload images with loading state
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [gameImages, setGameImages] = useState(null);
  const [backgroundImg, setBackgroundImg] = useState(null);
  const timeUpImageRef = useRef(new Image());
  const gameOverImageRef = useRef(new Image());
  const comboImageRef = useRef(new Image());
  const [gifLoadStatus, setGifLoadStatus] = useState({
    timeUp: false,
    gameOver: false,
    combo: false,
  });

  // Bounce animation state
  const [bounceScale, setBounceScale] = useState(1);
  const [notificationStartTime, setNotificationStartTime] = useState(null);

  // Log props for debugging
  useEffect(() => {
    console.log(`BordGame props: currentTask=${currentTask}, selectedFlavors=${JSON.stringify(selectedFlavors)}, showTimeUp=${showTimeUp}, showGameOver=${showGameOver}, isPaused=${isPaused}`);
  }, [currentTask, selectedFlavors, showTimeUp, showGameOver, isPaused]);

  // Load images dynamically, including background and notification GIFs
  useEffect(() => {
    if (selectedFlavors === undefined) {
      console.warn(`selectedFlavors is undefined for Task ${currentTask}, skipping image loading`);
      return;
    }

    const images = getImages(currentTask, selectedFlavors);
    setGameImages(images);

    const bgImg = new Image();
    bgImg.src = backgroundImage;

    // Load notification GIFs
    timeUpImageRef.current.src = comboGifs[3]; // TimeUpGif
    gameOverImageRef.current.src = comboGifs[4]; // GameOverGif

    const imagePromises = [
      ...Object.values(images).map(
        (img) =>
          new Promise((resolve) => {
            if (img.complete && img.naturalWidth !== 0) {
              console.log(`Loaded image: ${img.src}`);
              return resolve(true);
            }
            img.onload = () => {
              console.log(`Loaded image: ${img.src}`);
              resolve(true);
            };
            img.onerror = () => {
              console.warn(`Failed to load image: ${img.src}`);
              resolve(false);
            };
          })
      ),
      new Promise((resolve) => {
        if (bgImg.complete && bgImg.naturalWidth !== 0) {
          console.log(`Loaded background image: ${bgImg.src}`);
          setBackgroundImg(bgImg);
          return resolve(true);
        }
        bgImg.onload = () => {
          console.log(`Loaded background image: ${bgImg.src}`);
          setBackgroundImg(bgImg);
          resolve(true);
        };
        bgImg.onerror = () => {
          console.warn(`Failed to load background image: ${bgImg.src}`);
          setBackgroundImg(null);
          resolve(false);
        };
      }),
      new Promise((resolve) => {
        if (timeUpImageRef.current.complete && timeUpImageRef.current.naturalWidth !== 0) {
          console.log(`Loaded TimeUp GIF: ${comboGifs[3]}`);
          setGifLoadStatus((prev) => ({ ...prev, timeUp: true }));
          return resolve(true);
        }
        timeUpImageRef.current.onload = () => {
          console.log(`Loaded TimeUp GIF: ${comboGifs[3]}`);
          setGifLoadStatus((prev) => ({ ...prev, timeUp: true }));
          resolve(true);
        };
        timeUpImageRef.current.onerror = () => {
          console.warn(`Failed to load TimeUp GIF: ${comboGifs[3]}`);
          setGifLoadStatus((prev) => ({ ...prev, timeUp: false }));
          resolve(false);
        };
      }),
      new Promise((resolve) => {
        if (gameOverImageRef.current.complete && gameOverImageRef.current.naturalWidth !== 0) {
          console.log(`Loaded GameOver GIF: ${comboGifs[4]}`);
          setGifLoadStatus((prev) => ({ ...prev, gameOver: true }));
          return resolve(true);
        }
        gameOverImageRef.current.onload = () => {
          console.log(`Loaded GameOver GIF: ${comboGifs[4]}`);
          setGifLoadStatus((prev) => ({ ...prev, gameOver: true }));
          resolve(true);
        };
        gameOverImageRef.current.onerror = () => {
          console.warn(`Failed to load GameOver GIF: ${comboGifs[4]}`);
          setGifLoadStatus((prev) => ({ ...prev, gameOver: false }));
          resolve(false);
        };
      }),
    ];

    Promise.all(imagePromises).then((results) => {
      if (results.every(Boolean)) {
        console.log(`All images loaded for Task ${currentTask}`);
        setImagesLoaded(true);
      } else {
        console.warn("Some images failed to load");
      }
    });
  }, [currentTask, selectedFlavors, comboGifs]);

  // Handle combo GIF (e.g., SpiceHit)
  useEffect(() => {
    const handleCombo = (gifUrl) => {
      if (gifUrl === comboGifs[2]) { // SpiceHit
        console.log(`Loading SpiceHit GIF: ${gifUrl}`);
        comboImageRef.current.src = gifUrl;
        comboImageRef.current.onload = () => {
          console.log(`Loaded SpiceHit GIF: ${gifUrl}`);
          setGifLoadStatus((prev) => ({ ...prev, combo: true }));
        };
        comboImageRef.current.onerror = () => {
          console.warn(`Failed to load SpiceHit GIF: ${gifUrl}`);
          setGifLoadStatus((prev) => ({ ...prev, combo: false }));
        };
      }
    };
    // Assuming onComboTriggered is called with comboGifs[2] for SpiceHit
    return () => {};
  }, [comboGifs]);

  // Bounce animation for all GIFs
  useEffect(() => {
    if (showTimeUp || showGameOver || comboImageRef.current.src) {
      setNotificationStartTime(Date.now());
      let startTime = Date.now();
      const animateBounce = () => {
        const elapsed = (Date.now() - startTime) / 1000; // Time in seconds
        const scale = 1 + 0.2 * Math.sin(elapsed * 2 * Math.PI); // Oscillate between 1 and 1.2
        setBounceScale(scale);
        if (elapsed < 3 && (showTimeUp || showGameOver || comboImageRef.current.src)) {
          requestAnimationFrame(animateBounce);
        } else {
          setBounceScale(1);
          if (showTimeUp) setShowTimeUp(false);
          if (showGameOver) setShowGameOver(false);
          if (comboImageRef.current.src) {
            comboImageRef.current.src = ""; // Clear combo GIF
            setGifLoadStatus((prev) => ({ ...prev, combo: false }));
          }
        }
      };
      animateBounce();
    }
  }, [showTimeUp, showGameOver, setShowTimeUp, setShowGameOver]);

  // Scaled game constants
  const scaled = useMemo(
    () => ({
      basket: {
        offset: basketHeight * scale,
        w: 180 * scale,
        h: 150 * scale,
        speed: 7 * scale,
      },
      entity: { minX: 20 * scale, r: 35 * scale, startY: 20 * scale },
      lineWidth: 4 * scale,
    }),
    [scale, basketHeight]
  );

  // Game state refs
  const basketRef = useRef({
    x: canvasW / 2 - (scaled.basket?.w || 0) / 2,
    y: canvasH - (scaled.basket?.offset || 0),
    w: scaled.basket?.w || 0,
    h: scaled.basket?.h || 0,
    speed: scaled.basket?.speed || 0,
  });
  const fruitsRef = useRef([]);
  const obstaclesRef = useRef([]);
  const caughtStreakRef = useRef([]);
  const keysRef = useRef({});

  // Dynamic fall speed
  const baseFallSpeed = useMemo(() => clamp(3.0 + (currentTask - 1) * 0.5, 3.0, 8.0), [currentTask]);

  // Pointer/touch controls
  const handlePointerMove = useCallback(
    (e) => {
      if (isPaused) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX ?? e.touches?.[0]?.clientX) - rect.left;
      basketRef.current.x = clamp(x - basketRef.current.w / 2, 0, canvasW - basketRef.current.w);
    },
    [canvasW, isPaused]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener("mousemove", handlePointerMove);
    canvas.addEventListener("touchmove", handlePointerMove, { passive: true });

    return () => {
      canvas.removeEventListener("mousemove", handlePointerMove);
      canvas.removeEventListener("touchmove", handlePointerMove);
    };
  }, [handlePointerMove]);

  // Keyboard handling
  useEffect(() => {
    const handleKeyDown = (e) => (keysRef.current[e.key.toLowerCase()] = true);
    const handleKeyUp = (e) => (keysRef.current[e.key.toLowerCase()] = false);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Basket movement loop for keyboard
  useEffect(() => {
    let id;
    const step = () => {
      if (isPaused) {
        id = requestAnimationFrame(step);
        return;
      }
      const keys = keysRef.current;
      const basket = basketRef.current;
      if (keys["a"] || keys["arrowleft"]) {
        basket.x = clamp(basket.x - basket.speed, 0, canvasW - basket.w);
      }
      if (keys["d"] || keys["arrowright"]) {
        basket.x = clamp(basket.x + basket.speed, 0, canvasW - basket.w);
      }
      id = requestAnimationFrame(step);
    };

    id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }, [canvasW, isPaused]);

  // Spawn fruits & obstacles
  useEffect(() => {
    runningRef.current = true;
    const bombProbability = currentTask === 1 ? 0.2 : currentTask === 2 ? 0.3 : 0.4;

    const spawn = () => {
      if (!runningRef.current || isPaused) return;

      // 🎲 Randomly decide how many items to spawn (1–3)
      const count = rand(1, 3);  

      for (let i = 0; i < count; i++) {
        const isObstacle = Math.random() < bombProbability;
        const x = rand(scaled.entity.minX, canvasW - scaled.entity.minX);
        const vy = (baseFallSpeed + rand(0, 2.0)) * scale;

        if (isObstacle) {
          const bombType = BOMBS[Math.floor(Math.random() * BOMBS.length)];
          obstaclesRef.current.push({
            x,
            y: -scaled.entity.startY,
            vy,
            r: scaled.entity.r,
            type: bombType,
          });
          console.log(`Spawned bomb (${bombType}) at x: ${x}, vy: ${vy}, Task: ${currentTask}`);
        } else {
          const type = FRUITS[Math.floor(Math.random() * FRUITS.length)];
          fruitsRef.current.push({
            x,
            y: -scaled.entity.startY,
            vy,
            r: scaled.entity.r,
            type,
          });
          console.log(`Spawned fruit (${type}) at x: ${x}, vy: ${vy}, Task: ${currentTask}`);
        }
      }
    };

    spawnIntervalRef.current = setInterval(spawn, SPAWN_INTERVAL_MS);
    return () => {
      clearInterval(spawnIntervalRef.current);
      runningRef.current = false;
    };
  }, [baseFallSpeed, canvasW, scale, currentTask, isPaused]);

  // Timer countdown
  useEffect(() => {
    runningRef.current = true;
    hasEndedRef.current = false;

    const tick = setInterval(() => {
      if (isPaused) return;
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(tick);
          runningRef.current = false;
          if (!hasEndedRef.current) {
            hasEndedRef.current = true;
            onGameEnd();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(tick);
      runningRef.current = false;
    };
  }, [setTimeLeft, onGameEnd, isPaused]);

  // Main render loop
  useEffect(() => {
    if (!imagesLoaded || !gameImages || !backgroundImg || selectedFlavors === undefined) {
      console.log(`Render loop skipped: imagesLoaded=${imagesLoaded}, gameImages=${!!gameImages}, backgroundImg=${!!backgroundImg}, selectedFlavors=${JSON.stringify(selectedFlavors)}`);
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Set high-quality image rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    const drawBackground = () => {
      if (backgroundImg.complete && backgroundImg.naturalWidth > 0) {
        ctx.drawImage(backgroundImg, 0, 0, canvasW / scale, canvasH / scale);
      } else {
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, canvasW / scale, canvasH / scale);
      }
    };

    const drawBasket = (basket) => {
      const img = gameImages.basket;
      if (img?.complete && img.naturalWidth > 0) {
        ctx.save();
        ctx.drawImage(
          img,
          basket.x / scale,
          basket.y / scale,
          basket.w / scale,
          basket.h / scale
        );
        ctx.restore();
      }
    };

    const drawFruit = (fruit) => {
      const img = gameImages[fruit.type];
      if (img?.complete && img.naturalWidth > 0) {
        ctx.save();
        ctx.drawImage(
          img,
          (fruit.x - fruit.r) / scale,
          (fruit.y - fruit.r) / scale,
          (fruit.r * 2) / scale,
          (fruit.r * 2) / scale
        );
        ctx.restore();
      }
    };

    const drawObstacle = (obstacle) => {
      const img = gameImages[obstacle.type];
      if (img?.complete && img.naturalWidth > 0) {
        ctx.save();
        ctx.drawImage(
          img,
          (obstacle.x - obstacle.r) / scale,
          (obstacle.y - obstacle.r) / scale,
          (obstacle.r * 2) / scale,
          (obstacle.r * 2) / scale
        );
        ctx.restore();
      }
    };

    const drawNotification = () => {
      if (!showTimeUp && !showGameOver && !comboImageRef.current.src) return;
      
      const img = showTimeUp
        ? timeUpImageRef.current
        : showGameOver
        ? gameOverImageRef.current
        : comboImageRef.current;
      const imgKey = showTimeUp ? "timeUp" : showGameOver ? "gameOver" : "combo";
      const baseWidth = canvasW / 3; // Approx 266px at BASE_CANVAS_W=800
      const baseHeight = baseWidth; // Square aspect ratio
      const imgWidth = baseWidth * bounceScale / scale;
      const imgHeight = baseHeight * bounceScale / scale;
      const x = (canvasW / 2 - baseWidth / 2) / scale;
      const y = (canvasH / 2 - baseHeight / 2) / scale;

      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset all transformations
      ctx.scale(scale, scale); // Reapply canvas scale

      if (img && img.complete && img.naturalWidth > 0 && gifLoadStatus[imgKey]) {
        try {
          ctx.drawImage(img, x, y, imgWidth, imgHeight);
          console.log(`Drawing ${imgKey} GIF at (${x}, ${y}), size: ${imgWidth}x${imgHeight}, bounceScale: ${bounceScale}`);
        } catch (err) {
          console.error(`Failed to draw ${imgKey} GIF:`, err);
        }
      } else {
        ctx.fillStyle = "white";
        ctx.font = `${48 / scale}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(
          showTimeUp ? "Time Up!" : showGameOver ? "Game Over!" : "Combo!",
          canvasW / (2 * scale),
          canvasH / (2 * scale)
        );
        console.warn(`Fallback text rendered for ${imgKey}, loaded: ${gifLoadStatus[imgKey]}`);
      }
      ctx.restore();
    };

    const collide = (cx, cy, r, bx, by, bw, bh) => {
      const nearestX = clamp(cx, bx, bx + bw);
      const nearestY = clamp(cy, by, by + bh);
      const dx = cx - nearestX;
      const dy = cy - nearestY;
      return dx * dx + dy * dy <= r * r;
    };

    const loop = () => {
      if (!runningRef.current && !showTimeUp && !showGameOver && !comboImageRef.current.src) return;

      ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transformation matrix
      ctx.clearRect(0, 0, canvasW, canvasH); // Clear with unscaled dimensions
      ctx.scale(scale, scale); // Reapply scaling

      drawBackground();

      if (!isPaused) {
        // Update positions
        fruitsRef.current.forEach((fruit) => {
          fruit.y += fruit.vy;
        });
        obstaclesRef.current.forEach((obstacle) => {
          obstacle.y += obstacle.vy;
        });

        // Remove offscreen entities
        fruitsRef.current = fruitsRef.current.filter((fruit) => fruit.y - fruit.r <= canvasH);
        obstaclesRef.current = obstaclesRef.current.filter((obstacle) => obstacle.y - obstacle.r <= canvasH);

        // Handle collisions
        const basket = basketRef.current;
        for (let i = fruitsRef.current.length - 1; i >= 0; i--) {
          const fruit = fruitsRef.current[i];
          if (collide(fruit.x, fruit.y, fruit.r, basket.x, basket.y, basket.w, basket.h)) {
            onScoreDelta(FRUIT_POINTS);
            caughtStreakRef.current.push(fruit.type);
            if (caughtStreakRef.current.length > 3) caughtStreakRef.current.shift();
            const streak = caughtStreakRef.current;
            if (streak.length === 3 && new Set(streak).size === 3 && streak.every((t) => FRUITS.includes(t))) {
              onScoreDelta(COMBO_BONUS);
              onComboTriggered(comboGifs[2]); // Force SpiceHit for consistency
              caughtStreakRef.current = [];
            }
            fruitsRef.current.splice(i, 1);
          }
        }

        for (let i = obstaclesRef.current.length - 1; i >= 0; i--) {
          const obstacle = obstaclesRef.current[i];
          if (collide(obstacle.x, obstacle.y, obstacle.r, basket.x, basket.y, basket.w, basket.h)) {
            onScoreDelta(-OBSTACLE_PENALTY);
            caughtStreakRef.current = [];
            obstaclesRef.current.splice(i, 1);
          }
        }
      }

      // Draw entities
      fruitsRef.current.forEach(drawFruit);
      obstaclesRef.current.forEach(drawObstacle);
      drawBasket(basketRef.current); // Fixed: Use basketRef.current
      drawNotification();

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(rafRef.current);
      runningRef.current = false;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    };
  }, [
    canvasW,
    canvasH,
    currentTask,
    onScoreDelta,
    onComboTriggered,
    scale,
    imagesLoaded,
    gameImages,
    backgroundImg,
    selectedFlavors,
    isPaused,
    showTimeUp,
    showGameOver,
    bounceScale,
    comboGifs,
    gifLoadStatus,
  ]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="relative w-full overflow-hidden">
      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 bg-black text-white text-sm w-14 h-14 flex items-center justify-center rounded-full border-4 border-white">
        {formatTime(timeLeft)}
      </div>
      <canvas
        ref={canvasRef}
        width={canvasW}
        height={canvasH}
        className="h-[100vh]"
        style={{
          width: "100%",
        }}
      />
    </div>
  );
}

export default BordGame;