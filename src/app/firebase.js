// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "***REMOVED-FIREBASE-KEY***",
  authDomain: "apartmani-jovca.firebaseapp.com",
  projectId: "apartmani-jovca",
  storageBucket: "apartmani-jovca.firebasestorage.app",
  messagingSenderId: "722673212856",
  appId: "1:722673212856:web:c292c8d6b661ff7803834d",
  measurementId: "G-HQ1YBJYSBF"
};

// Initialize Firebase
// Koristimo singleton pattern da ne bi doslo do greske ako se app inicijalizuje vise puta
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

let analytics;

// Analytics se pokrece samo na klijentskoj strani (browser), ne na serveru
if (typeof window !== "undefined") {
  isSupported().then((yes) => {
    if (yes) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, analytics };
