import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { LoginProvider } from './components/api/login';
import { BatchProvider } from './components/api/batch';
import { StudentsProvider } from './components/api/students';
import { SendMailProvider } from './components/api/SendMail';
import { CourseProvider } from './components/api/Course';
import BatchAttendanceProvider from './components/api/batch-attendance';
import MySnackbarProvider from './components/SnackBarProvider';
import { AssessmentProvider } from './components/api/Assessment';
import { FeedbackProvider } from './components/api/Feedback';
import PlacementsProvider from './components/api/Placements';
import ExecuteCodeProvider from './components/api/ExecuteCode';
import { UserGoogleProvider } from './components/api/Google';
import { UsersAuthProvider } from './components/api/UsersAuth';
import { StudentsAuthProvider } from './components/api/StudentsAuth';
import { WindowResize } from './components/WindowResize';
import ErrorBoundary from './components/api/ErrorBoundary';
import OfflineProvider from './components/api/Offline';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <OfflineProvider>
    <SendMailProvider>
      <ErrorBoundary>
        <Suspense>
          <MySnackbarProvider>
              <CourseProvider>
                <BatchProvider>
                    <BatchAttendanceProvider>
                      <AssessmentProvider>
                        <LoginProvider>
                          <StudentsProvider>
                            <PlacementsProvider>
                              <FeedbackProvider>
                                <ExecuteCodeProvider>
                                  <UserGoogleProvider>
                                    <UsersAuthProvider>
                                      <StudentsAuthProvider>
                                        <WindowResize>
                                          <App />
                                        </WindowResize>
                                      </StudentsAuthProvider>
                                    </UsersAuthProvider>
                                  </UserGoogleProvider>
                                </ExecuteCodeProvider>
                              </FeedbackProvider>
                            </PlacementsProvider>
                          </StudentsProvider>
                        </LoginProvider>
                      </AssessmentProvider>
                    </BatchAttendanceProvider>
                </BatchProvider>
              </CourseProvider>
          </MySnackbarProvider>
        </Suspense>
      </ErrorBoundary>
    </SendMailProvider>
    </OfflineProvider>
  </React.StrictMode>
);

reportWebVitals();
