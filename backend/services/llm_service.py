import os
from typing import Any

from groq import Groq


def _get_client() -> Groq:
    return Groq(api_key=os.getenv("GROQ_API_KEY", ""))


def chat(
    message: str,
    disease: str,
    weather: dict[str, Any] | None = None,
    history: list[dict[str, str]] | None = None,
) -> dict:
    """Send a chat completion request to Groq (Llama 3.3 70B)."""
    weather_text = ""
    if weather and not weather.get("error"):
        weather_text = (
            f"Temperature: {weather.get('temperature')}°C, "
            f"Humidity: {weather.get('humidity')}%, "
            f"Conditions: {weather.get('description')}, "
            f"Wind: {weather.get('wind_speed')} m/s, "
            f"Location: {weather.get('city')}."
        )
    else:
        weather_text = "Weather data not available."

    system_prompt = (
        f"You are an expert agricultural advisor. The user's plant has been "
        f"diagnosed with {disease}. Local weather: {weather_text} "
        f"Give concise, voice-friendly responses (2-3 sentences). "
        f"Focus on practical advice about the disease, treatment, prevention, "
        f"and how weather conditions affect it."
    )

    messages: list[dict[str, str]] = [{"role": "system", "content": system_prompt}]

    # Append conversation history
    if history:
        for entry in history:
            messages.append({"role": entry.get("role", "user"), "content": entry.get("content", "")})

    messages.append({"role": "user", "content": message})

    client = _get_client()
    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=messages,
    )

    return {"reply": response.choices[0].message.content}
