import React, { useCallback, useEffect, useState } from 'react';
import { Dialog, Paper, IconButton, DialogTitle, Box } from '@mui/material';
import { Close, CloseRounded } from '@mui/icons-material';
import DragAndDropList from './DragandDropFile';
import SimpleStepper from './Stepper';
import { closeSnackbar, useSnackbar } from 'notistack';
import LoadingSkeleton from '../skeleton';
import CustomDialog from '../dashboard/Dialog';
import * as XLSX from 'xlsx';

const StudentForm = ({ open, setOpen, selectedCourse, selectedBatch, isUser, refreshData }) => {
    const { enqueueSnackbar } = useSnackbar();
    const [fileData, setFileData] = useState(null);
    const [file, setFile] = useState(null);
    const [fileError, setFileError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [uploadManually, setUploadManually] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMsg, setDialogMsg] = useState(null);

    const handleDrop = (acceptedFiles) => {
        setLoading(true);
        setTimeout(()=>{
            const file = acceptedFiles[0];
            const extension = file.name.split('.').pop().toLowerCase();
            if (extension === 'xls' || extension === 'xlsx') {
                setFile(file);
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                    const data = new Uint8Array(event.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet);
                    setFileData(jsonData);
                    } catch (error) {
                    setFileError(true);
                    } finally {
                    setLoading(false);
                    setFileError(false);
                    }
                };
                reader.readAsArrayBuffer(file);
            } else {
                setLoading(false);
                setFileError(true);
            }
        },2000)
      };
      

      const handleShowSnackbar = useCallback((variant, message) => {
        enqueueSnackbar(message, { 
          variant: variant, 
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
          action: (key) => (
            <IconButton onClick={() => closeSnackbar(key)}><CloseRounded color="inherit" /></IconButton>
          ),
        });
      }, [enqueueSnackbar, closeSnackbar]);

    useEffect(()=>{
        if(isLoading){
            setTimeout(()=>{
                setIsLoading(false);
            },3000)
        }
    },[isLoading])

    const handleClose = () => {
        setOpen(false);
        setUploadManually(false);
        setDialogMsg(null);
        setFile(null);
        setFileData(null);
        setFileError(false);
    };

  return (
    <Dialog
    fullScreen
    open={open}
    sx={{zIndex : '900'}}
    >
    <Paper className="relative w-full h-24 flex items-center justify-center">
        <img className="absolute left-3" src="/images/V-Cube-Logo.png" width="120px" alt='' />
        <DialogTitle sx={{fontSize : '150%'}}>Learner Intake and Registration Form</DialogTitle>
        <IconButton sx={{position : 'absolute', right : '1%', top : '20%'}} onClick={()=>{if(uploadManually){setOpenDialog(true);setDialogMsg('Close')}else{handleClose()}}}><Close sx={{fontSize : '35px', color : 'black'}}/></IconButton>
    </Paper>
    <Box className="h-full flex flex-col items-center justify-center">
        {uploadManually ? (
            <SimpleStepper setUploadManually={setUploadManually} handleShowSnackbar={handleShowSnackbar} setIsLoading={setIsLoading} setOpenDialog={setOpenDialog} setIsOpen={setOpen} setDialogMsg={setDialogMsg} selectedCourse={selectedCourse} refreshData={refreshData} />
        ) : (
            <DragAndDropList setUploadManually={setUploadManually} onDrop={handleDrop} fileData={fileData} fileName={file && file.name} fileError={fileError} handleShowSnackbar={handleShowSnackbar} setIsLoading={setIsLoading} loading={loading} 
                selectedCourse={selectedCourse} selectedBatch={selectedBatch} isUser={isUser} handleClose={handleClose} refreshData={refreshData} />
        )
        }
    </Box>
        <CustomDialog open={openDialog} title={"Do you really want to close or return ?"} content={"The changes you made not be saved."} 
                    btnValue={'Confirm'} dialogMsg={dialogMsg} setDialog={setOpenDialog} setIsLoading={setIsLoading} handle_Close={handleClose} 
                    setUploadManually={setUploadManually} />
        {isLoading && <LoadingSkeleton/>}
    </Dialog>
  )
}

export default StudentForm;