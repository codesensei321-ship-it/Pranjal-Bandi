from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import io

from services.voice_service import get_deepgram_token, text_to_speech

router = APIRouter()


class TTSRequest(BaseModel):
    text: str


@router.get("/deepgram-token")
async def deepgram_token():
    """Return a Deepgram API key for client-side speech-to-text."""
    token = get_deepgram_token()
    return {"token": token}


@router.post("/tts")
async def tts(body: TTSRequest):
    """Convert text to speech and stream audio back."""
    audio_bytes = await text_to_speech(body.text)
    return StreamingResponse(
        io.BytesIO(audio_bytes),
        media_type="audio/mpeg",
    )
