import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import predict, weather, chat, voice

load_dotenv()

app = FastAPI(title="Crop Disease Voice AI")

# CORS — allow local dev + production frontend
cors_origins = ["http://localhost:5173", "http://localhost:3000"]
frontend_url = os.getenv("FRONTEND_URL", "")
if frontend_url:
    # Strip trailing slash to avoid mismatch
    cors_origins.append(frontend_url.rstrip("/"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_origin_regex=r"https://.*\.up\.railway\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(predict.router)
app.include_router(weather.router)
app.include_router(chat.router)
app.include_router(voice.router)


@app.get("/")
async def health_check():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn

    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("app:app", host=host, port=port, reload=True)
