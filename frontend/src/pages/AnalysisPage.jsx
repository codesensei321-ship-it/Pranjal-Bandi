import { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import DiseaseCard from '../components/DiseaseCard';
import WeatherCard from '../components/WeatherCard';
import TreatmentPanel from '../components/TreatmentPanel';
import ChatDrawer from '../components/ChatDrawer';
import SkeletonLoader from '../components/SkeletonLoader';
import { predictDisease, getWeather, sendChat } from '../hooks/useApi';
import useLocation_ from '../hooks/useLocation';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, type: 'spring', stiffness: 80, damping: 15 },
  }),
};

function AnalysisPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { lat, lon, error: locationError } = useLocation_();

  const [disease, setDisease] = useState(null);
  const [weather, setWeather] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loadingDisease, setLoadingDisease] = useState(true);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [loadingAnalysis, setLoadingAnalysis] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const imageFile = state?.imageFile;
  const preview = state?.preview;

  // Redirect if no image
  useEffect(() => {
    if (!imageFile) {
      navigate('/', { replace: true });
    }
  }, [imageFile, navigate]);

  // Predict disease
  useEffect(() => {
    if (!imageFile) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await predictDisease(imageFile);
        if (!cancelled) setDisease(data);
      } catch (err) {
        console.error('Prediction failed:', err);
        if (!cancelled) setDisease({ disease: 'Unknown', confidence: 0, is_healthy: false });
      } finally {
        if (!cancelled) setLoadingDisease(false);
      }
    })();
    return () => { cancelled = true; };
  }, [imageFile]);

  // Fetch weather when location available
  useEffect(() => {
    if (lat == null || lon == null) {
      if (locationError) {
        setWeather(null);
        setLoadingWeather(false);
      }
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const data = await getWeather(lat, lon);
        if (!cancelled) setWeather(data);
      } catch (err) {
        console.error('Weather fetch failed:', err);
      } finally {
        if (!cancelled) setLoadingWeather(false);
      }
    })();
    return () => { cancelled = true; };
  }, [lat, lon, locationError]);

  // Get initial AI analysis once disease (and optionally weather) are ready
  const fetchAnalysis = useCallback(async (diseaseData, weatherData) => {
    try {
      const msg = `I just uploaded a leaf image. The AI model detected: ${diseaseData.disease} with ${(diseaseData.confidence * 100).toFixed(1)}% confidence. ${
        weatherData
          ? `My local weather is ${weatherData.temperature}°C, ${weatherData.description} in ${weatherData.city}.`
          : ''
      } Please give me a brief analysis, causes, and treatment recommendations.`;
      const data = await sendChat(msg, diseaseData.disease, weatherData, []);
      setAnalysis(data.reply);
    } catch (err) {
      console.error('Chat failed:', err);
      setAnalysis('Unable to fetch AI analysis. Please try asking through the voice chat below.');
    } finally {
      setLoadingAnalysis(false);
    }
  }, []);

  useEffect(() => {
    if (!disease) return;
    if (loadingWeather) return; // wait for weather to resolve
    fetchAnalysis(disease, weather);
  }, [disease, weather, loadingWeather, fetchAnalysis]);

  if (!imageFile) return null;

  return (
    <>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12"
    >
      {/* Chat with AI floating button */}
      <div className="flex justify-end mb-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setDrawerOpen(true)}
          className="glass-hover flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white/90 hover:text-white"
        >
          <motion.span
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          >
            <MessageSquare size={18} />
          </motion.span>
          Chat with AI
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Left column — image */}
        <motion.div
          custom={0}
          variants={fadeIn}
          initial="hidden"
          animate="show"
          className="glass p-3 glow-purple self-start"
        >
          <img
            src={preview}
            alt="Uploaded leaf"
            className="w-full rounded-xl object-cover max-h-[400px]"
          />
        </motion.div>

        {/* Right column — cards */}
        <div className="flex flex-col gap-4">
          <motion.div custom={1} variants={fadeIn} initial="hidden" animate="show">
            {loadingDisease ? (
              <SkeletonLoader lines={3} />
            ) : (
              <DiseaseCard disease={disease} />
            )}
          </motion.div>

          <motion.div custom={2} variants={fadeIn} initial="hidden" animate="show">
            {loadingWeather ? (
              <SkeletonLoader lines={4} />
            ) : (
              <WeatherCard weather={weather} locationError={locationError} />
            )}
          </motion.div>

          <motion.div custom={3} variants={fadeIn} initial="hidden" animate="show">
            {loadingAnalysis ? (
              <SkeletonLoader lines={6} />
            ) : (
              <TreatmentPanel analysis={analysis} />
            )}
          </motion.div>
        </div>
      </div>

    </motion.div>

    <ChatDrawer
      isOpen={drawerOpen}
      onClose={() => setDrawerOpen(false)}
      disease={disease}
      weather={weather}
    />
    </>
  );
}

export default AnalysisPage;
