import React, { useContext, useEffect, useRef, useState } from 'react';
import { Box, Button, Card, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, InputAdornment, Link, Menu, MenuItem, TextField, Tooltip, Typography } from '@mui/material';
import { CloseRounded, CreateNewFolderRounded, DeleteRounded, DriveFileRenameOutlineRounded, FolderRounded, InsertDriveFileRounded, MoreVertRounded, NoteAddRounded, OpenInNewRounded, ReplyRounded } from '@mui/icons-material';
import VerticalLinearStepper, { getFileExtension, getFileNameWithoutExtension } from './DriveCreateFolder';
import { DateTime } from '../date-time';
import { UsersAuthContext } from '../api/UsersAuth';
import { UserDetails } from '../UserDetails';
import ShareFiles from './ShareFiles';

const StorageVault = ({ isOpen, setIsOpen, handleShowSnackbar, setIsLoading, isValidated, driveUser }) => {
    const { getUserDriveData, patchUserDriveData, deleteUserDriveData } = useContext(UsersAuthContext);
    const [anchorEls, setAnchorEls] = useState(Array(11).fill(null));
    const [createFolder, setCreateFolder] = useState(false);
    const [folders, setFolders] = useState([]);
    const filesData = useRef([]);
    const [totalStorage, setTotalStorage] = useState(0);
    const [filesStorage, setFilesStorage] = useState(0);
    const [createFile, setFileCreate] = useState(false);
    const user = UserDetails('All');
    const [draggedFile, setDraggedFile] = useState(null);
    const [droppedFolder, setDroppedFolder] = useState(null);
    const [moveFile, setMoveFile] = useState(null);
    const [fileNameField, setFileNameField] = useState(null);
    const [c_file_name, setC_File_Name] = useState(null);
    const [shareFile, setShareFile] = useState(false);
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [updated, setUpdated] = useState(false);
    const [folderStorage, setFolderStorage] = useState(0);
    const [editFoldername, setEditFolderName] = useState(null);
    const [newEditFoldername, setNewEditFoldername] = useState(null);
    const [deleteFolder, setDeleteFolder] = useState(null);
    
    const isUserValidated = () => {
        return driveUser && isValidated && driveUser.Is_Validated && driveUser.Validated_Date === DateTime().split(' ')[0];
    }   

    const handleClick = (event, index) => {
        const newAnchorEls = [...anchorEls];
        newAnchorEls[index] = event.currentTarget;
        setAnchorEls(newAnchorEls);
    };

    const handleClose = (index) => {
        const newAnchorEls = [...anchorEls];
        newAnchorEls[index] = null;
        setAnchorEls(newAnchorEls);
        setEditFolderName(null);
        setNewEditFoldername(null);
        setDeleteFolder(null);
    };

    const fetchData = async () => {
        if(isUserValidated()){
            setIsLoading(true);
            const sendData = {
                Email : user.Email,
                DrivePassword : driveUser.Drive
            }
            const res = await getUserDriveData(user.Course, user.Username, sendData, 'Get');
            setIsLoading(false)
            if (res && res.message){
                handleShowSnackbar('error',res.message);
            }else if(res){
                setTotalStorage(Array.isArray(res) && res.length > 0 
                    ? res.reduce((total, file) => {
                        const size = parseFloat(file.Size);
                        return total + (isNaN(size) ? 0 : size);
                    }, 0) 
                    : 0);
                setFilesStorage(Array.isArray(res) && res.length > 0 
                    ? res.reduce((total, file) => {
                        if (file.Folder === 'N/A') {
                            const size = parseFloat(file.Size);
                            return total + (isNaN(size) ? 0 : size);
                        }
                        return total;
                    }, 0).toFixed(2)
                    : 0);
                const uniqueFolders = [...new Set(res
                    .filter(item => item.Folder !== 'N/A')
                    .map(item => item.Folder)
                )];
                setFolders(uniqueFolders);
                const files = Array.isArray(res) && res.length > 0 && res.filter(data =>data.Folder === 'N/A');
                if(selectedFolder !== null && selectedFolder > -1){
                    const getFolders = Array.isArray(res) && res.length > 0 && res.filter((data)=> data.Folder === folders[selectedFolder]);
                    if(getFolders){
                        setFolderStorage(Array.isArray(getFolders) && getFolders.length > 0 
                        ? res.reduce((total, file) => {
                            if (file.Folder === folders[selectedFolder]) {
                                const size = parseFloat(file.Size);
                                return total + (isNaN(size) ? 0 : size);
                            }
                            return total;
                        }, 0).toFixed(2)
                        : 0)
                        filesData.current = getFolders;
                    }
                }else{
                    filesData.current = files;
                }
                setUpdated(!updated);
            }
        }
    };

    useEffect(()=>{
        fetchData();
    },[selectedFolder])

    const handleDragStart = (e, file) => {
        setDraggedFile(file);
      };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e, folder) => {
        e.preventDefault();
        if(folder === 'Share'){
            setShareFile(true);
        }else{
            setDroppedFolder(folder);
            (draggedFile.Folder === folder && folder !== 'Delete') ?
            handleShowSnackbar('error',`You cannot move this file to "${draggedFile.Folder}" as it already exists in that location.`) :
            setMoveFile(true);
        }
    };

    const manageFile = async (nameChange=false) => {
        const preName = nameChange.FileName
        setIsLoading(true);
        if(droppedFolder === 'Delete')draggedFile.Folder = droppedFolder;
        if(nameChange)nameChange.FileName = `${c_file_name}.${getFileExtension(nameChange.FileName)}`;
        if (nameChange) {
            nameChange.DrivePassword = driveUser.Drive;
        } else if(droppedFolder !== 'Delete') {
            draggedFile.Folder = droppedFolder;
            draggedFile.DrivePassword = driveUser.Drive;
        }else if(droppedFolder === 'Delete'){
            draggedFile.DrivePassword = driveUser.Drive;
        }
        const dataToPatch = nameChange ? nameChange : draggedFile;
        const res = droppedFolder === 'Delete' ? 
                    await deleteUserDriveData(user.Course, user.Username, draggedFile.id, draggedFile) :
                    await patchUserDriveData(user.Course, user.Username, dataToPatch.id, dataToPatch);
        setIsLoading(false);
        if(res === true){
            droppedFolder === 'Delete' ? 
            handleShowSnackbar('success',`File ${draggedFile.FileName} deleted successfully.`) :
            nameChange ? handleShowSnackbar('success',`File name changed from ${preName} to ${c_file_name} successfully.`) :
            handleShowSnackbar('success',`File ${draggedFile.FileName} successfully moved to ${droppedFolder}`);
            fetchData();
        }else{
            handleShowSnackbar('error', res.message || 'An error occurred');
        }
        setDraggedFile(null);
        setDroppedFolder(null);
        setFileNameField(null);
    }

    const manageFolderName = async (index) => {
        handleClose(index);
        if(isUserValidated()){
            setIsLoading(true);
            const sendData = {
                Email : user.Email,
                DrivePassword : driveUser.Drive
            }
            const res = await getUserDriveData(user.Course, user.Username, sendData, 'Get');
            if(res && res.message){
                handleShowSnackbar('error',res.message);
            }else if(res){
                const data = Array.isArray(res) ? res.filter((item) => item.Folder === editFoldername) : [];
                const newData = data.map((item, index) => ({
                    ...item,
                    Folder: newEditFoldername,
                    ...(index === 0 && { DrivePassword: driveUser.Drive, Email : user.Email })
                }));
                const patch = await patchUserDriveData(user.Course, user.Username, null, newData);
                if(patch === true){
                    fetchData();
                    handleShowSnackbar('success',`Folder name "${editFoldername}" changed to "${newEditFoldername}".`);
                }else{
                    handleShowSnackbar('error',`Error occured. Please try again later.`);
                }
            }
            setIsLoading(false);
        }
    }

    const manageFolderdelete = async (index) => {
        if(isUserValidated()){
            setIsLoading(true);
            const sendData = {
                Email : user.Email,
                DrivePassword : driveUser.Drive
            }
            const res = await getUserDriveData(user.Course, user.Username, sendData, 'Get');
            if(res && res.message){
                handleShowSnackbar('error',res.message);
            }else if(res){
                const data = Array.isArray(res) ? res.filter((item) => item.Folder === deleteFolder) : [];
                data[0].DrivePassword = driveUser.Drive
                data[0].Email = user.Email
                const resp = await deleteUserDriveData(user.Course, user.Username, null, data);
                if(resp === true){
                    fetchData();
                    handleShowSnackbar('success',`Folder "${deleteFolder}" deleted succesfully.`);
                }else{
                    handleShowSnackbar('error',`Error occured. Please try again later.`);
                }
            }
            setIsLoading(false);
            handleClose(index);
        }
    }

    if(driveUser && isValidated && driveUser.Is_Validated && driveUser.Validated_Date === DateTime().split(' ')[0] && isUserValidated()){
        return (
        <>
        <Dialog open={isOpen} fullScreen sx={{zIndex : '800'}}>
            <Card className='h-16 w-full flex items-center justify-between pl-3 pr-3'>
                <Typography variant='h5'>VCube Drive</Typography>
                <img src='/images/V-Cube-Logo.png' width='8%' className='ml-[-2%]' />
                <IconButton onClick={()=>setIsOpen(false)}>
                    <CloseRounded fontSize='large' />
                </IconButton>
            </Card>
            <DialogTitle className='flex items-center justify-between'>
                <Box className='w-[35%] flex items-center justify-start'>
                    <Button variant='contained' startIcon={<CreateNewFolderRounded/>} onClick={()=>folders.length < 10 ? setCreateFolder(true) : handleShowSnackbar('error','Cannot create folders more than 10.')}>New Folder</Button>
                    <Button variant='contained' sx={{margin : '0 3%'}} startIcon={<NoteAddRounded/>} onClick={()=>{if(selectedFolder !== null && selectedFolder > -1){setCreateFolder(true);setFileCreate(true)}else{handleShowSnackbar('error','Please select or create folder to add files.')}}} >New File</Button>
                    <DeleteRounded color='error' sx={{margin : '0 3%', fontSize : '30px'}} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, 'Delete')} />
                    <ReplyRounded color='primary' fontSize='large' sx={{transform : 'scaleX(-1)'}} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, 'Share')} />
                </Box>
                <Box className='w-1/3 h-12 flex flex-col items-start justify-between'>
                    <Typography sx={{fontFamily : 'sans-serif'}}>100 MB of {totalStorage.toFixed(2)} MB Used</Typography>
                    <Box className='relative w-full h-4 bg-slate-200 rounded-3xl overflow-hidden'>
                        <Box className={`absolute left-0 top-0 h-full ${Math.floor(totalStorage) <= 40 ? 'bg-blue-500' : Math.floor(totalStorage) <= 70 ? 'bg-orange-500' : 'bg-red-500'} rounded-3xl`}
                            sx={{width : `${Math.floor(totalStorage)}%`, transition : '0.5s ease-in-out'}}></Box>
                    </Box>
                </Box>
            </DialogTitle>
            <DialogContent>
                {folders.length > 0 || filesData.current.length > 0 ? <Box className='w-full h-full overflow-auto' sx={{scrollbarWidth : 'none'}}>
                    <Box className='w-full min-h-28 h-auto p-1'>
                        <Typography color='grey' fontSize={18} sx={{marginBottom : '10px'}}>Folders</Typography>
                        {Array.isArray(folders) && folders.length > 0 && folders.map((folder,index)=>
                        <Button key={index} startIcon={<IconButton disabled><FolderRounded color='action' sx={{margin : '0 10%'}} /></IconButton>} 
                                endIcon={<IconButton onClick={(event) => handleClick(event, index)} sx={{zIndex : '810'}}><MoreVertRounded/></IconButton>}
                                sx={{ textTransform: 'capitalize', border : selectedFolder === index ? 'solid 2px #1976d2' : 'solid 2px transparent', zIndex : '805',
                                     fontSize : '18px', margin : '0 1% 1% 0', background : selectedFolder === index ? '#dbeafe' : '', boxShadow : '0 0 3px rgba(0,0,0,0.5)'
                                }}
                                onDoubleClick={()=>setSelectedFolder(selectedFolder === index ? null : index)}
                                color='inherit'
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, folder)}>
                            {folder}
                            <Menu
                                id={`basic-menu-${index}`}
                                anchorEl={anchorEls[index]}
                                open={Boolean(anchorEls[index])}
                                onClose={() => {handleClose(index)}}
                                MenuListProps={{
                                'aria-labelledby': 'basic-button',
                                }}
                            >
                                <MenuItem onClick={() =>{handleClose(index);setSelectedFolder(selectedFolder === index ? null : index)}}>{selectedFolder === index ? <CloseRounded color='action' sx={{marginRight : '10px'}}/> : <OpenInNewRounded color='action' sx={{marginRight : '10px'}}/>}{selectedFolder === index ? 'Close' : 'Open'}</MenuItem>
                                <MenuItem onClick={() => {setEditFolderName(folder);setNewEditFoldername(folder)}}><DriveFileRenameOutlineRounded color='action' sx={{marginRight : '10px'}}/>
                                    {editFoldername !== null ? <input type='text' placeholder='Enter Folder Name' maxLength={20} value={newEditFoldername} onChange={(e)=>setNewEditFoldername(e.target.value)} onKeyDown={(e)=> e.key === 'Enter' ? manageFolderName(index) : e.key === 'Escape' ? handleClose(index) : null} /> : 'Edit'}
                                </MenuItem>
                                <MenuItem onClick={() => setDeleteFolder(deleteFolder === folder ? null : folder)}><DeleteRounded color='action' sx={{marginRight : '10px'}}/>
                                    {deleteFolder === folder ? (<Typography>Are you sure you want to delete folder?<br/>
                                        <Button variant='outlined' sx={{height : '30px', marginTop : '10px'}} onClick={()=>{handleClose(index);setDeleteFolder(null)}}>Cancel</Button>
                                        <Button variant='contained' color='error' sx={{margin : '10px 0 0 10px', height : '30px'}} onClick={()=>{manageFolderdelete(index);handleClose(index)}}>Delete</Button>
                                    </Typography>) : 'Delete'}
                                </MenuItem>
                            </Menu>
                        </Button>)}
                    </Box>

                    <Box className='w-full max-h-[34rem]'>
                        <Box className='w-full h-16 pt-2 flex items-start justify-between'>
                            <Typography color='grey' fontSize={18} sx={{marginBottom : '10px'}}>{selectedFolder !== null && selectedFolder > -1 ? `${folders[selectedFolder]} Files` : 'Files'}</Typography>
                            <Box className='w-1/3'>
                            <Typography sx={{fontFamily : 'sans-serif'}}>10 MB of {selectedFolder !== null && selectedFolder > -1 ? folderStorage : filesStorage} MB Used by Files</Typography>
                            <Box className='relative w-full h-3 bg-slate-200 rounded-3xl overflow-hidden'>
                                <Box className={`absolute left-0 top-0 h-full ${Math.floor(selectedFolder !== null && selectedFolder > -1 ? folderStorage : filesStorage) * 10 <= 40 ? 'bg-blue-500' : 
                                                Math.floor(selectedFolder !== null && selectedFolder > -1 ? folderStorage : filesStorage) * 10 <= 75 ? 'bg-orange-500' : 'bg-red-500'
                                } rounded-3xl`}
                                    sx={{ width :  `${Math.floor(selectedFolder !== null && selectedFolder > -1 ? folderStorage : filesStorage) * 10}%`,
                                    transition : '0.5s ease-in-out'
                                    }}></Box>
                            </Box>
                            </Box>
                        </Box>
                        <Box className='w-full grid grid-cols-6 gap-7 place-content-start overflow-y-auto pb-1'>
                        {Array.isArray(filesData.current) && filesData.current.length > 0 && filesData.current.map((file, index)=>
                            <Tooltip title={`Size : ${file.Size} MB`} arrow>
                            <Card  draggable onDragStart={(e) => handleDragStart(e, file)}
                                className='border-[5px] border-[#e4efff] bg-[#e4efff] w-48 h-48 flex flex-col items-center justify-between'>
                                <Box className='w-full flex items-center justify-between bg-[#e4efff]'>
                                    {fileNameField && fileNameField === index + 1 ? 
                                        <TextField className='min-h-8 bg-white w-full' variant='standard' type='text'
                                            value={c_file_name} onChange={(e)=>setC_File_Name(e.target.value)} 
                                            onKeyDown={(e)=>e.key === 'Escape' ? setFileNameField(null) : e.key === 'Enter' ? manageFile(file) : null}
                                            InputProps={{ endAdornment: <InputAdornment position='end'>
                                                <Typography color='black'>.{getFileExtension(file.FileName)}</Typography>
                                            </InputAdornment> }} /> :
                                        <Typography className='min-h-8 pl-1' onDoubleClick={()=>{setFileNameField(index + 1);setC_File_Name(getFileNameWithoutExtension(file.FileName))}}>{file.FileName}</Typography>
                                    }
                                </Box>
                                <Link href={file.File} target='_blank' className='w-full h-full'>
                                    <Button sx={{width : '100%', height : '100%'}}>
                                        <InsertDriveFileRounded sx={{fontSize : '100px'}}/>
                                    </Button>
                                </Link>
                            </Card>
                            </Tooltip>
                        )}
                        </Box>
                    </Box>
                </Box>
                :
                <Box className='h-full w-full flex flex-col items-center justify-center'>
                    <img src='/images/no-files.png' alt=''width='30%' />
                    <Typography variant='h4' color='grey'>No Files</Typography>
                </Box>}
            </DialogContent>
        </Dialog>

        <ShareFiles isOpen={shareFile} setIsOpen={setShareFile} handleShowSnackbar={handleShowSnackbar} setIsLoading={setIsLoading} selectedFile={draggedFile} setSelectedFile={setDraggedFile} email={user.Email} course={user.Course} username={user.Username} drivePassword={driveUser.Drive} />

        <Dialog open={createFolder} maxWidth='lg' sx={{zIndex : '810'}}>
            <IconButton sx={{position : 'absolute'}} className='right-2 top-2' onClick={()=>{setCreateFolder(false);setFileCreate(false)}}>
                <CloseRounded fontSize='large'/>
            </IconButton>
            <img src='/images/V-Cube-Logo.png' alt='' width='12%' className='absolute left-[44%] top-0' />
            <DialogTitle variant='h5'>{createFile ? 'Add Files' : 'Create Folder'}</DialogTitle>
            <DialogContent className='w-[40rem] h-[40rem]'>
                <VerticalLinearStepper setCreateFolder={setCreateFolder} handleShowSnackbar={handleShowSnackbar} 
                                        setIsLoading={setIsLoading} driveUser={driveUser} createFile={createFile}
                                        setFileCreate={setFileCreate} fetchData={fetchData} folders={folders}
                                        fileNames={filesData.current.map((file)=>file.FileName)}
                                        selectedFolder={selectedFolder !== null && selectedFolder > -1 ? folders[selectedFolder] : false}
                                        filesStorage={selectedFolder !== null && selectedFolder > -1 ? folderStorage : filesStorage }
                                        totalStorage={totalStorage} />
            </DialogContent>
        </Dialog>
        <Dialog open={moveFile} sx={{zIndex : '810'}}>
            {droppedFolder === 'Delete' ? 
            <DialogContent>
                Are you sure you want to delete "<strong>{draggedFile && draggedFile.FileName}</strong>" ?
            </DialogContent>
            : 
            <DialogContent>
                Are you sure you want to move "<strong>{draggedFile && draggedFile.FileName}</strong>"
                    to "<strong>{droppedFolder && droppedFolder}</strong>" ?
            </DialogContent>}
            <DialogActions>
                <Button variant='outlined' onClick={()=>{setMoveFile(false);setDraggedFile(null);setDroppedFolder(null)}}>Cancel</Button>
                <Button variant='contained' onClick={()=>{manageFile();setMoveFile(false)}}>Confirm</Button>
            </DialogActions>
        </Dialog>

        </>
        )
    }else{
        setIsOpen(false);
    }
}

export default StorageVault;