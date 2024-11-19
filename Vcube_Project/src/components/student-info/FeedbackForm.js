import React, { useState } from 'react'
import { Dialog, DialogContent, DialogTitle, FormControl, IconButton, InputLabel, MenuItem, Select } from '@mui/material';
import CourseFeedbackForm from './CourseFeedbackForm';
import { CloseRounded, RuleRounded } from '@mui/icons-material';
import PlacementFeedbackForm from './PlacementFeedbackForm';
import EditFeedbackForm from './EditFeedbackForm';

const FeedbackForm = ({ isOpen, setIsOpen, course, batchName, handleShowSnackbar, setIsLoading, isUser }) => {
    const [courseFeedback, setCourseFeedback] = useState(false);
    const [placementFeedback, setPlacementFeedback] = useState(false);

  return (
    <>
    {isUser === 'Student' ? <Dialog open={isOpen} sx={{zIndex : '700'}} onClose={()=>setIsOpen(false)}>
        <img src='/images/V-Cube-Logo.png' alt='' width='20%' className='ml-[40%]' />
        <IconButton sx={{position : 'absolute'}} className='top-3 right-3' onClick={()=>setIsOpen(false)}><CloseRounded sx={{fontSize : '35px'}}/></IconButton>
        <DialogTitle variant='h5'>Who do you want to give Feedback ?</DialogTitle>
        <DialogContent className='flex items-center justify-center'>
        <RuleRounded sx={{fontSize : '30px'}}/>
        <FormControl variant='standard' sx={{width : '100%',margin : '30px 0 50px 2%'}}>
            <InputLabel sx={{fontSize : '20px'}}>Select Feedback Form</InputLabel>
            <Select
                sx={{width: '100%',
                  '& .MuiInputBase-input': {
                  fontSize: '20px',
                  padding: '5px 0',
                  },
                  '& .MuiInputLabel-root': {
                  fontSize: '20px',
                  },}}
                onChange={(e)=>{(e.target.value === 'Course') ? setCourseFeedback(true) : setPlacementFeedback(true);setIsOpen(false)}}>
                <MenuItem value='Course'>Course Feedback</MenuItem>
                <MenuItem value='Placement'>Placement Feedback</MenuItem>
            </Select>
        </FormControl>
        </DialogContent>
    </Dialog>
    :
    (isOpen && <EditFeedbackForm isOpen={isOpen} setIsOpen={setIsOpen} setIsLoading={setIsLoading} handleShowSnackbar={handleShowSnackbar} course={course} isUser={isUser} />)}
    <CourseFeedbackForm isOpen={courseFeedback} setIsOpen={setCourseFeedback} course={course} batchName={batchName} handleShowSnackbar={handleShowSnackbar} setIsLoading={setIsLoading} />
    <PlacementFeedbackForm isOpen={placementFeedback} setIsOpen={setPlacementFeedback} course={course} batchName={batchName} handleShowSnackbar={handleShowSnackbar} setIsLoading={setIsLoading} />
    </>
  )
}

export default FeedbackForm;