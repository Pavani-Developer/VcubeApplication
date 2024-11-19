import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Box, Accordion, AccordionDetails, AccordionSummary, DialogTitle, DialogActions, Dialog, Button, Typography, IconButton, DialogContent, Tooltip } from '@mui/material';
import { UserDetails } from '../UserDetails';
import { CourseContext } from '../api/Course';
import { LoginContext } from '../api/login';
import { CancelRounded, CheckCircleRounded, NoAccountsRounded, ReplayRounded } from '@mui/icons-material';

const Users = ({ handleShowSnackbar, setIsLoading }) => {
  const { fetchCourse } = useContext(CourseContext);
  const { fetchLoginData, userDelete, changeUserPermission } = useContext(LoginContext);
  const isUser = UserDetails('User');
  const [courseData, setCourseData] = useState(null);
  const [loginData, setLoginData] = useState(null);
  const [expand, setExpand] = useState(-1);
  const [user_Delete, setUser_Delete] = useState(null);
  const [user_Change, setUser_Change] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

    const fetchData = useCallback(async () => {
      setIsLoading(true);
      let res, re;

      if (isUser === 'Super Admin') {
          res = await fetchCourse();
          re = await fetchLoginData();
      } else {
          res = await fetchCourse(UserDetails('Course'));
          re = await fetchLoginData(UserDetails('Course'));
      }

      if ((res && res.message) || (re && re.message)) {
          handleShowSnackbar('error', 'Error while fetching data. Please try again later.');
      } else {
          setLoginData(re);
          const isData = Array.isArray(re) && re.some(data => data.Course === 'Placements');
          const data = isData ? [...res, { Course: 'Placements' }] : res;
          setCourseData(data);
      }

      setIsLoading(false);
  }, [isUser, fetchCourse, fetchLoginData, setIsLoading, handleShowSnackbar]);

  useEffect(() => {
      fetchData();
  }, [fetchData]);


  const changeDetails = async () => {
    setIsLoading(true);
    let data = {
      id : user_Delete ? user_Delete : user_Change.split('~')[0]
    }
    if(user_Change)data['Permission'] = user_Change.split('~')[1] === 'Access' ? 'Denied' : 'Access';
    let res;
    if (user_Delete){
      res = await userDelete(data);
    }else{
      res = await changeUserPermission(data);
    }
    setIsLoading(true);
    setUser_Change(null);
    setUser_Delete(null);
    data = {}
    fetchData();
    if (res === true){
      handleShowSnackbar('success',user_Delete ? 'User deleted successfully.' : 'User permission changed successfully.');
    }else{
      handleShowSnackbar('error',res.message);
    }
  }
  setIsLoading(false);
  
  return (
    <>
    <Tooltip arrow title='Refresh'><IconButton sx={{position : 'absolute'}} className='top-[6.5rem] right-1'><ReplayRounded onClick={fetchData} fontSize='large' /></IconButton></Tooltip>
    {Array.isArray(loginData) && loginData.length > 1 ? 
    <Box className='max-h-[85%] p-1 overflow-y-auto rounded-md' sx={{scrollbarWidth : 'thin'}} >
      {isUser === 'Super Admin' ? 
      Array.isArray(courseData) && courseData.map((data,index)=>
      (Array.isArray(loginData) && loginData.some((L_data)=>L_data.Course === data.Course) &&
       <Accordion key={index} expanded={expand === index} onChange={()=>setExpand(expand === index ? -1 : index)} >
        <AccordionSummary>{data.Course}</AccordionSummary>
        <Box className='grid grid-cols-4 mb-3'>
          {['Username','Email','Phone','Permission'].map((head,idx)=>(
          idx === 3 ? 
          <Box className='grid grid-cols-2 pr-5'>
            <Typography sx={{fontWeight : 'bold'}} color='primary' className='text-start' >Permission</Typography>
            <Typography sx={{fontWeight : 'bold'}} color='primary' className='text-center' >Delete</Typography>
          </Box> :
          <Typography sx={{fontWeight : 'bold', padding : '0 20px'}} color='primary'>{head}</Typography>
        ))}
        </Box>
        {Array.isArray(loginData) && loginData.map((L_data)=>
        L_data.Username !== UserDetails('All').Username && L_data.Course === data.Course &&
        <AccordionDetails className='grid grid-cols-4'>
          <Typography>{L_data.Username}</Typography>
          <Typography>{L_data.Email}</Typography>
          <Typography>{L_data.Phone}</Typography>
          <Box className='grid grid-cols-2 place-content-start'>
          <Box className={`ml-3 relative w-16 h-7 ${(L_data.Permission === 'Access') ? 'bg-[#1976d2]' : 'bg-gray-400'} rounded-full flex items-center`}>
              <IconButton className={`absolute ${(L_data.Permission === 'Access') ? 'left-[1.65rem]' : 'left-[-0.60rem]'}`} sx={{transition : '0.3s ease-in-out', zIndex : '10', marginBottom : '0.80px'}} 
                  onClick={()=>{setUser_Change(`${L_data.id}~${L_data.Permission}`);setOpenDialog(true)}}>
                  {L_data.Permission === 'Access' ? (<CheckCircleRounded sx={{width : '1.90rem', height : '1.90rem', color : '#fff'}} />) : 
                  (<CancelRounded sx={{width : '1.90rem', height : '1.90rem', color : '#fff'}} />)}
              </IconButton>
          </Box>
          <Button variant='contained' color='error' sx={{height : '30px'}} 
            onClick={()=>{setUser_Delete(L_data.id);setOpenDialog(true)}}>Delete</Button>
          </Box>
        </AccordionDetails>
      )}
      </Accordion>)) : 
      ((isUser === 'Admin' || isUser === 'Placements Admin') && Array.isArray(loginData) && loginData.some((L_data)=>L_data.Course === UserDetails('Course')) &&
       <Accordion>
        <AccordionSummary>{UserDetails('Course')}</AccordionSummary>
        <Box className='grid grid-cols-4 mb-3'>
          {['Username','Email','Phone','Permission'].map((head,idx)=>(
          idx === 3 ? 
          <Box className='grid grid-cols-2 pr-5'>
            <Typography sx={{fontWeight : 'bold'}} color='primary' className='text-start' >Permission</Typography>
            <Typography sx={{fontWeight : 'bold'}} color='primary' className='text-center' >Delete</Typography>
          </Box> :
          <Typography sx={{fontWeight : 'bold', padding : '0 20px'}} color='primary'>{head}</Typography>
        ))}
        </Box>
        {Array.isArray(loginData) && loginData.map((L_data)=>
        L_data.Username !== UserDetails('All').Username && L_data.Course === UserDetails('Course') &&
        <AccordionDetails className='grid grid-cols-4'>
          <Typography>{L_data.Username}</Typography>
          <Typography>{L_data.Email}</Typography>
          <Typography>{L_data.Phone}</Typography>
          <Box className='grid grid-cols-2 place-content-start'>
          <Box className={`ml-3 relative w-16 h-7 ${(L_data.Permission === 'Access') ? 'bg-[#1976d2]' : 'bg-gray-400'} rounded-full flex items-center`}>
              <IconButton className={`absolute ${(L_data.Permission === 'Access') ? 'left-[1.65rem]' : 'left-[-0.60rem]'}`} sx={{transition : '0.3s ease-in-out', zIndex : '10', marginBottom : '0.80px'}} 
                  onClick={()=>{setUser_Change(`${L_data.id}~${L_data.Permission}`);setOpenDialog(true)}}>
                  {L_data.Permission === 'Access' ? (<CheckCircleRounded sx={{width : '1.90rem', height : '1.90rem', color : '#fff'}} />) : 
                  (<CancelRounded sx={{width : '1.90rem', height : '1.90rem', color : '#fff'}} />)}
              </IconButton>
          </Box>
          <Button variant='contained' color='error' sx={{height : '30px'}} 
            onClick={()=>{setUser_Delete(L_data.id);setOpenDialog(true)}}>Delete
          </Button>
          </Box>
        </AccordionDetails>
      )}
      </Accordion>)
      }
    </Box> : 
      <Box className='w-full h-1/2 flex flex-col items-center justify-center'>
        <NoAccountsRounded sx={{fontSize : '150px', color : 'lightgrey'}} />
        <Typography variant='h5' color='lightgrey'>No user found</Typography>
      </Box>}
    <Dialog open={openDialog} sx={{zIndex : '900'}}>
      <DialogTitle>Are you sure you want to {user_Delete ? 'delete User' : 'change User Permission'}?</DialogTitle>
      <DialogContent>
        {user_Delete ? 'This Cannot be undone. User will be deleted permanently.' : 'This will change User Permission.'}
      </DialogContent>
      <DialogActions>
        <Button variant='outlined' onClick={()=>{setUser_Change(null);setUser_Delete(null);setOpenDialog(false)}}>Cancel</Button>
        <Button variant='contained' onClick={()=>{changeDetails();setOpenDialog(false)}} color={user_Delete ? 'error' : 'primary'} 
            >{user_Delete ? 'Delete User' : 'Confirm'}
        </Button>
      </DialogActions>
    </Dialog>
    </>
  )
}

export default Users;