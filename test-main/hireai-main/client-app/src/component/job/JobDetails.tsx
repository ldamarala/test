import React, { useEffect, useState } from 'react';
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
import { useNavigate, useParams } from 'react-router-dom';
import { CardMedia, Checkbox, Divider, TextField } from '@mui/material';
import { AiInterview, Job, JobApplication, User } from '../../api/models';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import DevicesRoundedIcon from '@mui/icons-material/DevicesRounded';
import EdgesensorHighRoundedIcon from '@mui/icons-material/EdgesensorHighRounded';
import ViewQuiltRoundedIcon from '@mui/icons-material/ViewQuiltRounded';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';
import { isDisabled } from '@testing-library/user-event/dist/utils';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

export default function JobDetails() {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const params = useParams();
  const  [isDisabled,setIsDisabled]=useState(false)
  const [jobDetails, setJobDetails] = useState<Job>();
  const [jobApplication, setJobApplication] = useState<JobApplication>(null);

  const [file, setFile] = useState();

  const [aiOptIn, setAiOptIn] = useState(true);

  function handleFileChange(e) {
    setIsDisabled(true)
    setFile(e.target.files[0]);
  }

  function handleAiOptInClick(e) {
    setAiOptIn(e.target.checked);
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('ai_interview_optin', aiOptIn ? 'true' : 'false');
    if (auth && auth.accessToken) {
      const config = {
        headers: {
          'content-type': 'multipart/form-data',
          Authorization: `Bearer ${auth.accessToken}`,
        },
      };

      try {
        const response = await axios_job.post(
          formatString(API_PATHS.JOB_APPLICATION_BY_JOB_ID, jobDetails.id),
          formData,
          config
        );
        setJobApplication(response.data as JobApplication);
      } catch (error) {
        // SHow error message
      }
      // setHaveUserAppliedForJob(true);
    }
  };

  const fetchJobById = async () => {
    setJobApplication(null);
    const jobResponse = await axios_job.get(
      formatString(API_PATHS.JOB_BY_ID, params.id),
      {}
    );
    setJobDetails(jobResponse.data as Job);
    if (auth && auth.accessToken) {
      try {
        const config = {
          headers: { Authorization: `Bearer ${auth.accessToken}` },
        };
        const applicationResponse = await axios_job.get(
          formatString(
            API_PATHS.JOB_APPLICATION_BY_JOB_ID_CANDIDATE_ID,
            params.id,
            auth.id
          ),
          config
        );
        setJobApplication(null);
        setJobApplication(applicationResponse.data as JobApplication);
      } catch (error) {}
    }
  };

  useEffect(() => {
    fetchJobById();
    console.log()
  }, [auth]);

  console.log(jobDetails)
  return (
    <Container id="job-details" sx={{ py: { xs: 8, sm: 16 } }}>
      <Grid container spacing={3}>
        <Grid item xs={1.5}>
          <CardMedia
            component="img"
            sx={{ maxWidth: '80%', maxHeight: '80%' }}
            image="/img/svg_icon/1.svg"
          />
        </Grid>
        <Stack>
          <Typography component="h2" variant="h4" color="text.primary">
            {jobDetails?.title}
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: { xs: 2, sm: 4 } }}>
            {jobDetails?.job_locations}
          </Typography>
        </Stack>
      </Grid>
      <Grid container spacing={3}>
        <Grid item xs={8}>
          {/* <Divider /> */}
          <Grid
            container
            item
            gap={1}
            sx={{ display: { xs: 'auto', sm: 'none' } }}></Grid>
          <Box
            component={Card}
            variant="outlined"
            sx={{
              display: { xs: 'auto', sm: 'none' },
              mt: 4,
            }}></Box>
          <Stack
            direction="column"
            justifyContent="center"
            alignItems="flex-start"
            spacing={2}
            useFlexGap
            sx={{ width: '100%', display: { xs: 'none', sm: 'flex' } }}>
            <Card
              // variant="outlined"
              // component={Button}
              sx={{
                p: 3,
                height: 'fit-content',
                width: '100%',
                background: 'none',
              }}>
              <Box
                sx={{
                  width: '100%',
                  display: 'flex',
                  textAlign: 'left',
                  flexDirection: { xs: 'column', md: 'row' },
                  alignItems: { md: 'center' },
                  gap: 2.5,
                  pt: 2,
                }}>
                <Typography
                  color="text.secondary"
                  variant="h6"
                  sx={{ my: 0.5, width: '30%' }}>
                  Summary
                </Typography>
                <Typography
                  color="text.secondary"
                  variant="body1"
                  sx={{ my: 0.5 }}
                  dangerouslySetInnerHTML={{
                    __html: jobDetails?.summary,
                  }}
                />
              </Box>
              <Box
                sx={{
                  width: '100%',
                  display: 'flex',
                  textAlign: 'left',
                  flexDirection: { xs: 'column', md: 'row' },
                  alignItems: { md: 'center' },
                  gap: 2.5,
                  pt: 2,
                }}>
                <Typography
                  color="text.secondary"
                  variant="h6"
                  sx={{ my: 0.5, width: '15%' }}>
                  Requirements
                </Typography>
                <Typography
                  color="text.secondary"
                  variant="body1"
                  sx={{ my: 0.5 }}
                  dangerouslySetInnerHTML={{
                    __html: jobDetails?.requirements,
                  }}
                />
                {/* </Box> */}
              </Box>
              <Box
                sx={{
                  width: '100%',
                  display: 'flex',
                  textAlign: 'left',
                  flexDirection: { xs: 'column', md: 'row' },
                  alignItems: { md: 'center' },
                  gap: 2.5,
                  pt: 2,
                }}>
                <Typography
                  color="text.secondary"
                  variant="h6"
                  sx={{ my: 0.5, width: '15%' }}>
                  Responsibility
                </Typography>
                <Typography
                  color="text.secondary"
                  variant="body1"
                  sx={{ my: 0.5 }}
                  dangerouslySetInnerHTML={{
                    __html: jobDetails?.responsibilities,
                  }}
                />
              </Box>

              <Box
                sx={{
                  width: '100%',
                  display: 'flex',
                  textAlign: 'left',
                  flexDirection: { xs: 'column', md: 'row' },
                  alignItems: { md: 'center' },
                  gap: 2.5,
                  pt: 2,
                }}>
                <Typography
                  color="text.secondary"
                  variant="h6"
                  sx={{ my: 0.5, width: '15%' }}>
                  Key Competencies
                </Typography>
                <Typography
                  color="text.secondary"
                  variant="body1"
                  dangerouslySetInnerHTML={{
                    __html: jobDetails?.key_competencies,
                  }}
                />
              </Box>

              <Box
                sx={{
                  width: '100%',
                  display: 'flex',
                  textAlign: 'left',
                  flexDirection: { xs: 'column', md: 'row' },
                  alignItems: { md: 'center' },
                  gap: 2.5,
                  pt: 2,
                }}>
                <Typography
                  color="text.secondary"
                  variant="h6"
                  sx={{ my: 0.5, width: '15%' }}>
                  Qualifications
                </Typography>
                <Typography
                  color="text.secondary"
                  variant="body1"
                  dangerouslySetInnerHTML={{
                    __html: jobDetails?.qualifications,
                  }}
                />
              </Box>
            </Card>
          </Stack>
        </Grid>
        <Grid
          item
          xs={4}
          sx={{ display: { xs: 'none', sm: 'flex' }, width: '100%' }}>
          <Card
            variant="outlined"
            sx={{
              height: '100%',
              width: '100%',
              display: { xs: 'none', sm: 'flex' },
              pointerEvents: 'none',
              p: 2,
            }}>
            <Stack sx={{ width: '100%', textAlign: 'left' }}>
              <Typography
                color="text.secondary"
                variant="h5"
                align="left"
                sx={{ my: 0.5 }}>
                Job Summary
              </Typography>
              <Typography
                color="text.secondary"
                variant="h6"
                align="left"
                sx={{ my: 0.5, pt: 2 }}>
                Published on:{' '}
                {new Date(jobDetails?.time_created).toDateString()}
              </Typography>
              <Typography
                color="text.secondary"
                variant="h6"
                align="left"
                sx={{ my: 0.5 }}>
                Open positions: {jobDetails?.open_positions}
              </Typography>
              <Typography
                color="text.secondary"
                variant="h6"
                align="left"
                sx={{ my: 0.5 }}>
                Salary: {jobDetails?.salary}
              </Typography>
              <Typography
                color="text.secondary"
                variant="h6"
                align="left"
                sx={{ my: 0.5 }}>
                Job Nature:{jobDetails?.job_nature}
              </Typography>
            </Stack>
          </Card>
        </Grid>
        <Grid item sx={{ display: { xs: 'none', sm: 'flex' }, width: '100%' }}>
          <Card
            variant="outlined"
            sx={{
              height: '100%',
              width: '100%',
              display: { xs: 'none', sm: 'flex' },
              p: 2,
            }}>
            {auth && auth.isLoggedIn === true ? (
              <>
                {jobApplication === null ? (
                  <>
                    <Stack>
                      <Typography
                        color="text.secondary"
                        variant="h5"
                        align="left"
                        sx={{ my: 0.5 }}>
                        Apply for Job
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Button
                            component="label"
                            role={undefined}
                            variant="outlined"
                            tabIndex={-1}
                            disabled={isDisabled}
                            startIcon={<CloudUploadIcon />}>
                            Upload Resume
                            <VisuallyHiddenInput
                              type="file"
                              accept='.pdf'
                              onChange={handleFileChange}
                            />
                          </Button>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography
                            color="text.secondary"
                            variant="body2"
                            align="center"
                            sx={{ px: 15 }}>
                            To speed up the hiring process, we are conducting
                            Al-Enabled interviews. If you agree to participate
                            in the Al-Enabled Interview, we will send you a link
                            for the interview within 24 hours of your
                            submission, if your resume is shortlisted for an
                            interview. You will have 3 calendar days to complete
                            your interview from the time you get the link for
                            the interview.
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Checkbox
                            onClick={handleAiOptInClick}
                            defaultChecked
                            name="ai_interview_optin"
                          />{' '}
                          Opt-In for AI enabled interview
                        </Grid>
                        <Grid item xs={12}>
                          <Button
                            variant="contained"
                            type="submit"
                            onClick={handleSubmit}>
                            Apply Now
                          </Button>
                        </Grid>
                      </Grid>
                      <Box></Box>
                    </Stack>
                  </>
                ) : (
                  <div className="apply_job_form white-bg">
                    We have received your application and are currently
                    reviewing it thoroughly. Our hiring team will carefully
                    assess your qualifications and experience to determine if
                    there is a potential match for the role.
                  </div>
                )}
              </>
            ) : (
              <>
                <Link href="/login">Log in </Link> &nbsp; to apply for this job
                posting
              </>
            )}
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
