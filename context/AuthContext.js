'use client'
import { useContext, createContext, useState, useEffect } from "react";
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../src/app/firebaseConfig";

import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const router = useRouter();

  const googleSignIn = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
  };


//   const logIn = async (email, password) => {
//     try {
//         await signInWithEmailAndPassword(auth, email, password);
//         router.push("/welcome");
//     } catch (error) {
//         console.error('Login Error:', error);
//     }
//     };


  const logOut = () => {
    signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, googleSignIn, logOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const UserAuth = () => {
  return useContext(AuthContext);
};