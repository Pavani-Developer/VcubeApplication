import React, { createContext, useContext, useEffect, useState } from 'react';
import { DateTime } from '../date-time';
import { is_User, UserDetails, isUserLogin } from '../UserDetails';
import { UsersAuthContext } from '../api/UsersAuth';
import { auth } from './UsersFirebase';
import { onAuthStateChanged } from 'firebase/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const { checkUserAuth } = useContext(UsersAuthContext);
    const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
    const [isPlacementsAuthenticated, setIsPlacementsAuthenticated] = useState(false);
    const [isChecked, setIsChecked] = useState(false);

    const login = () => {
        const user = UserDetails('All');
        if (user.User === 'Super Admin' && user.Course === 'All'){
            setIsUserAuthenticated(true);
            setIsPlacementsAuthenticated(true);
        }else if (user.Course === 'Placements') {
            setIsPlacementsAuthenticated(true);
        } else {
            setIsUserAuthenticated(true);
        }
        setIsChecked(true);
    };

    const logout = () => {
        setIsUserAuthenticated(false);
        setIsPlacementsAuthenticated(false);
        setIsChecked(true);
    };

    const userAuthChk = async () => {
        const dateTime = DateTime().split(' ');
        const user = UserDetails('All');
        try {
            const chkAuth = await checkUserAuth();
            if (user && is_User() !== 'Student' &&
                isUserLogin() === (`True -> ${user.Username} -> ${dateTime[0]}`) &&
                chkAuth === true) {
                await onAuthStateChanged(auth, (g_user) => {
                    if (g_user) {
                        login();
                    } else {
                        logout();
                    }
                });
            } else {
                logout();
            }
        } catch (error) {
            logout();
        }
    };

    useEffect(() => {
        userAuthChk();
    }, []);

    return (
        <AuthContext.Provider value={{ isUserAuthenticated, isPlacementsAuthenticated, userAuthChk, login, logout }}>
            {isChecked ? children : null}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
