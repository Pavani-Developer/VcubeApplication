import React, { useEffect, useState } from 'react';
import { Stepper, Step, StepLabel, Button, Box, Typography } from '@mui/material';
import PersonalInfo from './PersonalInfo';
import EducationDetails from './EducationDetails';
import PlacementRequirements from './PlacementRequirements';

const steps = ['Personal Information', 'Education Details', 'Placement Requirements'];

const SimpleStepper = ({ handleShowSnackbar, setIsLoading, setOpenDialog, setIsOpen, setDialogMsg, student_Personal_Details, student_Education_Details, student_Placement_Details, user, selectedCourse, editDetails, joiningDate, refreshData }) => {
  const [personalData, setPersonalData] = useState({});
  const [educationData, setEducationData] = useState({});
  const [placementData, setPlacementData] = useState({});
  const [activeStep, setActiveStep] = useState(0);
  const [resumeName, setResumeName] = useState(null);
  const [highDegree, setHighDegree] = useState(null);

  const getStudentDetails = () => {
    if(user === 'Student' || editDetails){
      if(student_Personal_Details)setPersonalData(student_Personal_Details);
      if(student_Education_Details && student_Education_Details !== 'N/A')setEducationData(student_Education_Details);
      if(student_Placement_Details && student_Placement_Details !== 'N/A')setPlacementData(student_Placement_Details);
      if(student_Placement_Details !== 'N/A' && student_Education_Details.PG_Specialization)setHighDegree('PG');
    }
  };

  useEffect(()=>{
    getStudentDetails();
  },[])

  const handleNext = () => {
    setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  return (
    <Box className="w-full h-full flex flex-col items-center justify-start bg-[#fafbfb]">
    <Box className="w-[90%] mt-10 h-full">
      <Stepper activeStep={activeStep}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ padding: 2 }}>
        {activeStep === 0 && <Typography>Enter your personal information here.</Typography>}
        {activeStep === 1 && <Typography>Provide your education details here.</Typography>}
        {activeStep === 2 && <Typography>Provide Placement Requirements here.</Typography>}

        {personalData && activeStep === 0 ? <PersonalInfo personalData={personalData} setPersonalData={setPersonalData} resumeName={resumeName} 
                                          setResumeName={setResumeName} handleNext={handleNext} handleShowSnackbar={handleShowSnackbar} editDetails={editDetails}
                                          setOpenDialog={setOpenDialog} setDialogMsg={setDialogMsg} user={user} selectedCourse={selectedCourse} />
        : (activeStep === 1) ? <EducationDetails handleBack={handleBack} handleNext={handleNext} highDegree={highDegree} setHighDegree={setHighDegree} 
                              educationData={educationData} setEducationData={setEducationData} handleShowSnackbar={handleShowSnackbar} editDetails={editDetails} />
         : <PlacementRequirements handleBack={handleBack} personalData={personalData} educationData={educationData} placementData={placementData} 
                                  setPlacementData={setPlacementData} handleShowSnackbar={handleShowSnackbar} setIsLoading={setIsLoading} setIsOpen={setIsOpen}
                                  selectedCourse={selectedCourse} editDetails={editDetails} joiningDate={joiningDate} refreshData={refreshData} />}

      </Box>
    </Box>
    </Box>
  );
};

export default SimpleStepper;
