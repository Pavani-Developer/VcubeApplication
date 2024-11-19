import React from 'react';
import { Box, TextField, Typography } from '@mui/material';

const SetDrivePin = ({ newPin, setNewPin, confirmPin, setConfirmPin, otp, setOTP, password, setpassword }) => {

    const handleChange = (e, index, currentInput) => {
        const value = e.target.value;

        if (/^\d?$/.test(value)) {
        const newValue = currentInput === 'pin' ? [...newPin] : currentInput === 'forgot' ? [...confirmPin] : [...otp];
        newValue[index] = value;

        if (currentInput === 'pin') {
            setNewPin(newValue);
        } else if (currentInput === 'forgot') {
            setConfirmPin(newValue);
        } else {
            setOTP(newValue);
        }

        if (value && index < 5) {
            setTimeout(() => {
            document.getElementById(`${currentInput}-input-${index + 1}`).focus();
            }, 0);
        }
        }
    };

    const handleKeyDown = (e, index, currentInput) => {
    if (e.key === 'Backspace' && (currentInput === 'pin' ? newPin[index] : currentInput === 'forgot' ? confirmPin[index] : otp[index]) === '' && index > 0) {
        setTimeout(() => {
        document.getElementById(`${currentInput}-input-${index - 1}`).focus();
        }, 0);
    }
    };


  return (
    <Box className='w-full h-full'>
        <Typography className='text-center'>Enter a New PIN.<br/>Please keep your PIN safe and secure to protect your account.</Typography>
        <TextField variant='standard' type='password' label='Your Account Password' className='h-20 w-[70%]' 
            sx={{margin : '5% 0 0 15%','& .MuiInputBase-input': {fontSize: '24px'},'& .MuiInputLabel-root': {fontSize: '20px',},}}
            value={password} onChange={(e)=>setpassword(e.target.value)}
        />
    <Box className='w-full h-[65%] flex flex-col items-center justify-evenly'>
      {['pin', 'forgot', 'otp'].map((name, index) => (
        <Box key={name} className='w-[70%] flex flex-col items-center justify-evenly'>
            <Typography className='w-full'>{index === 0 ? 'New Pin' : index === 1 ? 'Confirm Pin' : 'Enter OTP'}</Typography>
            <Box className='w-full flex items-center justify-between'>
            {[0, 1, 2, 3, 4, 5].map((no) => (
                <TextField
                    variant='standard'
                    key={no}
                    id={`${name}-input-${no}`}
                    onChange={(e) => handleChange(e, no, name)}
                    onKeyDown={(e) => handleKeyDown(e, no, name)}
                    type='password'
                    value={name === 'pin' ? newPin[no] : name === 'forgot' ? confirmPin[no] : otp[no]}
                    inputProps={{ maxLength: 1 }}
                    InputProps={{ disableUnderline : true }}
                    className='w-10'
                    sx={{paddingLeft : '1rem', borderBottom : 'solid 1px grey',
                        '& .MuiInputBase-input': {fontSize: '24px',} 
                    }}
                />
            ))}
            </Box>
        </Box>
    ))}
    </Box>
    </Box>
  );
};

export default SetDrivePin;
