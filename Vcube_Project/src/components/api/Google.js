import React, { createContext, useEffect, useState } from 'react';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut, deleteUser } from 'firebase/auth';
import { auth } from './UsersFirebase';
import { stdAuth } from './StudentsFirebase';

export const UserGoogleContext = createContext();

export const UserGoogleProvider = ({ children }) => {

  const [isUserSubcribe, setIsUserSubcribe] = useState(false);

  const userGoogleLogin = async (expectedEmail) => {
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        if (user.email === expectedEmail) {
            setIsUserSubcribe(true);
            return { status: 'success', email: user.email, verified: user.emailVerified};

        } else {
            userGoogleLogout();
            await deleteUser(user);
            return { status: 'failed', message: 'Email Verification Failed' };
        }
    } catch (error) {
        userGoogleLogout();
        return { status: 'failed', message: 'Login failed' };
    }
  };


  const userGoogleLogout = async () => {
    try {
      await signOut(auth);
        localStorage.clear();
        sessionStorage.clear();
        return 'success';
    } catch (error){
        return 'failed';
    }
  };

  const stdGoogleLogin = async (expectedEmail) => {
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(stdAuth, provider);
        const user = result.user;

        if (user.email === expectedEmail) {
            return { status: 'success', email: user.email, verified: user.emailVerified};

        } else {
            stdGoogleLogout();
            await deleteUser(user);
            return { status: 'failed', message: 'Email does not match' };
        }
    } catch(error){
        stdGoogleLogout();
        return { status: 'failed', message: 'Login failed' };
    }
  };


  const stdGoogleLogout = async () => {
    try {
      await signOut(stdAuth);
        localStorage.clear();
        sessionStorage.clear();
        return 'success';
    } catch (error){
        return 'failed';
    }
  };

  
  useEffect(() => {

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsUserSubcribe(true);
      } else {
        setIsUserSubcribe(false);
      }
    });

    return () => unsubscribe();
  }, []);


  return (
    <UserGoogleContext.Provider value={{ userGoogleLogin, userGoogleLogout, isUserSubcribe, stdGoogleLogin, stdGoogleLogout }}>
      { children }
    </UserGoogleContext.Provider>
  )
}