import * as React from 'react';
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
import Typography from '@mui/material/Typography';
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
import { isTemplateExpression } from 'typescript';
import { unix } from 'moment';




export default function JobSearch(props) {
  const [keyword, setKeyword] = React.useState('');
  const [location, setLocation] = React.useState('');

  const submitteddata= {
    searchkeyword:keyword,
    location:location,
  }

  const changekeyword = (event) => {
    setKeyword(event.target.value)
  };

  const Changelocation = (event) => {
    setLocation(event.target.value)
  };

  
  const handlesubmit = () =>{
     props.searchdata(submitteddata)
  };

  const { auth } = useAuth();
  const [jobs, setJobs] = React.useState([]);
  const [locations,setLocations]=React.useState([])

  const fetchJobs = async () => {
    const config = {};
    const response = await axios_job.get(API_PATHS.JOB_ALL, config);
    let jobs_retrieved = response.data;
 
    setJobs(jobs_retrieved);
    console.log(jobs_retrieved)
    const uniqueLocations = [];
    jobs_retrieved.map((item)=>{
      (item.job_locations).split(",").forEach((element => {
          if (! (element in uniqueLocations)){ 
          uniqueLocations.push(element)}
          console.log(uniqueLocations)
       }));
    })
    setLocations(uniqueLocations);
  };

 
  React.useEffect(() => {
    fetchJobs();
  }, []);

  return (
    <Container id="job-search">
      <Box
        sx={(theme) => ({
          width: '100%',
          fontFamily:"inherit",
          // backgroundImage:
          //   theme.palette.mode === 'light'
          //     ? 'linear-gradient(180deg, #CEE5FD, #FFF)'
          //     : `linear-gradient(#02294F, ${alpha('#090E10', 0.0)})`,
          // backgroundSize: '100% 20%',
          backgroundRepeat: 'no-repeat',
          pt: { xs: 5, sm: 5 },
          pb: { xs: 5, sm: 5 },
          marginBottom:10,
          marginTop:10
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
                  {/* <MenuItem value={'NY'}>New York</MenuItem>
                  <MenuItem value={'PIT'}>Pittsburgh</MenuItem>
                  <MenuItem value={'SEA'}>Seattle</MenuItem> */}
                </Select>
              </FormControl>
            </Grid>
            {/* <Grid item xs={2}>
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Category</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={category}
                  onChange={Changecategory}
                  label="Category">
                  <MenuItem value={'HR'}>HR</MenuItem>
                  <MenuItem value={'Finance'}>Finance</MenuItem>
                  <MenuItem value={'Sales'}>Sales</MenuItem>
                </Select>
              </FormControl>
            </Grid> */}
            <Grid item sx={{ p: 1 }}>
              <Button sx={{ p: 2.5, px: 4, pr: 4 }} variant="contained" onClick={handlesubmit}>
                Find Job
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Container>
  );
}