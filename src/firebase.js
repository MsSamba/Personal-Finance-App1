// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA2unGfPeEitpdrvWK1lvu2Gv5zrXfg3TQ",
  authDomain: "personal-finance-app-cb3ca.firebaseapp.com",
  projectId: "personal-finance-app-cb3ca",
  storageBucket: "personal-finance-app-cb3ca.firebasestorage.app",
  messagingSenderId: "229621057492",
  appId: "1:229621057492:web:24309c526d07c634af3841",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
