import React, { createContext } from 'react';
import axios from 'axios';
import { DateTime } from '../date-time';
import { PlaySound } from '../StatusTone';
import { userTknDetails, csrfToken } from './TknDetails';

export const MailContext = createContext();

export const SendMailProvider = ({ children }) => {
    const dateTime = DateTime().split(' ');

    const sendEmail = async (otp, mail, title, name, method, user_id) => {
        const mailData = {
            Title: title,
            Mail: mail,
            OTP: `${otp}~${dateTime[0]}~${dateTime[1]}`,
            Name: name,
            Method: method,
        };
        if (method === 'OTP')mailData['User_Id'] = user_id;
        try {
            const res = await axios.post(process.env.REACT_APP_MAIL_API, mailData, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            PlaySound('success');
            return true;
        } catch (error) {
            PlaySound('error');
            return false;
        }
    };

    const validate_OTP = async (user_id, otp) => {
        try{
            const res = await axios.post(`${process.env.REACT_APP_VALIDATE_OTP_API}${user_id}/`, {OTP : otp}, {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
            );
            return res.status === 202;
        }catch(err){
            return err.response.status;
        }
    }

    const fetchReportData = async () => {
        try{
            const res = await axios.get(process.env.REACT_APP_REPORT_DATA_API,{
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userTknDetails()}`,
                    'X-CSRFToken' : csrfToken(),
                },
            })
            return res.data;
        }catch(err){
            return err;
        }
    }

    const postReportData = async (data) => {
        try{
            const res = await axios.post(process.env.REACT_APP_REPORT_DATA_API, data, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userTknDetails()}`,
                    'X-CSRFToken' : csrfToken(),
                },
            })
            return true;
        }catch(err){
            return err;
        }
    }

    const patchReportData = async (data) => {
        try{
            const res = await axios.patch(process.env.REACT_APP_REPORT_DATA_API, data, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userTknDetails()}`,
                    'X-CSRFToken' : csrfToken(),
                },
            })
            return true;
        }catch(err){
            return err;
        }
    }

    const deleteReportData = async (data) => {
        try{
            const res = await axios.delete(process.env.REACT_APP_REPORT_DATA_API, {
                data : data,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userTknDetails()}`,
                    'X-CSRFToken' : csrfToken(),
                },
            })
            return true;
        }catch(err){
            return err;
        }
    }

  return (
    <MailContext.Provider value={{ sendEmail, validate_OTP, 
                                    fetchReportData, postReportData, 
                                    patchReportData, deleteReportData }}>
        {children}
    </MailContext.Provider>
  )
};