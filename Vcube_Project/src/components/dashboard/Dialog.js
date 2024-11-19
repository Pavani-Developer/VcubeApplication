import React, { useEffect, useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';

const CustomDialog = ({ open, title, content, btnValue, dialogMsg, setDialog, setIsLoading, handle_Close, setUploadManually, setImportData }) => {
    const [isOpen, setIsOpen]= useState(false);

    useEffect(()=>{
        setIsOpen(open);
    },[open])

    const handleClose = () => {
        setIsOpen(false);
        setDialog(false);
    };
    const handleSubmit = () => {
        setIsLoading(true);
        if(dialogMsg === 'Back'){
            setUploadManually(false);
        }else if(dialogMsg === 'Close'){
            handle_Close();
        }else if(btnValue === 'Export'){
            setImportData(true);
        }else if(btnValue === 'Return to Details'){
            handle_Close();
        };
        handleClose();
    };

  return (
    <Dialog
        open={isOpen}
        onClose={handleClose}
        sx={{zIndex : '900'}}
    >
        <DialogTitle>
        {title}
        </DialogTitle>
        <DialogContent>
        <DialogContentText>
        {content}
        </DialogContentText>
        </DialogContent>
        <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant='contained'>
            {btnValue}
        </Button>
        </DialogActions>
    </Dialog>
  )
}

export default CustomDialog;