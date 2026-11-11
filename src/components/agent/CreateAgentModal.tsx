import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  X,
  Mic,
  MicOff,
  Sparkles,
  ShieldCheck,
  Clock,
  Wallet,
  Store,
  Upload,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  Laptop,
  Smartphone,
  Glasses,
  Watch,
  Volume2,
  VolumeX,
  RotateCcw,
  FileText,
  Trash2,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  ArrowRight,
  Plus,
  Send,
  Sliders,
  UserCheck,
} from "lucide-react";
import {
  searchAgentNames,
  claimAgentName,
  calculateNamePricing,
} from "@/services/agentNameService";
import {
  saveUserPersonalAgent,
  parseUploadedBillFile,
  extractIntentFromVoiceTranscript,
} from "@/services/userAgentService";
import { useConversationalVoiceAgent } from "@/hooks/useConversationalVoiceAgent";
import type { UserPersonalAgent, AgentDeviceMode, MemoryVaultBill } from "@/types/userAgent";
import type { PasskeyUser } from "@/lib/passkey-auth";

interface CreateAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: PasskeyUser | null;
  onAgentCreated: (agent: UserPersonalAgent) => void;
  onLaunchMeshView?: () => void;
}

type StepTabId = "name" | "wish" | "stores" | "budget" | "memory";

interface StepConfig {
  id: StepTabId;
  stepNumber: number;
  label: string;
  shortTitle: string;
  aiPrompt: string;
}

const STEPS: StepConfig[] = [
  {
    id: "name",
    stepNumber: 1,
    label: "Agent Name",
    shortTitle: "Name & Handle",
    aiPrompt:
      "Hello! Let's build your sovereign shopping agent. What personalized name would you like for your agent?",
  },
  {
    id: "wish",
    stepNumber: 2,
    label: "Wish & Specs",
    shortTitle: "What to Buy & Size",
    aiPrompt:
      "What product or deal are you looking for, and what size, color, or condition preferences do you need?",
  },
  {
    id: "stores",
    stepNumber: 3,
    label: "Stores & Links",
    shortTitle: "Stores & URLs",
    aiPrompt:
      "Which mall stores or external reference links should your agent monitor for discounts?",
  },
  {
    id: "budget",
    stepNumber: 4,
    label: "Budget & Schedule",
    shortTitle: "Bargain Price & 24/7",
    aiPrompt:
      "What is your target bargain price, and how much pre-funded balance would you like to allocate for instant checkout?",
  },
  {
    id: "memory",
    stepNumber: 5,
    label: "Memory & Launch",
    shortTitle: "Receipts & Deploy",
    aiPrompt:
      "Upload past receipts or review your agent passport. Ready to launch and patrol mall corridors 24/7!",
  },
];

const PRESET_SIZES = [
  "UK 8 / EU 42",
  "UK 9 / EU 43",
  "UK 10 / EU 44",
  "Small",
  "Medium",
  "Large",
  "32W 32L",
];

const POPULAR_MALL_STORES = [
  "Woolworths Sandton",
  "Nike Flagship",
  "Zara Fourways",
  "Takealot",
  "Superbalist",
  "Checkers Hyper",
  "iStore",
  "Cotton On",
];

const PRESET_CATEGORIES = [
  "Apparel & Footwear",
  "Electronics & Tech",
  "Groceries & Food",
  "Health & Beauty",
  "Sports & Outdoors",
  "Home & Living",
];

export const CreateAgentModal: React.FC<CreateAgentModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onAgentCreated,
  onLaunchMeshView,
}) => {
  // Device Mode Viewport Simulator
  const [deviceMode, setDeviceMode] = useState<AgentDeviceMode>("auto");

  // Active Multi-Page Tab Step (1 to 5)
  const [currentTab, setCurrentTab] = useState<StepTabId>("name");

  // Form Fields State
  const [agentNameInput, setAgentNameInput] = useState(() => {
    if (currentUser?.name) {
      return currentUser.name.toLowerCase().replace(/[^a-z0-9]/g, "");
    }
    return "";
  });
  const [whatToBuy, setWhatToBuy] = useState("");
  const [category, setCategory] = useState("Apparel & Footwear");
  const [sizes, setSizes] = useState("");
  const [preferences, setPreferences] = useState("");
  const [referenceUrlInput, setReferenceUrlInput] = useState("");
  const [referenceLinks, setReferenceLinks] = useState<string[]>([]);
  const [targetPriceZar, setTargetPriceZar] = useState(1200);
  const [ceilingPriceZar, setCeilingPriceZar] = useState(1600);
  const [targetDiscountPercent, setTargetDiscountPercent] = useState(25);
  const [storeInput, setStoreInput] = useState("");
  const [selectedStores, setSelectedStores] = useState<string[]>([
    "Woolworths Sandton",
    "Nike Flagship",
  ]);
  const [is24_7, setIs24_7] = useState(true);
  const [activeFrom, setActiveFrom] = useState("08:00");
  const [sleepAt, setSleepAt] = useState("22:00");
  const [preFundedBalanceZar, setPreFundedBalanceZar] = useState(1000);
  const [paymentRail, setPaymentRail] = useState<
    "PAYSHAP_STITCH" | "BASE_USDC" | "CARD" | "SOLANA_PAY"
  >("PAYSHAP_STITCH");
  const [zeroKnowledgeShield, setZeroKnowledgeShield] = useState(true);
  const [stealthBargaining, setStealthBargaining] = useState(false);

  // Quick Spoken or Typed Response Input
  const [voiceQuickInput, setVoiceQuickInput] = useState("");

  // Uploaded Bills in Memory Vault
  const [uploadedBills, setUploadedBills] = useState<MemoryVaultBill[]>([]);
  const [isUploadingBill, setIsUploadingBill] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Name Availability & ANS Pricing
  const [isCheckingName, setIsCheckingName] = useState(false);
  const [nameAvailability, setNameAvailability] = useState<{
    canClaim: boolean;
    isExactMatch: boolean;
    statusText: string;
    priceUsd: number;
    priceZar: number;
    isFree: boolean;
    tier: string;
  } | null>(null);

  // Deployment Processing
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploySuccess, setDeploySuccess] = useState(false);
  const [createdAgentRecord, setCreatedAgentRecord] = useState<UserPersonalAgent | null>(null);

  // Deploy and launch the agent
  const handleDeployAgent = useCallback(async () => {
    const rawName =
      agentNameInput
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, "") || "myagent";
    setIsDeploying(true);

    try {
      try {
        await claimAgentName({
          name: rawName,
          type: "personal",
          paymentMethod: nameAvailability?.isFree ? "card" : "crypto",
          isAgent: false,
        });
      } catch {
        // Fallback gracefully
      }

      const newAgent: UserPersonalAgent = {
        id: `agent-${rawName}-${Date.now().toString(36)}`,
        name: rawName,
        fullName: `${rawName}.agent`,
        pricingUsd: nameAvailability?.priceUsd || 0,
        pricingZar: nameAvailability?.priceZar || 0,
        isFreeTier: nameAvailability?.isFree ?? true,
        avatarIcon: "🤖",
        avatarColor: "emerald",
        intent: {
          whatToBuy: whatToBuy || "Mall Flash Deals",
          category,
          sizes: sizes || "Any",
          preferences: preferences || "Best condition, verified merchant",
          referenceLinks,
          targetPriceZar,
          ceilingPriceZar,
          targetDiscountPercent,
          stores: selectedStores.length > 0 ? selectedStores : ["Sandton City Flagships"],
        },
        memoryVault: {
          bills: uploadedBills,
          shoppingLists: uploadedBills.flatMap((b) => b.extractedItems.map((i) => i.name)),
          learnedPreferencesCount: uploadedBills.reduce(
            (acc, b) => acc + b.extractedItems.length,
            3,
          ),
        },
        voiceIntents: [],
        schedule: {
          is24_7,
          activeFrom: is24_7 ? "00:00" : activeFrom,
          sleepAt: is24_7 ? "23:59" : sleepAt,
          timezone: "Africa/Johannesburg",
          currentStatus: "ONLINE_24_7",
        },
        privacy: {
          zeroKnowledgeShield,
          stealthBargaining,
          localEnclaveStorage: true,
        },
        funding: {
          preFundedBalanceZar,
          currency: "ZAR",
          paymentRail,
          autoExecuteDeals: true,
        },
        createdAt: Date.now(),
        lastActiveAt: Date.now(),
      };

      saveUserPersonalAgent(newAgent);
      setCreatedAgentRecord(newAgent);
      setDeploySuccess(true);
      onAgentCreated(newAgent);

      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate?.([60, 40, 100, 50, 120]);
      }
    } catch (err) {
      console.error("Agent deployment failed:", err);
    } finally {
      setIsDeploying(false);
    }
  }, [
    agentNameInput,
    nameAvailability,
    whatToBuy,
    category,
    sizes,
    preferences,
    referenceLinks,
    targetPriceZar,
    ceilingPriceZar,
    targetDiscountPercent,
    selectedStores,
    uploadedBills,
    is24_7,
    activeFrom,
    sleepAt,
    preFundedBalanceZar,
    paymentRail,
    zeroKnowledgeShield,
    stealthBargaining,
    onAgentCreated,
  ]);

  // Handle value extracted from conversational turn
  const handleConversationalStepValue = useCallback(
    (_stepId: string, value: string) => {
      const clean = value.trim();
      if (!clean) return;

      switch (currentTab) {
        case "name": {
          const extractedName = clean
            .toLowerCase()
            .replace(/^(call it|my agent is|name is|i want)\s+/i, "")
            .replace(/\.agent$/i, "")
            .replace(/[^a-z0-9_-]/g, "");
          if (extractedName) {
            setAgentNameInput(extractedName);
          }
          break;
        }
        case "wish": {
          setWhatToBuy(clean);
          const parsed = extractIntentFromVoiceTranscript(clean);
          if (parsed.category) setCategory(parsed.category);
          if (parsed.size) setSizes(parsed.size);
          break;
        }
        case "stores": {
          const detectedStores: string[] = [];
          const known = [
            "woolworths",
            "nike",
            "zara",
            "takealot",
            "superbalist",
            "checkers",
            "istore",
            "cotton on",
            "shelflife",
          ];
          for (const s of known) {
            if (clean.toLowerCase().includes(s)) {
              detectedStores.push(s.charAt(0).toUpperCase() + s.slice(1));
            }
          }
          if (detectedStores.length > 0) {
            setSelectedStores((prev) => Array.from(new Set([...prev, ...detectedStores])));
          } else {
            setSelectedStores((prev) => Array.from(new Set([...prev, clean])));
          }
          break;
        }
        case "budget": {
          const parsed = extractIntentFromVoiceTranscript(clean);
          if (parsed.targetPriceZar) {
            setTargetPriceZar(parsed.targetPriceZar);
            setCeilingPriceZar(Math.round(parsed.targetPriceZar * 1.3));
          } else {
            const numMatch = clean.match(/(\d{2,6})/);
            if (numMatch?.[1]) {
              const num = parseInt(numMatch[1], 10);
              setTargetPriceZar(num);
              setCeilingPriceZar(Math.round(num * 1.3));
            }
          }
          break;
        }
        case "memory": {
          if (clean.toLowerCase().includes("deploy") || clean.toLowerCase().includes("launch")) {
            handleDeployAgent();
          }
          break;
        }
      }
    },
    [currentTab, handleDeployAgent],
  );

  // 2-Way Conversational Voice Hook
  const {
    isAiSpeaking,
    isUserListening,
    isVoiceMuted,
    transcript,
    interimText,
    speechError,
    startListening,
    stopListening,
    speakCurrentQuestion,
    handleUserResponse,
    toggleMute,
  } = useConversationalVoiceAgent({
    onStepValueExtracted: handleConversationalStepValue,
    onDeployRequested: handleDeployAgent,
    initialAgentName: agentNameInput,
  });

  const currentStepConfig = useMemo(
    () => STEPS.find((s) => s.id === currentTab) || STEPS[0],
    [currentTab],
  );

  const currentStepIndex = STEPS.findIndex((s) => s.id === currentTab);

  // When step tab changes, speak current question if unmuted
  useEffect(() => {
    if (isOpen && !deploySuccess && !isVoiceMuted) {
      const timer = setTimeout(() => {
        speakCurrentQuestion(false);
      }, 350);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [currentTab, isOpen, deploySuccess, isVoiceMuted, speakCurrentQuestion]);

  // Real-time ANS name availability & pricing
  useEffect(() => {
    const rawName = agentNameInput
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "");
    if (!rawName) {
      setNameAvailability(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingName(true);
      try {
        const pricing = calculateNamePricing(rawName, false);
        const search = await searchAgentNames(rawName, false);

        const isFree = pricing.isFreeTier;
        const canClaim = search.canClaimDirectly;

        setNameAvailability({
          canClaim,
          isExactMatch: search.isExactMatch,
          statusText: canClaim
            ? isFree
              ? "Available · 100% Free Human Handle"
              : `Available · ${pricing.tierLabel}`
            : "Handle Already Claimed / In Auction",
          priceUsd: pricing.priceUsd,
          priceZar: pricing.priceZar,
          isFree,
          tier: pricing.tierLabel,
        });
      } catch (e) {
        console.error("Name check error:", e);
      } finally {
        setIsCheckingName(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [agentNameInput]);

  // File Upload
  const handleBillFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    setIsUploadingBill(true);
    try {
      const parsedBill = await parseUploadedBillFile(file);
      setUploadedBills((prev) => [parsedBill, ...prev]);
      if (!whatToBuy && parsedBill.extractedItems[0]) {
        setWhatToBuy(parsedBill.extractedItems[0].name);
      }
    } catch (err) {
      console.error("Failed to parse bill file:", err);
    } finally {
      setIsUploadingBill(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAddReferenceLink = () => {
    const url = referenceUrlInput.trim();
    if (!url) return;
    let formatted = url;
    if (!/^https?:\/\//i.test(formatted)) {
      formatted = `https://${formatted}`;
    }
    if (!referenceLinks.includes(formatted)) {
      setReferenceLinks([...referenceLinks, formatted]);
    }
    setReferenceUrlInput("");
  };

  const handleToggleStore = (store: string) => {
    if (selectedStores.includes(store)) {
      setSelectedStores(selectedStores.filter((s) => s !== store));
    } else {
      setSelectedStores([...selectedStores, store]);
    }
  };

  const handleAddCustomStore = () => {
    const s = storeInput.trim();
    if (!s) return;
    if (!selectedStores.includes(s)) {
      setSelectedStores([...selectedStores, s]);
    }
    setStoreInput("");
  };

  const handleQuickVoiceAnswer = (answer: string) => {
    handleConversationalStepValue(currentTab, answer);
    handleUserResponse(answer);
  };

  const handleSubmitQuickText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voiceQuickInput.trim()) return;
    handleQuickVoiceAnswer(voiceQuickInput);
    setVoiceQuickInput("");
  };

  // Navigation between Tabs
  const handleNextTab = () => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentTab(STEPS[currentStepIndex + 1].id);
    }
  };

  const handlePrevTab = () => {
    if (currentStepIndex > 0) {
      setCurrentTab(STEPS[currentStepIndex - 1].id);
    }
  };

  // Device Container Styling
  const deviceWrapperClass = useMemo(() => {
    switch (deviceMode) {
      case "smartwatch":
        return "max-w-[340px] max-h-[520px] rounded-[48px] border-8 border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.8)]";
      case "meta_ar":
        return "max-w-[760px] max-h-[85vh] rounded-2xl border-2 border-cyan-500/70 bg-black/95 text-cyan-400 font-mono shadow-[0_0_40px_rgba(6,182,212,0.3)]";
      case "mobile":
        return "max-w-[430px] max-h-[90vh] rounded-[36px] border-4 border-slate-800 shadow-2xl";
      default:
        return "max-w-3xl max-h-[90vh] md:max-h-[85vh] rounded-3xl border border-slate-800/80 shadow-2xl";
    }
  }, [deviceMode]);

  // Scroll container ref & modern subtle indicators state (replacing old-school OS scrollbars)
  const contentScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const checkScrollPosition = useCallback(() => {
    const el = contentScrollRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const maxScroll = scrollHeight - clientHeight;
    setCanScrollUp(scrollTop > 12);
    setCanScrollDown(maxScroll > 12 && scrollTop < maxScroll - 12);
    if (maxScroll > 0) {
      setScrollProgress(Math.min(100, Math.max(0, Math.round((scrollTop / maxScroll) * 100))));
    } else {
      setScrollProgress(0);
    }
  }, []);

  // Prevent background body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Recalculate scroll indicator states whenever tab, device mode, or content changes
  useEffect(() => {
    if (!isOpen) return;
    checkScrollPosition();
    const timeoutId = setTimeout(checkScrollPosition, 60);
    const handleResize = () => checkScrollPosition();
    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", handleResize);
    };
  }, [isOpen, currentTab, deviceMode, uploadedBills, checkScrollPosition]);

  // Modern subtle smooth scroll actions for mobile & laptop
  const handleScrollUp = () => {
    contentScrollRef.current?.scrollBy({ top: -180, behavior: "smooth" });
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.(10);
    }
  };

  const handleScrollDown = () => {
    contentScrollRef.current?.scrollBy({ top: 180, behavior: "smooth" });
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.(10);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-agent-modal-title"
      className="fixed inset-0 z-[10000] flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-xl animate-in fade-in duration-200 select-none overflow-hidden"
    >
      <div
        className={`w-full bg-slate-900 text-slate-100 flex flex-col relative transition-all duration-300 overflow-hidden ${deviceWrapperClass}`}
      >
        {/* TOP HEADER: Branding, Voice Mute Toggle, Hardware Switcher, Close */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-800 bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-slate-950 shadow-md font-bold">
              <Sparkles className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h2
                id="create-agent-modal-title"
                className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2"
              >
                <span>Create Autonomous Shopping Agent</span>
              </h2>
              <div className="text-[11px] text-slate-400 hidden sm:block">
                Step-by-step setup · 24/7 sovereign bargaining
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* PROMINENT VOICE MUTE / UNMUTE TOGGLE */}
            <button
              type="button"
              onClick={toggleMute}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isVoiceMuted
                  ? "bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700"
                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm animate-pulse"
              }`}
              title={
                isVoiceMuted
                  ? "Voice agent is muted (Fill in manually)"
                  : "Voice agent is speaking (Click to mute and fill in manually)"
              }
            >
              {isVoiceMuted ? (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                  <span>Voice Muted (Manual)</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Voice Speaking</span>
                </>
              )}
            </button>

            {/* Device Switcher (Desktop) */}
            <div className="hidden md:flex items-center p-0.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs">
              <button
                type="button"
                onClick={() => setDeviceMode("auto")}
                title="Desktop Responsive"
                className={`p-1.5 rounded-md transition-colors ${
                  deviceMode === "auto"
                    ? "bg-slate-700 text-emerald-400 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Laptop className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setDeviceMode("mobile")}
                title="Mobile View"
                className={`p-1.5 rounded-md transition-colors ${
                  deviceMode === "mobile"
                    ? "bg-slate-700 text-emerald-400 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setDeviceMode("meta_ar")}
                title="Meta AR Glasses Mode"
                className={`p-1.5 rounded-md transition-colors ${
                  deviceMode === "meta_ar"
                    ? "bg-cyan-950 text-cyan-300 border border-cyan-500/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Glasses className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setDeviceMode("smartwatch")}
                title="Smartwatch Mode"
                className={`p-1.5 rounded-md transition-colors ${
                  deviceMode === "smartwatch"
                    ? "bg-slate-700 text-emerald-400 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Watch className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* SUCCESS CONFIRMATION SCREEN */}
        {deploySuccess && createdAgentRecord ? (
          <div className="flex-1 p-6 sm:p-8 flex flex-col items-center justify-center text-center overflow-y-auto no-scrollbar">
            <div className="relative mb-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-xl shadow-emerald-500/30 animate-bounce">
                <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
              </div>
            </div>

            <h3 className="text-xl font-black text-slate-100 mb-2">
              @{createdAgentRecord.fullName} Is Deployed!
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md mb-6 leading-relaxed">
              Your sovereign shopping agent is patrolling South African mall corridors 24/7. It will
              autonomously bargain for{" "}
              <strong className="text-emerald-400">{createdAgentRecord.intent.whatToBuy}</strong>{" "}
              below{" "}
              <strong className="text-emerald-400">
                R{createdAgentRecord.intent.ceilingPriceZar}
              </strong>{" "}
              while keeping your personal identity 100% private.
            </p>

            <div className="w-full max-w-sm rounded-xl bg-slate-950/80 border border-emerald-500/30 p-3.5 mb-6 text-left space-y-2 text-xs">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                <span className="text-slate-400">Schedule</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  24/7 Continuous
                </span>
              </div>
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                <span className="text-slate-400">Pre-funded Wallet</span>
                <span className="font-bold text-slate-200">
                  R{createdAgentRecord.funding.preFundedBalanceZar.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Privacy Shield</span>
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Biometric Enclave
                </span>
              </div>
            </div>

            <div className="flex gap-3 w-full max-w-sm">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onLaunchMeshView?.();
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <span>Watch in Mesh</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          /* STEP-BY-STEP TABBED INTERFACE - ZERO NESTED SCROLLBARS */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* MULTIPLE TABS STEPPER HEADER */}
            <div className="px-4 sm:px-6 py-2.5 bg-slate-950/60 border-b border-slate-800 shrink-0">
              <nav aria-label="Creation Steps" className="flex items-center justify-between gap-1">
                {STEPS.map((step, idx) => {
                  const isActive = step.id === currentTab;
                  const isDone = idx < currentStepIndex;
                  return (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => setCurrentTab(step.id)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                          : isDone
                            ? "text-slate-300 hover:text-white"
                            : "text-slate-500 hover:text-slate-400"
                      }`}
                    >
                      <span
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          isActive
                            ? "bg-emerald-400 text-slate-950"
                            : isDone
                              ? "bg-emerald-500/30 text-emerald-300"
                              : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {isDone ? "✓" : step.stepNumber}
                      </span>
                      <span className="hidden sm:inline truncate">{step.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* INTEGRATED AI VOICE BANNER & CONTROLS */}
            <div className="px-4 sm:px-6 py-2.5 bg-gradient-to-r from-emerald-950/30 via-slate-950/60 to-slate-950/30 border-b border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-base shrink-0">
                  {isAiSpeaking ? "🗣️" : isVoiceMuted ? "✍️" : "🎙️"}
                </span>
                <p className="text-xs text-slate-200 font-medium leading-tight truncate">
                  {isVoiceMuted
                    ? `Step ${currentStepConfig.stepNumber}: ${currentStepConfig.shortTitle} (Fill in manually)`
                    : currentStepConfig.aiPrompt}
                </p>
              </div>

              {/* Quick Audio / Mic Actions */}
              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                {!isVoiceMuted && (
                  <button
                    type="button"
                    onClick={() => speakCurrentQuestion(false)}
                    className="p-1 rounded-md text-slate-400 hover:text-emerald-400 transition-colors"
                    title="Replay Voice Question"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={isUserListening ? stopListening : startListening}
                  className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-xs font-bold transition-all ${
                    isUserListening
                      ? "bg-rose-500 text-white animate-pulse"
                      : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30"
                  }`}
                  title={isUserListening ? "Stop listening" : "Speak your response"}
                >
                  {isUserListening ? (
                    <>
                      <MicOff className="w-3 h-3" />
                      <span>Listening...</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3 h-3" />
                      <span>Speak</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* SCROLLABLE VIEWPORT WITH MODERN SUBTLE ARROWS (ZERO OLD-SCHOOL BROWSER SCROLLBARS) */}
            <div className="relative flex-1 min-h-0 flex flex-col overflow-hidden">
              {/* Modern subtle top scroll arrow & gradient indicator */}
              {canScrollUp && (
                <>
                  <div className="pointer-events-none absolute top-0 inset-x-0 h-8 bg-gradient-to-b from-slate-900/90 to-transparent z-10" />
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
                    <button
                      type="button"
                      onClick={handleScrollUp}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/90 hover:bg-slate-900 text-slate-300 hover:text-emerald-300 border border-slate-700/80 hover:border-emerald-500/40 shadow-lg text-[11px] font-semibold backdrop-blur-md transition-all cursor-pointer group"
                      aria-label="Scroll content up"
                    >
                      <ChevronUp className="w-3.5 h-3.5 text-emerald-400 group-hover:-translate-y-0.5 transition-transform" />
                      <span>Scroll up</span>
                    </button>
                  </div>
                </>
              )}

              {/* Modern subtle bottom scroll arrow & gradient indicator */}
              {canScrollDown && (
                <>
                  <div className="pointer-events-none absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-slate-900/90 to-transparent z-10" />
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
                    <button
                      type="button"
                      onClick={handleScrollDown}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-950/95 hover:bg-slate-900 text-slate-200 hover:text-emerald-300 border border-emerald-500/40 hover:border-emerald-400 shadow-xl shadow-emerald-500/10 text-[11px] font-semibold backdrop-blur-md transition-all cursor-pointer group animate-pulse"
                      aria-label="Scroll for more content"
                    >
                      <span>Scroll for more</span>
                      <ChevronDown className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-y-0.5 transition-transform" />
                    </button>
                  </div>
                </>
              )}

              {/* Modern ultra-slim subtle scroll progress track (non-blocking) */}
              {(canScrollUp || canScrollDown) && (
                <div className="absolute right-1 top-8 bottom-8 w-1 rounded-full bg-slate-800/30 pointer-events-none z-10 flex flex-col justify-start">
                  <div
                    className="w-1 rounded-full bg-emerald-400/70 shadow-[0_0_8px_rgba(52,211,153,0.5)] transition-all duration-150"
                    style={{
                      height: "32px",
                      marginTop: `${(scrollProgress / 100) * 80}%`,
                    }}
                  />
                </div>
              )}

              {/* SINGLE CLEAN SCROLLABLE PAGE CONTAINER WITH HIDDEN BROWSER SCROLLBAR */}
              <div
                ref={contentScrollRef}
                onScroll={checkScrollPosition}
                className="flex-1 overflow-y-auto no-scrollbar p-4 sm:p-6 space-y-4 overscroll-contain"
              >
                {/* PAGE 1: AGENT NAME & ANS PRICING */}
                {currentTab === "name" && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <div>
                      <label
                        htmlFor="step-agent-name-input"
                        className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5"
                      >
                        Choose Your Personalized Agent Name (.agent)
                      </label>
                      <div className="relative">
                        <input
                          id="step-agent-name-input"
                          type="text"
                          value={agentNameInput}
                          onChange={(e) => setAgentNameInput(e.target.value)}
                          placeholder="e.g. gugu, sneakerhead, deals"
                          maxLength={24}
                          className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl py-2.5 pl-3.5 pr-20 text-sm font-semibold text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          .agent
                        </span>
                      </div>

                      <div className="mt-2 flex items-center justify-between text-xs">
                        {isCheckingName ? (
                          <span className="text-slate-400 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                            Checking ANS availability...
                          </span>
                        ) : nameAvailability ? (
                          <div className="flex items-center justify-between w-full">
                            <span
                              className={`flex items-center gap-1 font-medium ${
                                nameAvailability.canClaim ? "text-emerald-400" : "text-amber-400"
                              }`}
                            >
                              {nameAvailability.canClaim ? (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              ) : (
                                <AlertCircle className="w-3.5 h-3.5" />
                              )}
                              {nameAvailability.statusText}
                            </span>

                            <span className="font-mono text-slate-300">
                              {nameAvailability.isFree ? (
                                <span className="text-emerald-400 font-bold">
                                  100% Free ($0 / R0)
                                </span>
                              ) : (
                                <span>
                                  ${nameAvailability.priceUsd} USDC · R
                                  {nameAvailability.priceZar.toLocaleString()}
                                </span>
                              )}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[11px]">
                            Handles with 7+ letters are 100% free forever for human personal agents.
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Suggestion Chips */}
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                        Suggested Sovereign Names:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {["sneakerhead", "gugu", "zarahunter", "lisa", "bargainscout"].map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setAgentNameInput(n)}
                            className="text-xs px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-emerald-300 hover:border-emerald-500/40 transition-colors"
                          >
                            @{n}.agent
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Privacy Guarantee */}
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-emerald-500/20 flex items-start gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Zero-Knowledge Enclave: Your real name, address, and cards stay sealed on
                        your device. Only your sovereign{" "}
                        <strong className="text-slate-200">.agent</strong> handle is presented to
                        stores.
                      </p>
                    </div>
                  </div>
                )}

                {/* PAGE 2: WHAT TO BUY & SIZES */}
                {currentTab === "wish" && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <div>
                      <label
                        htmlFor="step-what-to-buy-input"
                        className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5"
                      >
                        What product or deal do you want?
                      </label>
                      <input
                        id="step-what-to-buy-input"
                        type="text"
                        value={whatToBuy}
                        onChange={(e) => setWhatToBuy(e.target.value)}
                        placeholder="e.g. Nike Air Jordan 1 Retro, Black wool winter coat, Espresso beans"
                        className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl py-2.5 px-3.5 text-sm font-medium text-slate-100 placeholder:text-slate-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        Category
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {PRESET_CATEGORIES.map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setCategory(cat)}
                            className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                              category === cat
                                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                                : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label
                          htmlFor="step-sizes-input"
                          className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1"
                        >
                          Size / Dimensions
                        </label>
                        <input
                          id="step-sizes-input"
                          type="text"
                          value={sizes}
                          onChange={(e) => setSizes(e.target.value)}
                          placeholder="e.g. UK 9 / EU 43, Medium, 32W"
                          className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl py-2 px-3 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none"
                        />
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {PRESET_SIZES.slice(0, 4).map((sz) => (
                            <button
                              key={sz}
                              type="button"
                              onClick={() => setSizes(sz)}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-emerald-300"
                            >
                              {sz}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="step-preferences-input"
                          className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1"
                        >
                          Color & Condition Preferences
                        </label>
                        <input
                          id="step-preferences-input"
                          type="text"
                          value={preferences}
                          onChange={(e) => setPreferences(e.target.value)}
                          placeholder="e.g. Black or Navy, Brand new in box"
                          className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl py-2 px-3 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* PAGE 3: STORES & REFERENCE LINKS */}
                {currentTab === "stores" && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                        <Store className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Select Mall Flagships to Monitor</span>
                      </label>

                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {POPULAR_MALL_STORES.map((s) => {
                          const isSelected = selectedStores.includes(s);
                          return (
                            <button
                              key={s}
                              type="button"
                              onClick={() => handleToggleStore(s)}
                              className={`text-xs px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                                isSelected
                                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                                  : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
                              }`}
                            >
                              {isSelected ? "✓ " : "+ "}
                              {s}
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={storeInput}
                          onChange={(e) => setStoreInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddCustomStore();
                            }
                          }}
                          placeholder="Or enter custom store name or URL..."
                          className="flex-1 bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleAddCustomStore}
                          className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                        >
                          Add Store
                        </button>
                      </div>
                    </div>

                    {/* Reference Links */}
                    <div>
                      <label
                        htmlFor="step-reference-link-input"
                        className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5"
                      >
                        <LinkIcon className="w-3.5 h-3.5 text-cyan-400" />
                        <span>External Item Reference URLs</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          id="step-reference-link-input"
                          type="url"
                          value={referenceUrlInput}
                          onChange={(e) => setReferenceUrlInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddReferenceLink();
                            }
                          }}
                          placeholder="Paste link e.g. takealot.com/... or nike.com/..."
                          className="flex-1 bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleAddReferenceLink}
                          className="py-2 px-3 rounded-xl bg-cyan-900/60 hover:bg-cyan-800 text-cyan-300 text-xs font-semibold border border-cyan-500/30 flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </button>
                      </div>

                      {referenceLinks.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {referenceLinks.map((link, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-cyan-300 max-w-[280px]"
                            >
                              <span className="truncate">{link.replace(/^https?:\/\//, "")}</span>
                              <button
                                type="button"
                                onClick={() =>
                                  setReferenceLinks(referenceLinks.filter((_, i) => i !== idx))
                                }
                                className="text-slate-500 hover:text-rose-400"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* PAGE 4: BUDGET & 24/7 SCHEDULE */}
                {currentTab === "budget" && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label
                          htmlFor="step-target-price-input"
                          className="block text-xs font-bold text-slate-300 mb-1"
                        >
                          Target Bargain Price
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
                            R
                          </span>
                          <input
                            id="step-target-price-input"
                            type="number"
                            value={targetPriceZar}
                            onChange={(e) =>
                              setTargetPriceZar(Math.max(1, parseInt(e.target.value) || 0))
                            }
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 pl-7 pr-3 text-xs font-bold text-slate-100 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="step-ceiling-price-input"
                          className="block text-xs font-bold text-slate-300 mb-1"
                        >
                          Absolute Max Ceiling
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
                            R
                          </span>
                          <input
                            id="step-ceiling-price-input"
                            type="number"
                            value={ceilingPriceZar}
                            onChange={(e) =>
                              setCeilingPriceZar(
                                Math.max(targetPriceZar, parseInt(e.target.value) || 0),
                              )
                            }
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 pl-7 pr-3 text-xs font-bold text-slate-100 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Pre-Funded Wallet */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                        <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Pre-Funded Wallet Allocation</span>
                      </label>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {[500, 1000, 2500, 5000].map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => setPreFundedBalanceZar(amt)}
                            className={`text-xs px-3 py-1.5 rounded-xl font-bold border transition-colors cursor-pointer ${
                              preFundedBalanceZar === amt
                                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm"
                                : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
                            }`}
                          >
                            R{amt.toLocaleString()}
                          </button>
                        ))}
                      </div>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
                          R
                        </span>
                        <input
                          type="number"
                          value={preFundedBalanceZar}
                          onChange={(e) =>
                            setPreFundedBalanceZar(Math.max(0, parseInt(e.target.value) || 0))
                          }
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 pl-7 pr-3 text-xs font-bold text-slate-100 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* 24/7 vs Custom Schedule */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Operating Schedule</span>
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setIs24_7(true)}
                          className={`p-2.5 rounded-xl border text-left cursor-pointer transition-colors ${
                            is24_7
                              ? "bg-emerald-950/40 text-emerald-300 border-emerald-500/50 shadow-sm"
                              : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
                          }`}
                        >
                          <div className="text-xs font-bold flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            24/7 Always Active
                          </div>
                          <div className="text-[10px] text-slate-400">Night flash drops</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setIs24_7(false)}
                          className={`p-2.5 rounded-xl border text-left cursor-pointer transition-colors ${
                            !is24_7
                              ? "bg-emerald-950/40 text-emerald-300 border-emerald-500/50 shadow-sm"
                              : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
                          }`}
                        >
                          <div className="text-xs font-bold">Custom Window</div>
                          <div className="text-[10px] text-slate-400">Set wake & sleep hours</div>
                        </button>
                      </div>

                      {!is24_7 && (
                        <div className="flex items-center gap-3 mt-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                          <div className="flex-1">
                            <span className="text-[10px] text-slate-400 block mb-1">Wake Up:</span>
                            <input
                              type="time"
                              value={activeFrom}
                              onChange={(e) => setActiveFrom(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1 text-xs text-slate-100"
                            />
                          </div>
                          <div className="flex-1">
                            <span className="text-[10px] text-slate-400 block mb-1">Sleep At:</span>
                            <input
                              type="time"
                              value={sleepAt}
                              onChange={(e) => setSleepAt(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1 text-xs text-slate-100"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* PAGE 5: MEMORY VAULT & PASSPORT SUMMARY */}
                {currentTab === "memory" && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    {/* Summary Card */}
                    <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-emerald-500/30 text-xs space-y-2 shadow-lg">
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                        <div className="flex items-center gap-2">
                          <span className="text-base">🤖</span>
                          <span className="font-mono text-sm font-black text-slate-100">
                            @{agentNameInput || "myagent"}.agent
                          </span>
                        </div>
                        <span className="text-emerald-400 font-bold font-mono">
                          {nameAvailability?.isFree
                            ? "Free Sovereign Handle"
                            : `$${nameAvailability?.priceUsd || 0} USDC`}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-slate-400">Wish: </span>
                          <span className="text-slate-200 font-medium">
                            {whatToBuy || "Mall Deals"}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400">Size: </span>
                          <span className="text-slate-200 font-medium">{sizes || "Any"}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Bargain: </span>
                          <span className="text-emerald-400 font-bold">
                            R{targetPriceZar} (Max R{ceilingPriceZar})
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400">Pre-funded: </span>
                          <span className="text-slate-200 font-bold">R{preFundedBalanceZar}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-slate-400">Stores: </span>
                          <span className="text-slate-300">{selectedStores.join(", ")}</span>
                        </div>
                      </div>
                    </div>

                    {/* Receipt & Bill Upload Zone */}
                    <div>
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border border-dashed border-slate-700 hover:border-emerald-500/60 rounded-xl p-4 flex items-center justify-center gap-3 text-center cursor-pointer bg-slate-950/40 hover:bg-slate-950 transition-colors"
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*,.pdf,.txt,.csv"
                          onChange={handleBillFileUpload}
                          className="hidden"
                        />
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                          {isUploadingBill ? (
                            <Sparkles className="w-4 h-4 animate-spin text-emerald-300" />
                          ) : (
                            <Upload className="w-4 h-4" />
                          )}
                        </div>
                        <div className="text-left">
                          <div className="text-xs font-bold text-slate-200">
                            {isUploadingBill
                              ? "Indexing Receipt Items..."
                              : "Upload Past Shopping Receipts / Bills"}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Indexes past prices into agent memory vault for negotiation leverage
                          </div>
                        </div>
                      </div>

                      {uploadedBills.length > 0 && (
                        <div className="mt-2 space-y-1.5">
                          {uploadedBills.map((bill) => (
                            <div
                              key={bill.id}
                              className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs flex items-center justify-between"
                            >
                              <span className="text-slate-300 font-medium truncate max-w-[200px]">
                                🧾 {bill.fileName}
                              </span>
                              <span className="text-emerald-400 font-bold">
                                R{bill.totalSpentZar}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* QUICK SPOKEN / TYPED HELPER BAR */}
            <div className="px-4 sm:px-6 py-2 bg-slate-950/90 border-t border-slate-800/80 flex items-center gap-2 shrink-0">
              <form onSubmit={handleSubmitQuickText} className="flex items-center gap-2 flex-1">
                <input
                  type="text"
                  value={voiceQuickInput}
                  onChange={(e) => setVoiceQuickInput(e.target.value)}
                  placeholder={`Quick answer or custom value for ${currentStepConfig.shortTitle}...`}
                  className="flex-1 bg-slate-900 border border-slate-700/80 rounded-lg py-1.5 px-3 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  disabled={!voiceQuickInput.trim()}
                  className="py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold disabled:opacity-40 transition-colors"
                >
                  <Send className="w-3 h-3" />
                </button>
              </form>

              {(transcript || interimText) && (
                <div className="hidden sm:block text-xs text-emerald-300 font-mono italic truncate max-w-[200px]">
                  &ldquo;{transcript || interimText}&rdquo;
                </div>
              )}
            </div>

            {/* BOTTOM NAVIGATION CONTROLS */}
            <div className="px-4 sm:px-6 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={handlePrevTab}
                disabled={currentStepIndex === 0}
                className="py-2 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <div className="text-[11px] text-slate-400 font-mono hidden xs:block">
                Step {currentStepIndex + 1} of {STEPS.length}
              </div>

              {currentStepIndex < STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNextTab}
                  className="py-2 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                >
                  <span>Next Step</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleDeployAgent}
                  disabled={
                    isDeploying || (nameAvailability !== null && !nameAvailability.canClaim)
                  }
                  className="py-2 px-5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {isDeploying ? (
                    <>
                      <Sparkles className="w-3.5 h-3.5 animate-spin" />
                      <span>Deploying...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Deploy & Activate (24/7)</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
