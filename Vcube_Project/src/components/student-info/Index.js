import React, { useContext, useEffect, useState, useCallback, lazy, Suspense, startTransition, memo } from 'react';
import { Box, Card, IconButton, Tooltip, Badge, SpeedDial, SpeedDialIcon, SpeedDialAction, Link, Dialog, DialogContent, DialogContentText, DialogTitle, DialogActions, Button, Typography } from '@mui/material';
import { MenuRounded, Notifications, Edit, Close, SimCardDownloadRounded, LogoutRounded, CloseRounded, MailRounded, SmsRounded, ContentPasteRounded, ThumbUpAltRounded, CodeRounded, SmartDisplayRounded, ReportProblemRounded, RefreshRounded, LeaderboardRounded } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { StudentsContext } from '../api/students';
import { BatchAttendanceContext } from '../api/batch-attendance';
import { useSnackbar } from 'notistack';
import { useStudentAuth } from '../api/StudentAuthContext';
import { is_User } from '../UserDetails';
import { LoginContext } from '../api/login';
import { UseStudentAuthentication, UseUserAuthentication } from '../api/LoginCheck';
import { useAuth } from '../api/AuthContext';
import { UsersAuthContext } from '../api/UsersAuth';
import { StudentsAuthContext } from '../api/StudentsAuth';

const CustomTabs = lazy(()=> import('./Tabs'));
const PersonalInfo = lazy(() => import('./PersonalInfo'));
const AttendanceINsights = lazy(() => import('./AttendanceINsights'));
const Performance = lazy(() => import('./Performance'));
const EducationInfo = lazy(() => import('./EducationInfo'));
const PlacementsInfo = lazy(() => import('./PlacementsInfo'));
const StudentDetailsEditForm = lazy(() => import('./Student-Form'));
const SendMessageForm = lazy(() => import('./SendMessageForm'));
const SentMessagesForm = lazy(() => import('./SentMessagesForm'));
const LoadingSkeleton = lazy(() => import('../skeleton'));
const LoadingSkeletonAlternate = lazy(()=> import('../LoadingSkeletonAlternate'));
const FeedbackForm = lazy(() => import('./FeedbackForm'));
const AssessmentsData = lazy(() => import('./AssessmentsData'));
const StudentNotifications = lazy(() => import('./StudentNotifications'));
const PlacementNotifications = lazy(() => import('./PlacementNotifications'));
const AssessmentCodeEditor = lazy(() => import('./AssessmentCodeEditor'));
const PracticeCodeEditor = lazy(()=> import('./PracticeCodeEditor'));
const ClassVedios = lazy(()=> import('./ClassVedios'));
const ExpiredPage = lazy(()=> import('../ExpiredPage'));
const ReportDialog = lazy(()=> import('../ReportDialog'));
const LeaderboardResults = lazy(()=> import('./LeaderboardResults'));

const MemoizedIconButton = memo(IconButton);

const StudentInfo = () => {
  const { fetchStudentsDataById, getStudentAttendanceById, fetchStudentWatchTimeData, postStudentWatchTimeData, patchStudentWatchTimeData } = useContext(StudentsContext);
  const { fetchBatchAttendanceDataByCourse } = useContext(BatchAttendanceContext);
  const { checkUserAuth } = useContext(UsersAuthContext);
  const { checkStdAuth } = useContext(StudentsAuthContext);
  const { fetchPermissionsData } = useContext(LoginContext);
  const { studentAuthChk, removeStudentLoginData, isStudentAuthenticated } = useStudentAuth();
  const { isUserAuthenticated, isPlacementsAuthenticated } = useAuth();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const isUser = is_User();
  const [tabsValue, setTabValue] = useState(0);
  const [selectedYear, setSelectedYear] = useState(null);
  const [stdPermission, setStdPermission] = useState({});
  const stdId = JSON.parse(sessionStorage.getItem('StudentDetails_ID'));
  const [studentData, setStudentData] = useState({
    personal: [],
    placement: [],
    education: [],
    status: '',
    access: '',
    config : '',
    joiningDate : ''
  });
  const [batchAttendanceData, setBatchAttendanceData] = useState([]);
  const [stdAttendanceData, setStdAttendanceData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogState, setDialogState] = useState({
    messageForm: false,
    sentMessageForm: false,
    isLogout: false,
    feedbackForm: false,
    assessmentDialog: false,
    stdNotifications: false,
    stdMailNotifications: false,
    solveAssessment: false,
    practice_CodeEditor: false,
    classVedio: false,
    leaderboard: false,
  });
  const [notifLen, setNotifLen] = useState(0);
  const [mailNotif, setMailNotif] = useState(0);
  const [solveAssessmentData, setSolveAssessmentData] = useState(null);
  const [editDetails, setEditDetails] = useState(false);
  const [is_User_Authenticated, setIs_User_Authenticated] = useState(false);
  const [isStdAuthenticated, setIsStdAuthenticated] = useState(false);
  const [reportIssue, setReportIssue] = useState(false);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [refreshed, setRefreshed] = useState(false);
  const [timer, setTimer] = useState(30);

  const Check_Auth = async () => {
    await UseUserAuthentication(checkUserAuth, setIs_User_Authenticated);
    await UseStudentAuthentication(checkStdAuth, setIsStdAuthenticated);
    !isAuthChecked && setIsAuthChecked(true);
  }

  const handleShowSnackbar = useCallback((variant, message) => {
    enqueueSnackbar(message, {
      variant,
      anchorOrigin: { vertical: 'top', horizontal: 'right' },
      action: (key) => (
        <IconButton><CloseRounded onClick={() => closeSnackbar(key)} color="inherit" /></IconButton>
      )
    });
  }, [enqueueSnackbar, closeSnackbar]);

  const is_Assignment = () => {
    if(sessionStorage.getItem('Reloaded_In_Assignment') === 'True'){
      setTimeout(()=>{
        setSolveAssessmentData(JSON.parse(sessionStorage.getItem('Reloaded_Assignment_Data')));
        setDialogState(pre => ({ ...pre, solveAssessment: true }));
      },500)
    };
  }

  useEffect(() => {
    startTransition(()=>{
      if (isLoading) {
        setTimeout(() => {
          setIsLoading(false);
        }, 3000);
      }
    })
    Check_Auth();
    is_Assignment();
  }, []);

  const fetchData = useCallback(async () => {
    startTransition(async()=>{
    try {
      const res = await fetchStudentsDataById(stdId);
      const stdResult = await getStudentAttendanceById(stdId);
      if (res && res.message) {
        handleShowSnackbar('error', res.message);
        handleClose();
        return;
      }
      const batchResult = await fetchBatchAttendanceDataByCourse(res[0].Course);
      setStudentData({
        personal: JSON.parse(res[0].Personal_Info),
        education: typeof res[0].Educational_Info === 'object' ? 'N/A' : JSON.parse(res[0].Educational_Info),
        placement: typeof res[0].Placement_Info === 'object' ? 'N/A' : JSON.parse(res[0].Placement_Info),
        status: res[0].Status,
        access: res[0].Permission,
        config : res[0].Student_Config,
        joiningDate : res[0].Joining_Date || 'N/A'
      });
      if (batchResult.message === 'Network Error' || stdResult.message === 'Network Error') {
        handleShowSnackbar('error', 'Network Error');
      } else {
        setBatchAttendanceData(batchResult.filter(data => data.BatchName === studentData.personal.BatchName));
        setStdAttendanceData(stdResult);
      }
    } catch (error) {
      handleShowSnackbar('error', 'Something went wrong. Please try again later.');
    }
    })
  }, [fetchStudentsDataById, getStudentAttendanceById, fetchBatchAttendanceDataByCourse, handleShowSnackbar, studentData.personal.BatchName, stdId]);

  const fetchPermission = async () => {
    const res = await fetchPermissionsData(studentData.personal.Course);
    if (res && res.message){
      handleShowSnackbar('error',res.message);
    }else if(res){
      const data = res.find(data=>data.BatchName === studentData.personal.BatchName);
      data && setStdPermission({
        Edit : data.Edit_Access,
        Login : data.Login_Access
      })
    }
  }

  useEffect(() => {
    startTransition(() => {
      stdId ? fetchData() : handleClose();
      fetchPermission();
    });
  }, [tabsValue, fetchData]);

  const handleClose = () => {
    startTransition(() => {
      setIsLoading(true);
      setTimeout(() => {
        const uniqueURL = sessionStorage.getItem('UniqueURL');
        if (isUser === 'Student' && isStdAuthenticated && isStdAuthenticated) {
          removeStudentLoginData();
          studentAuthChk();
        }else if(isUser === 'Super Admin' && isUserAuthenticated && is_User_Authenticated && isPlacementsAuthenticated && is_User_Authenticated){
          sessionStorage.getItem('Navigate') === 'Placements' ? 
            navigate(`/vcube/placements/dashboard/${uniqueURL.substring(30,60)}`) :
            navigate(`/vcube/dashboard/${uniqueURL.substring(0,30)}`);
          sessionStorage.setItem('Navigate','');
        } else if (isUserAuthenticated && is_User_Authenticated) {
          navigate(`/vcube/dashboard/${uniqueURL.substring(0,30)}`);
        }else if(isPlacementsAuthenticated && is_User_Authenticated){
          navigate(`/vcube/placements/dashboard/${uniqueURL.substring(30,60)}`);
        }else{
          navigate(`/vcube/error/${uniqueURL.substring(30,70)}`);
        }
      }, 1000);
    });    
  };

  const refreshData = async () => {
    setIsLoading(true);
    await fetchData();
    await fetchPermission();
    await Check_Auth();
    setIsLoading(false);
  };

  useEffect(() => {
    let timerId;
  
    if (refreshed) {
      timerId = setTimeout(() => {
        setTimer((prev) => prev - 1);
      }, 1000);              
    }

    if (timer === 0) {
      setRefreshed(false);
      setTimer(30);
    }
  
    return () => clearTimeout(timerId);
  }, [timer, refreshed]);

  const saveWatchTime = async () => {
    if(isUser === 'Student' && dialogState.classVedio){
      const time = localStorage.getItem('Student_WatchTime');
      if(time){
        if (Math.floor(parseInt(time.split('~')[1]) / 60) < 1) {
            return;
        }
        const getData = await fetchStudentWatchTimeData(stdId);

        if (!getData || getData.message || getData.response) {
            return false;
        }

        const existingData = Array.isArray(getData) && getData.find((data) =>
            data.Course === studentData.personal.Course &&
            data.BatchName === studentData.personal.BatchName &&
            data.Name === `${studentData.personal.Name}~${studentData.personal.Phone}` &&
            data.Date === time.split('~')[0]
        );

        if (existingData) {
            existingData.WatchTime = (parseInt(existingData.WatchTime) || 0) + parseInt(time.split('~')[1]);
            const res_1 = await patchStudentWatchTimeData(existingData);
            if (res_1) {
                localStorage.removeItem('Student_WatchTime');
            }
        } else {
            const newData = {
                StudentId: stdId,
                Name: `${studentData.personal.Name}~${studentData.personal.Phone}`,
                Course: studentData.personal.Course,
                BatchName: studentData.personal.BatchName,
                Date: time.split('~')[0],
                WatchTime: time.split('~')[1],
            };
            const res_2 = await postStudentWatchTimeData(newData);
            if (res_2) {
                localStorage.removeItem('Student_WatchTime');
            }
        }
      }
    }
  };

  useEffect(()=>{
    if(isUser === 'Student' && localStorage.getItem('Student_WatchTime') && !dialogState.classVedio){
      saveWatchTime();
    }
  },[])

  const actions = [
    (isUser !== 'Student' || (isUser === 'Student' && stdPermission.Edit === 'Access')) && isUser.split(' ')[0] !== 'Placements' &&
    { icon: <Edit />, name: 'Edit Details', onClick: () => {setDialogState(prev => ({ ...prev, editStdDetails: true }));setEditDetails(true)} },
    { icon: <Link href={studentData.personal.Resume} download={`VCube-${studentData.personal.Name}-${studentData.personal.Course}-${studentData.personal.BatchName}.pdf`} ><SimCardDownloadRounded /></Link>, name: 'Download Resume' },
    isUser.split(' ')[0] !== 'Placements'  && { icon: <ContentPasteRounded />, name: 'Assignments', onClick: () => setDialogState(prev => ({ ...prev, assessmentDialog: true })) },
    { icon: <CodeRounded />, name: 'Code Editor', onClick: () => setDialogState(pre => ({ ...pre, practice_CodeEditor: true })) },
    isUser === 'Student' && { icon: <SmartDisplayRounded />, name: 'Class Recordings', onClick: ()=> setDialogState(pre => ({ ...pre, classVedio: true })) },
    { icon: <SmsRounded />, name: 'Messages you sent', onClick: () => setDialogState(prev => ({ ...prev, sentMessageForm: true })) },
    { icon: <ThumbUpAltRounded />, name: 'Feedback Form', onClick: () => setDialogState(prev => ({ ...prev, feedbackForm: true })) },
    { icon: <LogoutRounded />, name: isUser === 'Student' ? 'Logout' : 'Close Details', onClick: isUser === 'Student' ? () => setDialogState(prev => ({ ...prev, isLogout: true })) : handleClose }
  ].filter(Boolean);

  if(isAuthChecked){
  if((is_User_Authenticated && (isUserAuthenticated || isPlacementsAuthenticated)) || (isStdAuthenticated && isStudentAuthenticated)){
    return (
      <Box className="bg-slate-100 w-screen h-screen">
        <Suspense fallback={<LoadingSkeletonAlternate />}>
          <CustomTabs tabsValue={tabsValue} setTabValue={setTabValue} />
          <Card className='w-[95%] h-[85%] ml-[2.5%] relative'>
            <img src="/images/V-Cube-Logo.png" alt='' className='w-[10%] ml-[45%]' />
            {tabsValue === 0 ? (
              <PersonalInfo
                user={isUser}
                stdId={stdId}
                student_Details={studentData.personal}
                location={studentData.placement.Location}
                access={studentData.access}
                status={studentData.status}
                handleShowSnackbar={handleShowSnackbar}
                setMessageForm={(open) => setDialogState(pre => ({ ...pre, messageForm: open }))}
                fetchStdData={fetchData}
                handleClose={handleClose}
                JoiningDate={studentData.joiningDate}
                fetchData={fetchData}
              />
            ) : tabsValue === 1 ? (
              <AttendanceINsights
                batchAttendanceData={batchAttendanceData}
                stdAttendanceData={stdAttendanceData}
                selectedYear={selectedYear}
                setSelectedYear={setSelectedYear}
                JoiningDate={studentData.joiningDate}
                handleShowSnackbar={handleShowSnackbar}
                stdId={stdId}
                name={studentData.personal.Name}
                phone={studentData.personal.Phone}
              />
            ) : tabsValue === 2 ? (
              <Performance
                batchAttendanceData={batchAttendanceData}
                stdAttendanceData={stdAttendanceData}
                name={studentData.personal.Name} 
                email={studentData.personal.Email}
                setIsLoading={setIsLoading}
                handleShowSnackbar={handleShowSnackbar}
                isUser={isUser}
                stdId={stdId}
                phone={studentData.personal.Phone}
              />
            ) : tabsValue === 3 ? (
              <EducationInfo student_Details={studentData.education} />
            ) : (
              <PlacementsInfo student_Details={studentData.placement} />
            )}
            {isUser === 'Student' && (
              <>
                <MemoizedIconButton sx={{ position: 'absolute', top: '2%', left: '1%' }} onClick={() => setDialogState(prev => ({ ...prev, stdNotifications: true }))}>
                  <Tooltip title="Your Notifications" arrow><Badge badgeContent={notifLen} color='error' max={99}><Notifications className='text-gray-500 cursor-pointer' sx={{ fontSize: '30px' }} /></Badge></Tooltip>
                </MemoizedIconButton>
                <MemoizedIconButton sx={{ position: 'absolute', top: '2%', left: '5%' }} onClick={() => setDialogState(prev => ({ ...prev, stdMailNotifications: true }))}>
                  <Tooltip title='Placements Notifications' arrow><Badge badgeContent={mailNotif} color='error' max={99}><MailRounded className='text-gray-500 cursor-pointer' sx={{ fontSize: '30px' }} /></Badge></Tooltip>
                </MemoizedIconButton>
                <MemoizedIconButton sx={{ position: 'absolute', top: '2%', left: '9%' }} onClick={()=>setReportIssue(true)} >
                  <Tooltip title='Report an Issue' arrow><ReportProblemRounded className='text-gray-500 cursor-pointer' sx={{ fontSize: '30px' }} /></Tooltip>
                </MemoizedIconButton>
              </>
            )}

            <MemoizedIconButton sx={{ position: 'absolute', top: '2%', left: isUser === 'Student' ? '12.8%' : '1%' }}  onClick={() => setDialogState(prev => ({ ...prev, leaderboard: true }))}>
              <Tooltip title='Leaderboard' arrow>
                <LeaderboardRounded  sx={{ fontSize: '30px' }} />
              </Tooltip>
            </MemoizedIconButton>

            <MemoizedIconButton sx={{ position: 'absolute', top: '2%', left: isUser === 'Student' ? '16.3%' : '5%' }} onClick={()=>{!refreshed && refreshData();setRefreshed(true)}}>
              <Tooltip title={`Refresh ${refreshed ? timer < 10 ? `in 0${timer}` : `in ${timer}` : ''}`} arrow>
                <RefreshRounded  sx={{ fontSize: '30px' }} />
              </Tooltip>
            </MemoizedIconButton>

            <SpeedDial
              ariaLabel="Menu SpeedDial"
              onClick={fetchPermission}
              sx={{
                bgcolor: 'transparent',
                position: 'absolute',
                right: '10px',
                top: '10px',
                zIndex: '100',
                '& .MuiSpeedDial-fab': {
                  boxShadow: 'none',
                  bgcolor: 'transparent',
                  color: 'black',
                  '&:hover': {
                    bgcolor: 'grey.300',
                  },
                },
              }}
              icon={<SpeedDialIcon icon={<MenuRounded sx={{ fontSize: '30px' }} className='text-gray-500' />} openIcon={<Close sx={{ fontSize: '30px' }} className='text-gray-500' />} />}
              direction='left'
            >
              {actions.map((action) => (
                <SpeedDialAction
                  key={action.name}
                  icon={action.icon}
                  tooltipTitle={action.name}
                  onClick={action.onClick}
                  arrow
                />
              ))}
            </SpeedDial>
          </Card>
          {isLoading && <LoadingSkeleton />}
          {dialogState.editStdDetails && <StudentDetailsEditForm 
                isOpen={dialogState.editStdDetails} 
                setIsOpen={(open) => setDialogState(prev => ({ ...prev, editStdDetails: open }))} 
                student_Personal_Details={studentData.personal} 
                student_Education_Details={studentData.education} 
                student_Placement_Details={studentData.placement} 
                selectedCourse={studentData.personal.Course}
                user={isUser}
                editDetails={editDetails}
                joiningDate={studentData.joiningDate} 
                refreshData={refreshData} />}
          {dialogState.messageForm && <SendMessageForm 
                isOpen={dialogState.messageForm} 
                setIsopen={(open) => setDialogState(prev => ({ ...prev, messageForm: open }))} 
                course={studentData.personal.Course} 
                batchName={studentData.personal.BatchName} 
                image={studentData.personal.Image} 
                name={studentData.personal.Name} 
                phone={studentData.personal.Phone} 
                email={studentData.personal.Email}
                handleShowSnackbar={handleShowSnackbar} 
                setIsLoading={setIsLoading} 
                isUser={isUser} 
                stdId={stdId} />}
          {dialogState.sentMessageForm && <SentMessagesForm 
                isOpen={dialogState.sentMessageForm} 
                setIsOpen={(open) => setDialogState(prev => ({ ...prev, sentMessageForm: open }))} 
                image={studentData.personal.Image} 
                gender={studentData.personal.Gender} 
                course={studentData.personal.Course} 
                batchName={studentData.personal.BatchName} 
                name={studentData.personal.Name} 
                phone={studentData.personal.Phone} 
                handleShowSnackbar={handleShowSnackbar} 
                setIsLoading={setIsLoading}
                isUser={isUser} 
                stdId={stdId} />}
          <FeedbackForm 
            isOpen={dialogState.feedbackForm} 
            setIsOpen={(open) => setDialogState(prev => ({ ...prev, feedbackForm: open }))} 
            course={studentData.personal.Course} 
            batchName={studentData.personal.BatchName} 
            handleShowSnackbar={handleShowSnackbar} 
            setIsLoading={setIsLoading} 
            isUser={isUser}
          />
          {dialogState.assessmentDialog && <AssessmentsData 
                isOpen={dialogState.assessmentDialog} 
                setIsOpen={(open) => setDialogState(prev => ({ ...prev, assessmentDialog: open }))} 
                course={studentData.personal.Course} 
                batchName={studentData.personal.BatchName} 
                handleShowSnackbar={handleShowSnackbar} 
                setIsLoading={setIsLoading} 
                setSolveAssessmentData={setSolveAssessmentData}
                setSolveAssesments={(open) => setDialogState(pre => ({ ...pre, solveAssessment: open }))} 
                stdId={stdId}
                JoiningDate={studentData.joiningDate}
                isUser={isUser}
                configs={studentData.config}
                image={studentData.personal.Image}
                name={studentData.personal.Name}
                phone={studentData.personal.Phone}
          />}
          {dialogState.stdNotifications && <StudentNotifications 
                isOpen={dialogState.stdNotifications} 
                setIsOpen={(open) => setDialogState(prev => ({ ...prev, stdNotifications: open }))} 
                course={studentData.personal.Course} 
                batchName={studentData.personal.BatchName} 
                handleShowSnackbar={handleShowSnackbar} 
                setNotifLen={setNotifLen} 
                stdId={stdId} 
                isLoading={isLoading}
          />}
          {dialogState.stdMailNotifications && <PlacementNotifications 
                isOpen={dialogState.stdMailNotifications} 
                setIsOpen={(open) => setDialogState(prev => ({ ...prev, stdMailNotifications: open }))} 
                course={studentData.personal.Course} 
                batchName={studentData.personal.BatchName} 
                handleShowSnackbar={handleShowSnackbar} 
                setMailNotif={setMailNotif} 
                isLoading={isLoading} 
          />}
          {dialogState.solveAssessment && 
          <AssessmentCodeEditor 
                isOpen={dialogState.solveAssessment} 
                setIsOpen={(open) => setDialogState(pre => ({ ...pre, solveAssessment: open }))} 
                stdId={stdId} 
                handleShowSnackbar={handleShowSnackbar} 
                solveAssessmentData={solveAssessmentData}
                name={studentData.personal.Name} 
                phone={studentData.personal.Phone}
                course={studentData.personal.Course}
                batchName={studentData.personal.BatchName}
                isUser={isUser}
          />}
          {dialogState.practice_CodeEditor && <PracticeCodeEditor 
                isOpen={dialogState.practice_CodeEditor} 
                setIsOpen={(open) => setDialogState(pre => ({ ...pre, practice_CodeEditor: open }))} 
                handleShowSnackbar={handleShowSnackbar} 
                configs={studentData.config}
                fetchStdData={fetchData}
                stdId={stdId}
                isUser={isUser}
          />}
          {dialogState.classVedio && <ClassVedios 
                isOpen={dialogState.classVedio} 
                setIsOpen={(open) => setDialogState(pre => ({ ...pre, classVedio: open }))} 
                JoiningDate={`${studentData.joiningDate.split('-')[1]}-${studentData.joiningDate.split('-')[2]}`}
                course={studentData.personal.Course}
                batchName={studentData.personal.BatchName}
                handleShowSnackbar={handleShowSnackbar}
                stdId={stdId}
                name={studentData.personal.Name}
                phone={studentData.personal.Phone}
                isUser={isUser}
                setIsLoading={setIsLoading}
          />}

          <ReportDialog isOpen={reportIssue} setIsOpen={setReportIssue} setLoading={setIsLoading} />
          
          <LeaderboardResults 
              isOpen={dialogState.leaderboard}
              setIsOpen={(open)=> setDialogState((pre)=> ({...pre, leaderboard: open}))}
              stdId={stdId}
              name={studentData.personal.Name}
              phone={studentData.personal.Phone}
              course={studentData.personal.Course}
              batchName={studentData.personal.BatchName}
              handleShowSnackbar={handleShowSnackbar}
              setIsLoading={setIsLoading}
              batchAttendanceData={batchAttendanceData}
          />

          {dialogState.isLogout && <Dialog open={dialogState.isLogout} onClose={() => setDialogState(prev => ({ ...prev, isLogout: false }))}>
            <DialogTitle>Are you sure you want to Logout?</DialogTitle>
            <DialogContent>
              <DialogContentText>This will redirect you to the Login Page.</DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button variant='outlined' onClick={() => setDialogState(prev => ({ ...prev, isLogout: false }))}>Cancel</Button>
              <Button variant='contained' onClick={() => { handleClose(); setDialogState(prev => ({ ...prev, isLogout: false })); }}>Logout</Button>
            </DialogActions>
          </Dialog>}
        </Suspense>
      </Box>
    );
  }else if (is_User_Authenticated || isUserAuthenticated || isPlacementsAuthenticated || isStdAuthenticated || isStudentAuthenticated){
    return (
      <ExpiredPage/>
    );
  }else{
    navigate(`/vcube/error/${sessionStorage.getItem('UniqueURL').substring(30,70)}`);
  }
  }else{
    <LoadingSkeletonAlternate/>
  }
};

export default StudentInfo;
