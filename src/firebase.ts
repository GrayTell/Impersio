import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import firebaseConfig from "../firebase-applet-config.json";

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);

// Initialize Auth
export const auth = getAuth(app);
