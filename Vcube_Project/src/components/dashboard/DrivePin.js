import React, { useContext, useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, IconButton, TextField, Typography } from '@mui/material';
import { CloseRounded, SecurityRounded } from '@mui/icons-material';
import SetDrivePin from './SetDrivePin';
import { generateRandomNumber, UserDetails } from '../UserDetails';
import { MailContext } from '../api/SendMail';
import { UsersAuthContext } from '../api/UsersAuth';

const DrivePin = ({ isOpen, setIsOpen, handleShowSnackbar, setIsLoading, setIsValidated }) => {
    const { sendEmail } = useContext(MailContext);
    const { createUserDrivePassword, getUserDriveData, removeUserLoginData } = useContext(UsersAuthContext);
    const [pin, setPin] = useState(Array(6).fill(''));
    const [newPin, setNewPin] = useState(Array(6).fill(''));
    const [confirmPin, setConfirmPin] = useState(Array(6).fill(''));
    const [otp, setOTP] = useState(Array(6).fill(''));
    const [password, setpassword] = useState(null);
    const [isSubmit, setIsSubmit] = useState(false);
    const [forgot, setForgot] = useState(false);
    const user = UserDetails('All');

    const handleChange = (e, index) => {
        const value = e.target.value;

        if (/^\d?$/.test(value)) {
            const newPin = [...pin];
            newPin[index] = value;
            setPin(newPin);

            if (value && index < pin.length - 1) {
            document.getElementById(`pin-input-${index + 1}`).focus();
            }
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !pin[index] && index > 0) {
            document.getElementById(`pin-input-${index - 1}`).focus();
        }
    };

    const send_Mail = async () => {
        setIsLoading(true);
        const mail = await sendEmail(' ', user.Email, 'OTP for Creating Your Drive Password', user.Username, 'OTP', `${user.Username}~${user.Email}`);
        setIsLoading(false);
        if (mail === true){
            handleShowSnackbar('success','OTP has been successfully sent to your Email address. Check spam folder too if not found.');
            setForgot(true);
        }else{
            handleShowSnackbar('error','Something went wrong. Please try again later.');
            setIsOpen(false);
        }
    };

        
    const checkFields = () => {
        if(!password)return false;
        if(!newPin.every(pin=>pin.length > 0))return false;
        if(!confirmPin.every(pin=>pin.length > 0))return false;
        if(newPin.reduce((pre, pin)=>pre + pin) !== confirmPin.reduce((pre, pin)=>pre + pin))return false;
        if(!otp.every(otp=>otp.length > 0))return false;
        return true;
    }

    const resetPin = async () => {
        setIsLoading(true);
        if(checkFields()){
            const data = {
                Email : user.Email,
                Password : password,
                DrivePassword : newPin.reduce((pre, pin)=>pre + pin),
                User_Id : `${user.Username}~${user.Email}`,
                OTP : otp.reduce((pre, otp)=>pre + otp)
            }
            const res = await createUserDrivePassword(user.Course, user.Username, data);
            if (res === true){
                handleShowSnackbar('success','Drive registration completed successfully. You are now registered for drive access!');
                handleClear();
            }else if(res && res.message){
                if(res.response.status === 406){
                    handleShowSnackbar('error','Invalid OTP.');
                }else if(res.response.status === 403){
                    handleShowSnackbar('error','Access Denied.');
                }else if(res.response.status === 401){
                    handleShowSnackbar('error','Invalid Password.');
                }else{
                    handleShowSnackbar('error','Something went wrong. Please try again later.');
                }
            }
        }else{
            newPin.reduce((pre, pin)=>pre + pin) !== confirmPin.reduce((pre, pin)=>pre + pin) ?
            handleShowSnackbar('error',"New PIN and Confirm PIN doesn't match.") :
            handleShowSnackbar('error','All fields must be completed. Please check and fill them.');
        }
        setIsLoading(false);
    }

    const validateUser = async () => {
        setIsSubmit(true);
        if(!pin.every(pin=>pin.length > 0))return;
        setIsSubmit(false);
        setIsLoading(true);
        const data = {
            Email : user.Email,
            DrivePassword : generateRandomNumber(pin.reduce((pre, pin)=>pre + pin))
        }
        const res = await getUserDriveData(user.Course, user.Username, data, 'Validate');
        setIsLoading(false);
        if (res === true){
            setIsValidated(true);
            handleShowSnackbar('success','Verification successful. Drive access granted.');
            setTimeout(()=>{handleShowSnackbar('success', `Dear ${user.Username}. Welcome to your drive!`);},1000);
        }else if(res && res.message){
            if(res.response.status === 403){
                handleShowSnackbar('error','Verification failed. Access Denied.');
            }else if(res.response.status === 401){
                handleShowSnackbar('error','Verification failed. Invalid Pin.');
            }else{
                handleShowSnackbar('error',`Verification failed. ${res.message}`);
            }
            handleClear();
            setIsOpen(false);
        }
    }

    const handleClear = () => {
        setpassword(null);
        setIsSubmit(false);
        setForgot(false);
        setPin(Array(6).fill(''));
        setNewPin(Array(6).fill(''));
        setConfirmPin(Array(6).fill(''));
        setOTP(Array(6).fill(''));
    }


  return (
    <Dialog open={isOpen} sx={{zIndex : '700'}} onClose={()=>{handleClear();setIsOpen(false)}}>
        <img src='/images/V-Cube-Logo.png' alt='' width='15%' className='ml-[42.5%]' />
        <IconButton sx={{position : 'absolute'}} className='top-1 right-1' onClick={()=>{handleClear();setIsOpen(false)}}>
            <CloseRounded fontSize='large' />
        </IconButton>
        <DialogContent className={`w-full ${forgot ? 'h-[30rem]' : 'h-[20rem]'} flex flex-col items-center justify-start`}>
            {!forgot ? <Box className='w-full h-full flex flex-col items-center justify-start'>
                <SecurityRounded sx={{fontSize : '50px'}} color='primary' />
                <Typography variant='h5' sx={{margin : '20px 0'}}>Hi {user.Username}</Typography>
                {user.Drive === 'Not Registered' ? 
                <>
                    <Typography className='text-center' variant='h6'>Registration not found.</Typography><br/>
                    <Typography>Please register to use the drive services.</Typography>
                </>
                : 
                <>
                <Typography sx={{margin : '0 0 20px 0'}}>Please enter the 6-digit PIN to access your drive.</Typography>
                <Box className='w-[70%] flex items-center justify-evenly'>
                    {pin.map((_,idx)=>
                        <TextField 
                            key={idx}
                            id={`pin-input-${idx}`}
                            value={pin[idx]}
                            onChange={(e) => handleChange(e, idx)}
                            onKeyDown={(e) => handleKeyDown(e, idx)}
                            type='password'
                            className='w-[2.19rem] h-16'
                            sx={{fontSize : '50px','& .MuiInputBase-input': {fontSize: '24px', height : '1.50rem'},}}
                            error={isSubmit && !pin.every((pin)=>pin.length > 0)}
                            inputProps={{ maxLength : 1 }}
                        />
                    )}
                </Box>
                </>}
                <Typography sx={{margin : '20px 0'}} color='primary' className='cursor-pointer hover:underline'
                    onClick={send_Mail}>{user.Drive === 'Not Registered' ? 'Register' : 'Forgot PIN?'}
                </Typography>
            </Box>
            : 
            <SetDrivePin newPin={newPin} setNewPin={setNewPin} confirmPin={confirmPin} setConfirmPin={setConfirmPin} 
                        otp={otp} setOTP={setOTP} password={password} setpassword={setpassword} />}
        </DialogContent>
        <DialogActions>
            <Button variant='outlined'onClick={()=>{handleClear();!forgot && setIsOpen(false)}}>Cancel</Button>
            <Button variant='contained' onClick={()=>{forgot ? resetPin() : validateUser()}}>Submit</Button>
        </DialogActions>
        {/* <DialogContent className='flex flex-col items-center justify-evenly'>
            <img src='/images/developer-mode.gif' alt='' className='w-[80%] h-[80%]' />
            <Typography variant='h6' color='grey' >Our drive is currently in development. We'll return shortly!</Typography>
        </DialogContent> */}
    </Dialog>
  )
}

export default DrivePin;