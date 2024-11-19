import React, { useContext, useEffect, useState } from 'react';
import { Box, Card, Dialog, DialogContent, DialogTitle, FormControl, IconButton, InputLabel, MenuItem, Select, TextField, Tooltip, Typography } from '@mui/material';
import { AccountCircleRounded, CloseRounded, ReplayRounded, ReviewsRounded, SpeakerNotesOffRounded } from '@mui/icons-material';
import { mui_colors } from '../ExternalData';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { FeedbackContext } from '../api/Feedback';

const StudentsFeedback = ({ isOpen, setIsOpen, selectedCourse, selectedBatch, handleShowSnackbar, setIsLoading }) => {
    const { fetchPlacementFeedbackData } = useContext(FeedbackContext);
    const [feedbackData, setFeedbackData] = useState([]);
    const [f_data, setF_Data] = useState([]);
    const [sorting, setSorting] = useState(null);
    const [date, setDate] = useState(null);
    const [refresh, setRefresh] = useState(false);

    const fetchData = async () => {
        const res = await fetchPlacementFeedbackData(selectedCourse);
        if (res && res.message){
            handleShowSnackbar('error',res.message);
        }else if (res){
            if(Array.isArray(res) && res.length === 0){
                handleShowSnackbar('error','No data found.');
                return;
            }
            const data = Array.isArray(res) && res.filter((data)=>data.BatchName === selectedBatch);
            setFeedbackData(data);
            setF_Data(data);
        }
    }

    useEffect(()=>{
        setIsLoading(true);
        fetchData();
    },[isOpen])

    const handleClose = () => {
        setSorting(null);
        setIsOpen(false);
    }

    
    const filters = () => {
        if (!sorting){
            setFeedbackData(f_data);
            return;
        }
        if (sorting === 'High'){
            filterData('Very Satisfied','Satisfied');
        }else if (sorting === 'Medium'){
            filterData('Neutral','Neutral');
        }else if (sorting === 'Low'){
            filterData('Very Unsatisfied','Unsatisfied');
        }else if (sorting === 'Date'){
            if(date){
                const filterDate = date.$d.toString().split(' ');
                const data = f_data.filter((data)=>JSON.parse(data.FeedbackData).Date.includes(`${filterDate[1]}-${filterDate[3]}`));
                if(data && data.length > 0){
                    setFeedbackData(data);
                }else{
                    handleShowSnackbar('info','No Feedback Found.');
                }
            }
        }
    };

    useEffect(()=>{
        setIsLoading(true);
        filters();
    },[sorting,date])

    const filterData = (filter1,filter2) => {
        const data = f_data.filter((data)=>
            JSON.parse(data.FeedbackData).Experience === filter1 || JSON.parse(data.FeedbackData).Experience === filter2 ||
            JSON.parse(data.FeedbackData).Skills_Gained === filter1 || JSON.parse(data.FeedbackData).Skills_Gained === filter2 ||
            JSON.parse(data.FeedbackData).Career_Goals === filter1 || JSON.parse(data.FeedbackData).Career_Goals === filter2 ||
            JSON.parse(data.FeedbackData).Support === filter1 || JSON.parse(data.FeedbackData).Support === filter2 ||
            JSON.parse(data.FeedbackData).Asking_Questions === filter1 || JSON.parse(data.FeedbackData).Asking_Questions === filter2 ||
            JSON.parse(data.FeedbackData).Overall === filter1 || JSON.parse(data.FeedbackData).Overall === filter2)
        if(data && data.length > 0){
            setFeedbackData(data);
        }else{
            handleShowSnackbar('info','No Feedback Found.');
        }
    }

    const make_refresh = async () => {
        await fetchData();
        filters();
        setRefresh(true);
        setTimeout(()=>{
            setRefresh(false);
        },10000)
    }

    return (
    <Dialog open={isOpen} maxWidth='lg' sx={{zIndex : '700'}}>
        <img src='/images/V-Cube-Logo.png' alt='' width='8%' className='ml-[46%]'/>
        <IconButton sx={{position : 'absolute'}} className='top-3 right-3' onClick={handleClose}><CloseRounded sx={{fontSize : '35px'}}/></IconButton>
        <IconButton disabled={refresh} sx={{position : 'absolute'}} className='top-3 right-16' onClick={make_refresh}>
            <ReplayRounded sx={{fontSize : '35px'}} />
        </IconButton>
        <DialogTitle className='flex items-center justify-between'><Typography variant='h5'>Students Feedback <ReviewsRounded/></Typography>
        <Box className='flex items-center justify-end w-[45%]'>
        {sorting && sorting === 'Date' && <Box className='w-[45%] mr-[5%]'>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
                label="Select Month and Year"
                views={['year', 'month']}
                value={date}
                onChange={(newValue) => setDate(newValue)}
                renderInput={(params) => <TextField {...params} />}
            />
            </LocalizationProvider>
        </Box>}
        <FormControl className='w-[50%]' variant='standard'>
            <InputLabel>Select Sort Option</InputLabel>
            <Select 
                value={sorting}
                onChange={(e)=>{setSorting(e.target.value);(e.target.value === null) && setDate(null)}}>
                <MenuItem value={null}>Reset Sorting</MenuItem>
                <MenuItem value='Low'>Low Rating</MenuItem>
                <MenuItem value='Medium'>Medium Rating</MenuItem>
                <MenuItem value='High'>High Rating</MenuItem>
                <MenuItem value='Date'>Sort By Date</MenuItem>
            </Select>
        </FormControl>
        </Box>
        </DialogTitle>
        <DialogContent className='flex flex-col w-[75rem] h-[40rem]' sx={{scrollbarWidth : 'none'}}>
            {Array.isArray(feedbackData) && feedbackData.length > 0 ? feedbackData.map((data)=><Tooltip title={JSON.parse(data.FeedbackData).Suggestions} arrow>
                <Card className='mt-1 mb-2 p-5 flex flex-row items-start h-60 justify-start' sx={{boxShadow : '0 0 5px rgba(0,0,0,0.5)'}}>
                <AccountCircleRounded sx={{fontSize : '40px', marginRight : '20px', color : `${mui_colors[Math.floor(Math.random() * 20)]}`}}/>
                <Box className='flex flex-col items-start justify-between w-[85%] h-full'>
                    <Typography className='flex items-center justify-between text-slate-600 w-full'>Feedback Date: 
                        <Typography className='text-slate-600 w-[25%]' sx={{fontWeight : 'bold'}}>{JSON.parse(data.FeedbackData).Date}</Typography>
                    </Typography>
                    <Typography className='flex items-center justify-between text-slate-600 w-full'>{JSON.parse(data.FeedbackData).Experience.split('~')[0]} : 
                        <Typography className='text-slate-600 w-[25%]' sx={{marginLeft : '40px', fontWeight : 'bold'}}>{JSON.parse(data.FeedbackData).Experience.split('~')[1]}</Typography>
                    </Typography>
                    <Typography className='flex items-center justify-between text-slate-600 w-full'>{JSON.parse(data.FeedbackData).Skills_Gained.split('~')[0]} : 
                        <Typography className='text-slate-600 w-[25%]' sx={{marginLeft : '25px', fontWeight : 'bold'}}>{JSON.parse(data.FeedbackData).Skills_Gained.split('~')[1]}</Typography>
                    </Typography>
                    <Typography className='flex items-center justify-between text-slate-600 w-full'>{JSON.parse(data.FeedbackData).Career_Goals.split('~')[0]} : 
                        <Typography className='text-slate-600 w-[25%]' sx={{marginLeft : '53px', fontWeight : 'bold'}}>{JSON.parse(data.FeedbackData).Career_Goals.split('~')[1]}</Typography>
                    </Typography>
                    <Typography className='flex items-center justify-between text-slate-600 w-full'>{JSON.parse(data.FeedbackData).Support.split('~')[0]} : 
                        <Typography className='text-slate-600 w-[25%]' sx={{marginLeft : '31px', fontWeight : 'bold'}}>{JSON.parse(data.FeedbackData).Support.split('~')[1]}</Typography>
                    </Typography>
                    <Typography className='flex items-center justify-between text-slate-600 w-full'>{JSON.parse(data.FeedbackData).Asking_Questions.split('~')[0]}: 
                        <Typography className='text-slate-600 w-[25%]' sx={{marginLeft : '15px', fontWeight : 'bold'}}>{JSON.parse(data.FeedbackData).Asking_Questions.split('~')[1]}</Typography>
                    </Typography>
                    <Typography className='flex items-center justify-between text-slate-600 w-full'>Likelihood to Recommend: 
                        <Typography className='text-slate-600 w-[25%]' sx={{marginLeft : '53px', fontWeight : 'bold'}}>{JSON.parse(data.FeedbackData).Recommend} / 10</Typography>
                    </Typography>
                </Box>
            </Card></Tooltip>) 
            :
            <Box className='w-full h-full mt-20 flex flex-col items-center justify-center'>
                <SpeakerNotesOffRounded color='action' sx={{fontSize : '100px', margin : '2rem 0'}} />
                <Typography variant='h4' color='grey'>No Feedback's Found</Typography>
            </Box>}
        </DialogContent>
    </Dialog>
  )
}

export default StudentsFeedback;