import asyncio
import logging
import os
from datetime import datetime, timezone
from email.parser import BytesParser
from email.utils import parsedate_to_datetime

import aiohttp_jinja2
import jinja2
from aiohttp import web
from aiosmtpd.controller import Controller

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

emails = []

TEMPLATES_PATH = os.path.join(os.path.dirname(__file__), 'templates')
env = None


@aiohttp_jinja2.template('emails.html')
async def get_emails(request):
    receiver = request.match_info.get('receiver', '')
    emails_for_receiver = [email for email in emails if receiver in email[0]]
    return {'receiver': receiver, 'emails': emails_for_receiver}


@aiohttp_jinja2.template('emails.html')
async def get_all_emails(request):
    emails_for_receiver = [email for email in emails]
    return {'receiver': "All Users", 'emails': emails_for_receiver}



class EmailHandler:

    async def handle_RCPT(self, server, session, envelope, address, rcpt_options):
        envelope.rcpt_tos.append(address)
        logger.info(f"Received email for: {address}")
        return '250 OK'

    async def handle_DATA(self, server, session, envelope):

        logging.info(f"Received message from: {envelope.mail_from}")
        logging.info(f"Message recipients: {envelope.rcpt_tos}")
        logging.info(f"Message data:\n{envelope.content.decode()}\n")
        message_data = envelope.content.decode('utf-8', errors='replace')
        message = BytesParser().parsebytes(message_data.encode('utf-8'))
        subject = message.get('subject', 'No Subject')
        received_time = datetime.now(timezone.utc)

        message_body = ""
        for part in message.walk():
            if part.get_content_type() == 'text/plain':
                message_body += part.get_payload()

        emails.append((envelope.rcpt_tos[0], {
            "sender": envelope.mail_from,
            "recipients": envelope.rcpt_tos,
            "subject": subject,
            "content": message_body,
            "received_time": received_time
        }))
        # message = envelope.content.decode('utf-8')
        # emails.append((envelope.rcpt_tos[0], message))
        logger.info(f"Received email content: {envelope.content.decode('utf-8')}")
        return '250 Message accepted for delivery'


async def smtp_server():
    logger.info("Starting SMTP server...")
    handler = EmailHandler()
    controller = Controller(handler, hostname='0.0.0.0', port=3025)
    controller.start()
    logger.info("SMTP server started.")


async def http_server():
    global env
    logger.info("Starting HTTP server...")

    app = web.Application()
    env = aiohttp_jinja2.setup(
        app,
        loader=jinja2.FileSystemLoader(TEMPLATES_PATH)
    )
    app.router.add_get('/emails/{receiver}', get_emails)
    app.router.add_get('/emails', get_all_emails)
    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, '0.0.0.0', 3000)
    await site.start()
    logger.info("HTTP server started.")


async def main():
    task1 = asyncio.create_task(smtp_server())
    task2 = asyncio.create_task(http_server())

    # Wait for cancellation signal
    try:
        while True:
            await asyncio.sleep(3600)  # sleep for an hour
    except asyncio.CancelledError:
        task1.cancel()
        task2.cancel()
        await asyncio.gather(task1, task2, return_exceptions=True)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        pass
