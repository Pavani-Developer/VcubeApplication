import React, { useContext, useEffect, useState } from 'react';
import { StudentsContext } from '../api/students';
import { DateTime } from '../date-time';
import { Avatar, Box, Card, Dialog, DialogContent, DialogContentText, DialogTitle, IconButton, Link, Tooltip, Typography } from '@mui/material';
import { CloseRounded, MessageRounded, ReplayRounded, SpeakerNotesOffRounded, Visibility } from '@mui/icons-material';

const StudentMessages = ({ isOpen, setIsOpen, selectedCourse, selectedBatch, handleShowSnackbar, setStdMsgLen, isLoading }) => {
    const { fetchStudentMessageData } = useContext(StudentsContext);
    const [stdMsgData, setStdMsgData] = useState([]);
    const [refresh, setRefresh] = useState(false);

    const fetchData = async () => {
        const res = await fetchStudentMessageData(selectedCourse);
        if(res && res.message){
            handleShowSnackbar('error',res.message);
        }else if(res){
            if(Array.isArray(res) && res.length === 0){
                handleShowSnackbar('error','No data found.');
                return;
            }
            const data = Array.isArray(res) && res.length > 0 && res.filter(data=>(data.BatchName === selectedBatch || selectedBatch === 'All') && JSON.parse(data.StudentMessage).MessageTo === 'Placement Team');
            setStdMsgData([...data].reverse());
            if(Array.isArray(data) && data.length > 0)setStdMsgLen(data.filter(data=>JSON.parse(data.StudentMessage).Date.split(' ')[0] === DateTime().split(' ')[0]).length);
        }
    }

    useEffect(()=>{
        fetchData();
    },[selectedBatch])

    const make_refresh = async () => {
        await fetchData();
        setRefresh(true);
        setTimeout(()=>{
            setRefresh(false);
        },10000)
    }

  return (
   <Dialog open={isOpen} maxWidth='lg' sx={{zIndex : '700'}}>
    <img src='/images/V-Cube-Logo.png' width='8%' alt='' className='ml-[46%]' />
    <DialogTitle variant='h5'>Students Messages <MessageRounded/></DialogTitle>
    <IconButton sx={{position : 'absolute'}} className='top-3 right-3' onClick={()=>setIsOpen(false)}><CloseRounded sx={{fontSize : '35px'}}/></IconButton>
    <IconButton disabled={refresh} sx={{position : 'absolute'}} className='top-3 right-16' onClick={make_refresh}>
        <ReplayRounded sx={{fontSize : '35px'}} />
    </IconButton>
    {Array.isArray(stdMsgData) && stdMsgData.length > 0 ? (<DialogContent sx={{width : '75rem',scrollbarWidth : 'none'}} className='min-h-[34rem] gap-3 max-h-[34rem] grid grid-cols-2 place-content-start overflow-y-auto mb-3'>
            {Array.isArray(stdMsgData) && stdMsgData.map((data)=>(<>
            <Card className='relative flex flex-row items-center justify-start mt-1 h-[8rem]' sx={{boxShadow : '0 0 5px rgba(0,0,0,0.5)'}}>
              <Avatar src={JSON.parse(data.StudentMessage).Image} sx={{width : '50px', height : '50px', border : 'solid 1px lightgrey', margin : '0 20px 0 10px'}} />
              <Tooltip title={JSON.parse(data.StudentMessage).Message} arrow sx={{fontSize : '16px'}} >
              <Box className={`w-[85%] h-[80%] relative flex flex-col items-start justify-between cursor-pointer`}>
                <Typography className='flex flex-row items-center justify-evenly text-gray-500'>Details : <Typography className='flex items-center' sx={{fontWeight : 'bold',marginLeft : '15px',color : 'black'}}
                    >{JSON.parse(data.StudentMessage).Name} - {JSON.parse(data.StudentMessage).Phone}</Typography></Typography>
                <Typography className='flex flex-row items-center justify-evenly text-gray-500'>Batch : <Typography className='text-black' sx={{marginLeft : '20px'}}>{data.Course} - {data.BatchName}</Typography></Typography>
                <Typography className='text-gray-500 flex items-center'>Date : <Typography sx={{marginLeft : '28px', color : 'black'}}>{JSON.parse(data.StudentMessage).Date}</Typography></Typography>
                <Typography className='flex flex-row items-start justify-evenly text-gray-500' sx={{margin : '3px 0'}}>Reason: <Typography sx={{marginLeft : '10px',color : 'black'}}>{JSON.parse(data.StudentMessage).Reason}</Typography></Typography>
              </Box>
              </Tooltip>
              {data && data.StudentMessage && JSON.parse(data.StudentMessage).File !== 'N/A' && <Tooltip title='Uploaded File' arrow><Link href={JSON.parse(data.StudentMessage).File} target='_blank' sx={{marginRight : '10px'}} ><IconButton color='primary'><Visibility color='primary' /></IconButton></Link></Tooltip>}
              {JSON.parse(data.StudentMessage).Date.split(' ')[0] === DateTime().split(' ')[0] && <Box sx={{position : 'absolute'}} className='w-2 h-2 bg-red-600 rounded-full top-0 right-0'></Box>}
            </Card>
            </>))}
        </DialogContent>) : (
        <DialogContent sx={{width : '100%', height : '20rem'}} className='flex items-center justify-center'>
        <DialogContentText className='flex flex-col items-center justify-center'>
        <SpeakerNotesOffRounded sx={{fontSize : '120px'}}/>
        <Typography variant='h4' sx={{marginTop : '20px'}}>No Student's Messages</Typography>
        </DialogContentText>
    </DialogContent>)}
   </Dialog>
  )
}

export default StudentMessages;