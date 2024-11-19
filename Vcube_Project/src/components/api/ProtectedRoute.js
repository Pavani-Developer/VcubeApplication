import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export const ProtectedRoute = ({ children }) => {
    const { isUserAuthenticated } = useAuth();
    return isUserAuthenticated ? children : <Navigate to="/vcube/login" />;
};

export const PlacementsProtectedRoute = ({ children }) => {
    const { isUserAuthenticated, isPlacementsAuthenticated } = useAuth();
    return (isPlacementsAuthenticated || isUserAuthenticated) ? children : <Navigate to="/vcube/login" />;
};

export const LoginRoute = ({ children }) => {
    const uniqueURL = sessionStorage.getItem('UniqueURL') || '';
    const { isUserAuthenticated, isPlacementsAuthenticated } = useAuth();

    if(!isUserAuthenticated && !isPlacementsAuthenticated){
        return children;

    }else if(isUserAuthenticated){
        return <Navigate to={`/vcube/dashboard/${uniqueURL.substring(0,30)}`} />;

    }else if(isPlacementsAuthenticated){
        return <Navigate to={`/vcube/placements/dashboard/${uniqueURL.substring(30,60)}`} />;
    }
};
