import React from 'react';
import { LinearProgress, Box } from '@mui/material';

const ProgressBar = ({ value, color }) => {
    return (
        <Box sx={{ width: '90%', marginLeft : '5%' }}>
            <LinearProgress 
                variant="determinate" 
                value={value} 
                sx={{ 
                    backgroundColor: '#e0e0e0',
                    '& .MuiLinearProgress-bar': {
                        backgroundColor: color || '#3f51b5',
                    },
                }} 
            />
        </Box>
    );
};

export default ProgressBar;
