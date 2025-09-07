import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import backgroundImage from "../assets/Other stage background.webp";
import indomieLogo from "../assets/Large Indomie log.png";
import ContinueButton from "../assets/Continue.png";
import Crayfish from "../assets/Crayfish 2.png";
import Peppersoup from "../assets/Peppersoup 2.png";
import OrientalNoodle from "../assets/Oriental 1.png";

function Pack() {
  const navigate = useNavigate();
  const [showWave, setShowWave] = useState(false);
  const [selectedFlavor, setSelectedFlavor] = useState(null); // Track selected flavor

  const handleContinue = () => {
    if (!selectedFlavor) {
      console.warn("No flavor selected, cannot continue");
      return;
    }
    setShowWave(true);
    setTimeout(() => {
      navigate("/form");
    }, 1200);
  };

  // Save selected flavor to localStorage
  const handleFlavorSelect = (flavorName) => {
    console.log(`handleFlavorSelect: flavor=${flavorName}`);
    setSelectedFlavor(flavorName);
    try {
      localStorage.setItem("selectedFlavor", flavorName);
      localStorage.setItem("taskFlavors", JSON.stringify([flavorName, null, null]));
      console.log(`Saved selectedFlavor=${flavorName} and taskFlavors=[${flavorName}, null, null] to localStorage`);
    } catch (error) {
      console.error("Failed to save flavor data to localStorage:", error);
    }
  };

  // Flavors array
  const flavours = [
    { img: Crayfish, name: "Crayfish",  text:'CRAYFISH FLAVOR'},
    { img: OrientalNoodle, name: "Oriental" ,  text: "ORIENTAL FRIED NOODLES"},
    { img: Peppersoup, name: "Peppersoup" ,  text:'CHICKEN PEPPERSOUP'},
    
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
      className="w-full flex flex-col min-h-[100vh] md:h-[160vh] p-2 "
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
      <div className="flex flex-col items-center justify-center space-y-6 pt-32">
        {/* Title */}
        <motion.div
          className="text-center px-4 mb-16"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3, type: "spring" }}
          whileHover={{ scale: 1.05 }}
        >
          <p className="text-3xl font-bold text-yellow-400 leading-snug font-malvie w-[100%]">
            WHICH FLAVOR ARE <br /> YOU HAVING FIRST?
          </p>
        </motion.div>

        {/* Flavors Side by Side */}
        <div className="flex justify-center items-center space-x-4 md:space-x-6 lg:space-x-8 mb-20 m-auto">
          {flavours.map((flavour, i) => (
            <div key={flavour.name} className="relative">
              <motion.img
                src={flavour.img}
                alt={`${flavour.text} Pack`}
                className="max-w-24  object-contain cursor-pointer m-auto"
                initial="hidden"
                animate="visible"
                variants={imageVariants}
                custom={i}
                onClick={() => handleFlavorSelect(flavour.name)}
              /> <p className="text-white mt-2 text-center text-xl leading-snug font-malvie">{flavour.text}</p>
              <AnimatePresence>
                {selectedFlavor === flavour.name && (
                  <div>
                  <motion.div
                    className="absolute inset-0 border-4 border-yellow-400 rounded-lg"
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={borderVariants}
                  /> 
                 
                  </div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Continue Button (appears after selection) */}
        <AnimatePresence>
          {selectedFlavor && (
          <motion.div className="absolute bottom-5 left-0 w-full flex justify-center">
  <motion.button
    onClick={handleContinue}
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    className="p-0 rounded-2xl overflow-hidden"
  >
    <motion.img
      src={ContinueButton}
      alt="Continue Button"
      className="w-56 object-contain"
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
            {/* Add wave animation or content here if needed */}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Pack;