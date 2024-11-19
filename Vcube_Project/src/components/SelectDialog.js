import React, { useEffect, useState } from 'react';
import { Box, Stack, Dialog, DialogActions, DialogContent, DialogTitle, DialogContentText, Button, MenuItem, Select, FormControl, Autocomplete, InputLabel } from '@mui/material';
import InputField from './InputField';
import { AccountBalanceWalletRounded, LocationCityRounded, WorkHistory } from '@mui/icons-material';

const SelectDialog = ({ dialogOpen, setDialopOpen, data, type , setRelocate, setCities, bondDuration, setBondDuration, internshipType, setInternshipType }) => {
    const [dummyValues, setDummyValues] = useState(null);
    
    const handleClose = () => {
        setRelocate((dummyValues) ? 'Yes (Preferred More)' : 'No');
        setDialopOpen(false);
    }
    const handleSubmit = () => {
        setDummyValues(null);
        handleClose();
    }
    const handleAutocompleteChange = (e, value) => {
        setDummyValues(value);
        setCities(value);
    };

  return (
    <Dialog
        open={dialogOpen}
        sx={{zIndex : '950'}}
    >
        <img src='/images/V-Cube-Logo.png' alt='' width='20%' className='ml-[40%]' />
        {type === 'Location' && <><DialogTitle>Select Desired Locations</DialogTitle>
        <DialogContent>
        <DialogContentText className='w-[500px]'>
            <Box className="w-full h-40 flex flex-row items-center justify-between">
            <LocationCityRounded sx={{marginTop : '20px', fontSize : '30px'}} />
            <Stack spacing={3} className='w-[90%]'>
                <Autocomplete
                    multiple
                    freeSolo
                    options={data}
                    getOptionLabel={(option) => option}
                    onChange={handleAutocompleteChange}
                    renderInput={(params) => (
                    <InputField
                        {...params}
                        variant="standard"
                        label='Select City'
                        placeholder='Choose your prefered loactions'
                    />
                    )}
            /></Stack>
            </Box>
        </DialogContentText>
        </DialogContent>
        <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant='contained' sx={{margin : '15px 15px 15px 0'}}>
            Submit
        </Button>
        </DialogActions></>}

        {type === 'Bond' && <>
        <DialogTitle>Specify the duration of the bond you can accepted?</DialogTitle>
        <DialogContent>
            <DialogContentText>
                <WorkHistory sx={{fontSize : '30px', margin : '50px 10px 0 0'}}/>
                <FormControl className='w-[90%]' sx={{margin : '30px 0'}}>
                    <InputLabel sx={{fontSize : '20px', marginLeft : '-10px'}}>Choose Bond Duration</InputLabel>
                    <Select
                    variant='standard'
                    value={bondDuration}
                    onChange={(e)=>{setBondDuration(e.target.value);setDialopOpen(false)}}
                    sx={{width: '100%',
                        '& .MuiInputBase-input': {
                        fontSize: '20px',
                        padding: '5px 0',
                        },
                        '& .MuiInputLabel-root': {
                        fontSize: '20px',
                    },}}>
                        <MenuItem value='1-2 Years'>1-2 Years</MenuItem>
                        <MenuItem value='2-3 Years'>2-3 Years</MenuItem>
                        <MenuItem value='3-5 Years'>3-5 Years</MenuItem>
                        <MenuItem value='Open to any bond duration'>Open to any bond duration</MenuItem>
                    </Select>
                </FormControl>
            </DialogContentText>
        </DialogContent>
        </>}

        {type === 'Internship' && <>
        <DialogTitle>Which Intership opportunity you are looking for ?</DialogTitle>
        <DialogContent>
            <DialogContentText>
                <AccountBalanceWalletRounded sx={{fontSize : '30px', margin : '50px 10px 0 0'}}/>
                <FormControl className='w-[90%]' sx={{margin : '30px 0'}}>
                    <InputLabel sx={{fontSize : '20px', marginLeft : '-10px'}}>Select Internship Type</InputLabel>
                    <Select
                    variant='standard'
                    value={internshipType}
                    onChange={(e)=>{setInternshipType(e.target.value);setDialopOpen(false)}}
                    sx={{width: '100%',
                        '& .MuiInputBase-input': {
                        fontSize: '20px',
                        padding: '5px 0',
                        },
                        '& .MuiInputLabel-root': {
                        fontSize: '20px',
                    },}}>
                        <MenuItem value='Paid'>Paid</MenuItem>
                        <MenuItem value='UnPaid'>UnPaid</MenuItem>
                        <MenuItem value='Both'>Both</MenuItem>
                    </Select>
                </FormControl>
            </DialogContentText>
        </DialogContent>
        </>}

    </Dialog>
  )
};

export default SelectDialog;