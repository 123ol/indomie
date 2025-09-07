// src/App.jsx
import React, { useEffect, useRef, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Game from "./components/Game";
import Pack from "./components/Pack";
import Rules from "./components/Rules";
import Form from "./components/Form";
import Housemate from "./components/Housemate";
import GameTaskPage from "./components/GameTaskPage";
import backgroundSound from "./assets/sounds/INDOMIE THEME SOUND.mp3"; // adjust path if needed

const App = () => {
  const audioRef = useRef(null);
  const [showPopup, setShowPopup] = useState(true);
  const [isAllowedDevice, setIsAllowedDevice] = useState(true);

  // Allow only mobile (≤768px)
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      if (width <= 768) {
        setIsAllowedDevice(true); // ✅ mobile only
      } else {
        setIsAllowedDevice(false); // ❌ block tablets & desktops
      }
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  const handlePlay = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = 0.5;
      audio.play();
    }
    setShowPopup(false);
  };

  if (!isAllowedDevice) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white text-center p-6">
        <div>
          <h1 className="text-2xl font-bold mb-4">🚫 Unsupported Device</h1>
          <p>
            This app is only available on{" "}
            <span className="text-yellow-400">mobile phones</span>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="flex items-center justify-center bg-cover bg-center relative">
        {/* Background Sound */}
        <audio ref={audioRef} src={backgroundSound} loop />

        {/* Popup Modal */}
        {showPopup && (
          <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="rounded-2xl shadow-lg p-6 max-w-sm text-center">
              <h2 className="text-xl font-bold mb-4 text-yellow-400 leading-snug font-malvie">
                🎵 ENABLE SOUND
              </h2>

              <button
                onClick={handlePlay}
                className="text-white px-6 py-2 rounded-lg shadow transition bg-yellow-400 leading-snug font-malvie"
              >
                ▶ Play
              </button>
            </div>
          </div>
        )}

        <Routes>
          <Route
            path="/"
            element={
              <div className="w-full max-w-4xl backdrop-blur shadow-lg">
                <Game />
              </div>
            }
          />
          <Route
            path="/pack"
            element={
              <div className="w-full max-w-4xl backdrop-blur shadow-lg">
                <Pack />
              </div>
            }
          />
          <Route
            path="/form"
            element={
              <div className="w-full max-w-4xl backdrop-blur shadow-lg">
                <Form />
              </div>
            }
          />
          <Route
            path="/housemate"
            element={
              <div className="w-full max-w-4xl backdrop-blur shadow-lg">
                <Housemate />
              </div>
            }
          />
          <Route
            path="/GameTask"
            element={
              <div className="w-full max-w-4xl backdrop-blur shadow-lg">
                <GameTaskPage />
              </div>
            }
          />
          <Route
            path="/Rules"
            element={
              <div className="w-full max-w-4xl backdrop-blur shadow-lg">
                <Rules />
              </div>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
