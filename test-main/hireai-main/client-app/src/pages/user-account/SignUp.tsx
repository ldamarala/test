import * as React from 'react';
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
import Modal from '@mui/material/Modal';
import SignIn from './SignIn';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import axios from 'axios';
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
import { User } from '../../api/models';

function Copyright(props: any) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}>
      {'Copyright © '}
      <Link color="inherit" href="https://mui.com/">
        Hire.Ai
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}
interface TokenResponse {
  access_token: string;
  refresh_token: string;
 }
// TODO remove, this demo shouldn't need to reset the theme.
const defaultTheme = createTheme();

export default function SignUp() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false)
  const [fname,setFname]=useState('')
  const [sname,setSname]=useState('')
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  //....//
  const formdata = {
    firstname:fname,
    lastname:sname,
    email:email,
    password:password

  }


  const handlefname =(e)=>{
     setFname(e.target.value)
  }

  const handlesname =(e)=>{
    setSname(e.target.value)
  }

  const handlemail=(e)=>{
    setEmail(e.target.value)
  }

  const handlepassword=(e)=>{
    setPassword(e.target.value)
  }


  const handleSubmit = async (event) => {
    setLoading(true)
    event.preventDefault();
    try {
     const user_response = await axios_auth.post(
       API_PATHS.AUTH_NEW_USER,
       formdata,
   
     );
     const user = user_response.data as User;
     
    //  #navigates to candidate page
     navigate('/');
     } 
    catch {

    }
    // //write code to push userdata to database
    // const data = new FormData(event.currentTarget);
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  };


  return (
    <ThemeProvider theme={defaultTheme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign up
          </Typography>
          <Box
            component="form"
            noValidate
            onSubmit={handleSubmit}
            sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  autoComplete="given-name"
                  name="firstName"
                  required
                  fullWidth
                  id="firstName"
                  label="First Name"
                  onChange={handlefname}
                  autoFocus
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="lastName"
                  label="Last Name"
                  name="lastName"
                  autoComplete="family-name"
                  onChange={handlesname}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  onChange={handlemail}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  onChange={handlepassword}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox value="allowExtraEmails" color="primary" />
                  }
                  label="I want to receive inspiration, marketing promotions and updates via email."
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}>
              Sign Up <ClipLoader color="#fffff" size='15px' loading={loading} />
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link href="login" variant="body2">
                  Already have an account? Sign in
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
        <Copyright sx={{ mt: 5 }} />
      </Container>
    </ThemeProvider>
  );
}



