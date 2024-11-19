import React, { useContext, useEffect, useState } from 'react';
import { Avatar, Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, IconButton, Link, Tooltip, Typography } from '@mui/material';
import { ChatBubbleRounded, CloseRounded, DeleteForeverRounded, MarkChatReadRounded, ReplayRounded, SpeakerNotesOffRounded, Visibility } from '@mui/icons-material';
import { StudentsContext } from '../api/students';
import { mui_colors } from '../ExternalData';


const SentMessagesForm = ({ isOpen, setIsOpen, image, gender, course, batchName, name, phone, handleShowSnackbar, setIsLoading, isUser, stdId  }) => {
  const { fetchStudentMessageData, fetchBatchToStudentMessageData, deleteStudentMessageData, deleteBatchToStudentMessageData } = useContext(StudentsContext);
  const [batchMsgData, setBatchMsgData] = useState([]);
  const [deleteMessage, setDeleteMessage] = useState([]);
  const [conrimationDialog, setConfirmationDialog] = useState(false);
  const [refresh, setRefresh] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    const res = isUser === 'Student' ? await fetchStudentMessageData(course) : await fetchBatchToStudentMessageData(stdId);
    setIsLoading(false);
    if(res && res.message){
      if (res.response && res.response.status === 404){
        isUser !== 'Student' && setBatchMsgData([]);
      }else{
        handleShowSnackbar('error',res.message);
      }
    }else if(res){
      if(Array.isArray(res) && res.length === 0){
        handleShowSnackbar('error','No data found.');
        return;
      }
      setBatchMsgData([]);
      let filteredData;
      if(isUser === 'Student'){
          filteredData = res.filter((data) => {
          const studentMessage = JSON.parse(data.StudentMessage);
          return data.Course === course &&
            data.BatchName === batchName &&
            studentMessage.Name === name &&
            studentMessage.Phone === phone;
        }) 
      }else{
        filteredData = !Array.isArray(res) ? [res] : res;
      }
      setBatchMsgData([...filteredData].reverse());
    }
  };

  useEffect(()=>{
    fetchData();
  },[isOpen])

  const handleDeleteMessage = async () =>{
    setIsLoading(true);
    const res = isUser === 'Student' ? await deleteStudentMessageData(deleteMessage) : await deleteBatchToStudentMessageData(deleteMessage);
    setIsLoading(false);
    if(res && res.message){
      handleShowSnackbar('error',res.message);
    }else if(res){
      handleShowSnackbar('success','Message withdrawn successfully.');
    }
    fetchData();
    setConfirmationDialog(false);
  };

  const make_refresh = async () => {
    await fetchData();
    setRefresh(true);
    setTimeout(()=>{
        setRefresh(false);
    },10000)
  }

  return (
    <>
    <Dialog open={isOpen} maxWidth='lg' sx={{zIndex : '700'}}>
        <img src='/images/V-Cube-Logo.png' alt='' width='12%' className='ml-[44%]' />
        <IconButton sx={{position : 'absolute'}} className='top-3 right-3' onClick={()=>setIsOpen(false)}><CloseRounded sx={{fontSize : '35px'}} /></IconButton>
        <IconButton disabled={refresh} sx={{position : 'absolute'}} className='top-3 right-16' onClick={make_refresh}>
            <ReplayRounded sx={{fontSize : '35px'}} />
        </IconButton>
        <DialogTitle variant='h5'>Messages You Sent <MarkChatReadRounded sx={{fontSize : '30px', marginLeft : '10px'}} /></DialogTitle>
        {Array.isArray(batchMsgData) && batchMsgData.length > 0 ? (<DialogContent sx={{width : '50rem',scrollbarWidth : 'none'}} className='min-h-[33rem] max-h-[33rem] overflow-y-auto mb-3'>
            {isUser === 'Student' ? (Array.isArray(batchMsgData) && batchMsgData.map((data)=>(<>
            <Box className='flex flex-row items-center justify-between mt-5 mb-5'>
              <Avatar src={JSON.parse(data.StudentMessage).Image} sx={{width : '50px', height : '50px', border : 'solid 1px lightgrey'}} />
              <Tooltip title={JSON.parse(data.StudentMessage).Message} arrow sx={{fontSize : '16px'}} >
              <Box className={`w-[80%] relative flex flex-col items-start justify-evenly cursor-pointer`}>
                <Typography className='flex flex-row items-center justify-evenly text-gray-500'>Sent to: <Typography variant='h6' className='flex items-center' sx={{fontWeight : 'bold',marginLeft : '15px',color : 'black'}}
                    >{JSON.parse(data.StudentMessage).MessageTo} <Typography className='text-gray-500' sx={{marginLeft : '10px'}}>on {JSON.parse(data.StudentMessage).Date}</Typography></Typography></Typography>
                <Typography className='flex flex-row items-center justify-evenly text-gray-500' sx={{margin : '3px 0'}}>Reason: <Typography sx={{marginLeft : '10px',color : 'black'}}>{JSON.parse(data.StudentMessage).Reason}</Typography></Typography>
                {data && data.StudentMessage && JSON.parse(data.StudentMessage).File !== 'N/A' && <Typography className='text-gray-500'>Show Uploaded File : <Link href={JSON.parse(data.StudentMessage).File} target='_blank' ><IconButton><Visibility /></IconButton></Link></Typography>}
              </Box>
              </Tooltip>
              <Tooltip title='Withdraw Your Message' arrow><Box className='w-[5%] flex items-center justify-center'>
                <IconButton onClick={()=>{setDeleteMessage(data);setConfirmationDialog(true)}}><DeleteForeverRounded color='error' /></IconButton>
              </Box></Tooltip>
            </Box>
            <Divider/></>))) : 
            (batchMsgData.map((data,index)=>(<><Tooltip title={data.BatchMessage.split('~')[2]} arrow>
            <Box className='flex flex-row items-center justify-between mt-5 mb-5' key={index}>
                <ChatBubbleRounded sx={{color : index < 20 ? mui_colors[index] : mui_colors[Math.floor(Math.random() * 19)]}} />
                <Box className='w-[80%] flex flex-col items-start justify-between'>
                <Typography className='flex flex-row items-center justify-evenly text-gray-500'>Sent to: <Typography variant='h6' className='flex items-center' sx={{fontWeight : 'bold',marginLeft : '15px',color : 'black'}}
                    >{name} <Typography className='text-gray-500' sx={{marginLeft : '10px'}}>on {data.BatchMessage.split('~')[0]}</Typography></Typography></Typography>
                <Typography className='flex flex-row items-center justify-evenly text-gray-500' sx={{margin : '3px 0'}}>Reason: <Typography sx={{marginLeft : '10px',color : 'black'}}>{data.BatchMessage.split('~')[1]}</Typography></Typography>
                </Box>
                {data.BatchMessage.split('~')[3] !== 'N/A' && <Tooltip title='View File' arrow>
                  <Link href={data.BatchMessage.split('~')[3]} target='_blank'><IconButton color='primary'><Visibility color='primary'/></IconButton></Link>
                  </Tooltip>}
                <Tooltip title='Withdraw Your Message' arrow>
                  <IconButton color='error' onClick={()=>{setDeleteMessage(data);setConfirmationDialog(true)}}><DeleteForeverRounded color='error' /></IconButton>
                </Tooltip>
            </Box></Tooltip><Divider/></>)))}
        </DialogContent>) : (
        <DialogContent sx={{width : '100%', height : '20rem'}} className='flex items-center justify-center'>
          <DialogContentText className='flex flex-col items-center justify-center'>
            <SpeakerNotesOffRounded sx={{fontSize : '120px'}}/>
            <Typography variant='h4' sx={{marginTop : '20px'}}>No Messages Sent</Typography>
          </DialogContentText>
        </DialogContent>)}

    </Dialog>
    <Dialog open={conrimationDialog} sx={{zIndex : '750'}}>
      <DialogTitle>Are you sure you want to Withdraw your Message ?</DialogTitle>
      <DialogContent>
        <DialogContentText>This will delete your message Permanently from Everyone.</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button variant='outlined' onClick={()=>setConfirmationDialog(false)}>Cancel</Button>
        <Button variant='contained' onClick={()=>{setIsLoading(true);setTimeout(()=>{handleDeleteMessage()},2000)}}>Withdraw Message</Button>
      </DialogActions>
    </Dialog>
    </>
  )
}

export default SentMessagesForm;