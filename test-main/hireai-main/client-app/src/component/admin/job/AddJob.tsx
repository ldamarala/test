import React, { useState } from 'react'
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { User } from '../../../api/models';
import { useAuth } from '../../../context';
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
import { Job } from '../../../api/models';
const defaultTheme = createTheme();


interface TokenResponse {
    access_token: string;
    refresh_token: string;
  }


export default function AddJob(){
    const { auth } = useAuth(); 
    const [data,setData] = useState({ 
      title: '',
      summary: '',
      responsibilities: '',
      qualifications: '',
      requirements: '',
      key_competencies: '',
      job_locations:'',
      salary: '',
      open_positions:'',
      job_nature: '',
      inactive: '',
     } )
    

    const handletitle = (e) =>{
      setData(data => ({...data, title: e.target.value}))
    }
    const handlelocations = (e) =>{
      setData(data => ({...data, job_locations: e.target.value}))
    }
    
    const handlepositions = (e) =>{
      setData(data => ({...data, open_positions: e.target.value}))
    }
    
    const handlesalary = (e) =>{
      setData(data => ({...data, salary: e.target.value}))
    }
    const handlejobnature = (e) =>{
      setData(data => ({...data, job_nature: e.target.value}))
    }
    const handleresponsibilities = (e) =>{
      setData(data => ({...data, responsibilities: e.target.value}))
    }
    const handlerequirements = (e) =>{
      setData(data => ({...data, requirements: e.target.value}))
    }
    const handlequalificatinos = (e) =>{
      setData(data => ({...data, qualifications: e.target.value}))
    }
    const handlesummary= (e) =>{
      setData(data => ({...data, summary: e.target.value}))
    }

    const handlekeycompenticies = (e) =>{
      setData(data => ({...data, key_competencies: e.target.value}))
    }
    // const handlehiringmanagerid = (e) =>{
    //   setData(data => ({...data, hiring_manager_id: e.target.value}))
    // }
    // const handlerecruiterid = (e) =>{
    //   setData(data => ({...data, recruiter_id: e.target.value}))
    // }
    const handleinactive = (e) =>{
      setData(data => ({...data, inactive: e.target.value}))
    }
    const handlejob_nature = (e) =>{
      setData(data => ({...data, job_nature: e.target.value}))
    }
  

   

    const handleSubmit = async (event) => {
        
        event.preventDefault();
        if (auth && auth.accessToken) {
            const config = {
              headers: {
               
                 Authorization: `Bearer ${auth.accessToken}`,
              },
            };
      
            try {
              const response = await axios_job.post(
                API_PATHS.JOB_CREATE,
                data,
                config
              );
            //   setJobApplication(response.data as JobApplication);
            } catch (error) {
              // SHow error message
            }
            // setHaveUserAppliedForJob(true);
          }
      };
    
    return(
        <ThemeProvider theme={defaultTheme}>
        <Container component="main" >
          <CssBaseline />
          <Box
            sx={{
              marginTop: 0,
              display: 'flex',
              flexDirection: 'column',
             
            }}>
            <Box
              component="form"
              noValidate
              sx={{ mt: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} >
                  <TextField
                    name="jobtitle"
                    value={data.title}
                    required
                    fullWidth
                    id="jobtitle"
                    label="Job Title"
                    type='string'
                    onChange={handletitle} 
                    autoFocus
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    id="locations"
                    value={data.job_locations}
                    label="Locations"
                    name="locations"
                    type='string'
                    onChange={handlelocations} 
                    // value={sname}
                   
                    // onChange={handlesname}
                  />
                </Grid>
                <Grid item xs={4} sm={4} >
                  <TextField
                    name="openpositions"
                    value={data.open_positions}
                    required
                    fullWidth
                    id="openpositions"
                    label="Open_Positions"
                    type='string'
                    onChange={handlepositions} 
                    autoFocus
                  />
                </Grid>
                <Grid item xs={4} sm={4}>
                  <TextField
                    required
                    value={data.salary}
                    fullWidth
                    id="salary"
                    label="Salary"
                    name="salary"
                    type='string'
                    onChange={handlesalary} 
                    // value={sname}
                   
                    // onChange={handlesname}
                  />
                </Grid>
                <Grid item xs={4} sm={4}>
                  <TextField
                    required
                    value={data.job_nature}
                    fullWidth
                    id="job_nature"
                    label="Job_Nature"
                    name="job_nature"
                    type='job_nature'
                    onChange={handlejobnature} 
                    // value={sname}
                   
                    // onChange={handlesname}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    autoComplete="given-name"
                    name="summary"
                    value={data.summary}
                    required
                    fullWidth
                    id="summary"
                    type='string'
                    label="Job Summary"
                    onChange={handlesummary} 
                    // onChange={handleuname}
                    autoFocus
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    value={data.responsibilities}
                    id="responsibilities"
                    label="Responsibities"
                    name="responsibities"
                    type='text'
                    onChange={handleresponsibilities} 
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    value={data.qualifications}
                    name="qualications"
                    label="Qualifications"
                    type="string"
                    id="qualifications"
                    onChange={handlequalificatinos} 
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    value={data.requirements}
                    fullWidth
                    name="requirements"
                    label="Requirements"
                    type="text"
                    id="requirements"
                    onChange={handlerequirements} 
                                     />
                </Grid>
                <Grid item xs={12}>
                <TextField
                    required
                    fullWidth
                    value={data.key_competencies}
                    name="key_compenticies"
                    label="Key_Compenticies"
                    type="string"
                    id="key_compenticies"
                    onChange={handlekeycompenticies} 
                                     />
                </Grid>
                <Grid item xs={4}>
                <TextField
                    required
                    fullWidth
                    value={data.inactive}
                    name="inactive"
                    label="In_Active"
                    type="string"
                    id="inactive"
                    onChange={handleinactive} 
                                     />
                </Grid>
              
              </Grid>
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                onClick={handleSubmit}>
                Add Job
              </Button>
             
            </Box>
          </Box>
         
        </Container>
      </ThemeProvider>
    )
}