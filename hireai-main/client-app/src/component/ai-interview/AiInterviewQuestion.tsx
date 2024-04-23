import React from 'react';
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
import { Button, Grid } from '@mui/material';

import SpeechRecognition, {
  useSpeechRecognition,
} from 'react-speech-recognition';
import { useTimer } from 'react-timer-hook';

import ReactPlayer from 'react-player/lazy';
import moment from 'moment';
import { AiInterview } from '../../api/models';
import WebcamCapture from './WebcamCapture';

function AiInterviewQuestions(props) {
  const { auth } = useAuth();

  const aiInterview: AiInterview = props.aiInterview;
  const setShowAiInterviewThankyou = props.setShowAiInterviewThankyou;
  const setShowAiInterviewQuestions = props.setShowAiInterviewQuestions;

  const [readyToSubmitAll, setReadyToSubmitAll] =
    React.useState<boolean>(false);

  const [submitButtonDisabled, setSubmitButtonDisabled] =
    React.useState<boolean>(false);
  const [answerStartTime, setAnswerStartTime] = React.useState<String>();
  const [answerCompletedTime, setAnswerCompletedTime] =
    React.useState<String>();
  const [currentQuestionIndex, setCurrentQuestionIndex] =
    React.useState<number>(0);

  const time = new Date();
  const duration_in_seconds = 5 * 60;
  time.setSeconds(time.getSeconds() + duration_in_seconds);

  const getExpiryTimestamp = () => {
    const time = new Date();
    return time;
  };

  const { seconds, minutes, start, pause, restart } = useTimer({
    expiryTimestamp: time,
    autoStart: false,
    onExpire: () => stopListening(),
  });

  let {
    transcript,
    interimTranscript,
    finalTranscript,
    resetTranscript,
    listening,
  } = useSpeechRecognition({});

  const listenContinuously = () => {
    start();
    startAnswer();
    SpeechRecognition.startListening({
      continuous: true,
      language: 'en-US',
    });
  };

  const stopListening = async () => {
    SpeechRecognition.stopListening();
    submitAnswerAndShowNextQuestion(transcript);
    resetTranscript();
    const resetTime = new Date();
    resetTime.setSeconds(resetTime.getSeconds() + duration_in_seconds);
    restart(resetTime, false);
  };

  const startAnswer = () => {
    setAnswerStartTime(moment().format('Y-MM-DD HH:mm:ss'));
  };

  const submitAllInterview = async () => {
    if (auth.accessToken) {
      const config = {
        headers: { Authorization: `Bearer ${auth.accessToken}` },
      };

      const response = await axios_ai_interview.post(
        formatString(API_PATHS.AI_INTERVIEW_SUBMIT_ALL, aiInterview.id),
        {},
        config
      );
      if (response.status == 200) {
        setShowAiInterviewThankyou(true);
        setShowAiInterviewQuestions(false);
      }
    }
  };

  const submitAnswerAndShowNextQuestion = async (transcript) => {
    setSubmitButtonDisabled(true);
    if (auth.accessToken) {
      const config = {
        headers: { Authorization: `Bearer ${auth.accessToken}` },
      };

      const data = {
        candidate_answer: transcript,
        start_time: answerStartTime,
        complete_time: moment().format('Y-MM-DD HH:mm:ss'),
      };

      const response = await axios_ai_interview.post(
        formatString(
          API_PATHS.AI_INTERVIEW_SUBMIT_ANSWER,
          aiInterview.questions[currentQuestionIndex].id,
          aiInterview.id
        ),
        data,
        config
      );
    }

    setCurrentQuestionIndex(currentQuestionIndex + 1);
    setSubmitButtonDisabled(false);
  };

  const formatTime = (time) => {
    return String(time).padStart(2, '0');
  };

  return (
    <div>
      <div className="job_listing_area">
        <div className="container">
          <div className="job_lists">
            {aiInterview &&
            aiInterview.questions &&
            aiInterview.questions[currentQuestionIndex] ? (
              <>
                <Grid
                  container
                  rowSpacing={1}
                  columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                  <Grid item xs={6}>
                    <ReactPlayer
                      url={`${STATIC_CONTENT_GATEWAY_HOST}/uploads/videos/video_question_${aiInterview.questions[currentQuestionIndex].id}.webm`}
                      controls
                      width="100%"
                      height="100%"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <div>
                      <WebcamCapture />
                    </div>
                  </Grid>
                  <Grid item xs={6}>
                    <>
                      <div>Interview Question</div>
                      <div className="left">
                        Question:{' '}
                        {aiInterview.questions[currentQuestionIndex].question}
                      </div>
                    </>
                  </Grid>
                  <Grid item xs={6}>
                    <Grid container spacing={1} sx={{ pt: 2, pb: 2 }}>
                      <Grid item xs={5} className="left">
                        listening: {listening} {listening ? 'on' : 'off'}
                      </Grid>
                      <Grid item xs={6} className="right">
                        <span>{formatTime(minutes)}</span>:
                        <span>{formatTime(seconds)}</span>
                      </Grid>
                    </Grid>
                    {/* <Grid container spacing={1} columns={16} >
                                        <Grid item xs={3} className="left" >Answer</Grid>
                                        <Grid item xs={13} className="left" sx={{ padding: 1, border: '1px dashed grey', minHeight: 200 }} >{transcript}</Grid>
                                    </Grid> */}
                    <Grid container spacing={1} sx={{ pt: 2 }}>
                      <Grid item xs={3} className="left">
                        {listening === false ? (
                          <Button
                            variant="contained"
                            onClick={listenContinuously}>
                            Reply/Answer
                          </Button>
                        ) : (
                          <Button
                            variant="contained"
                            disabled={submitButtonDisabled}
                            color="success"
                            onClick={stopListening}>
                            Submit answer
                          </Button>
                        )}
                      </Grid>
                    </Grid>
                  </Grid>
                  {/* <Grid item xs={6}>
                                {aiInterview && aiInterview.questions && aiInterview.questions[currentQuestionIndex] === undefined ?
                                    (<Button variant="contained" color="success" onClick={submitAllInterview}>Complete</Button>)
                                    :
                                    (<></>)}
                            </Grid> */}
                </Grid>
              </>
            ) : (
              <>
                <div>
                  Thank you for completing all the interview questions! Your
                  responses are now being processed by our team. We appreciate
                  your time and interest in joining us. Please click the
                  "Finish" button below to complete the submission. We will
                  review your answers carefully and get back to you with further
                  updates regarding the next steps in our hiring process. Thank
                  you for your patience!
                </div>
                <Button
                  variant="contained"
                  color="success"
                  onClick={submitAllInterview}>
                  Finish
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AiInterviewQuestions;
