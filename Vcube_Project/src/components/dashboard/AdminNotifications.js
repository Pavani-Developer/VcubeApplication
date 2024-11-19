import React, { useContext, useEffect, useState } from 'react';
import { Badge, Box, Card, Dialog, DialogContent, DialogTitle, IconButton, Link, Tooltip, Typography } from '@mui/material';
import { CloseRounded, MessageRounded, NotificationsOffRounded, NotificationsRounded, ReplayRounded, Visibility } from '@mui/icons-material';
import { BatchContext } from '../api/batch';
import { DateTime } from '../date-time';
import { mui_colors } from '../ExternalData';

const AdminNotifications = ({ isOpen, setIsOpen, selectedCourse, selectedBatch, handleShowSnackbar, setNotifLen }) => {
    const { fetchAdminMessageData } = useContext(BatchContext);
    const [batchData, setBatchData] = useState([]);
    const [refresh, setRefresh] = useState(false);

    const fetchData = async() => {
        const res = await fetchAdminMessageData();
        if (res && res.message){
            handleShowSnackbar('error',res.message);
        }else if(res){
            if(Array.isArray(res) && res.length === 0){
                handleShowSnackbar('error','No data found.');
                return;
            }
            const data = Array.isArray(res) && res.length > 0 && res.filter(data=>(data.Course === 'All' || data.Course === selectedCourse) && (data.BatchName === 'All' || data.BatchName === selectedBatch));
            if(Array.isArray(data) && data.length > 0){
                setBatchData([...data].reverse());
                setNotifLen(data.filter(data=>data.AdminMessage.split('~')[0].split(' ')[0] === DateTime().split(' ')[0]).length);
            }
        }
    }

    useEffect(()=>{
        fetchData();
    },[isOpen, selectedCourse, selectedBatch])

    const make_refresh = async () => {
        await fetchData();
        setRefresh(true);
        setTimeout(()=>{
            setRefresh(false);
        },10000)
    }

  return (
    <Dialog open={isOpen} sx={{zIndex : '700'}} maxWidth='lg'>
        <img src='/images/V-Cube-Logo.png' alt='' width='15%' className='ml-[42.5%]' />
        <IconButton sx={{position : 'absolute'}} className='right-1 top-1' onClick={()=>setIsOpen(false)} ><CloseRounded sx={{fontSize : '35px'}} /></IconButton>
        <IconButton disabled={refresh} sx={{position : 'absolute'}} className='top-1 right-12' onClick={make_refresh}>
            <ReplayRounded sx={{fontSize : '35px'}} />
        </IconButton>
        <DialogTitle variant='h5'>Your Notifications <NotificationsRounded sx={{fontSize : '30px'}} /></DialogTitle>
        {Array.isArray(batchData) && batchData.length > 0 ? <DialogContent className='w-[50rem] h-[40rem] overflow-y-auto' sx={{scrollbarWidth : 'none'}}>
            {Array.isArray(batchData) && batchData.map((data,index)=>{
            const msg = data.AdminMessage.split('~');
            return(
            <Tooltip title={`Message : ${msg[2]}`}>
            <Card className='relative flex items-center justify-start mt-5 h-20 pl-3 mb-5' sx={{boxShadow : '0 0 5px rgba(0,0,0,0.5)'}}>
                <MessageRounded sx={{color : `${mui_colors[index]}`, fontSize : '30px', width : '5%', marginRight : '10px'}}/>
                <Box className='flex flex-col items-start justify-between h-[70%] w-[90%]'>
                    <Typography className='text-slate-500'>{msg[1]}</Typography>
                    <Typography className='text-slate-400'>Date : {msg[0]}</Typography>
                </Box>
                {msg[3] !== 'N/A' && <Tooltip title='Show Uploaded File' arrow><Link href={msg[3]} target='_blank'><IconButton color='primary' sx={{marginRight : '10px'}} ><Visibility color='primary'/></IconButton></Link></Tooltip>}
                {msg[0].split(' ')[0] === DateTime().split(' ')[0] && <Box sx={{position : 'absolute'}} className='h-2 w-2 bg-red-600 rounded-full top-0 right-0'></Box>}
            </Card>
            </Tooltip>)})}
        </DialogContent> : 
        <DialogContent className='w-[50rem] h-[40rem] flex flex-col items-center justify-center'>
            <NotificationsOffRounded sx={{fontSize : '150px',color : 'grey'}}/>
            <Typography color='inherit' sx={{fontSize : '30px',color : 'grey'}} >No Notifications</Typography>
        </DialogContent>}
    </Dialog>
  )
}

export default AdminNotifications;