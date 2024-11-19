import axios from 'axios';
import React, { createContext } from 'react';
import { PlaySound } from '../StatusTone';
import { csrfToken, userTknDetails } from './TknDetails';
import { encryptData } from './cryptoUtils';

export const LoginContext = createContext();

export const LoginProvider = ({ children }) => {

    const fetchLoginData = async (course) => {
        const url = course ? `${process.env.REACT_APP_USER_USER_DATA_API}${course}/` : process.env.REACT_APP_USER_USER_DATA_API;
        try {
            const response = await axios.get(url,{
                headers : {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userTknDetails()}`,
                    'X-CSRFToken' : csrfToken(),
                }
            });
            return response.data;
        } catch (err) {
            return err;
        }
    };


    const userCreate = async (data) => {
        try{
            const result = await axios.post(process.env.REACT_APP_USER_REGISTRATION_API, JSON.stringify(data),{
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            PlaySound('success');
            return 'success';
        }catch(err){
            PlaySound('error');
            return err;
        }
    }

    const newUserCreate = async (data) => {
        try{
            const result = await axios.post(process.env.REACT_APP_USER_CREATE_API, JSON.stringify(data),{
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userTknDetails()}`,
                    'X-CSRFToken' : csrfToken(),
                },
            })
            PlaySound('success');
            return 'success';
        }catch(err){
            PlaySound('error');
            return err;
        }
    }

    const userDelete = async (data) => {
        try{
            const res = await axios.delete(process.env.REACT_APP_USER_DELETE_API,{
                data : data,
                headers : {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userTknDetails()}`,
                    'X-CSRFToken' : csrfToken(),
                }
            })
            PlaySound('success')
            return true;
        }catch(err){
            PlaySound('error')
            return err;
        }
    }

    const changeUserPermission = async (data) => {
        try{
            const res = await axios.patch(process.env.REACT_APP_USER_CHANGE_PERMISSION_API, data,{
                headers : {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userTknDetails()}`,
                    'X-CSRFToken' : csrfToken(),
                }
            })
            PlaySound('success')
            return true;
        }catch(err){
            PlaySound('error')
            return err;
        }
    }

    const userUpdate = async(data)=>{
        try {
            const response = await axios.patch(process.env.REACT_APP_USER_UPDATE_API, data,{
                headers : {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userTknDetails()}`,
                    'X-CSRFToken' : csrfToken(),
                }
              });
            PlaySound('success');
            const encryptUser = encryptData(JSON.stringify(response.data),process.env.REACT_APP_SECURITY_KEY);
            localStorage.setItem('encrypted_UserDetails',encryptUser);
            return true;
        }catch(err){
            PlaySound('error');
            return false;
        }
    }

    const checkUser = async (data) => {
        try{
            const res = await axios.post(process.env.REACT_APP_USER_CHECK_API,JSON.stringify(data),{
                headers : {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userTknDetails()}`,
                    'X-CSRFToken' : csrfToken(),
                }
            })
            return res;
        }catch(err){
            return err;
        }
    }

    const checkUserDetails = async (data) => {
        try{
            const res = await axios.post(process.env.REACT_APP_USER_CHECK_DETAILS_API,JSON.stringify(data),{
                headers : {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userTknDetails()}`,
                    'X-CSRFToken' : csrfToken(),
                }
            })
            return res;
        }catch(err){
            return err;
        }
    }

    const checkPassword = async (data) => {
        try{
            const res = await axios.post(process.env.REACT_APP_USER_CHECK_PASSWORD_API,JSON.stringify(data),{
                headers : {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userTknDetails()}`,
                    'X-CSRFToken' : csrfToken(),
                }
            })
            return 'Valid'
        }catch(err){
            return err;
        }
    }

    const fetchPermissionsData = async (course) => {
        const url = course ? `${process.env.REACT_APP_STUDENTS_PERMISSION_API}course/${course}` : process.env.REACT_APP_STUDENTS_PERMISSION_API
        try{
            const res = await axios.get(url,{
                headers : {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userTknDetails()}`,
                    'X-CSRFToken' : csrfToken(),
                }
            })
            return res.data;
        }catch(err){
            return err;
        }
    }


    const postPermissionsData = async (data) => {
        try{
            const res = await axios.post(process.env.REACT_APP_STUDENTS_PERMISSION_API,data,{
                headers : {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userTknDetails()}`,
                    'X-CSRFToken' : csrfToken(),
                }
            })
            PlaySound('success');
            return true;
        }catch(err){
            PlaySound('error');
            return err;
        }
    }

    const patchPermissionsData = async (data) => {
        try{
            const res = await axios.patch(process.env.REACT_APP_STUDENTS_PERMISSION_API,data,{
                headers : {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userTknDetails()}`,
                    'X-CSRFToken' : csrfToken(),
                }
            })
            PlaySound('success');
            return true;
        }catch(err){
            PlaySound('error');
            return err;
        }
    }

    const deletePermissionsData = async (data) => {
        try{
            const res = await axios.delete(process.env.REACT_APP_STUDENTS_PERMISSION_API,{
                data : data,
                headers : {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userTknDetails()}`,
                    'X-CSRFToken' : csrfToken(),
                }
            })
            PlaySound('success');
            return true;
        }catch(err){
            PlaySound('error');
            return err;
        }
    }

    return (
        <LoginContext.Provider value={{ fetchLoginData, userUpdate, userCreate, newUserCreate, 
                                        checkUser, checkPassword, checkUserDetails, fetchPermissionsData,
                                        patchPermissionsData, postPermissionsData, deletePermissionsData,
                                        userDelete, changeUserPermission }}>
            {children}
        </LoginContext.Provider>
    );
};
