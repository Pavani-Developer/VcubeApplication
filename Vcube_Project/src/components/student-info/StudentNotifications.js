import React, { startTransition, useContext, useEffect, useState } from 'react';
import { Badge, Box, Card, Dialog, DialogContent, DialogTitle, IconButton, Link, Tooltip, Typography } from '@mui/material';
import { CloseRounded, MessageRounded, NotificationsRounded, ReplayRounded, Visibility } from '@mui/icons-material';
import { BatchContext } from '../api/batch';
import { DateTime } from '../date-time';
import { StudentsContext } from '../api/students';
import { mui_colors } from '../ExternalData';

const StudentNotifications = ({ isOpen, setIsOpen, course, batchName, handleShowSnackbar, setNotifLen, stdId, isLoading }) => {
  const { fetchBatchMessageData } = useContext(BatchContext);
  const { fetchBatchToStudentMessageData } = useContext(StudentsContext);
  const [batchData, setBatchData] = useState([]);
  const [refresh, setRefresh] = useState(false);
  
    const fetchData = async() => {
        const res = await fetchBatchMessageData(course);
        const result = await fetchBatchToStudentMessageData(stdId);
        if (res && res.message){
            handleShowSnackbar('error',res.message);
        }else if(res){
            if(Array.isArray(res) && res.length === 0){
                handleShowSnackbar('error','No data found.');
                return;
            }
            const resData = Array.isArray(res) && res.length > 0 && res.filter(data=>(data.Course === course && data.BatchName === batchName));
            const data = !(result.message) ? resData && result && resData.concat(result) : resData;
            setBatchData([...data].reverse());
            if(Array.isArray(data) && data.length > 0)setNotifLen(data.filter(data=>data.BatchMessage.split('~')[0].split(' ')[0] === DateTime().split(' ')[0]).length);
        }
    }

  useEffect(()=>{
    startTransition(()=>{
        fetchData();
    })
  },[isLoading])

  const make_refresh = async () => {
    await fetchData();
    setRefresh(true);
    setTimeout(()=>{
        setRefresh(false);
    },10000)
  }

  return (
    <Dialog open={isOpen} sx={{zIndex : '700'}} maxWidth='lg'>
        <img src='/images/V-Cube-Logo.png' alt='' width='12%' className='ml-[44%]' />
        <IconButton sx={{position : 'absolute'}} className='right-1 top-1' onClick={()=>setIsOpen(false)} ><CloseRounded sx={{fontSize : '35px'}} /></IconButton>
        <IconButton disabled={refresh} sx={{position : 'absolute'}} className='top-1 right-12' onClick={make_refresh}>
            <ReplayRounded sx={{fontSize : '35px'}} />
        </IconButton>
        <DialogTitle variant='h5'>Your Notifications <NotificationsRounded sx={{fontSize : '30px'}} /></DialogTitle>
        <DialogContent className='w-[50rem] h-[40rem] overflow-y-auto' sx={{scrollbarWidth : 'none'}}>
            {Array.isArray(batchData) && batchData.map((data,index)=>{
            const msg = data.BatchMessage.split('~');
            return(
            <Tooltip title={`Message : ${msg[3]}`}>
            <Card className='relative flex items-center justify-start mt-5 h-24 pl-3 mb-5' sx={{boxShadow : '0 0 5px rgba(0,0,0,0.5)'}}>
                <MessageRounded sx={{color : mui_colors[index < 20 ? index : Math.floor(Math.random() * 19)], fontSize : '30px', width : '5%', marginRight : '10px'}}/>
                <Box className='flex flex-col items-start justify-between h-[70%] w-[90%]'>
                <Typography className='text-slate-500'>From : {msg[1]}</Typography>
                    <Typography className='text-slate-500'>Reason : {msg[2]}</Typography>
                    <Typography className='text-slate-400'>Date : {msg[0]}</Typography>
                </Box>
                {msg[4] !== 'N/A' && <Tooltip title='Show Uploaded File' arrow><Link href={msg[4]} target='_blank'><IconButton color='primary' sx={{marginRight : '10px'}} ><Visibility color='primary'/></IconButton></Link></Tooltip>}
                {msg[0].split(' ')[0] === DateTime().split(' ')[0] && <Box sx={{position : 'absolute'}} className='h-2 w-2 bg-red-600 rounded-full top-0 right-0'></Box>}
            </Card>
            </Tooltip>)})}
        </DialogContent>
    </Dialog>
  )
}

export default StudentNotifications;