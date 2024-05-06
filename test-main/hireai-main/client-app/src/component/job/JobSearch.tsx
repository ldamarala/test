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

  return (
    <Container id="job-search">
      <Box
        sx={(theme) => ({
          width: '100%',

          // backgroundImage:
          //   theme.palette.mode === 'light'
          //     ? 'linear-gradient(180deg, #CEE5FD, #FFF)'
          //     : `linear-gradient(#02294F, ${alpha('#090E10', 0.0)})`,
          // backgroundSize: '100% 20%',
          backgroundRepeat: 'no-repeat',
          pt: { xs: 14, sm: 5 },
          pb: { xs: 8, sm: 5 },
        })}>
        <Container
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            border: 1,
            p: 0,
            pt: 6,
            pb: 5,
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
                  <MenuItem value={'NY'}>New York</MenuItem>
                  <MenuItem value={'PIT'}>Pittsburgh</MenuItem>
                  <MenuItem value={'SEA'}>Seattle</MenuItem>
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
