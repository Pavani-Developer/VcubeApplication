import React, { useContext, useState } from 'react';
import { Dialog, Box, DialogTitle, DialogContent, DialogActions, TextField, Button, FormGroup, FormControlLabel, Checkbox, Typography, InputAdornment, IconButton } from '@mui/material';
import { Person, Mail, Visibility, VisibilityOff, Pin, PasswordRounded } from '@mui/icons-material';
import NumberInput from '../noSpinnerField';
import { UsersAuthContext } from '../api/UsersAuth';
import { UserGoogleContext } from '../api/Google';

export const ForgotCredentailsDialog = ({ isOpen, isClose, setIsLoading, handleShowSnackbar, sendEmail  }) => {
  const { userGoogleLogin, userGoogleLogout } = useContext(UserGoogleContext);  
  const { chkUsername, chkEmail, resetUserPassword } = useContext(UsersAuthContext);
  const [forgotUsername, setForgotUsername] = useState(false);
  const [changePassword, setChangePassword] = useState(false);
  const [submit, setSubmit] = useState(false);
  const [consubmit, setConsubmit] = useState(false);
  const [sentOTP, setSentOTP] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [oTP, setOTP] = useState("");
  const [password, setPassword] = useState("");
  const [conPassword, setConPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [forgotUserId, setForgotUserId] = useState(null);

  const handleClose = () => {
    isClose(false);
    setSubmit(false);
    setChangePassword(false);
    setForgotUsername(false);
    setSentOTP("");
    setUsername("");
    setEmail("");
    setOTP("");
    setPassword("");
    setConPassword("");
    setConsubmit(false);
    setShowPassword(false);
    setForgotUserId(null);
  };

  const handleSubmit = async() => {
    if (changePassword){
      setConsubmit(true);
      if(password && conPassword && password === conPassword){
        const data = {
          Email : email,
          Password : password,
          User_Id : `${username}_${email}`,
          OTP : oTP
        }
        const validate = await resetUserPassword(data);
        if(validate === 404 || validate === 500 || validate === 400){
          handleShowSnackbar('error','Internal server error. Please try again later.');
          handleClose();
        }else if(validate === 201){
          handleShowSnackbar('success','Password has been reset successfully.');
          handleClose();
        }else if(validate === 406){
          handleShowSnackbar('error','Invalid OTP');
        }
      };
      return;
    }else{
      setSubmit(true);
    }
      if(!forgotUsername){
        if(username.length === 0 || email.length === 0)return;
          setIsLoading(true);
          retrivePassword();
      }else if(forgotUsername){
        if(email.length === 0)return;
          setIsLoading(true);
          setTimeout(()=>{retriveUsername()},1000);
      }
  };

  const retriveUsername = async () => {
      const userFind = await chkEmail(email,'check');
      if (userFind && userFind.message){
        handleShowSnackbar('error','Error or User not found. Please try again later.')
      }else{
        const verify = await verifyUser_Google(email);
        if (verify === 'failed')return;
        if (verify === 'success'){
          const res = await chkEmail(email,'get');
          if (res && res.message){
            handleShowSnackbar('error',res.message);
            return;
          }else if(res){
            const data = {
              'Username' : res.username,
              'Email' : email
            }
            handleEmailSend("retriveUsername",data);
          }
        }
      }
  }

  const retrivePassword = async () => {
    const data={
      Username : username,
      Email : email,
    }
    const userFind = await chkUsername(username);
    if (userFind && userFind.message){
        handleShowSnackbar('error','Error or User not found. Please try again later.');
    }else if (userFind){
      if (userFind.email === email){
        const verify = await verifyUser_Google(userFind.email);
        if (verify === 'failed')return;
          if (verify === 'success'){
            handleShowSnackbar('info','Please wait. We are Sending OTP....');
            data['Email']=userFind.email;
            handleEmailSend("retrivePassword",data);
        }
      }else{
        handleShowSnackbar('error','Invalid User Details.');
        return;
      }
    }
  };

  const verifyUser_Google = async (email) => {
    const verify = await userGoogleLogin(email);
    if(verify.status === 'success' && verify.verified){
      userGoogleLogout();
      return 'success'
    }else if(verify.status === 'failed'){
      handleShowSnackbar('error',verify.message);
      userGoogleLogout();
      return 'failed';
    }else{
        userGoogleLogout();
        return 'failed';
    }
  }

  const handleEmailSend = async (type,user=null) => {
    if(type === "retrivePassword"){
        setIsLoading(true);
        const status = await sendEmail('OTP',user.Email,'OTP for Resetting Your Account Password',user.Username,'OTP',`${user.Username}_${user.Email}`);
        if(status){
          handleShowSnackbar('success','OTP has sent to your email. Check spam folder too.');
          setChangePassword(true);
          setForgotUserId(user);
        }else{
          handleShowSnackbar('error','There was an issue sending your OTP. Please try again later.');
        }
    }else if(type === "retriveUsername"){
      setIsLoading(true);
      const status = await sendEmail(user.Username,user.Email,'Your Username for Account Access',user.Username,'Username');
        if(status){
          handleShowSnackbar('success','Username has sent to your email. Check spam folder too.');
        }else{
          handleShowSnackbar('error','Username Delivery Failed. Please try again later.');
        }
        handleClose();
    }
    setIsLoading(false);
  };


  return (
    <div>
      <Dialog open={isOpen} onClose={handleClose} sx={{zIndex : '900'}}>
      <img src="/images/V-Cube-Logo.png" alt='' className='w-1/4 ml-[37.5%]'/>
        <DialogTitle variant='h5' className="text-center">{!forgotUsername ? 'Change Password' : 'Get Username'}</DialogTitle>
        <DialogContent className="h-[22rem] w-[80%] ml-[10%] flex flex-col items-center justify-around">
        {changePassword ? (
          <>
            <Typography className="text-center text-gray-500">To reset your password, please provide your new password along with the OTP.</Typography>
            <Box className="w-full flex flex-row items-center justify-between">
            <PasswordRounded className="mr-3 mt-6" sx={{color: 'action.active',fontSize : '30px'}}/>
            <TextField 
            sx={{
              width: '100%',
              '& .MuiInputBase-input': {
              fontSize: '20px',
              padding: '5px 0',
              },
              '& .MuiInputLabel-root': {
              fontSize: '20px',
              },
            }}
            autoFocus
            margin="dense"
            label="Password"
            type="password"
            fullWidth
            error={(consubmit && password.length === 0)}
            onChange={(e)=>setPassword(e.target.value)}
            variant="standard"
            helperText={(consubmit && password.length === 0) ? "Enter Password" : ""}
            value={password}
            />
            </Box>
            <Box className="w-full flex flex-row items-center justify-between">
            <PasswordRounded className="mr-3 mt-6" sx={{color: 'action.active',fontSize : '30px'}}/>
            <TextField
            sx={{
              width: '100%',
              '& .MuiInputBase-input': {
              fontSize: '20px',
              padding: '5px 0',
              },
              '& .MuiInputLabel-root': {
              fontSize: '20px',
              },
            }}
            autoFocus
            margin="dense"
            label="Confirm Password"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            error={((consubmit && conPassword.length === 0) || password !== conPassword)}
            onChange={(e)=>setConPassword(e.target.value)}
            variant="standard"
            helperText={(consubmit && (conPassword.length === 0)) ? "Enter Password" : (password !== conPassword) ? "Password doesn't match" : ""}
            value={conPassword}
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
            <Box className="w-full flex flex-row items-center justify-between">
            <Pin className="mr-3 mt-6" sx={{color: 'action.active',fontSize : '30px'}}/>
            <NumberInput sx={{
                width: '100%',
                '& .MuiInputBase-input': {
                fontSize: '20px',
                padding: '5px 0',
                },
                '& .MuiInputLabel-root': {
                fontSize: '20px',
                },
            }}
            label="Enter OTP"
            error={(consubmit && oTP.length === 0)}
            onChange={(e)=>{setOTP(e.target.value);setConsubmit(false)}}
            value={oTP}
            helperText={consubmit && (oTP.length === 0) ? "Enter OTP" : ""}
             />
             </Box>
          </>
        ) : (<>
        <Typography className="text-center text-gray-500 mb-11">{!forgotUsername ? <Typography >To reset your password, please provide your email.<br/> An OTP will be sent for verification.</Typography> : 'Please enter your email to retrieve your username.'}</Typography>
          {!forgotUsername &&
          <Box className="flex justify-center items-start w-full h-20">
            <Person className="mr-2 mt-8" sx={{color: 'action.active',fontSize : '30px'}} />
             <TextField
            sx={{
                width: '100%',
                '& .MuiInputBase-input': {
                fontSize: '20px',
                padding: '5px 0',
                },
                '& .MuiInputLabel-root': {
                fontSize: '20px',
                },
            }}
            autoFocus
            margin="dense"
            label="Username"
            type="text"
            fullWidth
            error={(submit && username.length === 0)}
            onChange={(e)=>setUsername(e.target.value)}
            variant="standard"
            helperText={(submit && email.length === 0) ? "Invalid Username" : ""}
            value={username}
          /></Box>}
          <Box className="flex justify-center items-start w-full h-20">
          <Mail className="mr-2 mt-8" sx={{color: 'action.active',fontSize : '28px'}} />
          <TextField
            sx={{
                width: '100%',
                '& .MuiInputBase-input': {
                fontSize: '20px',
                padding: '5px 0',
                },
                '& .MuiInputLabel-root': {
                fontSize: '20px',
                },
            }}
            margin="dense"
            label="Email Address"
            type="email"
            fullWidth
            error={(submit && email.length === 0)}
            variant="standard"
            helperText={(submit && email.length === 0) ? "Email Address" : ""}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          /></Box>
           <FormGroup className="mt-5">
                <FormControlLabel control={<Checkbox onClick={(e)=>{setForgotUsername(e.target.checked);setSubmit(false);setUsername("");setEmail("")}}/>} label="Forgot Username ?" />
            </FormGroup></>)}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant='contained' sx={{margin : '0 10px 10px 0'}}>Submit</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};