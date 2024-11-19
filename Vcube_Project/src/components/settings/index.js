import React, { lazy, Suspense, useEffect, useState } from 'react';
import { Box, Card, Dialog, Tab, Tabs, Typography, Button, IconButton, Avatar } from '@mui/material';
import { AddPhotoAlternate, CloseRounded, SettingsRounded, } from '@mui/icons-material';
import styled from 'styled-components';
import { UserDetails } from '../UserDetails';
import LoadingSkeleton from '../skeleton';
import { mui_colors } from '../ExternalData';

const ChangeDetails = lazy(()=> import('./ChangeDetails'));
const PerformanceInsights = lazy(()=> import('./Performance'));
const Users = lazy(()=> import('./Users'));
const AddNewUser = lazy(()=> import('./AddUser'));
const Permissions = lazy(()=> import('./Permissions'));
const LoadingSkeletonAlternate = lazy(()=> import('../LoadingSkeletonAlternate'));

const UserSettings = ({ settingsOpen, setSettingsOpen, handleShowSnackbar }) => {
    const user = UserDetails('All');
    const isUser = UserDetails('User');
    const [tabValue, setTabValue] = useState(0);
    const [image, setImage] = useState(user.Image || null);
    const [isLoading, setIsLoading] = useState(true);
    const [imageColor, setImageColor] = useState(null)

    useEffect(()=>{
      setImageColor(mui_colors[Math.floor(Math.random() * 20)])
    },[settingsOpen])

    const xLabels = [
      'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const VisuallyHiddenInput = styled('input')({
        clip: 'rect(0 0 0 0)',
        clipPath: 'inset(50%)',
        height: 1,
        overflow: 'hidden',
        position: 'absolute',
        bottom: 0,
        left: 0,
        whiteSpace: 'nowrap',
        width: 1,
      });
      const acceptedFormats = ['image/jpeg', 'image/png', 'image/gif', 'image/tiff', 'image/bmp', 'image/webp', 'image/heif', 'image/svg+xml'];
      
      const handleFileChange = (e) => {
        const file = e.target.files[0];
        if(file){
          if((file.size / (1024 * 1024)).toFixed(2) <= 5){
            if(!acceptedFormats.includes(file.type)){
              handleShowSnackbar('error','Please Upload a Valid Image.');
              return;
            }else{
            const reader = new FileReader();
              reader.onloadend = () => {
                setImage(reader.result);
              };
              reader.readAsDataURL(file);
            }
          }else{
            handleShowSnackbar('error','You can upload files up to 5 MB. Files larger than 5 MB will not be accepted.');
          }
        }
      };

      const handleClose = () => {
        setSettingsOpen(false);
      };

      useEffect(() => {
          setTimeout(()=>{
            setIsLoading(false);
          },3000)
      }, []);

  return (
    <Suspense fallback={<LoadingSkeletonAlternate/>}>
    <Dialog fullScreen open={settingsOpen} sx={{zIndex : '900'}} className='w-screen h-screen'>
        <Box className="w-full h-full flex items-center justify-center bg-slate-100">
            <Card className='w-[90%] h-[90%] relative'>
                <Box className="w-full h-20 flex flex-row items-center justify-between">
                    <Typography variant='h5' className='flex items-center' sx={{margin : '20px', fontWeight : 'bold'}}><SettingsRounded fontSize='30px' sx={{marginRight : '7px'}}/>Settings</Typography>
                    <img src='/images/V-Cube-Logo.png' alt='' className='w-[10%]'/>
                    <IconButton sx={{marginRight : '10px'}} onClick={handleClose}><CloseRounded sx={{fontSize : '30px'}} /></IconButton>
                </Box>
                <Box className="w-full h-[90%] flex flex-row items-center justify-center">
                    <Box className='w-1/5 h-full pt-12 flex flex-col items-center'>
                        <Box className="w-[210px] h-[210px] border-2 rounded-full flex items-center justify-center relative overflow-hidden">
                            {(image && typeof image !== 'object') || (user && user.Image && user.Image !== 'N/A' && typeof image !== 'object') ? <img src={image} alt='' className=' w-[210px] h-[210px] object-contain' /> :
                            <Avatar sx={{width : '210px', height : '210px', background : imageColor }}>
                                <Typography variant='h1'>{user && user.Username[0]}</Typography>
                            </Avatar>}
                            <Button sx={{position : 'absolute', width : '100%', bottom : '0', background : 'rgb(0,0,0,0.6)'}}
                                component="label"
                                role={undefined}
                                tabIndex={-1}>
                                <AddPhotoAlternate sx={{color : '#fff'}} />
                                <VisuallyHiddenInput type="file" accept="image/*" onChange={(e)=>handleFileChange(e)} />
                            </Button>
                        </Box>
                    </Box>
                    <Box className='w-[78%] h-full pl-10'>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', marginTop : '30px'}}>
                        <Tabs value={tabValue}>
                            <Tab label="Profile Details" sx={{fontWeight : (tabValue === 0) ? 'bold' : 'normal'}} onClick={()=>setTabValue(0)} />
                            <Tab label="Add New User" disabled={!(isUser === "Placements Admin" || user.User === "Super Admin" || user.User === "Admin")} sx={{fontWeight : (tabValue === 1) ? 'bold' : 'normal'}} onClick={()=>setTabValue(1)}/>
                            <Tab label="Performance Insights" disabled={user && user.Course === 'Placements'} sx={{fontWeight : (tabValue === 2) ? 'bold' : 'normal'}} onClick={()=>setTabValue(2)} />
                            <Tab label="Permissions" disabled={user && user.Course === 'Placements'} sx={{fontWeight : (tabValue === 3) ? 'bold' : 'normal'}} onClick={()=>setTabValue(3)}  />
                            <Tab label="Users" disabled={!(isUser === "Placements Admin" || user.User === "Super Admin" || user.User === "Admin")} sx={{fontWeight : (tabValue === 4) ? 'bold' : 'normal', color : (tabValue === 4) ? '#1976d2' : ''}} onClick={()=>setTabValue(4)} />
                        </Tabs>
                    </Box>
                    {(tabValue === 0) ? (<ChangeDetails user={user} handleClose={handleClose} handleShowSnackbar={handleShowSnackbar} setIsLoading={setIsLoading} image={image} />) : 
                    (tabValue === 1) ? (<AddNewUser handleShowSnackbar={handleShowSnackbar} setIsLoading={setIsLoading} setTabValue={setTabValue} />) : 
                    (tabValue === 2) ? (<PerformanceInsights xLabels={xLabels}  setIsLoading={setIsLoading} />) : 
                    (tabValue === 3) ? (<Permissions handleShowSnackbar={handleShowSnackbar} setIsLoading={setIsLoading} />) :
                    (<Users handleShowSnackbar={handleShowSnackbar} setIsLoading={setIsLoading} />)}
                    </Box>
                </Box>
            </Card>
        </Box>
        {isLoading && <LoadingSkeleton/>}
    </Dialog>
    </Suspense>
  )
}

export default UserSettings;