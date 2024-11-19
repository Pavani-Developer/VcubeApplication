import React, { useContext, useEffect, useState } from 'react';
import { Box, Button, Card, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Link, Tooltip, Typography } from '@mui/material';
import { CloseRounded, DeleteForeverRounded, LinkOffRounded, LinkRounded, LocationOnRounded, ReplayRounded, Visibility, WorkRounded } from '@mui/icons-material';
import { mui_colors } from '../ExternalData';
import { PlacementsContext } from '../api/Placements';
import { isTodayBetween } from '../student-info/PlacementNotifications';

const ViewJobAnnouncements = ({ isOpen, setIsOpen, selectedCourse, selectBatchname, setIsLoading, handleShowSnackbar }) => {
  const { fetchPostsData, deletePostsData } = useContext(PlacementsContext);
  const [postsData, setPostsData] = useState([]);
  const [deletePost, setDeletePost] = useState(false);
  const [deletePostData, setDeletePostData] = useState(null);
  const [refresh, setRefresh] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    const res = await fetchPostsData(selectedCourse);
    if (res && res.message){
      handleShowSnackbar('error',res.message);
    }else if (res){
      if(Array.isArray(res) && res.length === 0){
        handleShowSnackbar('error','No data found.');
        return;
      }
      const data = Array.isArray(res) && res.filter((item) => item.BatchName === selectBatchname);
      if(Array.isArray(data) && data.length > 0)setPostsData([...data].reverse());
    }
    setIsLoading(false);
  }

  useEffect(()=>{
    fetchData();
  },[isOpen])

  const handleClose = () => {
    setIsOpen(false);
    setPostsData([]);
  }

  const deleteData = async () => {
    if(!deletePostData)return;
    setIsLoading(true);
    const res = await deletePostsData(deletePostData);
    if (res && res.message){
      handleShowSnackbar('error',res.message);
    }else if(res){
      handleShowSnackbar('success','Post deleted successfully.');
    }
    fetchData();
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
          {Array.isArray(postsData) && postsData.map((data,index)=><Tooltip title={data.Description} arrow>
            <Card className='relative w-full h-36 flex items-center justify-between mt-1' sx={{boxShadow : '0 0 5px rgba(0,0,0,0.5)'}}>
            <WorkRounded sx={{color : `${mui_colors[index < 20 ? index : Math.floor(Math.random() * 20)]}`,width : '10%', fontSize : '35px'}} />
            <Box className='w-[80%] h-[80%] flex flex-col items-start justify-between'>
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
            <Tooltip title='Withdraw Application' arrow><IconButton color='error' onClick={()=>{setDeletePost(true);setDeletePostData(data)}}>
              <DeleteForeverRounded color='error'/>
            </IconButton></Tooltip>
            {isTodayBetween(data.From_Date.split(' ')[1], data.To_Date.split(' ')[1]) && <Box sx={{position : 'absolute'}} className='top-0 right-0 h-2 w-2 bg-red-600 rounded-full'></Box>}
          </Card></Tooltip>)}
          </> : <Box className='w-full h-full ml-[50%] mt-[20%] flex flex-col items-center justify-center'>
                  <LinkOffRounded sx={{fontSize : '180px', color : 'lightgrey'}} />
                  <Typography variant='h4' color='lightgrey'>No Posted Annoucements</Typography>
                </Box>}
        </DialogContent>
    </Dialog>
    
    <Dialog open={deletePost} sx={{zIndex : '701'}}>
      <DialogTitle>Are you sure you want to withdraw Posted Announcement ?</DialogTitle>
      <DialogContent>This will delete the post from everyone permanently.</DialogContent>
      <DialogActions>
        <Button variant='outlined' onClick={()=>{setDeletePost(false);setDeletePostData(null)}}>Cancel</Button>
        <Button variant='contained' onClick={()=>{setTimeout(()=>{deleteData()},2000);setDeletePost(false);setDeletePostData(null)}}>Withdraw Post</Button>
      </DialogActions>
    </Dialog>
    </>
  )
}

export default ViewJobAnnouncements;