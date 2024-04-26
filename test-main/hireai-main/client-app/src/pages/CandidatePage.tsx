import { useEffect, useState } from 'react';
import { useAuth } from '../context';
import { Container, PaletteMode, Tab, Tabs, Typography } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import JobSearch from '../component/job/JobSearch';
import Footer from '../component/landing-page/Footer';
import getLPTheme from './getLPTheme';
import JobList from '../component/job/JobList';
import AppAppBar from '../component/landing-page/AppAppBar';
import MyJobApplications from '../component/job-applications/MyJobApplications';
import {
  APP_HOST_BASE_PATH,
  AUTH_API_GATEWAY_HOST,
  JOB_API_GATEWAY_HOST,
  INTERVIEW_API_GATEWAY_HOST,
  STATIC_CONTENT_GATEWAY_HOST,
} from '../api/axios';

interface ToggleCustomThemeProps {
  showCustomTheme: Boolean;
  toggleCustomTheme: () => void;
}

function ToggleCustomTheme({
  showCustomTheme,
  toggleCustomTheme,
}: ToggleCustomThemeProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100dvw',
        position: 'fixed',
        bottom: 24,
      }}>
      <ToggleButtonGroup
        color="primary"
        exclusive
        value={showCustomTheme}
        onChange={toggleCustomTheme}
        aria-label="Platform"
        sx={{
          backgroundColor: 'background.default',
          '& .Mui-selected': {
            pointerEvents: 'none',
          },
        }}>
        <ToggleButton value>
          <AutoAwesomeRoundedIcon sx={{ fontSize: '20px', mr: 1 }} />
          Custom theme
        </ToggleButton>
        <ToggleButton value={false}>Material Design 2</ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}>
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function CandidatePage() {
  const { auth, setAuth } = useAuth();

  const [mode, setMode] = useState<PaletteMode>('light');
  const [showCustomTheme, setShowCustomTheme] = useState(true);

  const [searchkeywords,setSearchkeywords]=useState({
    searchkeyword:'',
    location:'',
  });
  
  const LPtheme = createTheme(getLPTheme(mode));
  const defaultTheme = createTheme({ palette: { mode } });

  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const toggleColorMode = () => {
    setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const toggleCustomTheme = () => {
    setShowCustomTheme((prev) => !prev);
  };
  

  const searchdata = (searchkeywords) => {
      setSearchkeywords(searchkeywords)
      console.log(searchkeywords)
  };

  return (
    <ThemeProvider theme={showCustomTheme ? LPtheme : defaultTheme}>
      <CssBaseline />
      <AppAppBar mode={mode} toggleColorMode={toggleColorMode} />
      <Container sx={{ bgcolor: 'background.default', py: { xs: 8, sm: 18 } }}>
        <JobSearch searchdata={searchdata}/>
        {auth && auth.accessToken ? (
          <>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={value} onChange={handleChange}>
                <Tab label="My Applications" {...a11yProps(0)} />
                <Tab label="Job Feed" {...a11yProps(1)} />
              </Tabs>
            </Box>
            <CustomTabPanel value={value} index={0}>
              <MyJobApplications />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={1}>
              <JobList filterdata={searchkeywords}/>
            </CustomTabPanel>
          </>
        ) : (
          <>
            <JobList filterdata={searchkeywords}/>
          </>
        )}
      </Container>
      <Divider />
      <Footer />
    </ThemeProvider>
  );
}
