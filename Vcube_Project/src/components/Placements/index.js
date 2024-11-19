import React, { useState, useEffect, useContext, Suspense, lazy } from 'react';
import { Badge, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Tooltip, Typography } from '@mui/material';
import { CloseRounded, CloudRounded, FlipCameraAndroidRounded, HomeRounded, MenuRounded, NotificationsRounded, ReportProblemRounded, ThreePRounded } from '@mui/icons-material';
import { BatchContext } from '../api/batch';
import { CourseContext } from '../api/Course';
import { enqueueSnackbar, closeSnackbar } from 'notistack';
import LoadingSkeleton from '../skeleton';
import { useAuth } from '../api/AuthContext';
import { useNavigate } from 'react-router-dom';
import { UserDetails } from '../UserDetails';
import { UseUserAuthentication } from '../api/LoginCheck';
import ExpiredPage from '../ExpiredPage';
import LoadingSkeletonAlternate from '../LoadingSkeletonAlternate';
import { UserGoogleContext } from '../api/Google';
import { UsersAuthContext } from '../api/UsersAuth';
import Drive from '../dashboard/Drive';
import ReportDialog from '../ReportDialog';

const OverView = lazy(() => import('./OverView'));
const SelectOptions = lazy(() => import('./OptionsBar'));
const StudentDetails = lazy(() => import('./StudentDetails'));
const DashboardDrawer = lazy(() => import('../dashboard/DashboardDrawer'));
const JobAnnoucement = lazy(() => import('./JobAnnoucement'));
const ViewJobAnnouncements = lazy(() => import('./ViewJobAnnouncements'));
const MessageToStudents = lazy(() => import('../dashboard/MessageToStudents'));
const SentMessages = lazy(() => import('../dashboard/SentMessages'));
const StudentsFeedback = lazy(() => import('./StudentsFeedback'));
const AdminNotifications = lazy(() => import('./AdminNotifications'));
const StudentMessages = lazy(() => import('./StudentMessages'));
const UserSettings = lazy(() => import('../settings'));

const PlacementsDashboard = () => {
    const { fetchBatchData } = useContext(BatchContext);
    const { fetchCourse } = useContext(CourseContext);
    const { userGoogleLogout } = useContext(UserGoogleContext);
    const { logout, isPlacementsAuthenticated } = useAuth();
    const { checkUserAuth } = useContext(UsersAuthContext);
    const navigate = useNavigate();
    const isUser = UserDetails('User');
    const userCourse = UserDetails('Course');
    const [openDrawer, setOpenDrawer] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [batchData, setBatchData] = useState([]);
    const [courseData, setCourseData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [shortLoading, setShortLoading] = useState(false);
    const [postJob, setPostJob] = useState(false);
    const [postedJobs, setPostedJob] = useState(false);
    const [confirmLogout, setConfirmLogout] = useState(false);
    const [sendMsgToStd, setSendMsgToStd] = useState(false);
    const [showSendMsg, setShowSendMsg] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [studentsFeedback, setStudentsFeedback] = useState(false);
    const [batchNotif, setBatchNotif] = useState(false);
    const [notifLen, setNotifLen] = useState(0);
    const [stdMessages, setStdMessages] = useState(false);
    const [stdMsgLen, setStdMsgLen] = useState(0);
    const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
    const [openDrive, setOpenDrive] = useState(false);
    const [reportIssue, setReportIssue] = useState(false);
    const [isAuthChecked, setIsAuthChecked] = useState(false);
    const [refresh, setRefresh] = useState(false);

    const handleShowSnackbar = (variant, message) => {
        enqueueSnackbar(message, {
            variant: variant,
            anchorOrigin: { vertical: 'top', horizontal: 'right' },
            action: (key) => (
                <IconButton onClick={() => closeSnackbar(key)} color="inherit">
                    <CloseRounded />
                </IconButton>
            ), 
        });
    };

    const Check_Auth = async () => {
        await UseUserAuthentication(checkUserAuth, setIsUserAuthenticated);
        !isAuthChecked && setIsAuthChecked(true);
    }

    const fetchData = async () => {
        try {
            const batch_data = await fetchBatchData();
            const course_Data = await fetchCourse();
            if((batch_data && batch_data.message) || (course_Data && course_Data.message)) {
                handleShowSnackbar('error', batch_data.message || course_Data.message);
            } else {
                setBatchData(batch_data);
                setCourseData(course_Data);
            }
        } catch (error) {
            handleShowSnackbar('error', 'Failed to fetch data.');
        }
    };

    useEffect(() => {
        Check_Auth();
        fetchData();
    }, [selectedBatch, selectedCourse]);

    useEffect(() => {
        if (isLoading) {
            setTimeout(() => setIsLoading(false), 3000);
        }
        Check_Auth();
    }, [isLoading]);

    useEffect(() => {
        if (shortLoading) {
            setTimeout(() => setShortLoading(false), 1000);
        }
        Check_Auth();
    }, [shortLoading]);

    const handleLogout = () => {
        setIsLoading(true);
        setTimeout(() => {
            userGoogleLogout();
            logout();
            navigate('/vcube/login');
        }, 500);
    };

    const refreshData = async () => {
        setRefresh(!refresh);
        setIsLoading(true);
        await Check_Auth();
        await fetchData();
        setIsLoading(false);
    }

    if(isAuthChecked){
    if (isUserAuthenticated && isPlacementsAuthenticated){
        return (
            <Box className='w-screen h-screen bg-slate-100'>
                <Box className="w-full h-16 flex items-center justify-between pl-5 pr-5 bg-[#1976d2]" sx={{ boxShadow: '0 0 15px rgba(0,0,0,0.5)' }}>
                    <Typography className='flex items-center' variant='h6' sx={{ color: 'white' }}>
                        <HomeRounded sx={{ fontSize: '25px', marginRight: '10px', color: 'white' }} />
                        Placement's Dashboard
                    </Typography>
                    <Box className='w-1/5 h-full flex flex-row-reverse items-center justify-between'>
                    <Tooltip title='Menu' arrow>
                    <IconButton onClick={() => setOpenDrawer(true)}>
                        <Box className='rounded-full flex items-center justify-center'>
                        <MenuRounded fontSize='large' sx={{color : 'white'}} />
                        </Box>
                    </IconButton>
                    </Tooltip>
                    <Tooltip title='VCube Drive' arrow>
                    <IconButton onClick={() => setOpenDrive(true)}>
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
                    <Tooltip title='Report an Issue' arrow>
                        <IconButton onClick={() => setReportIssue(true)}>
                                <ReportProblemRounded sx={{ fontSize: '28px', color: 'white' }} />
                        </IconButton>
                    </Tooltip>
                    {isUser === 'Super Admin' ? <Tooltip title='Navigate to Dashboard' arrow>
                        <IconButton onClick={() => navigate(`/vcube/dashboard/${sessionStorage.getItem('UniqueURL').substring(0,30)}`)} 
                            >
                        <Badge badgeContent={stdMsgLen} color='error' max={99}>
                            <FlipCameraAndroidRounded sx={{ fontSize: '28px', color: 'white' }} />
                        </Badge>
                        </IconButton>
                    </Tooltip> 
                    :
                    <Tooltip title='Your Notifications' arrow>
                        <IconButton>
                            <Badge badgeContent={notifLen} color='error' max={99} onClick={() => setBatchNotif(true)}>
                                <NotificationsRounded sx={{ fontSize: '28px', color: 'white' }} />
                            </Badge>
                        </IconButton>
                    </Tooltip>}               
                    </Box>
                </Box>

                <Suspense fallback={<LoadingSkeletonAlternate />}>
                    <OverView selectedBatch={selectedBatch} selectedCourse={selectedCourse} handleShowSnackbar={handleShowSnackbar} refresh={refresh} />
                    <SelectOptions courseData={courseData} batchData={batchData} selectedBatch={selectedBatch} setSelectedBatch={setSelectedBatch} selectedCourse={selectedCourse} setSelectedCourse={setSelectedCourse} handleShowSnackbar={handleShowSnackbar} setShortLoading={setShortLoading} refreshData={refreshData} />
                    <StudentDetails selectedCourse={selectedCourse} selectedBatch={selectedBatch} setIsLoading={setIsLoading} handleShowSnackbar={handleShowSnackbar} refresh={refresh} isUser={isUser} />
                </Suspense>

                {settingsOpen && (
                    <Suspense fallback={<LoadingSkeletonAlternate />}>
                        <UserSettings settingsOpen={settingsOpen} setSettingsOpen={setSettingsOpen} handleShowSnackbar={handleShowSnackbar} />
                    </Suspense>
                )}
                
                {(isLoading || shortLoading) && <LoadingSkeleton />}

                {openDrawer && (
                    <Suspense fallback={<LoadingSkeletonAlternate />}>
                        <DashboardDrawer
                            openDrawer={openDrawer}
                            setOpenDrawer={setOpenDrawer}
                            selectedCourse={selectedCourse}
                            selectedBatch={selectedBatch}
                            user={isUser}
                            userCourse={userCourse}
                            handleShowSnackbar={handleShowSnackbar}
                            setPostJob={setPostJob}
                            setPostedJob={setPostedJob}
                            setSendMsgToStd={setSendMsgToStd}
                            setShowSendMsg={setShowSendMsg}
                            setStudentsFeedback={setStudentsFeedback}
                            setSettingsOpen={setSettingsOpen}
                            setConfirmLogout={setConfirmLogout}
                            view={'Placements Dashboard'}
                        />
                    </Suspense>
                )}

                {postJob && (
                    <Suspense fallback={<LoadingSkeletonAlternate />}>
                    <JobAnnoucement
                        isOpen={postJob}
                        setIsOpen={setPostJob}
                        selectedCourse={selectedCourse}
                        selectBatchname={selectedBatch}
                        setIsLoading={setIsLoading}
                        handleShowSnackbar={handleShowSnackbar}
                    />
                </Suspense>
            )}

            {postedJobs && (
                <Suspense fallback={<LoadingSkeletonAlternate />}>
                    <ViewJobAnnouncements
                        isOpen={postedJobs}
                        setIsOpen={setPostedJob}
                        selectedCourse={selectedCourse}
                        selectBatchname={selectedBatch}
                        setIsLoading={setIsLoading}
                        handleShowSnackbar={handleShowSnackbar}
                    />
                </Suspense>
            )}

            {sendMsgToStd && (
                <Suspense fallback={<LoadingSkeletonAlternate />}>
                    <MessageToStudents
                        isOpen={sendMsgToStd}
                        setIsOpen={setSendMsgToStd}
                        selectedCourse={selectedCourse}
                        selectedBatch={selectedBatch}
                        User={isUser}
                        handleShowSnackbar={handleShowSnackbar}
                        setIsLoading={setIsLoading}
                    />
                </Suspense>
            )}

            {showSendMsg && (
                <Suspense fallback={<LoadingSkeletonAlternate />}>
                    <SentMessages
                        isOpen={showSendMsg}
                        setIsOpen={setShowSendMsg}
                        selectedCourse={selectedCourse}
                        selectedBatch={selectedBatch}
                        User={isUser}
                        handleShowSnackbar={handleShowSnackbar}
                        setIsLoading={setIsLoading}
                    />
                </Suspense>
            )}

            {studentsFeedback && (
                <Suspense fallback={<LoadingSkeletonAlternate />}>
                    <StudentsFeedback
                        isOpen={studentsFeedback}
                        setIsOpen={setStudentsFeedback}
                        selectedCourse={selectedCourse}
                        selectedBatch={selectedBatch}
                        handleShowSnackbar={handleShowSnackbar}
                        setIsLoading={setIsLoading}
                    />
                </Suspense>
            )}

            {batchNotif && (
                <Suspense fallback={<LoadingSkeletonAlternate />}>
                    <AdminNotifications
                        isOpen={batchNotif}
                        setIsOpen={setBatchNotif}
                        handleShowSnackbar={handleShowSnackbar}
                        setIsLoading={setIsLoading}
                        setNotifLen={setNotifLen}
                    />
                </Suspense>
            )}

            {openDrive && (
                <Suspense fallback={<LoadingSkeletonAlternate />}>
                    <Drive
                        isOpen={openDrive}
                        setIsOpen={setOpenDrive}
                        handleShowSnackbar={handleShowSnackbar}
                        setIsLoading={setIsLoading} 
                    />
                </Suspense>
            )}

            <ReportDialog isOpen={reportIssue} setIsOpen={setReportIssue} setLoading={setIsLoading} />

            {stdMessages && (
                <Suspense fallback={<LoadingSkeletonAlternate />}>
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
                </Suspense>
            )}

            <Dialog open={confirmLogout} sx={{ zIndex: '710' }}>
                <DialogTitle>Are you sure you want to logout?</DialogTitle>
                <DialogContent>You will be redirected to the login page.</DialogContent>
                <DialogActions>
                    <Button variant='outlined' onClick={() => setConfirmLogout(false)}>Cancel</Button>
                    <Button variant='contained' onClick={() => { handleLogout(); setConfirmLogout(false); }}>Logout</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
    } else if (isUserAuthenticated || isPlacementsAuthenticated){
        return (
            <ExpiredPage />
        );
    }else{
        navigate(`/vcube/error/${sessionStorage.getItem('UniqueURL').substring(30,70)}`);
    }
    }else{
        <LoadingSkeletonAlternate/>
    }
};

export default PlacementsDashboard;
