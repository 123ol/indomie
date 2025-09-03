// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Game from "./components/Game";
import Pack from "./components/Pack";
import Rules from './components/Rules';
import Form from "./components/Form";
import Housemate from "./components/Housemate";
import GameTaskPage from "./components/GameTaskPage";

 // adjust path if needed

const App = () => {
  return (
    <BrowserRouter>
    <div
              className="flex items-center justify-center bg-cover bg-center "
             
            >
      <Routes>
        {/* Game page with background */}
        <Route
          path="/"
          element={
            
              <div className="w-full max-w-4xl  backdrop-blur rounded-2xl shadow-lg" >
                <Game />
              </div>
           
          }
        />

        {/* Pack page without background */}
        
        <Route
          path="/pack"
          element={
            
              <div className="w-full max-w-4xl   rounded-2xl backdrop-blur  shadow-lg">
               <Pack />
              </div>
           
          }
        />

           <Route
          path="/form"
          element={
            
              <div className="w-full max-w-4xl  rounded-2xl backdrop-blur  shadow-lg">
               <Form />
              </div>
           
          }
        />
         <Route
          path="/housemate"
          element={
            
              <div className="w-full max-w-4xl   rounded-2xl backdrop-blur  shadow-lg">
               <Housemate />
              </div>
           
          }
        />
         <Route
          path="/GameTask"
          element={
            
              <div className="w-full max-w-4xl   rounded-2xl backdrop-blur  shadow-lg">
               <GameTaskPage />
              </div>
           
          }
        />

         <Route
          path="/Rules"
          element={
            
              <div className="w-full max-w-4xl   rounded-2xl backdrop-blur  shadow-lg">
               <Rules />
              </div>
           
          }
        />
      </Routes> </div>
    </BrowserRouter>
  );
};

export default App;
