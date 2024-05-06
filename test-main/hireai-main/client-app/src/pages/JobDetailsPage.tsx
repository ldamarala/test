import React, { useState } from 'react';
import { Container, PaletteMode } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import JobSearch from '../component/job/JobSearch';
import Footer from '../component/landing-page/Footer';
import getLPTheme from './getLPTheme';
import AppAppBar from '../component/landing-page/AppAppBar';
import { useAuth } from '../context';
import { useNavigate, useParams } from 'react-router-dom';
import { Job, JobApplication } from '../api/models';
import {
  axios_auth,
  axios_job,
  axios_ai_interview,
  APP_HOST_BASE_PATH,
  AUTH_API_GATEWAY_HOST,
  JOB_API_GATEWAY_HOST,
  INTERVIEW_API_GATEWAY_HOST,
  STATIC_CONTENT_GATEWAY_HOST,
  API_PATHS,
  formatString,
} from '../api/axios';
import JobDetails from '../component/job/JobDetails';

interface ToggleCustomThemeProps {
  showCustomTheme: Boolean;
  toggleCustomTheme: () => void;
}

function ToggleCustomTheme({
  showCustomTheme,
  toggleCustomTheme,
}: ToggleCustomThemeProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100dvw',
        position: 'fixed',
        bottom: 24,
      }}>
      <ToggleButtonGroup
        color="primary"
        exclusive
        value={showCustomTheme}
        onChange={toggleCustomTheme}
        aria-label="Platform"
        sx={{
          backgroundColor: 'background.default',
          '& .Mui-selected': {
            pointerEvents: 'none',
          },
        }}>
        <ToggleButton value>
          <AutoAwesomeRoundedIcon sx={{ fontSize: '20px', mr: 1 }} />
          Custom theme
        </ToggleButton>
        <ToggleButton value={false}>Material Design 2</ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
}

function JobDetailsHeader(props: { jobDetails: Job }) {
  const { jobDetails } = props;

  return (
    <div className="job_details_header">
      <div className="single_jobs white-bg d-flex justify-content-between">
        <div className="jobs_left d-flex align-items-center">
          <div className="thumb">
            <img src="img/svg_icon/1.svg" alt="" />
          </div>
          <div className="jobs_conetent">
            <a href="#">
              <h4>{jobDetails?.title}</h4>
            </a>
            <div className="links_locat d-flex align-items-center">
              <div className="location">
                <p>
                  {' '}
                  <i className="fa fa-map-marker"></i>{' '}
                  {jobDetails?.job_locations}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function JobDetailsContent(props: { jobDetails: Job }) {
  const { jobDetails } = props;

  return (
    <div className="descript_wrap white-bg">
      {/* {jobDetails?.description} */}
      <div className="single_wrap left">
        <h4>Summary</h4>
        <p dangerouslySetInnerHTML={{ __html: jobDetails?.summary }} />
      </div>
      <div className="single_wrap left">
        <h4>Requirements</h4>
        <p dangerouslySetInnerHTML={{ __html: jobDetails?.requirements }} />
      </div>
      <div className="single_wrap left">
        <h4>Responsibility</h4>
        <p
          dangerouslySetInnerHTML={{
            __html: jobDetails?.responsibilities,
          }}
        />
      </div>
      <div className="single_wrap left">
        <h4>Key Competencies</h4>
        <p
          dangerouslySetInnerHTML={{
            __html: jobDetails?.key_competencies,
          }}
        />
      </div>
      <div className="single_wrap left">
        <h4>Qualifications</h4>
        <p
          dangerouslySetInnerHTML={{
            __html: jobDetails?.qualifications,
          }}
        />
      </div>
    </div>
  );
}

function JobSummary(props: { jobDetails: Job }) {
  const { jobDetails } = props;

  return (
    <div className="job_sumary">
      <div className="summery_header">
        <h3>Job Summery</h3>
      </div>
      <div className="job_content">
        <ul>
          <li>
            Published on:
            <span> {new Date(jobDetails?.time_created).toDateString()}</span>
          </li>
          <li>
            Vacancy: <span>2 Position</span>
          </li>
          <li>
            Salary: <span>50k - 120k/y</span>
          </li>
          <li>
            Location: <span>California, USA</span>
          </li>
          <li>
            Job Nature: <span> Full-time</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

function JobShare(props: { jobDetails: Job }) {
  const { jobDetails } = props;

  return (
    <div className="share_wrap d-flex">
      <span>Share at:</span>
      <ul>
        <li>
          <a href="#">
            {' '}
            <i className="fa fa-facebook"></i>
          </a>{' '}
        </li>
        <li>
          <a href="#">
            {' '}
            <i className="fa fa-google-plus"></i>
          </a>{' '}
        </li>
        <li>
          <a href="#">
            {' '}
            <i className="fa fa-twitter"></i>
          </a>{' '}
        </li>
        <li>
          <a href="#">
            {' '}
            <i className="fa fa-envelope"></i>
          </a>{' '}
        </li>
      </ul>
    </div>
  );
}

export default function JobDetailsPage() {
  const [mode, setMode] = React.useState<PaletteMode>('light');
  const [showCustomTheme, setShowCustomTheme] = React.useState(true);
  const LPtheme = createTheme(getLPTheme(mode));
  const defaultTheme = createTheme({ palette: { mode } });

  const toggleColorMode = () => {
    setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const toggleCustomTheme = () => {
    setShowCustomTheme((prev) => !prev);
  };

  const { auth } = useAuth();
  const navigate = useNavigate();
  const params = useParams();

  const [jobDetails, setJobDetails] = useState<Job>();
  const [jobApplication, setJobApplication] = useState<JobApplication>();

  const [file, setFile] = useState();

  const [aiOptIn, setAiOptIn] = useState(true);

  function handleChange(e) {
    setFile(e.target.files[0]);
  }

  function handleAiOptInClick(e) {
    setAiOptIn(e.target.checked);
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('ai_interview_optin', aiOptIn ? 'true' : 'false');
    if (auth && auth.accessToken) {
      const config = {
        headers: {
          'content-type': 'multipart/form-data',
          Authorization: `Bearer ${auth.accessToken}`,
        },
      };

      const response = await axios_job.post(
        formatString(API_PATHS.JOB_APPLICATION_BY_JOB_ID, jobDetails.id),
        formData,
        config
      );
      setJobApplication(response.data as JobApplication);
    }
  };

  return (
    <ThemeProvider theme={showCustomTheme ? LPtheme : defaultTheme}>
      <CssBaseline />
      <AppAppBar mode={mode} toggleColorMode={toggleColorMode} />
      <Container
        sx={{
          bgcolor: 'background.default',
          py: { xs: 8, sm: 18 },
        }}>
        <JobSearch />

        {/* <>{JSON.stringify(jobDetails)}</>
        <>{JSON.stringify(jobApplication)}</> */}
        <JobDetails />
      </Container>
      <Divider />
      <Footer />
    </ThemeProvider>
  );
}
