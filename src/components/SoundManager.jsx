// src/components/SoundManager.jsx
import React, { useEffect } from "react";

const SoundManager = ({ trigger, type }) => {
  useEffect(() => {
    if (!trigger) return;

    let audio;
    switch (type) {
      case "catch":
        audio = new Audio("/sounds/catch.mp3");
        break;
      case "fail":
        audio = new Audio("/sounds/fail.mp3");
        break;
      case "combo":
        audio = new Audio("/sounds/combo.mp3");
        break;
      default:
        return;
    }
    audio.volume = 0.5;
    audio.play();
  }, [trigger, type]);

  return null; // no UI, only sound
};

export default SoundManager;
