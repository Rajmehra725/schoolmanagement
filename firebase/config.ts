// lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCLDlU8ooBhoelGjkgreMR5LTPWD_rxeBY",
  authDomain: "schoolmanagement-3340e.firebaseapp.com",
  projectId: "schoolmanagement-3340e",
  storageBucket: "schoolmanagement-3340e.appspot.com",  // corrected storageBucket URL
  messagingSenderId: "176337630338",
  appId: "1:176337630338:web:ef1e07a7248510513d309b",
  measurementId: "G-TD4NWNZPNG"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);  // Added Firebase Storage instance
export const googleProvider = new GoogleAuthProvider();
