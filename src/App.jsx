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

  const handlePlay = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = 0.5;
      audio.play();
    }
    setShowPopup(false);
  };

  return (
    <BrowserRouter>
      <div className="flex items-center justify-center bg-cover bg-center relative">
        {/* Background Sound */}
        <audio ref={audioRef} src={backgroundSound} loop />

        {/* Popup Modal */}
        {showPopup && (
          <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className=" rounded-2xl shadow-lg p-6 max-w-sm text-center">
              <h2 className="text-xl font-bold mb-4 text-yellow-400 leading-snug font-malvie">🎵 ENABLE SOUND </h2>
            
              <button
                onClick={handlePlay}
                className="bg-orange-500 text-white px-6 py-2 rounded-lg shadow hover:bg-orange-600 transition"
              >
                ▶ Play
              </button>
            </div>
          </div>
        )}

        <Routes>
          {/* Game page with background */}
          <Route
            path="/"
            element={
              <div className="w-full max-w-4xl backdrop-blur shadow-lg">
                <Game />
              </div>
            }
          />

          {/* Pack page */}
          <Route
            path="/pack"
            element={
              <div className="w-full max-w-4xl backdrop-blur shadow-lg">
                <Pack />
              </div>
            }
          />

          {/* Form page */}
          <Route
            path="/form"
            element={
              <div className="w-full max-w-4xl backdrop-blur shadow-lg">
                <Form />
              </div>
            }
          />

          {/* Housemate page */}
          <Route
            path="/housemate"
            element={
              <div className="w-full max-w-4xl backdrop-blur shadow-lg">
                <Housemate />
              </div>
            }
          />

          {/* GameTask page */}
          <Route
            path="/GameTask"
            element={
              <div className="w-full max-w-4xl backdrop-blur shadow-lg">
                <GameTaskPage />
              </div>
            }
          />

          {/* Rules page */}
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
