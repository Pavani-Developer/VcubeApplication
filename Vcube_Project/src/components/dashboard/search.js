import React, { useEffect, useState } from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem, Button, Tooltip } from '@mui/material';
import { AttributionRounded, RefreshRounded } from '@mui/icons-material';

const Search = ({ user, courseData, batchData, selectedBatch, setSelectedBatch, selectedCourse, setSelectedCourse, userCourse, setShortLoading ,setTakeStdAtt, refreshData, setStdAttViewType, stdAttViewType }) => { 
    const [refreshed, setRefreshed] = useState(false);
    const [timer, setTimer] = useState(30);

    useEffect(()=>{
      const batch_Name = sessionStorage.getItem('SelectedBatch');
      const course_Name = sessionStorage.getItem('SelectedCourse');
      if(batch_Name)setSelectedBatch(batch_Name);
      if(course_Name)setSelectedCourse(course_Name);
    },[selectedBatch, selectedCourse])

    const handleCourseChange = (e) => {
      setSelectedCourse(e.target.value);
      sessionStorage.setItem('SelectedCourse',e.target.value);
      sessionStorage.setItem('SelectedBatch','');
      setSelectedBatch(null);
      setShortLoading(true);
    }

    useEffect(() => {
      let timerId;
    
      if (refreshed) {
        timerId = setTimeout(() => {
          setTimer((prev) => prev - 1);
        }, 1000);
      }
  
      if (timer === 0) {
        setRefreshed(false);
        setTimer(30);
      }
    
      return () => clearTimeout(timerId);
    }, [timer, refreshed]);

  return (
    <Box className="h-[7%] mt-4 mb-4 w-[95%] ml-[2.5%] flex items-center justify-between bg-transparent">
      <Button endIcon={!refreshed && <RefreshRounded/>} variant='outlined' onClick={()=>{!refreshed && refreshData();setRefreshed(true)}}>Refresh {refreshed && `in ${timer < 10 ? `0${timer}` : `${timer}`}`}</Button>
      <Button variant="contained" startIcon={<AttributionRounded />} onClick={()=>setTakeStdAtt(true)}>Take Student Attendance</Button>

     {userCourse === 'All' && user === 'Super Admin' && 
          <FormControl sx={{width : '23%'}} variant='standard'>
          <InputLabel variant='standard' shrink={selectedCourse ? true : false} sx={{fontSize : '20px', color : ''}}>Select Course</InputLabel>
          <Select
            value={selectedCourse}
            onChange={(e)=>handleCourseChange(e)}
            sx={{width: '100%',
              '& .MuiInputBase-input': {
              fontSize: '20px',
              padding: '5px 0',
              },
              '& .MuiInputLabel-root': {
              fontSize: '20px',
              },}}
              >
            {courseData && courseData.map((data,index)=>(
              <MenuItem value={data.Course} key={index}>{data.Course}</MenuItem>
            ))
            }
          </Select>
      </FormControl>}

      <FormControl variant="standard" sx={{width : '23%'}}>
        <InputLabel shrink={selectedBatch ? true : false} sx={{fontSize : '20px', color : ''}}>Select Batch</InputLabel>
        <Select
          value={selectedBatch}
          onChange={(e)=>{setSelectedBatch(e.target.value);setShortLoading(true);sessionStorage.setItem('SelectedBatch',e.target.value)}}
          sx={{width: '100%',
            '& .MuiInputBase-input': {
            fontSize: '20px',
            padding: '5px 0',
            },
            '& .MuiInputLabel-root': {
            fontSize: '20px',
            },}}
            >
          {selectedCourse && batchData && batchData.map((data)=>(
              (data.Course === selectedCourse) &&
              <MenuItem value={data.BatchName}>{data.BatchName}</MenuItem>
          ))
          }
          {selectedCourse && <MenuItem value="All">All Batches</MenuItem>}
        </Select>
      </FormControl>

      <Tooltip title='Toogle Student Attendance View' arrow>
        <Button variant='outlined' sx={{width : '18%'}} onClick={()=>setStdAttViewType(stdAttViewType === 'Class' ? 'Weekly Test' : stdAttViewType === 'Weekly Test' ? 'Interview' : 'Class')} >{stdAttViewType} Attendance</Button>
      </Tooltip>
    </Box>
  )
};

export default Search;