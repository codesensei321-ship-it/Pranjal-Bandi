import { motion } from 'framer-motion';
import { Thermometer, Droplets, Wind, MapPin, CloudOff } from 'lucide-react';

function WeatherCard({ weather, locationError }) {
  if (!weather && locationError) {
    return (
      <div className="glass p-6">
        <div className="flex items-center gap-3 text-white/40">
          <CloudOff className="w-5 h-5" />
          <p className="text-sm">
            Location unavailable — weather data requires location access
          </p>
        </div>
      </div>
    );
  }

  if (!weather) return null;

  return (
    <motion.div
      className="glass p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-1.5 text-white/50 text-sm mb-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>{weather.city}</span>
          </div>
          <p className="text-3xl font-bold text-white">
            {Math.round(weather.temperature)}°C
          </p>
          <p className="text-white/50 text-sm capitalize mt-0.5">
            {weather.description}
          </p>
        </div>

        {weather.icon && (
          <img
            src={weather.icon}
            alt={weather.description}
            className="w-16 h-16 -mt-2"
          />
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2 text-white/60 text-sm">
          <Droplets className="w-4 h-4 text-accent-violet" />
          <span>{weather.humidity}% humidity</span>
        </div>
        <div className="flex items-center gap-2 text-white/60 text-sm">
          <Wind className="w-4 h-4 text-accent-violet" />
          <span>{weather.wind_speed} m/s wind</span>
        </div>
      </div>
    </motion.div>
  );
}

export default WeatherCard;
