import React, { useContext, useEffect, useState } from 'react';
import { Box, Button, Card, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Tooltip, Typography } from '@mui/material';
import { CancelRounded, CheckCircleRounded, CloseRounded, ReplayRounded, ReportOffRounded, ReportRounded } from '@mui/icons-material';
import { MailContext } from '../api/SendMail';
import { getMonthsDifference } from './StudentProgressOverview';

const Reports = ({ isOpen, setIsOpen, handleShowSnackbar, setIsLoading, setReportLen }) => {
    const { fetchReportData, patchReportData, deleteReportData } = useContext(MailContext);
    const [reportData, setReportData] = useState(null);
    const [change, setChange] = useState(null);
    const [refresh, setRefresh] = useState(false);

    const getDays = (batchDate) => {
        const startDate = new Date(batchDate);
        const today = new Date();
        const timeDifference = today - startDate;
        const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
        return daysDifference;
    }

    const fetchData = async () => {
        setIsLoading(true);
        const res = await fetchReportData();
        if(res && res.message){
            handleShowSnackbar('error',res.message);
        }else if(res){
            const expiredIssues = Array.isArray(res) && res.filter(data => getMonthsDifference(data.Date) > 1);
            const len = Array.isArray(res) ? res.filter(data => getDays(data.Date) <= 3).length : 0;
            await deleteData(expiredIssues);
            setReportLen(len)
            setReportData(res);
        }
        setIsLoading(false);
    }

    useEffect(()=>{
        fetchData();
    },[isOpen])

    const deleteData = async (data) => {
        for(const issue of data){
            await deleteReportData(issue);
        }
    }

    const changeStatus = async () => {
        setIsLoading(true);
        change.Status = change.Status === 'Solved' ? 'UnSolved' : 'Solved';
        const res = await patchReportData(change);
        setChange(null);
        setIsLoading(false);
        if (res === true){
            handleShowSnackbar('success', 'Report status has been changed successfully.');
        }else if(res && res.message){
            handleShowSnackbar('error', `An error occured. ${res.message}`);
        }
    };

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
        <img src='/images/V-Cube-Logo.png' alt='' width='14%' className='ml-[43%]' />
        <IconButton onClick={()=>setIsOpen(false)} sx={{position : 'absolute'}} className='top-1 right-1'>
            <CloseRounded fontSize='large' />
        </IconButton>
        <IconButton disabled={refresh} sx={{position : 'absolute'}} className='top-1 right-12' onClick={make_refresh}>
            <ReplayRounded sx={{fontSize : '35px'}} />
        </IconButton>
        <DialogTitle variant='h5'>Reports <ReportRounded/></DialogTitle>
        {Array.isArray(reportData) && reportData.length > 0 ? 
        <DialogContent className='w-[40rem] h-[40rem] overflow-auto' sx={{scrollbarWidth : 'thin'}}>
            {reportData.map((data,index)=>(<Tooltip title={data.Error_Message} arrow>
            <Card className='w-full h-28 p-3 flex items-center justify-between border-[1px] border-slate-300 mb-3' key={index}>
                <ReportRounded color='error' fontSize='large' />
                <Box className='w-[80%] h-full flex flex-col items-center justify-evenly'>
                <Box className='w-full flex items-center justify-between'>
                    <Typography className='text-slate-500 w-[10%]'>Date: </Typography>
                    <Typography className='text-slate-600 w-[85%]'>{data.Date}</Typography>
                </Box>
                <Box className='w-full flex items-start justify-between overflow-auto' sx={{scrollbarWidth : 'thin'}}>
                    <Typography className='w-[12%] text-slate-500'>Error : </Typography>
                    <Typography className='w-[85%] text-slate-600'>{JSON.parse(data.Error_Type).join(', ')}</Typography>
                </Box>
                </Box>
                <Tooltip title={`Report Status: ${data.Status}`} arrow>
                <Box className={`relative w-[2.60rem] h-6 ${(data.Status === 'Solved') ? 'bg-green-600' : 'bg-red-600'} rounded-full flex items-center`}>
                    <IconButton className={`absolute ${(data.Status === 'Solved') ? 'left-[1.15rem]' : 'left-[-0.03rem]'}`} 
                        sx={{transition : '0.3s ease-in-out', zIndex : '10',width : '1.50rem', width : '1.50rem', height : '2.25rem'}} 
                        onClick={()=>setChange(data)}>
                        {(data.Status === 'Solved') ? (<CheckCircleRounded sx={{width : '1.50rem', height : '1.50rem', color : '#fff'}} />) : 
                        (<CancelRounded sx={{color : '#fff'}} />)}
                    </IconButton>
                </Box>
                </Tooltip>
            </Card></Tooltip>))}
        </DialogContent>
        :
        <DialogContent className='h-[20rem] flex flex-col items-center justify-center'>
            <ReportOffRounded color='action' sx={{fontSize : '100px', marginBottom : '20px'}} />
            <Typography color='grey' variant='h4' >No Recorded Reports.</Typography>
        </DialogContent>}
    </Dialog>

    <Dialog open={change} sx={{zIndex : '710'}} maxWidth='lg' >
        <DialogTitle variant='h5'>Are you sure you want to change the status of an issue ?</DialogTitle>
        <DialogContent>
            <DialogContentText>
                <Typography color='error' variant='h6' >Note: All resolved issues will be automatically deleted permanently after one month.</Typography>
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button variant='outlined' onClick={()=>setChange(null)}>Cancel</Button>
            <Button variant='contained' onClick={changeStatus}>Submit</Button>
        </DialogActions>
    </Dialog>
    </>
  )
}

export default Reports;