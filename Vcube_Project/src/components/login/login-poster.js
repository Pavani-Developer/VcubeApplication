import { Box } from '@mui/material';
import React from 'react'

const Poster = ({ isStudentLogin }) => {
  return (
    <Box className="w-1/2 flex flex-col justify-between items-center border-gray-300 border-r-[1px] relative overflow-hidden">
        <img className="w-36" src="/images/V-Cube-Logo.png" alt=''/>
        <img className={`w-full absolute bottom-0 ${(isStudentLogin) ? 'right-full' : 'right-0'} duration-[2000ms] ease-in-out`} src="/images/admin-login.gif" alt=''/>
        <img className={`w-full absolute bottom-0 ${(isStudentLogin) ? 'right-0' : '-right-full'} duration-[2000ms] ease-in-out`} src="/images/std-login-icon.png" alt=''/>
    </Box>
  )
}

export default Poster;