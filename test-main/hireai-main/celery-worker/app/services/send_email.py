import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.core.config import settings


def send_email(subject, message, sender_email, receiver_email):
    # Create a message
    msg = MIMEMultipart()
    msg['From'] = sender_email
    msg['To'] = receiver_email
    msg['Subject'] = subject
    msg.attach(MIMEText(message, 'plain'))

    with smtplib.SMTP(host=settings.SMTP_SERVER, port=settings.SMTP_PORT) as server:
        server.sendmail(sender_email, receiver_email, msg.as_string())
