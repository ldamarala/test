
import * as React from 'react';
import { useEffect, useState } from 'react';
import {
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  alpha,
} from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
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
import { useAuth } from '../../context';




export default function JobApplicationsearch(props) {
  const { auth } = useAuth();
  const [keyword, setKeyword] = React.useState('');
  const [location, setLocation] = React.useState('');
  const [jobApplications, setJobApplications] = useState([]);
  const [locations, setLocations] = useState([])
  const submitteddata = {
    searchkeyword: keyword,
    location: location,
  }

  const changekeyword = (event) => {
    setKeyword(event.target.value)
  };

  const Changelocation = (event) => {
    setLocation(event.target.value)
  };


  const handlesubmit = () => {
    props.searchapplicationdata(submitteddata)
  };

  useEffect(() => {
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

        const uniqueLocations = [""];
        jobApplications.map((item) => {
          (item.job.job_locations).split(",").forEach((element => {
            if (!(element in uniqueLocations)) {
              uniqueLocations.push(element)
            }
          }));
        })
        setLocations(uniqueLocations);
      }
    };
    fetchMyJobApplications();
  })

  return (
    <Container id="job-search">
      <Box
        sx={(theme) => ({
          width: '100%',
          backgroundRepeat: 'no-repeat',
          pt: { xs: 5, sm: 5 },
          pb: { xs: 5, sm: 5 },
          marginBottom: 10,
          marginTop: 10
        })}>
        <Container
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            border: 1,
            p: 0,
            pt: 2,
            pb: 2,
            borderColor: 'grey.500',
            borderRadius: '16px',
          }}>
          <Grid
            container
            direction="row"
            justifyContent="space-evenly"
            alignItems="flex-start">
            <Grid item xs={4}>
              <FormControl fullWidth>
                <TextField
                  id="outlined-basic"
                  label="Search keyword"
                  variant="standard"
                  sx={{ p: 2, px: 0 }}
                  value={keyword}
                  onChange={changekeyword}
                />
              </FormControl>
            </Grid>
            <Grid item xs={2}>
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Location</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  onChange={Changelocation}
                  value={location}
                  label="Location">
                  {locations.map((loc, index) => (
                    <MenuItem key={index} value={loc}>{loc}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item sx={{ p: 1 }}>
              <Button sx={{ p: 2.5, px: 4, pr: 4 }} variant="contained" onClick={handlesubmit}>
                Find Application
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Container>
  );
}
