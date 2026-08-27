import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, where, orderBy, limit } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBy6s123sntfr869PqbCtB-70Ee1hx5ZHk",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "website-cf544.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "website-cf544",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "website-cf544.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "850601207355",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:850601207355:web:86566ef3e4620ace2a9e1e",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-EWVKPXNPQ5"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  ref,
  uploadBytes,
  getDownloadURL
};
