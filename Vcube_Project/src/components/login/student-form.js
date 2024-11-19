import React, { useState, useCallback, useContext, startTransition } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { AccountCircle, LaptopChromebookRounded, PersonRounded, PinOutlined } from '@mui/icons-material';
import NumberInput from '../noSpinnerField';
import { DateTime } from '../date-time';
import InputField from '../InputField';
import { useNavigate } from 'react-router-dom';
import { useStudentAuth } from '../api/StudentAuthContext';
import { StudentsAuthContext } from '../api/StudentsAuth';
import { UserGoogleContext } from '../api/Google';

const StudentForm = ({ isStudentLogin, setStudentLogin, setIsLoading, handleShowSnackbar, sendEmail }) => {
  const { stdLogin, removeStudentLoginData } = useStudentAuth();
  const { studentAuthenticate, checkStudentDetails } = useContext(StudentsAuthContext);
  const { stdGoogleLogin, stdGoogleLogout } = useContext(UserGoogleContext);

  const [state, setState] = useState({
    course: '',
    userOTP: '',
    sentOTP: '',
    mobile: '',
    stdEmail: '',
    studentLoginOTP: false,
    isMailError: false,
    courseError: false,
    isOTPError: false
  });

  const navigate = useNavigate();

  const setField = useCallback((field, value) => {
    setState(prevState => ({ ...prevState, [field]: value }));
  }, []);

  const stdAuthenticateOTP = useCallback(async (email) => {
    try {
      const pin = Math.floor(100000 + Math.random() * 900000);
      handleShowSnackbar('info', 'Please wait we are sending OTP to your registered Email address.');
      const result = await sendEmail(pin, email, 'OTP for Login Authentication', 'Student', 'StdOTP');
      if (result && result.message) {
        handleShowSnackbar('error', result.message);
      } else {
        handleShowSnackbar('success', 'OTP has been successfully sent to your Email address. Check spam folder too if not found.');
        setField('sentOTP', pin);
        setTimeout(() => {
          setField('studentLoginOTP', true);
        }, 1000);
      }
    } catch (error) {
      handleShowSnackbar('error', 'An error occurred.');
    }
  }, [sendEmail, handleShowSnackbar, setField]);

  const checkStudentCredentials = useCallback(async () => {
    startTransition(async () => {
    try {
      const res = await checkStudentDetails(state.mobile, state.course);
      if (res.status) {
        stdGoogleLogout();
        const google = await stdGoogleLogin(res.Email);
        if (google.status === 'success' && google.verified) {
          setField('stdEmail', google.email);
          stdAuthenticateOTP(google.email);
        } else if (google.status === 'failed') {
          handleShowSnackbar('error', google.message);
          stdGoogleLogout();
        }
      } else {
        handleShowSnackbar('error', res.message || 'Invalid Details.');
        if (res.code) {
          switch (res.code) {
            case 404:
              handleShowSnackbar('error', 'Invalid Details.');
              break;
            case 403:
              handleShowSnackbar('error', 'Access Denied. Please contact your Administration.');
              break;
            case 406:
              handleShowSnackbar('error', 'Your account has been discontinued. Please reach out to your administrator for further assistance.');
              break;
            case 500:
              handleShowSnackbar('error', 'Server Error');
              break;
            default:
              handleShowSnackbar('error', res.message);
          }
        }
      }
    } catch (error) {
      handleShowSnackbar('error', 'An error occurred.');
    } finally {
      setIsLoading(false);
    }
    })
  }, [state, stdGoogleLogout, stdGoogleLogin, checkStudentDetails, setIsLoading, handleShowSnackbar, stdAuthenticateOTP, setField]);

  const stdAuthenticate = useCallback(async () => {
    startTransition(async () => {
    try {
      const data = { Username: state.stdEmail, Course: state.course };
      const res = await studentAuthenticate(data);
      if (res === 'Valid'){
        setIsLoading(true);
        const uniqueURL = sessionStorage.getItem('UniqueURL');
        await stdLogin();
        navigate(`/vcube/student-info/${uniqueURL.substring(60,90)}`);
        setIsLoading(false);
      } else {
        handleShowSnackbar('error', res.message || 'Invalid Details.');
        removeStudentLoginData();
        setState(prevState => ({
          ...prevState,
          isMailError: true,
        }));
      }
    } catch (error) {
      handleShowSnackbar('error', 'An error occurred.');
    } finally {
      setIsLoading(false);
    }
    })
  }, [state, studentAuthenticate, stdLogin, navigate, setIsLoading, handleShowSnackbar, removeStudentLoginData]);

  const authenticateOTP = useCallback(() => {
    if (parseInt(state.userOTP) === parseInt(state.sentOTP)){
      stdAuthenticate();
    } else {
      setField('isOTPError', true);
      setIsLoading(false);
    }
  }, [state, stdAuthenticate, setIsLoading, setField]);

  const checkFields = useCallback(() => {
    const { mobile, course, userOTP, studentLoginOTP } = state;
    setState(prevState => ({
      ...prevState,
      isMailError: !mobile || mobile.length === 0,
      isOTPError: studentLoginOTP && !userOTP,
      courseError: !course || course.length === 0
    }));

    if (!mobile || !course || (studentLoginOTP && !userOTP)) return;

    setIsLoading(true);
    studentLoginOTP ? (userOTP ? authenticateOTP() : handleShowSnackbar('error', 'Enter OTP.')) : checkStudentCredentials();
  }, [state, setIsLoading, handleShowSnackbar, checkStudentCredentials, authenticateOTP]);


  return (
    <Box className={`absolute top-0 ${(isStudentLogin) ? 'right-0' : '-right-full'} duration-[2000ms] ease-in-out w-full flex flex-col justify-start items-center`}>
      <Box className="w-full h-60 my-5 flex items-center justify-start flex-col">
        <Box className="border-2 border-primary rounded-full mb-4 bg-primary">
          <PersonRounded sx={{ fontSize: '180px', color: '#fff' }} />
        </Box>
        <Typography variant='h5'>Hello ! Welcome back.</Typography>
        <Typography variant='p' className="text-gray-500 w-[90%] text-center">Log in to view and manage your personal data and academic progress. Enter your credentials below to get started.</Typography>
      </Box>
      <Box className="w-full h-80 mt-3 flex flex-col justify-center items-center">
          <Box className="flex justify-center items-start w-96 h-20">
            <AccountCircle className="mr-2 mt-6" sx={{ color: 'action.active', fontSize: '30px' }} />
            <InputField
              error={state.isMailError}
              sx={{ width: '100%' }}
              className="w-full"
              onChange={(e) => setField('mobile', e.target.value)}
              value={state.mobile}
              disabled={state.studentLoginOTP}
              label="Mobile or Email"
              helperText={state.isMailError ? "Invalid Mobile or Email" : ""}
              variant="standard"
            />
          </Box>
          {!state.studentLoginOTP ? (
            <Box className="flex justify-center items-start w-96 h-20">
              <LaptopChromebookRounded className="mr-2 mt-6" sx={{ color: 'action.active', fontSize: '30px' }} />
              <InputField
                error={state.courseError}
                sx={{ width: '100%' }}
                className="w-full"
                onChange={(e) => setField('course', e.target.value.toUpperCase())}
                value={state.course}
                label="Enter Your Course Name"
                helperText={state.courseError ? "Invalid Course" : ""}
                variant="standard"
              />
            </Box>
          ) : (
            <Box className='flex items-start justify-between w-96 h-20'>
              <PinOutlined className="mr-2 mt-6" sx={{ color: 'action.active', fontSize: '30px' }} />
              <NumberInput
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
                label="Enter OTP"
                error={state.isOTPError}
                onChange={(e) => setField('userOTP', e.target.value)}
                value={state.userOTP}
                helperText={state.isOTPError ? "Invalid OTP" : ""}
              />
            </Box>
        )}
        <Typography
          color="primary"
          sx={{ marginLeft: '5%' }}
          className="cursor-pointer hover:underline pb-3 select-none"
          onClick={() => {
            setStudentLogin(!isStudentLogin);
            setState({
              course: '',
              userOTP: '',
              sentOTP: '',
              mobile: '',
              stdEmail: '',
              studentLoginOTP: false,
              isMailError: false,
              courseError: false,
              isOTPError: false
            });
          }}
        >
          Admin Login
        </Typography>
        <Button
          variant="contained"
          color='primary'
          sx={{ marginLeft: '6.7%' }}
          className="h-12 w-[61%]"
          onClick={checkFields}
        >
          Login
        </Button>
      </Box>
    </Box>
  );
}

export default StudentForm;
