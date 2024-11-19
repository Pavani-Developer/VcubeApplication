import React from 'react';
import { createContext } from 'react';
import axios from 'axios';
import { PlaySound } from '../StatusTone';
import { csrfToken, userTknDetails } from './TknDetails';

export const BatchAttendanceContext = createContext();

const BatchAttendanceProvider = ({ children }) => {

    const fetchBatchAttendanceData = async (id) => {
      try{
          const res = await axios.get(`${process.env.REACT_APP_BATCH_ATTENDANCE_API}${id}/`,{
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

  const fetchBatchAttendanceDataByCourse = async (course) => {
    try{
        const res = await axios.get(`${process.env.REACT_APP_BATCH_ATTENDANCE_API}course/${course}/`,{
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


    const postBatchAttendanceData = async (data) => {
      try {
        const response = await axios.post(process.env.REACT_APP_BATCH_ATTENDANCE_API, JSON.stringify(data),{
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userTknDetails()}`,
            'X-CSRFToken' : csrfToken(),
          },
        });
        const result = response.data;
        PlaySound('success');
        return result;
    } catch (err) {
        PlaySound('error');
        return err;
    }
    }

  return (
    <BatchAttendanceContext.Provider value={{ fetchBatchAttendanceData, fetchBatchAttendanceDataByCourse, postBatchAttendanceData }}>
        {children}
    </BatchAttendanceContext.Provider>
);
}

export default BatchAttendanceProvider;