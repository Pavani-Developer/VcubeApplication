import React, { useContext, useState } from 'react';
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, selectClasses, TextField, Typography } from '@mui/material';
import { AttachFileRounded, BusinessRounded, CheckCircleRounded, LocationOnRounded, UploadFileRounded, WorkRounded } from '@mui/icons-material';
import InputField from '../InputField';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers-pro';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import styled from 'styled-components';
import { PlacementsContext } from '../api/Placements';

const JobAnnoucement = ({ isOpen, setIsOpen, selectedCourse, selectBatchname, setIsLoading, handleShowSnackbar }) => {
  const { postPostsData } = useContext(PlacementsContext);
  const [company, setCompany] = useState(null);
  const [location, setLocation] = useState(null);
  const [url, setUrl] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [file, setFile] = useState(null);
  const [isSubmit, setIsSubmit] = useState(false);
  const [description, setDescription] = useState(null);
  const [jobFrom, setJobFrom] = useState(null);
  const [jobSubmit, setJobSubmit] = useState(null);
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

  const handleFile = (e) => {
    setLoading(true);
    setTimeout(()=>{
        const file = e.target.files[0];
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
      setLoading(false);
    },2000)
  };

  const handelSubmit = () => {
    setIsSubmit(true);
    if (!url || (url && !url.startsWith('https://')) ||
        !jobFrom || !jobSubmit || !description || !location || !company ||
        (description && description.length < 25))return;
    setIsLoading(true);
    submitPost();
    handleClose();
  }

  const submitPost = async () => {
    const s_date = jobFrom.$d.toString().split(" ");
    const e_date = jobSubmit.$d.toString().split(" ");
    const data = {
      File : (file && fileName) ? file : 'N/A',
      Course : selectedCourse,
      BatchName : selectBatchname,
      Company_Name : `${company}~${location}`,
      Post_Link : url,
      From_Date : `${s_date[0]}, ${s_date[1]}-${s_date[2]}-${s_date[3]}`,
      To_Date : `${e_date[0]}, ${e_date[1]}-${e_date[2]}-${e_date[3]}`,
      Description : description
    }
    const res = await postPostsData(data);
    if (res && res.message){
      handleShowSnackbar('error',res.message);
    }else{
      handleShowSnackbar('success','Job Announcement Posted Successfully.');
    }
    setIsLoading(false);
  };

  const handleClose = () => {
    setUrl(null);
    setFile(null);
    setFileName(null);
    setJobFrom(null);
    setJobSubmit(null);
    setDescription(null);
    setIsSubmit(false);
    setIsOpen(false);
    setCompany(null);
    setLoading(null);
  }

  return (
    <Dialog open={isOpen} sx={{zIndex : '700'}}>
      <img src='/images/V-Cube-Logo.png' width='20%' alt='' className='ml-[40%]' />
      <DialogTitle className='flex items-center' variant='h5'>Post Job Annoucement <WorkRounded sx={{fontSize : '30px', marginLeft : '10px'}} /></DialogTitle>
      <DialogContent>
        <Box className='flex items-start h-20 justify-between w-full'>
          <BusinessRounded sx={{marginTop : '25px'}} />
          <InputField className='w-[42%]' label='Company Name'
            value={company} onChange={(e)=>setCompany(e.target.value)} 
            error={isSubmit && !company}
            helperText={isSubmit && !company ? "Enter Company Name" : ""} />

          <LocationOnRounded sx={{marginTop : '25px'}} />
          <InputField className='w-[43%]' label='Company Location'
            value={location} onChange={(e)=>setLocation(e.target.value)} 
            error={isSubmit && !location}
            helperText={isSubmit && !location ? "Enter Company Location" : ""} />
        </Box>
        <Box className='flex items-start h-20 justify-between w-full'>
          <AttachFileRounded sx={{marginTop : '25px'}} />
          <InputField className='w-[93%]' label='Provided Job URL'
            value={url} onChange={(e)=>setUrl(e.target.value)} 
            error={(isSubmit && !url) || (url && (!url || !url.startsWith('https://')))}
            helperText={url && (!url || !url.startsWith('https://')) ? "Enter Valid URL" : (isSubmit && !url) ? "Provide URL" : ""} />
        </Box>
        <Box className='flex flex-col items-center h-20 justify-start w-full pt-2'>
            <Box className='w-[50%] h-10 relative'>
              <Button startIcon={fileName && file ? <CheckCircleRounded/> : <UploadFileRounded />} 
              color={fileName && file ? 'success' : 'primary'}
              variant='contained' sx={{width : '100%'}}
              disabled={loading}
              component="label"
              role={undefined}
              tabIndex={-1}>
              {fileName && file ? 'File Uploaded' : 'Upload Optional File'}
              <VisuallyHiddenInput type="file" onChange={(e)=>handleFile(e)} />
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
            <Typography sx={{marginTop : '5px'}}>{fileName}</Typography>
        </Box>
          <Box className="w-full flex items-center justify-center mb-7">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DemoContainer components={['DatePicker', 'DatePicker']}>
                <DatePicker
                    label='Application Announce Date'
                    value={jobFrom}
                    onChange={(newValue) => setJobFrom(newValue)}
                />
                <DatePicker
                    label='Application End Date'
                    value={jobSubmit}
                    onChange={(newValue) => setJobSubmit(newValue)}
                />
            </DemoContainer>
            </LocalizationProvider>
          </Box>
        <TextField multiline rows={3} label='Description' className='w-full h-32' 
        value={description} onChange={(e)=>setDescription(e.target.value)}
        error={(isSubmit && !description) || (description && description.length < 25)} helperText={isSubmit && !description ? "Enter Description" : (description && description.length < 25) ? "Description shoud contain atleast 25 characters" : ""} />
      </DialogContent>
      <DialogActions>
        <Button variant='outlined' onClick={handleClose}>Cancel</Button>
        <Button variant='contained' onClick={handelSubmit}>Submit</Button>
      </DialogActions>
    </Dialog>
  )
}

export default JobAnnoucement;