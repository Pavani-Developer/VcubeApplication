import React, { startTransition, useContext, useEffect, useRef, useState } from 'react';
import { Box, Button, Card, CircularProgress, Paper, SpeedDial, SpeedDialAction, SpeedDialIcon, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, TextField, Typography } from '@mui/material';
import { Editor } from '@monaco-editor/react';
import { ExecuteCodeContext } from '../api/ExecuteCode';
import styled from 'styled-components';
import { CancelRounded, CheckCircleRounded, Close, ExpandLessRounded, ExpandMoreRounded, Looks3Rounded, Looks4Rounded, Looks5Rounded, Looks6Rounded, LooksOneRounded, LooksTwoRounded } from '@mui/icons-material';
import { StudentsContext } from '../api/students';
import { DateTime } from '../date-time';
import DOMPurify from 'dompurify';


const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
      backgroundColor: '#f3f4f6',
    },
    '&:last-child td, &:last-child th': {
      border: 0,
    },
}));

const CodeEditor = ({ setResults, test_Cases, stdId, handleShowSnackbar, setResultPopUp, hideQuestion, isSql, full_Screen, 
                        setTabValue, questionId, name, course, batchName, isUser, updateScore, setTime_Up, minutes, setMinutes, }) => {
    const { runCode, executeCode } = useContext(ExecuteCodeContext);
    const { getStudentAttendanceById, postStudentAttendance } = useContext(StudentsContext);
    const [disp, setDisp] = useState(false);
    const code = useRef({
        javascript: '// Write your JavaScript code here',
        python: '# Write your Python code here',
        java: `// Write your Java code here \npublic class Main {
    public static void main(String[] args) {

    }\n}`,
        sql: '-- Write SQL queries here--;',
        cpp: '// Write your C++ code here',
        c: '// Write your C code here'
    });
    const [language, setLanguage] = useState(isSql ? 'sql' : 'python');
    const weekly_Assignment = sessionStorage.getItem('Weekly Assignment');
    const [size, setSize] = useState(18); 
    const [input, setInput] = useState('');
    const output = useRef('');
    const attData = useRef(null);
    const [queries, setQueries] = useState('');
    const [sqlResults, setSqlResults] = useState('');
    const [keys, setKeys] = useState([]);
    const [tab_Value, set_Tab_Value] = useState(0);
    const [hours, setHours] = useState(weekly_Assignment === 'True' || weekly_Assignment === 'Past' ? 1 : 0);
    const [seconds, setSeconds] = useState(0);
    const [loading1, setLoading1] = useState(false);
    const [loading2, setLoading2] = useState(false);
    const [hideConsole, setHideConsole] = useState(false);
    const cardRef = useRef(null);
    const [submitted, setSubmitted] = useState(false);
    const [timer, setTimer] = useState(10);

    const fetchData = async () => {
        const res = await getStudentAttendanceById(stdId);
        if (res && res.message){
            res.response.status !== 404 && handleShowSnackbar('error',res.message);
        }else if(res){
            const data = Array.isArray(res) && res.filter(data=>data.Attendance_Type.split('~')[0] === 'Assignment');
            attData.current = data;
        }
    }
        
    useEffect(()=>{
        fetchData();
    },[])
    
    useEffect(() => {
        language === 'sql' && startTransition(() => {
            if (Array.isArray(sqlResults) && sqlResults.length > 0) {
                const keysList = sqlResults.map((subArray) => {
                    if (Array.isArray(subArray) && subArray.length > 0) {
                        return Object.keys(subArray[0]);
                    }
                    return [];
                });
                setKeys(keysList);
            }
        });
    }, [sqlResults]);

    useEffect(() => {
        startTransition(()=>{
            if (cardRef.current) {
                cardRef.current.scrollTop = cardRef.current.scrollHeight;
            }
        })
    }, [queries]);

    useEffect(() => {
        let timerId;
      
        if (submitted) {
          timerId = setTimeout(() => {
            setTimer((prev) => prev - 1);
          }, 1000);              
        }
    
        if (timer === 0) {
          setSubmitted(false);
          setTimer(10);
        }
      
        return () => clearTimeout(timerId);
      }, [timer, submitted]);

    const removeSQLComments = (sql) => {
        let cleanedSql = sql.replace(/^\s*--.*$/gm, '');
        cleanedSql = cleanedSql.replace(/\/\*[\s\S]*?\*\//g, '');
        cleanedSql = cleanedSql.replace(/\n\s*\n/g, '\n').trim();
        return cleanedSql;
    }

    const run_Code = async () => {
        const data = {
            id : stdId,
            Code : language === 'sql' ? removeSQLComments(code.current[language]) : code.current[language],
            Input : input,
            Language : language,
        }

        const res = await runCode(data);
        setLoading1(false);
        if (language === 'sql'){
            if (Array.isArray(res.data)) {
                setQueries(prev => [...prev, ...res.data]);
            } else {
                setQueries(prev => [...prev, res.data]);
            }
            const getResult = res && res.data && res.data
                .filter(data => data.result)
                .map(data => data.result);
                setSqlResults(getResult);
        }else{
            if (res && res.message){
                output.current = `Error: ${res.response ? res.response.data.error : res.message}`;
            }else if(res){
                output.current = `${res.data.output}\n\nExecution complete. The code ran for ${res.data.execution_time}`;
            }
        }
        set_Tab_Value(1);
        setSubmitted(true);
    };

    const execute_Code = async () => {
        const data = {
            id : stdId,
            Code : language === 'sql' ? [removeSQLComments(code.current[language])] : code.current[language],
            TestCases: test_Cases,
            Language : language
        }
        const res = await executeCode(data);
        setLoading2(false);
        if (language === 'sql'){
            setResults.current = res.data;
            if(res.data.all_tests_passed === true)SubmitAssignment();
        }else{
            if (res && res.message){
                output.current = `Error: ${res.response ? res.response.data.error : res.message}`;
                setResults.current = {'status' : 'Failed', 'message' : res.response ? res.response.data.error : res.message};
            }else if(res){
                console.log(res.data);
                setResults.current = res.data;
                const resul = res.data.results.filter((data)=>data.status === 'pass');
                if(weekly_Assignment === 'True' || weekly_Assignment === 'Past')updateScore(questionId, (resul.length / test_Cases.length) * 100);
                if(res.data.all_tests_passed === true && isUser === 'Student' && !(weekly_Assignment === 'True' || weekly_Assignment === 'Past')){
                    SubmitAssignment();
                }
            }
        }
        setResultPopUp(true);
        !weekly_Assignment === 'True' && setTabValue(1);
        setSubmitted(true);
    };

    const SubmitAssignment = async () => {
        if(isUser !== 'Student')return;
        if(attData.current && attData.current.some(data=>data.Attendance_Type.split('~')[1] === `${questionId}`))return;
        const data = {
            StudentId : stdId,
            Name : name,
            Course : course,
            BatchName : batchName,
            Date : DateTime().split(' ')[0],
            Attendance_Type : `${weekly_Assignment === 'True' ? 'Weekly Assignment' : 'Assignment'}~${questionId}~${hours < 10 ? `0${hours}` : hours}:${minutes < 10 ? `0${minutes}` : minutes}:${seconds < 10 ? `0${seconds}` : seconds }`
        }
        const res = await postStudentAttendance(data);
        fetchData();
        if(res && res.message){
            handleShowSnackbar('error',res.message);
        }
    }

    useEffect(() => {
    let totalSeconds = hours * 3600 + minutes * 60 + seconds;
    let interval;
    
    if (weekly_Assignment === 'True' || weekly_Assignment === 'Past') {
        if(hours === 0 && minutes === 0 && seconds === 0)setTime_Up(true);
        interval = setInterval(() => {
        if (totalSeconds > 0) {
            totalSeconds -= 1;
            setHours(Math.floor(totalSeconds / 3600));
            setMinutes(Math.floor((totalSeconds % 3600) / 60));
            setSeconds(totalSeconds % 60);
            sessionStorage.setItem('Assignment_Time',`${totalSeconds}`);
        } else {
            clearInterval(interval);
        }
        }, 1000);
    } else {
        interval = setInterval(() => {
        totalSeconds += 1;
        setHours(Math.floor(totalSeconds / 3600));
        setMinutes(Math.floor((totalSeconds % 3600) / 60));
        setSeconds(totalSeconds % 60);
        }, 1000);
    }
    return () => clearInterval(interval);
    }, [hours, minutes, seconds, weekly_Assignment, setTime_Up]);


    useEffect(()=>{
        isUser === 'Student' && document.addEventListener('keydown',(e)=>{
            if (isUser === 'Student'){
                if ((e.key === 'c' && (e.ctrlKey || e.metaKey)) && !e.shiftKey) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                if ((e.key === 'v' && (e.ctrlKey || e.metaKey)) && !e.shiftKey) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            }
        })
    },[])

    const sanitizedCode = () => {
        return DOMPurify.sanitize(code.current[language]);
    };

    useEffect(() => {
        const safeCode = sanitizedCode();
    }, [disp]);

    const formatTime = (time) => String(time).padStart(2, '0');

    const actions = [
        !isSql && { icon: <img src='/images/python-logo.png' alt='' width='20px' />, name: 'Python', onClick: () => setLanguage('python') },
        !isSql && { icon: <img src='/images/javascript-logo.png' alt='' width='20px' />, name: 'Javascript', onClick: () => setLanguage('javascript') },
        !isSql && { icon: <img src='/images/java-logo.png' alt='' width='20px' />, name: 'Java', onClick: () => setLanguage('java') },
        isSql && { icon: <img src='/images/sql-logo.png' alt='' width='20px' />, name: 'SQL', onClick: () => setLanguage('sql') },
        !isSql && { icon: <img src='/images/c-logo.png' alt='' width='20px' />, name: 'C', onClick: () => setLanguage('c') },
        !isSql && { icon: <img src='/images/cpp-logo.png' alt='' width='20px' />, name: 'C++', onClick: () => setLanguage('cpp') },
    ].filter(Boolean);

    const sizeActions = [
        { icon: <LooksOneRounded />, name: '15px', onClick: () => setSize(15) },
        { icon: <LooksTwoRounded />, name: '18px', onClick: () => setSize(18) },
        { icon: <Looks3Rounded />, name: '22px', onClick: () => setSize(22) },
        { icon: <Looks4Rounded />, name: '25px', onClick: () => setSize(25) },
        { icon: <Looks5Rounded />, name: '30px', onClick: () => setSize(30) },
        { icon: <Looks6Rounded />, name: '35px', onClick: () => setSize(35) },
    ];

    return (
    <Box className={`${hideQuestion ? 'w-[70%]' : 'w-1/2'} ${(minutes === 29 || minutes === 4 || minutes === 0) && (weekly_Assignment === 'True' || weekly_Assignment === 'Past') ? 'blink-background' : ''} h-full bg-white rounded-md pt-1 pr-2 pl-2 border-2 border-gray-200`}>
        <Box className='relative flex items-center justify-center h-12'>
            <SpeedDial
            ariaLabel="Menu SpeedDial"
            sx={{
                bgcolor: 'transparent',
                position: 'absolute',
                left: '0px',
                top: '-2px',
                zIndex: '100',
                '& .MuiSpeedDial-fab': {
                bgcolor: 'transparent',
                color: 'black',
                width : '45px',
                height : '45px',
                '&:hover': {
                    bgcolor: 'transparent',
                },
                },
            }}
            
            icon={<SpeedDialIcon sx={{ display : 'flex', alignItems : 'center', justifyContent : 'center' }} 
                icon={<img src={`/images/${language}-logo.png`} alt='' width={language === 'python' || language === 'javascript' ? '25px' : '30px'} />} 
                openIcon={<Close sx={{ fontSize: '30px' }} className='text-gray-500' />} />}
            direction='down'
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
            <Box className={`relative border-[1.50px] ${weekly_Assignment === 'True' || weekly_Assignment === 'Past' ? minutes < 15 ? 'border-red-400' : minutes < 30 ? 'border-yellow-400' : minutes < 45 ? 'border-orange-400' : 'border-green-400' : 'border-gray-400'} 
                ${weekly_Assignment === 'True' || weekly_Assignment === 'Past' ? minutes < 15 ? 'text-red-700' : minutes < 30 ? 'text-yellow-700' : minutes < 45 ? 'text-orange-700' : 'text-green-700' : 'text-black'}
                flex items-center justify-center h-[40px] w-[20%] rounded-md`} sx={{fontSize : '18px'}}>
                <Box className='w-full h-full bg-transparent flex items-center justify-center overflow-hidden' sx={{zIndex : '710'}}>
                    {formatTime(hours)} : {formatTime(minutes)} : {formatTime(seconds)}
                </Box>
                <Box className={`absolute top-0 left-0 h-full rounded-md ${weekly_Assignment === 'True' || weekly_Assignment === 'Past' ? minutes < 6 ? 'bg-red-300' :  minutes < 15 ? 'bg-red-100' : minutes < 30 ? 'bg-yellow-100' : minutes < 45 ? 'bg-orange-100' : 'bg-green-100' : 'bg-white'}`} sx={{zIndex : '705', width : `${Math.floor((minutes / 60) * 100)}%`}}></Box>
            </Box>
            <SpeedDial
            ariaLabel="Menu SpeedDial"
            sx={{
                bgcolor: 'transparent',
                position: 'absolute',
                right: '0px',
                top: '-2px',
                zIndex: '100',
                '& .MuiSpeedDial-fab': {
                bgcolor: 'transparent',
                color: 'black',
                width : '45px',
                height : '45px',
                '&:hover': {
                    bgcolor: 'transparent',
                },
                },
            }}
            icon={<SpeedDialIcon sx={{ display : 'flex', alignItems : 'center', justifyContent : 'center' }} 
                icon={size === 15 ? <LooksOneRounded /> : size === 18 ? <LooksTwoRounded /> : size === 22 ? <Looks3Rounded /> :
                    size === 25 ? <Looks4Rounded /> : size === 30 ? <Looks5Rounded /> : <Looks6Rounded />
                } 
                openIcon={<Close sx={{ fontSize: '30px' }} className='text-gray-500' />} />}
            direction='down'
            >
            {sizeActions.map((action) => (
                <SpeedDialAction
                key={action.name}
                icon={action.icon}
                tooltipTitle={action.name}
                onClick={action.onClick}
                arrow
                />
            ))}
            </SpeedDial>
        </Box>
        <Box className={`w-full ${hideConsole ? 'h-[86%]' : full_Screen ? 'h-[52%]' : 'h-[45%]'} rounded-md overflow-hidden`}>
        <Editor
            height="100%"
            width="100%"
            language={language}
            value={code.current[language]}
            options={{ fontSize: size }}
            onChange={(value) => {code.current[language] = value; setDisp(!disp)}}
            theme="vs-dark"
        />
        </Box>
        {!hideConsole && <><Box className='w-full'>
            {language !== 'sql' ? <Tabs value={tab_Value}>
                <Tab label='Input' sx={{fontWeight : 'bold', fontFamily : 'unset'}} onClick={()=>set_Tab_Value(0)}/>
                <Tab label='Output' sx={{fontWeight : 'bold', fontFamily : 'unset'}} onClick={()=>set_Tab_Value(1)}/>
            </Tabs>
            :
            <Tabs value={tab_Value}>
                <Tab label='Output' sx={{fontWeight : 'bold', fontFamily : 'unset'}} onClick={()=>set_Tab_Value(0)}/>
                <Tab label='Results' sx={{fontWeight : 'bold', fontFamily : 'unset'}} onClick={()=>set_Tab_Value(1)}/>
            </Tabs>
            }
        </Box>

        {tab_Value === 0 ? (language !== 'sql' ? <TextField rows={10} value={input} onChange={(e)=>setInput(e.target.value)}
            multiline className='w-full' sx={{marginTop : '10px'}} /> : 
            <>
                <Card className='w-full h-[16.50rem] max-w-full max-h-[16.50rem] overflow-auto mt-[10px]' 
                    sx={{overflow : 'auto', scrollbarWidth : 'thin', boxShadow : '0 0 5px rgba(0,0,0,0.5)'}} ref={cardRef}>
                    <Box>
                    {queries && Array.isArray(queries) && queries.length > 0 ? queries.map((query, index) => (
                        query && query.query && !query.query.startsWith('--') && (
                            <Typography
                                key={index}
                                variant='body2'
                                className='flex items-center w-full whitespace-nowrap overflow-auto'
                                sx={{
                                    margin: '3px 0',
                                    backgroundColor: (index % 2 === 0) ? '#EDF3FD' : 'white',
                                    padding: '8px',
                                    borderRadius: '4px',
                                    scrollbarWidth : 'none'
                                }}
                            >
                                {query.status === 'success' ? 
                                    <CheckCircleRounded color='success' sx={{ fontSize: '18px' }} /> :
                                    <CancelRounded color='error' sx={{ fontSize: '18px' }} />
                                }
                                {query.status === 'error' ? query.error + " • " + query.query : query.message + " • " + query.query}
                            </Typography>
                        )
                    )) : <Typography sx={{margin : '15px', color : 'grey'}}>Queries will appear here.</Typography>}
                    </Box>
                </Card>
            </>) :

        language !== 'sql' ? (<TextField rows={10} InputProps={{readOnly: true}} 
            multiline className='w-full' value={output.current} sx={{marginTop : '10px'}} />) : 
            
            <Box className='w-full h-[16.50rem] max-h-[16.50rem] overflow-auto mt-[10px] border-[1px] border-gray-300 rounded-md' sx={{scrollbarWidth : 'thin'}}>
                {keys && keys.length > 0 ? Array.isArray(keys) && keys.map((item, index) => (
                <TableContainer key={index} component={Paper} sx={{ border: 'solid 1px lightgrey', marginBottom: '25px', scrollbarWidth : 'thin' }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                {Array.isArray(item) && item.length > 0 && item.map((key) => (
                                    <TableCell key={key} sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                                        {key}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {Array.isArray(sqlResults) && sqlResults.length > 0 && Array.isArray(sqlResults[index]) ? (
                                sqlResults[index].map((row, rowIndex) => (
                                    <StyledTableRow key={rowIndex}>
                                        {item.map((key) => (
                                            <TableCell key={key}>
                                                {row[key] !== undefined ? row[key] : 'N/A'}
                                            </TableCell>
                                        ))}
                                    </StyledTableRow>
                                ))
                            ) : (
                                <StyledTableRow>
                                    <TableCell colSpan={keys.length}>No results available</TableCell>
                                </StyledTableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                )) : (
                <TextField rows={10} InputProps={{readOnly: true}} placeholder='Tables will appear here'
                multiline className='w-full' value={''} />)}
            </Box>
        }</>}

        <Box className='h-14 mt-1 flex items-center justify-between'>
            <Button startIcon={hideConsole ? <ExpandMoreRounded/> : <ExpandLessRounded />} onClick={()=>setHideConsole(!hideConsole)}>
                {hideConsole ? 'Show' : 'Hide'} Console
            </Button>
            <Box className='w-[50%] flex items-center justify-between'>
                <Box className='relative w-[50%]'>
                    <Button variant='outlined' disabled={loading1} sx={{width : '90%', marginRight : '0'}}
                    onClick={()=>{if(!submitted){setLoading1(true);output.current = '';setSqlResults('');setTimeout(()=>{run_Code()},2000)}}}>Run Code {submitted ? timer < 10  ? `in 0${timer}` : `in ${timer}` : null}</Button>
                    {loading1 && (
                    <CircularProgress
                    size={24}
                    sx={{
                        color: 'primary',
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        marginTop: '-12px',
                        marginLeft : '-18px',
                    }}
                    />
                    )}
                </Box>
                <Box className='relative w-[50%]'>
                    <Button variant='contained' sx={{width : '90%', margin : '0 0 0 15px'}}
                        disabled={(weekly_Assignment === 'True' && hours === 0 && minutes === 0 && seconds === 0) || loading2}
                        onClick={()=>{if(!submitted){setLoading2(true);setTimeout(()=>{execute_Code()},2000)}}}>Submit {submitted ? timer < 10  ? `in 0${timer}` : `in ${timer}` : null}</Button>
                    {loading2 && (
                    <CircularProgress
                    size={24}
                    sx={{
                        color: 'primary',
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        marginTop: '-12px',
                    }}
                    />
                    )}
                </Box>
            </Box>
        </Box>
    </Box>
    )
}

export default CodeEditor;
