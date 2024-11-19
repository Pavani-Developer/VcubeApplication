import React, { useContext, useEffect, useState } from 'react';
import { Box, Dialog, DialogContent, DialogTitle, Divider, IconButton, Typography } from '@mui/material';
import { CloseRounded, LeaderboardRounded, StarRounded } from '@mui/icons-material';
import { StudentsContext } from '../api/students';

const LeaderboardResults = ({ isOpen, setIsOpen, stdId, course, batchName, handleShowSnackbar, setIsLoading, batchAttendanceData }) => {
    const { getStudentAttendanceByCourse, fetchStudentsData, fetchAssignmentResults } = useContext(StudentsContext);
    const [studentData, setStudentData] = useState([]);
    const [topStdData, setTopStdData] = useState([]);
    const [selfData, setSelfData] = useState([]);
    const [isSelf, setIsSelf] = useState(false);
    const types = ['Class', 'Mock Test', 'Interview'];

    const fetchStdData = async () => {
        const cnt = Array.isArray(batchAttendanceData) ? batchAttendanceData.filter(batch => (types.includes(batch.Attendance_Type))).length : 0;
        if(cnt < 1)return;
        const res = await fetchStudentsData(course);
        if (res && res.message){
            handleShowSnackbar('error',`Error occured while fetching data. Please try again later. ${res.message}`);
        }else if(res){
            const filtered = Array.isArray(res) ? res.filter((data)=>data.Course === course && data.BatchName === batchName) : [];
            fetchStdAttData(filtered, cnt);
        }
    }

    const fetchStdAttData = async (stdData, batchCnt) => {
        setIsLoading(true);
        const res = await getStudentAttendanceByCourse(course);
        const results = await fetchAssignmentResults();
        if ((res && res.message) || (results && results.message)){
            if(res && res.message)handleShowSnackbar('error',`Error occured while fetching data. Please try again later. ${res.message}`);
            if(results && results.message)handleShowSnackbar('error',`Failed to get Weekly Test Score. ${res.message}`);
        }else if(res && results){
            setStudentData([]);
            const std_Data_Arr = [];
            Array.isArray(stdData) && stdData.forEach((std)=>{
                let cnt = 0;
                Array.isArray(res) && res.forEach((att)=>{
                    if(std.id === att.StudentId && std.BatchName === att.BatchName && std.Course === att.Course &&
                    att.Name === `${std.Name}~${std.Phone}` && types.includes(att.Attendance_Type))cnt++;
                })
                const score = cnt > 0 && batchCnt > 0 ? Math.floor((cnt / batchCnt) * 100) : 0;
                const scoreData = Array.isArray(results) && results.filter((result)=>(
                    result.StudentId === std.id && result.Name === `${std.Name}~${std.Phone}`
                  ))
                const total = scoreData.reduce((accumulator, data) => {
                    return accumulator + parseInt(data.Score, 10);
                }, 0);
                const totalScore = (total > 0 && scoreData.length > 0 ? Math.floor((total / (scoreData.length * 100)) * 100) : 0);
                const scorePercentage = Math.floor(((score + totalScore) / 200) * 100);
                std_Data_Arr.push({
                    Image: JSON.parse(std.Personal_Info).Image,
                    Name: std.Name,
                    Score: scorePercentage,
                    Self : stdId === std.id
                });
            });
            std_Data_Arr.sort((a, b) => b.Score - a.Score);
            const topData = std_Data_Arr.splice(0, 3);
            setStudentData(std_Data_Arr);
            setTopStdData(topData);
            const is_Self = Array.isArray(topData) ? topData.some(data => data.Self) : false;
            setIsSelf(is_Self);
            setSelfData(is_Self ? null : std_Data_Arr.find(data => data.Self));
        }
        setIsLoading(false);
    }
    
    useEffect(() => {
        fetchStdData();
    }, [isOpen]);

  return (
    <Dialog open={isOpen} sx={{zIndex : '700'}}>
        <img src='/images/V-Cube-Logo.png' width='16%' className='ml-[42%]' />
        <IconButton sx={{position : 'absolute'}} className='top-1 right-1' onClick={()=>setIsOpen(false)}>
            <CloseRounded fontSize='large' />
        </IconButton>
        <DialogTitle variant='h5' className='flex items-center'>
            Leaderboard 
            <LeaderboardRounded fontSize='medium' sx={{marginLeft : '10px'}} />
        </DialogTitle>
        {Array.isArray(studentData) && studentData.length > 0 && Array.isArray(topStdData) && topStdData.length === 3 && topStdData.every(data => data.Score > 0) ? 
        <DialogContent className='w-full h-[40rem] flex flex-col items-center justify-start'>
            <Box className='flex items-end justify-evenly w-full h-1/2'>
                {Array.isArray(topStdData) && topStdData.length > 0 ? [16,32,24].map((no,index)=>
                        <Box key={index} className={`relative w-16 h-${no} ${index === 0 ? 'bg-[#d5d5d5]' : index === 1 ? 'bg-[#ffdc69]' : 'bg-[#ffd1b8]'} rounded-md pt-3`}>
                            <Box className={`absolute w-full h-28 -top-28 flex flex-col items-center justify-evenly`}>
                                {index === 1 && <img src='/images/crown.png' width='50px' alt='' className='absolute -top-9' />}
                                {<img src={topStdData[index === 0 ? 2 : index - 1].Image} alt='' width='50px' className='h-[50px] rounded-full object-contain border-[1px] border-slate-300' />}
                                <Typography variant='span' sx={{fontSize : '12px'}} className='w-56 text-center'>{topStdData[index === 0 ? 2 : index - 1].Name}</Typography>
                                <Typography className='flex items-center'><StarRounded sx={{color : '#f6af39'}} /> {topStdData[index === 0 ? 2 : index - 1].Score}</Typography>
                            </Box>
                            <Typography color='white' variant='h5' className='w-full text-center'>{index === 0 ? 3 : index}</Typography>
                        </Box>
                    ) : <></>}
            </Box>

            <Box className='w-full h-[55%] border-2 mt-1 rounded-md overflow-hidden'>
                <Box className='w-full h-[8%] flex items-center justify-between'>
                    {[15,70,15].map((no,index)=>(
                        <Typography key={index} className={`w-[${no}%] h-full flex items-center' ${index === 1 ? 'justify-start pl-14' : 'justify-center'}`} sx={{fontWeight : 'bold'}}>
                            {index === 0 ? 'Rank' : index === 1 ? 'Name' : 'Score'}
                        </Typography>
                    ))}
                </Box>
                <Divider/>
                <Box className={`w-full overflow-auto`} sx={{height : isSelf ? '90%' : '78%', scrollbarWidth : 'none'}}>
                    {Array.isArray(studentData) && studentData.length > 0 ? studentData.map((data,index)=>(
                    !data.Self && <>
                    <Box className={`w-full flex items-center justify-between`} sx={{height : isSelf ? '15%' : '16%'}}>
                    <Typography className='w-[15%] text-center'>{index + 4}</Typography>
                    <Typography className='w-[70%] text-start flex items-center pl-2'>
                        <img src={data.Image} alt='' width='30px' className='h-[30px] mr-5 rounded-full object-contain border-[1px] border-slate-300' />
                        <Typography variant='span'>{data.Name}</Typography>
                    </Typography>
                    <Typography className='w-[15%] text-center'>{data.Score}</Typography>
                    </Box>
                    <Divider/>
                    </>)) : <></>}
                </Box>
                {!isSelf && selfData ? 
                <Box className='w-full h-[15%]'>
                    <Box className='w-full h-full flex items-center justify-between bg-[#1976d2] text-white'>
                        <Typography className='w-[15%] text-center'>{Array.isArray(studentData) && studentData.length > 0 ? studentData.findIndex(data => data.Self) + 4 : undefined}</Typography>
                        <Typography className='w-[70%] text-start flex items-center pl-2'>
                            <img src={selfData.Image} alt='' width='30px' className='h-[30px] mr-5 bg-white rounded-full object-contain border-[1px] border-slate-300' />
                            <Typography variant='span'>{selfData.Name}</Typography>
                        </Typography>
                        <Typography className='w-[15%] text-center'>{selfData.Score}</Typography>
                    </Box>
                </Box> : <></>}
            </Box>
        </DialogContent>
        :
        <DialogContent className='w-full h-[40rem] flex flex-col items-center justify-center'>
            <>
                <img src='/images/hourGlass.gif' alt='' width='70%' />
                <Typography color='grey' variant='h6' className='text-center'>
                    We’ll have the Leaderboard results ready for you soon after your classes and attendance begin!
                </Typography>
            </>
        </DialogContent>}
    </Dialog>
  )
}

export default LeaderboardResults