import React from 'react';
import { Box, Typography } from '@mui/material';

const SmallWindowPage = () => {
  return (
    <Box className='w-auto h-auto flex flex-col items-center justify-start'>
        <img src='/images/V-Cube-Logo.png' alt='' width='100px'  className='mb-20' />
        <img src='/images/small-screen-size.gif' alt='' />
        <Typography className='w-[90%] text-center' sx={{fontSize : '100%'}} color='grey'>
            This website is optimized for desktop screens to provide the best user experience.<br/>
            We recommend using a desktop or laptop for full functionality and an optimal viewing experience.
        </Typography>
    </Box>
  )
}

export default SmallWindowPage;