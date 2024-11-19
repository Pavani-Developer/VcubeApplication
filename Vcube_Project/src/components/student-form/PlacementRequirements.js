import React, { useContext, useEffect, useState } from 'react';
import { Box, Button, TextField, Select, MenuItem, FormControl, InputLabel, Autocomplete, Stack, InputAdornment, Typography, FormHelperText } from '@mui/material';
import { CheckCircleRounded, PersonPinCircle, Moving, AccessTime, NightsStay, Feed, Work, WorkHistory, AccountBalanceWalletRounded, PsychologyRounded, Title, WorkRounded, WorkOutlineOutlined, WorkHistoryRounded } from '@mui/icons-material';
import InputField from '../InputField';
import SelectDialog from '../SelectDialog';
import { allTechnologies, Cities } from '../ExternalData';
import { StudentsContext } from '../api/students';
import { useNavigate } from 'react-router-dom';
import { DateTime } from '../date-time';

const PlacementRequirements = ({ handleBack, personalData, educationData, placementData, setPlacementData, setIsLoading, handleShowSnackbar, setIsOpen, selectedCourse, editDetails, joiningDate, refreshData }) => {
    const { postStudentData, patchStudentData } = useContext(StudentsContext);
    const dateTime = DateTime().split(' ');
    const navigate = useNavigate();
    const [skills, setSkills] = useState([]);
    const [cities, setCities] = useState([]);
    const [location, setLocation] = useState(null);
    const [relocate, setRelocate] = useState(null);
    const [immediateJoin, setImmediateJion] = useState(null);
    const [shifts, setShifts] = useState(null);
    const [bondDuration, setBondDuration] = useState(null);
    const [isbond, setIsBond] = useState(false);
    const [isInterships, setIsInterships] = useState(false);
    const [internshipType, setInternshipType] = useState(null);
    const [experience, setExperience] = useState(null);
    const [employement, setEmployement] = useState(null);
    const [dialogOpen, setDialopOpen] = useState(false);
    const [dialogType, setDialogType] = useState(null);
    const [onSubmit, setOnSubmit] = useState(false);

    useEffect(()=>{
        if(placementData){
            if(placementData && placementData.Skills)setSkills(placementData.Skills.map(skill=>skill))
            setCities(placementData.Cities)
            setLocation(placementData.Location)
            setRelocate(placementData.Relocate)
            setImmediateJion(placementData.Immediate_Jion)
            setShifts(placementData.Shifts)
            setIsBond(placementData.Bond)
            setBondDuration(placementData.Bond_Duration)
            setIsInterships(placementData.Internship)
            setInternshipType(placementData.Internship_Type)
            setExperience(placementData.Experience || null);
            setEmployement(placementData.Employement || null);
        }
    },[placementData])

    const saveData = () =>{
        const data = {
            Skills : skills,
            Cities : cities,
            Location : location,
            Relocate : relocate,
            Immediate_Jion : immediateJoin,
            Shifts : shifts,
            Bond : isbond,
            Bond_Duration : bondDuration,
            Internship : isInterships,
            Internship_Type : internshipType,
            Experience : experience,
            Employement : employement
        }
        setPlacementData(data);
        return data;
    }
    
    const selectInputs = [{
        Value : relocate,
        Icon : <Moving className="text-gray-500" sx={{fontSize : '30px', margin : '23px 10px 0 0'}}/>,
        Title : 'Willing to relocate ? *',
        Items : ['Yes (Preferred More)', 'No']
        },{
            Value : immediateJoin,
            Icon : <AccessTime className="text-gray-500" sx={{fontSize : '30px', margin : '23px 10px 0 0'}}/>,
            Title : 'Immediate Joiner ? *',
            Items : ['Yes', 'No']
        },{
            Value : shifts,
            Icon : <NightsStay className="text-gray-500" sx={{fontSize : '30px', margin : '23px 10px 0 0'}}/>,
            Title : 'Willing to work for Relational Shifts ? *',
            Items : ['Yes (Preferred More)', 'No']
        },{
            Value : isbond !== null && isbond === true ? 'Yes' : (isbond === false) ? 'No' : "",
            Icon : <Feed className="text-gray-500" sx={{fontSize : '30px', margin : '23px 10px 0 0'}}/>,
            Title : 'Willing to work on Bond ? *',
            Items : ['Yes', 'No'],
        },{
            Value : isInterships !== null && isInterships === true ? 'Yes' : (isInterships === false) ? 'No' : "",
            Icon : <Work className="text-gray-500" sx={{fontSize : '30px', margin : '23px 10px 0 0'}}/>,
            Title : 'Willing to work for Interships ? *',
            Items : ['Yes', 'No'],
        },{
            Value : experience,
            Icon : <WorkOutlineOutlined className="text-gray-500 mt-6" sx={{fontSize : '30px', margin : '23px 10px 0 0'}} />,
            Title : 'Select Your Experience',
            Items : ['Pursuing Studies','Fresher','1-2y','3-5y','5y+']
        },{
            Value : employement,
            Icon : <WorkHistoryRounded className="text-gray-500 mt-6" sx={{fontSize : '30px', margin : '23px 10px 0 0'}} />,
            Title : 'Select Your Employement',
            Items : ['Not Seeking Opportunities','Open to Work','Currently Working as a Intern','Currently Working as an Employee']
        }
    ];

    const handleSelect = (value, title) => {
        if(title.includes('work on Bond')){
             setIsBond(value === 'Yes' ? true : false);
             if(value === 'No')setBondDuration(null);
             if(value === 'Yes'){
                setDialogType('Bond')
                setDialopOpen(true);
             }
        }
        if(title.includes('work for Interships')){
            setIsInterships(value === 'Yes' ? true : false);
            if(value === 'No')setInternshipType(null);
            if(value === 'Yes'){
                setDialogType('Internship')
                setDialopOpen(true);
             }
        }
        if(title.includes('relocate')){
            if(value === 'No')setRelocate('No');
            if(value.includes('Yes')){
                setDialogType('Location')
                setDialopOpen(true);
            }
        }
        if(title.includes('Relational Shifts')){
            setShifts(value);
        }if(title.includes('Immediate Joiner')){
            setImmediateJion(value);
        };
        if(title.includes('Experience')){
            setExperience(value);
        }
        if(title.includes('Employement')){
            setEmployement(value);
        }
    };

    const submitDetails = async() => {
        setOnSubmit(true);
        if(!checkFields())return;
        setIsLoading(true);
        saveData();
        personalData['Course'] = selectedCourse;
        const personalInfo = JSON.stringify(personalData);
        const educationInfo = JSON.stringify(educationData);
        const placementInfo = JSON.stringify(saveData());
        const data = {
            "Name" : personalData.Name,
            "Email" : personalData.Email,
            "Phone" : personalData.Phone,
            "BatchName" : personalData.BatchName,
            "Course" : personalData.Course,
            "Personal_Info": personalInfo,
            "Educational_Info": educationInfo,
            "Placement_Info": placementInfo,
            "Joining_Date": editDetails ? joiningDate : dateTime[0],
        }
        if(editDetails)data['id'] = JSON.parse(sessionStorage.getItem('StudentDetails_ID'))
        const result = editDetails ? await patchStudentData(data) : await postStudentData(data);
        if (result && result.message){
            handleShowSnackbar('error',result.message);
        }else if (result === true){
            refreshData();
            handleShowSnackbar('success',`Student - ${personalData.Name} details ${editDetails ? 'updated' : 'added'} successfully.`);
            setIsOpen(false);
        }
    };

    const checkFields = () => {
        if(
            (skills && skills.length > 0) &&
            (relocate === 'No' || (cities && cities.length > 0)) &&
            location &&
            immediateJoin &&
            shifts &&
            (!isbond || bondDuration) &&
            (!isInterships || internshipType) &&
            experience &&
            employement
        )return true;
        return false;
    };

    const getCurrentCityAndState = () => {
        setIsLoading(true);
        setTimeout(()=>{
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
            (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`)
                .then(response => response.json())
                .then(data => {
                const city = data.city || data.locality;
                const state = data.principalSubdivision;
    
                setLocation(`${city}, ${state}~${latitude},${longitude}`);
                })
                .catch(error => {
                handleShowSnackbar('error','Error fetching location data');
                });
            },
            (error) => {
                handleShowSnackbar('error','Error getting location');  
            }
        );
        } else {
            handleShowSnackbar('error','Geolocation is not supported by this browser'); 
        }    
    },1500)
  };
  

  return (
    <>
    <Box className="w-full h-24 mt-5 flex flex-row items-center justify-between">
    <PsychologyRounded className='text-gray-500' sx={{fontSize : '35px', marginTop : '20px'}}/>
    <Stack spacing={3} className='w-[96.5%]'>
        <Autocomplete
            multiple
            freeSolo
            options={allTechnologies}
            getOptionLabel={(option) => option}
            value={skills}
            onChange={(e,values)=>setSkills(values)}
            renderInput={(params) => (
            <InputField required
                error={onSubmit && (!skills || (skills && skills.length === 0))}
                helperText={onSubmit && (!skills || (skills && skills.length === 0)) ? "Select Skills" : ""}
                {...params}
                variant="standard"
                label="Select Skills"
                placeholder="Skills"
            />
            )}
    /></Stack>
    </Box>
    <Box className="mt-7 mb-10 w-full h-80 grid grid-cols-2" sx={{rowGap : '10px', columnGap : '50px'}}>
        <Box className="w-full flex flex-row items-start justify-between relative">
        <PersonPinCircle className="text-gray-500" sx={{fontSize : '35px', margin : '20px 10px 0 0'}} />
        <InputField type='text' variant='standard' label="Current Location" required
        value={location && location.split('~')[0]}
        onChange={(e)=>setLocation(e.target.value)}
        error={onSubmit && !location}
        InputLabelProps={{ shrink: (location) ? true : false }} 
        InputProps={{endAdornment: <InputAdornment position="end">
                <Typography color='primary' className='hover:underline cursor-pointer' onClick={getCurrentCityAndState}>Auto Fetch Location</Typography>
            </InputAdornment>}}
        helperText={onSubmit && !location ? "Enter Current Location" : ""}
        sx={{width: '100%'}}
        />
        </Box>

        {selectInputs.map((options)=>(
        <Box className='w-full h-20 flex flex-row items-start justify-between'>
        {options.Icon}
        <FormControl variant="standard" sx={{width : '100%'}}>
        <InputLabel shrink={options.Value ? true : false} sx={{fontSize : '20px', color : (onSubmit && !options.Value) ? '#d32f2f' : ""}}>{options.Title}</InputLabel>
            <Select
                variant='standard'
                value={options.Value}
                error={onSubmit && !options.Value}
                onChange={(e)=>handleSelect(e.target.value,options.Title)}
                sx={{width: '100%',
                '& .MuiInputBase-input': {
                fontSize: '20px',
                padding: '5px 0',
                },
                '& .MuiInputLabel-root': {
                fontSize: '20px',
                },}}
                >
                {options.Items.map((item)=>(
                    <MenuItem value={item}>{item}</MenuItem>
                ))}
            </Select>
            <FormHelperText sx={{color : '#d32f2f'}}>{(onSubmit && !options.Value) ? options.Txt || 'Select an Option' : ""}</FormHelperText>
        </FormControl>
        </Box>
        ))}
    </Box>

    <SelectDialog dialogOpen={dialogOpen} setDialopOpen={setDialopOpen} data={Cities} type={dialogType} setRelocate={setRelocate} setCities={setCities}
                  bondDuration={bondDuration} setBondDuration={setBondDuration} internshipType={internshipType} setInternshipType={setInternshipType} />

    <Box className="flex justify-between mt-5">
        <Button onClick={()=>{handleBack();saveData()}}>
        Back
        </Button>
        <Button variant="contained" onClick={submitDetails} endIcon={<CheckCircleRounded />}>Finish</Button>
    </Box>
    </>
  )

};

export default PlacementRequirements;
