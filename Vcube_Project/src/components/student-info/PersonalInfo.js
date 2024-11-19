import React, { startTransition, useContext, useEffect, useState } from 'react';
import { Box, Typography, Button, Link, IconButton, Tooltip, Badge, Dialog, DialogTitle, DialogContent, DialogActions, Checkbox, FormGroup, FormControlLabel, TextField } from '@mui/material';
import { CalendarMonthRounded, CancelRounded, CheckCircleRounded, CloseRounded, DeleteForeverRounded, DescriptionRounded, DoneRounded, EditRounded, Email, LocationOnRounded, NotInterestedRounded, Phone, PhoneAndroid, SendRounded, WcRounded } from '@mui/icons-material';
import { StudentsContext } from '../api/students';
import { DateTime } from '../date-time';

const PersonalInfo = ({ user, stdId, student_Details, location, access, status, handleShowSnackbar, setMessageForm, fetchStdData, handleClose, JoiningDate, fetchData }) => {
    const { patchStudentData, deleteStudentData, deleteStudentRecords } = useContext(StudentsContext);
    const dateTime = DateTime().split(' ');
    const [changeDetail, setChangeDetail] = useState(false);
    const [method, setMethod] = useState(null);
    const [isSwitch, setIsSwitch] = useState(true);
    const [deleteCheck, setDeleteCheck] = useState(false);
    const [emailEdit, setEmailEdit] = useState(false);
    const [hoverEmail, setEmailHover] = useState(false);
    const [updatedEmail, setUpdatedEmail] = useState(null);

    useEffect(()=>{
        startTransition(()=>{
            setIsSwitch(access === 'Access')   
        })
    },[access])


    const changeStdDetails = async () => {
        setMethod(null);
        setChangeDetail(false);
        const data = {
            id : stdId,
        }
        if(method === 'Status'){
            data['Status'] = status === 'Active' ? `Discontinued on ${dateTime[0]}` : 'Active';
        }else if(method === 'Permission'){
            data['Permission'] = access === 'Access' ? 'Denied' : 'Access';
        }
        const res = await patchStudentData(data);
        if (res === true){
            fetchStdData();
            method === 'Status' ? handleShowSnackbar('success',`Student status changed successfully.`) :
            handleShowSnackbar('success',data.Permission === 'Denied' ? 'The student login access has been revoked.' : 'Login access for the student has been re-enabled.');
        }else{
            handleShowSnackbar('error','Something went wrong. Please try again later.');
        }
    };

    const deleteStdDetails = async () => {
        setMethod(null);
        setChangeDetail(false);
        const res = await deleteStudentData(stdId);
        if (res === true){
            await deleteStudentRecords(stdId);
            handleShowSnackbar('success',`Student : ${student_Details.Name} has been deleted successfully.`);
            handleClose();
        }else{
            handleShowSnackbar('error','Something went wrong. Please try again later.');
        }
    }

    const handleCloseDeleteDialog = () => {
        setChangeDetail(false);
        setMethod(null);
        setDeleteCheck(false);
    }

    const handleEmailSubmit = async () => {
        if(!updatedEmail || !updatedEmail.includes('@')){
            handleShowSnackbar('error','Please enter a valid email address.');
            return;
        }else if(updatedEmail === student_Details.Email){
            handleShowSnackbar('error','You entered the same email address. Please provide a different email to update.');
            return;
        }
        student_Details.Email = updatedEmail;
        const data = {
            id : stdId,
            Email : updatedEmail,
            Personal_Info : JSON.stringify(student_Details)
        }
        const res = await patchStudentData(data);
        if(res === true){
            handleShowSnackbar('success','Email has been updated succesfully.');
            fetchData();
        }else{
            handleShowSnackbar('error','Error occured. Please try again later.');
        }
        setEmailEdit(false);
    }

    return (
        <Box className="w-full h-full flex flex-col items-center justify-start">
            <Typography variant='h5' sx={{margin : '10px 0', fontSize : '28px'}} ><strong>{student_Details.Course}</strong> - {student_Details.BatchName}</Typography>
            <Box className="w-full h-[70%] flex flex-row items-start justify-start">
                <Box className="w-full h-full flex flex-row items-start pl-10">
                    <Box className="w-1/3 h-96 flex flex-col items-center justify-evenly">
                        <img src={(!student_Details.Image || student_Details.Image === 'N/A') ? "/images/Empty-Men-Icon.png" : student_Details.Image} alt='' width="200px" className='border-[1px] border-gray-300 h-[200px] rounded-full object-contain'/>
                        {user !== 'Student' && user.split(' ')[0] !== 'Placements' && <Typography className='w-80 flex items-center justify-around' variant='h6'>Student Login Access : 
                            <Box className={`relative w-16 h-8 ${(isSwitch) ? 'bg-[#1976d2]' : 'bg-gray-400'} rounded-full flex items-center`}>
                                <IconButton className={`absolute ${(isSwitch) ? 'left-[1.40rem]' : 'left-[-0.60rem]'}`} sx={{transition : '0.3s ease-in-out', zIndex : '10'}} 
                                    onClick={()=>{setMethod('Permission');setChangeDetail(true);}}>
                                    {isSwitch ? (<CheckCircleRounded sx={{width : '2.25rem', height : '2.25rem', color : '#fff'}} />) : 
                                    (<CancelRounded sx={{width : '2.25rem', height : '2.25rem', color : '#fff'}} />)}
                                </IconButton>
                            </Box>
                        </Typography>}
                        <Typography variant='h6'>Mode : {student_Details.Mode}</Typography>
                    </Box>
                    <Box className="flex w-1/2 flex-col items-center justify-end ml-32">
                        <Typography variant='p' className='text-start w-full text-5xl' sx={{marginTop : '5%'}}>{student_Details.Name}</Typography>
                        <Box className='w-full grid grid-cols-2 gap-7 mt-10'>
                            <Typography variant='p'><CalendarMonthRounded className='text-gray-500' sx={{fontSize : '27px'}} /> &nbsp;{JoiningDate}</Typography>
                            <Typography variant='p' className='flex items-center'><strong>Status</strong> : <span className={status === 'Active' ? 'text-green-700 ml-2' : 'text-red-700 ml-2'}>{status}</span>
                                {status === 'Active' ? <CheckCircleRounded sx={{color : 'green', marginLeft : '5px'}} /> : <CancelRounded sx={{color : '#b91c1c', marginLeft : '5px'}} />}</Typography>
                            
                            <Typography onMouseOver={()=>user !== 'Student' && setEmailHover(true)} onMouseLeave={()=>user !== 'Student' && setEmailHover(false)} ><Email className='text-gray-500' /> &nbsp;
                                {!emailEdit ? student_Details.Email : <input value={updatedEmail} onChange={(e)=>setUpdatedEmail(e.target.value)} onKeyDown={(e)=>{if(e.key === 'Enter' && user !== 'Student')handleEmailSubmit()}} className='w-[80%] border-[1px] rounded-sm' />} 
                                <IconButton onClick={()=>{if(user !== 'Student'){setEmailEdit(!emailEdit);setUpdatedEmail(student_Details.Email)}}} size='small' sx={{visibility : hoverEmail || emailEdit ? 'visible' : 'hidden'}}>
                                    {user !== 'Student' && (emailEdit ? <CloseRounded  fontSize='small' className='text-gray-500 mb-1' /> : <EditRounded fontSize='small' className='text-gray-500 mb-1' />)}
                                </IconButton>
                            </Typography>
                            
                                <Typography><PhoneAndroid className='text-gray-500' /> &nbsp;+91 {student_Details.Phone}</Typography>
                                <Typography> <Phone className='text-gray-500' /> &nbsp;+91 {student_Details.Alernate_Phone}</Typography>
                            <Typography variant='p'><LocationOnRounded className='text-gray-500' /> &nbsp;{location && location.split('~')[0]}</Typography>
                            <Typography><WcRounded className='text-gray-500' /> &nbsp;{student_Details.Gender}</Typography>
                            <Box className="flex w-24 items-center justify-between">
                                <Tooltip title="Github"><IconButton onClick={()=> !student_Details.Github && handleShowSnackbar('error','Github Profile Link Not Provided.')}><Link href={student_Details.Github} target="main"><img src="/images/github-logo.png" alt='' width="30px" /></Link></IconButton></Tooltip>
                                <Tooltip title="Linkedin"><IconButton onClick={()=> !student_Details.Linkedin && handleShowSnackbar('error','Linkedin Profile Link Not Provided.')}><Link href={student_Details.Linkedin} target="main"><img src="/images/linkedin-logo.png" alt='' width="25px" /></Link></IconButton></Tooltip>
                            </Box>
                            <Link href={student_Details.Resume} target="_blank" rel="noopener noreferrer" onClick={()=> !student_Details.Resume && handleShowSnackbar('error','Resume Not Provided.')}>
                            <Button variant='contained' sx={{marginRight : '3%', width : '100%'}} startIcon={<DescriptionRounded />}>View Resume</Button>
                            </Link>
                            <Button variant='outlined' endIcon={<SendRounded />} onClick={()=>setMessageForm(true)}>Send Message</Button>
                            {(user !== 'Student' && user.split(' ')[0] !== 'Placements') && 
                            <><Button variant='outlined' color={status === 'Active' ? 'error' : 'success'} startIcon={status === 'Active' ? <NotInterestedRounded/> : <DoneRounded/>} 
                                    onClick={()=>{setMethod('Status');setChangeDetail(true)}}>{status === 'Active' ? 'Discontinue' : 'Activate'}
                                </Button>
                                <Button variant='contained' startIcon={<DeleteForeverRounded/>} color='error' onClick={()=>{setMethod('Delete');setChangeDetail(true)}}>Delete Student</Button>
                            </>}
                        </Box>
                    </Box>

                </Box>
            </Box>

            <Dialog open={changeDetail} onClose={handleCloseDeleteDialog} sx={{zIndex : changeDetail ? '700' : '-10'}}><DialogTitle variant='h6'>Are you sure you want to change the Student {method} ?</DialogTitle>
            <DialogContent>
            {method === 'Status' ? (
                <Typography variant='h6' color='grey'>
                    This will change student status to {status === 'Active' ? 'Discontinued' : 'Active'}.
                </Typography>
                ) : method === 'Permission' ? (
                <>
                    <Typography variant='h6' color='grey'>
                    This will change student permission to {access === 'Granted' ? 'Denied' : 'Granted'}.
                    </Typography>
                    {access === 'Granted' && (
                    <Typography variant='body1' color='grey'>
                        The student can no longer access their account.
                    </Typography>
                    )}
                </>
                ) : method === 'Delete' ? (
                <>
                    <Typography color='error'>Once this action is taken, it cannot be undone, and all Student records will be permanently deleted.</Typography><br/>
                    The following Student's data will be deleted :<br/>
                    • Student Attendance Data<br/>
                    • Student Messages Data<br/>
                    • Student Performance Data<br/>
                    • Student Class Recording WatchTime Data<br/>
                    <FormGroup className='mt-5'>
                        <FormControlLabel required control={<Checkbox onChange={(e)=>setDeleteCheck(e.target.checked)} />} label="I confirm that I have read and understand the effects." />
                    </FormGroup>
                </>
                ) : null}
            </DialogContent>
            <DialogActions>
                {method === 'Delete' ? (
                <>
                    <Button variant='outlined' color='error' onClick={handleCloseDeleteDialog}>Cancel</Button>
                    <Button variant='contained' color='error' disabled={!deleteCheck} onClick={deleteStdDetails}>Delete Student</Button>
                </>) : (
                <>
                    <Button variant='outlined' onClick={handleCloseDeleteDialog}>Cancel</Button>
                    <Button variant='contained' onClick={changeStdDetails}>Change Student {method}</Button>
                </>
                )}
            </DialogActions>
            </Dialog>
        </Box>
  )
};

export default PersonalInfo;