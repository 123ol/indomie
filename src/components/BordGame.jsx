import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { clamp, rand, COMBO_GIFS, FRUIT_POINTS, OBSTACLE_PENALTY, COMBO_BONUS, SPAWN_INTERVAL_MS, BASE_CANVAS_W, BASE_CANVAS_H } from "./utils";
import { images } from "./assets";

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

  // Ensure images are loaded
  useEffect(() => {
    const imagePromises = Object.values(images).map(
      (img) =>
        new Promise((resolve) => {
          if (img.complete && img.naturalWidth !== 0) return resolve(true);
          img.onload = () => resolve(true);
          img.onerror = () => {
            console.warn(`Failed to load image: ${img.src}`);
            resolve(false);
          };
        })
    );
    Promise.all(imagePromises).then((results) => {
      if (results.every(Boolean)) setImagesLoaded(true);
      else console.warn("Some images failed to load");
    });
  }, []);

  // Scaled game constants
  const scaled = useMemo(
    () => ({
      basket: { 
        offset: basketHeight * scale, // Use basketHeight instead of fixed 60
        w: 180 * scale, 
        h: 150 * scale, 
        speed: 7 * scale 
      },
      entity: { minX: 20 * scale, r: 28 * scale, startY: 20 * scale },
      lineWidth: 4 * scale,
    }),
    [scale, basketHeight] // Add basketHeight to dependencies
  );

  // Game state refs
  const basketRef = useRef({
    x: canvasW / 2 - (scaled.basket?.w || 0) / 2,
    y: canvasH - (scaled.basket?.offset || 0), // Use scaled basket offset
    w: scaled.basket?.w || 0,
    h: scaled.basket?.h || 0,
    speed: scaled.basket?.speed || 0,
  });
  const fruitsRef = useRef([]);
  const obstaclesRef = useRef([]);
  const caughtStreakRef = useRef([]);
  const keysRef = useRef({});

  // Dynamic fall speed
  const baseFallSpeed = useMemo(() => clamp(2.2 + (currentTask - 1) * 0.35, 2.2, 6.0), [currentTask]);

  // Pointer/touch controls
  const handlePointerMove = useCallback(
    (e) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX ?? e.touches?.[0]?.clientX) - rect.left;
      basketRef.current.x = clamp(x - basketRef.current.w / 2, 0, canvasW - basketRef.current.w);
    },
    [canvasW]
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
  }, [canvasW]);

  // Spawn fruits & obstacles
  useEffect(() => {
    runningRef.current = true;
    const spawn = () => {
      if (!runningRef.current) return;
      const isObstacle = Math.random() < 0.22;
      const x = rand(scaled.entity.minX, canvasW - scaled.entity.minX);
      const vy = (baseFallSpeed + rand(0, 1.8)) * scale;

      if (isObstacle) {
        const bombType = BOMBS[Math.floor(Math.random() * BOMBS.length)];
        obstaclesRef.current.push({ x, y: -scaled.entity.startY, vy, r: scaled.entity.r, type: bombType });
      } else {
        const type = FRUITS[Math.floor(Math.random() * FRUITS.length)];
        fruitsRef.current.push({ x, y: -scaled.entity.startY, vy, r: scaled.entity.r, type });
      }
    };

    spawnIntervalRef.current = setInterval(spawn, SPAWN_INTERVAL_MS);
    return () => {
      clearInterval(spawnIntervalRef.current);
      runningRef.current = false;
    };
  }, [baseFallSpeed, canvasW, scale]);

  // Timer countdown
  useEffect(() => {
    runningRef.current = true;
    hasEndedRef.current = false;

    const tick = setInterval(() => {
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
  }, [setTimeLeft, onGameEnd]);

  // Main render loop
  useEffect(() => {
    if (!imagesLoaded) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Apply scaling to context
    ctx.scale(scale, scale);

    const drawBasket = (basket) => {
      if (images.basket.complete) {
        ctx.save();
        // Add drop shadow
        ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
        ctx.shadowBlur = 5 * scale;
        ctx.shadowOffsetX = 2 * scale;
        ctx.shadowOffsetY = 2 * scale;
        // Draw image
        ctx.drawImage(
          images.basket,
          basket.x / scale,
          basket.y / scale,
          basket.w / scale,
          basket.h / scale
        );
        // Add outline
       
        ctx.restore();
      }
    };

    const drawFruit = (fruit) => {
      const img = images[fruit.type];
      if (img?.complete) {
        ctx.save();
        // Add drop shadow
        ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
        ctx.shadowBlur = 5 * scale;
        ctx.shadowOffsetX = 2 * scale;
        ctx.shadowOffsetY = 2 * scale;
        // Draw image
        ctx.drawImage(
          img,
          (fruit.x - fruit.r) / scale,
          (fruit.y - fruit.r) / scale,
          (fruit.r * 2) / scale,
          (fruit.r * 2) / scale
        );
        
      }
    };

    const drawObstacle = (obstacle) => {
      const img = images[obstacle.type];
      if (img?.complete) {
        ctx.save();
        // Add drop shadow
        ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
        ctx.shadowBlur = 5 * scale;
        ctx.shadowOffsetX = 2 * scale;
        ctx.shadowOffsetY = 2 * scale;
        // Draw image
        ctx.drawImage(
          img,
          (obstacle.x - obstacle.r) / scale,
          (obstacle.y - obstacle.r) / scale,
          (obstacle.r * 2) / scale,
          (obstacle.r * 2) / scale
        );
      
      }
    };

    const collide = (cx, cy, r, bx, by, bw, bh) => {
      const nearestX = clamp(cx, bx, bx + bw);
      const nearestY = clamp(cy, by, by + bh);
      const dx = cx - nearestX;
      const dy = cy - nearestY;
      return dx * dx + dy * dy <= r * r;
    };

    const loop = () => {
      if (!runningRef.current) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvasW / scale, canvasH / scale);

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
            onComboTriggered(COMBO_GIFS[Math.floor(Math.random() * COMBO_GIFS.length)]);
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

      // Draw entities
      fruitsRef.current.forEach(drawFruit);
      obstaclesRef.current.forEach(drawObstacle);
      drawBasket(basket);

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(rafRef.current);
      runningRef.current = false;
      ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset canvas transform
    };
  }, [canvasW, canvasH, currentTask, onScoreDelta, onComboTriggered, scale, imagesLoaded]);

  return (
    <div className="relative w-full overflow-hidden">
      <div className="absolute top-2 right-3 z-10 bg-black/40 text-white text-sm px-3 py-1 rounded-full">
        Time Left: {timeLeft}s
      </div>
      <canvas
        ref={canvasRef}
        width={canvasW}
        height={canvasH}
        className="w-full h-[85vh] sm:h-[70vh] md:h-auto"
      />
    </div>
  );
}

export default BordGame;