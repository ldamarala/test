import re
from typing import List

import openai
from PyPDF2 import PdfReader
from loguru import logger

from app.core.config import settings
from app.models.ai_interview import AiInterview
from app.models.ai_interview_question import AiInterviewQuestion
from app.models.job_application import JobApplication
from app.models.user import User
from app.services.pdf import PDF

service_region = settings.MS_SPEECH_API_SERVICE_REGION
subscription_key = settings.MS_SPEECH_API_SUBSCRIPTION_KEY
url_base = f"https://{service_region}.customvoice.api.speech.microsoft.com/api"


def extracting_resume_pdf_text(file_path):
    try:
        pdf_file_object = open(file_path, 'rb')
        pdf_reader = PdfReader(pdf_file_object)
        text = [pdf_reader.pages[i].extract_text().replace('\t\r', '').replace('\xa0', '') for i in
                range(len(pdf_reader.pages))]
        text_str = ''.join(text)
        return text, text_str
    except Exception as e:
        print(f"Error extracting text: {str(e)}")
        return '', ''


def gpt_resume_parser(resume_path, job_role):
    text, text_str = extracting_resume_pdf_text(file_path=resume_path)
    gpt_response = extract_info_using_gpt(text_str)
    dictionary = segregate_gpt_info(gpt_response)
    extracted_skills = dictionary.get('Skills', '')
    rating, reasoning = generate_rating(job_role, extracted_skills)
    dictionary['Rating'] = rating
    dictionary['Reasoning'] = reasoning
    return rating, reasoning


def extract_info_using_gpt(resume_text):
    response = openai.ChatCompletion.create(
        model="gpt-4-1106-preview",
        messages=[
            {
                "role": "system",
                "content": "Based on resume provided, extract name, skills, Total experience (in years), phone number (eg: 9701755122),location(s) and email id .When the concerned details are not available, mention N/A. Also check for the authenticity of the resume (not a resume,fake resume,geniune resume ). The response should follow below format: Name: \n,Skills: \n,Total Experience(in years): \n, Phone Number: \n, Email Id: \n, Resume AUTHETICITY: \n, \n"
            },
            {
                "role": "user",
                "content": f"resume: {resume_text}"
            }
        ],
        temperature=0,
        max_tokens=256,
        top_p=1,
        frequency_penalty=0,
        presence_penalty=0
    )
    extracted_info = response['choices'][0]['message']['content'].strip()
    print(extracted_info)
    return extracted_info


def segregate_gpt_info(extracted_info):
    name_pattern = r"Name: (.+)"
    skills_pattern = r"Skills: (.+)"
    # experience_pattern = r"Total Experience(in years): (.+)"
    phone_pattern = r"Phone Number: (.+)"
    location_pattern = r"Location\(s\): (.+)"
    authenticity_pattern = r"Resume AUTHETICITY: (.+)"
    email_pattern = r"[\w\.-]+@[\w\.-]+"

    # Find all matches of the patterns in the extracted information
    name_match = re.search(name_pattern, extracted_info)
    skills_match = re.search(skills_pattern, extracted_info)
    # experience_match = re.search(experience_pattern, extracted_info)
    phone_match = re.search(phone_pattern, extracted_info)
    location_match = re.search(location_pattern, extracted_info)
    authenticity_match = re.search(authenticity_pattern, extracted_info)
    email_match = re.search(email_pattern, extracted_info)

    # global name
    name = name_match.group(1) if name_match else ""
    skills = skills_match.group(1) if skills_match else ""
    # experience = experience_match.group(1) if experience_match else ""
    phone = phone_match.group(1) if phone_match else ""
    location = location_match.group(1) if location_match else ""
    authenticity = authenticity_match.group(1) if authenticity_match else ""
    email = email_match.group() if email_match else ""

    # Create a dictionary with the extracted det62848642668642vails
    result = {'Name': name, 'Skills': skills, 'Phone': phone, 'Location': location, 'Authenticity': authenticity,
              'Email': email}
    print("gpt-->", result)
    return result


def generate_rating(job_role, resume_text):
    response = openai.ChatCompletion.create(
        model="gpt-4-1106-preview",
        messages=[
            {
                "role": "system",
                "content": "Based on resume provided, rate the suitabilty of a candidate on a scale of 1-10 (0-least suitable,10-best suitable) for a mentioned profile where the profile contains the detailed description of the job. Provide rating along with the Reasoning.Please provide detailed reasoning to support your rating.:\n\n"
            },
            {
                "role": "user",
                "content": f"resume: {resume_text}’\n\nProfile: {job_role}"
            }
        ],
        temperature=0,
        # max_tokens=600,
        top_p=1,
        frequency_penalty=0,
        presence_penalty=0
    )

    # Extract numerical rating from the response
    rating_match = re.search(r'\b\d+\b', response['choices'][0]['message']['content'])
    rating = int(rating_match.group()) if rating_match else 0

    # Extract reasoning by removing the numerical rating from the content
    reasoning = response['choices'][0]['message']['content'].replace(f"Rating: {rating}/10\n\nReasoning:\n", "")
    reasoning = reasoning.replace('\n', '')

    return rating, reasoning


async def build_interview_feedback_document(ai_interview: AiInterview,
                                            ai_interview_questions: List[AiInterviewQuestion],
                                            job_application: JobApplication,
                                            candidate: User):
    pdf = PDF()
    pdf.add_page()
    pdf.set_left_margin(10)
    pdf.set_right_margin(10)

    pdf.chapter_title(f'Resume Feedback - {candidate.firstname} {candidate.lastname}')

    pdf.chapter_job_application_feedback(job_application.resume_rating,
                                         job_application.resume_feedback,
                                         job_application.ai_interview_optin,
                                         job_application.status)

    pdf.chapter_ai_interview_feedback(ai_interview.rating, ai_interview.feedback,
                                      ai_interview.status, ai_interview.link_sent_time,
                                      ai_interview.complete_time)

    for question in ai_interview_questions:
        pdf.chapter_question_feedback(question.question, question.candidate_answer, question.rating, question.feedback)
    pdf.output(f'/src/app/uploads/resumes/interview_feedback_{ai_interview.id}.pdf')


def ai_interview_question_feedback(question, answer):
    try:
        chatbot_role = "You are taking a virtual interview of a candidate for a technology domain job.You need to rate the answer provided by candidate. Grading can be carried out on a scale of 1 to 10 (10 being best). Also, provide a reason behind the rating. Please ignore gramatical/vocabulary mistakes in the answers.\n\nFollow the below template:\n\nRating: \nReason:\n"
        response = openai.ChatCompletion.create(
            model="gpt-4-1106-preview",
            messages=[
                {
                    "role": "system",
                    "content": f"{chatbot_role}"
                },
                {
                    "role": "user",
                    "content": f"{question}\n\n{answer}"
                }
            ],
            temperature=1,
            max_tokens=256,
            top_p=1,
            frequency_penalty=0,
            presence_penalty=0
        )

        # Process the response and extract the content
        result_content = response['choices'][0]['message']['content']
        rating = re.search(r'Rating: (.+)', result_content).group(1)
        feedback = re.search(r'Reason: (.+)', result_content).group(1)
        print(f"rating: {rating}, feedback:{feedback}")
        return rating, feedback
    except Exception as e:
        logger.error(e)
        rating = 1
        feedback = "Candidate did not provide answer that can be processed by system"
        print(f"rating: {rating}, feedback:{feedback}")
        return rating, feedback


def generate_interview_questions(extracted_text):
    response = openai.ChatCompletion.create(
        model="gpt-4-1106-preview",
        messages=[
            {
                "role": "system",
                "content": "You are taking a virtual interview of a candidate for a technology domain job. You are expected to ask exact 10 questions depending on the candidates experience. You can go through the resume for framing questions:"
            },
            {
                "role": "user",
                "content": extracted_text
            }
        ]
    )
    # Extracting only the assistant's responses
    assistant_responses = response['choices'][0]['message']['content']
    generated_questions = [message.strip()[3:] for message in assistant_responses.split('\n') if message]
    return generated_questions[1:3]


def ai_interview_feedback(ai_interview_request: str):
    chatbot_role = "You are taking a virtual interview of a candidate for a technology domain job.You have already rated candidate's answers(to individual questions) on a scale of 1 to 10 (10 being best) and even provided a reason for the rating. Now, looking at all the questions, answers and associated rating (and reason), you need to decide (shortlisted/Rejected) on whether the candidate can be shortlisted for further interview process or otherwise. The present round of interview is for testing basic skills mentioned in resume. The next round would be testing his coding abilities and problem solving abilities. \n\nFollow the below template:\n\nDecision: \nOverall Rating: \nFinal_Reason:\n"

    # Use the file contents in your prompt
    response = openai.ChatCompletion.create(
        model="gpt-4-1106-preview",
        messages=[
            {
                "role": "system",
                "content": f"{chatbot_role}"
            },
            {
                "role": "user",
                "content": ai_interview_request
            }
        ],
        temperature=1,
        max_tokens=4095,
        top_p=1,
        frequency_penalty=0,
        presence_penalty=0
    )

    # Access the assistant's response
    assistant_response = response['choices'][0]['message']['content']
    decision = re.search(r'Decision: (.+)', assistant_response).group(1)
    rating = re.search(r'Overall Rating: (.+)', assistant_response).group(1)
    feedback = re.search(r'Final_Reason: (.+)', assistant_response).group(1)
    return decision, rating, feedback
