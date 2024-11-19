import * as React from 'react';
import { Box, Tab, Tabs } from '@mui/material';
import { BadgeRounded, SchoolRounded, SpeedRounded, TimelineRounded, WorkRounded  } from '@mui/icons-material';

const CustomTabs = ({ tabsValue, setTabValue }) => {
  const handleChange = (event,newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box className="w-[95%] ml-[2.5%] mb-5 bg-transparent border-b-[1px] border-gray-300">
      <Tabs value={tabsValue} onChange={handleChange} start>
        <Tab label="Personal Info" icon={<BadgeRounded />} sx={{fontWeight : (tabsValue === 0) && 'bold'}} />
        <Tab label="Attendance Insights" icon={<TimelineRounded />} sx={{fontWeight : (tabsValue === 1) && 'bold'}} />
        <Tab label="Performance" icon={<SpeedRounded />} sx={{fontWeight : (tabsValue === 2) && 'bold'}} />
        <Tab label="Education Info" icon={<SchoolRounded />} sx={{fontWeight : (tabsValue === 3) && 'bold'}} />
        <Tab label="Placement Requirement Info" icon={<WorkRounded />} sx={{fontWeight : (tabsValue === 4) && 'bold'}} />
      </Tabs>
    </Box>
  );
}

export default CustomTabs;