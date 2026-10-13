import { useState, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import ChatMode from './ChatMode';
import SpeechMode from './SpeechMode';
import useVoice from '../hooks/useVoice';
import { sendChat } from '../hooks/useApi';

function ChatDrawer({ isOpen, onClose, disease, weather }) {
  const [mode, setMode] = useState('chat'); // 'chat' | 'speech'
  const [messages, setMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const isSendingRef = useRef(false);
  const messagesRef = useRef(messages);

  // Shared onTranscript callback for useVoice — adds user msg, calls sendChat, adds AI reply, returns reply for TTS
  const onTranscript = useCallback(
    async (text) => {
      const userMsg = { role: 'user', content: text };
      setMessages((prev) => {
        const next = [...prev, userMsg];
        messagesRef.current = next;
        return next;
      });
      try {
        const historyForApi = messagesRef.current.map((m) => ({
          role: m.role,
          content: m.content,
        }));
        const data = await sendChat(
          text,
          disease?.disease || '',
          weather,
          historyForApi
        );
        setMessages((prev) => {
          const next = [...prev, { role: 'assistant', content: data.reply }];
          messagesRef.current = next;
          return next;
        });
        return data.reply;
      } catch {
        const fallback = 'Sorry, I had trouble processing that. Please try again.';
        setMessages((prev) => {
          const next = [...prev, { role: 'assistant', content: fallback }];
          messagesRef.current = next;
          return next;
        });
        return fallback;
      }
    },
    [disease, weather]
  );

  const { state: voiceState, transcript, startListening, stopListening } = useVoice({
    onTranscript,
  });

  // Text send handler shared by ChatMode
  const handleTextSend = useCallback(
    async (text) => {
      if (!text || isSendingRef.current) return;
      isSendingRef.current = true;
      setIsSending(true);
      const userMsg = { role: 'user', content: text };
      setMessages((prev) => {
        const next = [...prev, userMsg];
        messagesRef.current = next;
        return next;
      });
      try {
        const historyForApi = messagesRef.current.map((m) => ({
          role: m.role,
          content: m.content,
        }));
        const data = await sendChat(
          text,
          disease?.disease || '',
          weather,
          historyForApi
        );
        setMessages((prev) => {
          const next = [...prev, { role: 'assistant', content: data.reply }];
          messagesRef.current = next;
          return next;
        });
      } catch {
        setMessages((prev) => {
          const next = [...prev, { role: 'assistant', content: 'Sorry, something went wrong.' }];
          messagesRef.current = next;
          return next;
        });
      } finally {
        isSendingRef.current = false;
        setIsSending(false);
      }
    },
    [disease, weather]
  );

  const handleOrbClick = () => {
    if (voiceState === 'idle') {
      startListening();
    } else if (voiceState === 'listening') {
      stopListening();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            key="drawer-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer panel */}
          <motion.div
            key="drawer-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 h-full w-full max-w-md z-50 flex flex-col bg-background-dark/95 border-l border-white/10 backdrop-blur-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              {/* Chat / Speech toggle */}
              <div role="tablist" aria-label="Chat mode" className="flex gap-1 rounded-lg bg-white/5 p-1">
                <button
                  role="tab"
                  aria-selected={mode === 'chat'}
                  onClick={() => setMode('chat')}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    mode === 'chat'
                      ? 'bg-accent-purple/30 text-white'
                      : 'text-white/50 hover:text-white/70'
                  }`}
                >
                  Chat
                </button>
                <button
                  role="tab"
                  aria-selected={mode === 'speech'}
                  onClick={() => setMode('speech')}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    mode === 'speech'
                      ? 'bg-accent-purple/30 text-white'
                      : 'text-white/50 hover:text-white/70'
                  }`}
                >
                  Speech
                </button>
              </div>

              {/* Close button */}
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors"
                aria-label="Close drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-hidden p-5">
              {mode === 'chat' ? (
                <ChatMode
                  messages={messages}
                  transcript={transcript}
                  onSendMessage={handleTextSend}
                  isSending={isSending}
                />
              ) : (
                <SpeechMode
                  voiceState={voiceState}
                  onOrbClick={handleOrbClick}
                />
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default ChatDrawer;
