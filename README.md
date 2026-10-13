# 🌿 Crop Disease Voice AI

An AI-powered plant disease detection app with voice-based interaction. Upload or capture a leaf image, get an instant disease diagnosis from a TFLite model, and have a voice conversation with an AI advisor about treatment — all while factoring in your local weather conditions.

## Features

- **Image-based disease detection** — Upload or capture a photo of a leaf; a TensorFlow Lite model classifies it across 29 crop disease categories (apple, cherry, corn, grape, peach, pepper, potato, strawberry, tomato).
- **Voice chat** — Talk to the AI about the detected disease using Deepgram speech-to-text and text-to-speech. The AI responds with concise, practical advice.
- **Weather-aware advice** — The app reads your browser location, fetches local weather via OpenWeatherMap, and the LLM factors temperature, humidity, and conditions into its recommendations.
- **Modern UI** — Dark purple-themed glassmorphism design with Framer Motion animations and an animated orb that pulses while the AI speaks.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion, React Router |
| Backend | FastAPI, Uvicorn, Python 3.12 |
| ML Model | TensorFlow Lite (`model_unquant.tflite`) |
| LLM | Groq (Llama 3.3 70B Versatile) |
| Speech | Deepgram (STT + TTS) |
| Weather | OpenWeatherMap API |

## Project Structure

```
├── backend/
│   ├── app.py                  # FastAPI entry point
│   ├── requirements.txt
│   ├── routers/
│   │   ├── predict.py          # POST /predict — image classification
│   │   ├── weather.py          # GET /weather — location-based weather
│   │   ├── chat.py             # POST /chat — LLM conversation
│   │   └── voice.py            # POST /voice/tts, GET /deepgram-token
│   └── services/
│       ├── model_service.py    # TFLite inference
│       ├── llm_service.py      # Groq chat completions
│       ├── weather_service.py  # OpenWeatherMap client
│       └── voice_service.py    # Deepgram TTS
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── pages/
│   │   │   ├── HomePage.jsx    # Upload / capture UI
│   │   │   └── AnalysisPage.jsx# Results, weather, voice chat
│   │   ├── components/
│   │   │   ├── Orb.jsx         # Animated voice orb
│   │   │   ├── VoiceChat.jsx   # Voice interaction panel
│   │   │   ├── WeatherCard.jsx
│   │   │   ├── DiseaseCard.jsx
│   │   │   └── TreatmentPanel.jsx
│   │   └── hooks/
│   │       ├── useApi.js       # Backend API calls
│   │       ├── useVoice.js     # Deepgram STT/TTS
│   │       └── useLocation.js  # Browser geolocation
│   └── .env.local
├── model_unquant.tflite        # TFLite plant disease model
└── labels.txt                  # 29 class labels
```

## Prerequisites

- **Python 3.10+** with pip
- **Node.js 18+** with npm
- API keys for Deepgram, Groq, and OpenWeatherMap

## Setup

### 1. Clone and install

```bash
git clone <your-repo-url>
cd Crop-Disease-D-P-main
```

### 2. Backend

```bash
cd backend
pip install -r requirements.txt
```

Create `backend/.env` with your API keys:

```env
DEEPGRAM_API_KEY=your_deepgram_key
GROQ_API_KEY=your_groq_key
OPENWEATHERMAP_API_KEY=your_openweathermap_key
HOST=0.0.0.0
PORT=8000
```

### 3. Frontend

```bash
cd frontend
npm install
```

The frontend `.env.local` is pre-configured to point at `http://localhost:8000`. Edit `frontend/.env.local` if your backend runs on a different port:

```env
VITE_API_URL=http://localhost:8000
```

### 4. TFLite model

Make sure `model_unquant.tflite` and `labels.txt` are in the project root (they ship with the repo).

## Running

Start the backend:

```bash
cd backend
python app.py
# or: uvicorn app:app --reload --port 8000
```

Start the frontend (in a separate terminal):

```bash
cd frontend
npm run dev
```

Open **http://localhost:5173** in your browser.

## How It Works

1. **Upload / Capture** — Select or photograph a leaf on the home page.
2. **Analysis** — The image is sent to `/predict`; the TFLite model returns the disease name and confidence score.
3. **Weather** — Your browser's geolocation fetches local weather from OpenWeatherMap.
4. **Voice Chat** — Click the orb or use the chat to ask about the disease. Deepgram handles speech-to-text, Groq's Llama 3.3 generates advice (weather-aware), and Deepgram reads the response back to you.

## API Keys

| Service | Sign-up URL | Free Tier |
|---------|------------|-----------|
| Deepgram | https://console.deepgram.com | $200 credit |
| Groq | https://console.groq.com | Free API access |
| OpenWeatherMap | https://home.openweathermap.org/api_keys | 1000 calls/day |

## License

This project is for educational purposes.
