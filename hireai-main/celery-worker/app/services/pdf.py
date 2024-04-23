from fpdf import FPDF


class PDF(FPDF):
    def header(self):
        pass
        # self.set_font('Arial', 'B', 12)
        # self.cell(0, 10, 'Resume Feedback Document', 0, 1, 'C')

    def chapter_title(self, title):
        self.set_font('Arial', 'B', 12)
        self.cell(0, 10, title, 0, 1, 'L')
        self.ln(4)

    def chapter_job_application_feedback(self, resume_rating, resume_feedback, ai_interview_optin, status):
        self.set_font('Arial', 'B', 10)
        self.set_fill_color(211, 211, 211)  # Gray color
        self.multi_cell(0, 10, "Job Application (Resume) Feedback", fill=True)
        self.ln()

        self.set_font('Arial', 'B', 10)
        self.cell(0, 5, 'Resume Rating', 0, 1)
        self.set_font('Arial', '', 10)
        self.multi_cell(0, 5, f'{resume_rating}/10')
        self.ln()

        self.set_font('Arial', 'B', 10)
        self.cell(0, 5, 'Resume Feedback', 0, 1)
        self.set_font('Arial', '', 10)
        self.multi_cell(0, 5, resume_feedback)
        self.ln()

        self.set_font('Arial', 'B', 10)
        self.cell(0, 5, 'AI Interview OptIn', 0, 1)
        self.set_font('Arial', '', 10)
        self.multi_cell(0, 5, str(ai_interview_optin))
        self.ln()

        self.set_font('Arial', 'B', 10)
        self.cell(0, 5, 'Job Application Status', 0, 1)
        self.set_font('Arial', '', 10)
        self.multi_cell(0, 5, status)
        self.ln()

    def chapter_ai_interview_feedback(self, rating, feedback, status, link_sent_time, complete_time):
        self.set_font('Arial', 'B', 10)
        self.set_fill_color(211, 211, 211)  # Gray color
        self.multi_cell(0, 10, "AI Interview Feedback", fill=True)
        self.ln()

        self.set_font('Arial', 'B', 10)
        self.cell(0, 5, 'Interview Rating', 0, 1)
        self.set_font('Arial', '', 10)
        self.multi_cell(0, 5, f'{rating}/10')
        self.ln()

        self.set_font('Arial', 'B', 10)
        self.cell(0, 5, 'Interview Feedback', 0, 1)
        self.set_font('Arial', '', 10)
        self.multi_cell(0, 5, feedback)
        self.ln()

        self.set_font('Arial', 'B', 10)
        self.cell(0, 5, 'Interview Status', 0, 1)
        self.set_font('Arial', '', 10)
        self.multi_cell(0, 5, status)
        self.ln()

        self.set_font('Arial', 'B', 10)
        self.cell(0, 5, 'Interview Link Sent time', 0, 1)
        self.set_font('Arial', '', 10)
        self.multi_cell(0, 5, link_sent_time.strftime("%m/%d/%Y, %H:%M:%S"))
        self.ln()

        self.set_font('Arial', 'B', 10)
        self.cell(0, 5, 'Interview Complete Time', 0, 1)
        self.set_font('Arial', '', 10)
        self.multi_cell(0, 5, complete_time.strftime("%m/%d/%Y, %H:%M:%S"))
        self.ln()

    def chapter_question_feedback(self, question, answer, rating, feedback):
        self.set_font('Arial', 'B', 10)
        self.set_fill_color(211, 211, 211)  # Gray color
        self.multi_cell(0, 10, "Interview Question Feedbacks", fill=True)
        self.ln()

        self.set_font('Arial', 'B', 10)
        self.cell(0, 5, 'Question', 0, 1)
        self.set_font('Arial', '', 10)
        self.multi_cell(0, 5, question)

        self.ln()
        self.set_font('Arial', 'B', 10)
        self.cell(0, 5, 'Candidate Answer', 0, 1)
        self.set_font('Arial', '', 10)
        self.multi_cell(0, 5, answer.encode('utf-8').decode('latin-1'))
        self.ln()

        self.set_font('Arial', 'B', 10)
        self.cell(0, 5, 'Rating', 0, 1)
        self.set_font('Arial', '', 10)
        self.multi_cell(0, 5, f'{rating}/10')
        self.ln()

        self.set_font('Arial', 'B', 10)
        self.cell(0, 5, 'Feedback', 0, 1)
        self.set_font('Arial', '', 10)
        self.multi_cell(0, 5, feedback.encode('utf-8').decode('latin-1'))
        self.ln()
