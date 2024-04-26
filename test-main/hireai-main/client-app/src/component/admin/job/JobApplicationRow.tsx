import { Fragment, useEffect, useState } from 'react';
import { useAuth } from '../../../context';
import { AiInterview, JobApplication, Question } from '../../../api/models';
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
} from '../../../api/axios';
import {
  Alert,
  Box,
  Button,
  Card,
  CardMedia,
  Collapse,
  IconButton,
  Link,
  Modal,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Moment from 'react-moment';
import CollapseTextCard from './CollapseTextCard';
import JobApplicationDetailsModal from './modals/JobApplicationDetailsModal';

function JobApplicationRow(props: { jobApplication: any }) {
  const { auth } = useAuth();
  const { jobApplication } = props;
  // const [aiInterview, setAiInterview] = useState<AiInterview>();

  const [jobApplicationStatus, setJobApplicationStatus] = useState(
    jobApplication.status
  );

  return (
    <Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell align="center">
          {jobApplication.candidate.firstname +
            ' ' +
            jobApplication.candidate.lastname}
        </TableCell>
        <TableCell align="center">{jobApplicationStatus}</TableCell>
        <TableCell align="center">
          {jobApplication.ai_interview_optin ? 'Yes' : 'No'}
        </TableCell>
        <TableCell align="center">
          <Moment format="YYYY-MM-DD">{jobApplication.time_created}</Moment>
        </TableCell>
        <TableCell align="center">
          <Moment format="YYYY-MM-DD">{jobApplication.time_updated}</Moment>
        </TableCell>
        <TableCell align="center">
          <JobApplicationDetailsModal
            // aiInterview={aiInterview}
            jobApplication={jobApplication}
          />
        </TableCell>
      </TableRow>
    </Fragment>
  );
}

export default JobApplicationRow;
