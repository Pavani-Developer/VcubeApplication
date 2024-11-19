import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Help } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const PageNotFound = () => {
    const navigate = useNavigate();
  return (
    <Box className="w-screen h-screen flex flex-col items-center justify-center">
        <Help sx={{fontSize : '200px', color : '#6394ca'}}/>
        <Typography variant='h4' sx={{fontWeight : 'bold', margin : '1.5%'}}>Page Not Found</Typography>
        <Typography variant='h6' sx={{marginTop : '0%'}}>Oops! we couldn't find the page that your looking for.</Typography>
        <Typography variant='h6' sx={{margin : '0%'}}>Please check the address and try again.</Typography>
        <Typography variant='h6'>or</Typography>
        <Typography variant='h6' sx={{margin : '0% 0 5% 0'}}>You can try this link to get <Button variant="text" sx={{fontSize : '18px', textDecoration : 'underline'}} onClick={()=>navigate('/vcube/login')}>login / Dashboard</Button></Typography>
        <Typography variant='h5'><strong>Error Code :</strong> 404</Typography>
    </Box>
  )
}

export default PageNotFound;