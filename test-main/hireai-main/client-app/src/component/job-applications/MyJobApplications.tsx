import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import DevicesRoundedIcon from '@mui/icons-material/DevicesRounded';
import EdgesensorHighRoundedIcon from '@mui/icons-material/EdgesensorHighRounded';
import ViewQuiltRoundedIcon from '@mui/icons-material/ViewQuiltRounded';
import { useAuth } from '../../context';
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
} from '../../api/axios';
import { Job, JobApplication } from '../../api/models';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import Moment from 'react-moment';

export default function MyJobApplications({filterdata}) {
  const { auth } = useAuth();
  const [jobApplications, setJobApplications] = useState([]);
  const [filtereddata,setFilteredData]=useState([])
  const fetchMyJobApplications = async () => {
    if (auth && auth.accessToken) {
      const config = {
        headers: { Authorization: `Bearer ${auth.accessToken}` },
      };
      const response = await axios_job.get(
        formatString(API_PATHS.JOB_APPLICATION_BY_CANDIDATE_ID, auth.id),
        config
      );
      let jobs_applications_retrieved = response.data;
      setJobApplications(jobs_applications_retrieved);
      setFilteredData(jobs_applications_retrieved)
    }
  };
  
  useEffect(() => {
    fetchMyJobApplications();
  }, []);

  useEffect(() => {
      if (filterdata.searchkeyword.trim() !== '' && filterdata.location.trim() !== ''){
          console.log(filterdata)
          const searchkeyword = filterdata.searchkeyword.toLowerCase().trim();
          const searchlocation = filterdata.location.toLowerCase().trim();
        
          const filtered = jobApplications.filter(item =>
              item.job.title.toLowerCase().includes(searchkeyword) &&
              item.job.job_locations.toLowerCase().includes(searchlocation)
          );
          console.log(filtered)
          setFilteredData(filtered);
      } else {
          setFilteredData(jobApplications);
      }
  }, [filterdata]);

  return (
    <Container id="job-list" sx={{ width: '90%', py: { xs: 8, sm: 2 } }}>
      <Grid item xs={12} md={6}>
        <Stack
          direction="column"
          justifyContent="center"
          alignItems="flex-start"
          spacing={2}
          useFlexGap
          sx={{ width: '100%', display: { xs: 'none', sm: 'flex' } }}></Stack>
        {jobApplications.length === 0 ? (
          <Typography component="div">
            <Box sx={{ textAlign: 'justify', m: 1, fontSize: 18 }}>
              It looks like you haven't applied for any jobs yet. To explore
              available job opportunities, simply click on the 'Job Feed' tab to
              view the list of available positions.
            </Box>
          </Typography>
        ) : (
          <>
            <TableContainer
              component={Paper}
              sx={{ maxHeight: 800, overflowX: 'scroll' }}>
              <Table stickyHeader aria-label="collapsible table">
                <TableHead>
                  <TableRow>
                    <TableCell align="left">Job Title</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="center">AI Option</TableCell>
                    <TableCell align="center">Created</TableCell>
                    <TableCell align="center">Applied On</TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtereddata.map((jobApplication) => (
                    <TableRow
                       key={jobApplication.id}
                       sx={{
                        '& > *': { borderBottom: 'unset' },
                        backgroundColor: 'background.paper',
                      }}>
                      <TableCell component="th" scope="row">
                        {jobApplication.job.title}
                      </TableCell>
                      <TableCell align="center">
                        {jobApplication.status}
                      </TableCell>
                      <TableCell align="center">
                        {jobApplication.ai_interview_optin ? 'Yes' : 'No'}
                      </TableCell>
                      <TableCell align="center">
                        <Moment format="DD-MM-YYYY">
                          {jobApplication.job.time_created}
                        </Moment>
                      </TableCell>
                      <TableCell align="center">
                        <Moment format="DD-MM-YYYY">
                          {jobApplication.time_created}
                        </Moment>
                      </TableCell>
                      <TableCell align="center">
                        {jobApplication?.interview_link ? (
                          <>
                            <Link href={jobApplication.interview_link}>
                              AI Interview
                            </Link>
                          </>
                        ) : (
                          <></>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </Grid>
    </Container>
  );
}
