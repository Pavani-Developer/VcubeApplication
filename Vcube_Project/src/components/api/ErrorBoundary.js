import React, { Component, useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import LoadingSkeleton from '../skeleton';
import ReportDialog from '../ReportDialog';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Error caught in ErrorBoundary:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return <ErrorModel error={this.state.error} />
        }

        return this.props.children;
    }
}

const ErrorModel = ({ error }) => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    return (
        <>
        <Box className='w-screen h-screen flex flex-col items-center justify-between'>
            <img src='/images/V-Cube-Logo.png' alt='V-Cube Logo' width='100px' />
            <img src='/images/error.gif' alt='Error Animation' width='300px' className='mt-[10%]' />
            <Typography variant='h4' color='error' className='text-center w-[90%]' sx={{marginBottom : '1%'}}>
                Something went wrong
            </Typography>
            <Typography variant='h6' color='grey'  className='text-center w-[90%]'>
                {error ? error.message : 'An unknown error occurred.'}
            </Typography>
            <Box className='h-[30%] w-full flex flex-col items-center justify-center'>
                <Typography sx={{fontSize : '100%', margin : '1%'}} color='error' className='text-center w-[90%]'>
                    Please retry after some time. If the problem persists, please let us know.
                </Typography>
                <Button variant='contained' onClick={()=>setOpen(true)} >Report Error</Button>
            </Box>
        </Box>
        {loading && <LoadingSkeleton/>}
        <ReportDialog isOpen={open} setIsOpen={setOpen} setLoading={setLoading} />
        </>
    );
}

export default ErrorBoundary;

