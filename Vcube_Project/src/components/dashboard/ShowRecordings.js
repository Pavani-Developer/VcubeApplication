import React, { startTransition, useContext, useEffect } from 'react';
import { Box, Button, Card, CardMedia, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Link, Typography } from '@mui/material';
import { useState } from 'react';
import { CloseRounded, DeleteForeverRounded, PlayDisabledRounded, ReplayRounded, SmartDisplayRounded } from '@mui/icons-material';
import { AssessmentContext } from '../api/Assessment';

const ShowRecordings = ({ isOpen, setIsOpen, selectedCourse, selectedBatch, handleShowSnackbar }) => {
    const { fetchRecordings, deleteRecordings } = useContext(AssessmentContext);
    const [recordingsData, setRecordingsData] = useState(null);
    const [deleteRecord, setDeleteRecord] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [showVedio, setShowVedio] = useState(null);
    const [refresh, setRefresh] = useState(false);
    
    const fetchData = async () => {
        const res = await fetchRecordings(selectedCourse || 'Python');
        if (res && res.message){
            handleShowSnackbar('error',res.message);
        }else if(res){
            if(Array.isArray(res) && res.length === 0){
                handleShowSnackbar('error','No data found.');
                return;
            }
            setRecordingsData(res);
        }
    }

    useEffect(()=>{
        startTransition(()=>{
            fetchData();
        })
    },[])

    const handleDelete = async () => {
        const res = deleteRecordings(deleteRecord);
        if(res === true){
            handleShowSnackbar('success','Recording deleted successfully.');
            fetchData();
        }else if(res){
            handleShowSnackbar('error',res.message);
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
        <img src='/images/V-Cube-Logo.png' alt='' width='10%' className='ml-[45%]' />
        <IconButton sx={{position : 'absolute'}} className='top-3 right-3' onClick={()=>setIsOpen(false)}>
            <CloseRounded sx={{fontSize : '35px'}}/>
        </IconButton>
        <IconButton disabled={refresh} sx={{position : 'absolute'}} className='top-3 right-16' onClick={make_refresh}>
            <ReplayRounded sx={{fontSize : '35px'}} />
        </IconButton>
        <DialogTitle variant='h5'>Uploaded Recordings</DialogTitle>
        <DialogContent className='w-[70rem] h-[50rem]' sx={{scrollbarWidth : 'thin'}}>
            {recordingsData ?
            <Box className='w-full h-full grid grid-cols-2 place-content-start gap-5'>
                {recordingsData && Array.isArray(recordingsData) &&
                recordingsData.map((data,index)=>(<Card key={index}
                    className='p-3 h-20 border-[1px] border-gray-200 flex items-center justify-between'>
                    <Box className='w-[70%]'>
                        <Typography>{data.Title}</Typography>
                        <Typography variant='h6'>{data.Date}</Typography>
                    </Box>
                    <Box className='w-[20%] flex items-center justify-center'>
                    {data.Vedio_URL.split(' ').map((url,idx)=>
                        <IconButton color='primary' onClick={()=>setShowVedio(url)}>
                            <SmartDisplayRounded color='primary' key={idx} />
                        </IconButton>
                    )}
                    </Box>
                    <IconButton color='error' onClick={()=>{setDeleteRecord(data);setConfirmDelete(true)}} ><DeleteForeverRounded color='error' /></IconButton>
                </Card>))}
            </Box> :
             <Box className='w-full h-full flex flex-col items-center justify-center'>
                <PlayDisabledRounded sx={{fontSize : '150px'}} color='disabled' />
                <Typography variant='h4' color='grey' >No Recordings Found</Typography>
             </Box>}
        </DialogContent>
    </Dialog>
    <Dialog open={showVedio !== null} >
        <IconButton sx={{ position : 'absolute', zIndex : '10' }} className='top-0 right-0' onClick={()=>setShowVedio(null)}>
            <CloseRounded sx={{fontSize : '30px', color : 'black'}} />
        </IconButton>
        <DialogContent sx={{padding : '0px', background : 'transparent'}} className='flex items-center justify-center'>
            <CardMedia
                component="video"
                controls
                controlsList='nodownload'
                src={showVedio}
                onContextMenu={(event)=>event.preventDefault()}
                sx={{ width: '100%', height: '100%', borderRadius : '5px', zIndex : '5' }}
            >
                Your browser does not support the video tag.
            </CardMedia>
        </DialogContent>
    </Dialog>
    <Dialog open={confirmDelete} sx={{zIndex : '710'}}>
        <DialogTitle>Are you sure you want to delete ?</DialogTitle>
        <DialogContent>
            This will delete this recording permanently.
        </DialogContent>
        <DialogActions>
            <Button variant='outlined' onClick={()=>{setConfirmDelete(false);setDeleteRecord(null)}}>Cancel</Button>
            <Button variant='contained' onClick={()=>{setConfirmDelete(false);handleDelete();setDeleteRecord(null)}}>Delete</Button>
        </DialogActions>
    </Dialog>
    </>
  )
}

export default ShowRecordings;