import React, { useContext, useState } from 'react';
import { Button, Card, CardMedia, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, InputAdornment, TextField, Typography } from '@mui/material';
import { CloseRounded } from '@mui/icons-material';
import { AssessmentContext } from '../api/Assessment';

const UploadRecordings = ({ isOpen, setIsOpen, selectedCourse, selectedBatch, handleShowSnackbar }) => {
    const { postRecordings } = useContext(AssessmentContext);
    const [vedioDetail, setVedioDetail] = useState({
        Title : null,
        Date : null,
        Vedio_URL1 : null,
        Vedio_URL2 : null,
        Vedio_URL3 : null,
    })
    const [checkURL, setCheckURL] = useState(false);
    const [url, setUrl] = useState(null);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const monthNames = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];
        const day = date.getDate();
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear();
        return `${day < 10 ? `0${day}` : day}-${month}-${year}`;
    }

    const uploadDetails = async () => {
        const fields = !(vedioDetail.BatchName && vedioDetail.BatchName !== '' &&
            vedioDetail.Course && vedioDetail.Course !== '' &&
            vedioDetail.Title && vedioDetail.Date &&
            vedioDetail.Vedio_URL1 && vedioDetail.Vedio_URL1.startsWith('https://'))

        const optFields = (vedioDetail.Vedio_URL2 ? vedioDetail.Vedio_URL2.startsWith('https://') : true) &&
                        (vedioDetail.Vedio_URL3 ? vedioDetail.Vedio_URL3.startsWith('https://') : true);

        if(fields && optFields){
            const data = {
                Course : selectedCourse,
                BatchName : selectedBatch,
                Title : vedioDetail.Title,
                Date : formatDate(vedioDetail.Date),
                Vedio_URL : vedioDetail.Vedio_URL2 && vedioDetail.Vedio_URL3 ?
                        `${vedioDetail.Vedio_URL1} ${vedioDetail.Vedio_URL2} ${vedioDetail.Vedio_URL3}` : 
                        vedioDetail.Vedio_URL2 && !vedioDetail.Vedio_URL3 ? `${vedioDetail.Vedio_URL1} ${vedioDetail.Vedio_URL2}` :
                        !vedioDetail.Vedio_URL2 && vedioDetail.Vedio_URL3 ? `${vedioDetail.Vedio_URL1} ${vedioDetail.Vedio_URL3}` : vedioDetail.Vedio_URL1
            }
            const res = await postRecordings(data);
            if (res === true){
                handleShowSnackbar('success','Vedio details uploaded successfully.');
            }else{
                handleShowSnackbar('error',res.message);
            }
            handleClose();
        }else{
            handleShowSnackbar('error','Please fill out all fields.');
            return;
        }
    }

    const handleClose = () => {
        setIsOpen(false);
        setVedioDetail({
            Title : null,
            Date : null,
            Vedio_URL1 : null,
            Vedio_URL2 : null,
            Vedio_URL3 : null,
        });
        setCheckURL(false);
        setUrl(null);
    }

  return (
    <Dialog open={isOpen} sx={{zIndex : '700'}}>
        <img src='/images/V-Cube-Logo.png' alt='' width='15%' className='ml-[42.5%]' />
        <IconButton sx={{position : 'absolute'}} className='right-0 top-0' onClick={handleClose}>
            <CloseRounded sx={{fontSize : '35px'}}/>
        </IconButton>
        <DialogTitle variant='h5'>Upload Class Recordings</DialogTitle>
        <DialogContent className='w-full h-[25rem] flex flex-col items-center justify-evenly' >
            {!checkURL ? <>
            <TextField type='text' label='Video Title' className='w-full'
                value={vedioDetail.Title} onChange={(e)=> setVedioDetail(pre => ({...pre, Title: e.target.value}) )} />
            <TextField type='date' className='w-full' 
                value={vedioDetail.Date} onChange={(e)=> setVedioDetail(pre => ({...pre, Date: e.target.value}) )}/>
            <TextField type='url' label='Video URL1' className='w-full' 
                value={vedioDetail.Vedio_URL1} 
                onChange={(e)=> setVedioDetail(pre => ({...pre, Vedio_URL1:  e.target.value }) )}
                InputProps={{ endAdornment: <InputAdornment position='end'>
                    <Typography color={vedioDetail.Vedio_URL1 && vedioDetail.Vedio_URL1.startsWith('https://') ? 'primary' : 'grey'} 
                        className={vedioDetail.Vedio_URL1 && vedioDetail.Vedio_URL1.startsWith('https://') && 'cursor-pointer hover:underline'}
                        onClick={() => {
                            if (vedioDetail.Vedio_URL1 && vedioDetail.Vedio_URL1.startsWith('https://')) {
                                if (!vedioDetail.Vedio_URL1.startsWith('https://')) {
                                    handleShowSnackbar('error', 'Enter a valid URL.');
                                } else {
                                    setUrl(vedioDetail.Vedio_URL1);
                                    setCheckURL(true);
                                }
                            } else {
                                handleShowSnackbar('error', 'Enter Valid Video URL to view video.');
                            }
                    }}>Check Video</Typography>
                    </InputAdornment> 
                }}/>
            <TextField type='url' label='Video URL2 (Optional)' className='w-full' 
                value={vedioDetail.Vedio_URL2} 
                onChange={(e)=> setVedioDetail(pre => ({...pre, Vedio_URL2:  e.target.value }) )}
                InputProps={{ endAdornment: <InputAdornment position='end'>
                    <Typography color={vedioDetail.Vedio_URL2 && vedioDetail.Vedio_URL2.startsWith('https://') ? 'primary' : 'grey'} 
                        className={vedioDetail.Vedio_URL2 && vedioDetail.Vedio_URL2.startsWith('https://') && 'cursor-pointer hover:underline'}
                        onClick={() => {
                            if (vedioDetail.Vedio_URL2 && vedioDetail.Vedio_URL2.startsWith('https://')) {
                                if (!vedioDetail.Vedio_URL2.startsWith('https://')) {
                                    handleShowSnackbar('error', 'Enter a valid URL.');
                                } else {
                                    setUrl(vedioDetail.Vedio_URL2);
                                    setCheckURL(true);
                                }
                            } else {
                                handleShowSnackbar('error', 'Enter Valid Video URL to view video.');
                            }
                    }}>Check Video</Typography>
                    </InputAdornment>
                }}/>
            <TextField type='url' label='Vedio URL3 (Optional)' className='w-full'
                value={vedioDetail.Vedio_URL3}
                onChange={(e)=> setVedioDetail(pre => ({...pre, Vedio_URL3:  e.target.value }) )}
                InputProps={{ endAdornment: <InputAdornment position='end'>
                    <Typography color={vedioDetail.Vedio_URL3 && vedioDetail.Vedio_URL3.startsWith('https://') ? 'primary' : 'grey'} 
                        className={vedioDetail.Vedio_URL3 && vedioDetail.Vedio_URL3.startsWith('https://') && 'cursor-pointer hover:underline'}
                        onClick={() => {
                            if (vedioDetail.Vedio_URL3 && vedioDetail.Vedio_URL3.startsWith('https://')) {
                                if (!vedioDetail.Vedio_URL3.startsWith('https://')) {
                                    handleShowSnackbar('error', 'Enter a valid URL.');
                                } else {
                                    setUrl(vedioDetail.Vedio_URL3);
                                    setCheckURL(true);
                                }
                            } else {
                                handleShowSnackbar('error', 'Enter Valid Video URL to view video.');
                            }
                        }}
                        >Check Video</Typography>
                    </InputAdornment>
                }}/>
            </> :
            <Card>
                <CardMedia
                    component="video"
                    controls
                    controlsList='nodownload'
                    src={url}
                    onContextMenu={(event)=>event.preventDefault()}
                    sx={{ width: '100%', height: 'auto' }}>
                </CardMedia>
            </Card>}
        </DialogContent>
        <DialogActions>
            {checkURL && <Button variant='outlined' onClick={()=>setCheckURL(false)}>
                Back to Details
            </Button>}
            <Button variant='outlined' onClick={handleClose}>
                Cancel
            </Button>
            <Button variant='contained' onClick={uploadDetails}>
                Upload
            </Button>
        </DialogActions>
    </Dialog>
  )
}

export default UploadRecordings;