import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';

function ChatMode({ messages, transcript, onSendMessage, isSending }) {
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll on new messages or transcript changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, transcript]);

  const handleSend = () => {
    const text = inputRef.current?.value?.trim();
    if (!text || isSending) return;
    inputRef.current.value = '';
    onSendMessage(text);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-3 pr-2 mb-4"
      >
        {messages.length === 0 && !transcript && (
          <p className="text-white/30 text-sm text-center mt-12">
            Start a conversation — type a message below
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

      {/* Text input */}
      <div className="flex gap-2 shrink-0">
        <input
          ref={inputRef}
          type="text"
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
          placeholder="Type a message..."
          className="flex-1 glass px-4 py-3 rounded-xl text-sm text-white placeholder-white/30 bg-white/5 focus:outline-none focus:border-accent-purple/50 transition-colors"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSend}
          disabled={isSending}
          className="p-3 rounded-xl bg-accent-purple hover:bg-accent-deep text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  );
}

export default ChatMode;
