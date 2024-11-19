import React from 'react';
import { SnackbarProvider } from 'notistack';

const MySnackbarProvider = ({ children }) => {
  return <SnackbarProvider maxSnack={3}>{children}</SnackbarProvider>;
};

export default MySnackbarProvider;