// firebase.js - USE YOUR EXACT CONFIG
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";

// USE YOUR EXACT CONFIG - JUST REMOVE analytics
const firebaseConfig = {
  apiKey: "AIzaSyBhAj5aJBz5i2ATIlZr_pzHRUu8Wx1TTIY",
  authDomain: "ethio-editor-pro.firebaseapp.com",
  projectId: "ethio-editor-pro",
  storageBucket: "ethio-editor-pro.firebasestorage.app",
  messagingSenderId: "319224664625",
  appId: "1:319224664625:web:1e239e9d9105474aba7b10"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
console.log("✅ Firebase Connected Successfully!");