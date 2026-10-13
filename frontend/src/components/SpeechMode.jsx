import { Orb } from './ui/Orb';

const STATE_MAP = {
  idle: null,
  listening: 'listening',
  processing: 'thinking',
  speaking: 'talking',
};

const COLORS = {
  idle: ['#8b5cf6', '#a78bfa'],
  listening: ['#a78bfa', '#06b6d4'],
  processing: ['#8b5cf6', '#a78bfa'],
  speaking: ['#c084fc', '#ec4899'],
};

const STATUS_LABELS = {
  idle: 'Tap to speak',
  listening: 'Listening...',
  processing: 'Thinking...',
  speaking: 'AI is speaking...',
};

function SpeechMode({ voiceState = 'idle', onOrbClick }) {
  const agentState = STATE_MAP[voiceState] ?? null;
  const colors = COLORS[voiceState] || COLORS.idle;
  const label = STATUS_LABELS[voiceState] || STATUS_LABELS.idle;

  return (
    <div className="flex flex-col items-center justify-center h-full">
      {/* Radial glow behind the orb */}
      <div className="bg-[radial-gradient(circle,rgba(139,92,246,0.15),transparent_70%)] p-8">
        <button
          onClick={onOrbClick}
          className="w-56 h-56 md:w-72 md:h-72 cursor-pointer focus:outline-none"
          aria-label={label}
        >
          <Orb
            colors={colors}
            agentState={agentState}
            className="w-full h-full"
          />
        </button>
      </div>

      {/* Status label */}
      <p className="mt-4 text-sm text-white/50 tracking-wide">{label}</p>
    </div>
  );
}

export default SpeechMode;
