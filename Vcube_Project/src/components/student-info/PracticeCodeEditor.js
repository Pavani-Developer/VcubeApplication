import React, { startTransition, useContext, useEffect, useRef, useState } from 'react';
import { Box, Button, Card, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, IconButton, InputAdornment, Menu, MenuItem, Paper, Select, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, TextField, Typography } from '@mui/material';
import { Editor } from '@monaco-editor/react';
import { CancelRounded, CheckCircleRounded, DriveFileRenameOutlineRounded, ExpandLessRounded, ExpandMoreRounded, FileOpenRounded, FullscreenExitRounded, FullscreenRounded, LogoutRounded, SaveRounded } from '@mui/icons-material';
import InputField from '../InputField';
import styled from 'styled-components';
import Preview from './Preview';
import StudentCongifForm from './StudentCongifForm';
import { ExecuteCodeContext } from '../api/ExecuteCode';
import { handleFullScreen, handleExitFullScreen } from './AssessmentCodeEditor';
import DOMPurify from 'dompurify';


const PracticeCodeEditor = ({ isOpen, setIsOpen, handleShowSnackbar, configs, fetchStdData, stdId }) => {
    const { runCode } = useContext(ExecuteCodeContext);
    const [disp, setDisp] = useState(false);
    const code = useRef({
        python: '# Write your Python code here',
        html: '<!DOCTYPE html>\n<html>\n<head>\n\t<title>Document</title>\n</head>\n<body>\n\t<!-- Your content here -->\n</body>\n</html>',
        css: 'body {\n\tfont-family: Arial, sans-serif;\n}',
        js: '// Write your JavaScript code here',
        javascript: '// Write your JavaScript code here',
        java: '// Write your Java code here',
        sql: '-- Write SQL queries here--;',
        cpp: '// Write your C++ code here',
        c: '// Write your C code here'
    });

    const [language, setLanguage] = useState('python');
    const [fileExtension, setFileExtension] = useState('.py');
    const [size, setSize] = useState(18); 
    const [input, setInput] = useState('');
    const output = useRef('');
    const [tab_Value, set_Tab_Value] = useState(0);
    const [tabValue, setTabValue] = useState(0);
    const [extendRows, setExtendRows] = useState(5);
    const [confirmSave, setConfirmSave] = useState(false);
    const [fileName, setFileName] = useState(null);
    const [dBConfig, setDBConfig] = useState(false);
    const [queries, setQueries] = useState('');
    const [results, setResults] = useState([]);
    const [keys, setKeys] = useState([]);
    const cardRef = useRef(null);
    const [hideConsole, setHideConsole] = useState(true);
    const [loading1, setLoading1] = useState(false);
    const [full_Screen, setFull_Screen] = useState(false);
    const [close, setClose] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [timer, setTimer] = useState(10);

    useEffect(() => {
        startTransition(()=>{
            if (cardRef.current) {
                cardRef.current.scrollTop = cardRef.current.scrollHeight;
            }
        })
    }, [queries]);

    const removeSQLComments = (sql) => {
        let cleanedSql = sql.replace(/^\s*--.*$/gm, '');
        cleanedSql = cleanedSql.replace(/\/\*[\s\S]*?\*\//g, '');
        cleanedSql = cleanedSql.replace(/\n\s*\n/g, '\n').trim();
        return cleanedSql;
    }

    useEffect(()=>{
        startTransition(()=>{
            if (language === 'sql' && configs === ''){
                setDBConfig(true);
            }
        })
    },[language])

    useEffect(() => {
        startTransition(() => {
            if (Array.isArray(results) && results.length > 0) {
                const keysList = results.map((subArray) => {
                    if (Array.isArray(subArray) && subArray.length > 0) {
                        return Object.keys(subArray[0]);
                    }
                    return [];
                });
                setKeys(keysList);
            }
        });
    }, [results]);
    

    const VisuallyHiddenInput = styled('input')({
        clip: 'rect(0 0 0 0)',
        clipPath: 'inset(50%)',
        height: 1,
        overflow: 'hidden',
        position: 'absolute',
        bottom: 0,
        left: 0,
        whiteSpace: 'nowrap',
        width: 1,
    });

    const StyledTableRow = styled(TableRow)(({ theme }) => ({
        '&:nth-of-type(odd)': {
          backgroundColor: '#f3f4f6',
        },
        '&:last-child td, &:last-child th': {
          border: 0,
        },
      }));

    useEffect(()=>{
        startTransition(()=>{
            const fileExtension = language === 'python' ? '.py' : language === 'javascript' ? '.js' : 
                    language === 'java' ? '.java' : language === 'sql' ? '.sql' : language === 'c' ? '.c' :
                    language === 'html' ? '.html' : '.cpp';
            setFileExtension(fileExtension);
        })
    },[language])

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

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file){
            const extension = file.name.split('.');
            const extensionType = extension[extension.length - 1];
            if(extensionType === 'py' || extensionType === 'js' || extensionType === 'java' || extensionType === 'c'
                || extensionType === 'cpp' || extensionType === 'cc' || extensionType === 'cxx' || extensionType === 'sql'){
                const reader = new FileReader();
                reader.onload = (e) => {
                    code.current[language] = e.target.result;
                    setDisp(!disp);
                };
                reader.readAsText(file);
            }else{
                handleShowSnackbar('error','Please upload a valid file.');
            }
        }
      };

    const saveFile = (lang) => {
        setConfirmSave(false);
        let blob = new Blob([code.current[lang || language]], { type: 'text/plain;charset=utf-8' });

        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `${fileName}${lang ? `.${lang}` : fileExtension}`;

        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setFileName(null);
    };

    const downloadHtmlFiles = async () => {
        const fileTypes = ['html', 'css', 'js'];
        const promises = fileTypes.map(async (fileType) => {
          await saveFile(fileType);
        });
        await Promise.all(promises);
    };

    const run_Code = async () => {
        if(language === 'sql'){
            if(configs === '' || !configs){
                setLoading1(false);
                setDBConfig(true);
                return;
            }
        }
        const data = {
            Code : language === 'sql' ? removeSQLComments(code.current[language]) : code.current[language],
            Input : input,
            Language : language
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
                setResults(getResult);
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

    useEffect(() => {
        const handleFullscreenChange = () => {
            if (document.fullscreenElement) {
                setFull_Screen(true);
            } else {
                setFull_Screen(false);
            }
        };
  
        document.addEventListener('fullscreenchange', handleFullscreenChange);
  
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
      }, []);

   return (
    <>
    <Dialog open={isOpen} fullScreen sx={{zIndex : '700'}}>
        <DialogContent className='fullScreen w-screen h-screen bg-white' sx={{padding : '8px 15px', scrollbarWidth : 'thin'}}>
            <Box className='flex items-center justify-between h-12'>
                <Box className='w-[53%] flex items-center justify-start'>
                    <FormControl className='w-[25%]' onClick={handleExitFullScreen}>
                        <Select sx={{height : '40px'}} value={language}
                            onChange={(e)=>setLanguage(e.target.value)}>
                            <MenuItem value='python'>Python</MenuItem>
                            <MenuItem value='html'>HTML /CSS /JS</MenuItem>
                            <MenuItem value='java'>Java</MenuItem>
                            <MenuItem value='javascript'>Javascript</MenuItem>
                            <MenuItem value='sql'>SQL</MenuItem>
                            <MenuItem value='c'>C</MenuItem>
                            <MenuItem value='cpp'>C++</MenuItem>
                        </Select>
                    </FormControl>
                    <Button startIcon={<SaveRounded />} variant='outlined' 
                        sx={{margin : '0 25px',width : '20%'}} onClick={()=>{setConfirmSave(true);handleExitFullScreen()}}>Save File
                    </Button>
                    <Button startIcon={<FileOpenRounded />} variant='outlined' sx={{width : '20%'}}
                        component="label" role={undefined} tabIndex={-1}>Open File
                        <VisuallyHiddenInput type="file" accept=".java,.py,.c,.cpp,.cc,.cxx,.js,.sql,.html,.css" onChange={(e)=>handleFileUpload(e)} />
                    </Button>
                    <img src='/images/V-Cube-Logo.png' width='12%' alt='' className='ml-40'/>
                </Box>
                <Box className='w-[20%] flex items-center justify-between'>
                <FormControl className='w-[60%]'>
                    <Select sx={{height : '40px'}}
                        onClick={handleExitFullScreen}
                        value={size}
                        onChange={(e)=>setSize(e.target.value)}>
                        {[15,16,17,18,19,20,21,22,23,24,25].map(size=><MenuItem value={size}>{size}</MenuItem>)}
                    </Select>
                </FormControl>
                    <IconButton onClick={()=>full_Screen ? handleExitFullScreen() : handleFullScreen()}>
                        {full_Screen ? <FullscreenExitRounded sx={{fontSize : '30px'}} /> : <FullscreenRounded sx={{fontSize : '30px'}} />}
                    </IconButton>
                    <IconButton onClick={()=>{setClose(true);handleExitFullScreen()}}><LogoutRounded /></IconButton>
                </Box>
            </Box>
            {language === 'html' && <Tabs value={tabValue} className='mb-3'>
                    <Tab label='Html' onClick={()=>setTabValue(0)}/>
                    <Tab label='Css' onClick={()=>setTabValue(1)}/>
                    <Tab label='Js' onClick={()=>setTabValue(2)}/>
            </Tabs>}
            <Box className={`flex w-full ${full_Screen && (!hideConsole || language === 'html') ? 'h-[85%]' : full_Screen ? 'h-[69%]' : language === 'html' ? 'h-[80%]' : (hideConsole) ? 'h-[63%]' : 'h-[82.50%]'} rounded-md overflow-hidden`}>
            {language === 'html' ?
            <Editor
                height='100%'
                width='100%'
                language={tabValue === 0 ? 'html' : tabValue === 1 ? 'css' : 'javascript'}
                value={code.current[tabValue === 0 ? 'html' : tabValue === 1 ? 'css' : 'js']}
                options={{ fontSize: size }}
                onChange={(value) => {code.current[tabValue === 0 ? 'html' : tabValue === 1 ? 'css' : 'js'] = DOMPurify.sanitize(value); setDisp(!disp)} }
                theme="vs-dark"
            />
            :
            <Editor
                height='100%'
                width='100%'
                language={language}
                value={code.current[language]}
                options={{ fontSize: size }}
                onChange={(value) => {code.current[language] = DOMPurify.sanitize(value); setDisp(!disp)} }
                theme="vs-dark"
                />}
            </Box>
            {language === 'sql' ? <>
                <Box className='w-full h-14 flex items-center justify-between'>
                    <Button variant='outlined' onClick={()=>setDBConfig(true)}>{configs === '' ? 'Add' : 'Change'} Database Configurations</Button>
                    <Box className='relative w-[20%]'>
                    <Button disabled={loading1} onClick={()=>{if(!submitted){setLoading1(true);setTimeout(()=>{run_Code()},2000)}}} variant='outlined' sx={{width : '100%'}}>Run Code {submitted ? timer < 10  ? `in 0${timer}` : `in ${timer}` : null}</Button>
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
                </Box>
            </> : language !== 'html' && <Box className='w-full h-12 flex items-center justify-between'>
                <Tabs value={tab_Value} sx={{visibility : (hideConsole) ? 'visible' : 'hidden'}}>
                    <Tab label='Input' sx={{fontWeight : 'bold', fontFamily : 'unset'}} onClick={()=>set_Tab_Value(0)}/>
                    <Tab label='Output' sx={{fontWeight : 'bold', fontFamily : 'unset'}} onClick={()=>set_Tab_Value(1)}/>
                </Tabs>
                <Box className='relative w-[20%]'>
                    <Button sx={{width : '100%'}} disabled={loading1} variant='outlined' 
                        onClick={()=>{output.current = '';if(!submitted){setLoading1(true);setTimeout(()=>{run_Code()},2000)}}}>Run Code {submitted ? timer < 10  ? `in 0${timer}` : `in ${timer}` : null}</Button>
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
            </Box>}

            {hideConsole && (language !== 'sql' && language !== 'html') && (tab_Value === 0 ? <TextField rows={extendRows} value={input} onChange={(e)=>setInput(e.target.value)}
                multiline placeholder='Enter your test input here...' className='w-full' sx={{marginTop : '5px'}} /> :

            <TextField rows={extendRows} InputProps={{readOnly: true}} value={output.current}
                multiline placeholder='Your output will be appear here...' className='w-full' sx={{marginTop : '5px'}} />)}

            {language === 'sql' ? <>
                <Card className='w-full h-40 max-w-full max-h-40 overflow-auto mb-5' 
                    sx={{overflow : 'auto', scrollbarWidth : 'thin', boxShadow : '0 0 5px rgba(0,0,0,0.5)'}} ref={cardRef}>
                    <Box className='whitespace-nowrap'>
                    {queries && Array.isArray(queries) && queries.map((query, index) => (
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
                    ))}
                    </Box>
                </Card>
                {keys && Array.isArray(keys) && keys.map((item, index) => (
                <TableContainer key={index} component={Paper} sx={{ border: 'solid 1px lightgrey', marginBottom: '25px' }}>
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
                            {Array.isArray(results) && results.length > 0 && Array.isArray(results[index]) ? (
                                results[index].map((row, rowIndex) => (
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
            ))}

            </>
             : (language !== 'sql' && language !== 'html') &&
                <Box className='w-full flex items-center justify-between'>
                {!hideConsole ? <Button startIcon={<ExpandMoreRounded/>} onClick={()=>setHideConsole(true)}>Show Console</Button> : 
                    <Button startIcon={<ExpandLessRounded/>}  onClick={()=>setHideConsole(false)}>Hide Console</Button>}
                {hideConsole && (extendRows === 5 ? <Button onClick={()=>setExtendRows(30)} startIcon={<ExpandMoreRounded />}>Expand Console</Button> :
                     <Button startIcon={<ExpandLessRounded />} onClick={()=>setExtendRows(5)}>Contract Console</Button>)}
                </Box>}

            {language === 'html' && <Preview html={code.current['html']} css={code.current['css']} js={code.current['js']} />}
        </DialogContent>
    </Dialog>

    <Dialog open={confirmSave} sx={{zIndex : '710'}} maxWidth='lg'>
        <DialogTitle variant='h5'>Specify a file name for saving your code.</DialogTitle>
        <DialogContent className='h-[13rem] w-[50rem] place-content-center'>
            <Typography color='error'>Note: If you want to save this file in a specific location.</Typography>
            <Typography>Make sure to activate the <strong>'ask where to save files'</strong> option in your browser settings.
                This setting can be configured in your browser's download preferences.</Typography>
            <Box className='w-[70%] h-20 ml-[15%] flex items-start justify-between'>
            <DriveFileRenameOutlineRounded className='mt-11' color={fileName ? 'primary' : 'error'} sx={{fontSize : '30px'}} />
            <InputField label='Enter File Name' className='w-[92%]' sx={{marginTop : '20px'}}
                value={fileName} onChange={(e)=>setFileName(e.target.value)}
                error={!fileName || (fileName && fileName.includes('.'))}
                helperText={fileName && fileName.includes('.') ? 'Enter a Valid File Name' : ''}
                InputProps={{endAdornment: <InputAdornment position="end">
                <Typography color={fileName ? 'primary' : 'error'} variant='h6'>{fileExtension}</Typography>
            </InputAdornment>}} />
            </Box>
        </DialogContent>
        <DialogActions>
            <Button variant='outlined' onClick={()=>setConfirmSave(false)}>Cancel</Button>
            <Button variant='contained' onClick={()=>fileName && !fileName.includes('.') && (language === 'html' ? downloadHtmlFiles() : saveFile())}>Save</Button>
        </DialogActions>
    </Dialog>
    <StudentCongifForm handleShowSnackbar={handleShowSnackbar} isOpen={dBConfig} setIsOpen={setDBConfig} fetchStdData={fetchStdData} stdId={stdId} />
    <Dialog open={close} onClose={()=>setClose(false)}>
        <DialogContent>
        <Typography>
        Before exiting, please save your file to avoid losing any unsaved changes. If your file is already saved, you can dismiss this warning
        </Typography>
        </DialogContent>
        <DialogActions>
            <Button variant='outlined' onClick={()=>{setIsOpen(false);setClose(false)}}>Exit</Button>
            <Button variant='contained' onClick={()=>{setConfirmSave(true);setClose(false)}}>Save File</Button>
        </DialogActions>
    </Dialog>
    </>
  )
}

export default PracticeCodeEditor;
