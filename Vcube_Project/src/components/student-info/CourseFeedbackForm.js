import React, { startTransition, useContext, useEffect, useState, useCallback } from 'react';
import { CloseRounded } from '@mui/icons-material'
import { Box, Button, Dialog, DialogActions, DialogTitle, IconButton, Radio, Slider, TextField, Typography } from '@mui/material';
import { FeedbackContext } from '../api/Feedback';
import { DateTime } from '../date-time';

export const feedbackQuestion1 = [
    "How satisfied are you with our service?",
    "How satisfied are you with the instructor's teaching methods?",
    "How satisfied are you with the quality of the course content?",
    "How satisfied are you with the lab facilities and resources available?",
    "How satisfied are you with the coordinator's support services?"
]

const CourseFeedbackForm = ({ isOpen, setIsOpen, course, batchName, handleShowSnackbar, setIsLoading }) => {
    const { postCourseFeedbackData, fetchFeedbackFormLists } = useContext(FeedbackContext);
    const [selectedValues, setSelectedValues] = useState(Array(5).fill(''));
    const [feedbackQuestion, setFeedbackQuestion] = useState(null);
    const [scaleValue, setScaleValue] = useState(0);
    const [feedbackMsg, setFeedbackMsg] = useState(null);
    const names = ['Very Unsatisfied','Unsatisfied','Nuetral','Satisfied','Very Satisfied'];    

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        const res = await fetchFeedbackFormLists(course);
        setIsLoading(false);
        
        if (res && res.message) {
            res.response && res.response.status !== 404 
                ? handleShowSnackbar('error', res.message) 
                : setFeedbackQuestion(feedbackQuestion1);
        } else if (res) {
            if (Array.isArray(res)) {
                const selectedData = res.find(data => data.Selected);
                setFeedbackQuestion(selectedData ? selectedData.FeedbackData : feedbackQuestion1);
            }
        }
    }, [course, feedbackQuestion1, handleShowSnackbar]);

    useEffect(() => {
        startTransition(() => {
            fetchData();
        });
    }, [fetchData]);

    const handleChange = (index) => (event) => {
        const newValues = [...selectedValues];
        newValues[index] = event.target.value;
        setSelectedValues(newValues);
    };
    const controlProps = (index, item) => ({
        checked: selectedValues[index] === item,
        onChange: handleChange(index),
        value: item,
    });

    const handleSubmit = () => {
        if(!selectedValues.every((value,index)=>selectedValues[index].length === 0) && scaleValue > 0 && (feedbackMsg && feedbackMsg.length >= 25)){
            setIsLoading(true);
            setTimeout(()=>{
                submitFeedback();
                handleClose();
            },2000);
        }else{
            handleShowSnackbar('error','Completing all fields in the feedback form will give us valuable insights to enhance our services.');
        }
    };

    const submitFeedback = async () => {
        const data = {
            Course : course,
            BatchName : batchName,
            FeedbackData : JSON.stringify({Date : DateTime(),Service : `${feedbackQuestion[0]}~${selectedValues[0]}`, Teaching_Method : `${feedbackQuestion[1]}~${selectedValues[1]}`, Course_Content : `${feedbackQuestion[2]}~${selectedValues[2]}`,
                                            Resources : `${feedbackQuestion[3]}~${selectedValues[3]}`, Support_Service : `${feedbackQuestion[4]}~${selectedValues[4]}`, Recommend : scaleValue, Suggestions : feedbackMsg

            })
        }
        const res = await postCourseFeedbackData(data);
        setIsLoading(false);
        if(res && res.message){
            handleShowSnackbar('error',res.message);
        }else if(res){
            handleShowSnackbar('success',"We've successfully received your feedback! Thank you for sharing your thoughts. we will use it to make meaningful improvements.");
        }
    }

    const handleClose = () => {
        setSelectedValues(Array(5).fill(''));
        setScaleValue(0);
        setFeedbackMsg(null);
        setIsOpen(false);
    };

  return (
    <Dialog open={isOpen} maxWidth='lg' sx={{zIndex : '700'}}>
        <img src='/images/V-Cube-Logo.png' width='10%' alt='' className='absolute top-0 left-3' />
        <IconButton sx={{position : 'absolute'}} className='top-3 right-3' onClick={handleClose} ><CloseRounded sx={{fontSize : '35px'}} /></IconButton>
        <DialogTitle className='flex flex-col items-center justify-center' sx={{marginTop : '15px'}}>
            <Typography variant='h5'>We value your feedback.</Typography>
            <Typography>Please complete the following form and help us to improve our service.</Typography>
            <Typography color='primary' sx={{marginTop : '15px'}}>Your name and personal details will be kept anonymous and confidential. We value your privacy and want you to feel comfortable sharing your thoughts.</Typography>
        </DialogTitle>
        <Box sx={{position : 'relative', padding : '0 30px', height : '50rem'}}>
            <Box className='w-[65%] ml-[32%] mr-[3%]'>
                <Box className='w-full flex items-center justify-between'>
                    {names.map((name,index)=><Box sx={{marginLeft : (index === 1) ? '-10px' : (index === 2) ? '15px' : (index === 3) ? '30px' : ''}}>{name}</Box>)}
                </Box>
            </Box>
            <Box className='w-full flex items-center justify-between'>
            <Box className='w-[30%] h-[20rem] flex flex-col items-start justify-between mt-5'>
                {Array.isArray(feedbackQuestion) && feedbackQuestion.map((question)=><Typography className='h-16'>{question}</Typography>)}
            </Box>
            <Box className='w-[70%] h-[20rem] flex flex-col justify-between'>
                {[0, 1, 2, 3, 4].map((index) => (
                <Box key={index} className='w-full flex flex-row items-center justify-between'>
                    {names.map((name, nameIndex) => (
                    <Box
                        key={nameIndex}
                        className='w-[25%] h-[100%] flex items-center justify-center'
                        sx={{
                        background : '#f5fbff',
                        margin : 1,
                        }}
                    >
                        <Radio {...controlProps(index, name)} />
                    </Box>
                    ))}
                </Box>
                ))}
            </Box>
            </Box>

            <Box className='w-full flex items-center justify-between'>
                <Typography className='h-16 w-[30%]'>On th scale of 1 - 10 how likely are you to recommend our institute to others?</Typography>
                <Box sx={{ width: '68%' }}>
                    <Slider
                        aria-label="Temperature"
                        defaultValue={scaleValue}
                        onChange={(e)=>setScaleValue(e.target.value)}
                        valueLabelDisplay="auto"
                        step={1}
                        marks
                        min={0}
                        max={10}
                    />
                </Box>
            </Box>

            <TextField type='text' label='What suggestions do you have for improving our courses or services?'
                placeholder='Please share any additional comments or feedback you may have. (Min 25 Characters)'
                value={feedbackMsg} onChange={(e)=>setFeedbackMsg(e.target.value)} multiline rows={2} className='w-full'
                error={feedbackMsg && feedbackMsg.length < 25} helperText={feedbackMsg && feedbackMsg.length < 25 ? 'Minimum 25 characters required.' : ''} sx={{height : '95px'}}
            />
        </Box>
        <DialogActions>
        <Button variant='contained' sx={{width : '80%', margin : '0 10% 0.5% 0'}} onClick={handleSubmit}>Submit Feedback</Button>
        </DialogActions>
    </Dialog>
  )
}

export default CourseFeedbackForm;