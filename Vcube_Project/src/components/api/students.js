import React, { createContext, useState, useEffect } from 'react';
import { DateTime } from '../date-time';
import axios from 'axios';
import { PlaySound } from '../StatusTone';
import { csrfToken, userTknDetails } from './TknDetails';

export const StudentsContext = createContext();

export const StudentsProvider = ({ children }) => {
    const dateTime = DateTime().split(' ');

    const fetchStudentsData = async (course=null) => {
        const url = course ? `${process.env.REACT_APP_STUDENTS_DATA_API}course/${course}/` : process.env.REACT_APP_STUDENTS_DATA_API;
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

    const fetchStudentsDataById = async (id) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_STUDENTS_DATA_API}${id}/`,{
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
    }

    const postStudentData = async(data) => {
        try {
            const response = await axios.post(process.env.REACT_APP_STUDENTS_DATA_API, JSON.stringify(data), {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userTknDetails()}`,
                    'X-CSRFToken' : csrfToken(),
                },
            });
            PlaySound('success');
            return true;
        }catch(err){
            PlaySound('error');
            return err;
        }
    }

    const patchStudentData = async(data) => {
        try {
            const response = await axios.patch(process.env.REACT_APP_STUDENTS_DATA_API, data, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userTknDetails()}`,
                    'X-CSRFToken' : csrfToken(),
                },
            });
            PlaySound('success');
            return true;
        }catch(err){
            PlaySound('error');
            return err;
        }
    };

    const deleteStudentData = async(id) => {
        try {
            const response = await axios.delete(`${process.env.REACT_APP_STUDENTS_DATA_API}${id}/`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userTknDetails()}`,
                    'X-CSRFToken' : csrfToken(),
                },
            });
            PlaySound('success');
            return true;
        }catch(err){
            PlaySound('error');
            return err;
        }
    };

    const postBulkStudentData = async (data) => {
        try{
            const res = await axios.post(process.env.REACT_APP_BULK_STUDENTS_DATA_API, data, {
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

    const deleteBulkStudentData = async (data) => {
        try{
            const res = await axios.delete(process.env.REACT_APP_BULK_STUDENTS_DATA_API, {
                data : data,
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

    const deleteStudentRecords = async(id) => {
        try {
            const response = await axios.delete(`${process.env.REACT_APP_DELETE_STUDENTS_ATTENDANCE_API}${id}/`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userTknDetails()}`,
                    'X-CSRFToken' : csrfToken(),
                },
            });
            PlaySound('success');
            return true;
        }catch(err){
            PlaySound('error');
            return err;
        }
    };


    const getStudentAttendanceById = async (id) => {
        try{
            if (id){
                const res = await axios.get(`${process.env.REACT_APP_STUDENTS_ATTENDANCE_API}${id}/`,{
                    headers : {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${userTknDetails()}`,
                        'X-CSRFToken' : csrfToken(),
                    }
                })
                return res.data;
            }
        }catch(err){
            return err;
        }
    };

    const getStudentAttendanceByCourse = async (course) => {
        try{
            if(course){
                const res = await axios.get(`${process.env.REACT_APP_STUDENTS_ATTENDANCE_API}course/${course}/`,{
                    headers : {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${userTknDetails()}`,
                        'X-CSRFToken' : csrfToken(),
                    }
                })
                return res.data;
            }
        }catch(err){
            return err;
        }
    };

    const postStudentAttendance = async (data) => {
        try{
            const res = await axios.post(process.env.REACT_APP_STUDENTS_ATTENDANCE_API, JSON.stringify(data),{
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


    const fetchStudentMessageData = async (course) => {
        const url = course ? `${process.env.REACT_APP_STUDENT_MESSAGES_API}course/${course}/` : process.env.REACT_APP_STUDENT_MESSAGES_API;
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

      const postStudentMessageData = async (data) => {
        try{
            const res = await axios.post(process.env.REACT_APP_STUDENT_MESSAGES_API, JSON.stringify(data),{
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

      const deleteStudentMessageData = async (data) => {
        try{
            const res = await axios.delete(process.env.REACT_APP_STUDENT_MESSAGES_API,{
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

      const fetchBatchToStudentMessageData = async (id) => {
        const url = id ? `${process.env.REACT_APP_BATCH_TO_STUDENTS_MESSAGES_API}${id}/` : process.env.REACT_APP_BATCH_TO_STUDENTS_MESSAGES_API;
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

      const postBatchToStudentMessageData = async (data) => {
        try{
            const res = await axios.post(process.env.REACT_APP_BATCH_TO_STUDENTS_MESSAGES_API, JSON.stringify(data),{
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

      const deleteBatchToStudentMessageData = async (data) => {
        try{
            const res = await axios.delete(process.env.REACT_APP_BATCH_TO_STUDENTS_MESSAGES_API,{
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

      const fetchStudentWatchTimeData = async (id) => {
        try{
            const res = await axios.get(`${process.env.REACT_APP_STUDENT_WATCHTIME_API}${id}/`,{
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


      const postStudentWatchTimeData = async (data) => {
        try{
            const res = await axios.post(process.env.REACT_APP_STUDENT_WATCHTIME_API, data,{
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


      const patchStudentWatchTimeData = async (data) => {
        try{
            const res = await axios.patch(process.env.REACT_APP_STUDENT_WATCHTIME_API, data,{
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

      const fetchAssignmentResults = async (id) => {
        try{
            const url = id ? `${process.env.REACT_APP_STUDENT_ASSIGNMENT_RESULTS}${id}/` : process.env.REACT_APP_STUDENT_ASSIGNMENT_RESULTS;
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

      const postAssignmentResults = async (data) => {
        try{
            const res = await axios.post(process.env.REACT_APP_STUDENT_ASSIGNMENT_RESULTS, data,{
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

    const patchAssignmentResults = async (data) => {
        try{
            const res = await axios.patch(process.env.REACT_APP_STUDENT_ASSIGNMENT_RESULTS, data,{
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

    const fetchAssignmentRequests = async (id) => {
        const url = id ? `${process.env.REACT_APP_STUDENT_ASSIGNMENT_REQUESTS}${id}/` : process.env.REACT_APP_STUDENT_ASSIGNMENT_REQUESTS;
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

    const postAssignmentRequests = async (data) => {
        try{
            await axios.post(process.env.REACT_APP_STUDENT_ASSIGNMENT_REQUESTS, data, {
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

    const deleteAssignmentRequests = async (data) => {
        try{
            await axios.delete(process.env.REACT_APP_STUDENT_ASSIGNMENT_REQUESTS,{
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
        <StudentsContext.Provider value={{ postStudentData, fetchStudentsData, fetchStudentsDataById, patchStudentData, deleteStudentData,
                                            getStudentAttendanceById, getStudentAttendanceByCourse, postStudentAttendance,
                                            fetchStudentMessageData, postStudentMessageData, deleteStudentMessageData,
                                            fetchBatchToStudentMessageData, postBatchToStudentMessageData, deleteBatchToStudentMessageData,
                                            postBulkStudentData, deleteBulkStudentData, deleteStudentRecords,
                                            fetchStudentWatchTimeData, postStudentWatchTimeData, patchStudentWatchTimeData,
                                            fetchAssignmentResults, postAssignmentResults, patchAssignmentResults,
                                            fetchAssignmentRequests, postAssignmentRequests, deleteAssignmentRequests,
                                        }}>
            {children}
        </StudentsContext.Provider>
    );
};