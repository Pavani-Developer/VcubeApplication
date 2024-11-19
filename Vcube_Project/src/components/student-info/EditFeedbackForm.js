import React, { startTransition, useContext, useEffect, useRef, useState } from 'react';
import { Button, Card, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, TextField, Typography } from '@mui/material';
import { CloseRounded, DeleteForever, EditRounded } from '@mui/icons-material';
import { feedbackQuestion1 } from './CourseFeedbackForm';
import { placementsFeedbackQuestion } from './PlacementFeedbackForm';
import { FeedbackContext } from '../api/Feedback';

const EditFeedbackForm = ({ isOpen, setIsOpen, handleShowSnackbar, setIsLoading, course, isUser }) => {
    const { fetchFeedbackFormLists, postFeedbackFormLists, patchFeedbackFormLists, deleteFeedbackFormLists } = useContext(FeedbackContext);
    const [questions, setQuestions] = useState({});
    const questionLists = useRef(null);
    const [isSubmit, setIsSubmit] = useState(false);
    const [editForm, setEditForm] = useState(false);
    const [selected, setSelected] = useState(0);
    const [editData, setEditData] = useState(null);
    const [delete_Data, setDelete_Data] = useState(null);

    const fetchData = async () => {
        setIsLoading(true);
        const res = await fetchFeedbackFormLists(isUser.split(' ')[0] === 'Placements' ? 'Placements' : course);
        setIsLoading(false);
        if (res && res.message){
            (res.response.status !== 404) ? handleShowSnackbar('error',res.message) : setSelected(0);
        }else if(res){
            if(Array.isArray(res)){
                const selectedData = res.find((data)=>data.Selected);
                setSelected(selectedData ? selectedData.id : 0);
                questionLists.current = [...res].reverse();
            }
        }
    }

    useEffect(()=>{
        startTransition(()=>{
            fetchData()
        })
    },[])

    const postData = async () => {
        setIsSubmit(true);
        if(![1,2,3,4,5].every(no=>(questions[no])))return;
        const data = {
            Course : isUser.split(' ')[0] === 'Placements' ? 'Placements' : course,
            FeedbackData : [1,2,3,4,5].map(no=>(questions[no]))
        }
        setIsLoading(true);
        const res = editData ? await patchFeedbackFormLists(data) : await postFeedbackFormLists(data);
        setIsLoading(false);
        if(res && res.message){
            handleShowSnackbar('error',res.message);
        }else if(res === true){
            handleShowSnackbar('success','Feedback data has been saved successfully.');
            fetchData();
            setEditForm(false);
            setQuestions({});
            setEditData(null);
            setIsSubmit(false);
        }
    }

    useEffect(()=>{
        startTransition(()=>{
            if(editForm && editData){
                setQuestions({
                    1 : editData.FeedbackData[0],
                    2 : editData.FeedbackData[1],
                    3 : editData.FeedbackData[2],
                    4 : editData.FeedbackData[3],
                    5 : editData.FeedbackData[4]
                })
            }
        })
    },[editData,editForm])

    const patchSelectedData = async () => {
        let data1,data2;
        if (selected === 0){
            const getSelected = questionLists.current.find(data=>data.Selected);
            if (getSelected){
                getSelected.Selected = false;
                data1 = getSelected;
            }else{
                handleShowSnackbar('error','This data has been selected already. Choose a different option if needed.');
                return;
            }
        }else{
            const getSelected = questionLists.current.find(data=>data.Selected);
            if(getSelected && getSelected.id === selected){
                handleShowSnackbar('error','This data has been selected already. Choose a different option if needed.');
                return;
            }else if(getSelected){
                const getSelect = questionLists.current.find(data=>data.id === selected);
                getSelected.Selected = false;
                getSelect.Selected = true;
                data1 = getSelected;
                data2 = getSelect;
            }else{
                const getSelect = questionLists.current.find(data=>data.id === selected);
                getSelect.Selected = true;
                data1 = getSelect;
            }
        }
        setIsLoading(true);
        let res2;
        const res1 = await patchFeedbackFormLists(data1);
        if(data2){
            res2 = await patchFeedbackFormLists(data2);
        }
        setIsLoading(false);
        if (res1 === true || res2 === true){
            handleShowSnackbar('success','Feedback data has been selected successfully.');
        }else{
            (res1 && res1.message) && handleShowSnackbar('error',res1.message);
            (res2 && res2.message) && handleShowSnackbar('error',res2.message);
        }
        fetchData();
    }

    const deleteData = async () => {
        setIsLoading(true);
        const res = await deleteFeedbackFormLists(delete_Data);
        setIsLoading(false);
        if (res === true){
            handleShowSnackbar('success','Feedback data has been deleted successfully.');
            fetchData();
            setDelete_Data(null);
        }else if(res && res.message){
            handleShowSnackbar('error',res.message);
        }
    }

    const handleChange = (event, index) => {
        setQuestions({
          ...questions,
          [index]: event.target.value,
        });
      };

  return (
    <>
    <Dialog open={isOpen} maxWidth='lg'>
        <img src='/images/V-Cube-Logo.png' alt='' width='10%' className='ml-[45%]' />
        <IconButton sx={{position : 'absolute'}} className='right-0 top-0' onClick={()=>setIsOpen(false)}>
            <CloseRounded sx={{fontSize : '35px'}} />
        </IconButton>
        <DialogTitle className='flex items-center justify-between'>
            <Typography variant='h6'>Feedback Form Details</Typography>
            <Typography color='primary' className='cursor-pointer hover:underline' onClick={()=>{setEditForm(!editForm);setQuestions({});setIsSubmit(false);editData && setEditData(null)}}
                >{editForm ? 'Select Feedback Form' : 'Edit Feedback Form'}</Typography>
        </DialogTitle>
        {!editForm ?
        <DialogContent className='w-[55rem] h-[40rem] flex flex-col items-center justify-start'>
            <Card className={`w-full p-3 relative ${selected === 0 ? 'border-2 border-green-600' : 'border-2 border-slate-100'} cursor-pointer mt-1 mb-3`}
                onClick={()=>setSelected(0)} sx={{background : selected === 0 ? '#dcfce7' : 'white'}}>
                {isUser.split(' ')[0] !== 'Placements' ? feedbackQuestion1.map((question,idx)=><Typography><strong>Q{idx+1}: </strong>{question}</Typography>) :
                placementsFeedbackQuestion.map((question,idx)=><Typography><strong>Q{idx+1}: </strong>{question}</Typography>)}
            </Card>
            {Array.isArray(questionLists.current) && questionLists.current.map((data,index)=>
            <Card className={`w-full relative p-3 ${selected === data.id ? 'border-2 border-green-600' : 'border-2 border-slate-100'} cursor-pointer mt-1`} 
                key={index} onClick={()=>setSelected(data.id)} sx={{background : selected === data.id ? '#dcfce7' : 'white'}} >
                {data.FeedbackData.map((question,idx)=><Typography><strong>Q{idx+1}: </strong>{question.replace('~','')}</Typography>)}
                <IconButton sx={{position : 'absolute'}} className='top-0 right-7' onClick={()=>{setEditData(data);setEditForm(true)}}>
                    <EditRounded sx={{fontSize : '15px'}} />
                </IconButton>
                <IconButton color='error' sx={{position : 'absolute'}} className='top-0 right-0' onClick={()=>setDelete_Data(data)}>
                    <DeleteForever color='error' sx={{fontSize : '15px'}} />
                </IconButton>
            </Card>)}
        </DialogContent>
        :
        <DialogContent className='w-[55rem]'>
            {[1,2,3,4,5].map((no)=><TextField className='w-full h-16' label={`Enter Question ${no}`}
            inputProps={{ maxLength : 80 }} sx={{marginTop : '10px'}} value={questions[no] || ''}
            onChange={(event) => handleChange(event, no)} error={isSubmit && !questions[no]} />)}
        </DialogContent>}
        <DialogActions>
            <Button variant='contained' onClick={()=>editForm ? postData() : patchSelectedData()}
                sx={{width : '80%', margin : '0 10% 20px 0'}}>Submit</Button>
        </DialogActions>
    </Dialog>
    <Dialog open={delete_Data ? true : false}>
        <DialogTitle>Are you sure you want to delete the data?</DialogTitle>
        <DialogContent>
            <DialogContentText>This will delete the Feedback Data permanently.</DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button variant='outlined' onClick={()=>setDelete_Data(null)}>Cancel</Button>
            <Button color='error' variant='contained' onClick={deleteData}>Delete</Button>
        </DialogActions>
    </Dialog>
    </>
  )
}

export default EditFeedbackForm;