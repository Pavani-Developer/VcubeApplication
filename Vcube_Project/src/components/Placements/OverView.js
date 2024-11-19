import React, { useContext, useEffect, useState } from 'react';
import { Box, Card, Typography } from '@mui/material';
import ProgressBar from '../dashboard/ProgressBar';
import { BadgeRounded, GroupsRounded, ScheduleRounded, SchoolRounded, WorkRounded } from '@mui/icons-material';
import { StudentsContext } from '../api/students';

const OverView = ({ selectedCourse, selectedBatch, handleShowSnackbar, refresh }) => {
  const { fetchStudentsData } = useContext(StudentsContext);
  const [studentsData, setStudentsData] = useState([]);
  const [totalStd, setTotalStd] = useState(0);

  const fetchStdData = async()=>{
    const stdData = await fetchStudentsData(selectedCourse);
    if(stdData && stdData.message){
      handleShowSnackbar('error',stdData.message);
    }else{
        setTotalStd(stdData && Array.isArray(stdData) && stdData.filter((data)=>JSON.parse(data.Personal_Info).BatchName === selectedBatch || selectedBatch === 'All').length || 0);
        const std_Data = Array.isArray(stdData) && stdData.length > 0 && stdData.filter(data=>(
          typeof data.Personal_Info !== 'object' && typeof data.Educational_Info !== 'object' && data.Placement_Info !== 'object' &&
            (JSON.parse(data.Personal_Info).BatchName === selectedBatch || selectedBatch === 'All')
            && JSON.parse(data.Personal_Info).Course === selectedCourse
        ))
      setStudentsData(std_Data);
    }
  };

  useEffect(()=>{
      if(selectedCourse && selectedBatch)fetchStdData();
  },[selectedCourse, selectedBatch, refresh])

  const getYearGapCnt = () => {
    const data = Array.isArray(studentsData) && studentsData.filter(data=> (typeof data.Educational_Info !== 'object') &&
                (parseInt(JSON.parse(data.Educational_Info).SSC_Passed_Year) - parseInt(JSON.parse(data.Educational_Info).Inter_Start_Year) !== 0 || 
                JSON.parse(data.Educational_Info).Inter_Passed_Year - parseInt(JSON.parse(data.Educational_Info).Degree_Start_Year) !== 0 || 
                (JSON.parse(data.Educational_Info).PG_Specialization && parseInt(JSON.parse(data.Educational_Info).Degree_Passed_Year) - parseInt(JSON.parse(data.Educational_Info).PG_Start_Year) !== 0)));
    return data.length;
  };

    const cards = [{
        Icon : <GroupsRounded sx={{fontSize : '30px', color : '#fff'}} />,
        Title : 'Total Students',
        Title_Count : (Array.isArray(studentsData) && studentsData.length),
        L_G1 : '#3a3a40',
        L_G2 : '#232324',
        Percentage: totalStd === 0  ? 0 : ((Array.isArray(studentsData) && studentsData.length) / totalStd) * 100,
      },{
        Icon : <SchoolRounded sx={{fontSize : '30px', color : '#fff'}} />,
        Title : 'Pursuing',
        Title_Count : Array.isArray(studentsData) && studentsData.
                      filter(data=> (typeof data.Educational_Info === 'object') ? 0 : 
                      data.Educational_Info && JSON.parse(data.Educational_Info).PG_Specialization ? 
                      JSON.parse(data.Educational_Info).PG_Passed_Year === 'Currently Pursuing' || JSON.parse(data.Placement_Info).Experience === 'Pursuing Studies' : 
                      JSON.parse(data.Educational_Info).Degree_Passed_Year === 'Currently Pursuing'  || JSON.parse(data.Placement_Info).Experience === 'Pursuing Studies').length || 0,
        L_G1 : '#ef6559',
        L_G2 : '#f44334',
        Percentage : (()=>{
          const len = Array.isArray(studentsData) && studentsData.
              filter(data=> (typeof data.Educational_Info === 'object') ? 0 : 
              data.Educational_Info && JSON.parse(data.Educational_Info).PG_Specialization ? 
              JSON.parse(data.Educational_Info).PG_Passed_Year === 'Currently Pursuing' || JSON.parse(data.Placement_Info).Experience === 'Pursuing Studies' : 
              JSON.parse(data.Educational_Info).Degree_Passed_Year === 'Currently Pursuing'  || JSON.parse(data.Placement_Info).Experience === 'Pursuing Studies').length || 0;
          return len === 0 ? 0 : (len / (Array.isArray(studentsData) && studentsData.length)) * 100 || 0;
        })(),
      },{
        Icon : <BadgeRounded sx={{fontSize : '30px', color : '#fff'}} />,
        Title : 'Freshers',
        Title_Count : Array.isArray(studentsData) && studentsData.filter(data=>JSON.parse(data.Placement_Info).Experience === 'Fresher').length || 0,
        L_G1 : '#4099ee',
        L_G2 : '#227be9',
        Percentage : (()=>{
          const len = Array.isArray(studentsData) && studentsData.filter(data=>JSON.parse(data.Placement_Info).Experience === 'Fresher').length || 0;
          return len === 0 ? 0 : (len / (Array.isArray(studentsData) && studentsData.length)) * 100 || 0;
        })()
      },{
        Icon : <WorkRounded sx={{fontSize : '30px', color : '#fff'}} />,
        Title : 'Experienced',
        Title_Count : Array.isArray(studentsData) && studentsData.filter(data=>JSON.parse(data.Placement_Info).Experience !== 'Fresher' && JSON.parse(data.Placement_Info).Experience !== 'Pursuing Studies').length || 0,
        L_G1 : '#61b665',
        L_G2 : '#4ca650', 
        Percentage : (()=>{
          const len = Array.isArray(studentsData) && studentsData.filter(data=>JSON.parse(data.Placement_Info).Experience !== 'Fresher' && JSON.parse(data.Placement_Info).Experience !== 'Pursuing Studies').length || 0;
          return len === 0 ? 0 : (len / (Array.isArray(studentsData) && studentsData.length)) * 100 || 0;
        })()
      },{
        Icon : <ScheduleRounded sx={{fontSize : '30px', color : '#fff'}} />,
        Title : 'Year Gap',
        Title_Count : getYearGapCnt(),
        L_G1 : '#e93a76',
        L_G2 : '#dc3570',
        Percentage : getYearGapCnt() === 0 ? 0 : (getYearGapCnt() / (Array.isArray(studentsData) && studentsData.length)) * 100
      }];


  return (
    <Box className='w-screen h-32 mt-7 flex items-center justify-evenly'>
        {cards.map((card)=><Card className='relative w-[17%] h-[95%] flex flex-col items-start pt-3 pb-6 justify-between' 
            sx={{overflow : 'visible', borderRadius : '10px', transition : '0.3s ease-in-out',
              boxShadow: '0px 0px 5px rgba(0,0,0,0.5)',
        }}>
            <Box className='flex items-start justify-between w-full'>
            <Box className='flex flex-col items-start justify-center h-[90%] ml-3'>
                <Typography variant='h6'>{card.Title}</Typography>
                <Typography variant='h6' sx={{fontWeight : 'bold', marginBottom : '10px'}}>{card.Title_Count < 10 ? `0${card.Title_Count}` : card.Title_Count}</Typography>
            </Box>
            <Box className='w-14 h-14 border-[1px] rounded-full mr-3 flex items-center justify-center' 
                sx={{background : `linear-gradient(${card.L_G1}, ${card.L_G2})`, border : 'none', boxShadow : '0 0 5px rgba(0,0,0,0.5)'}}>
                {card.Icon}
            </Box>
            </Box>
            <Typography color='green' className='w-full text-start pl-3' sx={{fontSize : '14px', marginBottom : '2px'}}>{card.Percentage < 10 ? `0${Math.floor(card.Percentage)}` : Math.floor(card.Percentage)}%</Typography>
            <ProgressBar value={Math.floor(parseInt(card.Percentage))} color={card.L_G2} />
        </Card>)}
    </Box>
  )
}

export default OverView;