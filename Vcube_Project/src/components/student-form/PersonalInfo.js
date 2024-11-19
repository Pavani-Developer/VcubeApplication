import React, { useContext, useEffect, useState } from 'react';
import { CloudUpload, PeopleRounded, EmailRounded, LocalPhoneRounded, BadgeRounded, ArrowForward, CancelRounded, CheckCircleRounded, WcRounded, WorkOutlineOutlined, WorkRounded, WifiRounded, WifiOffRounded } from '@mui/icons-material';
import { Box, Button, Link, FormControl, Select, MenuItem, InputLabel, Typography, FormHelperText, CircularProgress, IconButton } from '@mui/material';
import styled from 'styled-components';
import NumberInput from '../noSpinnerField';
import InputField from '../InputField';
import { BatchContext } from '../api/batch';
import { StudentsAuthContext } from '../api/StudentsAuth';

const PersonalInfo = ({ personalData, setPersonalData, resumeName, setResumeName, handleNext, handleShowSnackbar, setOpenDialog, setDialogMsg, user, selectedCourse, editDetails }) => {
    const { fetchBatchData } = useContext(BatchContext);
    const { checkStudentDetails } = useContext(StudentsAuthContext);
    const [batchData, setBatchData] = useState([]);
    const [batch, setBatch] = useState(null);
    const [name, setName] = useState(null);
    const [email, setEmail] = useState(null);
    const [phone, setPhone] = useState(null);
    const [alterPhone, setAlterPhone] = useState(null);
    const [gender, setGender] = useState(null);
    const [resume, setResume] = useState(null);
    const [image, setImage] = useState(null);
    const [linkedIn, setLinkedIn] = useState(null);
    const [gitHub, setGithub] = useState(null);
    const [mode, setMode] = useState(null);
    const [isSubmit, setIsSubmit] = useState(false);
    const [loading1, setLoading1] = useState(false);
    const [loading2, setLoading2] = useState(false);

    const fetchData = async () => {
      const res = await fetchBatchData(selectedCourse);
      if (res && res.message){
        handleShowSnackbar('error',res.message);
      }else if(Array.isArray(res) && res.length > 0){
        setBatchData(res);
      }
    }

    useEffect(()=>{
      fetchData();
    },[])

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

    useEffect(()=>{
        setImage(personalData.Image || null);
        setBatch(personalData.BatchName || null);
        setName(personalData.Name || null);
        setPhone(personalData.Phone || null);
        setAlterPhone(personalData.Alernate_Phone || null);
        setEmail(personalData.Email || null);
        setGender(personalData.Gender || null);
        setLinkedIn(personalData.Linkedin || null);
        setGithub(personalData.Github || null);
        setResume(personalData.Resume || null);
        setMode(personalData.Mode || null);
    },[personalData])

    const handleFileChange = (event, type) => {
      const file = event.target.files[0];
      (type === 'Image') ? setLoading1(true) : setLoading2(true);
      setTimeout(()=>{
        if (file) {
          if((file.size / (1024 * 1024)).toFixed(2) <= 5){
            if(type === 'Resume'){
              setResumeName(file.name);
              const extension = file.name.split('.');
              const extensionType = extension[extension.length - 1];
              if(!(extensionType === 'pdf' || extensionType === 'doc' || extensionType === 'docx')){
                setResume(null);
                handleShowSnackbar('error','Please Upload a Valid Resume File.');
                return;
              }
            }else if(type === 'Image'){
              if(!acceptedFormats.includes(file.type)){
                handleShowSnackbar('error','Please Upload a Valid Image.');
                return;
              }
            }
            const reader = new FileReader();
            reader.onloadend = () => {
              (type === 'Image') ? setImage(reader.result) : setResume(reader.result);
            };
            reader.readAsDataURL(file);
        }else{
          handleShowSnackbar('error','You can upload files up to 5 MB. Files larger than 5 MB will not be accepted.');
        }
      }
      setLoading1(false);
      setLoading2(false);
      },1000)
    };

    const checkPhoneError = (getvalue)=>{
      const value = getvalue && getvalue.toString();
      if (isSubmit && !value)return true;
      if (value && !(value.startsWith('9') || value.startsWith('8') || value.startsWith('7') || value.startsWith('6')))return true;
      if(value && value.length !== 10)return true;
      return false;
    }

    const acceptedFormats = ['image/jpeg', 'image/png', 'image/gif', 'image/tiff', 'image/bmp', 'image/webp', 'image/heif', 'image/svg+xml'];


    const handelSubmit = async () => {
      setIsSubmit(true);
      if(!email || !phone)return;
        const res1 = await checkStudentDetails(email,selectedCourse);
        const res2 = await checkStudentDetails(phone,selectedCourse);
      if(editDetails || (res1.status === false && res2.status === false && 
        (res1.code === 403 || res1.code === 406 || res1.code === 404) &&
        (res2.code === 403 || res2.code === 406 || res2.code === 404))){
        if (
          image &&
          resume &&
          batch &&
          name &&
          !checkPhoneError(phone) &&
          !checkPhoneError(alterPhone) &&
          email && email.includes('@') &&
          linkedIn.startsWith('https://') &&
          phone !== alterPhone &&
          mode
        ){
          saveData();
          handleNext();
        }
      }else if(res1.status === false && res2.status === false){
        handleShowSnackbar('error','Something went wrong. Please try again later.');
      }else if(res1.status === true || res2.status === true){
        if(res1.status === true)handleShowSnackbar('error','Email is already taken. Please choose another one.');
        if(res2.status === true)handleShowSnackbar('error','Phone is already taken. Please choose another one.');
      }
    }

    const saveData = () => {
      const data = {
        Image : image,
        BatchName : batch,
        Name : name,
        Phone : phone,
        Alernate_Phone : alterPhone,
        Email : email,
        Gender : gender,
        Linkedin : linkedIn,
        Github : gitHub,
        Resume : resume,
        Mode : mode
      }
      setPersonalData(data);
    }

  return (
    <>
    <Box className="w-full h-[27rem] mt-5 mb-14 flex flex-row items-center justify-between">
        <Box className='w-1/4 h-96 flex flex-col items-center justify-center'>
        <img src={image ? image : '/images/Empty-Men-Icon.png'} alt='' width="180px" className="h-[180px] border-[1px] border-gray-300 rounded-full object-contain" />
        <Box sx={{ m: 1, position: 'relative', marginTop : '5%' }} className="flex items-center justify-center w-full">
        <Button
          disabled={loading1}
          component="label"
          role={undefined}
          tabIndex={-1}
          variant="contained"
          startIcon={(image) ? <CheckCircleRounded /> : <CloudUpload />}
          color={(isSubmit && !image) ? 'error' : (image) ? 'success' : 'primary'}
          sx={{width: '70%'}}
        >
          {(image) ? 'Image Uploaded' : 'Upload Image'}
          <VisuallyHiddenInput type="file" accept="image/*" onChange={(e)=>handleFileChange(e,'Image')} />
          </Button>
          {loading1 && (
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
        </Box>
        <Box className="grid grid-cols-2 w-[70%]" sx={{columnGap : '20px'}}>
          <Box className="w-[95%] h-20 flex items-start justify-between">
            <PeopleRounded className="text-gray-500 mt-6" sx={{fontSize : '30px'}} />
          <FormControl variant="standard" sx={{width : '88%'}}>
          <InputLabel shrink={batch ? true : false} sx={{fontSize : '20px', color : (isSubmit && !batch) ? '#d32f2f' : ""}}>Select Batch *</InputLabel>
          <Select
            readOnly={user === 'Student'}
            error={isSubmit && !batch}
            value={batch}
            onChange={(e)=>setBatch(e.target.value)}
            sx={{width: '100%',
              '& .MuiInputBase-input': {
              fontSize: '20px',
              padding: '5px 0',
              },
              '& .MuiInputLabel-root': {
              fontSize: '20px',
              },}}
              >
            {batchData && batchData.length > 0 && batchData.map((data)=>(
              <MenuItem value={data.BatchName}>{data.BatchName}</MenuItem>
            ))}
          </Select>
          <FormHelperText sx={{color : '#d32f2f'}}>{(isSubmit && !batch) ? "Select Batch" : ""}</FormHelperText>
          </FormControl>
          </Box>

          <Box className="w-[95%] h-20 flex items-start justify-between">
          <BadgeRounded className="text-gray-500 mt-5" sx={{fontSize : '30px'}} />
            <InputField required value={name} disabled={user === 'Student'} onChange={(e)=>setName(e.target.value)} error={isSubmit && !name} helperText={isSubmit && !name ? "Enter valid Name" : ""}  label="Full Name" sx={{width: '88%'}}/>
          </Box>

          <Box className="w-[95%] h-20 flex items-start justify-between">
          <LocalPhoneRounded className="text-gray-500 mt-5" sx={{fontSize : '30px'}} />
            <NumberInput label="Mobile (Active Whatsapp No.)" disabled={user === 'Student'} value={phone} onChange={(e)=>setPhone(e.target.value)} error={checkPhoneError(phone) || (phone && alterPhone && phone === alterPhone)} 
              helperText={checkPhoneError(phone) ? "Enter valid Mobile No." : (phone && alterPhone && phone === alterPhone) ? "Phone and Alternate Phone cannot be the same." : ""} required sx={{width: '88%'}}/>
            </Box>

            <Box className="w-[95%] h-20 flex items-start justify-between">
            <LocalPhoneRounded className="text-gray-500 mt-5" sx={{fontSize : '30px'}} />
            <NumberInput label="Alternate Mobile No." value={alterPhone} onChange={(e)=>setAlterPhone(e.target.value)} error={checkPhoneError(alterPhone) || (phone && alterPhone && phone === alterPhone)} 
              helperText={checkPhoneError(alterPhone) ? "Enter valid alternate Mobile No." : (phone && alterPhone && phone === alterPhone) ? "Phone and Alternate Phone cannot be the same." : ""} required sx={{width: '88%'}} />
            </Box>

            <Box className="w-[95%] h-20 flex items-start justify-between">
            <EmailRounded className="text-gray-500 mt-5" sx={{fontSize : '30px'}} />
            <InputField value={email} disabled={user === 'Student'} onChange={(e)=>setEmail(e.target.value)} error={(isSubmit && !email) || (email && !email.includes('@'))} helperText={(isSubmit && !email) || (email && !email.includes('@')) ? "Enter valid name" : ""} required label="Email" sx={{width: '88%'}} />
            </Box>

            <Box className="w-[95%] h-20 flex items-start justify-between">
            <WcRounded className="text-gray-500 mt-6" sx={{fontSize : '30px'}} />
              <FormControl variant="standard" sx={{width : '88%'}}>
              <InputLabel shrink={gender ? true : false} sx={{fontSize : '20px', color : (isSubmit && !gender) ? '#d32f2f' : ""}}>Select Gender *</InputLabel>
              <Select
                error={isSubmit && !gender}
                value={gender}
                onChange={(e)=>setGender(e.target.value)}
                sx={{width: '100%',
                  '& .MuiInputBase-input': {
                  fontSize: '20px',
                  padding: '5px 0',
                  },
                  '& .MuiInputLabel-root': {
                  fontSize: '20px',
                  },}}
                  >
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
              </Select>
              <FormHelperText sx={{color : '#d32f2f'}}>{(isSubmit && !gender) ? "Select Gender" : ""}</FormHelperText>
              </FormControl>
            </Box>

            <Box className="w-[95%] h-20 flex items-start justify-between">
            <img src="/images/linkedin-logo.png" alt='' className="mt-6" width='28px' />
            <InputField value={linkedIn} onChange={(e)=>setLinkedIn(e.target.value)} required label="Linkedin URL" error={(isSubmit && !linkedIn) || (linkedIn && !linkedIn.startsWith('https://'))} helperText={(isSubmit && !linkedIn) || (linkedIn && !linkedIn.startsWith('https://')) ? "Enter valid Linkedin URL" : ""} sx={{width: '88%'}} />
            </Box>

            <Box className="w-[95%] h-20 flex items-start justify-between">
            <img src="/images/github-logo.png" alt='' className="mt-5" width='30px' />
            <InputField value={gitHub} onChange={(e)=>setGithub(e.target.value)} error={gitHub && !gitHub.startsWith('https://')} helperText={gitHub && !gitHub.startsWith('https://') ? "Enter valid Github URL" : ""} label="Github URL" sx={{width: '88%'}} />
            </Box>

            <Box className="w-[95%] h-20 flex items-start justify-between">
            <WcRounded className="text-gray-500 mt-6" sx={{fontSize : '30px'}} />
              <FormControl variant="standard" sx={{width : '88%'}}>
              <InputLabel shrink={mode ? true : false} sx={{fontSize : '20px', color : (isSubmit && !mode) ? '#d32f2f' : ""}}>Select Class Mode *</InputLabel>
              <Select
                error={isSubmit && !mode}
                value={mode}
                onChange={(e)=>setMode(e.target.value)}
                sx={{width: '100%',
                  '& .MuiInputBase-input': {
                  fontSize: '20px',
                  padding: '5px 0',
                  },
                  '& .MuiInputLabel-root': {
                  fontSize: '20px',
                  },}}
                  >
                <MenuItem value="Offline">Offline</MenuItem>
                <MenuItem value="Online">Online</MenuItem>
              </Select>
              <FormHelperText sx={{color : '#d32f2f'}}>{(isSubmit && !gender) ? "Select Mode" : ""}</FormHelperText>
              </FormControl>
          </Box>
          <Box className="w-[95%] h-20 flex flex-col items-center justify-center">
            <Box sx={{ m: 1, position: 'relative'}} className="w-full flex items-center justify-center">
              <Button disabled={loading2} startIcon={(resume) ? <CheckCircleRounded /> : <CloudUpload />} color={(resume) ? 'success' : (isSubmit && !resume) ? 'error' : 'primary'} 
              component="label" role={undefined} tabIndex={-1} variant='contained' sx={{width : '70%',marginBottom : (resumeName) ? '5px' : '0', height : '35px'}}>
              <VisuallyHiddenInput type="file" accept=".pdf,.doc,.docx" onChange={(e)=>handleFileChange(e,'Resume')} />
              {(resume) ? 'Resume Uploaded' : 'Upload Resume'}</Button>
              {loading2 && (
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
            {user === 'Student' && resume ? (<Link href={resume} target='_blank'>View</Link>) : 
            (<Typography>
              {resumeName && (
                resumeName.endsWith('.pdf') ||
                resumeName.endsWith('.doc') ||
                resumeName.endsWith('.docx')
              ) ? (
                resumeName
              ) : null}
            </Typography>)} 
            </Box>

        </Box>
    </Box>
    <Box className="flex justify-between mt-5">
        <Button sx={{visibility : (user === 'Student' || editDetails) ? 'hidden' : 'visible'}} onClick={()=>{setDialogMsg('Back');setOpenDialog(true)}}>
          Back
        </Button>
        <Button variant="contained" endIcon={<ArrowForward />}
        onClick={handelSubmit}
        >
          Next
        </Button>
    </Box>
    </>
  )
}

export default PersonalInfo;
