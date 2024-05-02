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
import JobCard from './JobCard';
import { NoTransfer } from '@mui/icons-material';
import { config } from 'process';

export default function JobList({filterdata}) {
  const { auth } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [filteredData, setFilteredData] = useState(jobs);

  const fetchJobs = async () => {
    const config = {};
    const response = await axios_job.get(API_PATHS.JOB_ALL, config);
    let jobs_retrieved = response.data;
 
    setJobs(jobs_retrieved);
    setFilteredData(jobs_retrieved)
    console.log(jobs_retrieved)
  };

  useEffect(() => {
    fetchJobs();
  }, []);


  
  useEffect(() => {
    if (filterdata.searchkeyword.trim() !== '' && filterdata.location.trim() !== ''){
        console.log(filterdata)
        const searchkeyword = filterdata.searchkeyword.toLowerCase().trim();
        const searchlocation = filterdata.location.toLowerCase().trim();
      
        const filtered = jobs.filter(item =>
            item.title.toLowerCase().includes(searchkeyword) &&
            item.job_locations.toLowerCase().includes(searchlocation)
        );
        console.log(filtered)
        setFilteredData(filtered);
    } else {
        setFilteredData(jobs);
    }
}, [filterdata.searchkeyword,filterdata.location]);

    
  return (
    <Container id="job-list" sx={{ width: '90%', py: { xs: 8, sm: 2 } }}>
      <Grid item xs={12} md={6}>
        <Stack
          direction="column"
          justifyContent="center"
          alignItems="flex-start"
          spacing={2}
          useFlexGap
          sx={{ width: '100%', display: { xs: 'none', sm: 'flex' } }}>
          {filteredData.map((j) => (
            <JobCard key={j.id} jobDetails={j} />
          ))}
        </Stack>
      </Grid>
    </Container>
  );
}