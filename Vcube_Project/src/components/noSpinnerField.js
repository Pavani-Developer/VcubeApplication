import React from 'react';
import { TextField } from '@mui/material';
import { styled } from '@mui/material/styles';

const NoSpinnerTextField = styled(TextField)(({ theme }) => ({
  '& input[type="number"]::-webkit-inner-spin-button, & input[type="number"]::-webkit-outer-spin-button': {
    WebkitAppearance: 'none',
    margin: 0,
  },
  '& input[type="number"]': {
    MozAppearance: 'textfield',
  },
  '& .MuiInputBase-input': {
      fontSize: '20px',
      padding: '5px 0',
      },
      '& .MuiInputLabel-root': {
      fontSize: '20px',
    }
}));

const NumberInput = (props) => {
  return (
    <NoSpinnerTextField
        {...props}
        type="number"
        variant="standard"
    />
  );
};

export default NumberInput;
