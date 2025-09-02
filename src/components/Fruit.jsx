// src/components/Fruit.jsx
import React from "react";
import { motion } from "framer-motion";

const Fruit = ({ type, x, y, size }) => {
  const fruitMap = {
    apple: "🍎",
    banana: "🍌",
    orange: "🍊",
    grape: "🍇",
    lemon: "🍋",
  };

  return (
    <motion.div
      className="absolute"
      initial={{ top: -50 }}
      animate={{ top: y }}
      transition={{ duration: 0.3, ease: "linear" }}
      style={{
        left: x,
        fontSize: size,
        userSelect: "none",
      }}
    >
      {fruitMap[type] || "🍒"}
    </motion.div>
  );
};

export default Fruit;
