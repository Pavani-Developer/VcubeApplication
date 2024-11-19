import React from 'react';
import { PieChart } from '@mui/x-charts/PieChart';
import { Box } from '@mui/material';

const PerformancePieChat = ({ classes, mock, interview, }) => {
    const runClasses = [classes, mock, interview];
    const data = [
        {value: classes.split('~')[0] === '0' ? 1 : classes.split('~')[0], label: `Classes Attendance • ${classes.split('~')[1]} / ${classes.split('~')[0]}` },
        {value: mock.split('~')[0] === '0' ? 1 : classes.split('~')[0], label: `Weekly Tests Attendance • ${mock.split('~')[1]} / ${mock.split('~')[0]}` },
        {value: interview.split('~')[0] === '0' ? 1 : classes.split('~')[0], label: `Interviews Attendance • ${interview.split('~')[1]} / ${interview.split('~')[0]}`},
      ];

  return (
    <Box className="w-1/2 h-full flex items-center justify-center">
        <PieChart
        series={[
            {
              data,
              valueFormatter: (params,index) => {return `Out of ${runClasses[index.dataIndex].split('~')[0]} ${params.label.split(' ')[0]} Attended ${runClasses[index.dataIndex].split('~')[1]}`;},
              highlightScope: { faded: 'global', highlighted: 'item' },
              faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
            },
        ]}
        colors={['#02b2af','#2e96ff','#2731c8']}
        height={200}
        />
    </Box>
  )
}

export default PerformancePieChat;