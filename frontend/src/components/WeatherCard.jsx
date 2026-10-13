import { motion } from 'framer-motion';
import { Thermometer, Droplets, Wind, MapPin, CloudOff } from 'lucide-react';

function WeatherCard({ weather, locationError }) {
  if (!weather && locationError) {
    return (
      <div className="card-green p-5">
        <div className="flex items-center gap-3 text-white/30">
          <CloudOff className="w-5 h-5" />
          <p className="text-sm">Location unavailable — weather data requires location access</p>
        </div>
      </div>
    );
  }

  if (!weather) return null;

  return (
    <motion.div className="card-green p-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-1.5 text-white/40 text-xs mb-1">
            <MapPin className="w-3 h-3" />
            <span>{weather.city}</span>
          </div>
          <p className="text-3xl font-bold text-white">{Math.round(weather.temperature)}°C</p>
          <p className="text-white/40 text-sm capitalize mt-0.5">{weather.description}</p>
        </div>
        {weather.icon && (
          <img src={weather.icon} alt={weather.description} className="w-14 h-14 -mt-1 opacity-80" />
        )}
      </div>
      <div className="flex gap-4 pt-3 border-t border-white/[0.06]">
        <div className="flex items-center gap-1.5 text-white/50 text-xs">
          <Droplets className="w-3.5 h-3.5 text-accent-green/60" />
          <span>{weather.humidity}% humidity</span>
        </div>
        <div className="flex items-center gap-1.5 text-white/50 text-xs">
          <Wind className="w-3.5 h-3.5 text-accent-green/60" />
          <span>{weather.wind_speed} m/s wind</span>
        </div>
      </div>
    </motion.div>
  );
}

export default WeatherCard;
