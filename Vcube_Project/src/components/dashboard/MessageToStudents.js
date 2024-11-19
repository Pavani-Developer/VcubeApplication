import React, { useContext, useState } from 'react';
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from '@mui/material';
import { CheckCircleRounded, MailRounded, UploadFileRounded } from '@mui/icons-material';
import styled from 'styled-components';
import { BatchContext } from '../api/batch';
import { DateTime } from '../date-time';

const MessageToStudents = ({ isOpen, setIsOpen, selectedCourse, selectedBatch, User, handleShowSnackbar, setIsLoading }) => {
    const { postBatchMessageData } = useContext(BatchContext);
    const [reason, setReason] = useState(null);
    const [message, setMessage] = useState(null);
    const [isSubmit, setIsSubmit] = useState(null);
    const [file, setFile] = useState(null);
    const [fileName, setFileName] = useState(null);
    const [loading, setLoading] = useState(false);
    const dateTime = DateTime();

    const VisuallyHiddenInput = styled('input')({
        clip: 'rect(0 0 0 0)',
        clipPath: 'inset(50%)',
        height: 1,
        overflow: 'hidden',
        position: 'absolute',
        bottom: 0,
        left: 0,
        whiteSpace: 'nowrap',
        width: 1,
    });

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setLoading(true);
        setTimeout(()=>{
          if (file) {
            if((file.size / (1024 * 1024)).toFixed(2) <= 5){
              setFileName(file.name);
              const reader = new FileReader();
              reader.onloadend = () => {
                setFile(reader.result);
              };
              reader.readAsDataURL(file);
            }else{
              handleShowSnackbar('error','You can upload files up to 5 MB. Files larger than 5 MB will not be accepted.');
            }
          }
          setLoading(false);
        },2000)
      };
    
      const handleClose = () =>{
        setReason(null);
        setMessage(null);
        setFile(null);
        setFileName(null);
        setIsSubmit(false);
        setIsOpen(false);
      }
    
      const handleSubmit = () => {
        setIsSubmit(true);
        if(!reason || !message)return;
        const user = User && User.split(' ')[0] === 'Placements' ? 'Placements Team' : `${selectedCourse} Team`;
        const data = {
            Course : selectedCourse,
            BatchName : selectedBatch,
            BatchMessage :  `${dateTime}~${user}~${reason}~${message}~${(file && fileName) ? file : 'N/A'}`
        }
        setIsLoading(true);
        submitMessage(data);
      }

      const submitMessage = async (data) => {
        const res = await postBatchMessageData(data);
        if (res && res.message){
            handleShowSnackbar('error',res.message);
        }else if (res){
            handleShowSnackbar('success','You message has been sent successfully.');
        }
        handleClose();
        setIsLoading(false);
      };

  return (
    <Dialog open={isOpen} sx={{zIndex : '700'}}>
        <img src='/images/V-Cube-Logo.png' alt='' width='20%' className='ml-[40%]' />
        <DialogTitle variant='h5'>Message to Students <MailRounded /></DialogTitle>
        <DialogContent className='w-full flex flex-col items-center justify-between'>
            <TextField className='w-full h-20' label='Reason' sx={{margin : '15px 0'}} 
                required value={reason} onChange={(e)=>setReason(e.target.value)} inputProps={{ maxLength: 50 }}
                error={isSubmit && !reason} helperText={isSubmit && !reason ? 'Provide Reason' : ''} />
            <TextField multiline rows={3} className='w-full h-28'  value={message} label='Your Message Here' required
                onChange={(e)=>setMessage(e.target.value)} error={(isSubmit && !message) || message && (message.length < 25)} 
                helperText={isSubmit && !message ? 'Enter Message' : (message && message.length < 25) ? 'Message should contain atleast 25 characters.' : ''} />
            <Box className='w-full mt-8 h-16 flex flex-col items-center justify-start'>
                <Box className='relative'><Button variant='contained' startIcon={(file && fileName) ? <CheckCircleRounded/> : <UploadFileRounded/>} 
                    disabled={loading} color={(file && fileName) ? 'success' : 'primary'} component="label" role={undefined} tabIndex={-1}>
                    <VisuallyHiddenInput type="file" onChange={(e)=>handleFileChange(e)} />
                    {(file && fileName) ? 'File Uploaded' : 'Upload Optional File'}</Button>
                    {loading && (
                    <CircularProgress
                    size={24}
                    sx={{
                        color: 'primary',
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        marginTop: '-12px',
                        marginLeft: '-12px',
                    }}
                    />
                    )}
                </Box>
                <Typography>{fileName && fileName}</Typography>
            </Box>
        </DialogContent>
        <DialogActions>
            <Button variant='outlined' onClick={handleClose}>Cancel</Button>
            <Button variant='contained' sx={{width : '20%'}} onClick={handleSubmit}>Send</Button>
        </DialogActions>
    </Dialog>
  )
}

export default MessageToStudents;