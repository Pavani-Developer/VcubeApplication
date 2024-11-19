import React, { useContext, useEffect, useState } from 'react';
import { Dialog, Paper, IconButton, DialogTitle, Box } from '@mui/material';
import { Close } from '@mui/icons-material';
import SimpleStepper from '../student-form/Stepper';
import { useSnackbar } from 'notistack';
import LoadingSkeleton from '../skeleton';
import CustomDialog from '../dashboard/Dialog';

const StudentDetailsEditForm = ({ isOpen, setIsOpen, student_Personal_Details, student_Education_Details, student_Placement_Details, user, editDetails=false, joiningDate, selectedCourse, refreshData }) => {
    const { enqueueSnackbar } = useSnackbar();
    const [isLoading, setIsLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMsg, setDialogMsg] = useState(null);      

    const handleShowSnackbar = (variant, message) => {
        enqueueSnackbar(message, { variant: variant, anchorOrigin: { vertical: 'top', horizontal: 'right' } });
    };

    useEffect(()=>{
        if(isLoading){
            setTimeout(()=>{
                setIsLoading(false);
            },3000)
        }
    },[isLoading])

    const handleClose = () => {
        setIsOpen(false);
        setDialogMsg(null);
        setOpenDialog(false);
    };

  return (
    <Dialog
    fullScreen
    open={isOpen}
    sx={{zIndex : '900'}}
    >
    <Paper className="relative w-full h-24 flex items-center justify-center">
        <img className="absolute left-3 -top-3.5" src="/images/V-Cube-Logo.png" alt='' width="150px" />
        <DialogTitle sx={{fontSize : '150%'}}>Learner Intake and Registration Form</DialogTitle>
        <IconButton sx={{position : 'absolute', right : '1%', top : '20%'}} onClick={()=>setOpenDialog(true)}><Close sx={{fontSize : '35px', color : 'black'}}/></IconButton>
    </Paper>
    <Box className="h-full flex flex-col items-center justify-center">
        <SimpleStepper handleShowSnackbar={handleShowSnackbar} setIsLoading={setIsLoading} setOpenDialog={setOpenDialog} setIsOpen={setIsOpen} 
                        setDialogMsg={setDialogMsg} user={user} student_Personal_Details={student_Personal_Details} joiningDate={joiningDate} selectedCourse={selectedCourse}
                        student_Education_Details={student_Education_Details} student_Placement_Details={student_Placement_Details} editDetails={editDetails} refreshData={refreshData} />
    </Box>
        <CustomDialog open={openDialog} title={"Do you really want to close or return ?"} content={"The changes you made not be saved."} btnValue={'Return to Details'}
                    dialogMsg={dialogMsg} setDialog={setOpenDialog} setIsLoading={setIsLoading} handle_Close={handleClose} />
        {isLoading && <LoadingSkeleton/>}
    </Dialog>
  )
}

export default StudentDetailsEditForm