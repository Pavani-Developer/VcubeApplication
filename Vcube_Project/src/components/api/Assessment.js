import axios from 'axios';
import React, { createContext } from 'react';
import { PlaySound } from '../StatusTone';
import { csrfToken, userTknDetails } from './TknDetails';

export const AssessmentContext = createContext();

export const AssessmentProvider = ({ children }) => {

    const fetchAssessmentQuestions = async (course, id) =>{
        const url = course ? `${process.env.REACT_APP_ASSESSMENT_QUESTIONS_API}course/${course}/` : `${process.env.REACT_APP_ASSESSMENT_QUESTIONS_API}${id}/`;
        try{
            const res = await axios.get(url,{
                headers : {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userTknDetails()}`,
                    'X-CSRFToken' : csrfToken(),
                }
            });
            return res.data;
        }catch(err){
            return err;
        }
    }

    const postAssessmentQuestions = async (data) => {
        try{
            const res = await axios.post(process.env.REACT_APP_ASSESSMENT_QUESTIONS_API, JSON.stringify(data),{
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userTknDetails()}`,
                    'X-CSRFToken' : csrfToken(),
                },
            })
            PlaySound('success');            
            return true;
        }catch(err){
            PlaySound('error');
            return err;
        }
    }

    const patchAssessmentQuestions = async (data) => {
        try{
            const res = await axios.patch(process.env.REACT_APP_ASSESSMENT_QUESTIONS_API, JSON.stringify(data),{
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userTknDetails()}`,
                    'X-CSRFToken' : csrfToken(),
                },
            })
            PlaySound('success');            
            return true;
        }catch(err){
            PlaySound('error');
            return err;
        }
    }

    const deleteAssessmentQuestions = async (data) => {
        try{
            const res = await axios.delete(process.env.REACT_APP_ASSESSMENT_QUESTIONS_API,{
                data: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userTknDetails()}`,
                    'X-CSRFToken' : csrfToken(),
                },
            })
            PlaySound('success');
            return true;
        }catch(err){
            PlaySound('error');
            return err;
        }
    };

    const fetchRecordings = async (course,id) => {
        const url = course ? `${process.env.REACT_APP_STUDENT_CLASS_RECORDING_API}course/${course}/` : `${process.env.REACT_APP_STUDENT_CLASS_RECORDING_API}${id}/`
        try{
            const res = await axios.get(url,{
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

    const postRecordings = async (data) => {
        try{
            const res = await axios.post(process.env.REACT_APP_STUDENT_CLASS_RECORDING_API,data,{
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userTknDetails()}`,
                    'X-CSRFToken' : csrfToken(),
                },
            })
            PlaySound('success');
            return true;
        }catch(err){
            PlaySound('error');
            return err;
        }
    }

    const deleteRecordings = async (data) => {
        try{
            const res = await axios.delete(process.env.REACT_APP_STUDENT_CLASS_RECORDING_API,{
                data: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userTknDetails()}`,
                    'X-CSRFToken' : csrfToken(),
                },
            })
            PlaySound('success');
            return true;
        }catch(err){
            PlaySound('error');
            return err;
        }
    }

    return (
        <AssessmentContext.Provider value={{ fetchAssessmentQuestions, postAssessmentQuestions, deleteAssessmentQuestions,
                                            fetchRecordings, postRecordings, deleteRecordings, patchAssessmentQuestions
        }}>
            {children}
        </AssessmentContext.Provider>
    );
};