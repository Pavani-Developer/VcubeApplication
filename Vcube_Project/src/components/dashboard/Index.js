import React, { useContext, useEffect, useState, lazy, Suspense, useCallback } from 'react';
import { Box, IconButton, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, Badge, Tooltip } from '@mui/material';
import { AssignmentLateRounded, CloseRounded, CloudRounded, FlipCameraAndroidRounded, HomeRounded, MenuRounded, NotificationsRounded, ReportProblemRounded, ReportRounded, ThreePRounded } from '@mui/icons-material';
import { useAuth } from '../api/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { UsersAuthContext } from '../api/UsersAuth';
import { BatchContext } from '../api/batch';
import { CourseContext } from '../api/Course';
import { BatchAttendanceContext } from '../api/batch-attendance';
import { UserGoogleContext } from '../api/Google';
import { UserDetails } from '../UserDetails';
import { UseUserAuthentication } from '../api/LoginCheck';
import UpdateDeleteAssignment from './UpdateDeleteAssignment';
import ReportDialog from '../ReportDialog';
import { StudentsContext } from '../api/students';
import { DateTime } from '../date-time';
import StudentAssignmentRequests from './StudentAssignmentRequests';

const StudentProgressOverview = lazy(() => import('./StudentProgressOverview'));
const Search = lazy(() => import('./search'));
const StudentDetails = lazy(() => import('./studentDetails'));
const CustomDialog = lazy(() => import('./Dialog'));
const LoadingSkeleton = lazy(() => import('../skeleton'));
const LoadingSkeletonAlternate = lazy(()=> import('../LoadingSkeletonAlternate'));
const StudentForm = lazy(() => import('../student-form/Index'));
const UserSettings = lazy(() => import('../settings'));
const DashboardDrawer = lazy(() => import('./DashboardDrawer'));
const BatchOptions = lazy(() => import('./BatchOptions'));
const CourseOptions = lazy(() => import('./CourseOptions'));
const JobAnnoucement = lazy(() => import('../Placements/JobAnnoucement'));
const ViewJobAnnouncements = lazy(() => import('../Placements/ViewJobAnnouncements'));
const UploadCodingQuestions = lazy(() => import('./UploadCodingQuestions'));
const BatchAttendance = lazy(() => import('./BatchAttendance'));
const MessageToStudents = lazy(() => import('./MessageToStudents'));
const SentMessages = lazy(() => import('./SentMessages'));
const StudentsFeedback = lazy(() => import('./StudentsFeedback'));
const SendMessagesToBatch = lazy(() => import('./SendMessagesToBatch'));
const AdminNotifications = lazy(() => import('./AdminNotifications'));
const StudentMessages = lazy(() => import('./StudentMessages'));
const UploadRecordings = lazy(() => import('./UploadRecordings'));
const ShowRecordings = lazy(()=> import('./ShowRecordings'));
const ExpiredPage = lazy(()=> import('../ExpiredPage'));
const Drive = lazy(()=> import('./Drive'));
const Reports = lazy(()=> import('./Reports'));

const Dashboard = () => {
  const { userAuthChk, isUserAuthenticated } = useAuth();
  const { removeUserLoginData, checkUserAuth } = useContext(UsersAuthContext);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { fetchBatchData } = useContext(BatchContext);
  const { fetchCourse } = useContext(CourseContext);
  const { fetchBatchAttendanceDataByCourse } = useContext(BatchAttendanceContext);
  const { userGoogleLogout } = useContext(UserGoogleContext);
  const { fetchAssignmentResults, patchAssignmentResults, fetchAssignmentRequests, deleteAssignmentRequests } = useContext(StudentsContext);
  const navigate = useNavigate();
  const isUser = UserDetails('User');
  const userCourse = UserDetails('Course');
  const [dialog, setDialog] = useState(false);
  const [stdFormOpen, setStdFormOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [dialogMsg, setDialogMsg] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [shortLoading, setShortLoading] = useState(true);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [openAssessment, setOpenAssessment] = useState(false);
  const [openBatchOption, setOpenBatchOption] = useState(false);
  const [batchOption, setBatchOption] = useState(null);
  const [openCourseOption, setOpenCourseOption] = useState(false);
  const [courseOption, setCourseOption] = useState(null);
  const [delete_Assessment, setDelete_Assessment] = useState(false);
  const [studentsData, setStudentsData] = useState([]);
  const [batchData, setBatchData] = useState([]);
  const [courseData, setCourseData] = useState([]);
  const [batchAttData, setBatchAttData] = useState([]);
  const [postJob, setPostJob] = useState(false);
  const [postedJobs, setPostedJob] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [importData, setImportData] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [batchAttendanceType, setBatchAttendanceType] = useState(null);
  const [openBatchAttendamceDialog, setOpenBatchAttendanceDialog] = useState(false);
  const [takeStdAtt, setTakeStdAtt] = useState(false);
  const [sendMsgToStd, setSendMsgToStd] = useState(false);
  const [showSendMsg, setShowSendMsg] = useState(false);
  const [studentsFeedback, setStudentsFeedback] = useState(false);
  const [msgToBatch, setMsgToBatch] = useState(false);
  const [batchNotif, setBatchNotif] = useState(false);
  const [notifLen, setNotifLen] = useState(0);
  const [stdMessages, setStdMessages] = useState(false);
  const [stdMsgLen, setStdMsgLen] = useState(0);
  const [uploadRecording, setUploadRecording] = useState(false);
  const [showRecording, setShowRecording] = useState(false);
  const [openStdAttDialog, setOpenStdAttDialog] = useState(false);
  const [is_User_Authenticated, setIs_User_Authenticated] = useState(false);
  const [openDrive, setOpenDrive] = useState(false);
  const [openReport, setOpenReport] = useState(false);
  const [reportLen, setReportLen] = useState(0);
  const [editAssignment, setEditAssignment] = useState(false);
  const [editAssignmentData, setEditAssignmentData] = useState(null);
  const [reportIssue, setReportIssue] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [stdAttViewType, setStdAttViewType] = useState('Class');
  const [assignmentRequests, setAssignmentRequests] = useState(false);
  const [studentAssignmentRequests, setstudentAssignmentRequests] = useState([]);

  const handleShowSnackbar = useCallback((variant, message) => {
    enqueueSnackbar(message, {
      variant: variant, 
      anchorOrigin: { vertical: 'top', horizontal: 'right' },
      action: (key) => (
        <IconButton><CloseRounded onClick={() => closeSnackbar(key)} color="inherit" /></IconButton>
      )
    });
  }, [enqueueSnackbar, closeSnackbar]);

  const Check_Auth = async () => {
    await UseUserAuthentication(checkUserAuth, setIs_User_Authenticated);
    !isAuthChecked && setIsAuthChecked(true);
  }

  useEffect(() => {
    if (isLoading){
      setTimeout(() => setIsLoading(false), 3000);
    }
    Check_Auth();
  }, []);

  useEffect(() => {
    if (shortLoading) {
      setTimeout(() => setShortLoading(false), 1000);
    }
    Check_Auth();
  }, [shortLoading]);

  const fetchData = useCallback(async () => {
    const batch_data = await fetchBatchData();
    const course_Data = (userCourse === 'All') && await fetchCourse();
    if ((batch_data && batch_data.message) || ((userCourse === 'All') && course_Data && course_Data.message)) {
      handleShowSnackbar('error', batch_data.message);
    } else {
      setBatchData(batch_data);
      setCourseData((userCourse === 'All') && course_Data);
    }
  }, [fetchBatchData, fetchCourse, userCourse, handleShowSnackbar]);

  const fetchBatchAttData = useCallback(async () => {
    const res = await fetchBatchAttendanceDataByCourse(selectedCourse);
    if (res && res.message === 'Network Error') {
      handleShowSnackbar('error', res.message);
    } else if (res) {
      setBatchAttData(res);
    }
  }, [fetchBatchAttendanceDataByCourse, selectedCourse, handleShowSnackbar]);

  const fetchStudentAssignmentRequestData = async () => {
    const res = await fetchAssignmentRequests();
    if (res && !res.message){
      const data = Array.isArray(res) && res.filter((data)=>(
        data.BatchName === selectedBatch &&
        data.Course === selectedCourse &&
        data.Date === DateTime().split(' ')[0]
      ))
      setstudentAssignmentRequests(data);
    }
  }

  const handleLogout = () => {
    setIsLoading(true);
    setTimeout(() => {
      removeUserLoginData();
      userGoogleLogout();
      userAuthChk();
      navigate('/');
    }, 500);
  }; 

  useEffect(() => {
    isAuthChecked && Check_Auth();
    fetchData();
    fetchStudentAssignmentRequestData();
    if (userCourse !== 'All')setSelectedCourse(userCourse);
  }, [shortLoading, isLoading]);

  const refreshData = async () => {
    setRefresh(!refresh);
    setIsLoading(true);
    await Check_Auth();
    await fetchData();
    await fetchBatchAttData();
    fetchStudentAssignmentRequestData();
    setIsLoading(false);
  }

  if(isAuthChecked){
    if(isUserAuthenticated && is_User_Authenticated){
      return (
      <Box className="w-screen h-screen bg-slate-100">
        <Box className="w-screen h-16 flex items-center justify-between pl-5 pr-5 bg-[#1976d2]" sx={{ boxShadow: '0 0 15px rgba(0,0,0,0.5)' }}>
          <Typography className='flex items-center' variant='h6' sx={{ color: 'white' }}>
            <HomeRounded sx={{ fontSize: '25px', marginRight: '10px', color: 'white' }} /> 
            Dashboard
          </Typography>
          <Box className='w-1/4 h-full flex flex-row-reverse items-center justify-between'>
          <Tooltip title='Menu' arrow>
          <IconButton onClick={() => setOpenDrawer(true)}>
            <Box className='rounded-full flex items-center justify-center'>
              <MenuRounded fontSize='large' sx={{color : 'white'}} />
            </Box>
          </IconButton>
          </Tooltip>
          <Tooltip title='VCube Drive' arrow>
            <IconButton  onClick={() => setOpenDrive(true)}>
                <CloudRounded sx={{ fontSize: '28px', color: 'white' }} />
            </IconButton>
          </Tooltip>
          <Tooltip title='Student Messages' arrow>
            <IconButton onClick={() => setStdMessages(true)}>
              <Badge badgeContent={stdMsgLen} color='error' max={99}>
                <ThreePRounded sx={{ fontSize: '28px', color: 'white' }} />
              </Badge>
            </IconButton>
          </Tooltip>
          <Tooltip title='Reports' arrow>
            <IconButton onClick={() => setOpenReport(true)}>
                <Badge badgeContent={reportLen} color='error' max={99}>
                  <ReportRounded sx={{ fontSize: '28px', color: 'white' }} />
                </Badge>
            </IconButton>
          </Tooltip>
          <Tooltip title='Report an Issue' arrow>
            <IconButton onClick={() => setReportIssue(true)}>
                  <ReportProblemRounded sx={{ fontSize: '28px', color: 'white' }} />
            </IconButton>
          </Tooltip>
          {isUser === 'Super Admin' ? <Tooltip title='Navigate to Placements Dashboard' arrow>
            <IconButton onClick={() => navigate(`/vcube/placements/dashboard/${sessionStorage.getItem('UniqueURL').substring(30,60)}`)} 
              >
                <FlipCameraAndroidRounded sx={{ fontSize: '28px', color: 'white' }} />
            </IconButton>
          </Tooltip>
            :
          <Tooltip title='Your Notifications' arrow>
            <IconButton onClick={() => setBatchNotif(true)}>
              <Badge badgeContent={notifLen} color='error' max={99}>
                <NotificationsRounded sx={{ fontSize: '28px', color: 'white' }} />
              </Badge>
            </IconButton>
          </Tooltip>}
          {Array.isArray(studentAssignmentRequests) && studentAssignmentRequests.length > 0 &&
          <Tooltip title='Student Assignmnet Requests' arrow>
            <IconButton onClick={() => setAssignmentRequests(true)}>
                <Badge badgeContent={studentAssignmentRequests.length} color='error' max={99}>
                  <AssignmentLateRounded sx={{ fontSize: '28px', color: 'white' }} />
                </Badge>
            </IconButton>
          </Tooltip>}
          </Box>
        </Box>
        {(isLoading || shortLoading) && <LoadingSkeleton />}
        <Suspense fallback={<LoadingSkeletonAlternate />}>
          <StudentProgressOverview
            batchAttData={batchAttData}
            fetchBatchAttData={fetchBatchAttData}
            setOpenBatchAttendanceDialog={setOpenBatchAttendanceDialog}
            setBatchAttendanceType={setBatchAttendanceType}
            selectedCourse={selectedCourse}
            handleShowSnackbar={handleShowSnackbar}
            selectedBatch={selectedBatch}
            studentsData={studentsData}
            openStdAttDialog={openStdAttDialog}
            batchData={batchData}
            refresh={refresh}
          />
          <Search
            user={isUser}
            courseData={courseData}
            batchData={batchData}
            selectedBatch={selectedBatch}
            setSelectedBatch={setSelectedBatch}
            selectedCourse={selectedCourse}
            setSelectedCourse={setSelectedCourse}
            handleShowSnackbar={handleShowSnackbar}
            userCourse={userCourse}
            setShortLoading={setShortLoading}
            setTakeStdAtt={setTakeStdAtt}
            refreshData={refreshData}
            stdAttViewType={stdAttViewType}
            setStdAttViewType={setStdAttViewType}
          />
          <StudentDetails
            studentsData={studentsData}
            setStudentsData={setStudentsData}
            selectedBatch={selectedBatch}
            selectedCourse={selectedCourse}
            setIsLoading={setIsLoading}
            handleShowSnackbar={handleShowSnackbar}
            importData={importData}
            setImportData={setImportData}
            takeStdAtt={takeStdAtt}
            setTakeStdAtt={setTakeStdAtt}
            openStdAttDialog={openStdAttDialog} 
            refresh={refresh}
            refreshData={refreshData}
            setOpenStdAttDialog={setOpenStdAttDialog}
            stdAttViewType={stdAttViewType}
          />

          <CustomDialog
            open={dialog}
            title={dialogMsg.split('~')[0]}
            content={dialogMsg.split('~')[1]}
            btnValue={dialogMsg.split('~')[2]}
            setDialog={setDialog}
            setIsLoading={setIsLoading}
            setImportData={setImportData}
          />
          <StudentForm 
            open={stdFormOpen} 
            setOpen={setStdFormOpen} 
            selectedCourse={selectedCourse} 
            selectedBatch={selectedBatch} 
            isUser={isUser}
            refreshData={refreshData}
          />

          {settingsOpen && <UserSettings 
            settingsOpen={settingsOpen} 
            setSettingsOpen={setSettingsOpen} 
            handleShowSnackbar={handleShowSnackbar} 
            refreshData={refreshData} />}

          {openDrawer && <DashboardDrawer
            openDrawer={openDrawer}
            setOpenDrawer={setOpenDrawer}
            user={isUser}
            userCourse={userCourse}
            selectedCourse={selectedCourse}
            selectedBatch={selectedBatch}
            setDialog={setDialog}
            setDialogMsg={setDialogMsg}
            setStdFormOpen={setStdFormOpen}
            setSettingsOpen={setSettingsOpen}
            setOpenAssessment={setOpenAssessment}
            setOpenBatchOption={setOpenBatchOption}
            setBatchOption={setBatchOption}
            setOpenCourseOption={setOpenCourseOption}
            setCourseOption={setCourseOption}
            setImportData={setImportData}
            handleShowSnackbar={handleShowSnackbar}
            setSendMsgToStd={setSendMsgToStd}
            setShowSendMsg={setShowSendMsg}
            setStudentsFeedback={setStudentsFeedback}
            setMsgToBatch={setMsgToBatch}
            setConfirmLogout={setConfirmLogout}
            setPostJob={setPostJob}
            setPostedJob={setPostedJob}
            setUploadRecording={setUploadRecording}
            setShowRecording={setShowRecording}
            User={isUser}
            setDelete_Assessment={setDelete_Assessment}
          />}

          {openBatchOption && batchOption && <BatchOptions
            courseData={courseData}
            openBatchOption={openBatchOption}
            setOpenBatchOption={setOpenBatchOption}
            batchOption={batchOption}
            setBatchOption={setBatchOption}
            handleShowSnackbar={handleShowSnackbar}
            setIsLoading={setIsLoading}
            fetch_Data={fetchData}
            selectedCourse={selectedCourse}
          />}

          {openCourseOption && courseOption && <CourseOptions
            openCourseOption={openCourseOption}
            setOpenCourseOption={setOpenCourseOption}
            courseOption={courseOption}
            setCourseOption={setCourseOption}
            handleShowSnackbar={handleShowSnackbar}
            setIsLoading={setIsLoading}
            fetchData={fetchData}
          />}
          {postJob && <JobAnnoucement
            isOpen={postJob}
            setIsOpen={setPostJob}
            selectedCourse={selectedCourse}
            selectBatchname={selectedBatch}
            setIsLoading={setIsLoading}
            handleShowSnackbar={handleShowSnackbar}
          />}
          {postedJobs && <ViewJobAnnouncements
            isOpen={postedJobs}
            setIsOpen={setPostedJob}
            selectedCourse={selectedCourse}
            selectBatchname={selectedBatch}
            setIsLoading={setIsLoading}
            handleShowSnackbar={handleShowSnackbar}
          />}
          <BatchAttendance
            isOpen={openBatchAttendamceDialog}
            setIsOpen={setOpenBatchAttendanceDialog}
            selectedCourse={selectedCourse}
            type={batchAttendanceType}
            handleShowSnackbar={handleShowSnackbar}
            setIsLoading={setIsLoading}
            fetchBatchAttData={fetchBatchAttData}
            studentsData={studentsData}
            select_Batch={selectedBatch}
          />
          <MessageToStudents
            isOpen={sendMsgToStd}
            setIsOpen={setSendMsgToStd}
            selectedCourse={selectedCourse}
            selectedBatch={selectedBatch}
            User={isUser}
            handleShowSnackbar={handleShowSnackbar}
            setIsLoading={setIsLoading}
          />
          {showSendMsg && <SentMessages
            isOpen={showSendMsg}
            setIsOpen={setShowSendMsg}
            selectedCourse={selectedCourse}
            selectedBatch={selectedBatch}
            User={isUser}
            handleShowSnackbar={handleShowSnackbar}
            setIsLoading={setIsLoading}
          />}
          {studentsFeedback && <StudentsFeedback
            isOpen={studentsFeedback}
            setIsOpen={setStudentsFeedback}
            selectedCourse={selectedCourse}
            selectedBatch={selectedBatch}
            handleShowSnackbar={handleShowSnackbar}
            setIsLoading={setIsLoading}
          />}
          <SendMessagesToBatch
            isOpen={msgToBatch}
            setIsOpen={setMsgToBatch}
            selectedCourse={selectedCourse}
            selectedBatch={selectedBatch}
            handleShowSnackbar={handleShowSnackbar}
            setIsLoading={setIsLoading}
          />
          <UploadCodingQuestions
            isOpen={openAssessment}
            setIsOpen={setOpenAssessment}
            selectedCourse={selectedCourse}
            selectedBatch={selectedBatch}
            handleShowSnackbar={handleShowSnackbar}
            setIsLoading={setIsLoading}
            editAssignment={editAssignment}
            editAssignmentData={editAssignmentData}
            setEditAssignment={setEditAssignment}
            setEditAssignmentData={setEditAssignmentData}
          />

          {isUser !== 'Super Admin' && <AdminNotifications
            isOpen={batchNotif}
            setIsOpen={setBatchNotif}
            selectedCourse={selectedCourse}
            selectedBatch={selectedBatch}
            handleShowSnackbar={handleShowSnackbar}
            setIsLoading={setIsLoading}
            setNotifLen={setNotifLen}
          />}

          <StudentMessages
            isOpen={stdMessages}
            setIsOpen={setStdMessages}
            selectedCourse={selectedCourse}
            selectedBatch={selectedBatch}
            handleShowSnackbar={handleShowSnackbar}
            setIsLoading={setIsLoading}
            setStdMsgLen={setStdMsgLen}
            isLoading={isLoading}
          />
          <UploadRecordings
              isOpen={uploadRecording}
              setIsOpen={setUploadRecording}
              selectedCourse={selectedCourse}
              selectedBatch={selectedBatch}
              handleShowSnackbar={handleShowSnackbar}
          />
          {showRecording && <ShowRecordings
              isOpen={showRecording}
              setIsOpen={setShowRecording}
              selectedCourse={selectedCourse}
              selectedBatch={selectedBatch}
              handleShowSnackbar={handleShowSnackbar}
          />}
          {openDrive && <Drive
              isOpen={openDrive}
              setIsOpen={setOpenDrive}
              handleShowSnackbar={handleShowSnackbar}
              setIsLoading={setIsLoading} 
          />}

            <Reports
                  isOpen={openReport}
                  setIsOpen={setOpenReport}
                  handleShowSnackbar={handleShowSnackbar}
                  setIsLoading={setIsLoading} 
                  setReportLen={setReportLen}
            />

            <UpdateDeleteAssignment
                  handleShowSnackbar={handleShowSnackbar}
                  setIsLoading={setIsLoading}
                  isOpen={delete_Assessment}
                  setIsOpen={setDelete_Assessment}
                  setOpenAssessment={setOpenAssessment}
                  setEditAssignment={setEditAssignment}
                  setEditAssignmentData={setEditAssignmentData}
            />

            <StudentAssignmentRequests
                isOpen={assignmentRequests}
                setIsOpen={setAssignmentRequests}
                data={studentAssignmentRequests}
                fetchAssignmentResults={fetchAssignmentResults}
                patchAssignmentResults={patchAssignmentResults}
                deleteAssignmentRequests={deleteAssignmentRequests}
                fetchStudentAssignmentRequestData={fetchStudentAssignmentRequestData}
                handleShowSnackbar={handleShowSnackbar}
                setIsLoading={setIsLoading}
            />

            <ReportDialog isOpen={reportIssue} setIsOpen={setReportIssue} setLoading={setIsLoading} />

          <Dialog open={confirmLogout} sx={{ zIndex: '710' }}>
            <DialogTitle>Are you sure you want to logout?</DialogTitle>
            <DialogContent>You will be redirected to the login page.</DialogContent>
            <DialogActions>
              <Button variant='outlined' onClick={() => setConfirmLogout(false)}>Cancel</Button>
              <Button variant='contained' onClick={() => { handleLogout(); setConfirmLogout(false); }}>Logout</Button>
            </DialogActions>
          </Dialog>
        </Suspense>
      </Box>
    );
    }else if (isUserAuthenticated || is_User_Authenticated){
      return(
        <ExpiredPage />
      )
    }else{
      navigate(`/vcube/error/${sessionStorage.getItem('UniqueURL').substring(30,70)}`);
    }
  }else{
    return(
      <LoadingSkeletonAlternate/>
    )
  }
};

export default Dashboard;
