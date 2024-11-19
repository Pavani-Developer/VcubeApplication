import React, { startTransition, useContext, useEffect, useRef, useState } from 'react';
import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControlLabel, FormGroup, IconButton, Typography } from '@mui/material';
import { CheckCircleRounded, CloseRounded } from '@mui/icons-material';
import { DateTime } from '../date-time';
import { StudentsContext } from '../api/students';
import { BatchAttendanceContext } from '../api/batch-attendance';

const StudentAttendanceForm = ({ isOpen, setIsOpen, stdData, handleShowSnackbar, setIsLoading, fetchStdData, studentAttData, selectedCourse, selectedBatch, refreshData }) => {
    const { postStudentAttendance } = useContext(StudentsContext);
    const { fetchBatchAttendanceDataByCourse } = useContext(BatchAttendanceContext);
    const [checkedList, setCheckedList] = useState([]);
    const batchAttData = useRef([]);
    const dateTime = DateTime().split(' ');

    const fetchBatchAtt = async () => {
        setIsLoading(true);
        const res = await fetchBatchAttendanceDataByCourse(selectedCourse);
        setIsLoading(false);
        if(res && res.message === 'Network Error'){
            handleShowSnackbar('error',res.message);
        }else{
            batchAttData.current = res;
        }
    };

    useEffect(()=>{
        startTransition(()=>{
        selectedCourse && selectedBatch && fetchBatchAtt();
        })
    },[selectedBatch, isOpen]);

    const handleSubmit = async() => {
        if(!checkedList || (checkedList && checkedList.length === 0)){
            handleShowSnackbar('error','Select alteast one option to take an Attendance.');
        }else{
            setIsOpen(false);
            setIsLoading(true);
            const dataArr = []
            for (const std of stdData) {
                for (const chk of checkedList){
                    const data = {
                        StudentId: std.id,
                        Name: `${std.Name}~${std.Phone}`,
                        Course: std.Course,
                        BatchName: std.BatchName,
                        Date: dateTime[0],
                        Attendance_Type: chk,
                    };
                    dataArr.push(data);
                }
            }
            const res = await postStudentAttendance(dataArr);
            if(res && res.message){
                handleShowSnackbar('error',res.message);
            }else{
                refreshData();
                handleShowSnackbar('success','Student Attendance added successfully.');
                handleClose();
            }
        }
        setIsLoading(false);
        fetchStdData();
    };

    const chkStdAtt = (type) => {
        return Array.isArray(stdData) && stdData.some(std => {
            return Array.isArray(studentAttData) && studentAttData.some(att => 
                att.StudentId === std.id &&
                att.Name === `${std.Name}~${std.Phone}` &&
                att.BatchName === std.BatchName && 
                att.Date === dateTime[0] && 
                att.Attendance_Type === type
            )
        });
    };

    const chkBatchAtt = (type) => {
        const res = Array.isArray(batchAttData.current) && batchAttData.current.some((batch)=>(batch.BatchName === selectedBatch && batch.Date === dateTime[0] && batch.Attendance_Type === type));
        return res;
    };

    const handleClose = () => {
        setCheckedList([]);
        setIsOpen(false);
        setIsLoading(false);
    };


  return (
    <Dialog open={isOpen} sx={{zIndex : '700'}}>
        <img src='/images/V-Cube-Logo.png' width='20%' alt='' className='ml-[40%]' />
        <IconButton sx={{position : 'absolute'}} onClick={handleClose} className='top-3 right-3'><CloseRounded sx={{fontSize : '30px'}} /></IconButton>
        <DialogTitle variant='h5'>Student Attendance</DialogTitle>
        <DialogContent>
            <DialogContentText>
            <FormGroup>
                {['Class','Mock Test','Interview'].map((data)=>(
                    <FormControlLabel control={chkStdAtt(data) ? <CheckCircleRounded color='success' sx={{transform : 'scale(1.2)', margin : '10px 10px 10px 10px'}} /> : <Checkbox sx={{transform : 'scale(1.2)'}} disabled={!chkBatchAtt(data)} onChange={(e)=>(e.target.checked) ? setCheckedList((pre)=> [...pre, data]) : setCheckedList(checkedList.filter(value=>value !== data))} />} 
                    label={<Typography sx={{fontSize : '20px', marginLeft : '15px', userSelect : 'none'}}>{data === 'Mock Test' ? 'Weekly Test' : data} Attendance</Typography>} />
                ))}
            </FormGroup>
            </DialogContentText>
        </DialogContent>
        <DialogActions sx={{margin : '10px 0 20px 0'}}>
            <Button variant='contained' sx={{width : '90%', marginRight : '5%', height : '40px'}} onClick={handleSubmit}>Add Attendance</Button>
        </DialogActions>
    </Dialog>
  )
}

export default StudentAttendanceForm