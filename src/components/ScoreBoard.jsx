// src/components/ScoreBoard.jsx
import React from "react";
import { motion } from "framer-motion";

const ScoreBoard = ({ score, combo }) => {
  return (
    <div className="absolute top-5 left-5 p-4 bg-white/80 rounded-xl shadow-lg">
      <h2 className="text-xl font-bold">Score: {score}</h2>

      {combo > 1 && (
        <motion.div
          className="mt-2 text-lg font-semibold text-green-600"
          initial={{ scale: 0 }}
          animate={{ scale: 1.2 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          Combo x{combo}! 🎉
        </motion.div>
      )}
    </div>
  );
};

export default ScoreBoard;
