export interface Question {
  id: string;
  ai_interview_id: string;
  weight: number;
  candidate_answer: string;
  rating: number;
  complete_time: string;
  time_updated: string;
  question: string;
  feedback: string;
  start_time: string;
  time_created: string;
}

export interface User {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  username: string;
  role: string;
  disabled: boolean;
  time_created: string;
  time_updated: string;
}

// export interface AiInterview {
//   id: string;
//   feedback: string;
//   link_sent_time: string;
//   time_created: string;
//   rating: number;
//   status: string;
//   job_application_id: string;
//   complete_time: string;
//   time_updated: string;
//   questions: Question[];
// }

export interface AiInterview {
  id: string;
  feedback: string;
  link_sent_time: string;
  time_created: string;
  rating: number;
  status: string;
  job_application_id: string;
  complete_time: string;
  time_updated: string;
  questions: Question[];
  job: Job;
  application: JobApplication;
}

export interface Job {
  id: string;
  title: string;
  hiring_manager_id: string;
  inactive: boolean;
  job_locations: string;
  salary:string,
  open_positions:string,
  job_nature:string,
  key_competencies: string;
  qualifications: string;
  recruiter_id: string;
  requirements: string;
  responsibilities: string;
  summary: string;
  time_created: string;
  time_updated: string;
  recruiter?: Persona;
  hiring_manager?: Persona;
}

// export interface JobApplication {
//   id: string;
//   job_id: string;
//   candidate_id: string;
//   resume_location: string;
//   ai_interview_optin: boolean;
//   status: boolean;
//   time_created?: string;
//   time_updated?: string;
// }
export interface Persona {
  id: string;
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  role: string;
}

export interface JobApplication {
  id: string;
  job_id: string;
  candidate_id: string;
  resume_location: string;
  resume_rating?: number;
  resume_feedback?: string;
  ai_interview_optin: boolean;
  status: string;
  candidate: Persona;
  job: Job;
  time_created?: string;
  time_updated?: string;
}
