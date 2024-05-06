import { useEffect, useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
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
import { useAuth } from '../../../context';
import JobApplicationRow from './JobApplicationRow';

function JobApplicationsList() {
  const [jobApplications, setJobApplications] = useState([]);
  const { auth } = useAuth();
  const fetchJobApplications = async () => {
    if (auth.accessToken) {
      const config = {
        headers: { Authorization: `Bearer ${auth.accessToken}` },
      };

      const response = await axios_job.get(
        API_PATHS.JOB_APPLICATION_ALL,
        config
      );
      setJobApplications(response.data);
    }
  };

  useEffect(() => {
    fetchJobApplications();
  }, []);

  return (
    <div>
      <div className="job_listing_area">
        <div className="container">
          <div className="job_lists">
            <Typography
              variant="h4"
              gutterBottom
              component="div"
              sx={{ paddingLeft: 2 }}
              align="left">
              Job Applications
            </Typography>
            <TableContainer
              component={Paper}
              sx={{ maxHeight: 800, overflowX: 'scroll' }}>
              <Table stickyHeader aria-label="collapsible table">
                <TableHead>
                  <TableRow>
                    <TableCell />
                    <TableCell>Job Title</TableCell>
                    <TableCell>Candidate Name</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="center">AI Optin</TableCell>
                    <TableCell align="center">Created</TableCell>
                    <TableCell align="center">Updated</TableCell>
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default JobApplicationsList;
