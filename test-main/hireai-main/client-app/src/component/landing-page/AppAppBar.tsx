import { PaletteMode } from '@mui/material';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import ToggleColorMode from './ToggleColorMode';
import { useAuth } from '../../context';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
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

const logoStyle = {
  width: '140px',
  height: 'auto',
  cursor: 'pointer',
};

interface AppAppBarProps {
  mode: PaletteMode;
  toggleColorMode: () => void;
}

function AppAppBar({ mode, toggleColorMode }: AppAppBarProps) {
  const { auth, setAuth } = useAuth();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState<String>();

  const fetchCurrentUserDetails = async () => {
    if (auth && auth.accessToken) {
      const config = {
        headers: { Authorization: `Bearer ${auth.accessToken}` },
      };
      try {
        const response = await axios_auth.get(API_PATHS.AUTH_USER_ME, config);
        const user: User = response.data;
        if (user && user.username) {
          setIsLoggedIn(true);
          setUserName(user.firstname + ' ' + user.lastname);
        }
      } catch (error) {
        setIsLoggedIn(false);
        setUserName('');
        setAuth(null);
      }
      // else throw Error('Unauthorized');
    }
  };

  useEffect(() => {
    fetchCurrentUserDetails().catch((error) => {
      setIsLoggedIn(false);
    });
  }, []);

  useEffect(() => {
    if (auth) {
      setIsLoggedIn(true);
    }
  }, [auth]);

  const handleLogout = () => {
    setAuth(null);
    setIsLoggedIn(false);
    localStorage.setItem('auth', null);
    window.location.href = '/login';
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        boxShadow: 0,
        bgcolor: 'transparent',
        backgroundImage: 'none',
        mt: 4,
      }}>
      <Container maxWidth="lg">
        <Toolbar
          variant="regular"
          sx={(theme) => ({
            p: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            borderRadius: '16px',
            bgcolor:
              theme.palette.mode === 'light'
                ? 'rgba(255, 255, 255, 0.4)'
                : 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(24px)',
            maxHeight: 40,
            border: '1px solid',
            borderColor: 'divider',
            boxShadow:
              theme.palette.mode === 'light'
                ? `0 0 1px rgba(85, 166, 246, 0.1), 1px 1.5px 2px -1px rgba(85, 166, 246, 0.15), 4px 4px 12px -2.5px rgba(85, 166, 246, 0.15)`
                : '0 0 1px rgba(2, 31, 59, 0.7), 1px 1.5px 2px -1px rgba(2, 31, 59, 0.65), 4px 4px 12px -2.5px rgba(2, 31, 59, 0.65)',
          })}>
          <Box
            sx={{
              flexGrow: 1,
              display: 'flex',
              alignItems: 'center',
              ml: '-18px',
              px: 0,
            }}>
            <a href="/">
              <img src={process.env.PUBLIC_URL + '/img/logo.png'} alt="" />
            </a>
          </Box>
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              gap: 0.5,
              alignItems: 'center',
            }}>
            <ToggleColorMode mode={mode} toggleColorMode={toggleColorMode} />

            {isLoggedIn === true ? (
              <>
                <Button
                  color="primary"
                  variant="text"
                  size="small"
                  component="a">
                  Hi {userName}!
                </Button>
                <Button
                  color="primary"
                  variant="text"
                  size="small"
                  component="a"
                  onClick={handleLogout}>
                  Log Out
                </Button>
              </>
            ) : (
              <>
                <Button
                  color="primary"
                  variant="text"
                  size="small"
                  component="a"
                  href="/login">
                  Log in
                </Button>
                {/* <Button
                    color="primary"
                    variant="contained"
                    size="small"
                    component="a"
                    href="/signup">
                    Sign up
                  </Button> */}
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default AppAppBar;
