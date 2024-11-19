import React from 'react';
import { Navigate } from 'react-router-dom';
import { useStudentAuth } from './StudentAuthContext';
import { useAuth } from './AuthContext';
import LoadingSkeletonAlternate from '../LoadingSkeletonAlternate';

export const StudentProtectedRoute = ({ children }) => {
    const { isStudentAuthenticated, isLoading } = useStudentAuth();
    const { isUserAuthenticated, isPlacementsAuthenticated } = useAuth();

    if (isLoading) {
        return <LoadingSkeletonAlternate />;
    }

    if (isStudentAuthenticated || isUserAuthenticated || isPlacementsAuthenticated) {
        return children;
    } else {
        return <Navigate to="/vcube/login" />;
    }
};

export const StudentLoginRoute = ({ children }) => {
    const uniqueURL = sessionStorage.getItem('UniqueURL') || '';
    const { isStudentAuthenticated, isLoading } = useStudentAuth();

    if (isLoading) {
        return <LoadingSkeletonAlternate />;
    }

    if (!isStudentAuthenticated) {
        return children;
    } else {
        return <Navigate to={`/vcube/student-info/${uniqueURL.substring(60,90)}`} />;
    }
};
