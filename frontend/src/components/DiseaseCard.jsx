import { motion } from 'framer-motion';
import { ShieldCheck, ShieldAlert } from 'lucide-react';

function DiseaseCard({ disease }) {
  if (!disease) return null;

  const confidence = Math.round((disease.confidence || 0) * 100);
  const isHealthy = disease.is_healthy;
  const accentColor = isHealthy ? '#4ade80' : '#fb923c';
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (confidence / 100) * circumference;

  return (
    <div className="card-green p-5">
      <div className="flex items-center gap-4">
        {/* Circular progress */}
        <div className="relative w-20 h-20 flex-shrink-0">
          <svg className="w-20 h-20 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.06)" strokeWidth="6" fill="none" />
            <motion.circle
              cx="50" cy="50" r="40"
              stroke={accentColor}
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              strokeDasharray={circumference}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.span
              className="text-base font-bold"
              style={{ color: accentColor }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {confidence}%
            </motion.span>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            {isHealthy ? (
              <ShieldCheck className="w-4 h-4 text-green-400" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-orange-400" />
            )}
            <span
              className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
              style={{
                backgroundColor: isHealthy ? 'rgba(74,222,128,0.12)' : 'rgba(251,146,60,0.12)',
                color: accentColor,
              }}
            >
              {isHealthy ? 'Healthy' : 'Disease Detected'}
            </span>
          </div>
          <h3 className="text-lg font-bold text-white truncate">{disease.disease}</h3>
          <p className="text-white/30 text-xs mt-0.5">Model confidence</p>
        </div>
      </div>
    </div>
  );
}

export default DiseaseCard;
