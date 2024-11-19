import React, { useContext, useEffect, useRef, useState } from 'react';
import { Box, Button, Card, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Tab, Tabs, TextField, Typography } from '@mui/material';
import { AssignmentRounded, CheckRounded, CloseRounded, DoNotDisturbRounded, EastRounded, FiberManualRecordRounded, PendingActionsRounded, RotateLeftRounded, RunningWithErrorsRounded } from '@mui/icons-material';
import { DateTime } from '../date-time';
import { StudentsContext } from '../api/students';
import { mui_colors } from '../ExternalData';

const WeeklyAssignments = ({ stdId, name, image, phone, course, batchName, handleShowSnackbar, setIsLoading, setSolveAssesments, setSolveAssessmentData, liveWeeklyData, pastWeeklyData, isUser, setTab_Value }) => {
    const { getStudentAttendanceById, fetchAssignmentResults, fetchAssignmentRequests, postAssignmentRequests, patchAssignmentResults, postAssignmentResults } = useContext(StudentsContext);
    const [tabValue, setTabValue] = useState(0);
    const [ready, setReady] = useState(false);
    const [startTimer, setTimerStart] = useState(false);
    const [timer, setTimer] = useState(10);
    const [isStudent_Att, setIsStudent_Att] = useState(false);
    const resultsData = useRef([]);
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
    const [studentStatus, setStudentStatus] = useState({});
    const [requestRaised, setRequestRaised] = useState(false);
    const [raiseRequest, setRaiseRequest] = useState(false);

    const fetchData = async () => {
        setIsLoading(true);
        const res = await getStudentAttendanceById(stdId);
        if(res && res.message){
            handleShowSnackbar('error',`Something went wrong. Please try again later. ${res.message}`)
        }else{
            const isFound = Array.isArray(res) && res.find((data)=>
                data.StudentId === stdId  &&
                data.Name === `${name}~${phone}` &&
                data.Course === course &&
                data.BatchName === batchName &&
                data.Attendance_Type === 'Mock Test' &&
                data.Date === DateTime().split(' ')[0]
            )
            setIsStudent_Att(isFound);
        }
        setIsLoading(false);
    }

    const fetchResultsData = async () => {
        setIsLoading(true);
        const res = await fetchAssignmentResults(stdId);
        if(res && res.message){
            (res.response && res.response.status === 404) ? 
            setStudentStatus({Status : 'Start'}) : 
            handleShowSnackbar('error',`Something went wrong. Please try again later. ${res.message}`);
            return false;
        }else if(Array.isArray(res) && res.length > 0){
            resultsData.current = Array.isArray(res) && res.filter((data)=>
                data.StudentId === stdId &&
                data.Name === `${name}~${phone}` &&
                data.Course === course &&
                data.BatchName === batchName
            )
            const getData = Array.isArray(res) && res.find((data)=>
                data.StudentId === stdId && 
                data.Name === `${name}~${phone}` &&
                data.Course === course &&
                data.BatchName === batchName &&
                data.Date === DateTime().split(' ')[0]
            )
            setStudentStatus(getData ? getData : {Status : 'Start'});
            return getData ? getData : null;
        }else if(Array.isArray(res) && res.length === 0){
            setStudentStatus({Status : 'Start'});
            return null;
        }
        setIsLoading(false);
    }

    const fetchRequests = async () => {
        const res = await fetchAssignmentRequests(stdId);
        if(res && res.message){
            !(res.response && res.response.status === 404) &&
            handleShowSnackbar('error','Falied to get request data. Please try again later.');
        }else if(res){
            if(Array.isArray(res) && res.length === 0){
                return;
            }
            const getData = Array.isArray(res) && res.find((data)=>
                data.StudentId === stdId &&
                data.Name === `${name}~${phone}` &&
                data.Course === course &&
                data.BatchName === batchName &&
                data.Date === DateTime().split(' ')[0]
            )
            if(getData)setRequestRaised(true);
        }
    }

    const postRequests = async () => {
        const data = {
            StudentId : stdId,
            Name : `${name}~${phone}`,
            Course : course,
            BatchName : batchName,
            Date : DateTime().split(' ')[0],
        }
        const res = await postAssignmentRequests(data);
        if(res === true){
            handleShowSnackbar('success','A request has been raised on your behalf. Kindly reach out to your coordinator for approval.');
            fetchRequests();
        }else{
            handleShowSnackbar('error',`Something went wrong. Please try again later. ${res.message}`);
        }
    }

    useEffect(()=>{
        fetchData();
        fetchResultsData();
        fetchRequests();
    },[])

    const groupedByDate = pastWeeklyData.reduce((acc, current) => {
        const date = current.WeeklyAssignment.split(' ')[0];
    
        if (!acc[date]) {
            acc[date] = [];
        }
    
        acc[date].push(current);
        return acc;
    }, {});
    const nestedArray = Object.values(groupedByDate);

    useEffect(() => {
        let timerId;
      
        if (ready && startTimer) {
          timerId = setTimeout(() => {
            setTimer((prev) => prev - 1);
          }, 1000);              
        }
    
        if (timer === 0) {
            setTimerStart(false);
            setTimer(10);
        }
        return () => clearTimeout(timerId);
      }, [timer, startTimer]);

    const hasOneHourPassed = () => {
        if (Array.isArray(liveWeeklyData) && liveWeeklyData.length > 0){
            const targetDate = new Date(liveWeeklyData[0].WeeklyAssignment);
            const currentDate = new Date();
            const difference = currentDate - targetDate;
            const oneHourInMillis = 60 * 60 * 1000;
            return difference >= oneHourInMillis;
        }else{
            return '';
        }
    }

      useEffect(() => {
        if(!(Array.isArray(liveWeeklyData) && liveWeeklyData.length > 0))return;
        const targetTime = new Date(liveWeeklyData[0].WeeklyAssignment).getTime();
    
        const updateTimer = () => {
          const now = new Date().getTime();
          const distance = targetTime - now;

          if (distance === 0) {
            setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
            clearInterval(timer);
          } else if(distance > 0){
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            if (timeLeft.hours !== hours || timeLeft.minutes !== minutes || timeLeft.seconds !== seconds) {
                setTimeLeft({ hours, minutes, seconds });
            }
          }
        };
    
        const timer = setInterval(updateTimer, 1000);
        updateTimer();
    
        return () => clearInterval(timer);
      }, [liveWeeklyData, timeLeft]);

      const handleClick = async (data=false) => {
        const res = isUser === 'Student' && !data ? await postProgress() : true;
        if(!res)return;
        sessionStorage.setItem('Weekly Assignment', data ? 'Past' : 'True');
        setSolveAssessmentData(data ? data : liveWeeklyData);
        setSolveAssesments(true);
        setReady(false);
        if(!data)setTab_Value(0);
        setIsLoading(false);
      }

      const postProgress = async () => {
        const getData = await fetchResultsData();
        if(getData === false)return;
        const data = {
            StudentId : stdId,
            Image : image,
            Name : `${name}~${phone}`,
            Course : course,
            BatchName : batchName,
            Date : DateTime().split(' ')[0],
            Status : 'Progress',
        }
        if(getData)getData.Status = 'Progress'
        const res = getData ? await patchAssignmentResults(getData) : await postAssignmentResults(data);
        if(res === true){
            return true;
        }else{
            handleShowSnackbar('error','Something went wrong. Please try again later.');
            return false;
        }
      }

      const getResults = (date) => {
        const data = resultsData.current.find((res)=>res.Date === date.split(' ')[0]); 
        return data ? data.Status : null;
      }

  return (
    <>
    <Box className='relative w-full h-full border-2 rounded-lg flex flex-col items-center justify-start'>
        <Tabs value={tabValue}>
            <Tab label='Live Assigments' onClick={()=>setTabValue(0)} sx={{fontWeight : tabValue === 0 ? 'bold' : 'normal'}} />
            <Tab label='Past Assigments' onClick={()=>setTabValue(1)} sx={{fontWeight : tabValue === 1 ? 'bold' : 'normal'}}  />
        </Tabs>

        {tabValue === 0 ? 
            ((Array.isArray(liveWeeklyData) && liveWeeklyData.length > 0) ?
                ((timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0) ?
                    (isStudent_Att ?
                    <>
                    <Box className={`${(studentStatus && studentStatus.Status === 'Start' && !hasOneHourPassed()) || (studentStatus && studentStatus.Status === 'Progress') ? 'bg-slate-100' : studentStatus && studentStatus.Status === 'Solved' ? 'bg-green-100' : 'bg-red-100'} w-1/2 h-52 rounded-lg mt-32 border-2 border-dashed ${(studentStatus && studentStatus.Status === 'Start' && !hasOneHourPassed()) || (studentStatus && studentStatus.Status === 'Progress') ? 'border-slate-400' : studentStatus && studentStatus.Status === 'Solved' ? 'border-green-700' : 'border-red-700'} flex flex-col items-center justify-center`}>
                        {hasOneHourPassed() ? 
                            <Typography variant='h5' sx={{fontFamily : 'monospace'}}>Your Weekly Test has been Completed.</Typography> : 
                            <Typography variant='h5' sx={{fontFamily : 'monospace'}}>Your Weekly Test is Live <FiberManualRecordRounded fontSize='small' color='success' /></Typography>}
                        <Typography sx={{fontFamily : 'unset', margin : '20px 0'}} variant='h5' >{DateTime().split(' ')[0]}</Typography>
                        {studentStatus && studentStatus.Status === 'Solved' ?
                                <Button startIcon={<CheckRounded/>} color='success' variant='contained' sx={{width : '40%'}} >Solved</Button> :
                            studentStatus && studentStatus.Status === 'Start' && !hasOneHourPassed() ?
                                <Button endIcon={<EastRounded/>} variant='contained' sx={{width : '40%'}} onClick={()=>{setReady(true);setTimerStart(true);setTimer(10)}} >Solve Now</Button> :
                            studentStatus && studentStatus.Status === 'Progress' && !hasOneHourPassed() ? 
                                <Button endIcon={<RotateLeftRounded/>} variant='contained' onClick={()=>setRaiseRequest(true)}>In Progress</Button> :
                                <Button startIcon={<CloseRounded/>} color='error' variant='contained'>Disqualified</Button>}
                    </Box>
                        {(studentStatus && (studentStatus.Status === 'Solved' || studentStatus.Status === 'Disqualified')) && <Typography variant='h5' sx={{margin : '25px 0'}}>Your Score: {studentStatus && studentStatus.Status === 'Solved' ? studentStatus.Score : '0'}</Typography>}
                    </>
                    : 
                    <Box className='w-full h-full flex flex-col items-center justify-center'>
                        <RunningWithErrorsRounded sx={{fontSize : '120px', marginBottom : '25px'}} color='error' />
                        <Typography className='text-start w-[75%]' variant='h6' sx={{fontFamily : 'monospace'}}>
                            Dear {name},<br/><br/>
                            We noticed that you did not participate in the recent assignment.<br/>
                            Completing assignments is crucial for your understanding and improvement in the subject.<br/>
                            If you faced any challenges or have questions, please reach out so we can assist you.<br/>
                            Your engagement is important, and we encourage you to stay on track with your studies.<br/><br/>
                            Please note that consistent attendance and participation are essential, as a lack of engagement can lead to a decrease in performance. 
                            These factors are vital for your overall academic success and are also important for placement purposes.
                        </Typography>
                    </Box>)
                :
                <Box className='w-full h-full flex flex-col items-center justify-center'>
                    <PendingActionsRounded sx={{fontSize : '120px'}} color='primary' />
                    <Typography variant='h4' sx={{fontFamily : 'monospace', margin : '30px 0'}}>Your Assigment will be live in</Typography>
                    <Box className='h-20 w-1/5 flex items-center justify-between'>
                        <Box className='w-[25%] h-full border-2 border-slate-300 rounded-lg flex items-center justify-center'>
                            <Typography variant='h4'>{timeLeft.hours.toString().padStart(2, '0')}</Typography>
                        </Box>
                        <Typography variant='h4' >:</Typography>
                        <Box className='w-[25%] h-full border-2 border-slate-300 rounded-lg flex items-center justify-center'>
                            <Typography variant='h4'>{timeLeft.minutes.toString().padStart(2, '0')}</Typography>
                        </Box>
                        <Typography variant='h4' >:</Typography>
                        <Box className='w-[25%] h-full border-2 border-slate-300 rounded-lg flex items-center justify-center'>
                            <Typography variant='h4'>{timeLeft.seconds.toString().padStart(2, '0')}</Typography>
                        </Box>
                    </Box>
                    {<Button sx={{marginTop : '30px'}} variant='contained' onClick={()=>handleClick(false)}>Check Assignment</Button>}
                </Box>
                )
            :
            <Box className='w-full h-full flex flex-col items-center justify-center'>
                <DoNotDisturbRounded sx={{fontSize : '150px', marginBottom : '20px'}} color='action' />
                <Typography variant='h4' color='grey'>No Live Assigments Found.</Typography>
            </Box>)
        :
            (Array.isArray(pastWeeklyData) && pastWeeklyData.length > 0 ? 
            <Box className='w-full h-full overflow-auto grid grid-cols-2 gap-5 place-content-start mt-3 pl-3 pb-3 pr-3' sx={{scrollbarWidth : 'thin'}}>
                {Array.isArray(nestedArray) && nestedArray.map((data,index)=>
                    <Card className='w-full h-20 flex items-center justify-between pl-5 pr-3 mt-1 border-[1px] border-slate-200' key={index}>
                        <AssignmentRounded fontSize='large' sx={{color : mui_colors[index < 20 ? index : Math.floor(Math.random() * 20)]}} />
                        <Typography sx={{fontFamily : 'monospace'}} className='w-[60%] text-start' variant='h5'>Weekly Assigment <br/>{data[0].WeeklyAssignment}</Typography>
                        <Button endIcon={<EastRounded/>} variant='contained'
                            color={getResults(data[0].WeeklyAssignment) === 'Solved' ? 'success' : getResults(data[0].WeeklyAssignment) === null ? 'primary' : 'error'}
                            onClick={()=>handleClick(data)}>View Assigment</Button>
                    </Card>
                )}
            </Box>
            :
            <Box className='w-full h-full flex flex-col items-center justify-center'>
                <DoNotDisturbRounded sx={{fontSize : '150px', marginBottom : '20px'}} color='action' />
                <Typography variant='h4' color='grey'>No Past Assigments Found.</Typography>
            </Box>)
        }
    </Box>

    <Dialog open={ready} sx={{zIndex : '710'}} maxWidth='lg' onClose={()=>{setReady(false);setTimerStart(false)}}>
        <img src='/images/V-Cube-Logo.png' width='12%' className='ml-[44%]' alt='' />
        <IconButton sx={{position : 'absolute'}} className='top-1 right-1'  onClick={()=>{setReady(false);setTimerStart(false)}}>
            <CloseRounded fontSize='large' />
        </IconButton>
        <DialogTitle className='text-center' >This assignment is an opportunity to enhance your skills and knowledge.<br/>Approach it with integrity and commitment!</DialogTitle>
        <DialogContent>
            <Typography variant='h5' className='w-full text-center' sx={{margin : '15px 0'}}>You have 1 hour to complete the assignment</Typography>
            <DialogContentText>
                • Solve the assignment in full-screen mode.<br/>
                • if you exit full-screen mode, you will not be allowed to re-enter the assignment and will be disqualified.<br/>
                • Do not reload the page. Reloading will reset your progress and you will have to start from the beginning.<br/>
                • Complete the assignment without cheating for your personal growth.<br/>
                • Allocate enough time to complete the assignment thoroughly.<br/>
                • Ask any questions or seek clarification before starting.<br/>
                • Check your answers for mistakes before submitting.<br/>
                • Follow the provided submission guidelines and meet the deadline.<br/>
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            {startTimer ? <Button variant='outlined' color='info' >Continue in {timer < 10 ? `0${timer}` : timer}</Button> :
            <Button variant='outlined' color='warning' sx={{width : '100%', marginBottom : '10px'}} 
                onClick={()=>handleClick(false)}>
                I have gone through the instructions and am ready to solving the assignment.</Button>}
        </DialogActions>
    </Dialog>

    <Dialog open={raiseRequest} sx={{zIndex : '710'}} onClose={()=>setRaiseRequest(false)}>
        <img src='/images/V-Cube-Logo.png' width='16%' className='ml-[42%]' />
        <DialogTitle variant='h5'>Request for Re-entry.</DialogTitle>
        <DialogContent>
            <DialogContentText>
                We noticed that you exited the assignment unexpectedly.<br/>
                To ensure you can access it again, please ask your coordinator to approve your request for re-entry.
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            {requestRaised ? 
                <Button variant='contained' color='success'>Request Raised</Button> :
                <Button variant='contained' onClick={postRequests}>Raise a Request</Button>
            }
        </DialogActions>
    </Dialog>
    </>
  )
}

export default WeeklyAssignments;