import { useState, useEffect, useRef, useCallback } from "react";
import { extractIntentFromVoiceTranscript } from "../services/userAgentService";
import type { VoiceIntentRecord } from "../types/userAgent";

// Type definitions for Web Speech API
interface SpeechRecognitionEventLike extends Event {
  results: {
    length: number;
    [index: number]: {
      [index: number]: {
        transcript: string;
        confidence: number;
      };
      isFinal?: boolean;
    };
  };
}

interface SpeechRecognitionLike extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  }
}

export function useSpeechToIntent(
  onIntentExtracted?: (
    extracted: ReturnType<typeof extractIntentFromVoiceTranscript>,
    transcript: string,
  ) => void,
) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimText, setInterimText] = useState("");
  const [isSupported, setIsSupported] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [recordedVoiceLogs, setRecordedVoiceLogs] = useState<VoiceIntentRecord[]>([]);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechClass) {
      setIsSupported(true);
      try {
        const recognition = new SpeechClass();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onstart = () => {
          setIsListening(true);
          setSpeechError(null);
          startTimeRef.current = Date.now();
        };

        recognition.onresult = (event: SpeechRecognitionEventLike) => {
          let currentInterim = "";
          let finalTranscript = "";

          for (let i = 0; i < event.results.length; i++) {
            const result = event.results[i];
            const text = result[0]?.transcript || "";
            if (result.isFinal) {
              finalTranscript += text + " ";
            } else {
              currentInterim += text;
            }
          }

          if (currentInterim) {
            setInterimText(currentInterim);
          }

          if (finalTranscript) {
            const trimmed = finalTranscript.trim();
            setTranscript(trimmed);
            setInterimText("");

            const extracted = extractIntentFromVoiceTranscript(trimmed);
            const durationSec = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
            const newRecord: VoiceIntentRecord = {
              id: `voice-${Date.now().toString(36)}`,
              transcript: trimmed,
              recordedAt: Date.now(),
              durationSeconds: durationSec,
              detectedEntities: {
                product: extracted.whatToBuy,
                size: extracted.size,
                targetPriceZar: extracted.targetPriceZar,
                stores: extracted.stores,
              },
            };

            setRecordedVoiceLogs((prev) => [newRecord, ...prev]);
            onIntentExtracted?.(extracted, trimmed);
          }
        };

        recognition.onerror = (event: { error: string }) => {
          console.warn("Speech recognition error:", event.error);
          setIsListening(false);
          setSpeechError(
            event.error === "not-allowed"
              ? "Microphone access blocked. Please allow mic permissions in browser."
              : `Voice error: ${event.error}`,
          );
        };

        recognition.onend = () => {
          setIsListening(false);
          setInterimText("");
        };

        recognitionRef.current = recognition;
      } catch (err) {
        console.warn("SpeechRecognition init failed:", err);
        setIsSupported(false);
      }
    } else {
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, [onIntentExtracted]);

  const startListening = useCallback(() => {
    setSpeechError(null);
    setTranscript("");
    setInterimText("");

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch {
        // Recognition might already be running, restart it
        try {
          recognitionRef.current.stop();
          setTimeout(() => recognitionRef.current?.start(), 150);
        } catch (e) {
          console.error("Failed to start speech recognition:", e);
        }
      }
    } else {
      // Fallback: If Web Speech not available in iframe or environment, provide simulated audio recording
      setIsListening(true);
      startTimeRef.current = Date.now();
      setTimeout(() => {
        const sampleSpoken =
          "Find me Nike Air Jordan 1 size UK 9 under R1,600 from Nike Sandton or Takealot";
        setTranscript(sampleSpoken);
        setIsListening(false);
        const extracted = extractIntentFromVoiceTranscript(sampleSpoken);
        const newRecord: VoiceIntentRecord = {
          id: `voice-sim-${Date.now().toString(36)}`,
          transcript: sampleSpoken,
          recordedAt: Date.now(),
          durationSeconds: 3,
          detectedEntities: {
            product: extracted.whatToBuy,
            size: extracted.size,
            targetPriceZar: extracted.targetPriceZar,
            stores: extracted.stores,
          },
        };
        setRecordedVoiceLogs((prev) => [newRecord, ...prev]);
        onIntentExtracted?.(extracted, sampleSpoken);
      }, 2200);
    }
  }, [onIntentExtracted]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsListening(false);
  }, []);

  const simulateSamplePrompt = useCallback(
    (promptText: string) => {
      setTranscript(promptText);
      const extracted = extractIntentFromVoiceTranscript(promptText);
      const newRecord: VoiceIntentRecord = {
        id: `voice-preset-${Date.now().toString(36)}`,
        transcript: promptText,
        recordedAt: Date.now(),
        durationSeconds: 2,
        detectedEntities: {
          product: extracted.whatToBuy,
          size: extracted.size,
          targetPriceZar: extracted.targetPriceZar,
          stores: extracted.stores,
        },
      };
      setRecordedVoiceLogs((prev) => [newRecord, ...prev]);
      onIntentExtracted?.(extracted, promptText);
    },
    [onIntentExtracted],
  );

  return {
    isListening,
    transcript,
    interimText,
    isSupported,
    speechError,
    recordedVoiceLogs,
    startListening,
    stopListening,
    simulateSamplePrompt,
  };
}
