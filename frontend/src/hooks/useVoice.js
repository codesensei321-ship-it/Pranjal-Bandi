import { useState, useRef, useCallback } from 'react';
import { getDeepgramToken, getTTS } from './useApi';

/**
 * Push-to-talk voice hook.
 * Hold to listen, release to submit.
 * States: idle → listening → processing → speaking → idle
 */
function useVoice({ onTranscript } = {}) {
  const [state, setState] = useState('idle');
  const [transcript, setTranscript] = useState('');

  const wsRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const fullTranscriptRef = useRef('');

  const cleanup = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    mediaRecorderRef.current = null;
    if (wsRef.current) { wsRef.current.close(); wsRef.current = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; }
  }, []);

  const playAudio = useCallback(async (audioBuffer) => {
    return new Promise((resolve) => {
      try {
        const blob = new Blob([audioBuffer], { type: 'audio/mpeg' });
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        setState('speaking');
        audio.onended = () => { URL.revokeObjectURL(url); setState('idle'); resolve(); };
        audio.onerror = () => { URL.revokeObjectURL(url); setState('idle'); resolve(); };
        audio.play().catch(() => { setState('idle'); resolve(); });
      } catch { setState('idle'); resolve(); }
    });
  }, []);

  const startListening = useCallback(async () => {
    if (state !== 'idle') return;

    try {
      setState('listening');
      setTranscript('');
      fullTranscriptRef.current = '';

      const { token } = await getDeepgramToken();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const ws = new WebSocket(
        'wss://api.deepgram.com/v1/listen?model=nova-2&language=en&smart_format=true&interim_results=true',
        ['token', token]
      );
      wsRef.current = ws;

      ws.onopen = () => {
        const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        mediaRecorderRef.current = recorder;
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0 && ws.readyState === WebSocket.OPEN) ws.send(e.data);
        };
        recorder.start(250);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const alt = data.channel?.alternatives?.[0];
          if (!alt) return;
          const text = alt.transcript;
          if (data.is_final && text) {
            // Accumulate final transcript segments
            fullTranscriptRef.current = (fullTranscriptRef.current + ' ' + text).trim();
            setTranscript(fullTranscriptRef.current);
          } else if (text) {
            // Show interim (accumulated finals + current interim)
            setTranscript((fullTranscriptRef.current + ' ' + text).trim());
          }
        } catch { /* ignore */ }
      };

      ws.onerror = () => { cleanup(); setState('idle'); };
    } catch (err) {
      console.error('Voice error:', err);
      cleanup();
      setState('idle');
    }
  }, [state, cleanup]);

  const stopListening = useCallback(async () => {
    cleanup();
    const finalText = fullTranscriptRef.current.trim();
    setTranscript('');

    if (!finalText) {
      setState('idle');
      return;
    }

    // Submit the accumulated transcript
    setState('processing');
    if (onTranscript) {
      try {
        const reply = await onTranscript(finalText);
        if (reply) {
          try {
            const audioData = await getTTS(reply);
            await playAudio(audioData);
          } catch { setState('idle'); }
        } else {
          setState('idle');
        }
      } catch {
        setState('idle');
      }
    } else {
      setState('idle');
    }
  }, [cleanup, onTranscript, playAudio]);

  return { state, transcript, startListening, stopListening };
}

export default useVoice;
