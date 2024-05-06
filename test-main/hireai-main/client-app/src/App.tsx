import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import SignIn from './pages/user-account/SignIn';
import SignUp from './pages/user-account/SignUp';
import CandidatePage from './pages/CandidatePage';
import { AuthProvider } from './context';
import JobDetailsPage from './pages/JobDetailsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AiInterviewPage from './pages/AiInterviewPage';
import PrivateRoute from './component/PrivateRoute';
import { Global, css } from '@emotion/react';
const GlobalStyles = () => (
  <Global
      styles={css`
    /* Apply global styles */
    body {
      font-family:Roboto;
    }
  `}
  />
);

function App() {
  return (
    <div className="apps" style={{fontFamily:'Roboto !important'}}>
      <GlobalStyles />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<CandidatePage />} />
            {/* <Route path="/" element={ <PrivateRoute><CandidatePage /></PrivateRoute> } /> */}

            <Route path="/job-details/:id" element={<JobDetailsPage />} />

            <Route
              path="/admin"
              element={
                <PrivateRoute>
                  <AdminDashboardPage />
                </PrivateRoute>
              }
            />
            <Route path="/login" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route
              path="/ai-interview/:ai_interview_id"
              element={
                <PrivateRoute>
                  <AiInterviewPage />
                </PrivateRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;
