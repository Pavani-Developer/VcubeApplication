import React, { useContext, useEffect, useState } from 'react';
import { Box, Avatar, IconButton, Typography, Dialog, DialogContent, DialogActions, Button } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { CloseRounded, Visibility } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { StudentsContext } from '../api/students';
import { CustomNoRowsOverlay } from '../DatagridOverlay';

const StudentDetails = ({ selectedCourse, selectedBatch, setIsLoading, handleShowSnackbar, refresh, isUser }) => {
    const { fetchStudentsData } = useContext(StudentsContext);
    const [studentsData, setStudentsData] = useState([]);
    const [watchImg, setWatchImg] = useState(null);
    const [watchName, setWatchName] = useState(null);
    const navigate = useNavigate();
    const fetchStdData = async()=>{
        const stdData = await fetchStudentsData(selectedCourse);
        if(stdData && stdData.message){
          handleShowSnackbar('error',stdData.message);
        }else{
            const std_Data = Array.isArray(stdData) && stdData.length > 0 && stdData.filter(data=>(
               typeof data.Personal_Info !== 'object' && typeof data.Educational_Info !== 'object' && data.Placement_Info !== 'object' &&
               JSON.parse(data.Educational_Info).SSC_Passed_Year && JSON.parse(data.Educational_Info).Inter_Passed_Year &&
               JSON.parse(data.Placement_Info).Skills && data.Status === 'Active'
            ))
          setStudentsData(Array.isArray(std_Data) ? std_Data.filter(data => data.BatchName === selectedBatch || selectedBatch === 'All') : []);
        }
      };
    
      useEffect(()=>{
          fetchStdData();
      },[selectedCourse, refresh])

      const handleImage = (id, image, name) => {
        setWatchImg(image);
        setWatchName(`${id}~${name}`);
      }

    const columns = [
        { field: 'id', headerName: 'ID', width: 50, headerClassName: 'text-lg', },
        {
          field: 'image',
          headerName: '',
          width: 50,
          sortable : false,
          disableColumnMenu: true,
          renderCell: (params) => (
            <IconButton onClick={()=>handleImage(params.row.id, params.row.image, params.row.name)}  sx={{ width : '100%', height : '100%' }}>
              <Avatar alt={params.row.name} src={params.row.image} />
            </IconButton>
          ),
        },
        { field: 'name', headerName: 'Name', width: 180, headerClassName: 'text-lg', },
        { field: 'batch', headerName: 'Batch', width: 180, headerClassName: 'text-lg', },
        { field: 'phone', headerName: 'Phone', width: 115, headerClassName: 'text-lg', },
        { field: 'email', headerName: 'Email', width: 230, headerClassName: 'text-lg' },
        { field: 'highest_Degree', headerName: 'Highest Degree', width: 160, headerClassName: 'text-lg' },
        { field: 'passout_Year', headerName: 'Passout Year', width: 130, headerClassName: 'text-lg' },
        { field: 'experience', headerName: 'Experience', width: 110, headerClassName: 'text-lg' },
        { field: 'year_gap', headerName: 'Year Gap', width: 95, headerClassName: 'text-lg',
          renderCell: (params) => (
            <Box className='w-full h-full flex items-center justify-center'>
              <Typography className={`w-full rounded-full text-center ${params.row.year_gap === 'Yes' ? 'bg-red-600' : 'bg-green-600'} text-white`}>{params.row.year_gap}</Typography>
            </Box>
          ),
         },
        {filed: 'view', headerName: 'View', width: 60, headerClassName: 'text-lg',
          sortable : false,
          disableColumnMenu: true,
          renderCell: (params) => (
            <IconButton onClick={()=>handleRowClick(params.row.id)}><Visibility /></IconButton>
          ),
        }
      ];
      
      const rows = [];
    
      Array.isArray(studentsData) && studentsData.forEach((data,index)=>{
        if(data.BatchName === selectedBatch || selectedBatch === 'All'){
          rows.push({
          id : index + 1,
          image : JSON.parse(data.Personal_Info).Image || "",
          batch : JSON.parse(data.Personal_Info).BatchName,
          name : JSON.parse(data.Personal_Info).Name,
          phone : JSON.parse(data.Personal_Info).Phone,
          email : JSON.parse(data.Personal_Info).Email,
          highest_Degree : (typeof data.Educational_Info === 'object') ? "" : (JSON.parse(data.Educational_Info).PG_Specialization) ? JSON.parse(data.Educational_Info).PG_Specialization : JSON.parse(data.Educational_Info).Degree_Specialization,
          passout_Year : (typeof data.Educational_Info === 'object') ? "" : (JSON.parse(data.Educational_Info).PG_Specialization) ? JSON.parse(data.Educational_Info).PG_Passed_Year : JSON.parse(data.Educational_Info).Degree_Passed_Year,
          experience : JSON.parse(data.Personal_Info).Experience,
          year_gap : (typeof data.Educational_Info === 'object') ? "" : (parseInt(JSON.parse(data.Educational_Info).SSC_Passed_Year) - parseInt(JSON.parse(data.Educational_Info).Inter_Start_Year) !== 0 ||
                     parseInt(JSON.parse(data.Educational_Info).Inter_Passed_Year) - parseInt(JSON.parse(data.Educational_Info).Degree_Start_Year) !== 0 ||
                     JSON.parse(data.Educational_Info).PG_Specialization && parseInt(JSON.parse(data.Educational_Info).Degree_Passed_Year) - parseInt(JSON.parse(data.Educational_Info).PG_Start_Year) !== 0) ? "Yes" : "No"
          })
        };
      });
      const handleRowClick = (id) => {
        setIsLoading(true);
        const uniqueURL = sessionStorage.getItem('UniqueURL');
        sessionStorage.setItem('StudentDetails_ID',JSON.stringify(studentsData[id - 1].id));
        if(isUser === 'Super Admin')sessionStorage.setItem('Navigate','Placements');
        setTimeout(()=>{navigate(`/vcube/student-info/${uniqueURL.substring(60,90)}`)},1000);
      };

  return (
    <Box className="relative w-[96%] max-h-[60%] h-[60%] ml-[2%] bg-white">
    {rows.length > 0 && <img src='/images/V-Cube-Logo.png' alt='' width='50%' className='absolute top-0 left-[25%] h-full object-scale-down opacity-20' />}
    <DataGrid
      rows={rows}
      columns={columns}
      slots={{ noRowsOverlay: CustomNoRowsOverlay }}
      sx={{
        cursor : 'pointer',
        '& .MuiDataGrid-columnHeader': {
        },
      }}
      initialState={{
        pagination: {
          paginationModel: { page: 0, pageSize: 100 },
        },
      }}
      pageSizeOptions={[5, 10]}
    />

    <Dialog open={watchImg !== null && watchName !== null} onClose={()=>{setWatchImg(null);setWatchName(null)}} sx={{zIndex : '700'}}>
      <DialogContent className='flex flex-col items-center justify-between' sx={{padding : '10px'}}>
        <Typography variant='h4' className='w-full text-center'>{watchName !== null && watchName.split('~')[1]}</Typography>
        <img src={watchImg} className='mt-5 mb-5 rounded-md' alt='' />
      </DialogContent>
      <DialogActions>
        <Button sx={{width : '100%'}} variant='outlined' endIcon={<CloseRounded/>} onClick={()=>{setWatchImg(null);setWatchName(null)}} >Close</Button>
        <Button sx={{width : '100%'}} variant='outlined' endIcon={<Visibility/>} onClick={()=>handleRowClick(watchName !== null && watchName.split('~')[0])}>View</Button>
      </DialogActions>
    </Dialog>
  </Box>
  )
}

export default StudentDetails;