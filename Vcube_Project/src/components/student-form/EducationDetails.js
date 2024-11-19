import React, { useEffect, useState } from 'react';
import { ArrowForward, ExpandMore, School } from '@mui/icons-material';
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Typography, FormControl, InputLabel, Select, MenuItem, Checkbox, FormControlLabel, FormHelperText, Dialog, DialogContent, DialogContentText, DialogTitle, DialogActions } from '@mui/material';
import NumberInput from '../noSpinnerField';
import InputField from '../InputField';

const EducationDetails = ({ handleBack, handleNext, highDegree, setHighDegree, educationData, setEducationData, handleShowSnackbar, editDetails }) => {
    const [name10th, setName10th] = useState(null);
    const [cGPA10th, setCGPA10th] = useState(null);
    const [yearPass10, setYearPass10] = useState(null);
    const [name12th, setName12th] = useState(null);
    const [cGPA12th, setCGPA12th] = useState(null);
    const [specialization12th, setSpecialization12th] = useState(null);
    const [interStartYear, setInterStartYear] = useState(null);
    const [interPassYear, setInterPassYear] = useState(null);
    const [nameDegree, setNameDegree] = useState(null);
    const [cGPADegree, setCGPADegree] = useState(null);
    const [degreeSpecialization, setDegreeSpecialization] = useState(null);
    const [degreePlace, setDegreePlace] = useState(null);
    const [degreeStartYear, setDegreeStartYear] = useState(null);
    const [degreePassYear, setDegreePassYear] = useState(null);
    const [namePG, setNamePG] = useState(null);
    const [cGPAPG, setCGPAPG] = useState(null);
    const [pGSpecialization, setPGSpecialization] = useState(null);
    const [pGPlace, setPGPlace] = useState(null);
    const [pGStartYear, setPGStartYear] = useState(null);
    const [pGPassYear, setPGPassYear] = useState(null);
    const [get12th, setGet12th] = useState('Inter');
    const [expanded, setExpanded] = useState(null);
    const [onSubmit, setOnSubmit] = useState(false);
    const [confirmLeapYear, setConfirmLeapYear] = useState(false);

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 20 }, (_, index) => currentYear - index);

    const handleChange = (panel) => {
        setExpanded(panel)
    };

    useEffect(()=>{
        setName10th(educationData.SSC_College_Name);
        setCGPA10th(educationData.SSC_CGPA);
        setYearPass10(educationData.SSC_Passed_Year);
        setName12th(educationData.Inter_College_Name);
        setCGPA12th(educationData.Inter_CGPA);
        setSpecialization12th(educationData.Inter_Specialization);
        setInterStartYear(educationData.Inter_Start_Year);
        setInterPassYear(educationData.Inter_Passed_Year);
        setNameDegree(educationData.Degree_College_Name);
        setDegreePlace(educationData.Degree_College_Place);
        setDegreeSpecialization(educationData.Degree_Specialization);
        setCGPADegree(educationData.Degree_CGPA);
        setDegreeStartYear(educationData.Degree_Start_Year);
        setDegreePassYear(educationData.Degree_Passed_Year);
        if(highDegree){
            setNamePG(educationData.PG_College_Name);
            setPGPlace(educationData.PG_College_Place);
            setPGSpecialization(educationData.PG_Specialization);
            setCGPAPG(educationData.PG_CGPA);
            setPGStartYear(educationData.PG_Start_Year);
            setPGPassYear(educationData.PG_Passed_Year);
        }
    },[educationData, highDegree])

    const saveData = () => {
        const data = {
            SSC_College_Name : name10th,
            SSC_CGPA : cGPA10th,
            SSC_Passed_Year : yearPass10,
            Inter_College_Name : name12th,
            Inter_Specialization : specialization12th,
            Inter_CGPA : cGPA12th,
            Inter_Start_Year : interStartYear,
            Inter_Passed_Year : interPassYear,
            Degree_College_Name : nameDegree,
            Degree_College_Place : degreePlace,
            Degree_Specialization : degreeSpecialization,
            Degree_CGPA : cGPADegree,
            Degree_Start_Year : degreeStartYear,
            Degree_Passed_Year : degreePassYear
        }
        if(highDegree){
            const pGData = {
                PG_College_Name : namePG,
                PG_College_Place : pGPlace,
                PG_Specialization : pGSpecialization,
                PG_CGPA : cGPAPG,
                PG_Start_Year : pGStartYear,
                PG_Passed_Year : pGPassYear
            }
            const Data = {...data, ...pGData};
            setEducationData(Data);
        }else{
            setEducationData(data);
        };
    }

    const onSubmitDetails = () => {
        setOnSubmit(true);
        if(!checkFields())return;
        saveData();
        checkYearGap() ? handleNext() : setConfirmLeapYear(true);
    };

    const checkYearGap = () => {
        if(parseInt(interStartYear) - parseInt(yearPass10) !== 0)return false;
        if(parseInt(degreeStartYear) - parseInt(interPassYear) !== 0)return false;
        if(highDegree){
            if(parseInt(pGStartYear) - parseInt(degreePassYear) !== 0)return false
        };
        return true;
    }

    const checkFields = () => {
        return (
            name10th && cGPA10th && yearPass10 &&
            interPassYear && interStartYear &&
            specialization12th && name12th &&
            cGPA12th && nameDegree &&
            degreePlace && degreeSpecialization &&
            degreeStartYear && degreePassYear &&
            cGPADegree && (!highDegree || (namePG && pGSpecialization && pGPassYear && pGStartYear && pGPlace && cGPAPG))
        );
    };


  return (
    <>
    <Box className="mt-8 w-full" sx={{marginRight : '10%'}}>
        <Accordion expanded={expanded === 'panel1'} onChange={()=>handleChange(expanded === 'panel1' ? null : 'panel1')} className={`${(onSubmit && (!yearPass10 || !name10th || !cGPA10th)) ? 'border-[1.5px] border-[#d32f2f]' : 'border-t-[1px] border-gray-300'}`}>
        <AccordionSummary
          expandIcon={<ExpandMore />}
          aria-controls="panel1-content"
        >
            <School className="text-gray-500" sx={{fontSize : '28px', marginRight : '1%'}} />
            <Typography variant='h6'>10th Standard Details</Typography>
        </AccordionSummary>
        <AccordionDetails className='w-full h-24 flex flex-row items-start justify-between'>
            <InputField  className='w-[30%]' type='text' error={onSubmit && !name10th} helperText={(onSubmit && !name10th) ? "Enter School Name" : ""} value={name10th} onChange={(e)=>setName10th(e.target.value)} variant='standard' required label="10th School Name" />
            <NumberInput className='w-[30%]' error={onSubmit && !cGPA10th} helperText={(onSubmit && !cGPA10th) ? "Enter CGPA" : ""} value={cGPA10th} onChange={(e)=>setCGPA10th(e.target.value)} required label="10th CGPA" />
            <FormControl className='w-[30%]'>
            <InputLabel shrink={yearPass10 ? true : false} sx={{fontSize : "20px", marginLeft : '-10px', color : (onSubmit && !yearPass10) ? '#d32f2f' : ''}}>Year of Passing*</InputLabel>
            <Select
                required
                value={yearPass10}
                error={onSubmit && !yearPass10}
                onChange={(e)=>setYearPass10(e.target.value)}
                variant="standard"
                sx={{
                    '& .MuiInputBase-input': {
                    fontSize: '20px',
                    padding: '5px 0',
                    },
                    '& .MuiInputLabel-root': {
                    fontSize: '20px',
                    },}}>
                {years.map((year) => (
                <MenuItem key={year} value={year}>
                    {year}
                </MenuItem>
                ))}
            </Select>
            {(onSubmit && !yearPass10) && <FormHelperText sx={{color : '#d32f2f',marginLeft : '0'}}>Select Passout Year</FormHelperText>}
            </FormControl>
        </AccordionDetails>
        </Accordion>


        <Accordion expanded={expanded === 'panel2'} onChange={()=>handleChange(expanded === 'panel2' ? null : 'panel2')} className={`${(onSubmit && (!interPassYear || !interStartYear || !name12th || !cGPA12th)) ? 'border-[1.5px] border-[#d32f2f]' : 'border-t-[1px] border-gray-300'}`} >  
            <AccordionSummary expandIcon={<ExpandMore />}>
                <School className="text-gray-500" sx={{fontSize : '28px', marginRight : '1%'}} />
                <Typography variant='h6'>12th Standard Details</Typography>
            </AccordionSummary>
            <AccordionDetails>    
            <Box className="w-full">
                <FormControlLabel
                error={(get12th === 'Inter' || get12th === 'Diploma') ? false : true}
                label="Inter"
                control={<Checkbox required defaultChecked checked={(get12th === 'Inter' ? true : false)} onChange={(e)=>(e.target.checked ? setGet12th('Inter') : setGet12th('Diploma'))} />}
                />
                <FormControlLabel
                error={(get12th === 'Inter' || get12th === 'Diploma') ? false : true}
                label="Diploma"
                control={<Checkbox required checked={(get12th === 'Diploma' ? true : false)} onChange={(e)=>(e.target.checked ? setGet12th('Diploma') : setGet12th('Inter'))} />}
                />
            </Box>

            <Box className="w-full h-24 flex flex-row items-start justify-between">
                <InputField label={`${get12th} College Name`} value={name12th} onChange={(e)=>setName12th(e.target.value)} error={onSubmit && !name12th} helperText={onSubmit && !name12th ? "Enter College Name" : ""} required variant='standard' className='w-[25%]' />
                <InputField label={`${get12th} Specialization`} value={specialization12th} onChange={(e)=>setSpecialization12th(e.target.value)} error={onSubmit && !specialization12th} helperText={onSubmit && !specialization12th ? "Enter Specialization" : ""} required variant='standard' className='w-[20%]' />
                <NumberInput required label={`${get12th} CGPA`} value={cGPA12th} onChange={(e)=>setCGPA12th(e.target.value)} error={onSubmit && !cGPA12th} helperText={onSubmit && !cGPA12th ? "Enter Specialization" : ""} className="w-[13%]" />
                <FormControl className='w-[14%]'>
                <InputLabel shrink={interStartYear ? true : false} sx={{fontSize : "20px", marginLeft : '-10px', color : (onSubmit && !interStartYear) ? "#d32f2f" : ""}} >Year of Start*</InputLabel>
                <Select
                    value={interStartYear}
                    onChange={(e)=>setInterStartYear(e.target.value)}
                    variant="standard"
                    error={onSubmit && !interStartYear}
                    sx={{
                        '& .MuiInputBase-input': {
                        fontSize: '20px',
                        padding: '5px 0',
                        },
                        '& .MuiInputLabel-root': {
                        fontSize: '20px',
                        },}}>
                    {years.map((year) => {
                        if(parseInt(year) >= parseInt(yearPass10))
                        return(
                        <MenuItem key={year} value={year}>
                            {year}
                        </MenuItem>
                        )
                    })}
                </Select>
                {(onSubmit && !interStartYear) && <FormHelperText sx={{color : '#d32f2f', marginLeft : '0'}}>Select Start Year</FormHelperText>}
                </FormControl>

                <FormControl className='w-[17%]'>
                <InputLabel shrink={interPassYear ? true : false} sx={{fontSize : "20px", marginLeft : '-10px', color : (onSubmit && !interPassYear) ? "#d32f2f" : ""}}>Year of Passing*</InputLabel>
                <Select
                    value={interPassYear}
                    onChange={(e)=>setInterPassYear(e.target.value)}
                    variant="standard"
                    error={onSubmit && !interPassYear}
                    sx={{
                        '& .MuiInputBase-input': {
                        fontSize: '20px',
                        padding: '5px 0',
                        },
                        '& .MuiInputLabel-root': {
                        fontSize: '20px',
                        },}}>
                    {years.map((year) => {
                        if(parseInt(year) > parseInt(interStartYear))
                        return(
                        <MenuItem key={year} value={year}>
                            {year}
                        </MenuItem>
                        )
                    })}
                </Select>
                {(onSubmit && !interPassYear) && <FormHelperText sx={{color : '#d32f2f',marginLeft : '0'}}>Select Year of Passing</FormHelperText>}
                </FormControl>
            </Box>
            </AccordionDetails>
        </Accordion>

        
        <Accordion expanded={expanded === 'panel3'} onChange={()=>handleChange(expanded === 'panel3' ? null : 'panel3')} className={`${(onSubmit && (!degreePassYear || !degreeStartYear || !degreePlace || !degreeSpecialization || !nameDegree || !cGPADegree)) ? 'border-[1.5px] border-[#d32f2f]' : 'border-t-[1px] border-gray-300'}`} >  
            <AccordionSummary expandIcon={<ExpandMore />}>
                <School className="text-gray-500" sx={{fontSize : '28px', marginRight : '1%'}} />
                <Typography variant='h6'>Under Graduation Details</Typography>
            </AccordionSummary>
            <AccordionDetails>
            <Box sx={{marginBottom : '2%'}} className="w-full flex flex-col items-center justify-center">
                <Box className="flex flex-row items-center justify-between w-full">
                <InputField label="Under Graduation College Name" value={nameDegree} onChange={(e)=>setNameDegree(e.target.value)} error={onSubmit && !degreePlace} helperText={(onSubmit && !degreePlace) ? "Enter College Name" : ""} required variant='standard' className='w-[23%]' />
                <InputField label="Under Graduation Specialization" value={degreeSpecialization} onChange={(e)=>setDegreeSpecialization(e.target.value)} error={onSubmit && !degreeSpecialization} helperText={(onSubmit && !degreeSpecialization) ? "Enter Specialization" : ""} required variant='standard' className='w-[23%]' />
                <InputField label="Under Graduation College Location" value={degreePlace} onChange={(e)=>setDegreePlace(e.target.value)} error={onSubmit && !degreePlace} helperText={(onSubmit && !degreePlace) ? "Enter College Location" : ""} required variant='standard' className='w-[23%]' />
                <NumberInput required label="Under Graduation CGPA" className="w-[23%]" value={cGPADegree} onChange={(e)=>setCGPADegree(e.target.value)} error={onSubmit && !cGPADegree} helperText={(onSubmit && !cGPADegree) ? "Enter CGPA" : ""} />
                </Box>
                <Box className="flex flex-row items-center justify-between w-[49%] mt-5">
                <FormControl className='w-[47%]'>
                <InputLabel shrink={degreeStartYear ? true : false} sx={{fontSize : "20px", marginLeft : '-10px', color : (onSubmit && !degreeStartYear) ? "#d32f2f" : ""}}>Year of Start*</InputLabel>
                <Select
                    value={degreeStartYear}
                    onChange={(e)=>setDegreeStartYear(e.target.value)}
                    variant="standard"
                    error={onSubmit && !degreeStartYear}
                    sx={{
                        '& .MuiInputBase-input': {
                        fontSize: '20px',
                        padding: '5px 0',
                        },
                        '& .MuiInputLabel-root': {
                        fontSize: '20px',
                        },}}>
                    {years.map((year) => {
                        if(parseInt(year) >= parseInt(interPassYear))
                        return(
                        <MenuItem key={year} value={year}>
                            {year}
                        </MenuItem>
                        )
                    })}
                </Select>
                {(onSubmit && !degreeStartYear) && <FormHelperText sx={{marginLeft : '0', color : '#d32f2f'}}>Select Start Year</FormHelperText>}
                </FormControl>

                <FormControl className='w-[47%]'>
                <InputLabel shrink={degreePassYear ? true : false} sx={{fontSize : "20px", marginLeft : '-10px', color : (onSubmit && !degreePassYear) ? "#d32f2f" : ""}}>Year of Passing*</InputLabel>
                <Select
                    value={degreePassYear}
                    onChange={(e)=>setDegreePassYear(e.target.value)}
                    variant="standard"
                    error={onSubmit && !degreePassYear}
                    sx={{
                        '& .MuiInputBase-input': {
                        fontSize: '20px',
                        padding: '5px 0',
                        },
                        '& .MuiInputLabel-root': {
                        fontSize: '20px',
                        },}}>
                    <MenuItem value={'Currently Pursuing'}>
                        Currently Pursuing
                    </MenuItem>
                    {years.map((year) => {
                        if(parseInt(year) > parseInt(degreeStartYear))
                        return(
                        <MenuItem key={year} value={year}>
                            {year}
                        </MenuItem>
                        )
                    })}
                </Select>
                {(onSubmit && !degreePassYear) && <FormHelperText sx={{marginLeft : '0', color : '#d32f2f'}}>Select Year of PAssing</FormHelperText>}
                </FormControl>
                </Box>
            </Box>
            </AccordionDetails>
        </Accordion>


        <Accordion expanded={expanded === 'panel4'} onChange={()=>handleChange(expanded === 'panel4' ? null : 'panel4')} className={`${((onSubmit && highDegree) && (!pGStartYear || !pGPassYear || !pGPlace || !pGSpecialization || !namePG || !cGPAPG)) ? 'border-[1.5px] border-[#d32f2f]' : 'border-t-[1px] border-gray-300'}`} >  
            <AccordionSummary expandIcon={<ExpandMore />}>
                <School className="text-gray-500" sx={{fontSize : '28px', marginRight : '1%'}} />
                <Typography variant='h6'>Post Graduation Details</Typography>
            </AccordionSummary>
            <AccordionDetails>
            <Box className="w-full mt-0">
                <FormControlLabel
                label="Post Graduation"
                control={<Checkbox checked={highDegree ? true : false} onChange={(e)=>{
                    (e.target.checked ? setHighDegree('PG') : setHighDegree(null));
                    if(editDetails)handleShowSnackbar('warning','Please note that if you change the PG details option, your previously edited educational years may revert back to their original values. Please ckeck once and continue.')}} />}
                />
            </Box>

            {highDegree && (<Box sx={{margin : '0 0 2% 0'}} className="w-full flex flex-col items-center justify-between">
                <Box className="w-full flex flex-row items-center justify-between">
                <InputField label="PG College Name" value={namePG} onChange={(e)=>setNamePG(e.target.value)} error={(onSubmit && highDegree && !namePG)} required variant='standard' className='w-[23%]' />
                <InputField label="PG Specialization" value={pGSpecialization} onChange={(e)=>setPGSpecialization(e.target.value)} error={(onSubmit && highDegree && !pGSpecialization)} required variant='standard' className='w-[23%]' />
                <InputField label="PG Place" value={pGPlace} onChange={(e)=>setPGPlace(e.target.value)} error={(onSubmit && highDegree && !pGPlace)} required variant='standard' className='w-[23%]' />
                <NumberInput required label="PG CGPA" className="w-[23%]" value={cGPAPG} onChange={(e)=>setCGPAPG(e.target.value)} error={(onSubmit && highDegree && !cGPAPG)} />
                </Box>

                <Box className="flex flex-row items-center justify-between w-[49%] mt-5">
                <FormControl className='w-[47.5%]'>
                <InputLabel shrink={pGStartYear ? true : false} sx={{fontSize : "20px", marginLeft : '-10px', color : (onSubmit && highDegree && !pGStartYear) ? '#d32f2f' : ''}}>Year of Start*</InputLabel>
                <Select
                    value={pGStartYear}
                    onChange={(e)=>setPGStartYear(e.target.value)}
                    variant="standard"
                    error={onSubmit && highDegree && !pGStartYear}
                    sx={{
                        '& .MuiInputBase-input': {
                        fontSize: '20px',
                        padding: '5px 0',
                        },
                        '& .MuiInputLabel-root': {
                        fontSize: '20px',
                        },}}>
                    {years.map((year) => {
                        if(parseInt(year) >= parseInt(degreePassYear))
                        return(
                        <MenuItem key={year} value={year}>
                            {year}
                        </MenuItem>
                        )
                    })}
                </Select>
                {(onSubmit && highDegree && !pGStartYear) && <FormHelperText sx={{color : '#d32f2f', marginLeft : '0'}}>Select Start Year</FormHelperText>}
                </FormControl>

                <FormControl className='w-[47.5%]'>
                <InputLabel shrink={pGPassYear ? true : false} sx={{fontSize : "20px", marginLeft : '-10px', color : (onSubmit && highDegree && !pGPassYear) ? '#d32f2f' : ''}}>Year of Passing*</InputLabel>
                <Select
                    value={pGPassYear}
                    onChange={(e)=>setPGPassYear(e.target.value)}
                    variant="standard"
                    error={onSubmit && highDegree && !pGPassYear}
                    sx={{
                        '& .MuiInputBase-input': {
                        fontSize: '20px',
                        padding: '5px 0',
                        },
                        '& .MuiInputLabel-root': {
                        fontSize: '20px',
                        },}}>
                    <MenuItem value={'Currently Pursuing'}>
                        Currently Pursuing
                    </MenuItem>
                    {years.map((year) => {
                        if(parseInt(year) > parseInt(pGPassYear))
                        return(
                        <MenuItem key={year} value={year}>
                            {year}
                        </MenuItem>
                        )
                    })}
                </Select>
                {(onSubmit && highDegree && !pGPassYear) && <FormHelperText sx={{color : '#d32f2f', marginLeft : '0'}}>Select Year of Passing</FormHelperText>}
                </FormControl>
            </Box>
            </Box>)}
            </AccordionDetails>
        </Accordion>
        

    </Box>
    <Box className="flex justify-between mt-5">
        <Button onClick={()=>{handleBack();saveData()}}>
        Back
        </Button>
        <Button variant="contained" 
        onClick={onSubmitDetails} endIcon={<ArrowForward />}>Next</Button>
    </Box>

    <Dialog open={confirmLeapYear} sx={{zIndex : '910'}}>
        <DialogTitle>Are you sure you want to continue?</DialogTitle>
        <DialogContent>
            <DialogContentText>
                Before you decide to continue, are you aware of the year gap that exists? <br/>
                It’s something to think about.
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button variant='outlined' onClick={()=>setConfirmLeapYear(false)}>No, I want to change</Button>
            <Button variant='contained' onClick={handleNext}>Yes, Continue</Button>
        </DialogActions>
    </Dialog>
    </>
  )
}

export default EducationDetails;