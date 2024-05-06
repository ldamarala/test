import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.core.config import settings

interview_invite_template = """Dear {candidate_name},

We are pleased to invite you to participate in an AI-interview for the position of {position} at {company_name}. 
You can take the interview within the next 5 days by clicking on the link provided below. 
The interview link is valid for 5 days.

Link to AI-interview: {interview_link}

We look forward to hearing from you soon.

Best regards,
John Doe
Sr Technical Recruiter
{company_name}"""


def send_email(subject, message, sender_email, receiver_email):
    # Create a message
    msg = MIMEMultipart()
    msg['From'] = sender_email
    msg['To'] = receiver_email
    msg['Subject'] = subject
    msg.attach(MIMEText(message, 'plain'))

    with smtplib.SMTP(host=settings.SMTP_SERVER, port=settings.SMTP_PORT) as server:
        server.sendmail(sender_email, receiver_email, msg.as_string())
