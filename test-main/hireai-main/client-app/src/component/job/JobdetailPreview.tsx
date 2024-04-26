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
import Modal from '@mui/material/Modal';


const style = {
   position: 'absolute' as 'absolute',
   top: '50%',
   left: '50%',
   transform: 'translate(-50%, -50%)',
   width: '60%',
   bgcolor: 'background.paper',
   border: '2px solid #000',
   boxShadow: 24,
   p: 4,
};

export default function JobDetailsPreview(props) {
   const { auth } = useAuth();

   const [jobDetails, setJobDetails] = useState<Job>();
   const [jobApplication, setJobApplication] = useState<JobApplication>(null);

   const [open, setOpen] = React.useState(false);
   const handleOpen = (e) => {
      e.stopPropagation();
      setOpen(true)
   };

   const handleClose = () => setOpen(false);


   const fetchJobById = async () => {
      setJobApplication(null);
      const jobResponse = await axios_job.get(
         formatString(API_PATHS.JOB_BY_ID, props.jobDetail_id),
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
                  props.job_details_id,
                  auth.id
               ),
               config
            );
            setJobApplication(null);
            setJobApplication(applicationResponse.data as JobApplication);
         } catch (error) { }
      }
   };

   useEffect(() => {
      fetchJobById();
   }, [auth]);

   return (
      <>
         <Link
            color="primary"
            variant="body2"
            fontWeight="bold"
            sx={{
               display: 'inline-flex',
               alignItems: 'center',
               '& > svg': { transition: '0.2s' },
               '&:hover > svg': { transform: 'translateX(2px)' },
            }}
            onClick={handleOpen}>
            <span>Learn more</span>
            <ChevronRightRoundedIcon
               fontSize="small"
               sx={{ mt: '1px', ml: '2px' }}
            />
         </Link>
         <Modal
            sx={{ overflowY: 'scroll', maxHeight: '100%', width: '100%', paddingTop:''}}
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description">
            <Stack sx={{ ...style, pt: 15, pb: 2 }}>
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
                                 Job Summery
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
                                 Open positions: 3
                              </Typography>
                              <Typography
                                 color="text.secondary"
                                 variant="h6"
                                 align="left"
                                 sx={{ my: 0.5 }}>
                                 Salary: 100k - 150k
                              </Typography>
                              <Typography
                                 color="text.secondary"
                                 variant="h6"
                                 align="left"
                                 sx={{ my: 0.5 }}>
                                 Job Nature: Full-time
                              </Typography>
                           </Stack>
                        </Card>
                     </Grid>
                  </Grid>
               </Container>
            </Stack>
         </Modal>
      </>
   );
}
