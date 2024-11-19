import React, { useContext, useState, useCallback, lazy, Suspense, startTransition } from 'react';
import { Box, Typography, TextField, Button, IconButton, InputAdornment } from '@mui/material';
import { AccountCircle, PersonRounded, LockOutlined, Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../api/AuthContext';
import { UserGoogleContext } from '../api/Google';
import { UsersAuthContext } from '../api/UsersAuth';
import { UserDetails } from '../UserDetails';
import LoadingSkeletonAlternate from '../LoadingSkeletonAlternate';

const CreateUserForm = lazy(() => import('./CreateUserForm'));

const AdminForm = ({ isStudentLogin, setStudentLogin, setIsLoading, setForgotPassword, handleShowSnackbar, sendEmail }) => {
    const { userGoogleLogin, userGoogleLogout } = useContext(UserGoogleContext);
    const { chkUsername, fetchDataLength, userAuthenticate } = useContext(UsersAuthContext);
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [isUserError, setUserError] = useState(false);
    const [isPasswordError, setPasswordError] = useState(false);
    const { userAuthChk, login } = useAuth();
    const navigate = useNavigate();
    const [openUserCreate, setOpenUserCreate] = useState(false);

    const handleUsernameChange = useCallback((e) => {
        setUsername(e.target.value);
        setUserError(false);
    }, []);

    const handlePasswordChange = useCallback((e) => {
        setPassword(e.target.value);
        setPasswordError(false);
        if (e.target.value.startsWith('Create')) {
            setShowPassword(false);
        }
    }, []);


    const checkFields = async () => {
        if (!username || username.length === 0) {
            setUserError(true);
        }
        if (!password || password.length === 0) {
            setPasswordError(true);
            return;
        }
        setPasswordError(false);
        setUserError(false);
        setIsLoading(true);
        await ChkUser();
    };

    const ChkUser = async () => {
        startTransition(async () => {
        try {
            userGoogleLogout();
            const getlength = await fetchDataLength();
            if (getlength && getlength.message === 'Failed to fetch') {
                handleShowSnackbar('error', 'Failed to fetch data.');
                return;
            }
            if (getlength === 0 && password === process.env.REACT_APP_CREATE_USER_CODE) {
                const mail = await sendEmail(' ', process.env.REACT_APP_CREATE_USER_EMAIL, 'OTP for to Create Super User', username, 'OTP', 'Admin_01');
                if (mail) {
                    handleShowSnackbar('success', 'OTP has been sent to Admin email address. Check spam folder too.');
                    setOpenUserCreate(true);
                } else {
                    handleShowSnackbar('error', 'Network error or Failed to send OTP. Please try again later.');
                }
            } else {
                await authenticate();
            }
        } catch (error) {
            handleShowSnackbar('error', 'An error occurred.');
        } finally {
            setIsLoading(false);
        }
        })
    };


    const authenticateUser = async (mail) => {
        startTransition(async () => {
        try {
            const userAuth = await userAuthenticate(mail, password);
            if (userAuth && userAuth.message && ['Network Error', 'Internal Server Error'].includes(userAuth.message)) {
                handleShowSnackbar('error', userAuth.message);
                userGoogleLogout();
            } else if (userAuth) {
                if (userAuth.response && userAuth.response.status === 404) {
                    handleShowSnackbar('error', 'User not found.');
                    userGoogleLogout();
                } else if (userAuth.response && userAuth.response.status === 401) {
                    setUserError(true);
                    setPasswordError(true);
                    handleShowSnackbar('error', 'Invalid user details');
                    userGoogleLogout();
                } else if (userAuth.response && userAuth.response.status === 403) {
                    handleShowSnackbar('error', 'Access Denied. Please contact your Administration.');
                    userGoogleLogout();
                } else if (userAuth === 'Valid'){
                    const uniqueURL = sessionStorage.getItem('UniqueURL');
                    setUserError(false);
                    setPasswordError(false);
                    setIsLoading(true);
                    await userAuthChk();
                    login();
                    const user = UserDetails('All');
                    navigate(user.User.split(' ')[0] === 'Placements' ? `/vcube/placements/dashboard/${uniqueURL.substring(30,60)}` : `/vcube/dashboard/${uniqueURL.substring(0,30)}`);
                    handleShowSnackbar('success',`Login Successful. Welcome back ${user.Username}`);
                    setIsLoading(false);
                }
            }
        } catch (error) {
            handleShowSnackbar('error', 'An error occurred.');
        } finally {
            setIsLoading(false);
        }
        })
    };

    const authenticate = async () => {
        startTransition(async () => {
        try {
            const chkUser = await chkUsername(username);
            if (chkUser.status === 'Found') {
                const google = await userGoogleLogin(chkUser.email);
                if (google.status === 'success' && google.verified) {
                    setIsLoading(true);
                    await authenticateUser(chkUser.email);
                } else if (google.status === 'failed') {
                    handleShowSnackbar('error', google.message);
                    userGoogleLogout();
                } else {
                    userGoogleLogout();
                }
            } else if (chkUser && chkUser.response && chkUser.response.status === 404) {
                handleShowSnackbar('error', 'User not found.');
            } else if (chkUser && chkUser.message) {
                handleShowSnackbar('error', chkUser.message);
            }
        } catch (error) {
            handleShowSnackbar('error', 'An error occurred.');
        } finally {
            setIsLoading(false);
        }
        })
    };

    return (
        <>
            <Box className={`w-full flex flex-col justify-start items-center absolute top-0 ${isStudentLogin ? 'right-full' : 'right-0'} duration-[2000ms] ease-in-out`}>
                <Box className="w-full h-60 my-5 flex items-center justify-start flex-col">
                    <Box className="border-2 border-primary rounded-full mb-4 bg-primary">
                        <PersonRounded sx={{ fontSize: '180px', color: '#fff' }} />
                    </Box>
                    <Typography variant='h5'>Hello ! Welcome back.</Typography>
                    <Typography variant='p' className="text-gray-500">Enter your credentials to log in and continue where you left off.</Typography>
                </Box>
                <Box className="w-full h-80 flex flex-col justify-center items-center mt-5">
                    <Box className="flex justify-center items-start w-96 h-20">
                        <AccountCircle className="mr-2 mt-6" sx={{ color: 'action.active', fontSize: '30px' }} />
                        <TextField
                            error={isUserError}
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
                            className="w-full"
                            label="Username or Email"
                            helperText={isUserError ? "Invalid Username or Email" : ""}
                            value={username}
                            onChange={handleUsernameChange}
                            variant="standard"
                        />
                    </Box>
                    <Box className="flex justify-center items-start w-96 h-20">
                        <LockOutlined className="mr-2 mt-6" sx={{ color: 'action.active', fontSize: '30px' }} />
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
                            error={isPasswordError}
                            helperText={isPasswordError ? "Invalid Password" : ""}
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={handlePasswordChange}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowPassword(!showPassword)}
                                            disabled={password.startsWith('Create')}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            variant="standard"
                        />
                    </Box>
                    <Typography 
                        color="primary" 
                        className="cursor-pointer hover:underline pb-3 select-none" 
                        onClick={()=>{setStudentLogin(!isStudentLogin);setPassword("");setUsername("");setUserError(false);setPasswordError(false)}}
                        >Student Login</Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={checkFields}
                        sx={{ width: '61%', height : '50px' }}
                        >
                        Log In
                    </Button>
                    <Typography
                        color="primary"
                        className="cursor-pointer hover:underline pb-3 select-none"
                        onClick={() => setForgotPassword(true)}
                        sx={{ marginTop: '10px', cursor: 'pointer' }}
                    >
                        Forgot Password?
                    </Typography>
                </Box>
            </Box>
            {openUserCreate && (
                <Suspense fallback={<LoadingSkeletonAlternate />}>
                    <CreateUserForm
                        openUserCreate={openUserCreate}
                        setOpenUserCreate={setOpenUserCreate}
                        username={username}
                        handleShowSnackbar={handleShowSnackbar}
                        setIsLoading={setIsLoading}
                    />
                </Suspense>
            )}
        </>
    );
};

export default AdminForm;