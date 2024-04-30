import React, { useEffect } from 'react';
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
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Stack } from '@mui/material';

import ReactPlayer from 'react-player/lazy';
import { AiInterview, Question } from '../../api/models';
import AiInterviewQuestions from './AiInterviewQuestion';
import { useAuth } from '../../context';

function AiInterviewWizard() {
  const { auth } = useAuth();
  let { ai_interview_id } = useParams();
  const navigate = useNavigate();
  const [aiInterview, setAiInterview] = React.useState<AiInterview>();
  const [showAiInterviewWelcome, setShowAiInterviewWelcome] =
    React.useState<boolean>(false);
  const [showAiInterviewQuestions, setShowAiInterviewQuestions] =
    React.useState<boolean>(false);
  const [showAiInterviewThankyou, setShowAiInterviewThankyou] =
    React.useState<boolean>(false);
  const [aiInterviewQuestions, setAiInterviewQuestions] =
    React.useState<Question[]>();

  const fetchAiInterviewDetails = async () => {
    if (auth.accessToken) {
      const config = {
        headers: { Authorization: `Bearer ${auth.accessToken}` },
      };
      const response = await axios_ai_interview.get(
        formatString(API_PATHS.AI_INTERVIEW_WIZARD, ai_interview_id),
        config
      );
      setAiInterview(response.data);
    }
  };

  const initiateInterview = () => {
    setShowAiInterviewQuestions(true);
    setShowAiInterviewWelcome(false);
  };

  useEffect(() => {
    fetchAiInterviewDetails();
  }, []);

  useEffect(() => {
    if (aiInterview !== undefined) {
      setShowAiInterviewWelcome(true);
      setAiInterviewQuestions(aiInterview.questions);
      // setCurrentQuestionIndex(0);
    }
  }, [aiInterview]);

  return (
    <div>
      <div className="job_listing_area">
        <div className="container" >
          {(aiInterview && showAiInterviewWelcome && (
            <Stack spacing={2} alignItems="center" marginTop={5}>
              <ReactPlayer
                url={`${STATIC_CONTENT_GATEWAY_HOST}/uploads/videos/video_question_welcome_${aiInterview.id}.webm`}
                controls
                width="80%"
                height="80%"
                autoPlay
                playing={true}
                loop={true}
                volume={1}
                muted={true}
              />
              <Button variant="contained" onClick={initiateInterview}>
                Start Interview
              </Button>
            </Stack>
          )) ||
            (aiInterview &&
              !showAiInterviewWelcome &&
              showAiInterviewQuestions && (
                <AiInterviewQuestions
                  aiInterview={aiInterview}
                  setShowAiInterviewThankyou={setShowAiInterviewThankyou}
                  setShowAiInterviewQuestions={setShowAiInterviewQuestions}
                />
              )) ||
            (aiInterview && showAiInterviewThankyou && (
              <Stack spacing={2} alignItems="center">
                <ReactPlayer
                  url={`${STATIC_CONTENT_GATEWAY_HOST}/uploads/videos/video_question_thank_you_${aiInterview.id}.webm`}
                  controls
                  width="80%"
                  height="80%"
                  volume={0.5}
                  muted={true}
                  autoPlay
                  playing={true}
                />
                <Button variant="contained" href="/">
                  Close
                </Button>
              </Stack>
            )) ||
            (aiInterview === undefined && (
              <Stack spacing={2} alignItems="center" marginTop={90}>
                <div>Invalid Link</div>
              </Stack>
            ))}
        </div>
      </div>
    </div>
  );
}

export default AiInterviewWizard;
