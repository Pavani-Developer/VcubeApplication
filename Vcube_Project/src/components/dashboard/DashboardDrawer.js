import React, { useEffect, useState } from 'react';
import { Box, List, ListItem, Divider, ListItemIcon, ListItemButton, ListItemText, Drawer } from '@mui/material';
import {
  SettingsRounded, PersonAddAlt1, LogoutRounded, UploadFileRounded,
  GroupAddRounded, AddBoxRounded, GroupRemoveRounded, DisabledByDefaultRounded,
  PeopleAltRounded, FileDownloadRounded, TaskRounded, PostAddRounded, PreviewRounded,
  ReviewsRounded, SendRounded, MarkChatReadRounded, ForwardToInboxRounded,
  AddToQueueRounded,
  DvrRounded
} from '@mui/icons-material';

const DashboardDrawer = ({
  user, userCourse, openDrawer, setOpenDrawer, selectedCourse, selectedBatch,
  setDialog, setDialogMsg, setStdFormOpen, setSettingsOpen, setOpenAssessment,
  setOpenBatchOption, setBatchOption, setOpenCourseOption,
  setCourseOption, handleShowSnackbar, setPostJob, setPostedJob, setSendMsgToStd,
  setShowSendMsg, setStudentsFeedback, setMsgToBatch, setConfirmLogout, setUploadRecording,
  setShowRecording, User, setDelete_Assessment, view,
}) => {

  const actions = {
    'Add Student': () => {
      if (!selectedCourse || !selectedBatch || selectedBatch === 'All') handleShowSnackbar('error', `Please Choose a ${user === 'Super Admin' ? 'Preferred Course & ' : ''}Batch Before Registering the Student.`);
      else setStdFormOpen(true);
    },
    'Upload Assignment': () => {
      if (!selectedCourse || !selectedBatch || selectedBatch === 'All') handleShowSnackbar('error', `Please Choose a ${user === 'Super Admin' ? 'Preferred Course & ' : ''}Batch before Posting an Assignment.`);
      else setOpenAssessment(true);
    },
    'Update / Delete Assignment': () => {
      if (!selectedCourse || !selectedBatch || selectedBatch === 'All') handleShowSnackbar('error', `Please Choose a ${user === 'Super Admin' ? 'Preferred Course & ' : ''}Batch before Posting an Assignment.`);
      else setDelete_Assessment(true);
    },
    'Add Batch': () => {
      setBatchOption('Add Batch');
      setOpenBatchOption(true);
    },
    'Delete Batch': () => {
      setBatchOption('Delete Batch');
      setOpenBatchOption(true);
    },
    'Add Course': () => {
      setOpenCourseOption(true);
      setCourseOption('Add Course');
    },
    'Delete Course': () => {
      setOpenCourseOption(true);
      setCourseOption('Delete Course');
    },
    'Change Course Tutors': () => {
      setOpenCourseOption(true);
      setCourseOption('Change Tutors');
    },
    'Export Student Data': () => {
      if (!selectedCourse || !selectedBatch) handleShowSnackbar('error', `Please Choose a ${user === 'Super Admin' ? 'Preferred Course & ' : ''}Batch before Exporting the Data.`);
      else {
        setDialog(true);
        setDialogMsg('Are you sure you want to Export Students Data?~Selected Batch Students Data will be Exported.~Export');
      }
    },
    'Settings': () => setSettingsOpen(true),

    'Logout': () => setConfirmLogout(true),

    'Job Opportunity Announcement': () => {
      if (!selectedCourse || !selectedBatch || selectedBatch === 'All') handleShowSnackbar('error', `Please Choose a ${user === 'Super Admin' || user.split(' ')[0] === 'Placements' ? 'Preferred Course & ' : ''}Batch to View or Posting an Announcement.`);
      else setPostJob(true);
    },
    'View Posted Opportunities': () => {
      if (!selectedCourse || !selectedBatch || selectedBatch === 'All') handleShowSnackbar('error', `Please Choose ${user === 'Super Admin' || user.split(' ')[0] === 'Placements' ? 'Preferred Course & ' : ''}Batch to View or Posting an Announcement.`);
      else setPostedJob(true);
    },
    'Send Message to Students': () => {
      if (!selectedCourse || !selectedBatch || selectedBatch === 'All') handleShowSnackbar('error', `Please Choose ${user === 'Super Admin' || user.split(' ')[0] === 'Placements' ? 'Preferred Course & ' : ''}Batch to Send Message to Students.`);
      else setSendMsgToStd(true);
    },
    'Show Sent Messages': () => {
      if (!selectedCourse || !selectedBatch || selectedBatch === 'All') handleShowSnackbar('error', `Please Choose ${user === 'Super Admin' || user.split(' ')[0] === 'Placements' ? 'Preferred Course & ' : ''}Batch to Show Messages.`);
      else setShowSendMsg(true);
    },
    'Students Feedback': () => {
      if (!selectedCourse || !selectedBatch || selectedBatch === 'All') handleShowSnackbar('error', `Please Choose ${user === 'Super Admin' || user.split(' ')[0] === 'Placements' ? 'Preferred Course & ' : ''}Batch to Show Students Feedback.`);
      else setStudentsFeedback(true);
    },
    'Send Message to Batch': () => {
      if (!selectedCourse || !selectedBatch) handleShowSnackbar('error', 'Please Choose a Preferred Course & Batch to Send Message to Batch.');
      else setMsgToBatch(true);
    },
    'Upload Class Recordings': () => {
        if (!selectedCourse || !selectedBatch) handleShowSnackbar('error', `Please Choose a ${user === 'Super Admin' ? 'Preferred Course & ' : ''}Batch to Upload Class Recordings.`);
        else setUploadRecording(true);
    },
    'Show Uploaded Recordings': () => {
      if (!selectedCourse || !selectedBatch) handleShowSnackbar('error', `Please Choose a ${user === 'Super Admin' ? 'Preferred Course & ' : ''}Batch to Show Uploaded Recordings.`);
      else setShowRecording(true);
    }
  };

  const handleClick = (action) => {
    setOpenDrawer(false);
    if (typeof action === 'function') {
      action();
    }
  };

  const iconLists = (userCourse === 'Placements' || (user === 'Super Admin' && view === 'Placements Dashboard')) ? 
    [
      <PostAddRounded sx={{ fontSize: '25px' }} />,
      <PreviewRounded />,
      <ReviewsRounded />,
      <SendRounded />,
      <MarkChatReadRounded />
    ]
    : (user === 'Super Admin') ? 
    [
      <PersonAddAlt1 />, <GroupAddRounded />, <GroupRemoveRounded />,
      <AddBoxRounded color='primary' />, <DisabledByDefaultRounded color='primary' />, <PeopleAltRounded color='primary' />,
      <AddToQueueRounded/>, <DvrRounded/>, <UploadFileRounded />,
       <TaskRounded />, <PostAddRounded sx={{ fontSize: '25px' }} />,
      <PreviewRounded />, <ForwardToInboxRounded color='primary' />,
      <SendRounded />, <MarkChatReadRounded />, <ReviewsRounded />, <FileDownloadRounded />
    ]
    : 
    [
      <PersonAddAlt1 />, <GroupAddRounded />, <GroupRemoveRounded />,
      <AddToQueueRounded/>, <DvrRounded/>,
      <UploadFileRounded />, <TaskRounded />,
      <PostAddRounded sx={{ fontSize: '25px' }} />,
      <PreviewRounded />,
      <SendRounded />, <MarkChatReadRounded />, <ReviewsRounded />, <FileDownloadRounded />
    ];

  const drawerNames = (userCourse === 'Placements' || (user === 'Super Admin' && view === 'Placements Dashboard'))
    ? ['Job Opportunity Announcement', 'View Posted Opportunities', 'Send Message to Students', 'Show Sent Messages', 'Students Feedback']
    : (user === 'Super Admin')
    ? [
      'Add Student', 'Add Batch', 'Delete Batch', 'Add Course', 'Delete Course',
      'Change Course Tutors', 'Upload Class Recordings', 'Show Uploaded Recordings',
      'Upload Assignment', 'Update / Delete Assignment', 'Job Opportunity Announcement', 
      'View Posted Opportunities', 'Send Message to Batch', 
      'Send Message to Students', 'Show Sent Messages',
      'Students Feedback', 'Export Student Data'
    ]
    : [
      'Add Student', 'Add Batch', 'Delete Batch',
      'Upload Class Recordings', 'Show Uploaded Recordings',
      'Upload Assignment', 'Update / Delete Assignment', 'Job Opportunity Announcement', 
      'View Posted Opportunities', 'Send Message to Students', 
      'Show Sent Messages', 'Students Feedback',
      'Export Student Data'
    ];

  const DrawerList = (
    <Box sx={{ width: 320 }} role="presentation">
      <List>
        {drawerNames.map((text, index) => (
          text && (
            <ListItem key={text} disablePadding>
              <ListItemButton onClick={() => handleClick(actions[text])}>
                <ListItemIcon>
                  {iconLists[index]}
                </ListItemIcon>
                <ListItemText primary={text} />
              </ListItemButton>
            </ListItem>
          )
        ))}
      </List>
      <Divider />
      <List>
        {['Settings', 'Logout'].map((text, index) => (
          <ListItem key={text} disablePadding onClick={() => handleClick(actions[index === 0 ? 'Settings' : 'Logout'])}>
            <ListItemButton>
              <ListItemIcon>
                {index === 0 ? <SettingsRounded /> : <LogoutRounded />}
              </ListItemIcon>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Drawer open={openDrawer} onClose={() => {setOpenDrawer(false)}} anchor='right'>
      {DrawerList}
    </Drawer>
  );
};

export default DashboardDrawer;