import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Box, Accordion, AccordionDetails, AccordionSummary, Typography, IconButton, Dialog, DialogTitle, DialogActions, Button, Tooltip } from '@mui/material';
import { UserDetails } from '../UserDetails';
import { LoginContext } from '../api/login';
import { CourseContext } from '../api/Course';
import { CancelRounded, CheckCircleRounded, ReplayRounded } from '@mui/icons-material';

const Permissions = ({ handleShowSnackbar, setIsLoading }) => {
    const { fetchPermissionsData, patchPermissionsData } = useContext(LoginContext);
    const { fetchCourse } = useContext(CourseContext);
    const isUser = UserDetails('User');
    const [permissionData, setPermissionData] = useState(null);
    const [courseData, setCourseData] = useState(null);
    const [permission, setPermission] = useState(null);
    const [login, setLogin] = useState(null);
    const [expand, setExpand] = useState(-1);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        let res;

        if (isUser === 'Super Admin') {
            const re = await fetchCourse();
            if (!(re && re.message)) setCourseData(re);
            res = await fetchPermissionsData();
        } else {
            res = await fetchPermissionsData(UserDetails('Course'));
        }

        if (res && res.message) {
            handleShowSnackbar('error', res.message);
        } else {
            setPermissionData(res);
            console.log(res);
        }
        setIsLoading(false);
    }, [isUser, fetchPermissionsData, fetchCourse, setIsLoading, handleShowSnackbar]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const changeDetails = async () => {
        setIsLoading(true);
        const data = {
            id : login ? login.split('~')[0] : permission.split('~')[0],
        }
        login ? data['Login_Access'] = login.split('~')[1] === 'Access' ? 'Denied' : 'Access' :
        data['Edit_Access'] = permission.split('~')[1] === 'Access' ? 'Denied' : 'Access';
        setPermission(null);
        setLogin(null);
        const res = await patchPermissionsData(data);
        setIsLoading(false);
        if (res === true){
            handleShowSnackbar('success','Student Access changed successfully.')
        }else if (res && res.message){
            handleShowSnackbar('error',res.message);
        }
        fetchData();
    }

  return (
    <>
    <Tooltip arrow title='Refresh'><IconButton sx={{position : 'absolute'}} className='top-[6.5rem] right-1'><ReplayRounded onClick={fetchData} fontSize='large' /></IconButton></Tooltip>
    <Box className='relative max-h-[85%] p-1 overflow-y-auto rounded-md' sx={{scrollbarWidth : 'thin'}} >
        {isUser === 'Super Admin' ? 
        Array.isArray(courseData) && courseData.map((course,index)=>
        Array.isArray(permissionData) && permissionData.some(permission=>permission.Course === course.Course) &&
        <Accordion className='border-[1px] w-[90%]' key={index} expanded={expand === index} onChange={()=>setExpand(expand === index ? null : index)} >
            <AccordionSummary>{course.Course}</AccordionSummary>
            {Array.isArray(permissionData) && permissionData.map((data)=>
            <AccordionDetails key={index}>
                <Typography variant='h6'>{data.BatchName}</Typography>
                <Typography className='flex items-center justify-start'>Student Edit Access
                    <Box className={`ml-10 relative w-10 h-5 ${(data.Edit_Access === 'Access') ? 'bg-[#1976d2]' : 'bg-gray-400'} rounded-full flex items-center`}>
                        <IconButton className={`absolute ${(data.Edit_Access === 'Access') ? 'left-[0.65rem]' : 'left-[-0.60rem]'}`} sx={{transition : '0.3s ease-in-out', zIndex : '10', marginBottom : '0.80px'}} 
                            onClick={()=>{setLogin(null);setPermission(`${data.id}~${data.Edit_Access}`)}}>
                            {data.Edit_Access === 'Access' ? (<CheckCircleRounded sx={{width : '1.40rem', height : '1.40rem', color : '#fff'}} />) : 
                            (<CancelRounded sx={{width : '1.40rem', height : '1.40rem', color : '#fff'}} />)}
                        </IconButton>
                    </Box>
                </Typography>
                <Typography className='flex items-center justify-start' sx={{marginTop : '10px'}} >Student Login Access
                    <Box className={`ml-7 relative w-10 h-5 ${(data.Login_Access === 'Access') ? 'bg-[#1976d2]' : 'bg-gray-400'} rounded-full flex items-center`}>
                        <IconButton className={`absolute ${(data.Login_Access === 'Access') ? 'left-[0.70rem]' : 'left-[-0.55rem]'}`} sx={{transition : '0.3s ease-in-out', zIndex : '10', marginBottom : '0.80px'}} 
                            onClick={()=>{setPermission(null);setLogin(`${data.id}~${data.Login_Access}`)}}>
                            {data.Login_Access === 'Access' ? (<CheckCircleRounded sx={{width : '1.40rem', height : '1.40rem', color : '#fff'}} />) : 
                            (<CancelRounded sx={{width : '1.40rem', height : '1.40rem', color : '#fff'}} />)}
                        </IconButton>
                    </Box>
                </Typography>
            </AccordionDetails>)} 
        </Accordion>) :
        <Accordion expanded>
            <AccordionSummary>{UserDetails('Course')}</AccordionSummary>
            {Array.isArray(permissionData) && permissionData.map((data,index)=>
            <AccordionDetails key={index}>
                <Typography variant='h6'>{data.BatchName}</Typography>
                <Typography className='flex items-center justify-start'>Student Edit Access
                    <Box className={`ml-10 relative w-10 h-5 ${(data.Edit_Access === 'Access') ? 'bg-[#1976d2]' : 'bg-gray-400'} rounded-full flex items-center`}>
                        <IconButton className={`absolute ${(data.Edit_Access === 'Access') ? 'left-[0.65rem]' : 'left-[-0.60rem]'}`} sx={{transition : '0.3s ease-in-out', zIndex : '10', marginBottom : '0.80px'}} 
                            onClick={()=>{setLogin(null);setPermission(`${data.id}~${data.Edit_Access}`)}}>
                            {data.Edit_Access === 'Access' ? (<CheckCircleRounded sx={{width : '1.40rem', height : '1.40rem', color : '#fff'}} />) : 
                            (<CancelRounded sx={{width : '1.40rem', height : '1.40rem', color : '#fff'}} />)}
                        </IconButton>
                    </Box>
                </Typography>
                <Typography className='flex items-center justify-start' sx={{marginTop : '10px'}} >Student Login Access
                    <Box className={`ml-7 relative w-10 h-5 ${(data.Login_Access === 'Access') ? 'bg-[#1976d2]' : 'bg-gray-400'} rounded-full flex items-center`}>
                        <IconButton className={`absolute ${(data.Login_Access === 'Access') ? 'left-[0.70rem]' : 'left-[-0.55rem]'}`} sx={{transition : '0.3s ease-in-out', zIndex : '10', marginBottom : '0.80px'}} 
                            onClick={()=>{setPermission(null);setLogin(`${data.id}~${data.Login_Access}`)}}>
                            {data.Login_Access === 'Access' ? (<CheckCircleRounded sx={{width : '1.40rem', height : '1.40rem', color : '#fff'}} />) : 
                            (<CancelRounded sx={{width : '1.40rem', height : '1.40rem', color : '#fff'}} />)}
                        </IconButton>
                    </Box>
                </Typography>
            </AccordionDetails>)}
        </Accordion>}
    </Box>
    <Dialog open={login || permission} sx={{zIndex : '900'}} >
        <DialogTitle>Are you sure you want to change Student {login ? 'Login' : 'Edit'} Access ?</DialogTitle>
        <DialogActions>
            <Button variant='outlined' onClick={()=>{setPermission(null);setLogin(null)}} >Cancel</Button>
            <Button variant='contained' onClick={changeDetails} >Confirm</Button>
        </DialogActions>
    </Dialog>
    </>
  )
}

export default Permissions;