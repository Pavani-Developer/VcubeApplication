import React, { useContext, useRef } from 'react';
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, IconButton, InputLabel, MenuItem, Select, TextField, Tooltip, Typography } from '@mui/material';
import { useState } from 'react';
import { ChangeCircleRounded, CheckCircleRounded, ListRounded, MessageRounded, UploadFileRounded, Visibility } from '@mui/icons-material';
import { DateTime } from '../date-time';
import { BatchContext } from '../api/batch';
import styled from 'styled-components';
import ShowAdminMessages from './ShowAdminMessages';

const SendMessagesToBatch = ({ isOpen, setIsOpen, selectedCourse, selectedBatch, handleShowSnackbar, setIsLoading }) => {
    const { postAdminMessageData } = useContext(BatchContext);
    const [selectedType, setSelectedType] = useState(null);
    const file = useRef(null);
    const [filename, setFilename] = useState(null);
    const [reason, setReason] = useState(null);
    const [message, setMessage] = useState(null);
    const [isSubmit, setIsSubmit] = useState(false);
    const [loading, setLoading] = useState(false);

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
        const _file_ = event.target.files[0];
        setLoading(true);
        setTimeout(()=>{
          if (_file_) {
            if((file.size / (1024 * 1024)).toFixed(2) <= 5){
                setFilename(_file_.name);
                const reader = new FileReader();
                reader.onloadend = () => {
                    file.current = reader.result;
                };
                reader.readAsDataURL(_file_);
            }else{
                handleShowSnackbar('error','You can upload files up to 5 MB. Files larger than 5 MB will not be accepted.');
            }
          }
          setLoading(false);
        },2000)
      };

    const handleSubmit = () => {
        setIsSubmit(true);
        if(!reason || !message || message.length < 25)return;
        setIsLoading(true);
        const data = {
            Course : selectedType === 'All Courses' ? 'All' : (selectedType === 'Placements Team') ? selectedType : selectedCourse,
            BatchName : (selectedType === 'Placements Team') ? selectedType : selectedBatch,
            AdminMessage : `${DateTime()}~${reason}~${message}~${file ? file : 'N/A'}`
        }
        postMessageData(data);
    }

    const postMessageData = async(data) => {
        const res = await postAdminMessageData(data);
        if(res && res.message){
            handleShowSnackbar('error',res.message);
        }else if(res){
            handleShowSnackbar('success','Your Message has been send successfully.');
        }
        handleClose();
        setIsLoading(false);
    };

    const handleClose = () => {
        setSelectedType(null);
        file.current = '';
        setFilename(null);
        setReason(null);
        setMessage(null);
        setIsOpen(false);
        setIsSubmit(false);
    }

  return (
    <Dialog open={isOpen} onClose={()=>{(!selectedType || selectedType === 'Show Messages') && handleClose()}} sx={{zIndex : '700'}}>
        <img src='/images/V-Cube-Logo.png' alt='' width='15%' className='ml-[42.5%]'/>
        {selectedType && <Tooltip title='Change Message Type' arrow>
            <IconButton sx={{position : 'absolute'}} color='primary' 
                onClick={()=>{setSelectedType(null);setMessage(null);file.current='';setFilename(null);setReason(null);setIsSubmit(false)}} 
                className={`w-8 h-8 ${selectedType === 'Show Messages' ? 'top-10' : 'top-[5rem]'} right-5`}>
                <ChangeCircleRounded color='primary' sx={{fontSize : '30px'}}/>
            </IconButton>
        </Tooltip>}
        {!selectedType ? <>
            <DialogTitle className='flex items-center justify-between'>
                <Typography variant='h6'>Who do you want to send Message ?</Typography>
            </DialogTitle>
            <DialogContent className='h-[8rem] flex items-center justify-between'>
                <ListRounded sx={{fontSize : '30px', marginTop : '23px'}} />
                <FormControl className='w-[93%]' variant='standard'>
                    <InputLabel sx={{fontSize : '20px'}}>Select an option</InputLabel>
                    <Select
                        value={selectedType}
                        onChange={(e)=>setSelectedType(e.target.value)}>
                        <MenuItem value='Selected Batch'>Selected Batch</MenuItem>
                        <MenuItem value='Placements Team'>Placements Team</MenuItem>
                        <MenuItem value='All Courses'>All Courses</MenuItem>
                        <MenuItem value=''></MenuItem>
                        <MenuItem value='Show Messages'><Visibility color='action' className='mr-3' /> Show Sent Messages</MenuItem>
                    </Select>
                </FormControl>
            </DialogContent>
        </> : selectedType === 'Show Messages' ? 
            <ShowAdminMessages selectedBatch={selectedBatch} selectedCourse={selectedCourse} handleShowSnackbar={handleShowSnackbar} setIsLoading={setIsLoading} />
        :
        <>
            <DialogTitle variant='h5'>Message to {selectedType === 'Selected Batch' ? selectedBatch === 'All' ? "All Selected Batches" : selectedBatch : selectedType} <MessageRounded /></DialogTitle>
            <DialogContent className='flex flex-col items-center justify-evenly h-[21rem]'>
                <TextField className='w-full h-20' sx={{marginTop : '15px'}} label='Reason' required 
                    value={reason} onChange={(e)=>setReason(e.target.value)} inputProps={{maxLength : 70}}
                    error={isSubmit && !reason} helperText={isSubmit && !reason ? 'Provide a Reason' : ''} />
                <Box className='h-[4.50rem] flex flex-col items-center justify-start'>
                    <Box className='relative'><Button startIcon={file && filename ? <CheckCircleRounded/> : <UploadFileRounded />} color={file && filename ? 'success' : 'primary'} disabled={loading} variant='contained'
                            component="label" role={undefined} tabIndex={-1}>
                            <VisuallyHiddenInput type="file" onChange={(e)=>handleFileChange(e)} />
                            {file && filename ? 'File Uploaded' : 'Optional File Here'}
                        </Button>
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
                    <Typography sx={{marginTop : '3px', width : 'auto'}}>{filename}</Typography>
                </Box>
                <TextField className='w-full h-36' multiline rows={4} label='Your Message Here' required 
                    value={message} onChange={(e)=>setMessage(e.target.value)}
                    error={(isSubmit && !message) || (message && message.length < 25)}
                    helperText={isSubmit && !message ? "Enter Message" : (message && message.length < 25) ? "Your Message should contains atleast 25 characters" : ""} 
                    />
            </DialogContent>
            <DialogActions>
                <Button variant='outlined' onClick={handleClose}>Cancel</Button>
                <Button variant='contained' onClick={handleSubmit}>Send Message</Button>
            </DialogActions>
        </>}
    </Dialog>
  )
}

export default SendMessagesToBatch;