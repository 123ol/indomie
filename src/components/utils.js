import NaYouGetAm from "../assets/Na-you-get-am.gif";
import Flavour from "../assets/Flavour.gif";
import SpiceHit from "../assets/Spicy-hit.gif";
import TimeUpGif from "../assets/timeover.png"; 
import GameOverGif from "../assets/gameover.png"; 
import ComboSound from "../assets/sounds/COMBO SOUND.mp3";

export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
export const rand = (min, max) => Math.random() * (max - min) + min;

export const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const COMBO_GIFS = [
  NaYouGetAm,    // Index 0
  Flavour,        // Index 1
  SpiceHit,       // Index 2
  TimeUpGif,      // Index 3
  GameOverGif,    // Index 4
];

export const COMBO_SOUNDS = [
  ComboSound,
];

export const SOUND_CATCH = "https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg";
export const SOUND_OBSTACLE = "https://actions.google.com/sounds/v1/alarms/beep_short.ogg";
export const SOUND_TIME_UP = "https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg";
export const SOUND_GAME_OVER = "https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg";

export const API_BASE = "/api";
export const ENDPOINT_SAVE = `${API_BASE}/leaderboard`;
export const ENDPOINT_FETCH = `${API_BASE}/leaderboard`;

export const BASE_CANVAS_W = 800;
export const BASE_CANVAS_H = 520;
export const GAME_DURATION_SEC = 60;
export const SPAWN_INTERVAL_MS = 900;
export const FRUIT_POINTS = 10;
export const OBSTACLE_PENALTY = 8;
export const COMBO_BONUS = 30;