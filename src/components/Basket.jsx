// src/components/Basket.jsx
import React from "react";
import { motion } from "framer-motion";

const Basket = ({ x, basketWidth }) => {
  return (
    <motion.div
      className="absolute bottom-5 flex justify-center items-center"
      animate={{ left: x }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      style={{
        width: basketWidth,
        height: 60,
        backgroundColor: "#8B4513",
        borderRadius: "0 0 20px 20px",
        color: "white",
        fontSize: "24px",
      }}
    >
      🧺 Basket
    </motion.div>
  );
};

export default Basket;
