import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import backgroundImage from "../assets/Other stage background.png";
import indomieLogo from "../assets/Large Indomie log.png";
import gameRule1 from "../assets/Game rule 1.png";
import gameRule2 from "../assets/Game rule 2.png";
import ContinueButton from "../assets/Continue.png";
import Right from "../assets/Right Button.png";
import Left from "../assets/Left Button.png";

function Rules() {
  const navigate = useNavigate();
  const [showWave, setShowWave] = useState(false);
  const [currentSection, setCurrentSection] = useState(1);
  const [direction, setDirection] = useState(0);

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
      className="w-full flex flex-col min-h-[100vh] md:h-[160vh] "
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

      {/* Content */}
      <div className="flex flex-col items-center justify-center flex-grow ">
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
                        className="w-52 object-fill "
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
