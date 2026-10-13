from typing import Any

from fastapi import APIRouter
from pydantic import BaseModel

from services.llm_service import chat

router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    disease: str
    weather: dict[str, Any] | None = None
    history: list[dict[str, str]] = []


@router.post("/chat")
async def chat_endpoint(body: ChatRequest):
    """Send a message to the agricultural advisor LLM."""
    result = chat(
        message=body.message,
        disease=body.disease,
        weather=body.weather,
        history=body.history,
    )
    return result
