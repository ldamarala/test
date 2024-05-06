import { Fragment, useState } from 'react';
import { useAuth } from '../../../context';
import {
  AiInterview,
  Job,
  JobApplication,
  Question,
} from '../../../api/models';
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
import JobApplicationRow from './JobApplicationRow';

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '50%',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

function JobRow(props: { key: string; job: Job }) {
  const { auth } = useAuth();
  const { key, job } = props;
  const [open, setOpen] = useState(false);
  const [jobApplications, setJobApplications] = useState([]);

  const fetchJobApplications = async (job: Job) => {
    if (auth && auth.accessToken) {
      const config = {
        headers: { Authorization: `Bearer ${auth.accessToken}` },
      };

      try {
        const response = await axios_job.get(
          formatString(API_PATHS.JOB_APPLICATION_BY_JOB_ID, job.id),
          config
        );

        setJobApplications(response.data);
      } catch (error) {}
    }
    setOpen(!open);
  };

  return (
    <Fragment>
      <TableRow key={key} sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => fetchJobApplications(job)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {job.title}
        </TableCell>
        <TableCell>
          {job.job_locations.split('|').map((l) => (
            <Typography variant="body2" align="left">
              {l}
            </Typography>
          ))}
        </TableCell>
        <TableCell>{job.recruiter?.username}</TableCell>
        <TableCell>{job.hiring_manager?.username}</TableCell>
        <TableCell align="center">{job.inactive ? 'Yes' : 'No'}</TableCell>
        <TableCell align="center">
          <Moment format="YYYY-MM-DD">{job.time_created}</Moment>
        </TableCell>
        <TableCell align="center">
          <Moment format="YYYY-MM-DD">{job.time_updated}</Moment>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={10}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            {jobApplications.length > 0 ? (
              <Stack sx={{ background: 'rgba(239, 243, 246, 1)', p: 2 }}>
                <Typography variant="h6" align="center" sx={{ p: 2 }}>
                  Job Applications: {job.title}
                </Typography>
                <TableContainer
                  component={Paper}
                  sx={{ maxHeight: 800, overflowX: 'scroll' }}>
                  <Table stickyHeader aria-label="collapsible table">
                    <TableHead>
                      <TableRow>
                        <TableCell align="center">Candidate Name</TableCell>
                        <TableCell align="center">Status</TableCell>
                        <TableCell align="center">AI Option</TableCell>
                        <TableCell align="center">Applied_On</TableCell>
                        <TableCell />
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {jobApplications.map((jobApplication) => (
                        <JobApplicationRow
                          key={jobApplication.id}
                          jobApplication={jobApplication}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Stack>
            ) : (
              <Box sx={{ margin: 1 }}>
                <Typography gutterBottom component="div" sx={{ margin: 5 }}>
                  Currently, we haven't received any applications for this job
                  posting. Feel free to reach out if you have any questions or
                  if you'd like more information.
                </Typography>
              </Box>
            )}
          </Collapse>
        </TableCell>
      </TableRow>
    </Fragment>
  );
}

export default JobRow;
