import React, { startTransition, useContext, useEffect, useRef, useState } from 'react';
import { Box, Card, Typography } from '@mui/material';
import { GroupsRounded } from '@mui/icons-material';
import ProgressBar from './ProgressBar';
import { StudentsContext } from '../api/students';
import { DateTime } from '../date-time';
import { AssessmentContext } from '../api/Assessment';

export const getMonthsDifference = (startDate) => {
  const endDate = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  let yearsDifference = end.getFullYear() - start.getFullYear();
  let monthsDifference = end.getMonth() - start.getMonth();
  let totalMonths = yearsDifference * 12 + monthsDifference;
  if (end.getDate() < start.getDate()) {
      totalMonths--;
  }
  return totalMonths + 1;
}

const StudentProgressOverview = ({ batchAttData, fetchBatchAttData, setBatchAttendanceType, setOpenBatchAttendanceDialog, selectedCourse, handleShowSnackbar, selectedBatch, studentsData, openStdAttDialog, batchData, refresh }) => {
  const { getStudentAttendanceByCourse, fetchStudentsData } = useContext(StudentsContext);
  const { fetchAssessmentQuestions } = useContext(AssessmentContext);
  const [stdCount, setStdCount] = useState(0);
  const [assignmentCount, setAssignmentCount] = useState(0);
  const studentAttData = useRef([]);
  const dateTime = DateTime().split(' ');

  const fetchStdData = async()=>{
    const attData = await getStudentAttendanceByCourse(selectedCourse);
    const stdData = await fetchStudentsData(selectedCourse);
    const assignmentData = await fetchAssessmentQuestions(selectedCourse);
    if(attData && attData.message === 'Network Error'){
      handleShowSnackbar('error',attData.message);
    }else{
      studentAttData.current = attData;
    }
    if(!(assignmentData && assignmentData.message)){
      const filteredData = Array.isArray(batchData) && batchData.find(data => data.BatchName === selectedBatch);
      const data = Array.isArray(assignmentData) && assignmentData.filter((data)=> data.Course === selectedCourse && 
                  (selectedBatch === 'All' || (filteredData ? parseInt(JSON.parse(data.Question).Month.split(' ')[1]) >= getMonthsDifference(filteredData.Date) && parseInt(JSON.parse(data.Question).Month.split(' ')[1]) <= getMonthsDifference(filteredData.Date) : null)));
      data && setAssignmentCount(data.length);
    }
    if(!(stdData && stdData.message)){
      const stds = Array.isArray(stdData) && stdData.filter((data)=>data.Course === selectedCourse && (data.BatchName === selectedBatch || selectedBatch === 'All'))
      stds && setStdCount(stds.length);
    }
  }

  const getDays = (batchDate) => {
    const startDate = new Date(batchDate);
    const today = new Date();
    const timeDifference = today - startDate;
    const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    return daysDifference;
  }

  useEffect(()=>{startTransition(()=>{
      selectedCourse && selectedBatch && fetchStdData();
  })},[selectedCourse, selectedBatch, openStdAttDialog, refresh])

  useEffect(()=>{startTransition(()=>{
    selectedCourse && selectedBatch && fetchStdData();
  })},[openStdAttDialog, refresh])

  useEffect(()=>{startTransition(()=>{
    selectedCourse && fetchBatchAttData();
  })},[selectedBatch, refresh])

  const getData = (type) => {
    let typeCount = 0;
    Array.isArray(batchAttData) && batchAttData.forEach((data)=>{
      if(data.Course === selectedCourse && (data.BatchName === selectedBatch || selectedBatch === 'All') && data.Attendance_Type === type)typeCount++; 
    })
    return typeCount < 10 ? `0${typeCount}` : typeCount;
  };

  const getPercentage = (type) => {
    let stdCnt = 0;
    let batchCnt = 0;
    Array.isArray(studentAttData.current) && studentAttData.current.forEach((std)=>{
      if(std.Attendance_Type === type && (std.BatchName === selectedBatch || selectedBatch === 'All')){
        stdCnt++;
      }
    })
    Array.isArray(batchAttData) && batchAttData.forEach((batch)=>{
      if(batch.Attendance_Type === type && (batch.BatchName === selectedBatch || selectedBatch === 'All')){
        batchCnt++;
      }
    })
    if(batchCnt > 0 && studentAttData.current.length > 0){
      const percentage = Math.floor((stdCnt / (batchCnt * stdCount)) * 100)
      return percentage < 10 ? `0${percentage}` : percentage;
    }else{
      return '00';
    }
  }

    const getAssignmentPercentage = () => {
      let stdAttArr = []
      Array.isArray(studentsData) && studentsData.forEach((_std_)=>{
        if(_std_.BatchName === selectedBatch || selectedBatch === 'All'){
          let stdAttcnt = Array.isArray(studentAttData.current) ? studentAttData.current.filter((stdAtt)=>stdAtt.Name === _std_.Name && stdAtt.Attendance_Type.split('~')[0] === 'Assignment' && stdAtt.BatchName === _std_.BatchName).length : 0;
          let batchDate = Array.isArray(batchData) && batchData.find((batch)=> batch.BatchName === selectedBatch || selectedBatch === 'All').Date;
          const days = getDays(batchDate);
          stdAttArr.push(Math.floor(stdAttcnt > 0 && days > 0 ? (stdAttcnt / days) * 100 : 0));
        }
      });
      const total = stdAttArr.length > 0 ? stdAttArr.reduce((pre, cnt) => pre + cnt) : 0;
      const result = Math.floor(total > 0 && stdAttArr.length > 0 ? total / (stdAttArr.length * 100) * 100 : 0);
      return result > 0 ? result < 10 ? `0${result}` : result : '00';
    }

  const cards = [{
    Icon : <GroupsRounded sx={{fontSize : '30px', color : '#fff'}} />,
    Title : 'Total Students',
    Title_Count : (()=>{
      const stdCount = Array.isArray(studentsData) ? studentsData.filter((data)=>data.BatchName === selectedBatch || selectedBatch === 'All').length : 0;
       return stdCount > 0 ? (stdCount < 10) ? `0${stdCount}` : stdCount : '00'
    })(),
    L_G1 : '#3a3a40',
    L_G2 : '#232324',
    Percentage: (() => {
      if (selectedCourse && selectedBatch) {
          const classScore = parseInt(getPercentage('Class')) || 0;
          const mockTestScore = parseInt(getPercentage('Mock Test')) || 0;
          const interviewScore = parseInt(getPercentage('Interview')) || 0;
          const totalScore = classScore + mockTestScore + interviewScore;
          return totalScore > 0 ? Math.floor((totalScore / 400) * 100) : '00';
      }
      return '00';
  })(),
    onClick : null
  },{
    Icon : <img src="/images/Classes-Icon.png" alt='' width='35px' />,
    Title : 'Classes',
    Title_Count : getData('Class'),
    L_G1 : '#4099ee',
    L_G2 : '#227be9',
    Percentage : selectedCourse && selectedBatch && getPercentage('Class') || '00',
    onClick : ()=>handleOpenDialog('Class')
  },{
    Icon : <img src="/images/MockTest-Icon.png" alt='' width='30px' />,
    Title : 'Weekly Tests',
    Title_Count : getData('Mock Test'),
    L_G1 : '#61b665',
    L_G2 : '#4ca650', 
    Percentage : selectedCourse && selectedBatch && getPercentage('Mock Test') || '00',
    onClick : ()=>handleOpenDialog('Mock Test')
  },{
    Icon : <img src="/images/CaseStudy-Icon.png" alt='' width='27px' />,
    Title : 'Assignments',
    Title_Count : assignmentCount < 10 ? `0${assignmentCount}` : assignmentCount,
    L_G1 : '#e93a76',
    L_G2 : '#dc3570',
    Percentage :  getAssignmentPercentage(),
    onClick : ()=>{handleShowSnackbar('info','Taking attendance for assignments is unnecessary, as the percentage is automatically calculated when students solve them.')}
  },{
    Icon : <img src="/images/Interview-Icon.png" alt='' width='30px' />,
    Title : 'Interviews',
    Title_Count : getData('Interview'),
    L_G1 : '#ef6559',
    L_G2 : '#f44334',
    Percentage : selectedCourse && selectedBatch && getPercentage('Interview') || '00',
    onClick : ()=>handleOpenDialog('Interview')
  }]

  const handleOpenDialog = (type) => {
    if(!selectedCourse){
      handleShowSnackbar('error','Please select desire Course before adding an Attendance.');
      return;
    }
    setBatchAttendanceType(type);
    setOpenBatchAttendanceDialog(true);
  }

  return (
    <Box className="w-screen h-[14%] mt-10 flex flex-row items-center justify-evenly">
      {cards.map((card)=>(
          <Card className='relative w-1/6 h-full cursor-pointer hover:scale-110' 
            onClick={card.onClick}
            sx={{overflow : 'visible', borderRadius : '10px', transition : '0.3s ease-in-out',
            '&:hover': {
              boxShadow: '0px 0px 10px rgba(0,0,0,0.5)',
            },
          }}>
        <Card className='w-[3.25rem] h-12 flex items-center justify-center -mt-3 ml-3' sx={{background : `linear-gradient(${card.L_G1}, ${card.L_G2})`, boxShadow : '0 0 10px rgba(0,0,0,0.5)'}}>
          {card.Icon}
        </Card>
        <Box className="w-[65%] absolute top-2 right-3 flex flex-col items-end justify-end">
            <Typography variant='p' className='text-gray-400'>{card.Title}</Typography>
            <Typography variant='h6' sx={{fontWeight : 'bold', fontSize : '23px'}}>{card.Title_Count}</Typography>
          </Box>
          <Box className="w-full h-12 flex flex-col items-start justify-around absolute bottom-3">
            <Typography sx={{marginLeft : '5%', color : '#9ca3af'}}>{card.Percentage}%</Typography>
          <ProgressBar value={parseInt(card.Percentage)} color={card.L_G2} />
          </Box>
      </Card>
      ))}
    </Box>
  )
};

export default StudentProgressOverview;