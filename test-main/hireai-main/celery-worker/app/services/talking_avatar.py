import asyncio
import json
import logging
import os
import aiohttp
from aiohttp import ClientSession

from app.core.config import settings

region = settings.MS_SPEECH_API_SERVICE_REGION
subscription_key = settings.MS_SPEECH_API_SUBSCRIPTION_KEY
url_base = f"https://{region}.customvoice.api.speech.microsoft.com/api"
output_directory = settings.VIDEO_OUTPUT_DIRECTORY
SAMPLE_RATE = 16000

greeting_templates = {
    "welcome": """Dear {candidate_name}, On behalf of the entire team at {company_name},
I would like to extend a warm welcome to you for your upcoming interview for the {position} position.
During the interview process, we will delve into your past experiences to gain a deeper understanding of your
capabilities and how they can contribute to our dynamic environment.
Your interview will consist of a series of questions designed to assess your qualifications and suitability
for the role. We are particularly interested in hearing about your past experiences, challenges you've faced,
and the outcomes you've achieved. This will help us gauge your problem-solving abilities, adaptability,
and alignment with our company culture.
When you are ready, please click the Start interview button below, to get started with your interview
""",
    "thank_you": """I wanted to take a moment to express my sincere gratitude for taking the time to interview for the
{position} position at {company_name}. It was a pleasure meeting you.
We understand that interviewing can be a time-consuming process, and we truly appreciate your interest in
joining our organization. Rest assured that your candidacy is being carefully considered, and we will be in touch
with updates on the status of your application as soon as possible.
If you have any further questions or would like to provide additional information, please don't hesitate to reach
out to me at recruitement@nstarx.com or 111-111-8000.
"""
}


async def generate_video_with_ai_avatar(session: ClientSession, video_id: str, avatar_script_text: str, semaphore,
                                        prefix: str = "avatar"):
    payload = json.dumps({
        "displayName": f"{prefix}_{video_id}",
        "description": "Vision AI Solution Accelerator Demo",
        "textType": "PlainText",
        "inputs": [{"text": avatar_script_text}],
        "synthesisConfig": {"voice": "en-US-JennyNeural"},
        "properties": {
            "talkingAvatarCharacter": "lisa",
            "talkingAvatarStyle": "graceful-sitting",
            "videoFormat": "webm",
            "videoCodec": "vp9",
            "subtitleType": "soft_embedded",
            "backgroundColor": "transparent",
        },
    })

    async with semaphore:
        async with session.post(f'{url_base}/texttospeech/3.1-preview1/batchsynthesis/talkingavatar',
                                data=payload,
                                headers={'Ocp-Apim-Subscription-Key': subscription_key,
                                         'Content-Type': 'application/json'}) as response:
            try:
                response.raise_for_status()  # Raise exception for HTTP errors
            except aiohttp.ClientResponseError as e:
                print(f'Error occurred for generating video for {prefix}_{video_id}: {e}')
                return

            logging.info(f'Job submitted for generating video for {prefix}_{video_id}')
            data = await response.json()
            status = data.get('status')
            while status not in ['Succeeded', 'Failed']:
                await asyncio.sleep(5)  # Wait for 5 seconds before checking the status again
                async with session.get(
                        f'{url_base}/texttospeech/3.1-preview1/batchsynthesis/talkingavatar/{data["id"]}',
                        headers={'Ocp-Apim-Subscription-Key': subscription_key}) as result:
                    result_json = await result.json()
                    status = result_json.get('status')
                    if status == 'Succeeded':
                        video_url = result_json['outputs']['result']
                        logging.info(f'\nReady. Synthesized video URL for Question {video_id}:\n' + video_url)

                        local_filename = os.path.join(output_directory, f'video_question_{video_id}.webm')
                        async with session.get(video_url) as video_response:
                            with open(local_filename, 'wb') as f:
                                async for data in video_response.content.iter_any():
                                    f.write(data)
                        logging.info(f'Downloaded video saved as: {local_filename}')
                    elif status == 'Failed':
                        logging.error(f'Synthesis failed for video for {prefix}_{video_id}')
                        logging.error(result_json['properties']['error'])
