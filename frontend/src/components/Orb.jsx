import { motion } from 'framer-motion';

const orbVariants = {
  idle: {
    scale: [1, 1.05, 1],
    borderRadius: '50%',
    background: 'radial-gradient(circle at 30% 30%, #8b5cf6, #7c3aed, #5b21b6)',
    boxShadow: [
      '0 0 30px rgba(139,92,246,0.3), 0 0 60px rgba(139,92,246,0.1)',
      '0 0 40px rgba(139,92,246,0.4), 0 0 80px rgba(139,92,246,0.15)',
      '0 0 30px rgba(139,92,246,0.3), 0 0 60px rgba(139,92,246,0.1)',
    ],
    transition: {
      scale: { repeat: Infinity, duration: 3, ease: 'easeInOut' },
      boxShadow: { repeat: Infinity, duration: 3, ease: 'easeInOut' },
    },
  },
  listening: {
    scale: [1.1, 1.2, 1.1],
    borderRadius: '50%',
    background: 'radial-gradient(circle at 40% 40%, #a78bfa, #8b5cf6, #06b6d4)',
    boxShadow: [
      '0 0 40px rgba(167,139,250,0.5), 0 0 80px rgba(6,182,212,0.2)',
      '0 0 60px rgba(167,139,250,0.6), 0 0 120px rgba(6,182,212,0.3)',
      '0 0 40px rgba(167,139,250,0.5), 0 0 80px rgba(6,182,212,0.2)',
    ],
    transition: {
      scale: { repeat: Infinity, duration: 1.2, ease: 'easeInOut' },
      boxShadow: { repeat: Infinity, duration: 1.2, ease: 'easeInOut' },
    },
  },
  speaking: {
    scale: [1.05, 1.15, 1.08, 1.12, 1.05],
    borderRadius: [
      '60% 40% 30% 70% / 60% 30% 70% 40%',
      '30% 60% 70% 40% / 50% 60% 30% 60%',
      '50% 50% 40% 60% / 40% 60% 50% 50%',
      '40% 60% 60% 40% / 60% 40% 40% 60%',
      '60% 40% 30% 70% / 60% 30% 70% 40%',
    ],
    background: 'radial-gradient(circle at 50% 50%, #c084fc, #a855f7, #ec4899)',
    boxShadow: [
      '0 0 50px rgba(192,132,252,0.5), 0 0 100px rgba(236,72,153,0.2)',
      '0 0 70px rgba(192,132,252,0.6), 0 0 140px rgba(236,72,153,0.3)',
      '0 0 50px rgba(192,132,252,0.5), 0 0 100px rgba(236,72,153,0.2)',
    ],
    transition: {
      scale: { repeat: Infinity, duration: 1.6, ease: 'easeInOut' },
      borderRadius: { repeat: Infinity, duration: 2, ease: 'easeInOut' },
      boxShadow: { repeat: Infinity, duration: 1.6, ease: 'easeInOut' },
    },
  },
};

const rippleVariants = {
  idle: { scale: 1, opacity: 0 },
  listening: {
    scale: [1, 2.5],
    opacity: [0.4, 0],
    transition: { repeat: Infinity, duration: 1.5, ease: 'easeOut' },
  },
  speaking: { scale: 1, opacity: 0 },
};

const statusLabels = {
  idle: 'Tap to speak',
  listening: 'Listening...',
  processing: 'Thinking...',
  speaking: 'AI is speaking...',
};

function Orb({ state = 'idle', onClick }) {
  const animateState = state === 'processing' ? 'idle' : state;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-32 h-32 flex items-center justify-center">
        {/* Ripple rings for listening */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-accent-violet/30"
          variants={rippleVariants}
          animate={animateState}
        />
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-accent-violet/20"
          variants={rippleVariants}
          animate={animateState}
          transition={{ delay: 0.5 }}
        />

        {/* Main orb */}
        <motion.button
          className="w-24 h-24 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-purple focus-visible:ring-offset-2 focus-visible:ring-offset-background-dark"
          variants={orbVariants}
          animate={animateState}
          onClick={onClick}
          whileTap={{ scale: 0.95 }}
          aria-label={statusLabels[state]}
          style={{ borderRadius: '50%' }}
        />
      </div>

      <motion.p
        className="text-sm text-white/50 font-medium"
        key={state}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {statusLabels[state]}
      </motion.p>
    </div>
  );
}

export default Orb;
