import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getFunctions } from "firebase/functions";


const firebaseConfig = {
  apiKey: "AIzaSyC1Yia3LyR-FxtTforHbBFxgs4jUoy1K14",
  authDomain: "pocket-therapist-ddbb0.firebaseapp.com",
  projectId: "pocket-therapist-ddbb0",
  storageBucket: "pocket-therapist-ddbb0.appspot.com",
  messagingSenderId: "473959584342",
  appId: "1:473959584342:web:66bcabfe57295cda7521f7",
  measurementId: "G-G1851SDYS9"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const functions = getFunctions(app, 'asia-southeast1');

export { db, auth, functions };