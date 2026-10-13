from fastapi import APIRouter, Query

from services.weather_service import get_weather

router = APIRouter()


@router.get("/weather")
async def weather(lat: float = Query(...), lon: float = Query(...)):
    """Return current weather for the given latitude and longitude."""
    return await get_weather(lat, lon)
