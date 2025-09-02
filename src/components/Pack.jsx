import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import backgroundImage from "../assets/Intro Background.png";
import indomieLogo from "../assets/Large Indomie log.png";
import ContinueButton from "../assets/Continue.png";
import Crayfish from "../assets/crayfish frame.png";
import Peppersoup from "../assets/Pepper soup noodle.png";
import OrientalNoodle from "../assets/Oriental Noodle.png";
import Transition from "../assets/Na you get am.gif";

function Pack() {
  const navigate = useNavigate();
  const [showWave, setShowWave] = useState(false);
  const [selectedFlavor, setSelectedFlavor] = useState(null); // Track selected flavor

 const handleContinue = () => {
    setShowWave(true);
    setTimeout(() => {
      navigate("/form");
    }, 1200);
  };
  // Flavors array
  const flavours = [
    { img: Crayfish, name: "Crayfish" },
    { img: Peppersoup, name: "Peppersoup" },
    { img: OrientalNoodle, name: "Oriental" },
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

  return (
    <div
      className="w-full flex flex-col h-[120vh] p-24 "
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "top center",
        backgroundRepeat: "no-repeat",
        width: "100%",
      }}
    >
      {/* Logo */}
      <motion.div
        className=""
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

      {/* Content */}
      <div className="flex flex-col items-center justify-center space-y-6 pt-28">
        {/* Title */}
        <motion.div
          className="text-center px-4 mb-16"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3, type: "spring" }}
          whileHover={{ scale: 1.05 }}
        >
          <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-yellow-400 leading-snug font-malvie">
            WHICH FLAVOR ARE <br />YOU HAVING FIRST?<br />
          </p>
       
        </motion.div>

        {/* Flavors Side by Side */}
        <div className="flex justify-center items-center space-x-4 md:space-x-6 lg:space-x-8 mb-20">
          {flavours.map((flavour, i) => (
            <div key={flavour.name} className="relative">
              <motion.img
                src={flavour.img}
                alt={`${flavour.name} Pack`}
                className="w-20 md:w-24 lg:w-28 object-contain cursor-pointer"
                initial="hidden"
                animate="visible"
                variants={imageVariants}
                custom={i}
                onClick={() => setSelectedFlavor(flavour.name)}
              />
              <AnimatePresence>
                {selectedFlavor === flavour.name && (
                  <motion.div
                    className="absolute inset-0 border-4 border-yellow-400 rounded-lg"
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

        {/* Continue Button (appears after selection) */}
        <AnimatePresence>
          {selectedFlavor && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className=""
              transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
            >
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
  <AnimatePresence>
        {showWave && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
           
          >
           
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Pack;