import indomieLogo from "../assets/Large Indomie log.png"; 
import indomipack1 from "../assets/Crayfish.png";
import indomipack2 from "../assets/Oriental Noodle.png";
import indomipack3 from "../assets/Pepper soup noodle.png";
import indomiplate from "../assets/Food.png";
import playButton from "../assets/Play now.png";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import backgroundImage from "../assets/Intro Background.png";
import TopDice from "../assets/Dicetop.png";
import BottomDice from "../assets/Dicebottom.png";
import Transition from "../assets/Elevator door.gif";

function Game() {
  const navigate = useNavigate();
  const [showWave, setShowWave] = useState(false);
  const packControls1 = useAnimation(); // Left pack
  const packControls2 = useAnimation(); // Middle pack
  const packControls3 = useAnimation(); // Right pack
  const diceControlsTop = useAnimation(); // Top dice
  const diceControlsBottom = useAnimation(); // Bottom dice

  const handlePlay = () => {
    setShowWave(true); 
    setTimeout(() => {
      navigate("/rules"); 
    }, 3000);
  };

  // Animate packs and dice with smooth alternating motion
  useEffect(() => {
    const animateElements = async () => {
      // Initial entrance animation for packs with responsive x values
      await Promise.all([
        packControls1.start({
          y: -100,
          x: window.innerWidth < 768 ? -30 : -60,
          opacity: 1,
          scale: 1,
          transition: { duration: 1, ease: "easeOut", bounce: 0.4, delay: 0.6 },
        }),
        packControls2.start({
          y: -100,
          x: 0,
          opacity: 1,
          scale: 1,
          transition: { duration: 1, ease: "easeOut", bounce: 0.4, delay: 0.7 },
        }),
        packControls3.start({
          y: -100,
          x: window.innerWidth < 768 ? 30 : 60,
          opacity: 1,
          scale: 1,
          transition: { duration: 1, ease: "easeOut", bounce: 0.4, delay: 0.8 },
        }),
        // Initial entrance for top dice
        diceControlsTop.start({
          y: 0,
          x: window.innerWidth < 768 ? 10 : 20,
          opacity: 1,
          scale: 1,
          transition: { duration: 1, ease: "easeOut", bounce: 0.4, delay: 0.9 },
        }),
        // Initial entrance for bottom dice
        diceControlsBottom.start({
          y: 0,
          x: window.innerWidth < 768 ? -10 : -20,
          opacity: 1,
          scale: 1,
          transition: { duration: 1, ease: "easeOut", bounce: 0.4, delay: 1.0 },
        }),
      ]);

      // Continuous bouncing animation for packs
      const duration = 2.5;
      packControls1.start({
        y: [-100, -70],
        rotate: [-1, 1],
        x: window.innerWidth < 768 ? -30 : -60,
        transition: {
          y: { duration, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" },
          rotate: { duration, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" },
          x: { duration: 0 },
        },
      });
      packControls2.start({
        y: [-70, -100],
        rotate: [0, 0],
        x: 0,
        transition: {
          y: { duration, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" },
          rotate: { duration, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" },
          x: { duration: 0 },
        },
      });
      packControls3.start({
        y: [-100, -70],
        rotate: [1, -1],
        x: window.innerWidth < 768 ? 30 : 60,
        transition: {
          y: { duration, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" },
          rotate: { duration, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" },
          x: { duration: 0 },
        },
      });

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

    animateElements();

    // Update positions on window resize
    const handleResize = () => {
      packControls1.start({ x: window.innerWidth < 768 ? -30 : -60, transition: { duration: 0 } });
      packControls2.start({ x: 0, transition: { duration: 0 } });
      packControls3.start({ x: window.innerWidth < 768 ? 30 : 60, transition: { duration: 0 } });
      diceControlsTop.start({ x: window.innerWidth < 768 ? 10 : 20, transition: { duration: 0 } });
      diceControlsBottom.start({ x: window.innerWidth < 768 ? -10 : -20, transition: { duration: 0 } });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [packControls1, packControls2, packControls3, diceControlsTop, diceControlsBottom]);

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
        className="p-4 mb-8 relative z-10"
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
        className="absolute top-[23rem]  left-4 md:left-6 z-10"
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

      <div className="flex flex-col items-center justify-center space-y-6 pt-24 md:pt-40">
        <motion.div
          className="text-center pb-4 mb-60"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3, type: "spring" }}
          whileHover={{ scale: 1.05 }}
        >
          <p className="text-3xl font-bold text-yellow-400 leading-snug font-malvie">
            CATCH YOUR <br /> INDOMIE FLAVORS
          </p>
          <p className="text-white text-3xl leading-snug font-malvie">
            AND BECOME THIS <br/> WEEK'S HOH
          </p>
        </motion.div>

        {/* Plate with packs */}
        <motion.div className="relative flex items-center justify-center max-h-full mb-4">
          {/* Plate */}
          <motion.img
            src={indomiplate}
            alt="Indomie Plate"
            className="w-[25rem] md:w-96 lg:w-[25rem] object-contain"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6, type: "spring" }}
          />

          {/* Packs */}
          <div className="absolute top-[-90px] md:top-[-80px] flex justify-center items-start">
            <motion.img
              src={indomipack1}
              alt="Indomie Pack 1"
              className="w-24 md:w-24 lg:w-28 object-contain"
              initial={{ y: -80, opacity: 0, scale: 0.8 }}
              animate={packControls1}
            />
            <motion.img
              src={indomipack2}
              alt="Indomie Pack 2"
              className="w-24 md:w-24 lg:w-28 object-contain"
              initial={{ y: -80, opacity: 0, scale: 0.8 }}
              animate={packControls2}
            />
            <motion.img
              src={indomipack3}
              alt="Indomie Pack 3"
              className="w-24 md:w-24 lg:w-28 object-contain"
              initial={{ y: -80, opacity: 0, scale: 0.8 }}
              animate={packControls3}
            />
          </div>
        </motion.div>

        {/* Play Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 1.5 }}
        >
          <motion.button
            onClick={handlePlay}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <motion.img
              src={playButton}
              alt="Play Button"
              className="w-56 object-contain"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatType: "mirror" }}
            />
          </motion.button>
        </motion.div>
      </div>

      {/* Transition Wave */}
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

export default Game;