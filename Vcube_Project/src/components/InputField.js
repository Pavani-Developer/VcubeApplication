import React from 'react';
import { TextField } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-input': {
    fontSize: '20px',
    padding: '5px 0',
  },
  '& .MuiInputLabel-root': {
    fontSize: '20px',
  },
}));

const InputField = (props) => {
  return (
    < StyledTextField
      {...props}
      type="text"
      variant="standard"
    />
  );
};

export default InputField;

