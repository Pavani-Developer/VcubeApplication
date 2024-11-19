import React, { createContext } from 'react';
import { PlaySound } from '../StatusTone';
import axios from 'axios';
import { csrfToken, userTknDetails } from './TknDetails';

export const FeedbackContext = createContext();

export const FeedbackProvider = ({ children }) => {

    const fetchCourseFeedbackData = async (course) => {
        const url = course ? `${process.env.REACT_APP_COURSE_FEEDBACK_API}course/${course}/` : process.env.REACT_APP_COURSE_FEEDBACK_API
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

    const postCourseFeedbackData = async (data) => {
        try{
            const res = await axios.post(process.env.REACT_APP_COURSE_FEEDBACK_API, JSON.stringify(data),{
                headers : {
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

    const fetchPlacementFeedbackData = async (course) => {
        const url = course ? `${process.env.REACT_APP_PLACEMENTS_FEEDBACK_API}course/${course}/` : process.env.REACT_APP_PLACEMENTS_FEEDBACK_API
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

    const postPlacementFeedbackData = async (data) => {
        try{
            const res = await axios.post(process.env.REACT_APP_PLACEMENTS_FEEDBACK_API, JSON.stringify(data),{
                headers : {
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

    const fetchFeedbackFormLists = async (course) => {
        try{
            const res = await axios.get(`${process.env.REACT_APP_FEEDBACK_LISTS_API}course/${course}/`,{
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

    const postFeedbackFormLists = async (data) => {
        try{
            const res = await axios.post(process.env.REACT_APP_FEEDBACK_LISTS_API, data, {
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

    const patchFeedbackFormLists = async (data) => {
        try{
            const res = await axios.patch(process.env.REACT_APP_FEEDBACK_LISTS_API, data, {
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

    const deleteFeedbackFormLists = async (data) => {
        try{
            const res = await axios.delete(process.env.REACT_APP_FEEDBACK_LISTS_API,{
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
        <FeedbackContext.Provider value={{ fetchCourseFeedbackData, postCourseFeedbackData, fetchPlacementFeedbackData, 
                                        postPlacementFeedbackData, fetchFeedbackFormLists, postFeedbackFormLists, 
                                        patchFeedbackFormLists, deleteFeedbackFormLists }}>
            {children}
        </FeedbackContext.Provider>
    );
};