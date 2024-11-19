import React, { useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { stdAuth } from './StudentsFirebase';
import { auth } from './UsersFirebase';
import { is_User, isStdLogin, isUserLogin, UserDetails } from "../UserDetails";
import { DateTime } from "../date-time";

export const UseUserAuthentication = async (checkUserAuth, setIs_User_Authenticated) => {
    try {
        const user = UserDetails('All');
        const dateTime = DateTime().split(' ');
        if (user && is_User() !== 'Student' &&
            isUserLogin() === (`True -> ${user.Username} -> ${dateTime[0]}`) &&
            await checkUserAuth() === true) {

            const unsubscribe = onAuthStateChanged(auth, (g_user) => {
                setIs_User_Authenticated(!!g_user);
            });

            return () => {
                unsubscribe();
            };
        } else {
            setIs_User_Authenticated(false);
        }
    } catch (error) {
        setIs_User_Authenticated(false);
    }
};

export const UseStudentAuthentication = async (checkStdAuth, setIsStdAuthenticated) => {
    const student = sessionStorage.getItem('StudentDetails_ID');
    const dateTime = DateTime().split(' ');
    try {
        if (student && is_User() === 'Student' &&
        isStdLogin() === (`True -> ${student} -> ${dateTime[0]}`) &&
        await checkStdAuth() === true) {

            const unsubscribe = onAuthStateChanged(stdAuth, (g_user) => {
                setIsStdAuthenticated(!!g_user);
            });

            return () => unsubscribe();
        } else {
            setIsStdAuthenticated(false);
        }
    } catch (error) {
        setIsStdAuthenticated(false);
    }
};
