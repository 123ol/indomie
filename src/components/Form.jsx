
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import backgroundImage from "../assets/Intro Background.png";
import indomieLogo from "../assets/Large Indomie log.png";
import ContinueButton from "../assets/Continue.png";
import Transition from "../assets/Na you get am.gif";

function Form() {
  const navigate = useNavigate();
  const [showWave, setShowWave] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    // Basic validation
    if (!formData.name || !formData.email || !formData.phone) {
      alert("Please fill in all fields");
      return;
    }
    // Simulate form submission
    console.log("Form Data:", formData);
    setShowWave(true);
    setTimeout(() => {
      navigate("/housemate");
    }, 1200);
  };

  // Animation variants for form elements
  const inputVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: "easeOut" } },
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

      {/* Form Content */}
      <div className="flex flex-col items-center justify-center space-y-6 flex-grow">
        <motion.div
          className="flex flex-col items-center justify-center space-y-6 w-full max-w-md p-6 rounded-xl"
          style={{
            backgroundColor: "#8B0000", // Deep red background for form container
            boxShadow: "0 0 20px 5px rgba(255, 99, 71, 0.7)", // Glow effect
          }}
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.2 },
            },
          }}
        >
          {/* Form Title */}
          <motion.h2
            className="text-2xl md:text-3xl font-bold text-white"
            variants={inputVariants}
          >
            Enter Your Details
          </motion.h2>

          {/* Name Input */}
          <motion.div className="w-full" variants={inputVariants}>
            <label htmlFor="name" className="block text-white mb-2">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full p-3 rounded-lg bg-[#8B0000] border-2 border-[#FF4040] text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder="Enter your name"
            />
          </motion.div>

          {/* Email Input */}
          <motion.div className="w-full" variants={inputVariants}>
            <label htmlFor="email" className="block text-white mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full p-3 rounded-lg bg-[#8B0000] border-2 border-[#FF4040] text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder="Enter your email"
            />
          </motion.div>

          {/* Phone Input */}
          <motion.div className="w-full" variants={inputVariants}>
            <label htmlFor="phone" className="block text-white mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full p-3 rounded-lg bg-[#8B0000] border-2 border-[#FF4040] text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder="Enter your phone number"
            />
          </motion.div>

          {/* Submit Button */}
          <motion.div variants={buttonVariants}>
            <Link to="/housemate">
              <motion.button
                onClick={handleSubmit}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <motion.img
                  src={ContinueButton}
                  alt="Submit Button"
                  className="w-36 md:w-48 lg:w-56 object-contain"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatType: "mirror" }}
                />
              </motion.button>
            </Link>
          </motion.div>
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

export default Form;