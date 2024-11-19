import axios from 'axios';
import React, { createContext } from 'react';
import { PlaySound } from '../StatusTone';
import { csrfToken, userTknDetails } from './TknDetails';

export const PlacementsContext = createContext();

const PlacementsProvider = ({ children }) => {

  const fetchPostsData = async (course) => {
    const url = course ? `${process.env.REACT_APP_PLACEMENTS_POSTS_API}course/${course}/` : process.env.REACT_APP_PLACEMENTS_POSTS_API;
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

  const postPostsData = async (data) => {
    try{
      const res = await axios.post(process.env.REACT_APP_PLACEMENTS_POSTS_API, JSON.stringify(data),{
        headers : {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userTknDetails()}`,
          'X-CSRFToken' : csrfToken(),
        }
      });
      PlaySound('success');
      return true;
    }catch(err){
      PlaySound('error');
      return err;
    }
  }

  const deletePostsData = async (data) => {
    try{
      const res = await axios.delete(process.env.REACT_APP_PLACEMENTS_POSTS_API, {
        data : JSON.stringify(data),
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
    <PlacementsContext.Provider value={{ fetchPostsData, postPostsData, deletePostsData }}>
    {children}
    </PlacementsContext.Provider>
  )
}

export default PlacementsProvider;