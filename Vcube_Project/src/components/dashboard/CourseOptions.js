import React, { useContext, useEffect, useState } from 'react';
import { Dialog, Button, DialogActions, DialogContent, DialogContentText, DialogTitle, Box, Typography, FormControl, InputLabel, Select, MenuItem, FormHelperText, Checkbox, FormGroup, FormControlLabel } from '@mui/material';
import { AddBoxRounded, ChangeCircleRounded, ClassRounded, DisabledByDefaultRounded, PeopleAltRounded } from '@mui/icons-material';
import InputField from '../InputField';
import { CourseContext } from '../api/Course';
import { BatchContext } from '../api/batch';

const CourseOptions = ({ openCourseOption, setOpenCourseOption, courseOption, setCourseOption, handleShowSnackbar, setIsLoading, fetchData }) => {
    const { fetchCourse, postCourse, deleteCourse, patchCourse } = useContext(CourseContext);
    const { fetchBatchData } = useContext(BatchContext);
    const [course, setCourse] = useState(null);
    const [tutors, setTutors] = useState(null);
    const [isSubmit, setIsSubmit] = useState(false);
    const [courseData, setCourseData] = useState(null);
    const [checkedList, setCheckedList] = useState([]);
    const [courseId, setCourseId] = useState(null);
    const [isFocused, setIsFocused] = useState(false);

    const fecthData = async () => {
        setIsLoading(true);
        const res = await fetchCourse();
        if(res && res.message){
            handleShowSnackbar('error',res.message);
            handleClose();
        }else if(res && res.length > 0){
            setCourseData(res);
        }else if(res && res.length === 0){
            if(courseOption === 'Delete Course' || courseOption === 'Change Tutors'){
                handleShowSnackbar('info','No Data found. Please add course and try again');
                handleClose();
            }
        }
        setIsLoading(false);
    };

    useEffect(()=>{
        if(courseOption === 'Change Tutors'){
            courseData && courseData.forEach(data=>{
                if(data.Course === course){
                    setTutors(data.Tutors);
                    setCourseId(data.id);
                    return;
                }
            })
        }
    },[course]);

    useEffect(()=>{
        fecthData();
    },[])

    const handleClose = () => {
        setOpenCourseOption(false);
        setCourseOption(null);
        setCourse(null);
        setTutors(null);
        setCourseData(null);
        fetchData();
    }

    const handleSubmit = async () => {
        setIsSubmit(true);
        setIsLoading(true);
        if(courseOption === 'Add Course'){
            if(!checkFields())return;
            if(courseData && courseData.some(data=>data.Course === course)){
                handleShowSnackbar('warning',`Course - ${course} already exists.`);
            }else{
                const data = {
                Course : course,
                Tutors : tutors
                }
                const res = await postCourse(data);
                if (res && res.message){
                    handleShowSnackbar('error',res.message);
                }else if(res === true){
                    handleShowSnackbar('success',`Course - ${course} added successfully.`);
                }
            }
            handleClose();
        }else if(courseOption === 'Delete Course'){
            if (checkedList && checkedList.length > 0){
                const res = await fetchBatchData();
                if(res && res.message){
                    handleShowSnackbar('error',res.message);
                    handleClose();
                }else{
                    if(!isBatchFound(res)){
                        checkedList.forEach((value,idx)=>{
                            courseData.forEach(data=>{
                                if(value === data.id){
                                    deleteData(data,idx);
                                    return;
                                }
                            })
                        })
                    }else{
                        handleShowSnackbar('error','Cannot delete the Course. Batches are assigned to the selected Course.');
                        handleClose();
                    };
                }
            }else{
                handleShowSnackbar('error','Select atleast one course to delete.')
            }  
        }else if(courseOption === 'Change Tutors'){
            if(!tutors || !course)return;
            const res = await patchCourse(courseId,tutors);
            if(res === true){
                handleShowSnackbar('success',`Course - ${course} Tutor's changed successfully.`);
            }else if (res && res.message){
                handleShowSnackbar('error',res.message);
            }
            handleClose();
        }
        setIsLoading(false);
    };

    const isBatchFound = (data) => {
        const filterData = courseData ? courseData.filter(course => checkedList.includes(course.id)) : [];
        const found = data ? data.some(batch => filterData.some(course => course.Course === batch.Course)) : false;
        return found;
    };

    const deleteData = async(data, idx)=>{
        setIsLoading(true);
        const res = await deleteCourse(data);
        if (checkedList.length-1 === idx){
            if (res === true){
                handleShowSnackbar('success','Selected Course deleted successfully.');
            }else if(res && res.message){
                handleShowSnackbar('error',res.message);
            }
            handleClose();
        }
        setIsLoading(false);
    }

    const checkFields = () =>{
        if (course && tutors)return true;
        return false;
    }

    return(
    <Dialog open={openCourseOption} sx={{zIndex : '800'}}>
        <img src='/images/V-Cube-Logo.png' alt='' width='20%' className='ml-[40%]'/>
        <DialogTitle className='flex items-center justify-start'><Typography variant='h5' sx={{marginRight : '10px'}}>{(courseOption === 'Add Course') ? 'Add Course' : (courseOption === 'Delete Course') ? 'Delete Course' : 'Change Tutors' }</Typography>{(courseOption === 'Add Course') ? <AddBoxRounded sx={{fontSize : '25px'}} /> : (courseOption === 'Delete Course') ? <DisabledByDefaultRounded sx={{fontSize : '25px'}} /> : <ChangeCircleRounded sx={{fontSize : '25px'}} /> }</DialogTitle>
        <DialogContent className='w-full mt-10 mb-10'>
            {(courseOption === 'Add Course' || courseOption === 'Change Tutors') ? (<DialogContentText>
                {courseOption === 'Add Course' && <Box className='flex items-start h-20 justify-between w-[80%] ml-[10%]'>
                    <ClassRounded className='mt-6' sx={{fontSize : '30px'}}/>
                    <InputField label="Enter Course Name" sx={{width : '90%'}} 
                    value={course} onChange={(e)=>setCourse(e.target.value.toUpperCase())} error={isSubmit && !course}
                    helperText={isSubmit && !course ? "Enter Course Name" : ""} />
                </Box>}

                {courseOption === 'Change Tutors' && <Box className='flex items-start h-20 justify-between w-[80%] ml-[10%]'>
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
                    ))}
                </Select>
                <FormHelperText sx={{color : '#d32f2f'}}>{(isSubmit && !course) ? "Select Course" : ""}</FormHelperText>
                </FormControl>
                </Box>}

                <Box className='flex items-start h-20 justify-between w-[80%] ml-[10%]'>
                    <PeopleAltRounded className='mt-6' sx={{fontSize : '30px'}}/>
                    <InputField label="Enter Tutors Name" sx={{width : '90%'}} 
                    InputLabelProps={{ shrink: Boolean(tutors) || isFocused }}
                    placeholder="Ex. Tutor1, Tutor2,..."
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    value={tutors} onChange={(e)=>setTutors(e.target.value)} error={isSubmit && !tutors}
                    helperText={isSubmit && !tutors ? "Enter Tutors Name" : ""} />
                </Box>
            </DialogContentText>) : (
                <>
                <DialogContentText className='max-h-96 min-h-24 overflow-y-auto p-5'>
                    <FormGroup>
                        {courseData && courseData.map((data)=>(
                            <FormControlLabel control={<Checkbox sx={{transform : 'scale(1.5)'}} onChange={(e)=>(e.target.checked) ? setCheckedList((pre)=> [...pre, data.id]) : setCheckedList(checkedList.filter(value=>value !== data.id))} />} label={<Typography sx={{fontSize : '25px', marginLeft : '15px', userSelect : 'none'}}>{data.Course}</Typography>} />
                        ))}
                    </FormGroup>
                </DialogContentText>
                </>
            )}
        </DialogContent>
        <DialogActions>
            <Button variant='outlined' onClick={handleClose} >Cancel</Button>
            <Button variant='contained' onClick={handleSubmit} >{(courseOption === 'Add Course') ? 'Add Course' : (courseOption === 'Delete Course') ? 'Delete Course' : 'Change Tutors'}</Button>
        </DialogActions>
    </Dialog>
    )
}

export default CourseOptions;