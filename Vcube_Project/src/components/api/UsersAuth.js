import React, { useState } from 'react';
import { createContext } from "react";
import { encryptData } from './cryptoUtils';
import { csrfToken, userTknDetails } from './TknDetails';
import axios from 'axios';
import { DateTime } from '../date-time';
import { PlaySound } from '../StatusTone';
import { generateUniqueCode, UserDetails } from '../UserDetails';

export const UsersAuthContext = createContext();

export const UsersAuthProvider = ({ children }) => {
    const [userAuth, setUserAuth] = useState(false);
    const dateTime = DateTime().split(' ');

    const fetchDataLength = async () => {
        try{
            const res = await axios.get(process.env.REACT_APP_USER_COUNT_API);
            return res.data.users_count;
        }catch(err){
            return err;
        }
    };

    const userAuthenticate = async (mail,password) => {
        try {
            const response = await axios.post(process.env.REACT_APP_USER_LOGIN_API,{
                Email : mail,
                Password : password
            }, {
                headers: {
                    'Content-Type' : 'application/json',
                },
            });
            const res = response.data;
            generateUniqueCode();
            const encryptUser = encryptData(JSON.stringify(res.user),process.env.REACT_APP_SECURITY_KEY);
            const encryptIsUserLogin = encryptData(`True -> ${res.user.Username} -> ${dateTime[0]}`, process.env.REACT_APP_SECURITY_KEY);
            const encryptToken = encryptData(res.access,process.env.REACT_APP_SECURITY_KEY);
            const encryptCsrfToken = encryptData(res.csrf,process.env.REACT_APP_SECURITY_KEY);
            const encryptedUser = encryptData(res.user.User,process.env.REACT_APP_SECURITY_KEY);
            localStorage.setItem('encrypted_CSRFToken',encryptCsrfToken);
            localStorage.setItem('encrypted_UserDetails',encryptUser);
            localStorage.setItem('encrypted_IsUserLogin',encryptIsUserLogin);
            localStorage.setItem('encrypted_User_Token',encryptToken);
            localStorage.setItem('encryptedUser',encryptedUser);
            setUserAuth(!userAuth);
            return 'Valid';
        } catch (err){
            PlaySound('error');
            return err;
        }
    };

    const chkUsername = async (username) =>{
        try{
            const res = await axios.post(process.env.REACT_APP_USER_CHECK_USERNAME_API,{
                Username : username
            },{
                headers : {
                    'Content-Type' : 'application/json'
                }
            })
            const data = {
                'status' : 'Found',
                'email' : res.data.email
            }
            return data;
        }catch(err){
            return err;
        }
    }

    const chkEmail = async (email,type) =>{
        try{
            const res = await axios.post(process.env.REACT_APP_USER_CHECK_EMAIL_API,{
                Email : email,
                Type : type
            },{
                headers : {
                    'Content-Type' : 'application/json'
                }
            })
            const data = {
                'username' : res.data.username
            }
            return data;
        }catch(err){
            return err;
        }
    }

    
    const getUserDriveData = async (course, username, data, method) => {
        try{
            const res = await axios.put(`${process.env.REACT_APP_BACKEND_API_URL}manage/${course}/user-${username}/drive-data/`, data,{
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userTknDetails()}`,
                    'X-CSRFToken' : csrfToken(),
                }
            })
            if(method === 'Get'){
                return res.data;
            }else{
                const drive = {Drive : data.DrivePassword, Is_Validated : true, Validated_Date : dateTime[0]}
                const encrtytedData = encryptData(JSON.stringify(drive),process.env.REACT_APP_SECURITY_KEY)
                sessionStorage.setItem('User_Drive_Password',encrtytedData);
                return true;
            }
        }catch(err){
            if(err.response.status === 403)removeUserLoginData();
            PlaySound('error');
            return err;
        }
    }

    
    const postUserDriveData = async (course, username, data) => {
        try{
            const res = await axios.post(`${process.env.REACT_APP_BACKEND_API_URL}manage/${course}/user-${username}/drive-data/`, data,{
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userTknDetails()}`,
                    'X-CSRFToken' : csrfToken(),
                }
            })
            PlaySound('success');
            return true;
        }catch(err){
            if(err.response.status === 403)removeUserLoginData();
            PlaySound('error');
            return false;
        }
    }

    const createUserDrivePassword = async (course, username, data) => {
        try{
            const res = await axios.patch(`${process.env.REACT_APP_BACKEND_API_URL}create/${course}/user-${username}/drive-password/`, data,{
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userTknDetails()}`,
                    'X-CSRFToken' : csrfToken(),
                }
            })
            const user = UserDetails('All');
            if(user){
                user.Drive = 'Registered'
                const encryptUser = encryptData(JSON.stringify(user),process.env.REACT_APP_SECURITY_KEY);
                localStorage.setItem('encrypted_UserDetails',encryptUser);
            }
            PlaySound('success');
            return true;
        }catch(err){
            if(err.response.status === 403)removeUserLoginData();
            PlaySound('error');
            return err;
        }
    }

    const patchUserDriveData = async (course, username, drive_id, data) => {
        try{
            const url = drive_id ? `${process.env.REACT_APP_BACKEND_API_URL}manage/${course}/user-${username}/drive-data/${drive_id}/` :
                                    `${process.env.REACT_APP_BACKEND_API_URL}manage/${course}/user-${username}/drive-data/`;
            const res = await axios.patch(url, data,{
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userTknDetails()}`,
                    'X-CSRFToken' : csrfToken(),
                }
            })
            PlaySound('success');
            return true;
        }catch(err){
            if(err.response.status === 403)removeUserLoginData();
            PlaySound('error');
            return false;
        }
    }

    const deleteUserDriveData = async (course, username, drive_id, data) => {
        try{
            const url = drive_id ? `${process.env.REACT_APP_BACKEND_API_URL}manage/${course}/user-${username}/drive-data/${drive_id}/` :
                                    `${process.env.REACT_APP_BACKEND_API_URL}manage/${course}/user-${username}/drive-data/`;
            const res = await axios.delete(url,{
                data : data,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userTknDetails()}`,
                    'X-CSRFToken' : csrfToken(),
                }
            })
            PlaySound('success');
            return true;
        }catch(err){
            if(err.response.status === 403)removeUserLoginData();
            PlaySound('error');
            return false;
        }
    }

    const checkUserAuth = async () => {
        if(UserDetails('All')){
            const data = {
                Username : UserDetails('All').Username,
                Email : UserDetails('All').Email
            }
            try {
                const response = await axios.post(process.env.REACT_APP_USER_CHECK_AUTH_API, data,{
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${userTknDetails()}`,
                        'X-CSRFToken' : csrfToken(),
                    }
                });
                return response.data.is_authenticated;
            } catch (err) {
                return err;
            }
        }
    };    

    const resetUserPassword = async (data) => {
        try{    
            const res = await axios.post(process.env.REACT_APP_USER_RESET_PASSWORD_API, JSON.stringify(data),{
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken' : csrfToken(),
                },
            })
            PlaySound('success');
            return res.status;
        }catch(err){
            PlaySound('error');
            return err.response.status;
        }
    }

    const removeUserLoginData = () => {
        localStorage.clear();
        sessionStorage.clear();
    }

  return (
    <UsersAuthContext.Provider value={{ fetchDataLength, userAuthenticate, chkUsername, 
                                        chkEmail, checkUserAuth, resetUserPassword, 
                                        removeUserLoginData, userAuth, getUserDriveData,
                                        postUserDriveData, createUserDrivePassword, patchUserDriveData,
                                        deleteUserDriveData }} >
        { children }
    </UsersAuthContext.Provider>
  )
}
