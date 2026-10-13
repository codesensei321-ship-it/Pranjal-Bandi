import { useEffect, useState, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Leaf, MapPin, Send } from 'lucide-react';
import { Orb } from '../components/ui/Orb';
import useVoice from '../hooks/useVoice';
import { sendChat } from '../hooks/useApi';

/* Orb is used directly in this page — no SpeechMode wrapper needed */

const STATE_MAP = { idle: null, listening: 'listening', processing: 'thinking', speaking: 'talking' };
const COLORS = {
  idle: ['#4ade80', '#34d399'],
  listening: ['#34d399', '#06b6d4'],
  processing: ['#a78bfa', '#8b5cf6'],
  speaking: ['#c084fc', '#ec4899'],
};
const STATUS = {
  idle: 'Hold Space to speak',
  listening: 'Listening — release to send',
  processing: 'Thinking...',
  speaking: 'Speaking...',
};

function VoicePage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const disease = state?.disease;
  const weather = state?.weather;
  const preview = state?.preview;

  const [messages, setMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const messagesRef = useRef([]);
  const inputRef = useRef(null);
  const scrollRef = useRef(null);
  const holdingRef = useRef(false);

  // Redirect if no context
  useEffect(() => {
    if (!disease) navigate('/', { replace: true });
  }, [disease, navigate]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  // Voice transcript handler
  const onTranscript = useCallback(async (text) => {
    const userMsg = { role: 'user', content: text };
    setMessages((prev) => { const next = [...prev, userMsg]; messagesRef.current = next; return next; });
    try {
      const hist = messagesRef.current.map((m) => ({ role: m.role, content: m.content }));
      const data = await sendChat(text, disease?.disease || '', weather, hist);
      const aiMsg = { role: 'assistant', content: data.reply };
      setMessages((prev) => { const next = [...prev, aiMsg]; messagesRef.current = next; return next; });
      return data.reply;
    } catch {
      const fb = 'Sorry, something went wrong.';
      setMessages((prev) => { const next = [...prev, { role: 'assistant', content: fb }]; messagesRef.current = next; return next; });
      return fb;
    }
  }, [disease, weather]);

  const { state: voiceState, transcript, startListening, stopListening } = useVoice({ onTranscript });

  // Hold spacebar to talk
  useEffect(() => {
    const onDown = (e) => {
      if (e.code === 'Space' && !holdingRef.current && e.target.tagName !== 'INPUT') {
        e.preventDefault();
        holdingRef.current = true;
        if (voiceState === 'idle') startListening();
      }
    };
    const onUp = (e) => {
      if (e.code === 'Space' && holdingRef.current && e.target.tagName !== 'INPUT') {
        e.preventDefault();
        holdingRef.current = false;
        if (voiceState === 'listening') stopListening();
      }
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => { window.removeEventListener('keydown', onDown); window.removeEventListener('keyup', onUp); };
  }, [voiceState, startListening, stopListening]);

  // Tap orb for mobile
  const handleOrbTap = () => {
    if (voiceState === 'idle') startListening();
    else if (voiceState === 'listening') stopListening();
  };

  // Text fallback
  const handleTextSend = async () => {
    const text = inputRef.current?.value?.trim();
    if (!text || isSending) return;
    inputRef.current.value = '';
    setIsSending(true);
    setMessages((prev) => { const next = [...prev, { role: 'user', content: text }]; messagesRef.current = next; return next; });
    try {
      const hist = messagesRef.current.map((m) => ({ role: m.role, content: m.content }));
      const data = await sendChat(text, disease?.disease || '', weather, hist);
      setMessages((prev) => { const next = [...prev, { role: 'assistant', content: data.reply }]; messagesRef.current = next; return next; });
    } catch {
      setMessages((prev) => { const next = [...prev, { role: 'assistant', content: 'Error.' }]; messagesRef.current = next; return next; });
    } finally { setIsSending(false); }
  };

  const colors = COLORS[voiceState] || COLORS.idle;
  const agentState = STATE_MAP[voiceState] ?? null;
  const label = STATUS[voiceState] || STATUS.idle;

  if (!disease) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-[calc(100vh-4rem)]"
    >
      {/* Context bar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06] bg-background-dark/60 backdrop-blur-xl">
        <button onClick={() => navigate(-1)} className="p-2 -ml-1 rounded-xl text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        {preview && <img src={preview} alt="" className="w-9 h-9 rounded-lg object-cover" />}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate flex items-center gap-1.5">
            <Leaf className="w-3.5 h-3.5 text-accent-green flex-shrink-0" />
            {disease?.disease}
          </p>
          {weather && (
            <p className="text-xs text-white/30 truncate flex items-center gap-1">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              {weather.city} · {Math.round(weather.temperature)}°C
            </p>
          )}
        </div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${disease?.is_healthy ? 'bg-accent-green/10 text-accent-green' : 'bg-orange-400/10 text-orange-400'}`}>
          {disease?.is_healthy ? 'Healthy' : 'Disease'}
        </span>
      </div>

      {/* Main content — orb + messages */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Messages area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.length === 0 && !transcript && (
            <div className="flex flex-col items-center justify-center h-full text-center opacity-40">
              <p className="text-sm text-white/40">Ask anything about your plant</p>
              <p className="text-xs text-white/25 mt-1">Hold Space or tap the orb</p>
            </div>
          )}
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-accent-green/15 text-white/90 rounded-2xl rounded-br-md'
                    : 'bg-white/[0.04] border border-white/[0.06] text-white/70 rounded-2xl rounded-bl-md'
                }`}>
                  {msg.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {transcript && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} className="flex justify-end">
              <div className="max-w-[85%] px-4 py-2.5 rounded-2xl rounded-br-md bg-accent-green/8 text-white/50 text-sm italic">
                {transcript}...
              </div>
            </motion.div>
          )}
        </div>

        {/* Orb section */}
        <div className="flex flex-col items-center py-4 px-4">
          {/* Glow */}
          <div className="relative mb-2">
            <div
              className="absolute inset-0 rounded-full blur-3xl opacity-15 pointer-events-none"
              style={{ background: `radial-gradient(circle, ${colors[0]}, transparent 70%)`, transform: 'scale(2)' }}
            />
            <button
              onClick={handleOrbTap}
              className="relative w-28 h-28 sm:w-36 sm:h-36 cursor-pointer focus:outline-none"
              aria-label={label}
            >
              <Orb colors={colors} agentState={agentState} className="w-full h-full" />
            </button>
          </div>
          <p className="text-xs text-white/30 font-medium tracking-wide">{label}</p>
        </div>

        {/* Text input */}
        <div className="px-4 pb-4 pt-2">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              onKeyDown={(e) => { if (e.key === 'Enter') handleTextSend(); }}
              placeholder="Or type a message..."
              className="flex-1 px-4 py-3 rounded-xl text-sm text-white placeholder-white/20 bg-white/[0.04] border border-white/[0.06] focus:outline-none focus:border-accent-green/30 transition-colors"
            />
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleTextSend}
              disabled={isSending}
              className="p-3 rounded-xl text-[#0f1a0f] disabled:opacity-30"
              style={{ background: 'linear-gradient(135deg, #4ade80, #34d399)' }}
              aria-label="Send"
            >
              <Send className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default VoicePage;
