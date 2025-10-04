// firebase.js - UPDATED CONFIG
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";

// Updated Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDDgQT6W2OULkePu9KMlfc04u8v2We40OI",
  authDomain: "ethio-editor.firebaseapp.com",
  projectId: "ethio-editor",
  storageBucket: "ethio-editor.appspot.com",
  messagingSenderId: "480278426413",
  appId: "1:480278426413:web:f26a5b381993f9caf819a4"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
console.log("Firebase initialized successfully!");