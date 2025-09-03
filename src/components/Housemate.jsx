
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import backgroundImage from "../assets/Intro Background.png";
import indomieLogo from "../assets/Large Indomie log.png";
import ContinueButton from "../assets/Continue.png";
import Transition from "../assets/Na you get am.gif";
import Housemate1 from "../assets/Male Character.png"; // Placeholder for first housemate image
import Housemate2 from "../assets/Female Charater.png"; // Placeholder for second housemate image

function Housemate() {
  const navigate = useNavigate();
  const [showWave, setShowWave] = useState(false);
  const [selectedHousemate, setSelectedHousemate] = useState(null);

  const handleHousemateSelect = (housemate) => {
    console.log("Selected:", housemate); // Debug log
    setSelectedHousemate(housemate);
  };

  const handleContinue = () => {
    console.log("Selected Housemate:", selectedHousemate); // Debug log
    setShowWave(true);
    setTimeout(() => {
      navigate("/gameTask");
    }, 1200);
  };

  // Housemates array
  const housemates = [
    { img: Housemate1, name: "Housemate1" },
    { img: Housemate2, name: "Housemate2" },
  ];

  // Animation variants for images
  const imageVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.8 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        type: "spring",
        bounce: 0.4,
        delay: i * 0.2, // Staggered entrance
      },
    }),
  };

  // Animation variants for border
  const borderVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1.1, transition: { duration: 0.3, ease: "easeOut" } },
  };

  // Animation variants for button
  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.8, type: "spring", bounce: 0.4 } },
  };

  return (
    <div
      className="w-full flex flex-col rounded-2xl h-[100vh] md:h-[160vh] p-4"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "top center",
        backgroundRepeat: "no-repeat",
        width: "100%",
      }}
    >
      {/* Top: Logo */}
      <motion.div
        className="p-4"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <img
          src={indomieLogo}
          alt="Indomie Logo"
          className="w-16 md:w-20 lg:w-24 h-auto"
        />
      </motion.div>

      {/* Content: Housemate Selection */}
      <div className="flex flex-col items-center justify-center space-y-6 flex-grow">
        <motion.div
          className="flex flex-col items-center justify-center space-y-6 w-full max-w-md p-6 rounded-xl"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
          }}
        >
          {/* Title */}
          <motion.h2
            className="text-2xl md:text-3xl font-bold text-yellow-400 leading-snug font-malvie mb-16"
            variants={imageVariants}
            custom={0}
          >
            Choose  Housemate
          </motion.h2>

          {/* Housemate Images */}
          <div className="flex justify-center items-center space-x-4 md:space-x-6">
            {housemates.map((housemate, i) => (
              <div key={housemate.name} className="relative">
                <motion.img
                  src={housemate.img}
                  alt={`${housemate.name} Image`}
                  className="w-32 md:w-40 lg:w-48 object-contain cursor-pointer mb-6"
                  variants={imageVariants}
                  initial="hidden"
                  animate="visible"
                  custom={i}
                  onClick={() => handleHousemateSelect(housemate.name)}
                />
                <AnimatePresence>
                  {selectedHousemate === housemate.name && (
                    <motion.div
                      className="absolute inset-0 border-4 border-[#FF4040] rounded-lg mb-4"
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      variants={borderVariants}
                    />
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Continue Button (Conditional) */}
          <AnimatePresence>
            {selectedHousemate && (
              <motion.div
                key="continue-button"
                variants={buttonVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                <Link to="/gameTask">
                  <motion.button
                    onClick={handleContinue}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <motion.img
                      src={ContinueButton}
                      alt="Continue Button"
                      className="w-36 md:w-48 lg:w-56 object-contain"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity, repeatType: "mirror" }}
                    />
                  </motion.button>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Transition Wave for Navigation */}
      <AnimatePresence>
        {showWave && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black"
          >
            <motion.img
              src={Transition}
              alt="Wave Transition"
              className="w-full h-full object-cover"
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Housemate;