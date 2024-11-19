import React, { useEffect, useState } from 'react';
import {
  GaugeContainer,
  GaugeValueArc,
  GaugeReferenceArc,
  useGaugeState,
} from '@mui/x-charts';
import { Box, Typography } from '@mui/material';

export const GaugeChart = ({ Guagevalue }) => {
  const [value, setValue] = useState(0);

  useEffect(()=>{
    for(let i = 0; i <= Guagevalue; i++){
      setTimeout(()=>{
        setValue(i)
      }, 15 * i)
    };
  },[Guagevalue])


  const getColor = (value <= 35) ? "red" : (value > 35 && value <= 50) ? "gold" : (value > 50 && value <= 75) ? "orange" : "green";
  const performance_name = (value <= 35) ? "Poor" : (value > 35 && value <= 50) ? "Average" : (value > 50 && value <= 75) ? "Good" : "Excellent";

  const GaugePointer = () => {
    const { valueAngle, outerRadius, cx, cy } = useGaugeState();
  
    if (valueAngle === null) {
      return null;
    }
  
    const target = {
      x: cx + outerRadius * Math.sin(valueAngle),
      y: cy - outerRadius * Math.cos(valueAngle),
    };
    return (
      <g>
        <circle cx={cx} cy={cy} r={5} fill={getColor} />
        <path
          d={`M ${cx} ${cy} L ${target.x} ${target.y}`}
          stroke={getColor}
          strokeWidth={3}
        />
      </g>
    );
  }

  return (
    <Box className='w-1/2 relative h-64 mb-5 flex flex-col items-center'>
    <GaugeContainer
      width={250}
      height={250}
      startAngle={-110}
      endAngle={110}
      value={value}
    >
      <GaugeReferenceArc />
      <GaugeValueArc />
      <GaugePointer />
    </GaugeContainer>
    <Box className="absolute bottom-14 left-0 w-full">
      <Typography variant='h5' className='text-center w-full' sx={{fontWeight : 'bold', color : `${getColor}`}}>{performance_name}</Typography>
    </Box>
    <Typography variant='h5'>Overall Performance: <strong style={{color : `${getColor}`}}>{value < 10 ? `0${value}` : value}%</strong></Typography>
    </Box>
  );
}
