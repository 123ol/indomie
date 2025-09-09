import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import backgroundImage from "../assets/Other stage background.webp";
import indomieLogo from "../assets/Large Indomie log.png";
import ContinueButton from "../assets/Continue.png";


function Form() {
  const navigate = useNavigate();
  const [showWave, setShowWave] = useState(false);
  const [isSignUp, setIsSignUp] = useState(true);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setError("");
    setSuccessMessage("");

    if (isResetPassword) {
      // Password reset flow
      if (!formData.email) {
        setError("Please enter your email");
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError("Please enter a valid email");
        return;
      }

      setIsLoading(true);
      try {
        await sendPasswordResetEmail(auth, formData.email);
        setSuccessMessage(
          "Password reset email sent! Please check your inbox or spam folder for the email."
        );
        setFormData({ name: "", email: "", phone: "", password: "" });
      } catch (error) {
        console.error("Password reset error:", error);
        const errorMessages = {
          "auth/invalid-email": "Invalid email format.",
          "auth/user-not-found": "No account found with this email.",
          "auth/too-many-requests": "Too many attempts. Please try again later.",
        };
        setError(errorMessages[error.code] || `Password reset failed: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Client-side validation for sign-up/login
    if (!isSignUp && (!formData.email || !formData.password)) {
      setError("Please enter email and password");
      return;
    }
    if (isSignUp && (!formData.name || !formData.email || !formData.phone || !formData.password)) {
      setError("Please fill in all fields");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email");
      return;
    }

    if (isSignUp) {
      const phoneRegex = /^\+?\d{10,14}$/;
      if (!phoneRegex.test(formData.phone)) {
        setError("Please enter a valid phone number");
        return;
      }
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      let userCredential;
      if (isSignUp) {
        // Sign-up flow
        userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );
        const user = userCredential.user;

        // Update user profile with name
        await updateProfile(user, { displayName: formData.name });

        // Store user data in Firestore
        await setDoc(doc(db, "users", user.uid), {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          createdAt: new Date().toISOString(),
        });

        console.log("Form Data:", { ...formData, uid: user.uid });
      } else {
        // Login flow
        userCredential = await signInWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );
        console.log("Logged in user:", userCredential.user.uid);
      }

      // Trigger transition and navigate
      setShowWave(true);
      setTimeout(() => {
        navigate("/housemate");
      }, 1200);
    } catch (error) {
      console.error(`${isSignUp ? "Sign-up" : "Login"} error:`, error);
      const errorMessages = {
        "auth/email-already-in-use": "This email is already registered. Try logging in.",
        "auth/invalid-email": "Invalid email format.",
        "auth/weak-password": "Password is too weak. Use at least 6 characters.",
        "auth/configuration-not-found": "Authentication service is not properly configured. Please try again later.",
        "auth/network-request-failed": "Network error. Please check your connection and try again.",
        "auth/too-many-requests": "Too many attempts. Please try again later.",
        "auth/user-not-found": "No account found with this email. Please sign up.",
        "auth/wrong-password": "Incorrect password. Please try again.",
      };
      setError(errorMessages[error.code] || `${isSignUp ? "Sign-up" : "Login"} failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    setIsResetPassword(false);
    setError("");
    setSuccessMessage("");
    setFormData({ name: "", email: "", phone: "", password: "" });
  };

  const handleForgotPassword = () => {
    setIsResetPassword(true);
    setError("");
    setSuccessMessage("");
    setFormData({ name: "", email: "", phone: "", password: "" });
  };

  // Animation variants
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
      className="w-full flex flex-col min-h-screen h-[120vh] p-4"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "top center",
        backgroundRepeat: "no-repeat",
        width: "100%",
      }}
    >
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

      <div className="flex flex-col items-center justify-center space-y-6 mt-[30%]">
        <motion.div
          className="flex flex-col items-center justify-center space-y-6 w-full max-w-md p-6 rounded-xl"
          style={{
            backgroundColor: "#8B0000",
            boxShadow: "0 0 20px 5px rgba(255, 99, 71, 0.7)",
          }}
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
          }}
        >
          <motion.h2
            className="text-2xl md:text-3xl lg:text-4xl font-bold text-yellow-400 leading-snug font-malvie text-center"
            variants={inputVariants}
          >
            {isResetPassword
              ? "RESET YOUR PASSWORD"
              : isSignUp
              ? "SIGN UP FILLING YOUR ENTRY HOUSEMATE"
              : "LOG IN FILLING YOUR ENTRY HOUSEMATE"}
          </motion.h2>

          {error && (
            <motion.p
              className="text-red-300 text-sm text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {error}
            </motion.p>
          )}

          {successMessage && (
            <motion.p
              className="text-green-300 text-sm text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {successMessage}
            </motion.p>
          )}

          {!isResetPassword && isSignUp && (
            <motion.div className="w-full" variants={inputVariants}>
              <label htmlFor="name" className="block text-yellow-400 leading-snug font-malvie mb-2">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-3 rounded-lg bg-[#8B0000] border-2 border-[#FF4040] text-yellow-400 leading-snug font-malvie placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                placeholder="Enter your name"
              />
            </motion.div>
          )}

          <motion.div className="w-full" variants={inputVariants}>
            <label htmlFor="email" className="block text-yellow-400 leading-snug font-malvie mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full p-3 rounded-lg bg-[#8B0000] border-2 border-[#FF4040] text-yellow-400 leading-snug font-malvie placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder="Enter your email"
            />
          </motion.div>

          {!isResetPassword && isSignUp && (
            <motion.div className="w-full" variants={inputVariants}>
              <label htmlFor="phone" className="block text-yellow-400 leading-snug font-malvie mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full p-3 rounded-lg bg-[#8B0000] border-2 border-[#FF4040] text-yellow-400 leading-snug font-malvie placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                placeholder="Enter your phone number"
              />
            </motion.div>
          )}

          {!isResetPassword && (
            <motion.div className="w-full" variants={inputVariants}>
              <label htmlFor="password" className="block text-yellow-400 leading-snug font-malvie mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full p-3 rounded-lg bg-[#8B0000] border-2 border-[#FF4040] text-yellow-400 leading-snug font-malvie placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                placeholder="Enter your password"
              />
            </motion.div>
          )}

          {!isResetPassword && !isSignUp && (
            <motion.button
              onClick={handleForgotPassword}
              className="text-yellow-400 text-sm underline leading-snug font-malvie"
              variants={inputVariants}
            >
              Forgot Password?
            </motion.button>
          )}

          <motion.button
            onClick={toggleAuthMode}
            className="text-yellow-400 text-sm underline leading-snug font-malvie"
            variants={inputVariants}
          >
            {isResetPassword
              ? "Back to Login"
              : isSignUp
              ? "Already have an account? Log in"
              : "Need an account? Sign up"}
          </motion.button>
        </motion.div>

        <motion.div variants={buttonVariants} className="absolute bottom-2 left-0 w-full flex justify-center">
          <motion.button
            onClick={handleSubmit}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            disabled={isLoading}
          >
            <motion.img
              src={ContinueButton}
              alt="Submit Button"
              className={`w-56 object-contain ${isLoading ? "opacity-50" : ""}`}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatType: "mirror" }}
            />
          </motion.button>
        </motion.div>
      </div>

      <AnimatePresence>
        {showWave && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="absolute inset-0 z-50 flex items-center justify-center"
          >
           
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Form;