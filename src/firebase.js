// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyABp27SoPXbyqDoydk1bY0Y4LTlimAPt2I",
  authDomain: "indomi-90286.firebaseapp.com",
  projectId: "indomi-90286",
  storageBucket: "indomi-90286.firebasestorage.app",
  messagingSenderId: "500737187900",
  appId: "1:500737187900:web:5453255cd23b6a734ee339",
  measurementId: "G-Q3X3HC52D7"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };