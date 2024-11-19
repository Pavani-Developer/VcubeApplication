import React, { useContext, useEffect, useState } from 'react';
import { Box, Button, Card, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Link, Tooltip, Typography } from '@mui/material';
import { ChatBubbleRounded, CloseRounded, DeleteForeverRounded, MarkChatReadRounded, ReplayRounded, SpeakerNotesOffRounded, Visibility } from '@mui/icons-material';
import { mui_colors } from '../ExternalData';
import { BatchContext } from '../api/batch';
import { DateTime } from '../date-time';

const SentMessages = ({ isOpen, setIsOpen, selectedCourse, selectedBatch, User, handleShowSnackbar, setIsLoading }) => {
    const { fetchBatchMessageData, deleteBatchMessageData } = useContext(BatchContext);
    const [messageData, setMessageData] = useState([]);
    const [deleteMsgData, setDeleteMsgData] = useState(null);
    const [deleteMsg, setDeleteMsg] = useState(null);
    const [refresh, setRefresh] = useState(false);

    const fetchData = async () => {
        setIsLoading(true);
        const results = await fetchBatchMessageData(selectedCourse);
        if (results && results.message){
            handleShowSnackbar('error',results.message);
        }else if (results){
            if(Array.isArray(results) && results.length === 0){
                handleShowSnackbar('error','No data found.');
                return;
            }
            const user = User && User.split(' ')[0] === 'Placements' ? 'Placements Team' : `${selectedCourse} Team`;
            const data = Array.isArray(results) && results.filter(data=>data.BatchName === selectedBatch && data.BatchMessage.split('~')[1] === user);
            if(Array.isArray(data) && data.length > 0)setMessageData([...data].reverse());
        }
        setIsLoading(false);
    };

    useEffect(()=>{
        fetchData();
    },[isOpen])

    const deleteMessage = async () => {
        if (deleteMsgData){
            setIsLoading(true);
            const res = await deleteBatchMessageData(deleteMsgData);
            setIsLoading(false);
            if (res && res.message){
                handleShowSnackbar('error',res.message);
            }else if (res){
                handleShowSnackbar('success','Message withdrawn successfully.');
            }
            fetchData();
        }
    }

    const make_refresh = async () => {
        await fetchData();
        setRefresh(true);
        setTimeout(()=>{
            setRefresh(false);
        },10000)
    }

  return (
    <>
    <Dialog open={isOpen} sx={{zIndex : '700'}} maxWidth='lg'>
        <img src='/images/V-Cube-Logo.png' width='8%' alt='' className='ml-[46%]' />
        <IconButton sx={{position : 'absolute'}} className='top-3 right-3' onClick={()=>setIsOpen(false)}><CloseRounded sx={{fontSize : '35px'}} /></IconButton>
        <IconButton disabled={refresh} sx={{position : 'absolute'}} className='top-3 right-16' onClick={make_refresh}>
            <ReplayRounded sx={{fontSize : '35px'}} />
        </IconButton>
        <DialogTitle variant='h5'>Messages You Sent <MarkChatReadRounded/></DialogTitle>
        <DialogContent className='w-[75rem] h-[40rem] max-h-[40rem] overflow-y-auto grid grid-cols-2 place-content-start gap-x-5 gap-y-5' sx={{scrollbarWidth : 'none'}}>
            {Array.isArray(messageData) && messageData.length > 0 ? <>
            {Array.isArray(messageData) && messageData.length > 0 && messageData.map((data,index)=><Tooltip title={`Message : ${data.BatchMessage.split('~')[3]}`} arrow>
            <Card className='relative flex items-center justify-between mt-1 h-28' sx={{boxShadow : '0 0 5px rgba(0,0,0,0.5)'}}>
                <ChatBubbleRounded sx={{width : '10%', fontSize : '30px', color : `${mui_colors[index < 20 ? index : Math.floor(Math.random() * 20)]}`}}/>
                <Box className='w-[80%] flex flex-col items-start justify-evenly h-[90%]'>
                    <Typography className='flex items-center text-slate-400' sx={{fontSize : '13px'}}>Send To : 
                        <Typography className='text-slate-600' sx={{fontWeight : 'bold', marginLeft : '10px'}}>{data.Course} - {data.BatchName}</Typography>
                    </Typography>
                    <Typography className='flex items-center text-slate-400' sx={{fontSize : '13px'}}>Reason : 
                        <Typography className='text-slate-500' sx={{marginLeft : '10px', fontSize : '15px'}}>{data.BatchMessage.split('~')[2]}</Typography>
                    </Typography>
                    <Typography className='flex items-center text-slate-400' sx={{fontSize : '13px'}}>At : 
                        <Typography className='text-slate-500' sx={{marginLeft : '40px', fontSize : '15px'}}>{data.BatchMessage.split('~')[0]}</Typography>
                    </Typography>
                </Box>
                {data.BatchMessage.split('~').length > 4 && <Tooltip title='Show Uploaded File' arrow><Link href={data.BatchMessage.split('~')[4]} target='_blank'><IconButton color='primary'><Visibility color='primary'/></IconButton></Link></Tooltip>}
                <Tooltip title='Withdraw Message' arrow><IconButton color='error' onClick={()=>{setDeleteMsgData(data);setDeleteMsg(true)}}><DeleteForeverRounded color='error'/></IconButton></Tooltip>
                {(data.BatchMessage.split('~')[0].split(' ')[0] === DateTime().split(' ')[0]) && <Box sx={{position : 'absolute'}} className='w-2 h-2 rounded-full bg-red-600 top-0 right-0'></Box>}
            </Card></Tooltip>)}
            </> : 
            <Box className='w-full h-full flex flex-col items-center justify-center ml-[50%] mt-[20%]'>
                <SpeakerNotesOffRounded sx={{fontSize : '120px', color : 'grey', marginBottom : '30px'}} />
                <Typography variant='h4' color='grey'>No Messages Found.</Typography>
            </Box>}
        </DialogContent>
    </Dialog>

    <Dialog open={deleteMsg}>
        <DialogTitle>Are you sure you want to withdraw your message ?</DialogTitle>
        <DialogContent>
            This will delete this message permanently from everyone.
        </DialogContent>
        <DialogActions>
            <Button variant='outlined' onClick={()=>setDeleteMsg(false)}>Cancel</Button>
            <Button variant='contained' onClick={()=>{setIsLoading(true);deleteMessage();setDeleteMsgData(null);setDeleteMsg(false)}}>Withdraw</Button>
        </DialogActions>
    </Dialog>
    </>
  )
}

export default SentMessages;