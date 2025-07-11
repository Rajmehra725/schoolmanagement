// lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDZ6VRPbF5oQUVpD6fhZZ-NaYcsFDN4h6k",
  authDomain: "sunflower-73c06.firebaseapp.com",
  projectId: "sunflower-73c06",
  storageBucket: "sunflower-73c06.firebasestorage.app",
  messagingSenderId: "339251583801",
  appId: "1:339251583801:web:60b17a577c56f08b5326e8",
  measurementId: "G-8JDQD1FH78"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);  // Added Firebase Storage instance
export const googleProvider = new GoogleAuthProvider();
