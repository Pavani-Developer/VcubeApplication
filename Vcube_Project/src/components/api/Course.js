import axios from 'axios';
import React, { createContext } from 'react';
import { PlaySound } from '../StatusTone';
import { csrfToken, userTknDetails } from './TknDetails';

export const CourseContext = createContext();

export const CourseProvider = ({ children }) => {

    const fetchCourse = async () => {
        try{
            const res = await axios.get(process.env.REACT_APP_COURSE_DATA_API,{
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
    
    const postCourse = async (data) => {
        try{
            const res = await axios.post(process.env.REACT_APP_COURSE_DATA_API, JSON.stringify(data),{
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

    
    const deleteCourse = async (data) => {
        try{
            const res = await axios.delete(process.env.REACT_APP_COURSE_DATA_API,{
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
    const patchCourse = async (Id, tutors) => {
        try{
            const res = await axios.patch(process.env.REACT_APP_COURSE_DATA_API,{
                id : Id,
                Tutors : tutors
            },{
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userTknDetails()}`,
                    'X-CSRFToken' : csrfToken(),
            }})
            PlaySound('success');
            return true;
        }catch(err){
            PlaySound('error');
            return err;
        }
    };

    return (
        <CourseContext.Provider value={{ fetchCourse, postCourse, deleteCourse, patchCourse }}>
            {children}
        </CourseContext.Provider>
    );
};