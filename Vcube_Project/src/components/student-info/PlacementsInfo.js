import React from 'react'
import { WorkRounded } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';

const PlacementsInfo = ({ student_Details }) => {
  
  return (
    <Box className='w-full h-full pt-5'>
      <Typography variant='h4' className='w-full flex items-center justify-center'><WorkRounded sx={{fontSize : '30px',marginRight : '10px'}} />Student Placements Requirements</Typography>
      <Box className="w-full h-[70%] mt-20 pl-10 pr-10">
        <Typography variant='h5' className='flex items-center'><strong>Skills : </strong><Typography sx={{marginLeft : '20px', fontSize : '18px'}}>{student_Details.Skills && student_Details.Skills.map(value=>value + ", ")}</Typography></Typography>
        <Box className='w-full grid grid-cols-2 gap-8 mt-10'>
          <Typography variant='h6' className='flex items-center'><strong>Employeement : </strong><Typography sx={{marginLeft : '10px', fontSize : '18px'}}>{student_Details.Employement}</Typography></Typography>
          <Typography variant='h6' className='flex items-center'><strong>Experience : </strong><Typography sx={{marginLeft : '10px', fontSize : '18px'}}>{student_Details.Experience}</Typography></Typography>
          <Typography variant='h6' className='flex items-center'><strong>Willing to Relocate : </strong><Typography sx={{marginLeft : '10px', fontSize : '18px'}}>{student_Details.Relocate && student_Details.Relocate.split(" ")[0]}</Typography></Typography>
          <Typography variant='h6' className='flex items-center'><strong>Relocate Locations : </strong><Typography sx={{marginLeft : '10px', fontSize : '18px'}}>{student_Details.Cities && student_Details.Cities.map(value=>value + ", ")}</Typography></Typography>
          <Typography variant='h6' className='flex items-center'><strong>Immediate Joiner : </strong><Typography sx={{marginLeft : '10px', fontSize : '18px'}}>{student_Details.Immediate_Jion}</Typography></Typography>
          <Typography variant='h6' className='flex items-center'><strong>Willing to work for Relational Shifts : </strong><Typography sx={{marginLeft : '10px', fontSize : '18px'}}>{student_Details.Shifts && student_Details.Shifts.split(" ")[0]}</Typography></Typography>
          <Typography variant='h6' className='flex items-center'><strong>Willing to work on Bond : </strong><Typography sx={{marginLeft : '10px', fontSize : '18px'}}>{student_Details.Bond === true ? 'Yes' : (student_Details.Bond === false) ? 'No' : 'N/A'}</Typography></Typography>
          <Typography variant='h6' className='flex items-center'><strong>Bond Duration : </strong><Typography sx={{marginLeft : '10px', fontSize : '18px'}}>{student_Details.Bond_Duration}</Typography></Typography>
          <Typography variant='h6' className='flex items-center'><strong>Willing to work for Internships : </strong><Typography sx={{marginLeft : '10px', fontSize : '18px'}}>{student_Details.Internship === true ? 'Yes' : (student_Details.Internship === false) ? 'No' : 'N/A'}</Typography></Typography>
          <Typography variant='h6' className='flex items-center'><strong>Type of Internship Oppurtunity : </strong><Typography sx={{marginLeft : '10px', fontSize : '18px'}}>{student_Details.Internship_Type}</Typography></Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default PlacementsInfo;