import asyncio
import json
import logging
import os
import aiohttp
from aiohttp import ClientSession

from app.core.config import settings
import os
from dotenv import load_dotenv, find_dotenv
_ = load_dotenv(find_dotenv())

region = os.getenv("MS_SPEECH_API_SERVICE_REGION")
subscription_key = os.getenv("MS_SPEECH_API_SUBSCRIPTION_KEY")
url_base = f"https://{region}.customvoice.api.speech.microsoft.com/api"
output_directory = os.getenv("VIDEO_OUTPUT_DIRECTORY")
SAMPLE_RATE = 16000


greeting_templates = {
    "welcome": """Welcome to your AI-enabled interview for the {position} position at {company_name}. We are thrilled to have you here.
      When you're ready, click start interview and let's dive in. Best of luck, and we are here if you need any assistance.""" ,
      
    "thank_you": """Thank you, {candidate_name} for participating in our AI-enabled interview for the {position} role at hireai. Your responses
      have been recorded successfully. We appreciate your time and effort. You will hear from us soon regarding the next steps. Wish you the best"""
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
