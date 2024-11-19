import React, { useContext, useEffect, useState } from 'react';
import { Dialog, Button, DialogActions, DialogContent, DialogContentText, DialogTitle, Box, Typography, FormControl, InputLabel, Select, MenuItem, FormHelperText, Checkbox, FormGroup, FormControlLabel } from '@mui/material';
import InputField from '../InputField';
import { UserDetails } from '../UserDetails';
import { CheckBox, ClassRounded, GroupAddRounded, GroupRemoveRounded, GroupRounded } from '@mui/icons-material';
import { BatchContext } from '../api/batch';
import { StudentsContext } from '../api/students';
import { LoginContext } from '../api/login';
import { DateTime } from '../date-time';

const BatchOptions = ({ courseData, openBatchOption, setOpenBatchOption, batchOption, setBatchOption, handleShowSnackbar, setIsLoading, fetch_Data, selectedCourse }) => {
    const { fetchBatchData, postBatchData, deleteBatchData, deleteBatchRecords } = useContext(BatchContext);
    const { fetchStudentsData } = useContext(StudentsContext);
    const userCourse = UserDetails('Course');
    const [batch, setBatch] = useState(null);
    const [course, setCourse] = useState(null);
    const [isSubmit, setIsSubmit] = useState(false);
    const [batchData, setBatchData] = useState(null);
    const [checkedList, setCheckedList] = useState([]);

    useEffect(()=>{
        fetchData();
    },[])

    const handleClose = () =>{
        setOpenBatchOption(false);
        setBatchOption(null);
        setIsSubmit(false);
        fetch_Data();
    }

    const fetchData = async () => {
        const data = (userCourse === 'All') ? await fetchBatchData() : await fetchBatchData(userCourse);
        if(data && data.message){
            handleShowSnackbar('error',`${data.message}.`);
            handleClose();
        }else if (data && data.length === 0){
            if(batchOption === 'Delete Batch'){
                handleShowSnackbar('info','No batch data found. Please add new batch and Try again later.');
                handleClose();
            }
        }else{
            setBatchData(data);
        }
    }

    const handleSubmit = async () => {
        if(batchOption === 'Add Batch'){
            setIsSubmit(true);
            if(!checkFields())return;
            setIsLoading(true);
            if(batchData && batchData.some(data=>data.BatchName === batch)){
                handleShowSnackbar('warning',`Batch - ${batch} already exists.`);
            }else{
                const data = {
                    BatchName : batch,
                    Course : (userCourse === 'All') ? course : userCourse,
                    Date : DateTime().split(' ')[0]
                }
                const result = await postBatchData(data);
                if (result === true){
                    handleShowSnackbar('success',`${batch} added successfully.`);
                }else if(result && result.message){
                    handleShowSnackbar('error',result.message);
                }
            }
            handleClose();
            setIsLoading(false);
        }else if (batchOption === 'Delete Batch'){
            if (!checkedList || checkedList.length === 0)return;
            setIsLoading(true);
            const res = await fetchStudentsData(selectedCourse);
            if(res && res.message){
                handleShowSnackbar('error',res.message);
                handleClose();
            }else{
                if(!isStudentsFound(res)){
                    checkedList.forEach((value,idx)=>{
                        batchData.forEach((data)=>{
                            if (data.id === value){
                                handleDelete(data, idx);
                                return;
                            }
                        })
                    });
                }else{
                    handleShowSnackbar('error','Cannot delete the Batch. Students assigned to the Selected Batch.');
                    handleClose();
                }
            }
        }
        setIsLoading(false);
    };

    const isStudentsFound = (data) => {
        const filterData = batchData ? batchData.filter(batch => checkedList.includes(batch.id)) : [];
        const found = data ? data.some(std => filterData.some(fiterData => fiterData.BatchName === JSON.parse(std.Personal_Info).BatchName)) : false;
        return found;
    };

    const handleDelete = async(data, idx)=>{
        const res = await deleteBatchData(data);
        if(res === true)await deleteBatchRecords(data.id);
        if (checkedList.length - 1 === idx){
            if (res === true){
                handleShowSnackbar('success','Selected Batch deleted successfully.');
            }else if (res && res.message){
                handleShowSnackbar('error',res.message)
            }
            handleClose();
        }
    }

    const checkFields = () => {
        if (userCourse === 'All'){
            if(batch && course)return true;
        }else{
            if (batch)return true;
        }
        return false;
    }

  return (
    <Dialog open={openBatchOption} sx={{zIndex : '800'}}>
        <img src='/images/V-Cube-Logo.png' alt='' width='20%' className='ml-[40%]'/>
        <DialogTitle className='flex items-center justify-start'><Typography variant='h5' sx={{marginRight : '10px'}}>{(batchOption === 'Add Batch') ? 'Add Batch' : 'Delete Batch' }</Typography>{(batchOption === 'Add Batch') ? <GroupAddRounded sx={{fontSize : '25px'}} /> : <GroupRemoveRounded sx={{fontSize : '25px'}} />}</DialogTitle>
        <DialogContent className='w-full mt-10 mb-10'>
            {(batchOption === 'Add Batch') ? (<DialogContentText>
                <Box className='flex items-start h-20 justify-between w-[80%] ml-[10%]'>
                    <GroupRounded className='mt-6' sx={{fontSize : '30px'}}/>
                    <InputField label="Enter Batch Name" sx={{width : '90%'}} 
                    value={batch} onChange={(e)=>setBatch(e.target.value.toUpperCase())} error={isSubmit && !batch}
                    helperText={isSubmit && !batch ? "Enter Batch" : ""} />
                </Box>
                {userCourse === 'All' && <Box className='flex items-start h-20 justify-between w-[80%] ml-[10%]'>
                    <ClassRounded className='mt-6' sx={{fontSize : '30px'}} />
                <FormControl variant="standard" sx={{width : '90%'}}>
                <InputLabel shrink={course ? true : false} sx={{fontSize : '20px', color : (isSubmit && !course) ? '#d32f2f' : ""}}>Select Course</InputLabel>
                <Select
                    error={isSubmit && !course}
                    value={course}
                    onChange={(e)=>setCourse(e.target.value)}
                    sx={{width: '100%',
                    '& .MuiInputBase-input': {
                    fontSize: '20px',
                    padding: '5px 0',
                    },
                    '& .MuiInputLabel-root': {
                    fontSize: '20px',
                    },}}
                    >
                    {courseData && courseData.map((data)=>(
                        <MenuItem value={data.Course}>{data.Course}</MenuItem>
                    ))
                    }
                </Select>
                <FormHelperText sx={{color : '#d32f2f'}}>{(isSubmit && !course) ? "Select Batch" : ""}</FormHelperText>
                </FormControl>
                </Box>}
            </DialogContentText>) : (
                <>
                <DialogContentText className='max-h-96 min-h-24 overflow-y-auto p-5'>
                    <FormGroup>
                        {batchData && batchData.map(data=>{
                            if(data.Course === selectedCourse){ 
                                return(
                                <FormControlLabel control={<Checkbox sx={{transform : 'scale(1.5)'}} 
                                onChange={(e)=>(e.target.checked) ? setCheckedList((pre)=> [...pre, data.id]) : setCheckedList(checkedList.filter(value=>value !== data.id))} />}
                                label={<Typography sx={{fontSize : '25px', marginLeft : '15px', userSelect : 'none'}}>{data.BatchName}</Typography>} />
                            )}
                        })}
                    </FormGroup>
                </DialogContentText>
                </>
            )}
        </DialogContent>
        <DialogActions>
            <Button variant='outlined' onClick={handleClose} >Cancel</Button>
            <Button variant='contained' onClick={handleSubmit} >{(batchOption === 'Add Batch') ? 'Add Batch' : 'Delete Batch'}</Button>
        </DialogActions>
    </Dialog>
  )
};


export default BatchOptions;