import React, { lazy, Suspense, useContext, useEffect, useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/api/AuthContext';
import { StudentAuthProvider, useStudentAuth } from './components/api/StudentAuthContext';
import { ProtectedRoute, LoginRoute, PlacementsProtectedRoute } from './components/api/ProtectedRoute';
import { StudentProtectedRoute, StudentLoginRoute } from './components/api/StudentProtectedRoute';
import PageNotFound from './components/PageNotFound';
import LoadingSkeletonAlternate from './components/LoadingSkeletonAlternate';
import ExpiredPage from './components/ExpiredPage';
import { UsersAuthContext } from './components/api/UsersAuth';
import { StudentsAuthContext } from './components/api/StudentsAuth';
import { generateUniqueCode, isStdLogin, isUserLogin, UserDetails } from './components/UserDetails';
import { DateTime } from './components/date-time';

const LoginPage = lazy(() => import('./components/login/Index'));
const Dashboard = lazy(() => import('./components/dashboard/Index'));
const StudentInfo = lazy(() => import('./components/student-info/Index'));
const PlacementsDashboard = lazy(() => import('./components/Placements'));

const App = () => {
  const { stdAuth } = useContext(StudentsAuthContext);
  const { userAuth } = useContext(UsersAuthContext);
  const [uniqueURL, setUniqueURL] = useState('-');

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  useEffect(()=>{
    if(!sessionStorage.getItem('UniqueURL') && UserDetails('All') && 
      (isUserLogin() === (`True -> ${UserDetails('All').Username} -> ${DateTime().split(' ')[0]}`) || 
      isStdLogin() === (`True -> ${sessionStorage.getItem('StudentDetails_ID')} -> ${DateTime().split(' ')[0]}`))
    )generateUniqueCode();
    setUniqueURL(sessionStorage.getItem('UniqueURL') || '/4e5b8e23-1e8e-4e8b-83f4-74f6a4b7c8f2/');
  },[stdAuth, userAuth]);

  return (
    <Suspense fallback={<LoadingSkeletonAlternate />}>
      <AuthProvider>
        <StudentAuthProvider>
          <Router>
            <Routes>
              <Route path="/vcube/login" element={
                <LoginRoute>
                  <StudentLoginRoute>
                    <LoginPage />
                  </StudentLoginRoute>
                </LoginRoute>
              } />
              <Route path={`/vcube/dashboard/${uniqueURL.substring(0,30)}`} element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path={`/vcube/placements/dashboard/${uniqueURL.substring(30,60)}`} element={
                <PlacementsProtectedRoute>
                  <PlacementsDashboard />
                </PlacementsProtectedRoute>
              } />
              <Route path={`/vcube/student-info/${uniqueURL.substring(60,90)}`} element={
                <StudentProtectedRoute>
                  <StudentInfo />
                </StudentProtectedRoute>
              } />
              <Route path="*" element={<PageNotFound />} />
              <Route path={`/vcube/error/${uniqueURL.substring(30,70)}`} element={<ExpiredPage />} />
            </Routes>
          </Router>
        </StudentAuthProvider>
      </AuthProvider>
    </Suspense>
  );
};

export default App;
