import React, { useContext, useEffect, useState } from 'react';
import { Box, Card, Dialog, DialogContent, DialogTitle, IconButton, Link, Tooltip, Typography } from '@mui/material';
import { CloseRounded, LinkOffRounded, LinkRounded, LocationOnRounded, ReplayRounded, Visibility, WorkRounded } from '@mui/icons-material';
import { mui_colors } from '../ExternalData';
import { PlacementsContext } from '../api/Placements';

export const isTodayBetween = (startDateStr, endDateStr) => {
  const parseDate = (dateStr) => {
      const months = { 
          Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, 
          Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 
      };
      const [month, day, year] = dateStr.split('-');
      return new Date(year, months[month], parseInt(day, 10));
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startDate = parseDate(startDateStr);
  const endDate = parseDate(endDateStr);
  return today >= startDate && today <= endDate;
}

const PlacementNotifications = ({ isOpen, setIsOpen, course, batchName, setIsLoading, handleShowSnackbar, setMailNotif, isLoading }) => {
    const { fetchPostsData } = useContext(PlacementsContext);
    const [postsData, setPostsData] = useState([]);
    const [refresh, setRefresh] = useState(false);
  
    const fetchData = async () => {
      const res = await fetchPostsData(course);
      if (res && res.message){
        handleShowSnackbar('error',res.message);
      }else if (res){
        if(Array.isArray(res) && res.length === 0){
          handleShowSnackbar('error','No data found.');
          return;
        }
        const data = Array.isArray(res) && res.filter((item) => item.BatchName === batchName);
        const len = Array.isArray(res) && res.filter(data=>isTodayBetween(data.From_Date.split(' ')[1], data.To_Date.split(' ')[1]));
        setMailNotif(len.length)
        setPostsData(data);
      }
    }
  
    useEffect(()=>{
      fetchData();
    },[isLoading,isOpen])
  
    const handleClose = () => {
      setIsOpen(false);
    }

    const make_refresh = async () => {
      await fetchData();
      setRefresh(true);
      setTimeout(()=>{
          setRefresh(false);
      },10000)
  }

    return (
      <>
      <Dialog open={isOpen} sx={{zIndex : '700'}} maxWidth='lg'>
          <img src='/images/V-Cube-Logo.png' alt='' width='8%' className='ml-[46%]' />
          <IconButton sx={{position : 'absolute'}} className='top-3 right-3' onClick={handleClose}><CloseRounded sx={{fontSize : '35px'}} /></IconButton>
          <IconButton disabled={refresh} sx={{position : 'absolute'}} className='top-3 right-16' onClick={make_refresh}>
            <ReplayRounded sx={{fontSize : '35px'}} />
          </IconButton>
          <DialogTitle className='flex items-center' variant='h5'>Posted Job Annoucements <WorkRounded sx={{marginLeft : '10px'}} /></DialogTitle>
          <DialogContent className='w-[75rem] max-h-[40rem] h-[40rem] grid grid-cols-2 gap-x-5 gap-y-5 overflow-y-auto place-content-start'>
            {Array.isArray(postsData) && postsData.length > 0 ? <>
            {Array.isArray(postsData) && postsData.map((data)=><Tooltip title={data.Description} arrow>
              <Card className='relative w-full h-36 flex items-center justify-start mt-1' sx={{boxShadow : '0 0 5px rgba(0,0,0,0.5)'}}>
              <WorkRounded sx={{color : `${mui_colors[Math.floor(Math.random() * 20)]}`,width : '10%', fontSize : '35px'}} />
              <Box className='w-[80%] h-[80%] flex flex-col items-start justify-between ml-3'>
                <Typography sx={{fontWeight : 'bold'}}>{data.Company_Name.split('~')[0]}</Typography>
                <Typography className='flex items-center'>
                <Link href={data.Post_Link} target='_blank' sx={{textDecoration : 'none', cursor : 'pointer', ':hover' : {textDecoration : 'underline'}}}><LinkRounded/> Application Link</Link>
                <LocationOnRounded sx={{fontSize : '20px', color : 'grey',margin : '0 5px 0 15px'}}/>{data.Company_Name.split('~')[1]}
                </Typography>
                <Typography color='GrayText'>Opening : {data.From_Date}</Typography>
                <Typography color='GrayText'>Deadline : {data.To_Date}</Typography>
              </Box>
              {data.File !== 'N/A' && <Tooltip title='Uploaded File' arrow>
                <Link href={data.File} target='_blank'><IconButton><Visibility color='primary' /></IconButton></Link>
              </Tooltip>}
              {isTodayBetween(data.From_Date.split(' ')[1], data.To_Date.split(' ')[1]) && <Box sx={{position : 'absolute'}} className='top-0 right-0 h-2 w-2 bg-red-600 rounded-full'></Box>}
            </Card></Tooltip>)}
            </> : <Box className='w-full h-full ml-[50%] mt-[20%] flex flex-col items-center justify-center'>
                    <LinkOffRounded sx={{fontSize : '180px', color : 'lightgrey'}} />
                    <Typography variant='h4' color='lightgrey'>No Posted Annoucements</Typography>
                  </Box>}
          </DialogContent>
      </Dialog>
      </>
    )
}

export default PlacementNotifications