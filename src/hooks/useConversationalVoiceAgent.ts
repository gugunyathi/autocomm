import { useState, useEffect, useRef, useCallback } from "react";
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

interface SpeechRecognitionErrorEventLike extends Event {
  error: string;
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
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
}

export type ConversationalStepId =
  "name" | "whatToBuy" | "sizes" | "stores" | "pricing" | "funding" | "completed";

export interface ConversationalQuestion {
  id: ConversationalStepId;
  stepNumber: number;
  totalSteps: number;
  title: string;
  aiSpeech: string;
  fieldLabel: string;
  quickReplies: string[];
  helperTip: string;
}

export interface ConversationTurn {
  id: string;
  speaker: "ai" | "user";
  text: string;
  timestamp: number;
  stepId?: ConversationalStepId;
}

export const CONVERSATIONAL_QUESTIONS: ConversationalQuestion[] = [
  {
    id: "name",
    stepNumber: 1,
    totalSteps: 6,
    title: "Sovereign Agent Handle",
    aiSpeech:
      "Hello! I am your Autocomm agent architect. Let's create your sovereign shopping agent. First, what personalized name would you like to give your agent?",
    fieldLabel: "Agent Name (.agent)",
    quickReplies: ["Sneakerhead", "Gugu", "ZaraHunter", "Lisa", "BargainScout"],
    helperTip: "Handles with 7+ letters are 100% free forever for human personal agents.",
  },
  {
    id: "whatToBuy",
    stepNumber: 2,
    totalSteps: 6,
    title: "What to Buy & Category",
    aiSpeech:
      "Great choice! Now, what specific product or deal do you want your agent to hunt for across mall corridors?",
    fieldLabel: "Product Wish",
    quickReplies: [
      "Nike Air Jordan 1 Retro",
      "Black wool winter coat",
      "Organic Ethiopian coffee beans",
      "Linen tailored trousers",
    ],
    helperTip: "Name the exact item or style you desire.",
  },
  {
    id: "sizes",
    stepNumber: 3,
    totalSteps: 6,
    title: "Sizes, Dimensions & Colors",
    aiSpeech:
      "Understood! What size, color specifications, or condition preferences should your agent enforce?",
    fieldLabel: "Sizes & Preferences",
    quickReplies: [
      "Size UK 9 / EU 43, Black or White",
      "Medium, 100% Linen relaxed fit",
      "Size 32W 32L, Dark Navy",
      "Brand new in box, any standard fit",
    ],
    helperTip: "Specify shoe or clothing sizes, colors, and condition preferences.",
  },
  {
    id: "stores",
    stepNumber: 4,
    totalSteps: 6,
    title: "Target Stores & Reference Links",
    aiSpeech:
      "Which stores or websites should your agent monitor? For example, Nike Sandton, Zara, Woolworths, or Takealot?",
    fieldLabel: "Target Stores & Links",
    quickReplies: [
      "Woolworths Sandton & Checkers",
      "Nike Flagship & Shelflife",
      "Zara Fourways",
      "Takealot & Superbalist",
    ],
    helperTip: "Mention your favorite mall flagships or paste external links.",
  },
  {
    id: "pricing",
    stepNumber: 5,
    totalSteps: 6,
    title: "Bargain Target & Budget Ceiling",
    aiSpeech:
      "What target price are you hoping to pay, and what is your absolute maximum budget ceiling in Rands?",
    fieldLabel: "Target & Ceiling Price",
    quickReplies: [
      "Target R1,200 (Max R1,600)",
      "Target R850 (Max R1,100)",
      "Target R2,500 (Max R3,200)",
      "Target R250 (Max R350)",
    ],
    helperTip:
      "Your agent will anchor negotiations to your target price and never exceed your ceiling.",
  },
  {
    id: "funding",
    stepNumber: 6,
    totalSteps: 6,
    title: "Pre-Funded Balance & Schedule",
    aiSpeech:
      "Almost finished! Your agent is configured for 24/7 continuous autonomous scanning. How much pre-funded balance would you like to allocate for instant checkout?",
    fieldLabel: "Pre-Funded Wallet",
    quickReplies: [
      "R1,000 via PayShap",
      "R2,500 via PayShap",
      "R500 via Base USDC",
      "R5,000 via Card",
    ],
    helperTip:
      "Pre-funding lets your agent instantly secure limited flash deals the moment a price drops.",
  },
  {
    id: "completed",
    stepNumber: 6,
    totalSteps: 6,
    title: "Ready to Deploy",
    aiSpeech:
      "Fantastic! All information has been provided and saved into your private local memory vault. Your agent is ready to patrol 24/7 with zero-knowledge privacy. Say 'Deploy agent' or tap the button below to launch!",
    fieldLabel: "Configuration Complete",
    quickReplies: ["Deploy Agent Now 🚀", "Review Details", "Start Over"],
    helperTip:
      "Your real identity, address, and cards remain sealed in your private biometric enclave.",
  },
];

interface UseConversationalVoiceAgentProps {
  onStepValueExtracted: (stepId: ConversationalStepId, extractedValue: string) => void;
  onAllCompleted?: () => void;
  onDeployRequested?: () => void;
  initialAgentName?: string;
}

export function useConversationalVoiceAgent({
  onStepValueExtracted,
  onAllCompleted,
  onDeployRequested,
}: UseConversationalVoiceAgentProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isUserListening, setIsUserListening] = useState(false);
  const [isVoiceMuted, setIsVoiceMuted] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimText, setInterimText] = useState("");
  const [conversationHistory, setConversationHistory] = useState<ConversationTurn[]>([]);
  const [recordedVoiceLogs, setRecordedVoiceLogs] = useState<VoiceIntentRecord[]>([]);
  const [speechError, setSpeechError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const startTimeRef = useRef<number>(0);
  const currentStep = CONVERSATIONAL_QUESTIONS[currentStepIndex] || CONVERSATIONAL_QUESTIONS[0];

  // Helper to safely speak text via Web Speech Synthesis (TTS)
  const speakText = useCallback(
    (textToSpeak: string, onDone?: () => void) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        setIsAiSpeaking(false);
        onDone?.();
        return;
      }

      if (isVoiceMuted) {
        setIsAiSpeaking(false);
        onDone?.();
        return;
      }

      try {
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.rate = 1.0;
        utterance.pitch = 1.05;
        utterance.lang = "en-US";

        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(
          (v) =>
            v.lang.startsWith("en") &&
            (v.name.includes("Samantha") ||
              v.name.includes("Victoria") ||
              v.name.includes("Natural") ||
              v.name.includes("Google US English") ||
              v.name.includes("Zira")),
        );
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }

        utterance.onstart = () => {
          setIsAiSpeaking(true);
        };

        utterance.onend = () => {
          setIsAiSpeaking(false);
          currentUtteranceRef.current = null;
          onDone?.();
        };

        utterance.onerror = (e) => {
          console.warn("Speech synthesis error:", e);
          setIsAiSpeaking(false);
          currentUtteranceRef.current = null;
          onDone?.();
        };

        currentUtteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn("TTS failed:", err);
        setIsAiSpeaking(false);
        onDone?.();
      }
    },
    [isVoiceMuted],
  );

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsUserListening(false);
  }, []);

  const restartConversation = useCallback(() => {
    if (typeof window === "undefined") return;
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsAiSpeaking(false);
    setIsUserListening(false);
    setConversationHistory([]);
    setCurrentStepIndex(0);
  }, []);

  // Process user's response (from speech or button tap)
  const handleUserResponse = useCallback(
    (responseText: string) => {
      const cleaned = responseText.trim();
      if (!cleaned) return;

      stopListening();

      // Check if user is asking to deploy
      if (
        currentStep.id === "completed" ||
        cleaned.toLowerCase().includes("deploy") ||
        cleaned.toLowerCase().includes("launch")
      ) {
        if (
          cleaned.toLowerCase().includes("start over") ||
          cleaned.toLowerCase().includes("restart")
        ) {
          restartConversation();
          return;
        }
        if (cleaned.toLowerCase().includes("review")) {
          setCurrentStepIndex(1);
          return;
        }
        onDeployRequested?.();
        return;
      }

      // Record Voice Turn
      const newTurn: ConversationTurn = {
        id: `turn-user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        speaker: "user",
        text: cleaned,
        timestamp: Date.now(),
        stepId: currentStep.id,
      };
      setConversationHistory((prev) => [...prev, newTurn]);

      // Record Voice Log for User Profile
      const voiceRecord: VoiceIntentRecord = {
        id: `voice-turn-${Date.now().toString(36)}`,
        transcript: cleaned,
        recordedAt: Date.now(),
        durationSeconds: Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000)),
      };
      setRecordedVoiceLogs((prev) => [voiceRecord, ...prev]);

      // Extract & notify parent of step value
      onStepValueExtracted(currentStep.id, cleaned);

      // Advance to next step
      const nextIndex = currentStepIndex + 1;
      if (nextIndex < CONVERSATIONAL_QUESTIONS.length) {
        setCurrentStepIndex(nextIndex);
        if (nextIndex === CONVERSATIONAL_QUESTIONS.length - 1) {
          onAllCompleted?.();
        }
      }
    },
    [
      currentStep,
      currentStepIndex,
      onStepValueExtracted,
      onAllCompleted,
      onDeployRequested,
      stopListening,
      restartConversation,
    ],
  );

  // Store handleUserResponse in ref so recognition listener always accesses latest instance
  const handleUserResponseRef = useRef(handleUserResponse);
  useEffect(() => {
    handleUserResponseRef.current = handleUserResponse;
  }, [handleUserResponse]);

  // Start listening for user voice
  const startListening = useCallback(() => {
    if (isAiSpeaking) {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setIsAiSpeaking(false);
    }

    setTranscript("");
    setInterimText("");
    setSpeechError(null);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch {
        try {
          recognitionRef.current.stop();
          setTimeout(() => recognitionRef.current?.start(), 150);
        } catch (e) {
          console.error("Speech start error:", e);
        }
      }
    } else {
      setIsUserListening(true);
      setTimeout(() => {
        setIsUserListening(false);
      }, 1500);
    }
  }, [isAiSpeaking]);

  // Initialize SpeechRecognition once
  useEffect(() => {
    if (typeof window === "undefined") return;

    interface ExtendedWindow {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    }

    const extWin = window as unknown as ExtendedWindow;
    const SpeechClass = extWin.SpeechRecognition || extWin.webkitSpeechRecognition;

    if (SpeechClass) {
      try {
        const recognition = new SpeechClass();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onstart = () => {
          setIsUserListening(true);
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
            handleUserResponseRef.current(trimmed);
          }
        };

        recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
          console.warn("Speech recognition error:", event.error);
          setIsUserListening(false);
          if (event.error === "not-allowed") {
            setSpeechError(
              "Microphone access blocked. Click a quick reply or enable mic permissions.",
            );
          }
        };

        recognition.onend = () => {
          setIsUserListening(false);
          setInterimText("");
        };

        recognitionRef.current = recognition;
      } catch (e) {
        console.warn("Speech recognition initialization failed:", e);
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Speak AI question when current step index changes
  const speakCurrentQuestion = useCallback(
    (autoListenAfter = true) => {
      const q = CONVERSATIONAL_QUESTIONS[currentStepIndex];
      if (!q) return;

      setConversationHistory((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.speaker === "ai" && last.text === q.aiSpeech) {
          return prev;
        }
        return [
          ...prev,
          {
            id: `turn-ai-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            speaker: "ai",
            text: q.aiSpeech,
            timestamp: Date.now(),
            stepId: q.id,
          },
        ];
      });

      speakText(q.aiSpeech, () => {
        if (autoListenAfter && q.id !== "completed") {
          setTimeout(() => {
            startListening();
          }, 350);
        }
      });
    },
    [currentStepIndex, speakText, startListening],
  );

  // Jump to specific step
  const goToStep = useCallback((stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < CONVERSATIONAL_QUESTIONS.length) {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setIsAiSpeaking(false);
      setCurrentStepIndex(stepIndex);
    }
  }, []);

  // Toggle Mute
  const toggleMute = useCallback(() => {
    setIsVoiceMuted((prev) => {
      const next = !prev;
      if (next && typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        setIsAiSpeaking(false);
      }
      return next;
    });
  }, []);

  return {
    currentStep,
    currentStepIndex,
    totalSteps: CONVERSATIONAL_QUESTIONS.length - 1, // Exclude completion card
    isAiSpeaking,
    isUserListening,
    isVoiceMuted,
    transcript,
    interimText,
    conversationHistory,
    recordedVoiceLogs,
    speechError,
    startListening,
    stopListening,
    speakCurrentQuestion,
    handleUserResponse,
    goToStep,
    restartConversation,
    toggleMute,
  };
}
