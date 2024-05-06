import { Fragment, useState } from 'react';
import { useAuth } from '../../../context';
import { AiInterview, JobApplication, Question } from '../../../api/models';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Moment from 'react-moment';

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

function ResumePreviewModal(props: { jobApplication: any }) {
  const { jobApplication } = props;
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div>
      <Button onClick={handleOpen}>Resume</Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description">
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Resume: {jobApplication.candidate.firstname}{' '}
            {jobApplication.candidate.lastname}
          </Typography>
          <Card>
            <CardMedia
              sx={{ height: 500 }}
              component="iframe"
              src={`${STATIC_CONTENT_GATEWAY_HOST}/${jobApplication.resume_location}`}
            />
          </Card>
        </Box>
      </Modal>
    </div>
  );
}

function ResumeFeedbackModal(props: {
  aiInterview: AiInterview;
  jobApplication: JobApplication;
}) {
  const { aiInterview, jobApplication } = props;
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div>
      <Button onClick={handleOpen}>Feedback</Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description">
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Resume: {jobApplication.candidate.firstname}{' '}
            {jobApplication.candidate.lastname}
          </Typography>
          <Card>
            <CardMedia
              sx={{ height: 500 }}
              component="iframe"
              src={`${STATIC_CONTENT_GATEWAY_HOST}/uploads/resumes/interview_feedback_${aiInterview.id}.pdf`}
            />
          </Card>
        </Box>
      </Modal>
    </div>
  );
}

function JobApplicationRow(props: { jobApplication: any }) {
  const { auth } = useAuth();
  const { jobApplication } = props;
  const [open, setOpen] = useState(false);
  const [aiInterviewExists, setAiInterviewExists] = useState<boolean>(false);
  const [aiInterview, setAiInterview] = useState<AiInterview>();
  const [aiInterviewQuestions, setAiInterviewQuestions] =
    useState<Question[]>();
  const [jobApplicationStatus, setJobApplicationStatus] = useState(
    jobApplication.status
  );

  const fetchInterview = async (jobApplication) => {
    // const accessToken = localStorage.getItem('accessToken');
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
        setAiInterviewExists(true);
      } catch (error) {
        setAiInterviewExists(false);
      }
    }
    setOpen(!open);
  };

  const sendAiInterviewInvite = async (jobApplication) => {
    if (jobApplication.status == 'RESUME_PARSED' && auth.accessToken) {
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
        setJobApplicationStatus(response.data.application.status);
        setAiInterviewExists(true);
      } catch (error) {
        setAiInterviewExists(false);
      }
    }
  };

  const bypassAiInterview = async (jobApplication) => {
    if (jobApplication.status == 'APPLIED' && auth.accessToken) {
      const config = {
        headers: { Authorization: `Bearer ${auth.accessToken}` },
      };

      try {
        const response = await axios_ai_interview.post(
          API_PATHS.AI_INTERVIEW_SKIP,
          { job_application_id: jobApplication.id },
          config
        );
        setAiInterviewExists(false);
        setJobApplicationStatus('PROCESSING');
      } catch (error) {
        setAiInterviewExists(false);
      }
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

  return (
    <Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => fetchInterview(jobApplication)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {jobApplication.job.title}
        </TableCell>
        <TableCell align="center">
          {jobApplication.candidate.firstname +
            ' ' +
            jobApplication.candidate.lastname}
        </TableCell>
        <TableCell align="center">{jobApplicationStatus}</TableCell>
        <TableCell align="center">
          {jobApplication.ai_interview_optin ? 'Yes' : 'No'}
        </TableCell>
        <TableCell align="center">
          <Moment format="YYYY-MM-DD HH:mm">
            {jobApplication.job.time_created}
          </Moment>
        </TableCell>
        <TableCell align="center">
          <Moment format="YYYY-MM-DD HH:mm">
            {jobApplication.job.time_updated}
          </Moment>
        </TableCell>
        <TableCell align="center">
          <ResumePreviewModal jobApplication={jobApplication} />
          {aiInterview != undefined &&
          ['REJECTED', 'SHORTLISTED'].includes(aiInterview.status) ? (
            <>
              <ResumeFeedbackModal
                aiInterview={aiInterview}
                jobApplication={jobApplication}
              />
            </>
          ) : (
            <></>
          )}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={10}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            {aiInterviewExists ? (
              <TableContainer sx={{ maxHeight: 800, overflowY: 'scroll' }}>
                <Table stickyHeader>
                  <TableBody>
                    <TableRow></TableRow>
                    <TableRow>
                      <Typography
                        variant="h6"
                        gutterBottom
                        component="p"
                        sx={{ paddingLeft: 2, paddingTop: 2 }}>
                        AI Interview
                      </Typography>
                      {APP_HOST_BASE_PATH}/ai-interview/
                      {aiInterview.id}
                    </TableRow>
                    <TableRow>
                      <TableCell style={{ paddingBottom: 0, paddingTop: 0 }}>
                        <Table size="small" sx={{ marginBottom: 2 }}>
                          <TableHead>
                            <TableRow>
                              {/* <TableCell align="center">ID</TableCell> */}
                              <TableCell align="center">Rating</TableCell>
                              <TableCell align="center" colSpan={3}>
                                Feedback
                              </TableCell>
                              <TableCell align="center">Status</TableCell>
                              <TableCell align="center">Link Sent</TableCell>
                              <TableCell align="center">Completed</TableCell>
                              <TableCell align="center">Created</TableCell>
                              <TableCell align="center">Updated</TableCell>
                              <TableCell align="center"> </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            <TableRow>
                              <TableCell align="center">
                                {aiInterview.rating}
                              </TableCell>
                              <TableCell
                                align="left"
                                title={aiInterview.feedback}
                                colSpan={3}>
                                {aiInterview.feedback
                                  ? aiInterview.feedback.substring(0, 50)
                                  : 'N/A'}
                              </TableCell>
                              <TableCell align="center">
                                {aiInterview.status}
                              </TableCell>
                              <TableCell align="center">
                                {aiInterview.link_sent_time ? (
                                  <Moment format="YYYY-MM-DD HH:mm">
                                    {aiInterview.link_sent_time}
                                  </Moment>
                                ) : (
                                  ''
                                )}
                              </TableCell>
                              <TableCell align="center">
                                {aiInterview.complete_time ? (
                                  <Moment format="YYYY-MM-DD HH:mm">
                                    {aiInterview.complete_time}
                                  </Moment>
                                ) : (
                                  ''
                                )}
                              </TableCell>
                              <TableCell align="center">
                                <Moment format="YYYY-MM-DD HH:mm">
                                  {aiInterview.time_created}
                                </Moment>
                              </TableCell>
                              <TableCell align="center">
                                <Moment format="YYYY-MM-DD HH:mm">
                                  {aiInterview.time_updated}
                                </Moment>
                              </TableCell>
                              <TableCell align="center">
                                {!['SHORTLISTED', 'REJECTED'].includes(
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
                                  <TableCell align="center" colSpan={3}>
                                    Feedback
                                  </TableCell>
                                  <TableCell align="center">Rating</TableCell>
                                  <TableCell align="center">Weight</TableCell>
                                  <TableCell align="center">Start</TableCell>
                                  <TableCell align="center">
                                    Completed
                                  </TableCell>
                                  <TableCell align="center">Created</TableCell>
                                  <TableCell align="center">Updated</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {aiInterview.questions.map(
                                  (aiInterviewQuestion) => (
                                    <TableRow key={aiInterviewQuestion.id}>
                                      <TableCell
                                        align="left"
                                        title={aiInterviewQuestion.question}>
                                        {aiInterviewQuestion.question
                                          ? aiInterviewQuestion.question.substring(
                                              0,
                                              50
                                            ) + '...'
                                          : ''}
                                      </TableCell>
                                      <TableCell align="left">
                                        {aiInterviewQuestion.candidate_answer
                                          ? aiInterviewQuestion.candidate_answer.substring(
                                              0,
                                              50
                                            ) + '...'
                                          : ''}
                                      </TableCell>
                                      <TableCell
                                        align="left"
                                        title={aiInterviewQuestion.feedback}
                                        colSpan={3}>
                                        {aiInterviewQuestion.feedback
                                          ? aiInterviewQuestion.feedback.substring(
                                              0,
                                              50
                                            )
                                          : 'N/A'}
                                      </TableCell>
                                      <TableCell align="center">
                                        {aiInterviewQuestion.rating}
                                      </TableCell>
                                      <TableCell align="center">
                                        {aiInterviewQuestion.weight}
                                      </TableCell>
                                      <TableCell align="center">
                                        <Moment format="YYYY-MM-DD HH:mm">
                                          {aiInterviewQuestion.start_time}
                                        </Moment>
                                      </TableCell>
                                      <TableCell align="center">
                                        <Moment format="YYYY-MM-DD HH:mm">
                                          {aiInterviewQuestion.complete_time}
                                        </Moment>
                                      </TableCell>
                                      <TableCell align="center">
                                        <Moment format="YYYY-MM-DD HH:mm">
                                          {aiInterviewQuestion.time_created}
                                        </Moment>
                                      </TableCell>
                                      <TableCell align="center">
                                        <Moment format="YYYY-MM-DD HH:mm">
                                          {aiInterviewQuestion.time_updated}
                                        </Moment>
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

                        {/* </Box> */}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ margin: 1 }}>
                <Typography gutterBottom component="div" sx={{ margin: 5 }}>
                  Interview is not set up yet. Click
                  <Link
                    component="button"
                    onClick={() => sendAiInterviewInvite(jobApplication)}>
                    here
                  </Link>
                  to initiate the interview.
                  <Alert sx={{ marginTop: 2 }} severity="info">
                    This action will send an email to candidate's registeded
                    email address.
                  </Alert>
                </Typography>

                <Typography gutterBottom component="div" sx={{ margin: 5 }}>
                  Alternatively click{' '}
                  <Link
                    component="button"
                    onClick={() => bypassAiInterview(jobApplication)}>
                    here
                  </Link>{' '}
                  to bypass the AI Interview and proceed with manager's review
                  the
                </Typography>
              </Box>
            )}
          </Collapse>
        </TableCell>
      </TableRow>
      {/* </TableCell>
            </TableRow> */}
    </Fragment>
  );
}

export default JobApplicationRow;
