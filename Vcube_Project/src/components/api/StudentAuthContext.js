import React, { useState, useEffect, createContext, useContext, startTransition } from 'react';
import { DateTime } from '../date-time';
import { isStdLogin } from '../UserDetails';
import { StudentsAuthContext } from './StudentsAuth';
import { stdAuth } from './StudentsFirebase';
import { onAuthStateChanged } from 'firebase/auth';
import { UserGoogleContext } from './Google';
import { is_User } from '../UserDetails';

const StudentAuthContext = createContext();

export const StudentAuthProvider = ({ children }) => {
    const { stdGoogleLogout } = useContext(UserGoogleContext);
    const { checkStdAuth } = useContext(StudentsAuthContext);
    const [isStudentAuthenticated, setIsStudentAuthenticated] = useState(false);
    const [isChecked, setIsChecked] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const student = sessionStorage.getItem('StudentDetails_ID') || null;
    const dateTime = DateTime().split(' ');

    const stdLogin = () => {
        startTransition(()=>{
            setIsStudentAuthenticated(true);
            setIsChecked(true);
        })
    };

    const stdLogout = () => {
        startTransition(()=>{
            setIsStudentAuthenticated(false);
            setIsChecked(true);
        })
    };

    const studentAuthChk = async () => {
        console.log('Running studentAuthChk...');
        console.log('Student ID:', student);
        console.log('User Type:', is_User());
        console.log('Login State:', isStdLogin());
        console.log('Date:', dateTime[0]);
    
        startTransition(async () => {
            if (
                student && 
                is_User() === 'Student' &&
                isStdLogin() === (`True -> ${student} -> ${dateTime[0]}`) &&
                await checkStdAuth() === true
            ) {
                const unsubscribe = onAuthStateChanged(stdAuth, (g_user) => {
                    if (g_user) {
                        console.log('Google User Found:', g_user);
                        stdLogin();
                    } else {
                        console.log('Google User Not Found.');
                        stdLogout();
                    }
                });
    
                return () => unsubscribe();
            } else {
                console.log('Authentication Check Failed.');
                stdLogout();
            }
        });
        setIsLoading(false);
    };
    

    useEffect(() => {
        studentAuthChk();
    }, []);

    const removeStudentLoginData = () => {
        startTransition(async () => {
        stdGoogleLogout();
        localStorage.clear();
        sessionStorage.clear();
        })
    };

    
    return (
        <StudentAuthContext.Provider value={{ isLoading, studentAuthChk, removeStudentLoginData, isStudentAuthenticated, stdLogin, stdLogout }}>
            {!isLoading && isChecked && children}
        </StudentAuthContext.Provider>
    );
};

export const useStudentAuth = () => useContext(StudentAuthContext);
