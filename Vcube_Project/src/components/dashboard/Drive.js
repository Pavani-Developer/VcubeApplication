import React, { lazy, useEffect, useState } from 'react';
import { UserDetails } from '../UserDetails';
import { DateTime } from '../date-time';

const StorageVault = lazy(()=> import('./StorageVault'));
const DrivePin = lazy(()=> import('./DrivePin'));

const Drive = ({ isOpen, setIsOpen, handleShowSnackbar, setIsLoading }) => {
  const [isValidated, setIsValidated] = useState(false);
  const driveUser = UserDetails('Drive');

  useEffect(()=>{
    setIsValidated(driveUser && driveUser.Is_Validated && driveUser.Validated_Date === DateTime().split(' ')[0]);
  },[isValidated])

  return driveUser && isValidated && driveUser.Is_Validated && driveUser.Validated_Date === DateTime().split(' ')[0] ? 
    <StorageVault isOpen={isOpen} setIsOpen={setIsOpen} handleShowSnackbar={handleShowSnackbar} setIsLoading={setIsLoading}
                  isValidated={isValidated} driveUser={driveUser} /> :
    <DrivePin isOpen={isOpen} setIsOpen={setIsOpen} handleShowSnackbar={handleShowSnackbar} setIsLoading={setIsLoading} setIsValidated={setIsValidated} />
}

export default Drive;