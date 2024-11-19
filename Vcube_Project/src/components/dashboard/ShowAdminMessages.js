import React, { useContext, useEffect, useState } from 'react';
import { BatchContext } from '../api/batch';
import { Box, Button, Card, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Link, Tooltip, Typography } from '@mui/material';
import { DeleteForever, MessageRounded, ReplayRounded, Visibility } from '@mui/icons-material';
import { mui_colors } from '../ExternalData';

const ShowAdminMessages = ({ selectedCourse, selectedBatch, handleShowSnackbar, setIsLoading }) => {
    const { fetchAdminMessageData, deleteAdminMessageData } = useContext(BatchContext);
    const [batchData, setBatchData] = useState([]);
    const [deleteMsgData, setDeleteMsgData] = useState(null);
    const [deleteMsg, setDeleteMsg] = useState(null);
    const [refresh, setRefresh] = useState(false);

    const fetchData = async() => {
        setIsLoading(true);
        const res = await fetchAdminMessageData();
        setIsLoading(false);
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
            }
        }
    }

    const deleteMessage = async () => {
        if (deleteMsgData){
            setIsLoading(true);
            const res = await deleteAdminMessageData(deleteMsgData);
            setIsLoading(false);
            if (res && res.message){
                handleShowSnackbar('error',res.message);
            }else if (res){
                handleShowSnackbar('success','Message withdrawn successfully.');
            }
            fetchData();
        }
    }

    useEffect(()=>{
        fetchData();
    },[])

    const make_refresh = async () => {
        await fetchData();
        setRefresh(true);
        setTimeout(()=>{
            setRefresh(false);
        },10000)
    }

  return (
    <>
        <IconButton disabled={refresh} sx={{position : 'absolute'}} className='top-8 right-16' onClick={make_refresh}>
            <ReplayRounded sx={{fontSize : '28px'}} />
        </IconButton>
        {Array.isArray(batchData) && batchData.length > 0 ?
        <DialogContent className='w-full h-[40rem] overflow-y-auto' sx={{scrollbarWidth : 'none'}}>
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
                <IconButton color='error' onClick={()=>{setDeleteMsg(true);setDeleteMsgData(data)}}><DeleteForever color='error' /></IconButton>
            </Card>
            </Tooltip>)})}
        </DialogContent> : 
        <DialogContent>

        </DialogContent>}
    
        <Dialog open={deleteMsg}>
            <DialogTitle>Are you sure you want to withdraw your message ?</DialogTitle>
            <DialogContent>
                This will delete this message permanently from everyone.
            </DialogContent>
            <DialogActions>
                <Button variant='outlined' onClick={()=>setDeleteMsg(false)}>Cancel</Button>
                <Button variant='contained' onClick={()=>{setIsLoading(true);setTimeout(()=>{deleteMessage()},2000);setDeleteMsgData(null);setDeleteMsg(false)}}>Withdraw</Button>
            </DialogActions>
        </Dialog>
    </>
  )
}

export default ShowAdminMessages;
