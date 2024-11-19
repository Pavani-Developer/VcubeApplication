import React from 'react';
import { Box, CircularProgress, Stack } from '@mui/material';

const LoadingSkeletonAlternate = () => {
    return (
        <Box className="absolute flex items-center justify-center w-screen h-screen top-0 left-0" sx={{background : 'rgba(255, 255, 255, 0.800)',zIndex : '1000'}}>
            <Stack className='flex items-center justify-center'>
            <img src="/images/V-Cube-Logo.png" alt='' width="10%" className='absolute' />
            <CircularProgress size={180} thickness={2} sx={{color : 'orange'}} />
            </Stack>
        </Box>
    );
}

export default LoadingSkeletonAlternate;