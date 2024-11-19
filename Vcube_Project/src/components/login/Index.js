import React, { useState, useEffect, useCallback, useContext, Suspense, lazy, startTransition } from 'react';
import { Box, IconButton } from '@mui/material';
import { useSnackbar } from 'notistack';
import { ForgotCredentailsDialog } from './ForgotPasswordDailog';
import { MailContext } from '../api/SendMail';
import { CloseRounded } from '@mui/icons-material';
import LoadingSkeleton from '../skeleton';
import LoadingSkeletonAlternate from '../LoadingSkeletonAlternate';

const AdminForm = lazy(() => import('./admin-form'));
const StudentForm = lazy(() => import('./student-form'));
const Poster = lazy(() => import('./login-poster'));

const LoginPage = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { sendEmail } = useContext(MailContext);
  const [isLoading, setIsLoading] = useState(true);
  const [studentLogin, setStudentLogin] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);

  useEffect(() => {
    startTransition(()=>{
      const timer = setTimeout(() => setIsLoading(false), 3000);
      return () => clearTimeout(timer);
    })
  }, []);

  const handleShowSnackbar = useCallback((variant, message) => {
    enqueueSnackbar(message, { 
      variant: variant, 
      anchorOrigin: { vertical: 'top', horizontal: 'right' },
      action: (key) => (
        <IconButton onClick={() => closeSnackbar(key)}><CloseRounded color="inherit" /></IconButton>
      ),
    });
  }, [enqueueSnackbar, closeSnackbar]);

  return (
    <Box className="bg-bg2 h-screen w-screen flex justify-center items-center">
      <Box className="shadow-2xl bg-white h-[80%] w-[80%] rounded-lg flex flex-row relative overflow-hidden">
        <Suspense fallback={<LoadingSkeletonAlternate />}>
          <Poster isStudentLogin={studentLogin} />
          <Box className="w-1/2 overflow-hidden relative">
            <Suspense fallback={<LoadingSkeletonAlternate />}>
              <AdminForm 
                isStudentLogin={studentLogin} 
                setStudentLogin={setStudentLogin} 
                setIsLoading={setIsLoading} 
                setForgotPassword={setForgotPassword} 
                handleShowSnackbar={handleShowSnackbar} 
                sendEmail={sendEmail} 
              />
              <StudentForm 
                isStudentLogin={studentLogin} 
                setStudentLogin={setStudentLogin} 
                setIsLoading={setIsLoading} 
                handleShowSnackbar={handleShowSnackbar} 
                sendEmail={sendEmail} 
              />
            </Suspense>
          </Box>
        </Suspense>
      </Box>
      {isLoading && <LoadingSkeleton />}
      <ForgotCredentailsDialog 
        isOpen={forgotPassword} 
        isClose={setForgotPassword} 
        setIsLoading={setIsLoading} 
        handleShowSnackbar={handleShowSnackbar} 
        sendEmail={sendEmail} 
      />
    </Box>
  );
};

export default LoginPage;