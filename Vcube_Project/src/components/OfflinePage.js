import React from 'react';
import { Box, Typography } from '@mui/material';
import { WifiOffRounded } from '@mui/icons-material';

const OfflinePage = () => {
  return (
    <Box className='w-screen h-screen flex flex-col items-center justify-center'>
        <WifiOffRounded color='action' sx={{fontSize : '200px'}} />
        <Typography variant='h4' color='grey' sx={{margin : '20px 0'}}>
            Oops! Looks like you’re offline.
        </Typography>
        <Typography color='grey' variant='h6' >Check your internet connection and try again.</Typography>
    </Box>
  )
}

export default OfflinePage;