import axios from 'axios';
import React, { createContext } from 'react';
import { csrfToken, userTknDetails } from './TknDetails';

export const ExecuteCodeContext = createContext();

const ExecuteCodeProvider = ({ children }) => {


    const runCode = async (data) => {
        if (data.Language === 'python'){
            return await runPython(data);
        }else if (data.Language === 'javascript'){
            return await runJavascript(data);
        }else if (data.Language === 'java'){
            return await runJava(data);
        }else if (data.Language === 'sql'){
            return await runSql(data);
        }else if (data.Language === 'c'){
            return await runC(data);
        }else if (data.Language === 'cpp'){
            return await runCpp(data);
        }
    }

    const executeCode = async (data) => {
        if (data.Language === 'python'){
            return await executePython(data);
        }else if (data.Language === 'javascript'){
            return await executeJavascript(data);
        }else if (data.Language === 'java'){
            return await executeJava(data);
        }else if (data.Language === 'sql'){
            return await executeSql(data);
        }else if (data.Language === 'c'){
            return await executeC(data);
        }else if (data.Language === 'cpp'){
            return await executeCpp(data);
        }
    }

    const runPython = async(data) => {
        try{
            const res = await axios.post(process.env.REACT_APP_RUN_PYTHON_CODE_API, JSON.stringify(data),{
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

    const runJavascript = async(data) => {
        try{
            const res = await axios.post(process.env.REACT_APP_RUN_JAVASCRIPT_CODE_API, JSON.stringify(data),{
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

    const runJava = async(data) => {
        try{
            const res = await axios.post(process.env.REACT_APP_RUN_JAVA_CODE_API, JSON.stringify(data),{
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

    const runSql = async(data) => {
        try{
            const res = await axios.post(`${process.env.REACT_APP_RUN_SQL_CODE_API}${data.id}/`, JSON.stringify(data),{
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

    const runC = async(data) => {
        try{
            const res = await axios.post(process.env.REACT_APP_RUN_C_CODE_API, JSON.stringify(data),{
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

    const runCpp = async(data) => {
        try{
            const res = await axios.post(process.env.REACT_APP_RUN_CPP_CODE_API, JSON.stringify(data),{
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

    const executePython = async (data) => {
        try{    
            const res = await axios.post(process.env.REACT_APP_EXECUTE_PYTHON_CODE_API, JSON.stringify(data),{
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

    const executeJavascript = async (data) => {
        try{    
            const res = await axios.post(process.env.REACT_APP_EXECUTE_JAVASCRIPT_CODE_API, JSON.stringify(data),{
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

    const executeJava = async (data) => {
        try{    
            const res = await axios.post(process.env.REACT_APP_EXECUTE_JAVA_CODE_API, JSON.stringify(data),{
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

    const executeSql = async (data) => {
        try{    
            const res = await axios.post(`${process.env.REACT_APP_EXECUTE_SQL_CODE_API}${data.id}/`, JSON.stringify(data),{
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

    const executeC = async (data) => {
        try{    
            const res = await axios.post(process.env.REACT_APP_EXECUTE_C_CODE_API, JSON.stringify(data),{
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

    const executeCpp = async (data) => {
        try{    
            const res = await axios.post(process.env.REACT_APP_EXECUTE_CPP_CODE_API, JSON.stringify(data),{
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

 
  return (
    <ExecuteCodeContext.Provider value={{ runCode, executeCode }}>
    {children}
    </ExecuteCodeContext.Provider>
  )
}

export default ExecuteCodeProvider;