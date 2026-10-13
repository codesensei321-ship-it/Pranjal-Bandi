import { useState, useRef, useCallback } from 'react';
import { getDeepgramToken, getTTS } from './useApi';

/**
 * Voice conversation hook.
 * States: idle → listening → processing → speaking → idle
 *
 * @param {Object} opts
 * @param {Object} opts.disease - current disease data
 * @param {Object} opts.weather - current weather data
 * @param {(text: string) => Promise<string>} opts.onTranscript - called when final transcript received, should return AI reply text
 * @returns {{ state: string, transcript: string, startListening: () => void, stopListening: () => void }}
 */
function useVoice({ onTranscript } = {}) {
  const [state, setState] = useState('idle'); // idle | listening | processing | speaking
  const [transcript, setTranscript] = useState('');

  const wsRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const audioCtxRef = useRef(null);

  const cleanup = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    mediaRecorderRef.current = null;

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const playAudio = useCallback(
    async (audioBuffer) => {
      return new Promise((resolve) => {
        try {
          const blob = new Blob([audioBuffer], { type: 'audio/mpeg' });
          const url = URL.createObjectURL(blob);
          const audio = new Audio(url);
          setState('speaking');
          audio.onended = () => {
            URL.revokeObjectURL(url);
            setState('idle');
            resolve();
          };
          audio.onerror = () => {
            URL.revokeObjectURL(url);
            setState('idle');
            resolve();
          };
          audio.play().catch(() => {
            setState('idle');
            resolve();
          });
        } catch {
          setState('idle');
          resolve();
        }
      });
    },
    []
  );

  const startListening = useCallback(async () => {
    if (state !== 'idle') return;

    try {
      setState('listening');
      setTranscript('');

      // Get Deepgram token
      const { token } = await getDeepgramToken();

      // Open mic
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Open WebSocket to Deepgram STT
      const ws = new WebSocket(
        `wss://api.deepgram.com/v1/listen?model=nova-2&language=en&smart_format=true&interim_results=true`,
        ['token', token]
      );
      wsRef.current = ws;

      ws.onopen = () => {
        const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0 && ws.readyState === WebSocket.OPEN) {
            ws.send(e.data);
          }
        };

        recorder.start(250); // send chunks every 250ms
      };

      ws.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          const alt = data.channel?.alternatives?.[0];
          if (!alt) return;

          const text = alt.transcript;
          if (text) {
            setTranscript(text);
          }

          if (data.is_final && text) {
            // Final transcript — process it
            cleanup();
            setState('processing');

            if (onTranscript) {
              const reply = await onTranscript(text);
              setTranscript('');

              // TTS for the reply
              if (reply) {
                try {
                  const audioData = await getTTS(reply);
                  await playAudio(audioData);
                } catch {
                  setState('idle');
                }
              } else {
                setState('idle');
              }
            } else {
              setTranscript('');
              setState('idle');
            }
          }
        } catch {
          // Ignore parse errors
        }
      };

      ws.onerror = () => {
        cleanup();
        setState('idle');
      };

      ws.onclose = () => {
        // Normal close
      };
    } catch (err) {
      console.error('Voice error:', err);
      cleanup();
      setState('idle');
    }
  }, [state, cleanup, onTranscript, playAudio]);

  const stopListening = useCallback(() => {
    cleanup();
    setTranscript('');
    setState('idle');
  }, [cleanup]);

  return { state, transcript, startListening, stopListening };
}

export default useVoice;
