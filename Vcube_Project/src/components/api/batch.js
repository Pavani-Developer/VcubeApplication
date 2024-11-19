import axios from 'axios';
import React, { createContext } from 'react';
import { PlaySound } from '../StatusTone';
import { csrfToken, userTknDetails } from './TknDetails';

export const BatchContext = createContext();

export const BatchProvider = ({ children }) => {

    const fetchBatchData = async (course=null) => {
        const url = (course) ? `${process.env.REACT_APP_BATCH_DATA_API}course/${course}/` : process.env.REACT_APP_BATCH_DATA_API
        try {
            const response = await axios.get(url,{
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userTknDetails()}`,
                    'X-CSRFToken' : csrfToken(),
            }});
            return response.data;
        } catch (err) {
            return err;
        }
    };

    const postBatchData = async (data) => {
        try {
            const response = await axios.post(process.env.REACT_APP_BATCH_DATA_API, JSON.stringify(data),{
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userTknDetails()}`,
                    'X-CSRFToken' : csrfToken(),
                },
            });
            if(response.status === 201 || response.status === 200){
                PlaySound('success');
                return true;
            }
        } catch (err) {
            PlaySound('error');
            return err;
        }
    };

    const deleteBatchData = async (data) => {
        try {
          const res = await axios.delete(process.env.REACT_APP_BATCH_DATA_API, {
            data: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userTknDetails()}`,
                'X-CSRFToken' : csrfToken(),
            },
          });
            PlaySound('success');
            return true;
        } catch (err) {
            PlaySound('error');
            return err;
        }
      };

      const deleteBatchRecords = async (id) => {
        try {
            const res = await axios.delete(`${process.env.REACT_APP_DELETE_BATCH_DATA_API}${id}/`, {
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${userTknDetails()}`,
                  'X-CSRFToken' : csrfToken(),
              },
            });
              return true;
          } catch (err) {
              PlaySound('error');
              return err;
          }
      }

      const fetchBatchMessageData = async (course) => {
        const url = course ? `${process.env.REACT_APP_BATCH_MESSAGES_API}course/${course}/` : process.env.REACT_APP_BATCH_MESSAGES_API;
        try{
            const res = await axios.get(url,{
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userTknDetails()}`,
                    'X-CSRFToken' : csrfToken(),
            }});
            return res.data;
        }catch(err){
            return err;
        }
      }

      const postBatchMessageData = async (data) => {
        try{
            const res = await axios.post(process.env.REACT_APP_BATCH_MESSAGES_API, JSON.stringify(data),{
                headers : {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userTknDetails()}`,
                    'X-CSRFToken' : csrfToken(),
                }
            })
            if(res.status === 201 || res.status === 200){
                PlaySound('success');
                return true;
            }
        }catch(err){
            PlaySound('error');
            return err;
        }
      }

      const deleteBatchMessageData = async (data) => {
        try{
            const res = await axios.delete(process.env.REACT_APP_BATCH_MESSAGES_API,{
                data: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userTknDetails()}`,
                    'X-CSRFToken' : csrfToken(),
                },
            });
            if (res.status === 204) {
                PlaySound('success');
                return true;
            }
        }catch(err){
            PlaySound('error');
            return err;
        }
      }

      const fetchAdminMessageData = async (course) => {
        const url = course ? `${process.env.REACT_APP_ADMIN_MESSAGES_API}course/${course}` : process.env.REACT_APP_ADMIN_MESSAGES_API;
        try{
            const res = await axios.get(url,{
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userTknDetails()}`,
                    'X-CSRFToken' : csrfToken(),
            }});
            return res.data;
        }catch(err){
            return err;
        }
      }

      const postAdminMessageData = async (data) => {
        try{
            const res = await axios.post(process.env.REACT_APP_ADMIN_MESSAGES_API, JSON.stringify(data),{
                headers : {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userTknDetails()}`,
                    'X-CSRFToken' : csrfToken(),
                }
            })
            if(res.status === 201 || res.status === 200){
                PlaySound('success');
                return true;
            }
        }catch(err){
            PlaySound('error');
            return err;
        }
      }

      const deleteAdminMessageData = async (data) => {
        try{
            const res = await axios.delete(process.env.REACT_APP_ADMIN_MESSAGES_API,{
                data: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userTknDetails()}`,
                    'X-CSRFToken' : csrfToken(),
                },
            });
            if (res.status === 204) {
                PlaySound('success');
                return true;
            }
        }catch(err){
            PlaySound('error');
            return err;
        }
      }
      

    return (
        <BatchContext.Provider value={{ fetchBatchData, postBatchData, deleteBatchData, 
                                        fetchBatchMessageData, postBatchMessageData, 
                                        deleteBatchMessageData, fetchAdminMessageData, 
                                        postAdminMessageData, deleteAdminMessageData,
                                        deleteBatchRecords }}>
            {children}
        </BatchContext.Provider>
    );
};