import React, { useContext, useEffect, useState } from 'react';
import { LineChart } from '@mui/x-charts';
import { Box, Button, TextField } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { StudentsContext } from '../api/students';
import { BatchAttendanceContext } from '../api/batch-attendance';

const PerformanceInsights = ({ setIsLoading, handleShowSnackbar }) => {
  const { fetchStudentsData, getStudentAttendanceByCourse } = useContext(StudentsContext);
  const { fetchBatchAttendanceDataByCourse } = useContext(BatchAttendanceContext);
  const [selectedYear, setSelectedYear] = useState(new Date());
  const [studentAttData, setStudentAttData] = useState([]);
  const [studentsData, setStudentsData] = useState([]);
  const [batchAttData, setBatchAttData] = useState([]);
  const [studentAttendaceData, setStudentAttendaceData] = useState(Array(12).fill(0));
  const selectedCourse = sessionStorage.getItem('SelectedCourse');

  const monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const xLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun","Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  
  const fetchStdData = async () => {
    setIsLoading(true);
    try {
      const [stdData, attData, batchAtt] = await Promise.all([
        fetchStudentsData(selectedCourse),
        getStudentAttendanceByCourse(selectedCourse),
        fetchBatchAttendanceDataByCourse(selectedCourse)

      ]);
      if (stdData && stdData.message) {
        handleShowSnackbar('error', stdData.message);
        setStudentsData([]);
      } else {
        setStudentsData(stdData);
        setStudentAttData(attData);
        setBatchAttData(batchAtt);
      }
    } catch (error) {
      handleShowSnackbar('error', 'Failed to fetch Student data');
      setStudentsData([]);
      setStudentAttData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCourse) {
      fetchStdData();
    }
  }, [setIsLoading, selectedYear]);

  const getPercentage = () => {
      xLabels.forEach((month,index)=>{
        const attArr = {
          'Class': 0,
          'Mock Test': 0,
          'Interview': 0
      };
        Array.isArray(studentsData) && studentsData.length > 0 && studentsData.forEach((stdData)=>{
          ['Class', 'Mock Test', 'Interview'].forEach((att)=>{
            let attCnt = 0;
            Array.isArray(studentAttData) && studentAttData.length > 0 && studentAttData.forEach((attData)=>{
              if (attData.StudentId === stdData.id && attData.Name === `${stdData.Name}~${stdData.Phone}` &&
                  attData.Attendance_Type === att &&
                  `${attData.Date.split('-')[1]}-${attData.Date.split('-')[2]}` === `${month}-${selectedYear.getFullYear()}`)
              {
                  attCnt++;
              }
            })
            attArr[att] += attCnt;
        })
      })
      setAttendanceData(attArr, month, index);
    })   
  }

  const setAttendanceData = (arr, month, index) => {
    const stdLength = Array.isArray(studentsData) ? studentsData.length : 0;
    const batchClassAtt = getBatchAtt(month, 'Class') * stdLength;
    const batchMockAtt = getBatchAtt(month, 'Mock Test') * stdLength;
    const batchInterviewAtt = getBatchAtt(month, 'Interview') * stdLength;
    const classAtt = arr['Class'] > 0 && batchClassAtt > 0 ? (arr['Class'] / batchClassAtt) * 100 : 0;
    const mockAtt = arr['Mock Test'] > 0 && batchMockAtt > 0 ? (arr['Mock Test'] / batchMockAtt) * 100 : 0;
    const interviewAtt = arr['Interview'] > 0 && batchInterviewAtt > 0 ? (arr['Interview'] / batchInterviewAtt) * 100 : 0;
    const totalAtt = classAtt + mockAtt + interviewAtt;
    const result = totalAtt > 0 ? Math.floor((totalAtt / 300) * 100) : 0;
    setStudentAttendaceData(prevValues => {
      const newValues = [...prevValues];
      newValues[index] = Math.floor(result);
      return newValues;
    });
  };

  const getBatchAtt = (month, type) => {
    return (Array.isArray(batchAttData) && batchAttData.length ? batchAttData.filter((data)=> 
      data.Course === selectedCourse && data.Attendance_Type === type &&
      `${data.Date.split('-')[1]}-${data.Date.split('-')[2]}` === `${month}-${selectedYear.getFullYear()}`).length 
    : 
    0 )
  }

  useEffect(()=>{
    getPercentage();
  },[selectedYear])

  return (
    <Box className="w-full mt-10 flex flex-col items-center justify-around">
      <LineChart
        xAxis={[{ scaleType: 'point', data: xLabels }]}
        series={[
          {
            data: studentAttendaceData,
            area: true,
            label : `Detailed ${selectedYear && selectedYear.getFullYear()} Performance Analysis.`,
          },
        ]}
        width={950}
        height={300}
      />
    <Box className='w-1/2 flex items-center justify-between'>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          views={['year']}
          label="Select Year"
          value={selectedYear}
          onChange={(date)=>setSelectedYear(date)}
          renderInput={(params) => <TextField {...params} />}
        />
      </LocalizationProvider>
      <Button variant='contained' sx={{ borderRadius : '25px', width : '40%', height : '40px' }} onClick={getPercentage}
        >Get Results</Button>
    </Box>
  </Box>
  )
}

export default PerformanceInsights;