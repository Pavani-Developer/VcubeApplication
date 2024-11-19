import React, { useContext, useEffect, useState } from 'react';
import { Box, Button, IconButton, InputAdornment, TextField } from '@mui/material';
import InputField from '../InputField';
import NumberInput from '../noSpinnerField';
import { AccountCircleRounded, EmailRounded, LocalPhoneRounded, LockRounded, SaveRounded, Visibility, VisibilityOff } from '@mui/icons-material';
import { LoginContext } from '../api/login';
import { UsersAuthContext } from '../api/UsersAuth';
import { UserGoogleContext } from '../api/Google';
import { useAuth } from '../api/AuthContext';
import { UserDetails } from '../UserDetails';

const ChangeDetails = ({ user, handleShowSnackbar, handleClose, setIsLoading, image }) => {
    const { userUpdate, checkPassword } = useContext(LoginContext);
    const { logout } = useAuth();
    const { removeUserLoginData } = useContext(UsersAuthContext);
    const { userGoogleLogout, userGoogleLogin } = useContext(UserGoogleContext);
    const [username, setUsername] = useState(null);
    const [phone, setPhone] = useState(null);
    const [email, setEmail] = useState(null);
    const [password, setPassword] = useState(null);
    const [conPassword, setConPassword] = useState(null);
    const [accPassword, setAccPassword] = useState(null);
    const [showPassword1, setShowPassword1] = useState(false);
    const [showPassword2, setShowPassword2] = useState(false);
    const [isSubmit, setIsSubmit] = useState(false);

    useEffect(()=>{
        if(user){
            setUsername(user.Username);
            setEmail(user.Email);
            setPhone(user.Phone);
        }
    },[])

    const checkPhone = () => {
        if(phone && (phone.startsWith('6') || phone.startsWith('7') || phone.startsWith('8') ||
            phone.startsWith('9')) && phone.length === 10)return true;
        return false;
    }

    const handleSubmit = () => {
        setIsSubmit(!isSubmit);
        if(!checkPhone() || !email || !(email && email.includes('@')) || !phone || !username || !accPassword)return;
        if((password && password !== conPassword) || (password && !conPassword))return;
        if(!image){handleShowSnackbar('error','Upload a valid Image');return}
        setIsLoading(true);
        checkUserAuth();
    }

    const checkUserAuth = async()=>{
        const data = {
            Username : UserDetails('All').Username,
            Password : accPassword
        }
        const res = await checkPassword(data);
        setIsLoading(false);
        if(res && res.message){
            const status = res.response.status;
            if (status === 401) handleShowSnackbar('error', 'Invalid Password.');
            else if (status === 423) handleShowSnackbar('error', 'Access Denied.');
            else if (status === 404) handleShowSnackbar('error', 'User Not Found');
            else handleShowSnackbar('error', res.message);
            if (status === 423 || status === 404){
                userGoogleLogout();
                removeUserLoginData();
                logout();
            }
        }else if(res === 'Valid'){
            setIsLoading(true);
            if(user.Email === email){
                updateDetails();
            }else{
                const google = await userGoogleLogin(email);
                if(google.status === 'success'){
                    updateDetails();
                }else{
                    handleShowSnackbar('error',google.status);
                }
            }
        }
    }

    const updateDetails = async () => {
        const data = {
            Image : image,
            Username : username,
            Email : email,
            Phone : phone,
        }
        if(password)data['Password'] = password;
        const res = await userUpdate(data);
        setIsLoading(false);
        if (res === true){
            handleShowSnackbar('success','Details has been updated successfully.');
            handleClose();
        }else{
            handleShowSnackbar('error','Something went wrong. Please try again later.');
        }
    }

  return (
    <Box className='w-[80%] grid grid-cols-2 gap-x-10 gap-y-2 mt-10'>
        <Box className='flex h-20 items-start justify-between'>
            <AccountCircleRounded className='text-slate-400' sx={{fontSize : '30px', marginTop : '20px'}} />
            <InputField label='Username' sx={{width : "88%"}} value={username} onChange={(e)=>setUsername(e.target.value)}
                error={isSubmit && !username} helperText={isSubmit && !username && 'Enter Username'} />
        </Box>
        <Box className='flex h-20 items-start justify-between'>
            <EmailRounded className='text-slate-400' sx={{fontSize : '30px', marginTop : '20px'}} />
            <InputField label='Email' sx={{width : "88%"}} value={email} onChange={(e)=>setEmail(e.target.value)}
                error={(isSubmit && !email) || (email && !email.includes('@'))} 
                helperText={isSubmit && !email ? 'Enter Email' : email && !email.includes('@') ? 'Enter valid Email' : ''} />
        </Box>
        <Box className='flex h-20 items-start justify-between'>
        <LocalPhoneRounded className='text-slate-400' sx={{fontSize : '30px', marginTop : '20px'}} />
            <NumberInput label='Phone' sx={{width : "88%"}} value={phone} onChange={(e)=>setPhone(e.target.value)} 
                error={(isSubmit && !phone) || (!checkPhone())} 
                helperText={isSubmit && !phone ? 'Enter Phone' : !checkPhone() ? 'Enter valid Phone No.' : ''} />
        </Box>
        <Box className='flex h-20 items-start justify-between'>
            <LockRounded className='text-slate-400' sx={{fontSize : '30px', marginTop : '20px'}} />
            <TextField sx={{
                    width: '88%',
                    '& .MuiInputBase-input': {
                    fontSize: '20px',
                    padding: '5px 0',
                    },
                    '& .MuiInputLabel-root': {
                    fontSize: '20px',
                    },
                }}
                variant='standard'
                type={showPassword1 ? 'text' : 'password'}
                label='Your Account Password'
                value={accPassword}
                onChange={(e)=>setAccPassword(e.target.value)}
                error={isSubmit && !accPassword}
                helperText={isSubmit && !accPassword && 'Enter your Account Password'}
                InputProps={{
                    endAdornment: (
                    <InputAdornment position="end">
                        <IconButton
                        onClick={()=>setShowPassword1(!showPassword1)}
                        >
                        {showPassword1 ? <VisibilityOff className='text-slate-400' /> : <Visibility className='text-slate-400' />}
                        </IconButton>
                    </InputAdornment>
                    ),
                }}
            />
        </Box>
        <Box className='flex h-20 items-start justify-between'>
            <LockRounded className='text-slate-400' sx={{fontSize : '30px', marginTop : '20px'}} />
            <TextField 
                label='New Password' 
                sx={{
                    width : "88%",
                    '& .MuiInputBase-input': {
                    fontSize: '20px',
                    padding: '5px 0',
                    },
                    '& .MuiInputLabel-root': {
                    fontSize: '20px',
                    },
                }} 
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                type='password'
                variant='standard'
                error={password && conPassword && password !== conPassword}
                helperText={password && conPassword && password !== conPassword && "Password and Confirm Password doesn't match"}
                />
        </Box>
        <Box className='flex h-20 items-start justify-between'>
            <LockRounded className='text-slate-400' sx={{fontSize : '30px', marginTop : '20px'}} />
            <TextField sx={{
                    width: '88%',
                    '& .MuiInputBase-input': {
                    fontSize: '20px',
                    padding: '5px 0',
                    },
                    '& .MuiInputLabel-root': {
                    fontSize: '20px',
                    },
                }}
                variant='standard'
                type={showPassword2 ? 'text' : 'password'}
                label='Confirm New Password'
                value={conPassword}
                onChange={(e)=>setConPassword(e.target.value)}
                error={(isSubmit && password && !conPassword) || password !== conPassword}
                helperText={isSubmit && password && !conPassword ? 'Enter Confirm Password' : 
                    password && password !== conPassword ? "Password and Confirm Password doesn't match" : ''}
                InputProps={{
                    endAdornment: (
                    <InputAdornment position="end">
                        <IconButton
                        onClick={()=>setShowPassword2(!showPassword2)}
                        >
                        {showPassword2 ? <VisibilityOff className='text-slate-400' /> : <Visibility className='text-slate-400' />}
                        </IconButton>
                    </InputAdornment>
                    ),
                }}
            />
        </Box>
        <Box className='flex h-20 items-start justify-center'>
            <Button variant='contained' sx={{width : '88%', height : '40px', borderRadius : '30px', margin : '10px 0 0 40px'}}
             startIcon={<SaveRounded />} onClick={handleSubmit} >Save Changes
        </Button>
        </Box>
    </Box>
  )
}

export default ChangeDetails;