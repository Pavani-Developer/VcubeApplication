import React, { useEffect, useState } from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem, Button } from '@mui/material';
import { RefreshRounded } from '@mui/icons-material';

const SelectOptions = ({ selectedCourse, setSelectedCourse, selectedBatch, setSelectedBatch, courseData, batchData, setShortLoading, refreshData }) => {
  const [refreshed, setRefreshed] = useState(false);
  const [timer, setTimer] = useState(30);

  useEffect(()=>{
    setSelectedBatch(sessionStorage.getItem('SelectedBatch'));
    setSelectedCourse(sessionStorage.getItem('SelectedCourse'));
  },[])

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
        <Box className="h-14 mt-5 mb-5 w-[95%] ml-[2.5%] flex items-center justify-between bg-transparent">
        <Button endIcon={!refreshed && <RefreshRounded/>} variant='outlined' onClick={()=>{!refreshed && refreshData();setRefreshed(true)}}>Refresh {refreshed && `in ${timer < 10 ? `0${timer}` : `${timer}`}`}</Button>
         {<FormControl sx={{width : '30%'}} variant='standard'>
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
                {courseData && courseData.map((data)=>(
                  <MenuItem value={data.Course}>{data.Course}</MenuItem>
                ))
                }
              </Select>
          </FormControl>}
    
          <FormControl variant="standard" sx={{width : '30%'}}>
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
              {selectedCourse && batchData && batchData.map((data)=>{
                  if(data.Course === selectedCourse){
                    return(
                      <MenuItem value={data.BatchName}>{data.BatchName}</MenuItem>
                    )
                  }
                })
              }
              {selectedCourse && <MenuItem value="All">All Batches</MenuItem>}
            </Select>
          </FormControl>
        </Box>
      )
}

export default SelectOptions;