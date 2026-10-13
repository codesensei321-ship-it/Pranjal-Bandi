import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, MessageSquare } from 'lucide-react';
import Orb from './Orb';
import useVoice from '../hooks/useVoice';
import { sendChat } from '../hooks/useApi';

function VoiceChat({ disease, weather }) {
  const [textInput, setTextInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef(null);

  const { state: voiceState, transcript, startListening, stopListening } = useVoice({
    disease,
    weather,
    onTranscript: async (text) => {
      // Add user message
      setMessages((prev) => [...prev, { role: 'user', content: text }]);
      // Send to chat API
      try {
        const historyForApi = messages.map((m) => ({
          role: m.role,
          content: m.content,
        }));
        const data = await sendChat(
          text,
          disease?.disease || '',
          weather,
          historyForApi
        );
        setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
        return data.reply; // returned to useVoice for TTS
      } catch {
        const fallback = 'Sorry, I had trouble processing that. Please try again.';
        setMessages((prev) => [...prev, { role: 'assistant', content: fallback }]);
        return fallback;
      }
    },
  });

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, transcript]);

  const handleOrbClick = () => {
    if (voiceState === 'idle') {
      startListening();
    } else if (voiceState === 'listening') {
      stopListening();
    }
  };

  const handleTextSend = async () => {
    const text = textInput.trim();
    if (!text || isSending) return;
    setTextInput('');
    setIsSending(true);
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    try {
      const historyForApi = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));
      const data = await sendChat(
        text,
        disease?.disease || '',
        weather,
        historyForApi
      );
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, something went wrong.' },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="glass p-6">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="w-5 h-5 text-accent-purple" />
        <h3 className="text-lg font-semibold text-white">Voice Chat</h3>
      </div>

      {/* Transcript / messages area */}
      <div
        ref={scrollRef}
        className="h-48 sm:h-64 overflow-y-auto mb-6 space-y-3 pr-2"
      >
        {messages.length === 0 && !transcript && (
          <p className="text-white/30 text-sm text-center mt-8">
            Start a conversation — tap the orb or type below
          </p>
        )}
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                msg.role === 'user'
                  ? 'bg-accent-purple/30 text-white rounded-br-md'
                  : 'glass text-white/80 rounded-bl-md'
              }`}
            >
              {msg.content}
            </div>
          </motion.div>
        ))}
        {transcript && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-end"
          >
            <div className="max-w-[80%] px-4 py-2.5 rounded-2xl rounded-br-md bg-accent-purple/20 text-white/60 text-sm italic">
              {transcript}...
            </div>
          </motion.div>
        )}
      </div>

      {/* Orb */}
      <div className="flex justify-center mb-6">
        <Orb state={voiceState} onClick={handleOrbClick} />
      </div>

      {/* Text input fallback */}
      <div className="flex gap-2">
        <input
          type="text"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleTextSend();
          }}
          placeholder="Type a message..."
          className="flex-1 glass px-4 py-3 rounded-xl text-sm text-white placeholder-white/30 bg-white/5 focus:outline-none focus:border-accent-purple/50 transition-colors"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleTextSend}
          disabled={isSending || !textInput.trim()}
          className="p-3 rounded-xl bg-accent-purple hover:bg-accent-deep text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  );
}

export default VoiceChat;
