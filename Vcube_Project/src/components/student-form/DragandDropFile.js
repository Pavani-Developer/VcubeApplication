import React, { useContext, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Typography, Button, CircularProgress, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, IconButton } from '@mui/material';
import { CloudUploadOutlined, ArrowForward, TouchAppRounded, CheckCircleRounded, LoginRounded, DeleteForever, CloseRounded } from '@mui/icons-material';
import { StudentsContext } from '../api/students';
import { BatchContext } from '../api/batch';

const DragAndDropList = ({ onDrop, fileData, fileName, fileError, setUploadManually, handleShowSnackbar, setIsLoading, loading, selectedCourse, selectedBatch, isUser, handleClose, refreshData }) => {
  const { fetchStudentsData, postBulkStudentData, deleteBulkStudentData } = useContext(StudentsContext);
  const { fetchBatchData } = useContext(BatchContext);
  const [isFileError, setIsFileError] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteValue, setDeleteValue] = useState(null);
  const [deleteStdData, setDeleteStdData] = useState(false);
  const [existData, setExistData] = useState([]);
  const [stdExists, setStdExists] = useState(false);
  const [filterData, setFilterData] = useState([]);
  
  useEffect(()=>{
    setIsFileError(fileError);
  },[fileError])

  useEffect(()=>{
    if(onDrop && isFileError){
      setIsFileError(false);
    }
  },[fileName,onDrop, isFileError])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
  });

  const handleSubmit = () => {
    if (onDrop && !fileName){
      handleShowSnackbar('error','Upload a Valid File');
    }else{
      setIsLoading(true);
      getBatchData();
    }
  };

  const getBatchData = async () => {
    const batchData = await fetchBatchData(selectedCourse);
    if (batchData && batchData.message){
      handleShowSnackbar('error',batchData.message);
      setIsLoading(false);
    }else if(batchData && batchData.length > 0){
      checkData(batchData);
    }else{
      handleShowSnackbar('error','Something went wrong. Please try again later.');
      setIsLoading(false);
    }
  };

  const checkData = async(data) => {
    const found = await fileData && fileData.every((stdData) => {
      return data && data.some(batchData => stdData.BatchName === batchData.BatchName);
    });
    if(!found){
      handleShowSnackbar('error','Batch not found. Please add a batch before adding the student.');
      setIsLoading(false);
    }else if(found){
      setIsLoading(true);
      checkStd(fileData);
    }
  };

  const checkStd = async (data) => {
    const fetchData = await fetchStudentsData(selectedCourse);
    if(fetchData && fetchData.message){
      handleShowSnackbar('error',fetchData.message);
    }else if (fetchData){
      const studentData = [];
      const existedData = [];
      await data && (async () => {
        for (const std_Data of data) {
            const stdFound = fetchData && fetchData.some(stdData => 
                parseInt(JSON.parse(stdData.Personal_Info).Phone) === std_Data.Phone || 
                JSON.parse(stdData.Personal_Info).Email === std_Data.Email
            );
            if(stdFound)existedData.push(std_Data);
            if (!stdFound) {
                const sendData = {
                    Name: std_Data.Name,
                    Email: std_Data.Email,
                    Phone: std_Data.Phone,
                    Course: selectedCourse,
                    BatchName: selectedBatch,
                    Joining_Date: std_Data.JoiningDate,
                    Personal_Info: JSON.stringify({
                        Joining_Date: std_Data.JoiningDate,
                        Image : std_Data.Gender === 'Male' ? '/images/Empty-Men-Icon.png' : '/images/Empty-Women-Icon.png',
                        Course: selectedCourse,
                        Name: std_Data.Name,
                        BatchName: selectedBatch,
                        Email: std_Data.Email,
                        Phone: std_Data.Phone,
                        Gender: std_Data.Gender
                    })
                };
                studentData.push(sendData);
            }
            setIsLoading(true);
        }
        if(studentData && studentData.length > 0){
          if(studentData.length !== data.length)handleShowSnackbar('warning','Some student data already exists.');
          if(existedData && existedData.length > 0){
            setExistData(existedData);
            setStdExists(true);
            setFilterData(studentData);
          }else{
            filterStdData(studentData);
          }
        }else{
          handleShowSnackbar('error','Student data not found or already exists.');
          setIsLoading(false);
        }
        })();
    }
  };

  const filterStdData = async(studentData)=>{
    const uniqueStudentData = [];
    for (const value of studentData) {
        const stdFound = uniqueStudentData.some(t => 
            JSON.parse(t.Personal_Info).Phone === JSON.parse(value.Personal_Info).Phone ||
            JSON.parse(t.Personal_Info).Email === JSON.parse(value.Personal_Info).Email
        );
        if (!stdFound) {
            uniqueStudentData.push(value);
        }
        setIsLoading(true);
    };
    if(studentData.length !== uniqueStudentData.length){
      handleShowSnackbar('warning','Duplicate Student Data Found in Uploaded File.');
    }
    postStdData(uniqueStudentData);
    setExistData([]);
    setFilterData([]);
  };

  const postStdData = async (data) => {
    const res = await postBulkStudentData(data);
    setIsLoading(false);
    if(res && res.message){
      handleShowSnackbar('error',res.message);
    }else if (res === true){
      handleShowSnackbar('success','Student Data Imported Successfully.');
      handleClose();
      refreshData();
    }
  }

  const deleteStudentData = async () => {
    if (isUser !== 'Super Admin')return;
    const data = {
      Course : selectedCourse,
      BatchName : selectedBatch
    }
    setIsLoading(true);
    const res = await deleteBulkStudentData(data);
    setIsLoading(false);
    if(res && res.message){
      handleShowSnackbar('error',res.message);
    }else if (res === true){
      handleShowSnackbar('success',`${selectedBatch} Student Data Deleted Successfully.`);
      handleClose();
    }
  }


  return (
    <>
    <Box className="w-full h-full flex flex-col items-center justify-center">
       <Typography variant='h5' sx={{marginBottom : '50px'}}>Import data from an Excel file.</Typography>
    <Box
      {...getRootProps()}
      className="w-1/3 h-60"
      sx={{
        border: (isFileError) ? '2px dashed red' : '2px dashed #ccc',
        borderRadius: '8px',
        padding: '20px',
        textAlign: 'center',
        cursor: 'pointer',
        backgroundColor: isDragActive ? '#f0f0f0' : (isFileError) ? 'rgb(254, 242, 242)' : 'rgb(247 248 249)',
      }}
    >
      <input {...getInputProps()} />
      <CloudUploadOutlined sx={{fontSize : '100px', color : 'lightgrey'}} />
      {isDragActive ? (
        <Typography variant="body1">Drop the file here ...</Typography>
      ) : (
        <Typography variant="body1">
          Drag and drop, or click to select a <strong>xls / xlsx</strong> file.
        </Typography>
      )}
      <Box sx={{ m: 1, position: 'relative' }}>
      <Button variant="contained" component="span" disabled={loading} startIcon={(fileName && !isFileError) ? <CheckCircleRounded/> : <TouchAppRounded/>} color={(isFileError) ? 'error' : (fileName && !isFileError) ? 'success' : 'primary'}>{(fileName && !isFileError) ? 'File Selected' : 'Select File'}</Button>
        {loading && (
          <CircularProgress
            size={24}
            sx={{
              color: 'primary',
              position: 'absolute',
              top: '50%',
              left: '50%',
              marginTop: '-12px',
              marginLeft: '-12px',
            }}
          />
        )}
      </Box>
      {(fileName && !fileError) ? (<Typography sx={{marginTop : '10px'}}><strong>Selected file: </strong> {fileName}</Typography>) : (isFileError) ? <Typography sx={{color : 'red', marginTop : '10px'}}>Upload a Valid File.</Typography> : null}
    </Box>
    <Box className="flex w-1/3 h-10 items-center justify-around mt-10 mb-10">
    {isUser !== 'Super Admin' && <Button variant='outlined' endIcon={<ArrowForward />} onClick={()=>setUploadManually(true)}>Upload Manually</Button>}
    <Button variant='contained' startIcon={<LoginRounded sx={{transform : 'rotate(90deg)'}} />}
       onClick={handleSubmit} sx={{width : (isUser === 'Super Admin' || isUser === 'Admin') ? '100%' : '50%', height : (isUser === 'Super Admin' || isUser === 'Admin') ? '100%' : '90%'}}>Import Data
    </Button>
    </Box>
    {(isUser === 'Super Admin' || isUser === 'Admin') &&
     <Box className='w-1/2 h-12 mt-10 flex items-center justify-evenly'>
        <Button variant='contained' color='error' sx={{width : '40%'}} onClick={()=>setDeleteStdData(true)}>Delete Student's Data</Button>
        <Button variant='outlined' endIcon={<ArrowForward />}  sx={{width : '40%'}} onClick={()=>setUploadManually(true)}>Upload Manually</Button>
    </Box>}
    </Box>


    <Dialog open={(isUser === 'Super Admin' || isUser === 'Admin') && deleteStdData} onClose={()=>{setDeleteStdData(false);setConfirmDelete(false);setDeleteValue(null)}} maxWidth='lg' sx={{zIndex : '910'}}>
      <img src='/images/V-Cube-Logo.png' width='14%' className='ml-[43%]' alt='' />
      <IconButton sx={{position : 'absolute'}} className='top-1 right-1' onClick={()=>{setDeleteStdData(false);setConfirmDelete(false);setDeleteValue(null)}}>
        <CloseRounded fontSize='large' />
      </IconButton>
      <DialogTitle>Are you sure you want to delete {selectedBatch} Student's Data ?</DialogTitle>
      <DialogContent>
        <DialogContentText>
        <Typography color='error'>Once this action is taken, it cannot be undone, and all Student records will be permanently deleted.</Typography><br/>
          The following Student's data will be deleted :<br/>
          • Student Attendance Data<br/>
          • Student Messages Data<br/>
          • Student Performance Data<br/>
          • Student Class Recording WatchTime Data<br/>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
      {!confirmDelete ? 
        <Box className='w-full h-14 flex items-center justify-center'>
          <Button variant='outlined' color='warning' onClick={() => setConfirmDelete(true)}>
            I confirm that I have read and understand the effects.
          </Button>
        </Box> : 
        <Box className='w-full h-36 flex flex-col items-center justify-evenly'>
          <Typography >To confirm delete, type <strong>"Delete {selectedBatch} Student's Data"</strong> in the box below</Typography>
          <input type='text' value={deleteValue} onChange={(e)=>setDeleteValue(e.target.value)} style={{fontSize : '20px', padding : '0 10px', margin : '15px 0'}}
            className='border-[1px] border-red-600 rounded-md w-[95%] h-10 outline-red-600' />
          <Button variant='contained' color='error' sx={{width : '95%'}} 
            startIcon={(deleteValue && deleteValue === `Delete ${selectedBatch} Student's Data`) && <DeleteForever/>}
            onClick={()=>{setDeleteStdData(false);setConfirmDelete(false);(isUser === 'Super Admin' || isUser === 'Admin') && deleteStudentData()}}
            disabled={!deleteValue || (deleteValue && deleteValue !== `Delete ${selectedBatch} Student's Data`)}>
              <Typography sx={{color : !deleteValue || (deleteValue && deleteValue !== `Delete ${selectedBatch} Student's Data`) ? '#e4959c' : ''}}
               >Delete {selectedBatch} Student's Data
              </Typography>
          </Button>
        </Box>}
      </DialogActions>
    </Dialog>

    <Dialog open={stdExists} sx={{zIndex : '910'}} maxWidth='lg'>
      <img src='/images/V-Cube-Logo.png' width='12%' className='ml-[44%]' />
      <DialogTitle>The following Student Data already exists.</DialogTitle>
      <DialogContent className='w-[50rem] h-[40rem]'>
        <Typography color='error' variant='h6' className='w-full text-center'>Note: This data will not be Imported.</Typography>
        <Box className='w-full h-[10%] flex items-center justify-around'>      
          <Typography sx={{fontWeight : 'bold'}} className='w-[5%] text-center'>S.No</Typography>          
          <Typography sx={{fontWeight : 'bold'}} className='w-[29%] text-center'>Name</Typography>
          <Typography sx={{fontWeight : 'bold'}} className='w-[37%] text-center'>Email</Typography>
          <Typography sx={{fontWeight : 'bold'}} className='w-[29%] text-center'>BatchName</Typography>
        </Box>
        <Box className='flex flex-col items-center justify-start overflow-auto' sx={{scrollbarWidth : 'thin'}}>
          {(Array.isArray(existData) && existData.length > 0) && existData.map((data, index) => 
            <Box className='w-full h-[10%] flex items-center justify-around mt-1 mb-1' key={index}>
              <Typography className='w-[5%] text-center'>{index + 1}</Typography>
              <Typography className='w-[29%] text-center'>{data.Name}</Typography>
              <Typography className='w-[37%] text-center'>{data.Email}</Typography>
              <Typography className='w-[29%] text-center'>{data.BatchName}</Typography>
            </Box>)}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button variant='outlined' onClick={()=>{setStdExists(false);setExistData([]);setFilterData([])}}>Cancel Import</Button>
        <Button variant='contained' onClick={()=>{filterStdData(filterData);setStdExists(false)}}>Continue to Import Data</Button>
      </DialogActions>
    </Dialog>
    </>
  );
};

export default DragAndDropList;
