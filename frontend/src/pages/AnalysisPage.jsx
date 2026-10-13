import { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mic } from 'lucide-react';
import DiseaseCard from '../components/DiseaseCard';
import WeatherCard from '../components/WeatherCard';
import TreatmentPanel from '../components/TreatmentPanel';
import SkeletonLoader from '../components/SkeletonLoader';
import { predictDisease, getWeather, sendChat } from '../hooks/useApi';
import useLocation_ from '../hooks/useLocation';

const fadeIn = {
  hidden: { opacity: 0, y: 24 },
  show: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, type: 'spring', stiffness: 90, damping: 16 },
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

  const imageFile = state?.imageFile;
  const preview = state?.preview;

  useEffect(() => { if (!imageFile) navigate('/', { replace: true }); }, [imageFile, navigate]);

  useEffect(() => {
    if (!imageFile) return;
    let c = false;
    (async () => {
      try { const d = await predictDisease(imageFile); if (!c) setDisease(d); }
      catch { if (!c) setDisease({ disease: 'Unknown', confidence: 0, is_healthy: false }); }
      finally { if (!c) setLoadingDisease(false); }
    })();
    return () => { c = true; };
  }, [imageFile]);

  useEffect(() => {
    if (lat == null || lon == null) { if (locationError) { setWeather(null); setLoadingWeather(false); } return; }
    let c = false;
    (async () => {
      try { const d = await getWeather(lat, lon); if (!c) setWeather(d); } catch {}
      finally { if (!c) setLoadingWeather(false); }
    })();
    return () => { c = true; };
  }, [lat, lon, locationError]);

  const fetchAnalysis = useCallback(async (dd, wd) => {
    try {
      const msg = `Detected: ${dd.disease} (${(dd.confidence*100).toFixed(1)}% confidence). ${wd ? `Weather: ${wd.temperature}°C, ${wd.description}, ${wd.city}.` : ''} Give brief analysis, causes, treatment.`;
      const data = await sendChat(msg, dd.disease, wd, []);
      setAnalysis(data.reply);
    } catch { setAnalysis('Unable to fetch AI analysis.'); }
    finally { setLoadingAnalysis(false); }
  }, []);

  useEffect(() => { if (disease && !loadingWeather) fetchAnalysis(disease, weather); }, [disease, weather, loadingWeather, fetchAnalysis]);

  if (!imageFile) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-4 sm:px-6 pb-8">
      {/* Mobile-first: single column, stacks naturally */}
      <div className="max-w-lg mx-auto space-y-4 pt-6">

        {/* Image — hero style, full width */}
        <motion.div custom={0} variants={fadeIn} initial="hidden" animate="show">
          <div className="card-green p-1.5 glow-green">
            <img src={preview} alt="Uploaded leaf" className="w-full rounded-2xl object-cover max-h-[280px] sm:max-h-[360px]" />
          </div>
        </motion.div>

        {/* Disease */}
        <motion.div custom={1} variants={fadeIn} initial="hidden" animate="show">
          {loadingDisease ? <SkeletonLoader lines={3} /> : <DiseaseCard disease={disease} />}
        </motion.div>

        {/* Weather */}
        <motion.div custom={2} variants={fadeIn} initial="hidden" animate="show">
          {loadingWeather ? <SkeletonLoader lines={3} /> : <WeatherCard weather={weather} locationError={locationError} />}
        </motion.div>

        {/* Treatment */}
        <motion.div custom={3} variants={fadeIn} initial="hidden" animate="show">
          {loadingAnalysis ? <SkeletonLoader lines={5} /> : <TreatmentPanel analysis={analysis} />}
        </motion.div>

        {/* Voice Chat CTA */}
        <motion.div custom={4} variants={fadeIn} initial="hidden" animate="show">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/voice', { state: { disease, weather, preview } })}
            disabled={loadingDisease}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-semibold text-base transition-all disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #4ade80, #22c55e)' }}
          >
            <Mic className="w-5 h-5 text-[#0f1a0f]" />
            <span className="text-[#0f1a0f]">Talk to AI about this plant</span>
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default AnalysisPage;
