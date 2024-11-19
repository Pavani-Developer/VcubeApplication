import React, { startTransition, useContext, useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, InputAdornment, TextField, Typography } from '@mui/material';
import { AccountCircleRounded, AccountTreeRounded, DnsRounded, HttpsRounded, StorageRounded } from '@mui/icons-material';
import { StudentsAuthContext } from '../api/StudentsAuth';

const StudentConfigForm = ({ handleShowSnackbar, isOpen, setIsOpen, fetchStdData, stdId }) => {
    const { postStudentConfigs } = useContext(StudentsAuthContext);
    const [student_config, setStudent_config] = useState({
        host: '',
        database: '',
        username: '',
        password: '',
        port: ''
    });
    const [isSubmit, setIsSubmit] = useState(false);

    const handleChange = (e) => {
    const { name, value } = e.target;
    setStudent_config(prevConfig => ({
        ...prevConfig,
        [name]: name === 'port' ? parseInt(value, 10) || '' : value
    }));
    };

    const handleSubmit = async () => {
      startTransition(async () => {
        setIsSubmit(true);
        if(student_config.host === '' || student_config.database === '' || student_config.username === '' ||
            student_config.password === '' || student_config.port === ''){
            handleShowSnackbar('error','All fields are required. Please ensure that you fill out all fields.')
            return;
        }
        const res = await postStudentConfigs(stdId,student_config);
        if(res.status === 'error'){
            if (res.code === 500){
                handleShowSnackbar('error','Connection was failed.');
            }else{
                handleShowSnackbar('error','Bad request or something went wrong');
            }
        }else if (res.status === 'success'){
            fetchStdData();
            handleShowSnackbar('success','Database Connection was successful.');
        }
        handleClose();
      })
    }

    const handleClose = () => {
        setIsOpen(false);
        setStudent_config({
            host: '',
            database: '',
            username: '',
            password: '',
            port: ''
        })
        setIsSubmit(false);
    };

  return (
    <Dialog open={isOpen} sx={{ zIndex: '710' }} maxWidth='lg'>
      <DialogTitle variant='h5'>Add Database Configurations</DialogTitle>
      <DialogContent className='w-[43rem] h-[30rem]'>
        <Typography color='error' gutterBottom className='text-center'>
          Note: Your database configurations are securely encrypted, ensuring that no one—not even our team—can access or read them. 
          Your data security is our priority!
        </Typography>
        <Box className='w-[80%] h-80 ml-[10%] flex flex-col items-center justify-between mt-10'>
          <TextField
            label='Host'
            className='w-full h-10'
            name='host'
            error={isSubmit && student_config.host === ''}
            variant='outlined'
            value={student_config.host}
            onChange={handleChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <StorageRounded />
                </InputAdornment>
              )
            }}
          />
          <TextField
            label='Database Name'
            className='w-full h-10'
            name='database'
            variant='outlined'
            error={isSubmit && student_config.database === ''}
            value={student_config.database}
            onChange={handleChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <DnsRounded />
                </InputAdornment>
              )
            }}
          />
          <TextField
            label='User'
            className='w-full h-10'
            name='username'
            variant='outlined'
            error={isSubmit && student_config.username === ''}
            value={student_config.username}
            onChange={handleChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AccountCircleRounded />
                </InputAdornment>
              )
            }}
          />
          <TextField
            label='Password'
            className='w-full h-10'
            type='password'
            name='password'
            variant='outlined'
            error={isSubmit && student_config.password === ''}
            value={student_config.password}
            onChange={handleChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <HttpsRounded />
                </InputAdornment>
              )
            }}
          />
          <TextField
            label='Port'
            className='w-full h-10'
            name='port'
            variant='outlined'
            error={isSubmit && student_config.port === ''}
            value={student_config.port}
            onChange={handleChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AccountTreeRounded />
                </InputAdornment>
              )
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button variant='outlined' onClick={handleClose}>Cancel</Button>
        <Button variant='contained' onClick={handleSubmit}>Submit</Button>
      </DialogActions>
    </Dialog>
  );
};

export default StudentConfigForm;
