import os

import httpx


async def get_weather(lat: float, lon: float) -> dict:
    """Fetch current weather from OpenWeatherMap for the given coordinates."""
    api_key = os.getenv("OPENWEATHERMAP_API_KEY", "")
    url = "https://api.openweathermap.org/data/2.5/weather"
    params = {
        "lat": lat,
        "lon": lon,
        "appid": api_key,
        "units": "metric",
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            data = response.json()

        weather_info = data.get("weather", [{}])[0]
        main = data.get("main", {})
        wind = data.get("wind", {})
        icon_code = weather_info.get("icon", "01d")

        return {
            "temperature": main.get("temp"),
            "humidity": main.get("humidity"),
            "description": weather_info.get("description", ""),
            "city": data.get("name", "Unknown"),
            "icon": f"https://openweathermap.org/img/wn/{icon_code}@2x.png",
            "wind_speed": wind.get("speed"),
        }
    except Exception as exc:
        return {
            "error": str(exc),
            "temperature": None,
            "humidity": None,
            "description": "unavailable",
            "city": "Unknown",
            "icon": "",
            "wind_speed": None,
        }
