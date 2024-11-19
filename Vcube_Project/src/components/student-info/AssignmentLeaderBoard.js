import React, { useContext, useEffect, useState } from 'react';
import { Avatar, Box, Divider, FormControl, InputLabel, MenuItem, Select, Typography } from '@mui/material';
import { HourglassFullRounded, LeaderboardRounded, StarRounded } from '@mui/icons-material';
import { StudentsContext } from '../api/students';

const AssignmentLeaderBoard = ({ stdId, name, phone, course, batchName, nearestDate, handleShowSnackbar, setIsLoading, liveWeeklyDataDate }) => {
    const { fetchAssignmentResults } = useContext(StudentsContext);
    const [topStudents, setTopStudents] = useState([]);
    const [studentData, setStudentData] = useState([]);
    const [self, setSelf] = useState(false);
    const [selfData, setSelfData] = useState(null);
    const [selectedDate, setSelectedDate] = useState(nearestDate);
    const [uniqueDates, setUniqueDates] = useState([]);

    const fetchData = async () => {
        setIsLoading(true);
        const res = await fetchAssignmentResults();
        if (res && res.message){
            handleShowSnackbar('error','Failed to get data. Please try again later.');
        }else{
            const uniqueDates = Array.isArray(res) ? [...new Set(res.map(entry => entry.Date))] : null;
            if(liveWeeklyDataDate && !hasTwoHoursPassed())uniqueDates.push(nearestDate);
            if(uniqueDates)setUniqueDates(uniqueDates);
            const data = Array.isArray(res) && res.filter((data)=>
                data.Course === course &&
                data.BatchName === batchName &&
                data.Date === selectedDate)
            const sortedData = sortStudents(data);
            const sliced = sortedData.splice(0,3);
            setTopStudents(sliced);
            const isSelf = sliced ? sliced.some((data)=>data.StudentId === stdId && data.Name === `${name}~${phone}`) : false;
            setSelf(isSelf);
            setSelfData(!isSelf ? sortedData.find((data)=>data.StudentId === stdId && data.Name === `${name}~${phone}`) : null);
            setStudentData(sortedData);
        }
        setIsLoading(false);
    }

    const sortStudents = (students) => {
        return students.sort((a, b) => {
            if (b.Score !== a.Score) {
                return b.Score - a.Score;
            } else {
                return a.Time - b.Time;
            }
        });
    }

    useEffect(()=>{
        fetchData();
    },[selectedDate])

    const hasTwoHoursPassed = () => {
        if (liveWeeklyDataDate){
            const targetDate = new Date(liveWeeklyDataDate);
            const currentDate = new Date();
            const difference = currentDate - targetDate;
            const oneHourInMillis = 2 * 60 * 60 * 1000;
            return difference >= oneHourInMillis;
        }else{
            return '';
        }
    }

  return (
    <>
    <FormControl sx={{position : 'absolute'}} className='top-48 right-10 w-1/5'>
        <InputLabel className='bg-white w-1/3 text-center rounded-md'>Select Date</InputLabel>
        <Select
            value={selectedDate}
            onChange={(e)=>setSelectedDate(e.target.value)}>
            {uniqueDates.map((date,index)=>(
                <MenuItem key={index} value={date}>{date}</MenuItem>
            ))}
        </Select>
    </FormControl>
    {(Array.isArray(studentData) && Array.isArray(topStudents) && studentData.length > 0 && topStudents.length > 0) ? 
    <Box className='w-full h-full border-2 rounded-lg flex flex-col items-center justify-start'>
        <Box className='flex items-end justify-evenly w-[40%] h-[50%]'>
            {Array.isArray(topStudents) && topStudents.length > 0 ? [16,32,24].map((no,index)=>
                <Box key={index} className={`relative w-16 h-${no} ${index === 0 ? 'bg-[#d5d5d5]' : index === 1 ? 'bg-[#ffdc69]' : 'bg-[#ffd1b8]'} rounded-md pt-3`}>
                    <Box className={`absolute w-full h-28 -top-28 flex flex-col items-center justify-evenly`}>
                        {index === 1 && <img src='/images/crown.png' width='50px' alt='' className='absolute -top-9' />}
                        {<img src={topStudents[index === 0 ? 2 : index - 1].Image} alt='' width='50px' className='h-[50px] rounded-full object-contain border-[1px] border-slate-300' />}
                        <Typography variant='span' sx={{fontSize : '12px'}} className='w-56 text-center'>{topStudents[index === 0 ? 2 : index - 1].Name.split('~')[0]}</Typography>
                        <Typography className='flex items-center'><StarRounded sx={{color : '#f6af39'}} /> {topStudents[index === 0 ? 2 : index - 1].Score}</Typography>
                    </Box>
                    <Typography color='white' variant='h5' className='w-full text-center'>{index === 0 ? 3 : index}</Typography>
                </Box>
            ) : <></>}
        </Box>
        <Box className='w-1/3 h-[55%] border-2 mt-2 mb-1 rounded-md overflow-hidden'>
            <Box className='w-full h-[8%] flex items-center justify-between'>
                {[15,70,15].map((no,index)=>(
                    <Typography key={index} className={`w-[${no}%] h-full flex items-center' ${index === 1 ? 'justify-start pl-14' : 'justify-center'}`} sx={{fontWeight : 'bold'}}>
                        {index === 0 ? 'Rank' : index === 1 ? 'Name' : 'Score'}
                    </Typography>
                ))}
            </Box>
            <Divider/>
            <Box className='w-full overflow-auto' sx={{height : self ? '90%' : '78%', scrollbarWidth : 'none'}}>
                {Array.isArray(studentData) && studentData.length > 0 ? studentData.map((data,index)=>(
                    studentData.findIndex((data)=>data.StudentId === stdId && data.Name === `${name}~${phone}`) !== index &&
                    <>
                    <Box className={`w-full h-[${self ? '15%' : '17%'}] flex items-center justify-between`}>
                    <Typography className='w-[15%] h-full flex items-center justify-center'>{index + 4}</Typography>
                    <Typography className='w-[70%] h-full text-start flex items-center pl-2'>
                        <img src={data.Image} alt='' width='30px' className='h-[30px] mr-5 rounded-full object-contain border-[1px] border-slate-300' />
                        <Typography variant='span'>{data.Name.split('~')[0]}</Typography>
                    </Typography>
                    <Typography className='w-[15%] h-full flex items-center justify-center'>{data.Score}</Typography>
                    </Box>
                    <Divider/>
                    </>
                )) : <></>}
            </Box>
            {!self && selfData !== null && selfData ? 
            <Box className='w-full h-[14%]'>
                <Box className='w-full h-full flex items-center justify-between bg-[#1976d2] text-white'>
                    <Typography className='w-[15%] text-center'>{Array.isArray(studentData) && studentData.length > 0 ? studentData.findIndex((data)=>data.StudentId === stdId && data.Name === `${name}~${phone}`) + 4 : undefined}</Typography>
                    <Typography className='w-[70%] text-start flex items-center pl-2'>
                        <img src={selfData.Image} alt='' width='30px' className='h-[30px] mr-5 bg-white rounded-full object-contain border-[1px] border-slate-300' />
                        <Typography variant='span'>{selfData.Name && selfData.Name.split('~')[0]}</Typography>
                    </Typography>
                    <Typography className='w-[15%] text-center'>{selfData.Score}</Typography>
                </Box>
            </Box> : <></>}
        </Box>
    </Box> 
    : 
    <Box className='w-full h-full border-2 rounded-lg flex flex-col items-center justify-center'>
        {liveWeeklyDataDate && liveWeeklyDataDate.split(' ')[0] === selectedDate && !hasTwoHoursPassed() ? 
        <>
        <img src='/images/hourGlass.gif' alt='' width='25%' />
        <Typography color='grey' variant='h6' className='text-center'>
            Stay tuned for your Leaderboard results,<br/>which will be available shortly after you complete your assignment! 
        </Typography>
        </>
        :
        <>
        <LeaderboardRounded sx={{fontSize : '150px', marginBottom : '30px'}} color='action' />
        <Typography color='grey' variant='h6' className='text-center'>
            No results found for the selected date.<br/>Try a different date or check back later!
        </Typography>
        </>
        }
    </Box>}
    </>
  )
}

export default AssignmentLeaderBoard;