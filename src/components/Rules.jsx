import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import backgroundImage from "../assets/Other stage background.webp";
import indomieLogo from "../assets/Large Indomie log.png";
import gameRule1 from "../assets/Game rukle.webp";
import gameRule2 from "../assets/Game rule 2.webp";
import ContinueButton from "../assets/Continue.png";
import Right from "../assets/Right Button.png";
import Left from "../assets/Left Button.png";
import TopDice from "../assets/Dicetop.png";
import BottomDice from "../assets/Dicebottom.png";

function Rules() {
  const navigate = useNavigate();
  const [showWave, setShowWave] = useState(false);
  const [currentSection, setCurrentSection] = useState(1);
  const [direction, setDirection] = useState(0);
  const diceControlsTop = useAnimation(); // Top dice
  const diceControlsBottom = useAnimation(); // Bottom dice

  const handleContinue = () => {
    setShowWave(true);
    setTimeout(() => {
      navigate("/pack");
    }, 1200);
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentSection(2);
  };

  const handleBack = () => {
    setDirection(-1);
    setCurrentSection(1);
  };

  // Animate dice with smooth bouncing motion
  useEffect(() => {
    const animateDice = async () => {
      // Initial entrance animation for dice
      await Promise.all([
        diceControlsTop.start({
          y: 0,
          x: window.innerWidth < 768 ? 10 : 20,
          opacity: 1,
          scale: 1,
          transition: { duration: 1, ease: "easeOut", bounce: 0.4, delay: 0.9 },
        }),
        diceControlsBottom.start({
          y: 0,
          x: window.innerWidth < 768 ? -10 : -20,
          opacity: 1,
          scale: 1,
          transition: { duration: 1, ease: "easeOut", bounce: 0.4, delay: 1.0 },
        }),
      ]);

      // Continuous bouncing animation for dice
      diceControlsTop.start({
        y: [0, -10],
        rotate: [-2, 2],
        x: window.innerWidth < 768 ? 10 : 20,
        transition: {
          y: { duration: 1.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" },
          rotate: { duration: 1.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" },
          x: { duration: 0 },
        },
      });
      diceControlsBottom.start({
        y: [0, -10],
        rotate: [2, -2],
        x: window.innerWidth < 768 ? -10 : -20,
        transition: {
          y: { duration: 1.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" },
          rotate: { duration: 1.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" },
          x: { duration: 0 },
        },
      });
    };

    animateDice();

    // Update dice positions on window resize
    const handleResize = () => {
      diceControlsTop.start({ x: window.innerWidth < 768 ? 10 : 20, transition: { duration: 0 } });
      diceControlsBottom.start({ x: window.innerWidth < 768 ? -10 : -20, transition: { duration: 0 } });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [diceControlsTop, diceControlsBottom]);

  const sectionVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: "spring", stiffness: 120, damping: 12 },
        opacity: { duration: 0.4 },
        scale: { duration: 0.4 },
      },
    },
    exit: (dir) => ({
      x: dir < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9,
      transition: { duration: 0.6, ease: "easeIn" },
    }),
  };

  return (
    <div
      className="w-full flex flex-col min-h-[100vh] md:h-[160vh] relative"
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

      {/* Top Dice (below logo) */}
      <motion.div
        className="absolute top-[10rem] left-4 md:left-6 z-10"
        initial={{ y: 20, opacity: 0, scale: 0.8 }}
        animate={diceControlsTop}
      >
        <img
          src={TopDice}
          alt="Top Dice"
          className="w-12 md:w-16 lg:w-20 h-auto object-contain"
        />
      </motion.div>

      {/* Bottom Dice (bottom-right) */}
      <motion.div
        className="absolute bottom-[4rem] md:bottom-6 right-4 md:right-6 z-10"
        initial={{ y: 20, opacity: 0, scale: 0.8 }}
        animate={diceControlsBottom}
      >
        <img
          src={BottomDice}
          alt="Bottom Dice"
          className="w-12 md:w-16 lg:w-20 h-auto object-contain"
        />
      </motion.div>

      {/* Content */}
      <div className="flex flex-col items-center justify-center flex-grow">
        <AnimatePresence mode="wait" custom={direction}>
          {currentSection === 1 && (
            <motion.div
              key="section1"
              className="relative flex flex-col items-center mt-28"
              variants={sectionVariants}
              custom={direction}
              initial="enter"
              animate="center"
              exit="exit"
            >
              {/* Image wrapper (relative for buttons) */}
              <div className="relative">
                <motion.img
                  src={gameRule1}
                  alt="Game Rule 1"
                  className="h-[75vh] w-full object-fill"
                />

                {/* Next Button OVERLAY on bottom of image */}
                <motion.button
                  onClick={handleNext}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute bottom-2 right-2"
                >
                  <motion.img
                    src={Right}
                    alt="Next Button"
                    className="w-10 md:w-16 lg:w-16 object-contain"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      repeatType: "mirror",
                    }}
                  />
                </motion.button>
              </div>
            </motion.div>
          )}

          {currentSection === 2 && (
            <motion.div
              key="section2"
              className="relative flex flex-col items-center mt-28"
              variants={sectionVariants}
              custom={direction}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <div className="relative">
                {/* Image */}
                <motion.img
                  src={gameRule2}
                  alt="Game Rule 2"
                  className="h-[75vh] w-full object-fill"
                />

                {/* Buttons overlay at bottom */}
                <div className="absolute bottom-0 left-2 flex gap-16">
                  {/* Back */}
                  <motion.button
                    onClick={handleBack}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <motion.img
                      src={Left}
                      alt="Back Button"
                      className="w-12 md:w-16 lg:w-16 object-contain"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        repeatType: "mirror",
                      }}
                    />
                  </motion.button>

                  {/* Continue */}
                  <Link to="/pack">
                    <motion.button
                      onClick={handleContinue}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="pt-4"
                    >
                      <motion.img
                        src={ContinueButton}
                        alt="Continue Button"
                        className="w-52 object-fill"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          repeatType: "mirror",
                        }}
                      />
                    </motion.button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default Rules;