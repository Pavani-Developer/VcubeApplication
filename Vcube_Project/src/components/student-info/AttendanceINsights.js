import React, { useContext, useEffect, useState } from 'react';
import { LineChart } from '@mui/x-charts';
import { Box, Button, FormControl, IconButton, InputLabel, MenuItem, Select, Tooltip } from '@mui/material';
import { StudentAttendanceCalendar } from './AddAtendanceCalender';
import { CalendarMonthRounded, ChecklistRounded } from '@mui/icons-material';
import { StudentsContext } from '../api/students';

const AttendanceINsights = ({ batchAttendanceData, stdAttendanceData, selectedYear, setSelectedYear, JoiningDate, stdId, handleShowSnackbar, name, phone }) => {
  const { fetchStudentWatchTimeData, fetchAssignmentResults } = useContext(StudentsContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const [month, setMonth] = useState(null);
  const [batchDays, setBatchDays] = useState([]);
  const [studentDays, setStudentDays] = useState([]);
  const [stdMonthDates, setStdMonthDates] = useState([]);
  const [batchMonthDates, setBatchMonthDates] = useState([]);
  const [attType, setAttType] = useState(null);
  const [selectedValue, setSelectedValue] = useState(0);
  const [watch_Time_Arr, setWatch_Time_Arr] = useState([]);
  const [moctTestScore, setMockTestScore] = useState([{}]);

  const xLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const years = []
  for(let year = 2021; year <= new Date().getFullYear(); year++){years.push(year)}

  const generateMonthYearRangeUntilToday = (startDateStr) => {
    const startDate = new Date(startDateStr);
    const endDate = new Date();

    endDate.setDate(1);
    endDate.setMonth(endDate.getMonth() + 1);

    const monthYearList = [];

    let currentDate = new Date(startDate);
    while (currentDate < endDate) {
        const month = currentDate.toLocaleString('en-US', { month: 'short' });
        const year = currentDate.getFullYear();
        monthYearList.push(`${month}-${year}`);
        currentDate.setMonth(currentDate.getMonth() + 1);
    }
    return monthYearList;
  };

  const getDatesData = () => {
    if(attType === 'Watch Time'){
      getWatchTime();
      return;
    }
    const stdData = Array.isArray(stdAttendanceData) && stdAttendanceData.filter(data=>data.Date.split('-')[2] === `${selectedYear}` && attType === 'Assignment' ? data.Attendance_Type.split('~')[0] === attType : data.Attendance_Type === attType);
    const batchData = Array.isArray(batchAttendanceData) && batchAttendanceData.filter(data=>data.Date.split('-')[2] === `${selectedYear}` && data.Attendance_Type === attType);

    if (attType === 'Mock Test'){
      getMoctTestScore();
    }

    setStudentDays([]);
    xLabels.forEach((month)=>{
      let cnt = 0;
      Array.isArray(stdData) && stdData.forEach((std)=>{
        if(std.Date.split('-')[1] === month && std.Date.split('-')[2] === selectedYear.toString() && (attType === 'Assignment' ? std.Attendance_Type.split('~')[0] : std.Attendance_Type) === attType)cnt++;
      })
      setStudentDays((pre)=>[...pre,cnt]);
    })

    setBatchDays([]);
    xLabels.forEach((month, index)=>{
      let cnt = 0;
      Array.isArray(batchData) && batchData.forEach((batch)=>{
        if(batch.Date.split('-')[1] === month && batch.Date.split('-')[2] === selectedYear.toString() && batch.Attendance_Type === attType)cnt++;
      })
      attType === 'Assignment' && generateMonthYearRangeUntilToday(JoiningDate).includes(`${month}-${selectedYear}`) ? setBatchDays((pre)=>[...pre,monthDays[index]]) : setBatchDays((pre)=>[...pre,cnt]);
    })

    setBatchMonthDates([]);
    xLabels.forEach((month)=>{
      let months = [];
      batchData.forEach((batch)=>{
        if(batch.Date.split('-')[1] === month && batch.Date.split('-')[2] === selectedYear.toString() && batch.Attendance_Type === attType)months.push(batch.Date.split('-')[0]);
      })
      setBatchMonthDates((pre)=>[...pre, months])
    })

    setStdMonthDates([]);
    xLabels.forEach((month)=>{
      let months = [];
      Array.isArray(stdData) && stdData.forEach((std)=>{
        if(std.Date.split('-')[1] === month && std.Date.split('-')[2] === selectedYear.toString() && (attType === 'Assignment' ? std.Attendance_Type.split('~')[0] : std.Attendance_Type) === attType)months.push(std.Date.split('-')[0]);
      })
      setStdMonthDates((pre)=>[...pre, months])
    })
  }

  useEffect(()=>{
    getDatesData();
  },[selectedYear])

  const getWatchTime = async () => {
    setStdMonthDates([]);
    setStudentDays([]);
    setBatchDays([]);
    setBatchMonthDates([]);
    setWatch_Time_Arr([]);
    const data = await fetchStudentWatchTimeData(stdId);
    if(data && data.message){
      handleShowSnackbar('error',`An error occured ${data.message}`);
    }else if(data){
      xLabels.forEach((month)=>{
        let months = [];
        Array.isArray(data) && data.forEach((w_t_data)=>{
          if(w_t_data.Name === `${name}~${phone}` && `${w_t_data.Date.split('-')[1]}-${w_t_data.Date.split('-')[2]}` === `${month}-${selectedYear}`){
            months.push(w_t_data.Date.split('-')[0]);
            setWatch_Time_Arr((pre)=>({...pre, [w_t_data.Date.split('-')[0]] : w_t_data.WatchTime}))
          }
        })
      setStdMonthDates((pre)=>[...pre, months])
      setStudentDays((pre)=>[...pre,months.length]);
      setBatchDays((pre)=>[...pre,months.length]);
      })
    }
  }

  const getMoctTestScore = async () => {
    setMockTestScore([{}]);
    const res = await fetchAssignmentResults(stdId);
    if(res && res.message){
      handleShowSnackbar('error',`Failed to get Weekly Test Score. ${res.message}`);
    }else{
      xLabels.forEach((month)=>{
        Array.isArray(res) && res.forEach((data)=>{
          if(data.Name === `${name}~${phone}` && data.StudentId === stdId &&
            `${data.Date.split('-')[1]}-${data.Date.split('-')[2]}` === `${month}-${selectedYear}`){
              setMockTestScore(prevScores => {
                const updatedScores = [...prevScores];
                if (!updatedScores[0]) {
                    updatedScores[0] = {};
                }
                if (!updatedScores[0][month]) {
                    updatedScores[0][month] = {};
                }
                const day = data.Date.split('-')[0];
                updatedScores[0][month][parseInt(day)] = data.Status === 'Disqualified' ? data.Status : data.Score;
                return updatedScores;
            });
          }
        })
      })
    }
  }

  const handleClick = (event,idx,value) => {
    setMonth(`${xLabels[idx]}~${monthDays[idx]}~${idx}`);
    setAnchorEl(event.currentTarget);
    setSelectedValue(value);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

    return (
      <Box className="w-full mt-10 flex flex-col items-center justify-around">
        <LineChart
          xAxis={[{ scaleType: 'point', data: xLabels }]}
          series={[
            {
              data: (Array.isArray(studentDays) && studentDays.length > 0) ? studentDays : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              area: true,
              label : `Detailed ${selectedYear || ''} ${attType || ''} Attendance Analysis.`,
            },
          ]}
          width={950}
          height={300}
        />
      {selectedYear && <Box className='w-[900px] -mt-5 flex flex-row items-center justify-between mb-10'>
        {Array.isArray(batchDays) && batchDays.map((value,index)=>(
          <Tooltip title='View Monthly Attendance Calendar' arrow>
            <IconButton key={index} onClick={(e)=>handleClick(e,index,value)} sx={{width : '40px',height : '40px',display : 'flex', alignItems : 'center', justifyContent : 'center'}} color='primary'>{value}</IconButton>
          </Tooltip>))}
      </Box>}
      <Box className='w-[80%] flex flex-row items-center justify-evenly mt-5'>
      <Box className='w-[30%] flex flex-row items-center justify-between'>
          <ChecklistRounded sx={{fontSize : '30px', marginTop : '15px', color : 'grey'}}/>
          <FormControl className='w-[87%]' variant='standard'>
            <InputLabel>Select Attendance Type*</InputLabel>
            <Select
              value={attType}
              onChange={(e)=>{setAttType(e.target.value);}}>
              {['Class','Assignment','Watch Time','Weekly Test','Interview'].map(value=><MenuItem value={value === 'Weekly Test' ? 'Mock Test' : value}>{value}</MenuItem>)}
            </Select>
          </FormControl>
      </Box>
      <Box className='w-[30%] flex flex-row items-center justify-between'>
          <CalendarMonthRounded sx={{fontSize : '30px', marginTop : '15px', color : 'grey'}}/>
          <FormControl className='w-[87%]' variant='standard'>
            <InputLabel>Select Year*</InputLabel>
            <Select
              value={selectedYear}
              onChange={(e)=>{setSelectedYear(e.target.value);}}>
              {years.map(year=><MenuItem value={year}>{year}</MenuItem>)}
            </Select>
          </FormControl>
      </Box>
      <Button variant='contained' sx={{width : '20%', height : '40px', borderRadius : '20px'}} onClick={()=>{getDatesData()}}>Submit</Button>
      </Box>
      <StudentAttendanceCalendar 
          open={open} 
          id={id} 
          anchorEl={anchorEl} 
          setAnchorEl={setAnchorEl} 
          month={month} 
          year={selectedYear && selectedYear} 
          stdMonthDates={stdMonthDates} 
          batchMonthDates={batchMonthDates} 
          attType={attType} 
          selectedValue={selectedValue} 
          watch_Time_Arr={watch_Time_Arr}
          moctTestScore={moctTestScore} 
      />
    </Box>
    )
}

export default AttendanceINsights;