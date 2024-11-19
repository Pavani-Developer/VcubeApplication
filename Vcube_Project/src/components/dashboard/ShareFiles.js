import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Autocomplete, Avatar, Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, FormGroup, TextField } from '@mui/material';
import { LoginContext } from '../api/login';
import { UsersAuthContext } from '../api/UsersAuth';

const ShareFiles = ({ isOpen, setIsOpen, handleShowSnackbar, setIsLoading, selectedFile, course, email, setSelectedFile, username, drivePassword }) => {
    const { fetchLoginData } = useContext(LoginContext);
    const { postUserDriveData } = useContext(UsersAuthContext);
    const [users, setUsers] = useState(null);
    const [selectedUsers, setSelectedUsers] = useState([]);

    const fetchData = useCallback(async()=>{
        setIsLoading(true);
        const users_Data = await fetchLoginData(course === 'All' ? null : course);
        setIsLoading(false);
        if(users_Data && users_Data.message){
            handleShowSnackbar('error','Error occured while fetching data. Please try again later.');
            setIsOpen(false);
            setSelectedFile(null);
        }else if(users_Data){
            setUsers(Array.isArray(users_Data) ? users_Data.filter(data => data.Email !== email && data.Username !== username) : '');
        }
    },[fetchLoginData, handleShowSnackbar, setIsLoading])

    useEffect(()=>{
        fetchData();
    },[isOpen])

    const shareFiles = async () => {
        setIsLoading(true);
        const data = []
        selectedUsers.forEach((user)=>{
            const { id, ...rest } = selectedFile;
            const modified = {
                ...rest,
                Username : user.Username,
                Email : user.Email,
                Folder : 'N/A'
            }
            data.push(modified);
        })
        data[0].DrivePassword = drivePassword
        data[0].Shared = 'True'
        data[0].UserEmail = email
        const res = await postUserDriveData(course, username, data);
        if (res === true){
            handleShowSnackbar('success','File shared successfully.');
        }else{
            handleShowSnackbar('error','Error occured. Please try again later.')
        }
        setSelectedFile(null);
        setIsOpen(false);
        setSelectedUsers([]);
        setIsLoading(false);
    }

  return (
    <Dialog open={isOpen} sx={{zIndex : '810'}}>
        <img src='/images/V-Cube-Logo.png' width='14%' className='ml-[43%]'/>
        <DialogTitle variant='h5'>Who do you want to share file ?</DialogTitle>
        <DialogContent className='min-h-[20rem] h-auto w-full flex flex-col items-center justify-between'>
            <Box className='w-full h-[80%] overflow-auto' sx={{scrollbarWidth : 'thin'}}>
                {Array.isArray(users) && users.length > 0 && users.map((user, index)=>(
                    <FormControlLabel control={<Checkbox size='medium' onClick={(e) => {
                        const { checked } = e.target;
                        const newUser = { Username: user.Username, Email: user.Email };
                        setSelectedUsers((prev) => 
                          checked ? [...prev, newUser] : prev.filter(item => item.Username !== user.Username)
                        );
                      }} />} key={index} sx={{margin : '5px 0'}}
                        label={<Box className='w-[300px] flex items-center justify-start'><Avatar src={typeof user.Image !== 'object' ? user.Image : null} className='mr-3 w-full' /> {user.Username}</Box>}/>
                ))
                }
            </Box>
            <Autocomplete
                className='w-full'
                multiple
                readOnly
                value={selectedUsers.map((user)=>user.Username)}
                options={[]}
                renderInput={(params) => (
                    <TextField
                        multiple
                        {...params}
                        variant="outlined"
                        label="Select Users"
                    />
                )}
            />
        </DialogContent>
        <DialogActions>
            <Button variant='outlined' onClick={()=>{setIsOpen(false);setSelectedFile(null);setSelectedUsers([]);}}>Cancel</Button>
            <Button variant='contained' onClick={shareFiles}>Submit</Button>
        </DialogActions>
    </Dialog>
  )
}

export default ShareFiles;