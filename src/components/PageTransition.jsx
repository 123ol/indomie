import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

const PageTransition = ({ showWave }: { showWave: boolean }) => {
  return (
    <AnimatePresence>
      {showWave && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0 z-50"
        >
          {/* Stage 1: White cover */}
          <motion.div
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="absolute inset-0 bg-white origin-top"
          />

          {/* Stage 2: Red wave */}
          <motion.div
            initial={{ clipPath: "circle(0% at 0% 0%)" }}
            animate={{ clipPath: "circle(150% at 0% 0%)" }}
            transition={{ duration: 1.5, ease: "easeInOut", delay: 0.6 }}
            className="absolute inset-0 bg-red-600"
          >
            <svg
              className="absolute bottom-0 left-0 w-full h-40"
              viewBox="0 0 1440 320"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill="#991b1b"
                fillOpacity="1"
                d="M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,176C672,160,768,160,864,170.7C960,181,1056,203,1152,186.7C1248,171,1344,117,1392,90.7L1440,64V320H0Z"
              ></path>
            </svg>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PageTransition;
