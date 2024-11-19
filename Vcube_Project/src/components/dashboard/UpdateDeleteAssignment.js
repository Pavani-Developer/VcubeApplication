import React, { useContext, useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, IconButton, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material';
import NumberInput from '../noSpinnerField';
import { AssessmentContext } from '../api/Assessment';
import { CloseRounded } from '@mui/icons-material';
import InputField from '../InputField';

const UpdateDeleteAssignment = ({ isOpen, setIsOpen, handleShowSnackbar, setIsLoading, setOpenAssessment, setEditAssignment, setEditAssignmentData }) => {
    const { fetchAssessmentQuestions, deleteAssessmentQuestions } = useContext(AssessmentContext);
    const [id, setId] = useState(null);
    const [name, setName] = useState(null);
    const [option, setOption] = useState(null);
    const [assignment, setAssignment] = useState(null);
    const [delete_, setDelete_] = useState(null);

    const manageAssignment = async () => {
        setIsLoading(true);
        const res = await fetchAssessmentQuestions(null,id);
        setIsLoading(false);
        if (res && res.message){
            (res.response.status === 404) ? handleShowSnackbar('error','Assignment not found.') :
            handleShowSnackbar('error',`Error occured ${res.message}`);
            setOption(null);
        }else if(res){
            if(res[0] && JSON.parse(res[0].Question).Title.includes(name)){
                setAssignment(res);
            }else{
                handleShowSnackbar('error','Assignment not found.');
                setAssignment(null);
                setOption(null);
            }
        }
    }

    const deleteAssignment = async () => {
        setIsLoading(true);
        const resp = await deleteAssessmentQuestions(assignment);
        setIsLoading(false);
        if (resp === true){
            handleShowSnackbar('success','Assignment deleted successfully.');
            handleClose();
        }else if(resp && resp.message){
            handleShowSnackbar('error',`Error occured ${resp.message}`);
        }
    }

    const handleClose = () => {
        setIsOpen(false);
        setId(null);
        setOption(null);
        setAssignment(null);
        setName(null);
        setDelete_(null);
    }

  return (
    <>
    <Dialog open={isOpen} sx={{zIndex : '700'}}>
        <img src='/images/V-Cube-Logo.png' alt='' width='15%' className='ml-[42.5%]'/>
        <IconButton sx={{position : 'absolute'}} className='right-1 top-1' 
            onClick={handleClose}>
                <CloseRounded fontSize='large' />
        </IconButton>
        <DialogTitle variant='h5'>Select Assignment's Option</DialogTitle>
        <DialogContent className='h-[15rem] flex flex-col items-center justify-evenly'>
            <Typography color='primary' >{assignment && id && option ? `Assignment Found: ${JSON.parse(assignment[0].Question).Title}` : "You can find the ID & Name in Assignments tab of the Students Dashboard."}</Typography>
            <Box className='w-[80%] flex items-center justify-between'>
                <NumberInput value={id} onChange={(e)=>setId(e.target.value)} className='w-[15%]' label='ID' />
                <InputField value={name} onChange={(e)=>setName(e.target.value)} className='w-[80%]' label='Assignment Name' />
            </Box>
            <FormControl className='w-[80%]' variant='standard' >
                <InputLabel sx={{fontSize : '20px'}} >Select Assignment Option</InputLabel>
                <Select
                    value={option}
                    readOnly={!id || !name}
                    onChange={(e)=>{setOption(e.target.value);manageAssignment()}}
                    sx={{width: '100%',
                        '& .MuiInputBase-input': {
                        fontSize: '20px',
                        padding: '5px 0',
                        },
                        '& .MuiInputLabel-root': {
                        fontSize: '20px',
                        },}}>
                    <MenuItem value='Update'>Update Assignment</MenuItem>
                    <MenuItem value='Delete'>Delete Assignment</MenuItem>
                </Select>
            </FormControl>
        </DialogContent>
        {assignment && option && (option === 'Update' ? <DialogActions>
            <Button variant='outlined' onClick={()=>setOption(null)} >Cancel</Button>
            <Button variant='contained' onClick={()=>{setIsOpen(false);setOpenAssessment(true);setEditAssignmentData(assignment);setEditAssignment(true);setId(null);setOption(null);setName(null)}}>Submit</Button>
        </DialogActions> : 
        <DialogActions className='w-full place-content-start flex flex-col items-center justify-evenly'>
            <Typography className='w-full text-center'>Enter the "<strong>Delete the {JSON.parse(assignment[0].Question).Title}</strong>" in the below box.</Typography>
            <TextField value={delete_} onChange={(e)=>setDelete_(e.target.value)}  className='w-full' sx={{margin : '10px 0'}} />     
            <Button disabled={delete_ !== `Delete the ${JSON.parse(assignment[0].Question).Title}`} color='error' variant='contained' sx={{width : '100%', height : '40px'}} 
            onClick={deleteAssignment}>Delete Assignment</Button>
        </DialogActions>)}
    </Dialog>
    </>
  )
}

export default UpdateDeleteAssignment;