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
import Transition from "../assets/Elevator door.gif";
function Game() {
  const navigate = useNavigate();
  const [showWave, setShowWave] = useState(false);
  const packControls1 = useAnimation(); // Left pack
  const packControls2 = useAnimation(); // Middle pack
  const packControls3 = useAnimation(); // Right pack

  const handlePlay = () => {
    setShowWave(true); 
    setTimeout(() => {
      navigate("/rules"); 
    }, 3000);
  };

  // Animate packs with smooth alternating motion
  useEffect(() => {
    const animatePacks = async () => {
      // Initial entrance animation with responsive x values
      await Promise.all([
        packControls1.start({
          y: -100, // Start higher to align with top of plate
          x: window.innerWidth < 768 ? -30 : -60, // Closer on mobile
          opacity: 1,
          scale: 1,
          transition: { duration: 1, ease: "easeOut", bounce: 0.4, delay: 0.6 },
        }),
        packControls2.start({
          y: -100, // Start higher to align with top of plate
          x: 0, // Center pack stays at 0
          opacity: 1,
          scale: 1,
          transition: { duration: 1, ease: "easeOut", bounce: 0.4, delay: 0.7 },
        }),
        packControls3.start({
          y: -100, // Start higher to align with top of plate
          x: window.innerWidth < 768 ? 30 : 60, // Closer on mobile
          opacity: 1,
          scale: 1,
          transition: { duration: 1, ease: "easeOut", bounce: 0.4, delay: 0.8 },
        }),
      ]);

      // Smooth continuous alternating animation
      const duration = 2.5; // Slower for smoother effect
      packControls1.start({
        y: [-100, -70], // Left pack: up to down near top
        rotate: [-1, 1], // Subtle rotation
        x: window.innerWidth < 768 ? -30 : -60, // Maintain closer spacing on mobile
        transition: {
          y: { duration, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" },
          rotate: { duration, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" },
          x: { duration: 0 }, // Static x position
        },
      });
      packControls2.start({
        y: [-70, -100], // Middle pack: down to up near top (opposite)
        rotate: [0, 0], // No rotation for middle
        x: 0, // Center pack stays at 0
        transition: {
          y: { duration, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" },
          rotate: { duration, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" },
          x: { duration: 0 }, // Static x position
        },
      });
      packControls3.start({
        y: [-100, -70], // Right pack: up to down near top
        rotate: [1, -1], // Subtle rotation
        x: window.innerWidth < 768 ? 30 : 60, // Closer on mobile
        transition: {
          y: { duration, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" },
          rotate: { duration, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" },
          x: { duration: 0 }, // Static x position
        },
      });
    };

    animatePacks();

    // Update x positions on window resize
    const handleResize = () => {
      packControls1.start({ x: window.innerWidth < 768 ? -30 : -60, transition: { duration: 0 } });
      packControls2.start({ x: 0, transition: { duration: 0 } });
      packControls3.start({ x: window.innerWidth < 768 ? 30 : 60, transition: { duration: 0 } });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [packControls1, packControls2, packControls3]);

  return (
    <div
      className="w-full flex flex-col  min-h-[100vh] md:h-[160vh] "
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
        className="p-4 mb-8"
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
      <div className="flex flex-col items-center justify-center space-y-6 pt-24 md:pt-40">
        <motion.div
          className="text-center px-4 mb-64 md:mb-40"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3, type: "spring" }}
          whileHover={{ scale: 1.05 }}
        >
          <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-yellow-400 leading-snug font-malvie">
            CATCH YOUR <br /> INDOMIE FLAVORS
          </p>
          <p className="text-white text-2xl md:text-3xl lg:text-4xl leading-snug font-malvie">
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
          <div className="absolute top-[-70px] md:top-[-80px] flex justify-center items-start">
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
              className="w-36 md:w-48 lg:w-56 object-contain"
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