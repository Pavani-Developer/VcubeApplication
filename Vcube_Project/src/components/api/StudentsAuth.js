import React, { createContext, useState } from 'react';
import { encryptData } from './cryptoUtils';
import axios from 'axios';
import { DateTime } from '../date-time';
import { csrfToken, userTknDetails } from './TknDetails';
import { PlaySound } from '../StatusTone';
import { generateUniqueCode } from '../UserDetails';

export const StudentsAuthContext = createContext();

export const StudentsAuthProvider = ({ children }) => {
    const [stdAuth, setStdAuth] = useState(false);
    const dateTime = DateTime().split(' ');

    const studentAuthenticate = async (data) => {
        try {
            const response = await axios.post(process.env.REACT_APP_STUDENTS_LOGIN_API, JSON.stringify(data), {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const res = response.data;
            generateUniqueCode();
            const encryptIsStdLogin = encryptData(`True -> ${res.user} -> ${dateTime[0]}`, process.env.REACT_APP_SECURITY_KEY);
            const encryptToken = encryptData(res.access,process.env.REACT_APP_SECURITY_KEY);
            const encryptCsrfToken = encryptData(res.csrf,process.env.REACT_APP_SECURITY_KEY);
            const encryptedUser = encryptData('Student',process.env.REACT_APP_SECURITY_KEY);
            sessionStorage.setItem('encrypted_StdCSRFToken',encryptCsrfToken);
            sessionStorage.setItem('StudentDetails_ID',JSON.stringify(res.user));
            sessionStorage.setItem('encrypted_IsStdLogin',encryptIsStdLogin);
            sessionStorage.setItem('encrypted_Std_Token',encryptToken);
            sessionStorage.setItem('encryptedUser',encryptedUser);
            setStdAuth(!stdAuth);
            return 'Valid';
        } catch (err) {
            return err;
        }
    };

    const checkStudentDetails = async(mobile,course) => {
        try{
            const res = await axios.post(process.env.REACT_APP_STUDENTS_EMAIL_CHECK_API,{
                Username : mobile,
                Course : course
            },{
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            res.data['status'] = true;
            return res.data;
        }catch(err){
            const data = {
                status : false,
                code : err.response.status,
                message : err.message
            }
            return data;
        }
    }

    const checkStdAuth = async () => {
        const data = {
            id : JSON.parse(sessionStorage.getItem('StudentDetails_ID'))
        }
        try{
            const res = await axios.post(process.env.REACT_APP_STUDENTS_CHECK_AUTH_API,data,{
                headers : {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userTknDetails()}`,
                    'X-CSRFToken' : csrfToken(),
                }
            })
            return res.data.is_authenticated;
        }catch(err){
            return err;
        }
    }

    const postStudentConfigs = async (id,data) => {
        try{
            const res = await axios.post(`${process.env.REACT_APP_STUDENT_CONFIGURATIONS_API}${id}/`,{
                student_config : data
            },{
                headers : {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userTknDetails()}`,
                    'X-CSRFToken' : csrfToken(),
                }
            })
            PlaySound('success');
            return res.data;
        }catch(err){
            PlaySound('error');
            const data = {
                status : 'error',
                code : err.response.status
            }
            return data;
        }
    }

  return (
    <StudentsAuthContext.Provider value={{ studentAuthenticate, checkStudentDetails, checkStdAuth, postStudentConfigs, stdAuth }}>
        { children }
    </StudentsAuthContext.Provider>
  )
}
