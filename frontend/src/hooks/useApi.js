import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
});

/**
 * POST /predict — upload an image file for disease detection.
 * @param {File} imageFile
 * @returns {Promise<{disease: string, confidence: number, is_healthy: boolean}>}
 */
export async function predictDisease(imageFile) {
  const formData = new FormData();
  formData.append('image', imageFile);
  const { data } = await api.post('/predict', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

/**
 * GET /weather — fetch weather for coordinates.
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<{temperature: number, humidity: number, description: string, city: string, icon: string, wind_speed: number}>}
 */
export async function getWeather(lat, lon) {
  const { data } = await api.get('/weather', { params: { lat, lon } });
  return data;
}

/**
 * POST /chat — send a chat message to the LLM.
 * @param {string} message
 * @param {string} disease
 * @param {object|null} weather
 * @param {Array<{role: string, content: string}>} history
 * @returns {Promise<{reply: string}>}
 */
export async function sendChat(message, disease, weather, history) {
  const { data } = await api.post('/chat', { message, disease, weather, history });
  return data;
}

/**
 * GET /deepgram-token — get a temporary Deepgram API token.
 * @returns {Promise<{token: string}>}
 */
export async function getDeepgramToken() {
  const { data } = await api.get('/deepgram-token');
  return data;
}

/**
 * POST /tts — get TTS audio bytes for text.
 * @param {string} text
 * @returns {Promise<ArrayBuffer>}
 */
export async function getTTS(text) {
  const { data } = await api.post('/tts', { text }, { responseType: 'arraybuffer' });
  return data;
}
