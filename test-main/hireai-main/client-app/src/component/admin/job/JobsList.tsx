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
import { Job } from '../../../api/models';
import JobRow from './JobRow';
import { Card, Divider } from '@mui/material';

function JobsList() {
  const [jobs, setJobs] = useState([]);
  const { auth } = useAuth();
  const fetchJobs = async () => {
    if (auth && auth.accessToken) {
      const config = {
        headers: { Authorization: `Bearer ${auth.accessToken}` },
      };

      const response = await axios_job.get(API_PATHS.ADMIN_JOB_ALL, config);

      setJobs(response.data);
    }
  };

  useEffect(() => {
    fetchJobs();
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
              Jobs
            </Typography>
            <TableContainer
              component={Paper}
              sx={{ maxHeight: 800, overflowX: 'scroll' }}>
              <Table stickyHeader aria-label="collapsible table">
                <TableHead>
                  <TableRow>
                    <TableCell />
                    <TableCell>Job Title</TableCell>
                    <TableCell>Locations</TableCell>
                    <TableCell>Recruiter</TableCell>
                    <TableCell>Hiring Manager</TableCell>
                    <TableCell align="center">Active</TableCell>
                    <TableCell align="center">Created</TableCell>
                    <TableCell align="center">Updated</TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {jobs.map((j) => (
                    <JobRow key={j.id} job={j} />
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

export default JobsList;
