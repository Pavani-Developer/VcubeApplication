import React, { useState } from 'react';
import { Box, Typography, Accordion, AccordionDetails, AccordionSummary } from '@mui/material';
import { LocalLibraryRounded, SchoolRounded } from '@mui/icons-material';

const EducationInfo = ({ student_Details }) => {
  const [view, setView] = useState(null);

  const data = [{
    Class : '10th Standard',
    School_Name : student_Details.SSC_College_Name,
    CGPA : student_Details.SSC_CGPA,
    Passout_Year : student_Details.SSC_Passed_Year,
  },{
    Class : '12th Standard',
    College_Name : student_Details.Inter_College_Name,
    Specialization : student_Details.Inter_Specialization,
    CGPA : student_Details.Inter_CGPA,
    From : student_Details.Inter_Start_Year,
    Passout_Year : student_Details.Inter_Passed_Year
  },{
    Class : 'Under Graduation',
    College_Name : student_Details.Degree_College_Name,
    Specialization : student_Details.Degree_Specialization,
    College_Place : student_Details.Degree_College_Place,
    CGPA : student_Details.Degree_CGPA,
    From : student_Details.Degree_Start_Year,
    Passout_Year : student_Details.Degree_Passed_Year
  }]
  const Pg_Data = {
      Class : 'PG',
      College_Name : student_Details.PG_College_Name,
      Specialization : student_Details.PG_Specialization,
      College_Place : student_Details.PG_College_Place,
      CGPA : student_Details.PG_CGPA,
      From : student_Details.PG_Start_Year,
      Passout_Year : student_Details.PG_Passed_Year
  }
  if(student_Details && student_Details.PG_Specialization)data.push(Pg_Data);

  return (
    <Box className='w-full h-full flex flex-col items-center'>
      <Typography variant='h4' className='flex items-center' sx={{margin : '20px 0 30px 0'}}><LocalLibraryRounded sx={{fontSize : '35px',margin : '0 10px 5px 0'}} />Student Education Details</Typography>
    {data.map((item,idx)=>(
        <Accordion expanded={view === idx} key={idx} onChange={()=>setView(view === idx ? null : idx)} className='w-full border-t-[1px] border-gray-300'>
          <AccordionSummary><SchoolRounded sx={{fontSize : '30px',marginRight : '10px'}} className='text-gray-500' /><Typography variant='h5'>{(idx === 0) ? '10th Standard' : (idx === 1) ? '12th Standard' : (idx === 2) ? 'Under Graduation' : 'PG'} Details</Typography></AccordionSummary>
          <AccordionDetails>
          <Box className="grid grid-cols-2 w-full gap-5">
          {Object.keys(item).map((key)=>(
            <Typography key={key} variant='h6' width='100%' className='flex items-center justify-between'><strong>{key.includes('_') ? key.replace('_',' ') : key}</strong> : <Typography width='70%' sx={{fontSize : '20px'}} >{item[key]}</Typography></Typography>
          ))}
           </Box>
          </AccordionDetails>
        </Accordion>
    ))}
    </Box>
  )
}

export default EducationInfo;