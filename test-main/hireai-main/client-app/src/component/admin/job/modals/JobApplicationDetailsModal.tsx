import { useEffect, useState } from 'react';
import { AiInterview, JobApplication } from '../../../../api/models';
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
} from '../../../../api/axios';
import { useAuth } from '../../../../context';
import {
  Alert,
  Box,
  Button,
  Card,
  CardMedia,
  Collapse,
  IconButton,
  Link,
  Modal,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import CollapseTextCard from '../CollapseTextCard';
import Moment from 'react-moment';
import ResumePreviewModal from './ResumePreviewModal';
import ResumeFeedbackModal from './ResumeFeedbackModal';

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '50%',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

function AIInterviewDetails(props: { jobApplication: JobApplication }) {
  const { auth } = useAuth();
  const { jobApplication } = props;
  const [aiInterview, setAiInterview] = useState<AiInterview>();

  const sendAiInterviewInvite = async (jobApplication) => {
    if (jobApplication.status == 'Resume Parsed' && auth.accessToken) {
      const config = {
        headers: { Authorization: `Bearer ${auth.accessToken}` },
      };

      try {
        const response = await axios_ai_interview.post(
          API_PATHS.AI_INTERVIEW_CREATE,
          { job_application_id: jobApplication.id },
          config
        );
        setAiInterview(response.data);
      } catch (error) {
        // setAiInterview(null);
      }
    }
  };

  const fetchInterview = async (jobApplication) => {
    if (auth.accessToken) {
      const config = {
        headers: { Authorization: `Bearer ${auth.accessToken}` },
      };

      try {
        const response = await axios_ai_interview.get(
          formatString(
            API_PATHS.AI_INTERVIEW_BY_JOB_APPLICATION_ID,
            jobApplication.id
          ),
          config
        );

        setAiInterview(response.data);
      } catch (error) {}
    }
  };

  const sendInterviewLink = async (aiInterview: AiInterview) => {
    if (
      ['AI_INTERVIEW_READY', 'LINK_SENT'].includes(aiInterview.status) &&
      auth.accessToken
    ) {
      const config = {
        headers: { Authorization: `Bearer ${auth.accessToken}` },
      };

      try {
        const response = await axios_ai_interview.post(
          formatString(API_PATHS.AI_INTERVIEW_SEND_EMAIL, aiInterview.id),
          {},
          config
        );
        setAiInterview(response.data);
      } catch (error) {}
    }
  };

  useEffect(() => {
    fetchInterview(jobApplication);
  }, []);

  return (
    <>
      <Typography
        id="modal-modal-title"
        variant="h6"
        component="h2"
        sx={{ paddingLeft: 2, paddingTop: 2 }}>
        AI Interview
      </Typography>
      {aiInterview && aiInterview.id ? (
        <>
          <Typography
            id="modal-modal-title"
            variant="body2"
            component="h2"
            sx={{ px: 4 }}>
            AI Interview Link: {APP_HOST_BASE_PATH}/ai-interview/
            {aiInterview.id}
          </Typography>
          <TableContainer
            sx={{ maxHeight: 800, overflowY: 'scroll', paddingTop: 1 }}>
            <Table stickyHeader>
              <TableBody>
                <TableRow>
                  <TableCell style={{ paddingBottom: 0, paddingTop: 0 }}>
                    <Table size="small" sx={{ marginBottom: 2 }}>
                      <TableHead>
                        <TableRow>
                          <TableCell align="center">Rating</TableCell>
                          <TableCell align="left">Feedback</TableCell>
                          <TableCell align="center">Status</TableCell>
                          <TableCell align="center">Link Sent</TableCell>
                          <TableCell align="center"> </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell align="center">
                            {aiInterview.rating}
                          </TableCell>
                          <TableCell align="left" title={aiInterview.feedback}>
                            {aiInterview.feedback ? (
                              <CollapseTextCard text={aiInterview.feedback} />
                            ) : (
                              <>N/A</>
                            )}
                          </TableCell>
                          <TableCell align="center">
                            {aiInterview.status}
                          </TableCell>
                          <TableCell align="center">
                            {aiInterview.link_sent_time ? (
                              <Moment format="YYYY-MM-DD">
                                {aiInterview.link_sent_time}
                              </Moment>
                            ) : (
                              ''
                            )}
                          </TableCell>
                          <TableCell align="center">
                            {!['SHORTLISTED', 'REJECTED', 'INITIATED'].includes(
                              aiInterview.status
                            ) ? (
                              <>
                                <Button
                                  onClick={() =>
                                    sendInterviewLink(aiInterview)
                                  }>
                                  Send Invite
                                </Button>
                              </>
                            ) : (
                              <></>
                            )}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                    {aiInterview.questions.length > 0 ? (
                      <>
                        <Typography
                          variant="h6"
                          gutterBottom
                          component="div"
                          sx={{ paddingLeft: 2, paddingTop: 2 }}>
                          AI Interview Questions
                        </Typography>
                        <Table
                          size="small"
                          aria-label="purchases"
                          sx={{ marginBottom: 2 }}>
                          <TableHead>
                            <TableRow>
                              <TableCell align="center">Question</TableCell>
                              <TableCell align="center">Answer</TableCell>
                              <TableCell align="center">Feedback</TableCell>
                              <TableCell align="center">Rating</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {aiInterview.questions.map(
                              (aiInterviewQuestion) => (
                                <TableRow key={aiInterviewQuestion.id}>
                                  <TableCell
                                    align="left"
                                    title={aiInterviewQuestion.question}>
                                    <CollapseTextCard
                                      text={aiInterviewQuestion.question}
                                    />
                                  </TableCell>

                                  <TableCell align="left">
                                    <CollapseTextCard
                                      text={
                                        aiInterviewQuestion.candidate_answer
                                      }
                                    />
                                  </TableCell>
                                  <TableCell
                                    align="left"
                                    title={aiInterviewQuestion.feedback}>
                                    <CollapseTextCard
                                      text={aiInterviewQuestion.feedback}
                                    />
                                  </TableCell>
                                  <TableCell align="center">
                                    {aiInterviewQuestion.rating}
                                  </TableCell>
                                </TableRow>
                              )
                            )}
                          </TableBody>
                        </Table>
                      </>
                    ) : (
                      <></>
                    )}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </>
      ) : (
        <Box sx={{ margin: 1 }}>
          <Typography gutterBottom component="div" sx={{ margin: 5 }}>
            Interview is not set up yet. Click{' '}
            <Link
              component="button"
              onClick={() => sendAiInterviewInvite(jobApplication)}>
              here
            </Link>{' '}
            to initiate the interview.
            <Alert sx={{ marginTop: 2 }} severity="info">
              This action will send an email to candidate's registeded email
              address.
            </Alert>
          </Typography>

          <Typography gutterBottom component="div" sx={{ margin: 5 }}>
            Alternatively click{' '}
            <Link
              component="button"
              // onClick={() => bypassAiInterview(jobApplication)}
            >
              here
            </Link>{' '}
            to bypass the AI Interview and proceed with manager's review the
          </Typography>
        </Box>
      )}
    </>
  );
}

function JobApplicationDetailsModal(props: {
  //   aiInterview?: AiInterview;
  jobApplication?: JobApplication;
}) {
  const { jobApplication } = props;
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div>
      <Button onClick={handleOpen}>Application Details</Button>
      <Modal
        sx={{ overflowY: 'scroll', maxHeight: '100%', width: '100%' }}
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description">
        <Stack sx={{ ...style, pt: 15, pb: 2 }}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Resume: {jobApplication.candidate.firstname}{' '}
            {jobApplication.candidate.lastname}
          </Typography>
          <TableContainer
            component={Paper}
            sx={{ maxHeight: 800, overflowX: 'scroll' }}>
            <Table stickyHeader aria-label="collapsible table">
              <TableHead>
                <TableRow>
                  <TableCell align="center">Resume Rating</TableCell>
                  <TableCell align="center">Resume Feeback</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="center">Preview</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                  <TableCell align="center">
                    {jobApplication.resume_feedback ? (
                      jobApplication.resume_rating
                    ) : (
                      <>N/A</>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    {jobApplication.resume_feedback ? (
                      <CollapseTextCard text={jobApplication.resume_feedback} />
                    ) : (
                      <>N/A</>
                    )}
                  </TableCell>
                  <TableCell align="center">{jobApplication.status}</TableCell>
                  <TableCell align="center">
                    <ResumePreviewModal jobApplication={jobApplication} />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
          <AIInterviewDetails jobApplication={jobApplication} />
        </Stack>
      </Modal>
    </div>
  );
}

export default JobApplicationDetailsModal;
