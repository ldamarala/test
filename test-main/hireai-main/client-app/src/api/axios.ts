import axios from 'axios';

// export const APP_HOST_BASE_PATH = process.env.APP_HOST_BASE_PATH;
// export const AUTH_API_GATEWAY_HOST = process.env.AUTH_SERVER_PATH;
// export const JOB_API_GATEWAY_HOST = process.env.JOB_SERVER_PATH;
// export const INTERVIEW_API_GATEWAY_HOST = process.env.INTERVIEW_SERVER_PATH;
// export const STATIC_CONTENT_GATEWAY_HOST = process.env.FILE_SERVER_PATH;

export const APP_HOST_BASE_PATH = 'http://localhost:3000';
export const AUTH_API_GATEWAY_HOST = 'http://localhost:9010';
export const JOB_API_GATEWAY_HOST = 'http://localhost:9020';
export const INTERVIEW_API_GATEWAY_HOST = 'http://localhost:9030';
export const STATIC_CONTENT_GATEWAY_HOST = 'http://localhost:9000';

export const formatString = (...args) => {
  const str = args[0];
  const params = args.filter((arg, index) => index !== 0);
  if (!str) return '';
  return str.replace(/%s[0-9]+/g, (matchedStr) => {
    const variableIndex = matchedStr.replace('%s', '') - 1;
    return params[variableIndex];
  });
};

// const AUTH_BASE = '/api/auth';
// const JOB_BASE = '/api/job';
// const INTERVIEW_BASE = '/api/ai-interview';
// const SIGNUP_BASE='';
const AUTH_BASE = '';
const JOB_BASE = '';
const INTERVIEW_BASE = '';

export const API_PATHS = {

  AUTH_USER_ME: AUTH_BASE + '/user/me',

  AUTH_NEW_USER:AUTH_BASE+'/user/new_user',
  AUTH_TOKEN_FORM: AUTH_BASE + '/token-form',
  AUTH_TOKEN: AUTH_BASE + '/token',
  AUTH_TOKEN_REFRESH: AUTH_BASE + '/refresh',

  ADMIN_JOB_ALL: JOB_BASE + '/v1/job/admin/all',

  JOB_ALL: JOB_BASE + '/v1/job/all',
  JOB_BY_ID: JOB_BASE + '/v1/job/%s1',
  JOB_CREATE: JOB_BASE + '/v1/job',

  JOB_APPLICATION_ALL: JOB_BASE + '/v1/application/all',
  JOB_APPLICATION_APPLY: JOB_BASE + '/v1/application/job-id/%s1',
  JOB_APPLICATION_BY_ID: JOB_BASE + '/v1/application/%s1',
  JOB_APPLICATION_BY_JOB_ID: JOB_BASE + '/v1/application/job-id/%s1',
  JOB_APPLICATION_BY_JOB_ID_CANDIDATE_ID:
    JOB_BASE + '/v1/application/job-id/%s1/candidate-id/%s2',

  JOB_APPLICATION_BY_CANDIDATE_ID:
    JOB_BASE + '/v1/application/candidate-id/%s1',

  AI_INTERVIEW_ALL: INTERVIEW_BASE + '/v1/ai-interview/all',
  AI_INTERVIEW_BY_ID: INTERVIEW_BASE + '/v1/ai-interview/%s1',
  AI_INTERVIEW_BY_JOB_APPLICATION_ID:
    INTERVIEW_BASE + '/v1/ai-interview/job-application-id/%s1',
  AI_INTERVIEW_SKIP: INTERVIEW_BASE + '/v1/ai-interview/skip',
  AI_INTERVIEW_SEND_EMAIL: INTERVIEW_BASE + '/v1/ai-interview/%s1/send-link',
  AI_INTERVIEW_WIZARD: INTERVIEW_BASE + '/v1/ai-interview/%s1/wizard',
  AI_INTERVIEW_CREATE: INTERVIEW_BASE + '/v1/ai-interview/',
  AI_INTERVIEW_SUBMIT_ANSWER:
    INTERVIEW_BASE +
    '/v1/ai-interview-question/%s1/interview/%s2/submit-answer',
  AI_INTERVIEW_SUBMIT_ALL: INTERVIEW_BASE + '/v1/ai-interview/%s1/submit-all',
};

// export default axios.create({
//   baseURL: API_GATEWAY_HOST,
// });
// export const axios_signup = axios.create({
//   baseURL : SIGNUP_API_GATEWAY_HOST,
// })

export const axios_auth = axios.create({
  baseURL: AUTH_API_GATEWAY_HOST,
});

export const axios_job = axios.create({
  baseURL: JOB_API_GATEWAY_HOST,
});

export const axios_ai_interview = axios.create({
  baseURL: INTERVIEW_API_GATEWAY_HOST,
});
