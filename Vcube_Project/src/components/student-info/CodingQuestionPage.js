import React, { startTransition, useContext, useEffect, useState } from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Dialog, DialogActions, DialogContent, Divider, IconButton, Tab, Tabs, Tooltip, Typography } from '@mui/material';
import { CancelRounded, CheckCircleRounded, CheckRounded, ExpandMore, KeyboardTabRounded, LogoutRounded, PsychologyAltRounded, PublishedWithChangesRounded, WorkspacePremiumRounded, ZoomInMapRounded, ZoomOutMapRounded } from '@mui/icons-material';

const CodingQuestionPage = ({isUser, results, questionData, tabValue, setTabValue, handleExitFullScreen, resultPopUp, 
                              setResultPopUp, hideQuestion, setHideQuestion, handleFullScreen, setQuestions_Data, solveAssessmentData, 
                              score, scoreData, postResults, setIsOpen, time_Up, handleShowSnackbar, minutes, }) => {
  const [expand, setExpand] = useState(null);
  const [submit, setSubmit] = useState(false);
  const weekly_Assignment = sessionStorage.getItem('Weekly Assignment');
  const [submitError, setSubmitError] = useState(false);
  const [wait, setwait] = useState(false);
  
  useEffect(()=>startTransition(()=>{handleFullScreen()}),[])

  useEffect(()=>{
    startTransition(()=>{
      resultPopUp && setTimeout(()=>{
        !submit && setResultPopUp(false);
      },3000)
    })
  },[resultPopUp])

  const submitAssignment = async () => {
    setSubmitError(false);
    if(weekly_Assignment !== 'True' || isUser !== 'Student'){
      setIsOpen(false);
      return;
    }
    setwait(true);
    const res = await postResults();
    if(res === true){
      setIsOpen(false);
      handleShowSnackbar('success','Congrats! Completing this assignment is a fantastic milestone in your learning journey!')
    }else{
      setSubmitError(true);
    }
    setwait(false);
  }

  useEffect(()=>{
    if(time_Up){
      submitAssignment();
    }
  },[time_Up])

  return (
    <>
    <Box className={`${hideQuestion ? 'w-[30%]' : 'w-1/2'} ${(minutes === 29 || minutes === 4 || minutes === 0) && (weekly_Assignment === 'True' || weekly_Assignment === 'Past') ? 'blink-background' : ''} h-full bg-white border-2 rounded-md pl-5 pr-3`}>
       <Box className='w-full h-14 flex items-center justify-between'>
        <img src='/images/V-Cube-Logo.png' alt='' width='12%' />
        <Tabs value={tabValue}>
          <Tab label='Question' sx={{fontWeight : 'bold', fontFamily : 'unset'}} onClick={()=>setTabValue(0)}/>
          <Tab label='Submission' disabled={weekly_Assignment === 'True' && isUser === 'Student'} sx={{fontWeight : 'bold', fontFamily : 'unset'}} onClick={()=>setTabValue(1)}/>
        </Tabs>
        <Box className='w-1/6 flex items-center justify-between'>
        <Tooltip title={`${hideQuestion ? 'Compress' : 'Decompress'} Question Tab`} arrow>
          <IconButton onClick={()=>setHideQuestion(!hideQuestion)}>
            <KeyboardTabRounded sx={{transform : !hideQuestion && 'rotate(180deg)'}} />
          </IconButton>
        </Tooltip>
        <Tooltip title='Exit' arrow><IconButton onClick={handleExitFullScreen}><LogoutRounded /></IconButton></Tooltip>
        </Box>
      </Box>
      {resultPopUp ? <>
        {submit ?
          <Box className='w-full h-[90%] flex flex-col items-center justify-center'>
              <PsychologyAltRounded color='primary' sx={{fontSize : '100px', margin : '30px 0'}} />
              <Typography className='text-slate-500 w-[80%] text-center' sx={{margin : '20px 0 10px 0'}}>
                Make sure to review your code thoroughly for any mistakes before you submit it.
              </Typography>
              <Typography variant='h5' sx={{fontFamily : 'monospace', margin : '10px 0 20px 0'}} className='text-slate-500'>
                Your Score: {score}
              </Typography>
              <Box className='w-[80%] flex items-center justify-evenly'>
                <Button variant='outlined' sx={{width : '45%'}} startIcon={<PublishedWithChangesRounded/>} onClick={()=>{setSubmit(false);setResultPopUp(false)}}>Check Again</Button>
                <Button variant='contained' sx={{width : '45%'}} disabled={wait} endIcon={<CheckCircleRounded/>} onClick={submitAssignment}>Continue Submission</Button>
              </Box>
              {submitError && <Typography color='error' sx={{marginTop : '30px'}}>Something went wrong while Submission. Please try again later.</Typography>}
          </Box> :
          <Box className='w-full h-[90%] flex flex-col items-center justify-center'>
          {results && results.all_tests_passed ? 
              <WorkspacePremiumRounded className='scaleAndShake' color='success' sx={{fontSize : '150px', margin : '20px 0'}} /> :
              <CancelRounded className='scaleAndShake' color='error' sx={{fontSize : '100px', margin : '30px 0'}} />
            }
            <Typography color={results && results.all_tests_passed ? 'green' : 'error'} sx={{fontSize : '28px'}} >
              {results && results.all_tests_passed ? 'You Passed all the Test Cases' : 'You Failed the Test Cases' }
            </Typography>
        </Box>}
      </> :
      (questionData ? <>
      {tabValue === 0 ? 
      <Box>
        {(weekly_Assignment === 'True' || weekly_Assignment === 'Past') && 
          <Box className='w-full h-20 flex items-center justify-between rounded-md'>
                <Box className='w-[70%] flex items-center justify-start'>
                    {solveAssessmentData.map((data, index)=>
                        <Button variant={data.id === questionData.id ? 'contained' : 'outlined'} color={scoreData[data.id] === 100 ? 'success' : 'primary'} sx={{marginRight : '20px'}} onClick={()=>setQuestions_Data(data)}>
                          {scoreData[data.id] === 100 ? <CheckRounded/> : isUser !== 'Student' ? `${index + 1} id: ${data.id}` : index + 1 }
                        </Button>
                    )}
                </Box>
                <Button color='error' variant='contained' onClick={()=>{setSubmit(true);setResultPopUp(true)}}>Submit Assigments</Button>
          </Box>}
        <Box className='flex items-center justify-between w-full h-10'>
          <Typography className='text-gray-400'>Question</Typography>
          <Typography className={`${questionData.Level === 'Easy' ? 'text-green-600' : (questionData.Level === 'Medium') ? 'text-yellow-600' : 'text-red-600'} 
              text-center rounded-md ${questionData.Level === 'Easy' ? 'bg-green-100' : (questionData.Level === 'Medium') ? 'bg-yellow-100' : 'bg-red-100'} w-16`}
              >{questionData.Level}
          </Typography>
        </Box>
        <Typography variant='h4'>{questionData.Question && JSON.parse(questionData.Question).Title}</Typography>
        <Divider sx={{margin : '10px 0'}}/>
        <Box className={`w-full min-h-52 ${(weekly_Assignment === 'True' || weekly_Assignment === 'Past') ? 'max-h-[44rem]' : 'max-h-[48rem]'} overflow-y-auto`} sx={{scrollbarWidth : 'thin'}}>
          {questionData.Question && JSON.parse(`${questionData.Question}`).Question.split('\n').map(text=>(<Typography 
            sx={{fontSize : '18px', margin : '20px 0', fontWeight : (text.includes('<strong>')) ? 'bold' : '',fontFamily : 'unset'}}>
            {text.replace('<strong>',"").replace('</strong>',"")}
            </Typography>))}
          {questionData.Examples && JSON.parse(questionData.Examples).map((example, index)=><Box className='pt-2 pb-2 mt-5'>
            <Typography variant='h5' sx={{margin : '0 0 20px 0'}}>Example {index+1}</Typography>
            <Typography sx={{fontWeight : 'bold'}}>Input</Typography>
            <Box className='bg-gray-200 rounded-md p-2 h-auto mt-2'>
              {example.input.map(input=><Typography>{input}</Typography>)}
            </Box>
            <Typography sx={{fontWeight : 'bold', margin : '15px 0'}}>Output</Typography>
            <Box className='bg-gray-200 rounded-md p-2 h-auto mt-2'>
            {example.output.map(output=><Typography>{output}</Typography>)}
            </Box>
            <Typography sx={{fontWeight : 'bold', margin : '15px 0'}}>Explanation</Typography>
            {example.explanation.map(explan=><Typography>{explan}</Typography>)}
          </Box>)}
        </Box>
      </Box> : 
      <Box className='pt-3 pb-3 max-h-[55rem] overflow-y-auto flex flex-col items-center' sx={{scrollbarWidth : 'thin'}}>
        {results && results.status && results.status === 'Failed' ? <>
            <Accordion expanded className='w-full border-[1px]'>
              <AccordionSummary>
                <Box className='w-full flex items-center justify-between'>
                  <Typography color='error' variant='h5'>Error</Typography>
                  <Typography color='error' variant='h6' 
                    className='w-16 text-center bg-red-100 rounded-md' >{results.status}</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
              <Typography color='error'>{results.message.toUpperCase()}</Typography>
              </AccordionDetails>
            </Accordion>
        </> : 
        (results && Array.isArray(results.results) && results.results.length > 0 ?
        <>
        <Typography variant='h5' className='flex items-center' sx={{fontWeight : 'bold', margin : '20px 0'}}>Results : 
          <Typography variant='h5' sx={{fontWeight : 'normal', marginLeft : '10px'}} color={results.all_tests_passed ? '#4caf50' : 'error'}>
            {results.all_tests_passed ? 'You have Passed All the Test Cases' : 'You have Failed the Test Cases'}
          </Typography>
        </Typography>
        {Array.isArray(results.results) && results.results.map((result,index)=>(
          <Accordion expanded={expand === index} onChange={()=>setExpand(expand === index ? null : index)} 
            sx={{boxShadow : '0 0 5px rgba(0,0,0,0.5)', width : '98%'}}>
          <AccordionSummary expandIcon={<ExpandMore/>}>
            <Box className='w-[95%] h-full flex items-center justify-between'>
              <Typography className='w-1/2 mr-52'>Test Case {index + 1} </Typography>
              <Typography className={`${(result.status && (result.status === 'pass' || result.passed === true))
                                     ? 'text-green-600' : 'text-red-600'} ${(result.status && (result.status === 'pass' || result.passed === true)) ? 'bg-green-100' : 'bg-red-100'} w-20 text-center rounded-md`}>
                {(result.status === 'pass' || result.passed === true) ? 'Passed' : 'Failed'}
              </Typography>
            </Box>
            </AccordionSummary>
          <AccordionDetails>
          <Typography sx={{fontWeight : 'bold'}}>Input</Typography>
            <Box className='bg-gray-200 rounded-md p-2 h-auto mt-2 overflow-auto' sx={{scrollbarWidth : 'thin'}}>
              {result.inputs && result.inputs.map(input=>(<Typography className='whitespace-nowrap' >{input}</Typography>))}
            </Box>
            <Typography sx={{fontWeight : 'bold', marginTop : '20px'}}>Expected Output</Typography>
            <Box className='bg-gray-200 rounded-md p-2 h-auto mt-2 overflow-auto' sx={{scrollbarWidth : 'thin'}}>
              {result.expected && result.expected.map(output=><Typography className='whitespace-nowrap' >{output}</Typography>)}
            </Box>
            <Typography sx={{fontWeight : 'bold', marginTop : '20px'}}>Your Output</Typography>
            <Box className='bg-gray-200 rounded-md p-2 h-auto mt-2 overflow-auto' sx={{scrollbarWidth : 'thin'}}>
              {Array.isArray(result.output) ? result.output.map(output=><Typography className='whitespace-nowrap' >{output}</Typography>) : <Typography>{result.output}</Typography>}
            </Box>
            <Box className='flex items-start justify-start'>
              <Box className='w-[25%] flex flex-col items-start justify-start'>
                <Typography variant='h5' sx={{marginTop : '30px'}}>RUNTIME</Typography>
                <Typography variant='h4' color='primary' sx={{marginTop : '10px'}}>{result.execution_time}</Typography>
              </Box>
              {result.stderr && <Box className='w-[75%]'>
                <Typography variant='h5' color='error' sx={{marginTop : '30px'}}>ERROR</Typography>
                <Typography color='error' sx={{marginTop : '10px'}}>{result.stderr}</Typography>
              </Box>}
            </Box>
          </AccordionDetails>
        </Accordion>))}
        </> : <Typography variant='h4' sx={{margin : '30px 0'}}>Submit Question to show results.</Typography>)}
        </Box>}
        </> : <Typography sx={{margin : '30px 0'}} variant='h4'>No Selected Question.</Typography>)}
    </Box>
    </>
  )
}

export default CodingQuestionPage