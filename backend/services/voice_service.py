import os

import httpx


def get_deepgram_token() -> str:
    """Return a Deepgram API key for client-side STT.

    In production, create a scoped short-lived key via the Deepgram
    management API. For this project we return the main key directly.
    """
    return os.getenv("DEEPGRAM_API_KEY", "")


async def text_to_speech(text: str) -> bytes:
    """Convert text to speech audio via the Deepgram TTS API.

    Returns raw audio bytes (audio/mpeg).
    """
    api_key = os.getenv("DEEPGRAM_API_KEY", "")
    url = "https://api.deepgram.com/v1/speak?model=aura-asteria-en"

    headers = {
        "Authorization": f"Token {api_key}",
        "Content-Type": "application/json",
    }
    body = {"text": text}

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(url, headers=headers, json=body)
        response.raise_for_status()
        return response.content
