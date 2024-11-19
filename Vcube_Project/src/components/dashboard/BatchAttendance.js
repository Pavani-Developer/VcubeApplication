import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, FormHelperText, IconButton, InputLabel, MenuItem, Select, Typography } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import { DateTime } from '../date-time';
import { CancelRounded, CheckCircleRounded, CloseRounded } from '@mui/icons-material';
import { BatchContext } from '../api/batch';
import { BatchAttendanceContext } from '../api/batch-attendance';

const BatchAttendance = ({ isOpen, setIsOpen, selectedCourse, type, handleShowSnackbar, setIsLoading, fetchBatchAttData, studentsData, select_Batch }) => {
    const { fetchBatchData } = useContext(BatchContext);
    const { fetchBatchAttendanceDataByCourse, postBatchAttendanceData } = useContext(BatchAttendanceContext);
    const [batchData, setBatchData] = useState([]);
    const [batchAttendanceData, setBatchAttendanceData] = useState(null);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [isSubmit, setIsSubmit] = useState(null);
    const studentCount = Array.isArray(studentsData) ? studentsData.filter((data)=> data.Course === selectedCourse && (data.BatchName === select_Batch || select_Batch === 'All')).length : 0;
    const dateTime = DateTime().split(' ');

    const fetchData = async () => {
        const res = await fetchBatchData(selectedCourse);
        const result = await fetchBatchAttendanceDataByCourse(selectedCourse);
        if((res && res.message)){
            handleShowSnackbar('error',res.message);
            handleClose();
        }else if(res && res.length > 0){
            setBatchData(res);
            if(result)setBatchAttendanceData(result);
        }else if(res && res.length === 0){
            handleShowSnackbar('info','No Data Found.');
            handleClose();
        }
    };

    useEffect(()=>{
        selectedCourse && fetchData();
    },[isOpen])
    
    const handleClose = () => {
        setIsSubmit(false);
        setSelectedBatch(null);
        setIsOpen(false);
    };

    const handleSubmit = () => {
        setIsSubmit(true);
        if(!selectedBatch)return;
        setIsLoading(true);
        makeData();
    }

    const makeData = () => {
        if(selectedBatch === 'All'){
            const batchAttData = []
            batchData && batchData.forEach((batchData)=>{
                const data = {
                    BatchId : batchData.id,
                    Course : batchData.Course,
                    BatchName : batchData.BatchName,
                    Date : dateTime[0],
                    Attendance_Type : type
                }
                batchAttData.push(data);
            })
            postData(batchAttData);
            setIsLoading(false);
        }else{
            const getBatchData = batchData && batchData.find(data=>data.BatchName === selectedBatch);
            const data = {
                BatchId : getBatchData.id,
                Course : getBatchData.Course,
                BatchName : selectedBatch,
                Date : dateTime[0],
                Attendance_Type : type
            }
            postData([data]);
        }
    }

    const postData = async (data) => {
        const res = await postBatchAttendanceData(data);
        setIsLoading(false);
        if(res && res.message){
            handleShowSnackbar('error',res.message);
        }else{
            handleShowSnackbar('success',`${type} Attendance added successfully.`);
            fetchBatchAttData();
        }
        handleClose();
    }
    
    const checkAtt = (data) => {
        if (data) {
            return Array.isArray(batchAttendanceData) && batchAttendanceData.some(
                att_data =>
                    att_data.Date === dateTime[0] && 
                    att_data.BatchName === data.BatchName && 
                    att_data.Attendance_Type === type
            );
        } else {
            return Array.isArray(batchAttendanceData) && batchAttendanceData.some(
                att_data => 
                    att_data.Date === dateTime[0] && 
                    att_data.Attendance_Type === type
            );
        }
    };
    
  return (
    <Dialog open={isOpen} sx={{zIndex : '700'}}>
        <img src='/images/V-Cube-Logo.png' alt='' width='20%' className='ml-[40%]'/>
        <DialogTitle variant='h5'>{type === 'Mock Test' ? 'Weekly Test' : type} Attendance</DialogTitle>
        <IconButton className='top-2 right-2' sx={{position : 'absolute'}} onClick={handleClose}>
            <CloseRounded sx={{fontSize : '35px'}} />
        </IconButton>
        <DialogContent>
            <DialogContentText className='flex flex-col items-center justify-center'>
                <Typography variant='h6' className='flex items-center' sx={{fontWeight : 'bold',color : '#000'}}>
                    Date: <Typography color='primary' variant='h6' sx={{fontWeight : 'bold', marginLeft : '10px'}}>{`${dateTime[0]}`}</Typography>
                </Typography>
                <Typography variant='h6' className='flex items-center' sx={{fontWeight : 'bold',color : '#000'}}>
                    Total Students: <Typography color='primary' variant='h6'  sx={{fontWeight : 'bold', margin : '10px 0 10px 10px'}}>{studentCount < 10 ? `0${studentCount}` : studentCount}</Typography>
                </Typography>
                <FormControl className='w-96 h-20' sx={{margin : '20px 0 10px 0'}}>
                    <InputLabel className='flex items-center' sx={{fontSize : '20px',background : 'white', width : '123px', paddingLeft : '3px', display : 'flex', alignItems : 'center'}}
                        >Select Batch</InputLabel>
                    <Select
                        error={isSubmit && !selectedBatch}
                        sx={{fontSize : '20px',display : 'flex', alignItems : 'center', justifyContent : 'space-between'}}
                        value={selectedBatch}
                        onChange={(e)=>setSelectedBatch(e.target.value)}
                        renderValue={(selected) => {
                            const selectedBatchData = batchData.find(data => data.BatchName === selected);
                            return selectedBatchData ? selectedBatchData.BatchName : selected;
                        }}
                    >
                        {batchData && batchData.map((data)=>
                            <MenuItem sx={{display : 'flex', alignItems : 'center', justifyContent : 'space-between'}} value={data.BatchName}
                                disabled={checkAtt(data)}
                                >{data.BatchName} {checkAtt(data) ? <CheckCircleRounded color='success' sx={{fontSize : '30px'}} /> : <CancelRounded  color='error' sx={{fontSize : '30px'}} />}
                            </MenuItem>
                        )}
                        {batchData && batchData.length > 0 && <MenuItem value="All"
                            disabled={checkAtt()}
                        >All Batches</MenuItem>}
                    </Select>
                    <FormHelperText sx={{color : '#f44336', marginLeft : '5px'}}>{isSubmit && !selectedBatch ? 'Select Batch' : ''}</FormHelperText>
                </FormControl>
            </DialogContentText>
            <DialogActions>
                <Button sx={{width : '90%', marginRight : '5%', height : '45px'}} variant='contained' onClick={handleSubmit}>Submit {type} Attendance</Button>
            </DialogActions>
        </DialogContent>
    </Dialog>
  )
}

export default BatchAttendance;