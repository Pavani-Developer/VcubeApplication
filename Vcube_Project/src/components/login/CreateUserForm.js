import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, InputAdornment, TextField } from '@mui/material';
import React, { useContext, useState } from 'react'
import InputField from '../InputField';
import NumberInput from '../noSpinnerField';
import { BadgeRounded, Email, LockOutlined, LockRounded, MailRounded, Password, PhoneRounded, PinRounded, Visibility, VisibilityOff } from '@mui/icons-material';
import { LoginContext } from '../api/login';
import { MailContext } from '../api/SendMail';
import { UserGoogleContext } from '../api/Google';

const CreateUserForm = ({ openUserCreate, setOpenUserCreate, username, handleShowSnackbar, setIsLoading }) => {
    const { userCreate } = useContext(LoginContext);
    const { validate_OTP } = useContext(MailContext);
    const { userGoogleLogin, userGoogleLogout } = useContext(UserGoogleContext);
    const [email, setEmail] = useState(null);
    const [phone, setPhone] = useState(null);
    const [password, setPassword] = useState(null);
    const [conPassword, setConPassword] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [onSubmit, setOnSubmit] = useState(false);
    const [otp, setOTP] = useState(null);

    const handleClose = () =>{
        setPassword(null);
        setConPassword(null);
        setOnSubmit(false);
        setOpenUserCreate(false);
        setOTP(null);
        setPhone(null);
        setIsLoading(false);
    }
    const handleSubmit = async () => {
        setOnSubmit(true);
        if(!chkFields())return;
        const googleValidate = await userGoogleLogin(process.env.REACT_APP_CREATE_USER_EMAIL);
        if (googleValidate.status === 'success' && googleValidate.verified){
            const validate = await validate_OTP('Admin_01',otp);
            if(validate === 404 || validate === 500){
                handleShowSnackbar('error','Internal server error. Please try again later.');
                handleClose();
                return;
            }else if (validate === true){
                setIsLoading(true);
                const data = {
                    Username : username,
                    Email : process.env.REACT_APP_CREATE_USER_EMAIL,
                    Phone : phone,
                    Password : password,
                    Course : 'All',
                    User : 'Super Admin'
                }
                const create = await userCreate(data);
                if (create === 'success'){
                    handleShowSnackbar('success','Super User Created Successfully.');
                }else if(create && create.message){
                    handleShowSnackbar('error',create.message);
                }
                handleClose();
            }else{
                handleShowSnackbar('error','Invalid OTP');
            }
        }else if(googleValidate.status === 'failed'){
            handleShowSnackbar('error',googleValidate.message);
            userGoogleLogout();
            handleClose();
            return;
        }
    };

    const chkFields = () => {
        if ((phone && phone.length === 10 && 
            (phone.startsWith('9') || phone.startsWith('8') || phone.startsWith('7') || phone.startsWith('6'))) && 
            password && conPassword && password === conPassword && otp)return true;
        return false;
    };

  return (
    <Dialog
    sx={{zIndex : '900'}}
    open={openUserCreate} onClose={handleClose}>
        <img src='/images/V-Cube-Logo.png' alt='' width='20%' className='ml-[40%]'/>
    <DialogTitle>Create Super Admin</DialogTitle>
        <DialogContent>
            <DialogContentText className='flex h-[100%] flex-col items-center justify-evenly'>
                <Box className='w-full h-20 flex flex-row items-start justify-between'>
                    <BadgeRounded className="mr-2 mt-6" sx={{color: 'action.active',fontSize : '30px'}} />
                    <InputField className='w-[92%]' label='Username' InputProps={{ readOnly : true }}
                        value={username} />
                </Box>
                <Box className='w-full h-20 flex flex-row items-start justify-between'>
                    <MailRounded className="mr-2 mt-6" sx={{color: 'action.active',fontSize : '30px'}} />
                    <InputField className='w-[92%]' label='Email' value={process.env.REACT_APP_CREATE_USER_EMAIL} 
                    InputProps={{ readOnly : true }} />
                </Box>
                <Box className='w-full h-20 flex flex-row items-start justify-between'>
                    <PhoneRounded className="mr-2 mt-6" sx={{color: 'action.active',fontSize : '30px'}} />
                    <NumberInput className='w-[92%]' label='Enter Phone' error={(onSubmit && !phone) || (phone && (phone.length !== 10 || !(phone.startsWith('9') || phone.startsWith('8') || phone.startsWith('7') || phone.startsWith('6'))))} helperText={onSubmit && !phone ? 'Enter Phone Number' : (phone && ((phone.length !== 10) || !(phone.startsWith('9') || phone.startsWith('8') || phone.startsWith('7') || phone.startsWith('6')))) ? 'Enter Valid Phone Number' : ''}
                        value={phone} onChange={(e)=>{setPhone(e.target.value)}} />
                </Box>
                <Box className='w-full h-20 flex flex-row items-start justify-between'>
                    <LockOutlined className="mr-2 mt-6" sx={{color: 'action.active',fontSize : '30px'}} />
                    <TextField sx={{
                            width: '92%',
                            '& .MuiInputBase-input': {
                            fontSize: '20px',
                            padding: '5px 0',
                            },
                            '& .MuiInputLabel-root': {
                            fontSize: '20px',
                            },
                    }} type='password' variant='standard' className='w-[92%]' label='Password' error={(onSubmit && !password) || (onSubmit && password !== conPassword)} 
                        helperText={onSubmit && !password ? 'Enter Password' : (onSubmit && password !== conPassword) ? "Password Doesn't Match" : ''}
                        value={password} onChange={(e)=>setPassword(e.target.value)} />
                </Box>
                <Box className='w-full h-20 flex flex-row items-start justify-between'>
                    <LockRounded  className="mr-2 mt-6" sx={{color: 'action.active',fontSize : '30px'}} />
                    <TextField sx={{
                            width: '92%',
                            '& .MuiInputBase-input': {
                            fontSize: '20px',
                            padding: '5px 0',
                            },
                            '& .MuiInputLabel-root': {
                            fontSize: '20px',
                            },
                        }}
                        error={(onSubmit && !conPassword) || (onSubmit && password !== conPassword)}
                        helperText={(onSubmit && !conPassword) ? "Invalid Password" : (onSubmit && password !== conPassword) ? "Password Doesn't Match" : ""}
                        type={showPassword ? 'text' : 'password'}
                        label="Confirm Password"
                        value={conPassword}
                        onChange={(e) => {setConPassword(e.target.value)}}
                        variant="standard"
                        fullWidth
                        InputProps={{
                            endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                aria-label="toggle password visibility"
                                onClick={()=>setShowPassword(!showPassword)}
                                >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                            ),
                        }}
                    />
                </Box>
                <Box className='w-full h-20 flex flex-row items-start justify-between'>
                    <PinRounded className="mr-2 mt-6" sx={{color: 'action.active',fontSize : '30px'}} />
                    <NumberInput className='w-[92%]' label='Enter OTP' error={(onSubmit && !otp) || (otp && otp.length > 6)} helperText={onSubmit && !otp ? 'Enter OTP' : (otp && otp.length > 6) ? "OTP doesn't exceed morethan 6 digits" : ''}
                        value={otp} onChange={(e)=>{setOTP(e.target.value)}} />
                </Box>
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button variant='outlined' onClick={handleClose}>Cancel</Button>
            <Button variant='contained' onClick={handleSubmit}>Create</Button>
        </DialogActions>
    </Dialog>
  )
}

export default CreateUserForm;