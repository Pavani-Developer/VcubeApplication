import React, { useContext, useEffect, useRef, useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import CodeEditor from './CodeEditor';
import CodingQuestionPage from './CodingQuestionPage';
import { StudentsContext } from '../api/students';
import { DateTime } from '../date-time';

export const handleFullScreen = () => {
    const editor = document.querySelector('.fullScreen');
    if (!editor) return;

    const requestFullscreen = editor.requestFullscreen || editor.webkitRequestFullscreen || editor.mozRequestFullScreen || editor.msRequestFullscreen;
    
    if (requestFullscreen) {
        requestFullscreen.call(editor).catch((error) => {
            console.error("Failed to enter fullscreen:", error);
        });
    }
};

export const handleExitFullScreen = () => {
    const exitFullscreen = document.exitFullscreen || 
                          document.webkitExitFullscreen || 
                          document.mozCancelFullScreen || 
                          document.msExitFullscreen;

    if (exitFullscreen) {
        exitFullscreen.call(document).catch((error) => {
            console.error("Failed to exit fullscreen:", error);
        });
    } else {
        console.warn("Fullscreen API is not supported in this browser.");
    }
};

const AssessmentCodeEditor = ({ isOpen, setIsOpen, stdId, handleShowSnackbar, solveAssessmentData, name, phone, course, batchName, isUser }) => {
    const { fetchAssignmentResults, patchAssignmentResults } = useContext(StudentsContext);
    const results = useRef(null);
    const [tabValue, setTabValue] = useState(0);
    const [resultPopUp, setResultPopUp] = useState(false);
    const [hideQuestion, setHideQuestion] = useState(false);
    const [full_Screen, setFull_Screen] = useState(true);
    const [popUp, setPopUp] = useState(false);
    const [timeoutId, setTimeoutId] = useState(null);
    const [seconds_, set_Seconds] = useState(10);
    const weekly_Assignment = sessionStorage.getItem('Weekly Assignment');
    const [questions_Data, setQuestions_Data] = useState(weekly_Assignment === 'True' || weekly_Assignment=== 'Past' ? solveAssessmentData[0] : solveAssessmentData);
    const [time_Up, setTime_Up] = useState(false);
    const [assignmentScore, setAssignmentScore] = useState({});
    const values = Object.values(assignmentScore);
    const score_Sum = values.reduce((acc, value) => acc + value, 0);
    const score_Length = Array.isArray(solveAssessmentData) ? solveAssessmentData.length : 0;
    const [minutes, setMinutes] = useState(0);

    const postResults = async () => {
        const getData = await fetchResults();
        getData['Score'] = score_Sum > 0 && score_Length > 0 ? (score_Sum / (score_Length * 100)) * 100 : 0;
        getData['Status'] = 'Solved';
        getData['Time'] = sessionStorage.getItem('Assignment_Time');
        const res = await patchAssignmentResults(getData);
        if (res && res.message){
            return false;
        }else if(res === true){
            return true;
        }
    }

    useEffect(() => {
        const handleBeforeUnload = () => {
            if(isUser === 'Student' && weekly_Assignment === 'True'){
                sessionStorage.setItem('Reloaded_In_Assignment','True');
                sessionStorage.setItem('Reloaded_Assignment_Data',JSON.stringify(solveAssessmentData));
            }
        };
        const handleScreenChange = (event) => {
            if (
                event.key === "Escape" || 
                event.key === "F11" || 
                (event.ctrlKey && event.key === "f") || 
                (event.metaKey && event.key === "f") || 
                (event.metaKey && event.shiftKey && event.key === "F") ||
                event.metaKey
            ) {
                handleExitFullScreen();
            }
        }

        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('keydown', handleScreenChange);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('keydown', handleScreenChange);
        };
    }, []);

    useEffect(() => {
        const enterFullScreen = () => {
            if (isOpen) {
                setTimeout(() => {
                    handleFullscreenChange();
                    sessionStorage.removeItem('Reloaded_In_Assignment');
                    sessionStorage.removeItem('Reloaded_Assignment_Data');
                }, 100);
            }
        };
        enterFullScreen();
    }, [isOpen]);

    const setItem = async () => {
        if(isUser === 'Student' && weekly_Assignment === 'True'){
            const getData = await fetchResults();
            if(!getData)return;
            getData.Status = 'Disqualified';
            const patch = await patchAssignmentResults(getData);
            if (patch === true){
                handleShowSnackbar('warning','You are disqualified. Your participation has been revoked.');
            }else{
                handleShowSnackbar('error','Something went wrong. Please try again later.');
            }
        }
    }

    const fetchResults = async () => {
        const res = await fetchAssignmentResults(stdId);
        if (res && res.message){
            handleShowSnackbar('error','Something went wrong. Please try again later.');
            return null;
        }else if(res){
            const getData = Array.isArray(res) && res.find((data)=>
                data.StudentId === stdId && 
                data.Name === `${name}~${phone}` &&
                data.Course === course &&
                data.BatchName === batchName &&
                data.Date === DateTime().split(' ')[0]
            )
            return getData ? getData : null;
        }
    }

    const updateScore = (key, score) => {
        if (assignmentScore && assignmentScore[key] !== undefined && assignmentScore[key] >= score)return;
        setAssignmentScore(prevScores => ({
            ...prevScores,
            [key]: score
        }));
    };

    const startTimeout = () => {
    set_Seconds(10);
    if (timeoutId) {
        clearTimeout(timeoutId);
    }
    const id = setTimeout(async () => {
        isUser === 'Student' && await setItem();
        setIsOpen(false);
        setPopUp(false);
    }, 11000);
    setTimeoutId(id);
    };

    const handleFullscreenChange = () => {
        if (document.fullscreenElement) {
            setFull_Screen(true);
            clearTimeout(timeoutId);
            setPopUp(false);
        } else {
            setFull_Screen(false);
            setPopUp(true);
            startTimeout();
        }
    };
    
    useEffect(() => {

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            if (timeoutId) {
            clearTimeout(timeoutId);
            }
        };
        }, [timeoutId]);

        useEffect(() => {
        let intervalId;

        if (popUp) {
            intervalId = setInterval(() => {
            set_Seconds(prev => {
                if (prev > 0) {
                return prev - 1;
                } else {
                clearInterval(intervalId);
                return 0;
                }
            });
            }, 1000);
        }

        return () => {
            if (intervalId) {
            clearInterval(intervalId);
            }
        };
    }, [popUp]);

    useEffect(() => {
    if (!popUp) {
        set_Seconds(10);
    }
    }, [popUp]);

    const handleExit = async () => {
        isUser === 'Student' && await setItem();
        setIsOpen(false);
        setPopUp(false);
        set_Seconds(10);
    }

    return (
    <>
    <Dialog fullScreen sx={{zIndex : '700'}} open={isOpen}>
        <DialogContent className='fullScreen flex items-center justify-between bg-gray-200' sx={{padding : 0 }}>
            <CodingQuestionPage results={results.current} questionData={questions_Data} tabValue={tabValue} setTabValue={setTabValue} 
                                handleExitFullScreen={handleExitFullScreen} resultPopUp={resultPopUp} setResultPopUp={setResultPopUp} isUser={isUser}
                                hideQuestion={hideQuestion} setHideQuestion={setHideQuestion} handleFullScreen={handleFullScreen} handleShowSnackbar={handleShowSnackbar}
                                setQuestions_Data={setQuestions_Data} solveAssessmentData={solveAssessmentData} score={score_Sum > 0 && score_Length > 0 ? (score_Sum / (score_Length * 100)) * 100 : 0}
                                scoreData={assignmentScore} postResults={postResults} setIsOpen={setIsOpen} time_Up={time_Up} minutes={minutes} />
            <CodeEditor setResults={results}
                        test_Cases={questions_Data && JSON.parse(questions_Data.Test_Cases)}
                        stdId={stdId} handleShowSnackbar={handleShowSnackbar} setTime_Up={setTime_Up}
                        setResultPopUp={setResultPopUp} hideQuestion={hideQuestion} minutes={minutes} setMinutes={setMinutes}
                        isSql={questions_Data && JSON.parse(questions_Data.Question).SQL === 'Yes'}
                        full_Screen={full_Screen} setTabValue={setTabValue} questionId={questions_Data && questions_Data.id}
                        name={name} course={course} batchName={batchName} isUser={isUser} updateScore={updateScore} />
        </DialogContent>
    </Dialog>

    <Dialog open={popUp}>
        <DialogTitle variant='h6'>Please use fullscreen mode to complete your assignment.</DialogTitle>
        <DialogContent className='w-full h-full flex flex-col items-center justify-center'>
        {weekly_Assignment === 'True' && <Typography color='error' className='w-full text-start'>
            If you exit the assignment before completing it,<br/>you will be disqualified,<br/>your submission will not be counted, and you cannot reenter.
        </Typography>}
        <Typography sx={{margin : '20px 0'}} >Please go to fullscreen and complete the assignment before the timer ends.</Typography>
        <Typography variant='h4' className='w-full text-center'>{seconds_ < 10 ? `0${seconds_}` : seconds_}s</Typography>
        </DialogContent>
        <DialogActions>
        <Button variant='outlined' onClick={handleExit}>Exit</Button>
        <Button variant='contained' onClick={()=>{handleFullScreen();setPopUp(false);set_Seconds(10)}} >Back to Full Screen</Button>
        </DialogActions>
    </Dialog>
    </>
    )
}

export default AssessmentCodeEditor;