import React, { useContext, useEffect, useState } from 'react';
import PerformancePieChat from './PieChat';
import { Autocomplete, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, TextField, Typography } from '@mui/material';
import { GaugeChart } from './GuageChart';
import { CloseRounded, PieChartRounded, SendRounded } from '@mui/icons-material';
import { MailContext } from '../api/SendMail';
import { areas_of_improvement, strengths } from '../ExternalData';
import { StudentsContext } from '../api/students';

const Performance = ({ batchAttendanceData, stdAttendanceData, stdId, name, phone, email, setIsLoading, handleShowSnackbar, isUser }) => {
  const { fetchAssignmentResults } = useContext(StudentsContext);
  const { sendEmail } = useContext(MailContext);
  const [std_strengths, setstd_Strengths] = useState([]);
  const [improves, setImproves] = useState([]);
  const [sendReport, setSendReport] = useState(false);
  const batchCount = [];
  const studentCount = [];
  const types = ['Class', 'Mock Test', 'Interview'];
  const [studentScore, setStudentScore] = useState(0);

    types.forEach(type=>{
      let cnt = 0
      Array.isArray(batchAttendanceData) && batchAttendanceData.forEach(batch=>{
        if(batch.Attendance_Type === type)cnt++;
      })
      batchCount.push(cnt);
    })

    types.forEach(type=>{
      let cnt = 0
      Array.isArray(stdAttendanceData) && stdAttendanceData.forEach(std=>{
        if(std.Attendance_Type === type)cnt++;
      })
      studentCount.push(cnt);
    })

    const getScore = async () => {
      setIsLoading(true);
      const res = await fetchAssignmentResults(stdId);
      if(res && res.message){
        handleShowSnackbar('error',`Failed to get Weekly Test Score. ${res.message}`);
      }else{
        const scoreData = Array.isArray(res) && res.filter((data)=>(
          data.StudentId === stdId && data.Name === `${name}~${phone}`
        ))
        const total = scoreData.reduce((accumulator, data) => {
          return accumulator + parseInt(data.Score, 10);
        }, 0);
        setStudentScore(total > 0 && scoreData.length > 0 ? Math.floor((total / (scoreData.length * 100)) * 100) : 0);
      }
      setIsLoading(false);
    }

    useEffect(()=>{
      getScore();
    },[])

  const actualClasses = batchCount[0] + batchCount[1] + batchCount[2]
  const attendedClasses = studentCount[0] + studentCount[1] + studentCount[2]

  let total;
  if (actualClasses > 0) {
      total = (attendedClasses / actualClasses) * 100;
  } else {
      total = 0;
  }

  const send_Performance_to_Mail = async () => {
    if(std_strengths.length <= 0 || improves.length <= 0){
      handleShowSnackbar('error','Kindly complete all sections to assist the student in recognizing their strengths and improvement areas.');
      return;
    }
    setSendReport(false);
    setIsLoading(true);
    const assignments = Array.isArray(stdAttendanceData) && stdAttendanceData.length > 0 ?
                        stdAttendanceData.filter((data)=> data.Attendance_Type.split('~')[0] === 'Assignment').length : 0;
    const otp = `
Performance Overview:

  • Out of ${batchCount[0]} Classess Attended ${studentCount[0]}
  • Out of ${batchCount[1]} Weekly Tests Attended ${studentCount[1]}
  • Out of ${batchCount[2]} Interview Attended ${studentCount[2]}
  • Assignments Solved : ${assignments}
  • Weekly Test Score : ${studentScore}

Strengths:

  • ${std_strengths.join(', ')}

Areas for Improvement:

  • ${improves.join(', ')}
`
    const res = await sendEmail(otp, email, 'Your Performance Overview Report is Here.', name, 'Performance');
    setIsLoading(false);
    if(res === true){
      handleShowSnackbar('success','The student performance report has been sent successfully.')
    }else{
      handleShowSnackbar('error','Unfortunately, an error occurred, and the performance report failed to send.')
    }
    setstd_Strengths([]);
    setImproves([]);
  }

  return (
    <>
    <Box className="w-full h-[85%] flex flex-col items-center justify-evenly">
      <Typography variant='h4' className='flex items-center'><PieChartRounded sx={{fontSize : '30px', marginRight : '10px'}} /> Student Performance Traker</Typography>
      <Box className='w-full h-1/2 flex flex-row'>
        <PerformancePieChat classes={`${batchCount[0]}~${studentCount[0]}`}
              mock={`${batchCount[1]}~${studentCount[1]}`}
              interview={`${batchCount[2]}~${studentCount[2]}`} />
        <Box className="w-1/2 h-full flex flex-col items-center justify-center">
          <GaugeChart Guagevalue={Math.floor(((total + studentScore) / 200) * 100)} />
        </Box>
      </Box>
      {(isUser !== 'Student' && isUser.split(' ')[0] !== 'Placements') && <Box className="flex flex-col items-center justify-around w-full h-1/6">
        <Button variant='contained' endIcon={<SendRounded sx={{height : '30px'}}/>} onClick={()=>setSendReport(true)}>Send Performance Alert to Student</Button>
        <Typography variant='p' color='error'>Note: By delivering performance reports to students allows them to track their progress and identify areas for improvement.</Typography>
      </Box>}
    </Box>

    <Dialog open={sendReport} sx={{zIndex : '810'}}>
      <img src='/images/V-Cube-Logo.png' alt='' width='14%' className='ml-[43%]' />
      <IconButton sx={{position : 'absolute'}} className='top-1 right-1' 
        onClick={()=>{setSendReport(false);setstd_Strengths([]);setImproves([])}}>
        <CloseRounded fontSize='large' />
      </IconButton>
      <DialogTitle>Describe <strong>"{name}"</strong> Strengths and Improvements</DialogTitle>
      <DialogContent className='w-full'>
      <Autocomplete
            sx={{margin : '15px 0'}}
            multiple
            freeSolo
            value={std_strengths}
            options={strengths}
            onChange={(event, newValue) => setstd_Strengths(newValue)}
            renderInput={(params) => (
                <TextField
                    {...params}
                    variant="outlined"
                    label="Strengths"
                />
            )}
        />
        <Autocomplete
            sx={{margin : '15px 0'}}
            multiple
            freeSolo
            value={improves}
            options={areas_of_improvement}
            onChange={(event, newValue) => setImproves(newValue)}
            renderInput={(params) => (
                <TextField
                    {...params}
                    variant="outlined"
                    label="Areas for Improvement"
                />
            )}
        />
      </DialogContent>
      <DialogActions>
        <Button variant='outlined' onClick={()=>{setSendReport(false);setstd_Strengths([]);setImproves([])}}>Cancel</Button>
        <Button variant='contained' onClick={send_Performance_to_Mail}>Submit</Button>
      </DialogActions>
    </Dialog>
    </>
  )
}

export default Performance;