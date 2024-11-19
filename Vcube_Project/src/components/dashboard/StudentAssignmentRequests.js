import React, { useEffect, useState } from 'react';
import { Box, Button, Card, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Typography } from '@mui/material';
import { AssignmentRounded, CancelRounded, CheckCircleRounded, CloseRounded, DoNotDisturbAltRounded } from '@mui/icons-material';
import { mui_colors } from '../ExternalData';

const StudentAssignmentRequests = ({ isOpen, setIsOpen, data, fetchAssignmentResults, patchAssignmentResults, deleteAssignmentRequests, fetchStudentAssignmentRequestData, handleShowSnackbar, setIsLoading }) => {
    const [status, setStatus] = useState(null);
    const [submitData, setSubmitData] = useState(null);

    const submitStatus = async () => {
        setIsLoading(true);
        const getRes = await fetchAssignmentResults(submitData.StudentId);
        if(getRes && getRes.message){
            handleShowSnackbar('error','Failed to get Data. Please try again later.');
        }else if(getRes){
            const getData = Array.isArray(getRes) && getRes.find((data)=>(
                data.StudentId === submitData.StudentId && 
                data.Name === submitData.Name &&
                data.Course === submitData.Course &&
                data.BatchName === submitData.BatchName &&
                data.Date === submitData.Date
            ));
            if(getData){
                getData.Status = status === 'Accept' ? 'Start' : 'Disqualified';
                const post = await patchAssignmentResults(getData);
                if (post === true){
                    await deleteAssignmentRequests(submitData);
                    handleShowSnackbar('success','Student Status has been changed successfully.');
                    fetchStudentAssignmentRequestData();
                }else{
                    handleShowSnackbar('error','Failed to change status. Please try again later.');
                }
            }else{
                handleShowSnackbar('error','Something went wrong. Please try again later.');
            }
        }
        setIsLoading(false);
        setStatus(null);
        setSubmitData(null);
    }

  return (
    <>
    <Dialog open={isOpen} onClose={()=>setIsOpen(false)} sx={{zIndex : '700'}}>
        <img src='/images/V-Cube-Logo.png' width='16%' className='ml-[42%]' />
        <IconButton sx={{position : 'absolute'}} className='top-1 right-1' onClick={()=>setIsOpen(false)}>
            <CloseRounded fontSize='large' />
        </IconButton>
        <DialogTitle variant='h5'>Student Assignment Requests</DialogTitle>
        <DialogContent className='w-full h-[35rem]'>
            {Array.isArray(data) && data.length > 0 ? data.map((info, index)=>(
            <Card key={index} className='p-3 w-full h-20 border-[1px] border-slate-300 flex items-center justify-between'>
                <AssignmentRounded fontSize='large' sx={{color : mui_colors[index < 20 ? index : Math.floor(Math.random() * 20)]}} />
                <Typography className='w-[70%] text-slate-500 text-start'>
                    {info.Name.split('~')[0]}<br/>
                    Requested to Re-entry.
                </Typography>
                <IconButton color='error' onClick={()=>{setStatus('Decline');setSubmitData(info)}}>
                    <CancelRounded color='error'/>
                </IconButton>
                <IconButton color='success' onClick={()=>{setStatus('Accept');setSubmitData(info)}}>
                    <CheckCircleRounded color='success'/>
                </IconButton>
            </Card>)) :
            <Box className='w-full h-full flex flex-col items-center justify-center'>
                <DoNotDisturbAltRounded sx={{fontSize : '100px', margin : '30px 0'}} color='action' />
                <Typography color='grey' variant='h4'>No Requests Found</Typography>
            </Box>}
        </DialogContent>
    </Dialog>

    <Dialog open={status !== null && submitData !== null} sx={{zIndex : '710'}}>
        <DialogTitle>Are you sure you want to {status} Student Request?</DialogTitle>
        <DialogContent>
            <DialogContentText>
                {status === 'Decline' ? 
                'Student Status is marked as Disqualified and Student can no longer Enter or Complete Assignment.' : 
                'Student can Enter again and Complete their Assignment.'}
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button variant='outlined' onClick={()=>setStatus(null)}>Cancel</Button>
            <Button variant='contained' onClick={submitStatus}>Confirm</Button>
        </DialogActions>
    </Dialog>
    </>
  )
}

export default StudentAssignmentRequests