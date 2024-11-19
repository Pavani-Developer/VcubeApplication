import React, { useContext, useEffect, useState } from 'react';
import { Box, TextField, InputAdornment, IconButton, Select, FormControl, InputLabel, FormHelperText, MenuItem, Button } from '@mui/material';
import { AccountCircleRounded, LocalPhoneRounded, MailRounded, LockOutlined, LockRounded, Visibility, VisibilityOff, ClassRounded, PersonAddAlt1Rounded, GroupRounded } from '@mui/icons-material';
import InputField from '../InputField';
import NumberInput from '../noSpinnerField';
import { UserDetails } from '../UserDetails';
import { LoginContext } from '../api/login';
import { useAuth } from '../api/AuthContext';
import { UsersAuthContext } from '../api/UsersAuth';
import { UserGoogleContext } from '../api/Google';
import { CourseContext } from '../api/Course';

const AddNewUser = ({ handleShowSnackbar, setIsLoading, setTabValue }) => {
    const { newUserCreate, checkUser, checkPassword, checkUserDetails } = useContext(LoginContext);
    const { fetchCourse } = useContext(CourseContext);
    const { logout } = useAuth();
    const { removeUserLoginData } = useContext(UsersAuthContext);
    const { userGoogleLogout } = useContext(UserGoogleContext);
    const userDetails = UserDetails('All');
    const isUser = UserDetails('User');
    const [courseData, setCourseData] = useState([]);
    const [username, setUsername] = useState(null);
    const [email, setEmail] = useState(null);
    const [phone, setPhone] = useState(null);
    const [accPassword, setAccPassword] = useState(null);
    const [password, setPassword] = useState(null);
    const [conPassword, setConPassword] = useState(null);
    const [course, setCourse] = useState(null);
    const [user, setUser] = useState(null);
    const [showPassword1, setShowPassword1] = useState(false);
    const [showPassword2, setShowPassword2] = useState(false);
    const [onSubmit, setOnSubmit] = useState(false);

    useEffect(() => {
        if (userDetails && userDetails.User !== "Super Admin") {
            setUser('User');
            setCourse(userDetails.Course);
        }
    }, [userDetails]);

    useEffect(()=>{
        const fetchData = async () => {
            if(isUser !== 'Super Admin')return;
            setIsLoading(true);
            const res = await fetchCourse();
            setIsLoading(false);
            if (res && res.message){
                handleShowSnackbar('error',`Failed to fetch Course data. ${res.message}`)
            }else if(res && Array.isArray(res)){
                setCourseData(res);
            }
        }
    
        fetchData();
    },[])

    const handleSubmit = () => {
        setOnSubmit(true);
        if(!username || !email || !phone || checkPhoneError(phone) || !accPassword || !password ||
             !conPassword || conPassword !== password || !course || !user
        )return;
        checkUserAuth();
    };


    const checkUserAuth = async () => {
        setIsLoading(true);
        try {
            const data = {
                Username: userDetails.Username,
                Password: accPassword,
            };
    
            const res = await checkPassword(data);
            
            if (res === 'Valid') {
                if (isUser === 'Super Admin') {
                    await check_User();
                } else {
                    await checkData();
                }
            } else {
                handleErrorResponse(res);
            }
        } catch (error) {
            handleShowSnackbar('error', 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const check_User = async () => {
        const data = {
            User: user,
            Course: course,
        };
    
        try {
            const res = await checkUser(data);
            if (res && res.status && res.status === 202) {
                await checkData();
            } else {
                handleUserCheckError(res);
            }
        } catch (error) {
            handleShowSnackbar('error', `An unexpected error occurred while cheking user. ${error}`);
        }
    };
    
    const checkData = async () => {
        const data = {
            Username: username,
            Email: email,
            Phone: phone,
        };
    
        try {
            const res = await checkUserDetails(data);
    
            if (res && res.status === 202) {
                await postData();
            } else {
                handleDataCheckError(res);
            }
        } catch (error) {
            handleShowSnackbar('error', `An unexpected error occurred While CHeking details. ${error}`);
        }
    };
    
    const postData = async () => {
        const data = {
            Username: username,
            Email: email,
            Phone: phone,
            Password: password,
            Course: course,
            User: user,
            AddedBy: userDetails.User,
        };
    
        try {
            const res = await newUserCreate(data);
    
            if (res && res.message) {
                handleShowSnackbar('error', res.message);
            } else {
                handleShowSnackbar('success', `User: ${username} has been created successfully.`);
                setTabValue(0);
            }
        } catch (error) {
            handleShowSnackbar('error', 'An unexpected error occurred while creating the user.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleErrorResponse = (res) => {
        if (res && res.message && res.response) {
            const status = res.response.status;
            switch (status) {
                case 401:
                    handleShowSnackbar('error', 'Invalid Password.');
                    break;
                case 423:
                    handleShowSnackbar('error', 'Access Denied.');
                    userGoogleLogout();
                    removeUserLoginData();
                    logout();
                    break;
                case 404:
                    handleShowSnackbar('error', 'User Not Found.');
                    userGoogleLogout();
                    removeUserLoginData();
                    logout();
                    break;
                default:
                    handleShowSnackbar('error', res.message);
                    break;
            }
        }
    };
    
    const handleUserCheckError = (res) => {
        const status = res.response ? res.response.status : res.status;
        switch (status) {
            case 226:
                handleShowSnackbar('error', `The ${user} has already been assigned to this ${course}.`);
                break;
            case 406:
                handleShowSnackbar('error', `First, add the Admin to the ${course}, and then proceed to add the User.`);
                break;
            default:
                handleShowSnackbar('error', res.message);
                break;
        }
    };
    
    const handleDataCheckError = (res) => {
        if (res && res.status === 226) {
            const message = res.data.message;
            switch (message) {
                case 'Username exists':
                    handleShowSnackbar('error', 'Username is already taken. Please choose another one.');
                    break;
                case 'Email exists':
                    handleShowSnackbar('error', 'Email is already taken. Please choose another one.');
                    break;
                case 'Phone exists':
                    handleShowSnackbar('error', 'Phone is already taken. Please choose another one.');
                    break;
                default:
                    handleShowSnackbar('error', res.message);
                    break;
            }
        } else {
            handleShowSnackbar('error', res.message);
        }
    };
    
    
    const checkPhoneError = (getvalue)=>{
        const value = getvalue && getvalue.toString();
        if (onSubmit && !value)return true;
        if (value && !(value.startsWith('9') || value.startsWith('8') || value.startsWith('7') || value.startsWith('6')))return true;
        if(value && value.length !== 10)return true;
        return false;
    }

  return (
    <Box className='w-[80%] grid grid-cols-2 mt-10 gap-x-10 gap-y-2'>
        <Box className='h-20 flex flex-row items-start justify-between'>
            <AccountCircleRounded className='text-slate-400' sx={{fontSize : '30px', marginTop : '20px'}} />
            <InputField className='w-[88%]' label='Username' error={onSubmit && !username} helperText={onSubmit && !username && 'Enter Username'}
                value={username} onChange={(e)=>setUsername(e.target.value)} />
        </Box>
        <Box className='h-20 flex flex-row items-start justify-between'>
            <MailRounded className='text-slate-400' sx={{fontSize : '30px', marginTop : '20px'}} />
            <InputField className='w-[88%]' label='Email' error={(onSubmit && !email) || (email && !email.includes('@'))} helperText={onSubmit && !email ? 'Enter Email' : (email && !email.includes('@')) ? 'Enter Valid Email' : ''}
                value={email} onChange={(e)=>setEmail(e.target.value)} />
        </Box>
        <Box className='flex h-20 items-start justify-between'>
            <LocalPhoneRounded className='text-slate-400' sx={{fontSize : '30px', marginTop : '20px'}} />
            <NumberInput label='Phone' sx={{width : "88%"}} value={phone} onChange={(e)=>setPhone(e.target.value)}
            error={(onSubmit && !phone) || (phone && checkPhoneError(phone))} 
            helperText={onSubmit && !phone ? "Enter Phone Number" : (phone && checkPhoneError(phone)) ? "Enter Valid Phone Number" : ""}/>
        </Box>
        <Box className='h-20 flex flex-row items-start justify-between'>
            <LockRounded  className='text-slate-400' sx={{fontSize : '30px', marginTop : '20px'}} />
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
                error={(onSubmit && !accPassword)}
                helperText={(onSubmit && !accPassword) ? "Invalid Password" : ""}
                type={showPassword1 ? 'text' : 'password'}
                label="Your Current Account Password"
                value={accPassword}
                onChange={(e) => {setAccPassword(e.target.value)}}
                variant="standard"
                fullWidth
                InputProps={{
                    endAdornment: (
                    <InputAdornment position="end">
                        <IconButton
                        aria-label="toggle password visibility"
                        onClick={()=>setShowPassword1(!showPassword1)}
                        >
                        {showPassword1 ? <VisibilityOff className='text-slate-400' /> : <Visibility className='text-slate-400' />}
                        </IconButton>
                    </InputAdornment>
                    ),
                }}
            />
        </Box>
        <Box className='h-20 flex flex-row items-start justify-between'>
            <LockOutlined className='text-slate-400' sx={{fontSize : '30px', marginTop : '20px'}} />
            <InputField className='w-[88%]' label='New User Password' type='password' error={(onSubmit && !password) || (onSubmit && password !== conPassword)} helperText={onSubmit && !password ? 'Enter Password' : (onSubmit && password !== conPassword) ? "Password Doesn't Match" : ''}
                value={password} onChange={(e)=>setPassword(e.target.value)} />
        </Box>
        <Box className='h-20 flex flex-row items-start justify-between'>
            <LockRounded  className='text-slate-400' sx={{fontSize : '30px', marginTop : '20px'}} />
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
                error={(onSubmit && !conPassword) || (password && conPassword && password !== conPassword)}
                helperText={(onSubmit && !conPassword) ? "Invalid Password" : (password && conPassword && password !== conPassword) ? "Password Doesn't Match" : ""}
                type={showPassword2 ? 'text' : 'password'}
                label="Confirm New User Password"
                value={conPassword}
                onChange={(e) => {setConPassword(e.target.value)}}
                variant="standard"
                fullWidth
                InputProps={{
                    endAdornment: (
                    <InputAdornment position="end">
                        <IconButton
                        aria-label="toggle password visibility"
                        onClick={()=>setShowPassword2(!showPassword2)}
                        >
                        {showPassword2 ? <VisibilityOff className='text-slate-400' /> : <Visibility className='text-slate-400' />}
                        </IconButton>
                    </InputAdornment>
                    ),
                }}
            />
        </Box>

        {isUser === 'Super Admin' && <Box className='h-20 flex flex-row items-start justify-between'>
            <ClassRounded className='text-slate-400' sx={{fontSize : '30px', marginTop : '20px'}} />
            <FormControl variant="standard" sx={{width : '88%'}}>
            <InputLabel shrink={course ? true : false} sx={{fontSize : '20px', color : (onSubmit && !course) ? '#d32f2f' : ""}}>Select Course</InputLabel>
            <Select
                error={onSubmit && !course}
                value={course}
                onChange={(e)=>{setCourse(e.target.value);user && user.split(' ')[0] === 'Placements' && e.target.value !== 'Placements' && setUser(null)}}
                sx={{width: '100%',
                '& .MuiInputBase-input': {
                fontSize: '20px',
                padding: '5px 0',
                },
                '& .MuiInputLabel-root': {
                fontSize: '20px',
                },}}
                >
                {Array.isArray(courseData) && courseData.map((course)=>
                    <MenuItem value={course.Course}>{course.Course}</MenuItem>
                )}
                <MenuItem value="Placements">Placements</MenuItem>
            </Select>
            <FormHelperText sx={{color : '#d32f2f'}}>{(onSubmit && !course) ? "Select Batch" : ""}</FormHelperText>
            </FormControl>
        </Box>}

        {isUser === 'Super Admin' && <Box className='h-20 flex flex-row items-start justify-between'>
            <GroupRounded className='text-slate-400' sx={{fontSize : '30px', marginTop : '20px'}} />
            <FormControl variant="standard" sx={{width : '88%'}}>
            <InputLabel shrink={user ? true : false} sx={{fontSize : '20px', color : (onSubmit && !user) ? '#d32f2f' : ""}}>Select User</InputLabel>
            <Select
                error={onSubmit && !user}
                value={user}
                onChange={(e)=>{setUser(e.target.value.split(' ')[0] === 'Placements' ? (course === 'Placements') ? e.target.value : handleShowSnackbar('error','Select a Placements Course to add a Placements User.') : e.target.value)}}
                sx={{width: '100%',
                '& .MuiInputBase-input': {
                fontSize: '20px',
                padding: '5px 0',
                },
                '& .MuiInputLabel-root': {
                fontSize: '20px',
                },}}
                >
                <MenuItem value="Admin">Admin</MenuItem>
                <MenuItem value="User">User</MenuItem>
                <MenuItem value="Placements Admin">Placements Admin</MenuItem>
                <MenuItem value="Placements User">Placements User</MenuItem>
            </Select>
            <FormHelperText sx={{color : '#d32f2f'}}>{(onSubmit && !user) ? "Select User" : ""}</FormHelperText>
            </FormControl>
        </Box>}

        <Box className='flex items-center justify-center'>
            <Button variant='contained' sx={{width : '88%', height : '40px', borderRadius : '30px', margin : '10px 0 0 40px'}} startIcon={<PersonAddAlt1Rounded/>} onClick={handleSubmit}>Add User</Button>
        </Box>
    </Box>
  )
}

export default AddNewUser;