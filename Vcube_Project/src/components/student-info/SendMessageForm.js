import React, { useContext, useState } from 'react';
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, FormControlLabel, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material';
import { AttachFileRounded, CheckCircleRounded, ChecklistRounded, MailRounded } from '@mui/icons-material';
import styled from 'styled-components';
import { DateTime } from '../date-time';
import { StudentsContext } from '../api/students';
import { MailContext } from '../api/SendMail';

const SendMessageForm = ({ isOpen, setIsopen, course, batchName, image, name, phone, handleShowSnackbar, setIsLoading, isUser, stdId, email }) => {
    const { postStudentMessageData, postBatchToStudentMessageData } = useContext(StudentsContext);
    const { sendEmail } = useContext(MailContext);
    const [reason, setReason] = useState(null);
    const [message, setMessage] = useState(null);
    const [file, setFile] = useState(null);
    const [filename, setFilename] = useState(null);
    const [isSubmit, setIsSubmit] = useState(false);
    const [messageTo, setMessageTo] = useState(null);
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
        setLoading(true);
        setTimeout(()=>{
            const file = event.target.files[0];
            if(file){
                if((file.size / (1024 * 1024)).toFixed(2) <= 5){
                    setFilename(file.name);
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
        },2000);
    };

    const postMessageData = async () => {
        const data = {
            Course : course,
            BatchName : batchName,
            StudentMessage : JSON.stringify({Image : image, Name : name, Phone : phone, Date : dateTime, Reason: reason, Message : message, MessageTo : messageTo, File : file ? file : 'N/A'})
        }
        const res = await postStudentMessageData(data);
        setIsLoading(false);
        if(res && res.message){
            handleShowSnackbar('error',res.message);
        }else if(res){
            handleShowSnackbar('success',`Your message has been successfully sent to the ${messageTo}.`);
        }
        handleClose();
    };

    const handleClose = () => {
        setIsopen(false);
        setFile(null);
        setFilename(null);
        setMessage(null);
        setReason(null);
        setIsSubmit(false);
        setMessageTo(null);
    };

    const handleSubmit = () => {
        setIsSubmit(true);
        if(!reason || !message)return;
        setIsLoading(true);
        setTimeout(()=>{
            isUser === 'Student' ? postMessageData() : sendMessageData();
        },2000);
    }

    const sendMessageData = async () => {
        const data = {
            Course : course,
            BatchName : batchName,
            StudentId : stdId,
            BatchMessage : `${DateTime()}~${reason}~${message}~${file && filename ? file : 'N/A'}`
        }
        const res = await postBatchToStudentMessageData(data);
        if(res && res.message){
            handleShowSnackbar('error',res.message);
        }else if(res){
            await sendEmail(`${course} Team`, email, 'New Message From VCube Software Solutions', name, 'Message');
            handleShowSnackbar('success',`Your message has been successfully sent to the ${name}.`);
        }
        handleClose();
        setIsLoading(false);
    }

  return (
    <Dialog open={isOpen} sx={{zIndex : '700'}} onClose={handleClose}>
        <img src='/images/V-Cube-Logo.png' alt='' width='20%' className='ml-[40%]' />
        {isUser === 'Student' && !messageTo && <>
            <DialogTitle>Who do you want to Send a Message ?</DialogTitle>
            <DialogContent sx={{marginBottom : '50px'}}>
                <DialogContentText className='flex items-center justify-between'>
                    <ChecklistRounded sx={{fontSize : '30px', marginTop : '20px'}}/>
                    <FormControl className='w-[93%]' variant='standard'>
                        <InputLabel sx={{fontSize : '20px'}}>Select an Option</InputLabel>
                        <Select
                            value={messageTo}
                            onChange={(e)=>setMessageTo(e.target.value)}
                            sx={{width: '100%',
                            '& .MuiInputBase-input': {
                            fontSize: '20px',
                            padding: '5px 0',
                            },
                            '& .MuiInputLabel-root': {
                            fontSize: '20px',
                            },}}
                            >
                            <MenuItem value={`${course} Team`}>{`${course}`} Team</MenuItem>
                            <MenuItem value='Placement Team'>Placement Team</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContentText>
            </DialogContent>
        </>}
        {(isUser !== 'Student' || messageTo) && <>
        <DialogTitle className='flex items-center justify-between'><Typography variant='h5'>Message to {isUser === 'Student' ? messageTo : name} <MailRounded sx={{marginBottom : '5px'}} /></Typography>
            {isUser === 'Student' && <Typography color='primary' className='cursor-pointer hover:underline' onClick={()=>{setMessageTo(null);setIsSubmit(false)}}>Change Message</Typography>}
        </DialogTitle>
            <DialogContent>
            <DialogContentText>
                <TextField
                    label='Reason'
                    value={reason}
                    onChange={(e)=>setReason(e.target.value)}
                    error={isSubmit && !reason}
                    helperText={isSubmit && !reason ? 'Specify a reason.' : ''}
                    className='w-full'
                    inputProps={{ maxLength: 65 }}
                    placeholder='Max 65 Characters'
                    required
                    multiline
                    rows={1}
                    sx={{margin : '10px 0 60px 0',height : '40px',
                        '& .MuiInputBase-input': {
                            fontSize: '20px',
                            padding: '5px 0',
                        },
                        '& .MuiInputLabel-root': {
                            fontSize: '20px',
                            background : 'white',
                            width : '85px'
                        },
                    }}/>
                <TextField 
                label='Your Message'
                placeholder=''
                value={message}
                onChange={(e)=>setMessage(e.target.value)}
                error={isSubmit && !message}
                helperText={isSubmit && !message ? 'Provide Your Message' : ''}
                required
                multiline
                rows={5}
                className='w-full'
                sx={{
                    '& .MuiInputBase-input': {
                        fontSize: '20px',
                        padding: '5px 0',
                    },
                    '& .MuiInputLabel-root': {
                        fontSize: '20px',
                        background : 'white',
                        width : '147px'
                    },
                 }}/>
                <Typography className='w-[60%] h-20 flex flex-col items-center justify-between' sx={{marginTop : '20px', marginLeft : '20%'}}>
                    <Box sx={{ m: 1, position: 'relative'}} className="w-full flex items-center justify-center">
                    <Button disabled={loading} startIcon={file && filename ? <CheckCircleRounded /> : <AttachFileRounded />} color={file && filename ? 'success' : 'primary'} variant='contained' component="label" role={undefined} tabIndex={-1}>
                        <VisuallyHiddenInput type="file" onChange={(e)=>handleFileChange(e)} />
                        {file && filename ? 'File Uploaded' : 'Upload File Here  (Optional)'}
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
                    )}</Box>
                    <Typography>{file && filename ? filename : ''}</Typography>
                </Typography>
            </DialogContentText>
        </DialogContent>
        <DialogActions className='mb-3'>
            <Button variant='outlined' onClick={handleClose}>Cancel</Button>
            <Button variant='contained' sx={{width : '120px', marginRight : '10px'}} onClick={handleSubmit}>Send</Button>
        </DialogActions>
        </>}
    </Dialog>
  )
}

export default SendMessageForm;