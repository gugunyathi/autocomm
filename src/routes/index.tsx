import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { INDOOR, OUTDOOR, TICKS, fill, hueVar, type Store } from "@/lib/acn-data";
import { LandingPage } from "@/components/LandingPage";
import { PasskeyModal } from "@/components/PasskeyModal";
import { ParkingLotModal, type ParkedOffer } from "@/components/ParkingLotModal";
import { BoughtItemsModal, type BoughtItem } from "@/components/BoughtItemsModal";
import { AutoComLogo } from "@/components/AutoComLogo";
import { FloatingDeckCard } from "@/components/FloatingDeckCard";
import { DealMatchPopup, type MatchedDeal } from "@/components/DealMatchPopup";
import { MatchedDeckModal } from "@/components/MatchedDeckModal";
import { SpatialCompassHUD } from "@/components/SpatialCompassHUD";
import { CornerCompass } from "@/components/CornerCompass";
import { EnvironmentModal } from "@/components/EnvironmentModal";
import { WalkthroughModal } from "@/components/WalkthroughModal";
import { AgentCommerceModal } from "@/components/AgentCommerceModal";
import MallSimulator from "@/components/MallSimulator";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { PWAInstallButton } from "@/components/PWAInstallButton";
import { registerServiceWorker, useOnlineStatus } from "@/lib/pwa-service";
import { saveSpecialOffersCache, loadSpecialOffersCache } from "@/lib/offers-cache";
import { notificationManager } from "@/lib/notifications";
import { useDeviceHeading } from "@/hooks/useDeviceHeading";
import {
  DEFAULT_USER_COORDS,
  isFacingTarget,
  type SpatialCoordinates,
} from "@/lib/spatial-sensors";
import { type PasskeyUser, getCurrentUser, signOutPasskey } from "@/lib/passkey-auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AutoCom - Autonomous Realtime Commerce Network" },
      {
        name: "description",
        content:
          "Where your live AI shopping agent negotiates deals within 50 meters on a spinning proximity sphere, protected by biometric passkeys.",
      },
      { property: "og:title", content: "AutoCom - Autonomous Realtime Commerce Network" },
      {
        property: "og:description",
        content:
          "Where your live AI shopping agent negotiates deals within 50 meters on a spinning proximity sphere.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: App,
});

type Deal = { store: Store; price: number; counter: number; expires: number; total: number };
type Log = { t: string; msg: string; id: number };

const now = () => new Date().toTimeString().slice(0, 8);
let logId = 0;

const SUGGESTED_TAGS = ["Coffee", "Hoodies", "Sushi", "Sneakers", "Tech", "Skincare", "Books"];
const STORAGE_PARKED_KEY = "acn_parked_offers_v1";
const STORAGE_BOUGHT_KEY = "acn_bought_items_v1";
const STORAGE_WALKTHROUGH_KEY = "autocom_walkthrough_seen_v1";

export function App() {
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<"landing" | "mesh">("landing");
  const [currentUser, setCurrentUser] = useState<PasskeyUser | null>(null);
  const [passkeyModalOpen, setPasskeyModalOpen] = useState(false);
  const [passkeyModalMode, setPasskeyModalMode] = useState<"signin" | "signup">("signin");
  const [walkthroughOpen, setWalkthroughOpen] = useState(false);
  const isOnline = useOnlineStatus();
  const [lastCacheSync, setLastCacheSync] = useState<number | null>(null);

  // Register PWA Service Worker for offline capability
  useEffect(() => {
    registerServiceWorker();
  }, []);

  // Auto-play walkthrough once for first-time users
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const seen = localStorage.getItem(STORAGE_WALKTHROUGH_KEY);
      if (!seen) {
        const timer = setTimeout(() => {
          setWalkthroughOpen(true);
        }, 800);
        return () => clearTimeout(timer);
      }
    } catch {
      // ignore storage access errors
    }
  }, []);

  const handleCompleteWalkthrough = () => {
    setWalkthroughOpen(false);
    try {
      localStorage.setItem(STORAGE_WALKTHROUGH_KEY, "true");
    } catch {
      // ignore
    }
  };

  // Parking Lot, Bought Bag & Mall Simulator Modals
  const [parkingLotOpen, setParkingLotOpen] = useState(false);
  const [boughtModalOpen, setBoughtModalOpen] = useState(false);
  const [mallSimulatorOpen, setMallSimulatorOpen] = useState(false);
  const [parkedOffers, setParkedOffers] = useState<ParkedOffer[]>([]);
  const [boughtItems, setBoughtItems] = useState<BoughtItem[]>([]);

  const [outdoor, setOutdoor] = useState(false);
  const [envMode, setEnvMode] = useState<"auto" | "indoor" | "outdoor">("auto");
  const [envModalOpen, setEnvModalOpen] = useState(false);
  const [gpsAccuracy, setGpsAccuracy] = useState(12);
  const [autoDetectedAs, setAutoDetectedAs] = useState<"indoor" | "outdoor">("indoor");

  // Proximity Radius Preferences: 0.1 to 20m Indoor & 0.1 to 50m Outdoor
  const [indoorRadius, setIndoorRadius] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const v = localStorage.getItem("autocom_indoor_radius_v1");
      if (v) return parseFloat(v);
    }
    return 20.0;
  });

  const [outdoorRadius, setOutdoorRadius] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const v = localStorage.getItem("autocom_outdoor_radius_v1");
      if (v) return parseFloat(v);
    }
    return 50.0;
  });

  // Sound and Vibration Notification Toggles for High-Value (+50%) and Standard Deals
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const v = localStorage.getItem("autocom_sound_alerts_v1");
      if (v !== null) return v === "true";
    }
    return true;
  });

  const [vibrateEnabled, setVibrateEnabled] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const v = localStorage.getItem("autocom_vibrate_alerts_v1");
      if (v !== null) return v === "true";
    }
    return true;
  });

  // Auto-configured active proximity radius based on environment mode
  const activeProximityRadius = outdoor ? outdoorRadius : indoorRadius;

  const handleSetProximityRadius = (val: number) => {
    if (outdoor) {
      const clamped = Math.min(50, Math.max(0.1, Math.round(val * 10) / 10));
      setOutdoorRadius(clamped);
      try {
        localStorage.setItem("autocom_outdoor_radius_v1", clamped.toString());
      } catch {
        // ignore
      }
    } else {
      const clamped = Math.min(20, Math.max(0.1, Math.round(val * 10) / 10));
      setIndoorRadius(clamped);
      try {
        localStorage.setItem("autocom_indoor_radius_v1", clamped.toString());
      } catch {
        // ignore
      }
    }
  };

  const handleToggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("autocom_sound_alerts_v1", next.toString());
      } catch {
        // ignore
      }
      if (next) {
        notificationManager.playStandardDealSound();
      }
      return next;
    });
  };

  const handleToggleVibrate = () => {
    setVibrateEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("autocom_vibrate_alerts_v1", next.toString());
      } catch {
        // ignore
      }
      if (next) {
        notificationManager.vibrate(false);
      }
      return next;
    });
  };

  // Silence deal pop-ups toggle (so deals route directly to Deck without interrupting screen)
  const [silencePopups, setSilencePopups] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const v = localStorage.getItem("autocom_silence_popups_v1");
      if (v !== null) return v === "true";
    }
    return false;
  });

  const handleToggleSilencePopups = () => {
    setSilencePopups((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("autocom_silence_popups_v1", next.toString());
      } catch {
        // ignore
      }
      if (next) {
        setActivePopupDeal(null);
      }
      return next;
    });
  };

  // Mobility Mode & Speed Telemetry for dynamic deal pacing
  const [mobilityMode, setMobilityMode] = useState<"auto" | "walking" | "fast_walking" | "driving">(
    "auto",
  );
  const [gpsSpeed, setGpsSpeed] = useState<number | null>(null);

  // Geolocation auto-detection of Indoor vs. Outdoor and Speed Tracking
  useEffect(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) return;

    const watcher = navigator.geolocation.watchPosition(
      (pos) => {
        const acc = Math.round(pos.coords.accuracy);
        setGpsAccuracy(acc);
        // Structural indoor attenuation creates GPS accuracy > 16m or lower satellite count
        const inferred = acc > 16 ? "indoor" : "outdoor";
        setAutoDetectedAs(inferred);
        if (envMode === "auto") {
          setOutdoor(inferred === "outdoor");
        }

        // Live speed tracking from GPS receiver
        if (pos.coords.speed !== null && !isNaN(pos.coords.speed)) {
          const speedKmh = Math.max(0, Math.round(pos.coords.speed * 3.6 * 10) / 10);
          setGpsSpeed(speedKmh);
        }
      },
      () => {
        // Fallback or permission blocked: default to indoor mall mesh
        setAutoDetectedAs("indoor");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 10000 },
    );

    return () => navigator.geolocation.clearWatch(watcher);
  }, [envMode]);

  const handleSetEnvMode = (mode: "auto" | "indoor" | "outdoor") => {
    setEnvMode(mode);
    if (mode === "indoor") setOutdoor(false);
    else if (mode === "outdoor") setOutdoor(true);
    else if (mode === "auto") setOutdoor(autoDetectedAs === "outdoor");
  };

  const stores = outdoor ? OUTDOOR : INDOOR;

  // Effective speed & dynamic mobility state inference
  const effectiveSpeed = useMemo(() => {
    if (mobilityMode === "walking") return 4.5;
    if (mobilityMode === "fast_walking") return 8.5;
    if (mobilityMode === "driving") return 48.0;
    return gpsSpeed !== null ? gpsSpeed : 4.2;
  }, [mobilityMode, gpsSpeed]);

  const isDriving = mobilityMode === "driving" || effectiveSpeed >= 22;
  const isFastWalking =
    mobilityMode === "fast_walking" || (effectiveSpeed >= 6 && effectiveSpeed < 22);

  // Distance to nearest approaching store for proximity-accelerated pacing
  const nearestStoreDist = useMemo(() => {
    if (stores.length === 0) return 25;
    return Math.min(...stores.map((s) => s.dist));
  }, [stores]);

  // Dynamic cadence calculation:
  // - Walking / Stationary: 30 seconds default
  // - Fast Walking: 14s - 22s scaled by proximity to closest store
  // - Driving: 10 seconds minimum frequency
  const currentCadenceMs = useMemo(() => {
    if (isDriving) {
      return 10000;
    }
    if (isFastWalking) {
      return Math.max(14000, Math.min(22000, Math.round(nearestStoreDist * 380)));
    }
    return 30000;
  }, [isDriving, isFastWalking, nearestStoreDist]);
  const [rot, setRot] = useState(0);
  const rotRef = useRef(0);
  const vel = useRef(0.0025);
  const target = useRef<number | null>(null);
  const drag = useRef<{ x: number; r: number; moved: boolean } | null>(null);
  const [radius, setRadius] = useState(170);
  const [ticks, setTicks] = useState<Record<string, string>>({});
  const [deal, setDeal] = useState<MatchedDeal | null>(null);
  const [activePopupDeal, setActivePopupDeal] = useState<MatchedDeal | null>(null);
  const [matchedDeck, setMatchedDeck] = useState<MatchedDeal[]>([]);
  const [matchedDeckOpen, setMatchedDeckOpen] = useState(false);

  // Restore last known special offers from offline cache on startup
  useEffect(() => {
    const cached = loadSpecialOffersCache();
    if (cached) {
      setLastCacheSync(cached.timestamp);
      if (cached.matchedDeck?.length > 0) {
        setMatchedDeck(cached.matchedDeck);
      }
      if (cached.activeDeal) {
        setActivePopupDeal(cached.activeDeal);
        setDeal(cached.activeDeal);
      }
    }
  }, []);

  // Save current special offers to offline storage cache whenever updated
  useEffect(() => {
    if (matchedDeck.length > 0 || activePopupDeal) {
      saveSpecialOffersCache(matchedDeck, stores, activePopupDeal);
      setLastCacheSync(Date.now());
    }
  }, [matchedDeck, activePopupDeal, stores]);
  const [claimed, setClaimed] = useState<string[]>([]);
  const [drawer, setDrawer] = useState(false);
  const [agentCommerceOpen, setAgentCommerceOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<"profile" | "logs">("profile");
  const [tags, setTags] = useState(["Coffee", "Hoodies", "Sushi"]);
  const [budget, setBudget] = useState(1500);
  const [logs, setLogs] = useState<Log[]>([]);
  const [left, setLeft] = useState(0);
  const [viewport, setViewport] = useState({ w: 1000, h: 800 });

  // Pulled-out cards placed anywhere on canvas
  const [pulledCards, setPulledCards] = useState<
    Array<{ store: Store; pos: { x: number; y: number } }>
  >([]);
  // Currently expanded/enlarged card ID ('deal' | store.id | null)
  const [expandedCardId, setExpandedCardId] = useState<string | null>("deal");
  // Deck alignment mode ('none' | 'right' | 'left')
  const [deckMode, setDeckMode] = useState<"none" | "right" | "left">("none");

  // Bottom action buttons rotating carousel state, drag physics & momentum refs
  const bottomCarouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isBottomDragging, setIsBottomDragging] = useState(false);

  const bottomDragStartX = useRef(0);
  const bottomScrollStartX = useRef(0);
  const bottomDragMoved = useRef(false);
  const bottomLastPointerX = useRef(0);
  const bottomVelocityX = useRef(0);
  const bottomInertiaFrame = useRef<number | null>(null);

  const updateScrollIndicators = useCallback(() => {
    if (bottomCarouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = bottomCarouselRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, []);

  const scrollBottomCarousel = (direction: "left" | "right") => {
    if (bottomCarouselRef.current) {
      const scrollAmount = direction === "left" ? -220 : 220;
      bottomCarouselRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate?.(15);
      }
    }
  };

  const handleBottomPointerDown = (e: React.PointerEvent) => {
    if (bottomInertiaFrame.current) {
      cancelAnimationFrame(bottomInertiaFrame.current);
      bottomInertiaFrame.current = null;
    }
    bottomDragStartX.current = e.clientX;
    bottomLastPointerX.current = e.clientX;
    bottomScrollStartX.current = bottomCarouselRef.current
      ? bottomCarouselRef.current.scrollLeft
      : 0;
    bottomDragMoved.current = false;
    bottomVelocityX.current = 0;
    setIsBottomDragging(true);
  };

  const handleBottomPointerMove = (e: React.PointerEvent) => {
    if (!isBottomDragging || !bottomCarouselRef.current) return;
    const dx = e.clientX - bottomDragStartX.current;
    if (Math.abs(dx) > 4) {
      bottomDragMoved.current = true;
    }
    const instantDelta = e.clientX - bottomLastPointerX.current;
    bottomVelocityX.current = instantDelta * 0.7 + bottomVelocityX.current * 0.3;
    bottomLastPointerX.current = e.clientX;

    bottomCarouselRef.current.scrollLeft = bottomScrollStartX.current - dx;
    updateScrollIndicators();
  };

  const handleBottomPointerUp = () => {
    if (!isBottomDragging) return;
    setIsBottomDragging(false);

    // Smooth momentum rolling on release
    if (bottomCarouselRef.current && Math.abs(bottomVelocityX.current) > 1.2) {
      let vel = bottomVelocityX.current * 1.6;
      const friction = 0.92;
      const stepInertia = () => {
        if (!bottomCarouselRef.current || Math.abs(vel) < 0.2) {
          bottomInertiaFrame.current = null;
          updateScrollIndicators();
          return;
        }
        bottomCarouselRef.current.scrollLeft -= vel;
        vel *= friction;
        updateScrollIndicators();
        bottomInertiaFrame.current = requestAnimationFrame(stepInertia);
      };
      bottomInertiaFrame.current = requestAnimationFrame(stepInertia);
    }

    setTimeout(() => {
      bottomDragMoved.current = false;
    }, 70);
  };

  const safeBottomAction = (action: () => void) => {
    if (bottomDragMoved.current) return;
    action();
  };

  // Spatial Sensor Heading & Compass state
  const {
    heading,
    isLiveSensor,
    permissionStatus,
    requestPermission,
    setManualHeading,
    turnHeadingBy,
  } = useDeviceHeading(45);

  const [userCoords] = useState<SpatialCoordinates>(DEFAULT_USER_COORDS);

  // Compute store currently being faced based on device heading & bearing geometry
  const facingStore = useMemo(() => {
    return stores.find((s) => isFacingTarget(heading, s.bearing, 26)) || null;
  }, [stores, heading]);

  // Smoothly align carousel orientation when user physically or virtually turns
  useEffect(() => {
    if (drag.current) return;
    const rad = -((heading / 180) * Math.PI);
    let tgt = rad;
    while (tgt < rotRef.current - Math.PI) tgt += Math.PI * 2;
    while (tgt > rotRef.current + Math.PI) tgt -= Math.PI * 2;
    target.current = tgt;
  }, [heading]);

  useEffect(() => {
    setMounted(true);
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
      if (user.agentBudget) setBudget(user.agentBudget);
      if (user.intentTags?.length) setTags(user.intentTags);
    }

    try {
      const storedParked = localStorage.getItem(STORAGE_PARKED_KEY);
      if (storedParked) setParkedOffers(JSON.parse(storedParked));
      const storedBought = localStorage.getItem(STORAGE_BOUGHT_KEY);
      if (storedBought) {
        const parsed = JSON.parse(storedBought) as BoughtItem[];
        setBoughtItems(parsed);
        setClaimed(parsed.map((b) => b.store.id));
      }
    } catch {
      // ignore storage errors
    }

    const updateSize = () => {
      setViewport({
        w: window.innerWidth,
        h: window.innerHeight,
      });
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    window.addEventListener("orientationchange", updateSize);
    return () => {
      window.removeEventListener("resize", updateSize);
      window.removeEventListener("orientationchange", updateSize);
    };
  }, []);

  // Save Parked Offers and Bought Items to storage
  const saveParked = (updated: ParkedOffer[]) => {
    setParkedOffers(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_PARKED_KEY, JSON.stringify(updated));
    }
  };

  const saveBought = (updated: BoughtItem[]) => {
    setBoughtItems(updated);
    setClaimed(updated.map((b) => b.store.id));
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_BOUGHT_KEY, JSON.stringify(updated));
    }
  };

  const isMobile = viewport.w < 640;
  const isSmallMobile = viewport.w < 380;
  const isTablet = viewport.w >= 640 && viewport.w < 1024;

  // Responsive scale dynamically computed from both width and height constraints
  const scale = useMemo(() => {
    const widthFactor = viewport.w / 760;
    const heightFactor = (viewport.h - 180) / 600;
    const minFactor = Math.min(widthFactor, heightFactor);
    if (isSmallMobile) return Math.min(0.72, Math.max(0.55, minFactor * 0.98));
    if (isMobile) return Math.min(0.82, Math.max(0.65, minFactor * 0.98));
    if (isTablet) return Math.min(0.92, Math.max(0.78, minFactor));
    return Math.min(1.15, Math.max(0.9, widthFactor));
  }, [viewport.w, viewport.h, isMobile, isSmallMobile, isTablet]);

  useEffect(() => {
    setRadius(outdoor ? (isMobile ? 220 : 300) : isMobile ? 140 : 175);
  }, [outdoor, isMobile]);

  // Animation loop with smooth inertia
  const radRef = useRef(radius);
  const [radAnim, setRadAnim] = useState(radius);
  useEffect(() => {
    let f = 0;
    const loop = () => {
      if (target.current !== null) {
        const d = target.current - rotRef.current;
        rotRef.current += d * 0.08;
        if (Math.abs(d) < 0.001) target.current = null;
      } else if (!drag.current) {
        rotRef.current += vel.current;
        vel.current += (0.0025 - vel.current) * 0.02;
      }
      radRef.current += (radius - radRef.current) * 0.07;
      setRot(rotRef.current);
      setRadAnim(radRef.current);
      f = requestAnimationFrame(loop);
    };
    f = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(f);
  }, [radius]);

  // Live tickers and mesh telemetry logs
  useEffect(() => {
    const id = setInterval(() => {
      const s = stores[Math.floor(Math.random() * stores.length)]!;
      setTicks((t) => ({
        ...t,
        [s.id]: fill(TICKS[Math.floor(Math.random() * TICKS.length)]!, s),
      }));
      const agent = s.name.replace(/[^A-Za-z]/g, "") + "Agent";
      const msgs = [
        `ConsumerAgent pinged ${agent}… Checking stock…`,
        `${agent} ACK · latency ${8 + Math.floor(Math.random() * 30)}ms`,
        `Intent match [${tags.join("|")}] → ${s.tag}`,
        `Budget guard ≤ R${budget} · ${agent} quote R${Math.round(s.open * 0.85)}`,
        `Handshake ${Math.random().toString(16).slice(2, 10)} signed with ${agent}`,
      ];
      setLogs((l) =>
        [
          { t: now(), msg: msgs[Math.floor(Math.random() * msgs.length)]!, id: logId++ },
          ...l,
        ].slice(0, 60),
      );
    }, 1400);
    return () => clearInterval(id);
  }, [stores, tags, budget]);

  // Deals trigger with auto rotation to store, 40%+ priority detection & free giveaway support
  const n = stores.length;
  const trigger = useCallback(
    (s?: Store) => {
      // Prioritize stores within configured proximity radius
      const inRangeStores = stores.filter((st) => st.dist <= activeProximityRadius);
      const candidates = inRangeStores.length > 0 ? inRangeStores : stores;
      const idx = s
        ? stores.indexOf(s)
        : stores.indexOf(candidates[Math.floor(Math.random() * candidates.length)]!);
      const store = stores[idx >= 0 ? idx : 0]!;
      const base = (idx / n) * Math.PI * 2;
      let tgt = -base;
      while (tgt < rotRef.current - Math.PI) tgt += Math.PI * 2;
      while (tgt > rotRef.current + Math.PI) tgt -= Math.PI * 2;
      target.current = tgt;

      // 12% probability of 100% Free Giveaway, 38% probability of Mega Deal (40% to 65% OFF), 50% standard deal (15% to 35% OFF)
      const randRoll = Math.random();
      const isFreeGiveaway = randRoll < 0.12;
      const isMegaDrop = randRoll >= 0.12 && randRoll < 0.5;

      let price = 0;
      let discountPercent = 0;

      if (isFreeGiveaway) {
        price = 0;
        discountPercent = 100;
      } else if (isMegaDrop) {
        const ratio = 0.4 + Math.random() * 0.25; // 40% to 65% OFF
        price = Math.max(10, Math.round(store.open * (1 - ratio)));
        discountPercent = Math.round(((store.open - price) / store.open) * 100);
      } else {
        const ratio = 0.15 + Math.random() * 0.2; // 15% to 35% OFF
        price = Math.max(15, Math.round(store.open * (1 - ratio)));
        discountPercent = Math.round(((store.open - price) / store.open) * 100);
      }

      const isPrioritySpecial = discountPercent >= 40 || isFreeGiveaway || price === 0;

      const newDeal: MatchedDeal = {
        store,
        price,
        counter: price > 0 ? Math.round(price * 0.95) : 0,
        expires: Date.now() + 465000,
        total: 465,
        isHighValue: discountPercent >= 40,
        isFreeGiveaway,
        isPriorityTransitDeal: (isDriving || isFastWalking) && isPrioritySpecial,
      };

      setDeal(newDeal);

      // ANTI-CLUTTER ROUTING LOGIC:
      // When driving or moving fast:
      // - Normal deals (< 40% OFF) silently route directly into the minimized timeline / Matched Deck!
      // - ONLY Priority deals (>= 40% discount or 100% Free Giveaways) pop up as priority foreground popups!
      if (silencePopups) {
        // Popups explicitly silenced by user
        setMatchedDeck((prev) => {
          if (prev.some((item) => item.store.id === store.id)) return prev;
          return [newDeal, ...prev];
        });
      } else if (isDriving) {
        if (isPrioritySpecial) {
          // High-priority deal while driving: show alert popup!
          setActivePopupDeal(newDeal);
        } else {
          // Minor deal while driving: silently buffer into minimized Matched Deck timeline
          setMatchedDeck((prev) => {
            if (prev.some((item) => item.store.id === store.id)) return prev;
            return [newDeal, ...prev];
          });
        }
      } else {
        // Regular walking / fast walking cadence: standard popup
        setActivePopupDeal(newDeal);
      }

      // Sound & Vibration notifications
      if (isFreeGiveaway) {
        if (soundEnabled) {
          notificationManager.playHighValueDealSound();
        }
        if (vibrateEnabled) {
          notificationManager.vibrate(true);
        }
        setLogs((l) => [
          {
            t: now(),
            msg: `🎁 FREE GIVEAWAY (100% OFF): ${store.name} · ${store.item} @ FREE (was R${store.open})`,
            id: logId++,
          },
          ...l,
        ]);
      } else if (isPrioritySpecial) {
        if (soundEnabled) {
          notificationManager.playHighValueDealSound();
        }
        if (vibrateEnabled) {
          notificationManager.vibrate(true);
        }
        setLogs((l) => [
          {
            t: now(),
            msg: `🔥 PRIORITY SPECIAL (+${discountPercent}% OFF): ${store.name} · ${store.item} @ R${price} (was R${store.open})`,
            id: logId++,
          },
          ...l,
        ]);
      } else {
        if (!isDriving && soundEnabled) {
          notificationManager.playStandardDealSound();
        }
        if (!isDriving && vibrateEnabled) {
          notificationManager.vibrate(false);
        }
        setLogs((l) => [
          {
            t: now(),
            msg: isDriving
              ? `📥 SILENT TRANSIT MATCH (-${discountPercent}% OFF) routed to Deck: ${store.name} · ${store.item}`
              : `⚡ DEAL MATCHED (-${discountPercent}% OFF): ${store.name} · ${store.item} @ R${price}`,
            id: logId++,
          },
          ...l,
        ]);
      }
    },
    [
      stores,
      n,
      activeProximityRadius,
      soundEnabled,
      vibrateEnabled,
      silencePopups,
      isDriving,
      isFastWalking,
    ],
  );

  const handleAutoDismissToDeck = useCallback((d: MatchedDeal) => {
    setMatchedDeck((prev) => {
      if (prev.some((item) => item.store.id === d.store.id)) return prev;
      return [d, ...prev];
    });
    setActivePopupDeal(null);
  }, []);

  // Initial deal trigger on launch
  useEffect(() => {
    if (activePopupDeal || matchedDeck.length > 0) return;
    const id = setTimeout(() => trigger(), 6000);
    return () => clearTimeout(id);
  }, [activePopupDeal, matchedDeck.length, trigger]);

  // Periodic deal generator running on dynamic velocity cadence:
  // - 30s by default (walking)
  // - 14-22s for fast walking (closer store = faster)
  // - 10s minimum for driving (with 40%+ priority filter)
  useEffect(() => {
    const timer = setInterval(() => {
      trigger();
    }, currentCadenceMs);
    return () => clearInterval(timer);
  }, [currentCadenceMs, trigger]);

  useEffect(() => {
    if (!deal) return;
    const id = setInterval(() => {
      const l = Math.max(0, Math.round((deal.expires - Date.now()) / 1000));
      setLeft(l);
      if (!l) setDeal(null);
    }, 250);
    return () => clearInterval(id);
  }, [deal]);

  // Calculate 3D spherical orbital coordinates with generous spacing for mobile
  const nodes = useMemo(
    () =>
      stores.map((s, i) => {
        const a = (i / n) * Math.PI * 2 + rot;
        const lat = Math.sin(i * 2.3) * (isMobile ? 0.3 : 0.42);
        const R = radAnim * scale;
        // Increase horizontal spacing on mobile so items are comfortably separated and not clumped
        const x = Math.sin(a) * Math.cos(lat) * R * (isMobile ? 1.55 : 1.38);
        const z = Math.cos(a) * Math.cos(lat);
        const y = Math.sin(lat) * R * (isMobile ? 0.65 : 0.85) + Math.sin(rot * 3 + i) * 3;
        return { s, x, y, z };
      }),
    [stores, rot, radAnim, scale, n, isMobile],
  );

  // Touch and pointer gestures for fluid mobile rotation
  const down = (e: React.PointerEvent) => {
    drag.current = { x: e.clientX, r: rotRef.current, moved: false };
    target.current = null;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const move = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const deltaX = e.clientX - drag.current.x;
    if (Math.abs(deltaX) > 4) {
      drag.current.moved = true;
    }
    const speed = isMobile ? 0.0075 : 0.006;
    const nr = drag.current.r + deltaX * speed;
    vel.current = (nr - rotRef.current) * 0.8;
    rotRef.current = nr;
  };

  const up = () => {
    drag.current = null;
  };

  // Handle pulling out a card from the carousel
  const handlePullOutCard = (s: Store, screenX?: number, screenY?: number) => {
    if (pulledCards.some((p) => p.store.id === s.id)) {
      setExpandedCardId(s.id);
      return;
    }
    const defaultX = screenX ?? (isMobile ? 18 : 36 + pulledCards.length * 35);
    const defaultY =
      screenY ?? (isMobile ? 110 + pulledCards.length * 45 : 130 + pulledCards.length * 35);
    setPulledCards((prev) => [...prev, { store: s, pos: { x: defaultX, y: defaultY } }]);
    setExpandedCardId(s.id); // Auto focus pulled card and make deal card small
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.([30, 45, 60]);
    }
  };

  // Handle releasing a pulled card back to carousel
  const handleReleaseCard = (storeId: string) => {
    setPulledCards((prev) => prev.filter((p) => p.store.id !== storeId));
    if (expandedCardId === storeId) {
      setExpandedCardId(null);
    }
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.([30, 40]);
    }
  };

  // Handle releasing/dismissing active deal
  const handleReleaseDeal = () => {
    setDeal(null);
    if (expandedCardId === "deal") {
      setExpandedCardId(null);
    }
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.([30, 40]);
    }
  };

  // Calculate cascading deck position for cards
  const getDeckAlignment = (cardId: string) => {
    if (deckMode === "none") return null;
    const allIds = [deal ? "deal" : null, ...pulledCards.map((p) => p.store.id)].filter(
      Boolean,
    ) as string[];
    const idx = allIds.indexOf(cardId);
    if (idx === -1) return null;

    const isRight = deckMode === "right";
    const startX = isRight ? Math.max(16, viewport.w - (isMobile ? 320 : 380)) : 16;
    const startY = 85 + idx * (isMobile ? 50 : 60);
    return { x: startX, y: startY, zIndex: 50 + idx };
  };

  const handleCardClick = (s: Store) => {
    if (drag.current?.moved) return;
    // Enlarge clicked card and auto make deal match card small!
    setExpandedCardId(s.id);
    trigger(s);
  };

  const mm =
    String(Math.floor(left / 60)).padStart(2, "0") + ":" + String(left % 60).padStart(2, "0");

  const addTag = (val: string) => {
    const trimmed = val.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
  };

  const openPasskeyModal = (mode: "signin" | "signup") => {
    setPasskeyModalMode(mode);
    setPasskeyModalOpen(true);
  };

  const handlePasskeySuccess = (user: PasskeyUser) => {
    setCurrentUser(user);
    if (user.agentBudget) setBudget(user.agentBudget);
    if (user.intentTags?.length) setTags(user.intentTags);
  };

  // Park the active deal & seamlessly return straight to the 3D carousel
  const handleParkDeal = (targetDeal?: MatchedDeal) => {
    const d = targetDeal || deal || activePopupDeal;
    if (!d) return;
    const newParked: ParkedOffer = {
      id: `park_${Date.now()}_${d.store.id}`,
      store: d.store,
      price: d.price,
      counter: d.counter,
      open: d.store.open,
      expires: d.expires,
      parkedAt: Date.now(),
    };

    const updated = [newParked, ...parkedOffers.filter((p) => p.store.id !== d.store.id)];
    saveParked(updated);
    setLogs((l) => [
      {
        t: now(),
        msg: `PARKED ${d.store.item} @ R${d.price} into Holding Lot`,
        id: logId++,
      },
      ...l,
    ]);

    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.([40, 60]);
    }

    // Auto dismiss any active modals/cards and return directly to 3D carousel
    if (deal?.store.id === d.store.id) setDeal(null);
    if (activePopupDeal?.store.id === d.store.id) setActivePopupDeal(null);
    setExpandedCardId(null);
    setMatchedDeckOpen(false);
  };

  // Accept and buy deal directly
  const handleBuyDeal = (targetDeal?: MatchedDeal) => {
    const d = targetDeal || deal || activePopupDeal;
    if (!d) return;
    const token = `AUTOCOM-${d.store.name.slice(0, 4).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${new Date().getFullYear()}`;
    const newBought: BoughtItem = {
      id: `bought_${Date.now()}_${d.store.id}`,
      store: d.store,
      item: d.store.item,
      price: d.price,
      open: d.store.open,
      boughtAt: Date.now(),
      qrToken: token,
    };

    saveBought([newBought, ...boughtItems]);
    setClaimed((prev) => [...prev, d.store.id]);
    setLogs((l) => [
      {
        t: now(),
        msg: `CLAIMED & BOUGHT ${d.store.item} @ R${d.price} · Voucher ${token} issued`,
        id: logId++,
      },
      ...l,
    ]);

    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.([60, 40, 100]);
    }

    if (deal?.store.id === d.store.id) setDeal(null);
    if (activePopupDeal?.store.id === d.store.id) setActivePopupDeal(null);
    setBoughtModalOpen(true);
  };

  const handleBuyFromDeck = (d: MatchedDeal) => {
    handleBuyDeal(d);
    setMatchedDeck((prev) => prev.filter((item) => item.store.id !== d.store.id));
  };

  const handleParkFromDeck = (d: MatchedDeal) => {
    handleParkDeal(d);
    setMatchedDeck((prev) => {
      const next = prev.filter((item) => item.store.id !== d.store.id);
      if (next.length === 0) setMatchedDeckOpen(false);
      return next;
    });
  };

  const handleDiscardFromDeck = useCallback((storeId: string) => {
    setMatchedDeck((prev) => prev.filter((item) => item.store.id !== storeId));
    setLogs((l) => [
      { t: now(), msg: `DISCARD · Removed deal from Matched Deck`, id: logId++ },
      ...l,
    ]);
  }, []);

  // Claim and buy from Parking Lot
  const handleClaimFromParkingLot = (offer: ParkedOffer) => {
    const token = `AUTOCOM-${offer.store.name.slice(0, 4).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${new Date().getFullYear()}`;
    const newBought: BoughtItem = {
      id: `bought_${Date.now()}_${offer.store.id}`,
      store: offer.store,
      item: offer.store.item,
      price: offer.price,
      open: offer.open,
      boughtAt: Date.now(),
      qrToken: token,
    };

    saveBought([newBought, ...boughtItems]);
    saveParked(parkedOffers.filter((p) => p.id !== offer.id));

    setLogs((l) => [
      {
        t: now(),
        msg: `CONVERTED FROM LOT: ${offer.store.item} @ R${offer.price} · Voucher ${token} issued`,
        id: logId++,
      },
      ...l,
    ]);

    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.([60, 40, 100]);
    }

    setParkingLotOpen(false);
    setBoughtModalOpen(true);
  };

  const handleRemoveParkedOffer = (id: string) => {
    saveParked(parkedOffers.filter((p) => p.id !== id));
  };

  const handleClearBoughtReceipt = (id: string) => {
    saveBought(boughtItems.filter((b) => b.id !== id));
  };

  if (view === "landing") {
    return (
      <>
        <LandingPage
          currentUser={currentUser}
          onOpenPasskeyModal={openPasskeyModal}
          onLaunchLiveMesh={() => setView("mesh")}
          onOpenWalkthrough={() => {
            setView("mesh");
            setWalkthroughOpen(true);
          }}
          onSignOut={() => setCurrentUser(null)}
        />
        <PasskeyModal
          isOpen={passkeyModalOpen}
          onClose={() => setPasskeyModalOpen(false)}
          onSuccess={handlePasskeySuccess}
          initialMode={passkeyModalMode}
        />
        <WalkthroughModal
          isOpen={walkthroughOpen}
          onClose={() => setWalkthroughOpen(false)}
          onComplete={handleCompleteWalkthrough}
        />
      </>
    );
  }

  return (
    <main className="relative min-h-[100dvh] w-full overflow-hidden bg-background bg-aurora select-none flex flex-col justify-between">
      {/* Dynamic Header */}
      <header className="relative z-30 w-full px-3 pt-2.5 sm:px-6 sm:pt-4 md:px-10">
        <div className="flex items-center justify-between gap-2 min-w-0 w-full">
          {/* App Logo & Name */}
          <div className="flex items-center gap-2 min-w-0">
            <AutoComLogo size="sm" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-1.5 w-1.5 shrink-0">
                  <span className="absolute inset-0 animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative h-1.5 w-1.5 rounded-full bg-primary" />
                </span>
                <p className="font-mono text-[8px] sm:text-[9px] uppercase tracking-[0.2em] sm:tracking-[0.25em] text-primary truncate">
                  LIVE MESH
                </p>
              </div>
              <h1 className="text-sm sm:text-base md:text-lg font-bold tracking-tight text-foreground truncate leading-tight">
                AutoCom
              </h1>
            </div>
          </div>

          {/* Quick Actions (User, Perimeter & Scan) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Quick Perimeter Badge */}
            <button
              onClick={() => setEnvModalOpen(true)}
              className="glass flex items-center gap-1 rounded-full px-2 sm:px-2.5 py-1 sm:py-1.5 text-[9.5px] sm:text-[10.5px] font-mono text-white hover:border-primary transition-all cursor-pointer"
              title="Configure Proximity Perimeter & Sensors"
            >
              <span>{outdoor ? "🌳" : "🏢"}</span>
              <span className="text-primary font-bold">{activeProximityRadius.toFixed(0)}m</span>
            </button>

            {/* Passkey / User Badge */}
            {currentUser ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => openPasskeyModal("signin")}
                  className="glass rounded-full px-2 sm:px-2.5 py-1 sm:py-1.5 text-[10px] sm:text-xs font-mono text-primary flex items-center gap-1 hover:border-primary/60 transition-all cursor-pointer"
                  title={`Passkey verified: ${currentUser.name}`}
                >
                  <span>🔑</span>
                  <span className="truncate max-w-[50px] sm:max-w-[90px] font-semibold">
                    {currentUser.name}
                  </span>
                </button>
                <button
                  onClick={() => {
                    signOutPasskey();
                    setCurrentUser(null);
                  }}
                  className="glass text-[10px] text-muted-foreground hover:text-foreground h-6 w-6 sm:h-7 sm:w-7 rounded-full flex items-center justify-center cursor-pointer"
                  title="Sign out"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={() => openPasskeyModal("signin")}
                className="glass rounded-full px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-mono text-primary hover:border-primary transition-all cursor-pointer flex items-center gap-1"
              >
                <span>🔑</span>
                <span className="hidden xs:inline">Sign In</span>
              </button>
            )}

            {/* Discover Scan Button */}
            <button
              onClick={() => trigger()}
              className="glass flex items-center gap-1 rounded-full px-2.5 sm:px-3.5 py-1 sm:py-1.5 text-[10.5px] sm:text-xs font-mono text-accent border-accent/40 bg-accent/10 hover:border-accent shadow-amber transition-all active:scale-95 shrink-0 cursor-pointer font-bold"
              aria-label="Scan & Discover Deal"
              title="Discover & Scan Live Deals"
            >
              <span>⚡</span>
              <span>Scan</span>
            </button>
          </div>
        </div>
      </header>

      {/* Top-Center Spatial Compass & Direction Indicator HUD */}
      <div className="relative z-30 w-full max-w-lg sm:max-w-xl mx-auto px-3 sm:px-4 mt-1.5 pointer-events-auto">
        <SpatialCompassHUD
          heading={heading}
          facingStore={facingStore}
          outdoor={outdoor}
          isLiveSensor={isLiveSensor}
          userCoords={userCoords}
          onTurnLeft={() => turnHeadingBy(-30)}
          onTurnRight={() => turnHeadingBy(30)}
          onSetHeading={setManualHeading}
          onRequestPermission={requestPermission}
          permissionStatus={permissionStatus}
        />
      </div>

      {/* Independent Floating Quick Controls: Park (Left), Volume & Silence (Center), Bag (Right) */}
      <div className="relative z-30 w-full max-w-lg sm:max-w-xl md:max-w-2xl mx-auto px-3 sm:px-4 mt-1.5 -mb-2 flex justify-between items-center pointer-events-auto">
        {/* Far Left: Park 🅿️ Floating Button */}
        <button
          onClick={() => setParkingLotOpen(true)}
          className="glass relative flex items-center justify-center gap-1.5 h-8 sm:h-9 px-2.5 sm:px-3.5 rounded-full text-xs font-mono font-bold text-white bg-[#090d19]/90 border border-primary/50 shadow-teal hover:border-primary transition-all cursor-pointer active:scale-95 shrink-0 backdrop-blur-2xl"
          title="Open Parked Offers (Holding Lot)"
          aria-label="Open Holding Lot"
        >
          <span>🅿️</span>
          <span className="hidden xs:inline">Park</span>
          {parkedOffers.length > 0 && (
            <span className="rounded-full bg-primary text-primary-foreground font-mono text-[9px] font-black h-4 min-w-4 sm:h-4.5 sm:min-w-4.5 px-1 flex items-center justify-center shadow-md">
              {parkedOffers.length}
            </span>
          )}
        </button>

        {/* Center: Volume & Card Silence Toggles */}
        <div className="flex items-center gap-2">
          {/* 1. App Sound Volume On/Off Floating Circular Icon Button */}
          <button
            onClick={handleToggleSound}
            className={`h-8 w-8 sm:h-9 sm:w-9 rounded-full flex items-center justify-center text-xs sm:text-sm transition-all cursor-pointer shadow-xl backdrop-blur-2xl border active:scale-95 ${
              soundEnabled
                ? "bg-[#090d19]/90 text-primary border-primary/50 shadow-teal"
                : "bg-[#090d19]/80 text-muted-foreground border-white/20 opacity-70 hover:opacity-100"
            }`}
            title={
              soundEnabled ? "App Sounds: ON (Tap to Mute)" : "App Sounds: OFF (Tap to Unmute)"
            }
            aria-label="Toggle App Sounds"
          >
            {soundEnabled ? "🔊" : "🔇"}
          </button>

          {/* 2. Deal Pop-Up Silencer Floating Circular Icon Button */}
          <button
            onClick={handleToggleSilencePopups}
            className={`h-8 w-8 sm:h-9 sm:w-9 rounded-full flex items-center justify-center text-xs sm:text-sm transition-all cursor-pointer shadow-xl backdrop-blur-2xl border active:scale-95 ${
              silencePopups
                ? "bg-rose-500/25 text-rose-300 border-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.4)]"
                : "bg-[#090d19]/90 text-accent border-accent/50 shadow-amber"
            }`}
            title={
              silencePopups
                ? "Deal Pop-up Cards: SILENCED (Saved directly to Deck). Tap to Enable."
                : "Deal Pop-up Cards: ACTIVE. Tap to Silence."
            }
            aria-label="Toggle Deal Pop-up Silencer"
          >
            {silencePopups ? "🔕" : "🔔"}
          </button>
        </div>

        {/* Far Right: Bag 🛍️ Floating Button */}
        <button
          onClick={() => setBoughtModalOpen(true)}
          className="glass relative flex items-center justify-center gap-1.5 h-8 sm:h-9 px-2.5 sm:px-3.5 rounded-full text-xs font-mono font-bold text-white bg-[#090d19]/90 border border-accent/50 shadow-amber hover:border-accent transition-all cursor-pointer active:scale-95 shrink-0 backdrop-blur-2xl"
          title="Open Bought Items & Receipts"
          aria-label="Open Bought Items"
        >
          <span>🛍️</span>
          <span className="hidden xs:inline">Bag</span>
          {boughtItems.length > 0 && (
            <span className="rounded-full bg-accent text-accent-foreground font-mono text-[9px] font-black h-4 min-w-4 sm:h-4.5 sm:min-w-4.5 px-1 flex items-center justify-center shadow-md">
              {boughtItems.length}
            </span>
          )}
        </button>
      </div>

      {/* 3D Sphere Interactive Canvas */}
      <section
        className="relative z-10 flex-1 w-full flex items-center justify-center cursor-grab active:cursor-grabbing touch-none select-none overflow-hidden my-auto"
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerLeave={up}
        style={{ minHeight: isMobile ? "55dvh" : "65dvh" }}
      >
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[calc(50%+2.2rem)] sm:-translate-y-[calc(50%+2.75rem)] pointer-events-none w-0 h-0">
          {/* Breathing Radial Orbit Rings */}
          {mounted && (
            <>
              {[1, 0.72, 0.45].map((k) => (
                <div
                  key={k}
                  className="absolute rounded-full border border-primary/15 animate-breathe pointer-events-none"
                  style={{
                    width: radAnim * scale * (isMobile ? 2.5 : 2.9) * k,
                    height: radAnim * scale * (isMobile ? 1.6 : 1.9) * k,
                    left: -radAnim * scale * (isMobile ? 1.25 : 1.45) * k,
                    top: -radAnim * scale * (isMobile ? 0.8 : 0.95) * k,
                  }}
                />
              ))}
            </>
          )}

          {/* Ambient Glow */}
          <div className="absolute -left-12 -top-12 h-24 w-24 sm:-left-16 sm:-top-16 sm:h-32 sm:w-32 rounded-full bg-secondary/25 blur-3xl animate-breathe pointer-events-none" />

          {/* Center Observer Beacon */}
          <div className="absolute -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
            <div className="mx-auto h-3.5 w-3.5 sm:h-4 sm:w-4 rounded-full bg-primary shadow-teal ring-4 ring-primary/20 animate-pulse" />
            <p className="mt-1.5 font-mono text-[9px] sm:text-[10px] uppercase tracking-widest text-muted-foreground whitespace-nowrap">
              You · {outdoor ? "50m" : "20m"}
            </p>
          </div>

          {/* Active Negotiation Sonar Ripples */}
          {deal && (
            <>
              {[0, 0.8, 1.6].map((d) => (
                <div
                  key={d}
                  className="absolute left-0 top-0 h-32 w-32 sm:h-44 sm:w-44 rounded-full border-2 border-accent animate-sonar pointer-events-none"
                  style={{ animationDelay: `${d}s` }}
                />
              ))}
            </>
          )}

          {/* 3D Floating Node Cards (Enlarged, Click to expand & Pull to Deck) */}
          {mounted &&
            [...nodes]
              .sort((a, b) => a.z - b.z)
              .map(({ s, x, y, z }) => {
                const p = (z + 1) / 2;
                const hot = deal?.store.id === s.id;
                const isExpanded = expandedCardId === s.id;
                const isFacing = facingStore?.id === s.id;
                const isPulled = pulledCards.some((pc) => pc.store.id === s.id);
                const isParked = parkedOffers.some((o) => o.store.id === s.id);
                const isBought = boughtItems.some((b) => b.store.id === s.id);
                const c = hueVar[s.hue];

                // Mobile-optimized scale floor + expansion & facing multiplier (Enlarged and taller for mobile)
                const cardScale =
                  (isMobile ? 0.74 + p * 0.44 : 0.68 + p * 0.46) *
                  (hot ? 1.12 : 1) *
                  (isFacing ? 1.15 : 1) *
                  (isExpanded ? 1.25 : 1) *
                  Math.max(
                    scale * (isMobile ? 1.15 : 1.15),
                    isSmallMobile ? 0.92 : isMobile ? 1.0 : 1.05,
                  );

                return (
                  <div
                    key={s.id}
                    className="absolute left-0 top-0 pointer-events-auto select-none"
                    style={{
                      transform: `translate(-50%,-50%) translate(${x}px, ${y}px) scale(${cardScale})`,
                      zIndex: isExpanded ? 80 : isFacing ? 75 : Math.round(p * 100),
                      opacity: isPulled ? 0.5 : isMobile ? 0.85 + p * 0.15 : 0.88 + p * 0.12,
                    }}
                  >
                    <button
                      onClick={() => handleCardClick(s)}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        handlePullOutCard(s);
                      }}
                      className={`relative rounded-2xl sm:rounded-3xl p-2.5 sm:p-3.5 text-left transition-all duration-300 touch-manipulation cursor-pointer w-full block bg-[#0f1423]/95 backdrop-blur-2xl shadow-2xl ${
                        isFacing
                          ? "ring-2 ring-accent border-accent shadow-amber"
                          : isExpanded
                            ? "ring-2 ring-primary border-primary shadow-teal"
                            : "border border-white/15"
                      }`}
                      style={{
                        width: isSmallMobile ? "13.6rem" : isMobile ? "14.8rem" : "15.8rem",
                        boxShadow: isFacing
                          ? "var(--glow-amber)"
                          : hot
                            ? "var(--glow-amber)"
                            : isExpanded
                              ? "var(--glow-teal)"
                              : `0 8px 24px -4px rgba(0,0,0,0.8), 0 0 16px color-mix(in oklab, ${c} 45%, transparent)`,
                        borderColor: isFacing
                          ? "var(--accent)"
                          : hot
                            ? "var(--accent)"
                            : isBought
                              ? "oklch(0.7 0.2 150)"
                              : isParked
                                ? "var(--primary)"
                                : isExpanded
                                  ? "var(--primary)"
                                  : `color-mix(in oklab, ${c} 50%, rgba(255,255,255,0.2))`,
                        pointerEvents: p < 0.25 ? "none" : "auto",
                      }}
                    >
                      {/* Item Image on Special (Taller and richer on mobile) */}
                      {s.image && (
                        <div className="relative mb-2.5 h-28 sm:h-32 w-full overflow-hidden rounded-xl sm:rounded-2xl border border-white/20 shadow-inner group">
                          <img
                            src={s.image}
                            alt={s.item}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0f1423] via-transparent to-black/30" />
                          {s.specialBadge && (
                            <span className="absolute top-1.5 left-1.5 rounded-full bg-accent text-accent-foreground font-mono text-[8px] font-black px-1.5 py-0.5 shadow-sm">
                              ⚡ {s.specialBadge}
                            </span>
                          )}
                          {isFacing && (
                            <span className="absolute top-1.5 right-1.5 rounded-full bg-emerald-400 text-black font-mono text-[8px] font-black px-1.5 py-0.5 shadow-md animate-pulse">
                              🎯 FACING
                            </span>
                          )}
                          <span className="absolute bottom-1.5 right-1.5 rounded-md bg-black/75 px-1.5 py-0.5 font-mono text-[8.5px] text-white border border-white/10">
                            {s.dist}m
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                        <span
                          className="grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-xl text-base shrink-0 border border-white/20 bg-white/10 shadow-inner"
                          style={{
                            boxShadow: `inset 0 0 12px ${c}`,
                          }}
                        >
                          {s.icon}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs sm:text-sm font-extrabold leading-tight text-white drop-shadow-sm">
                            {s.item}
                          </p>
                          <p className="font-mono text-[10px] sm:text-[11px] text-slate-200 truncate font-medium flex items-center gap-1">
                            <span className="text-white/90 font-semibold">{s.name}</span>
                            <span>·</span>
                            <span className="text-primary">{s.cat}</span>
                          </p>
                        </div>
                      </div>

                      <div
                        className="mt-2 flex items-center justify-between font-mono text-[9.5px] sm:text-[10px] uppercase tracking-wider"
                        style={{ color: c }}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="relative flex h-2 w-2 shrink-0">
                            <span
                              className="absolute inset-0 animate-ping rounded-full"
                              style={{ background: c }}
                            />
                            <span
                              className="relative h-2 w-2 rounded-full"
                              style={{ background: c }}
                            />
                          </span>
                          <span className="truncate font-bold">
                            {isBought
                              ? "Purchased ✓"
                              : isParked
                                ? "Parked in Lot 🅿️"
                                : isFacing
                                  ? "Facing Store 🎯"
                                  : "Live Agent"}
                          </span>
                        </div>
                        <span className="font-extrabold text-white shrink-0 text-xs sm:text-sm">
                          R{s.open}
                        </span>
                      </div>

                      <div className="mt-1.5 h-4 sm:h-4.5 overflow-hidden font-mono text-[10px] sm:text-[11px] text-white bg-black/60 rounded-md px-2 py-0.5 border border-white/15">
                        <p key={ticks[s.id]} className="animate-ticker truncate font-medium">
                          {ticks[s.id] ?? "Opening channel…"}
                        </p>
                      </div>

                      {/* Pull out button overlay on card */}
                      <div className="mt-2 pt-1.5 border-t border-white/15 flex items-center justify-between text-[9.5px] font-mono">
                        <span className="text-slate-300 font-medium">Tap: Enlarge</span>
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePullOutCard(s);
                          }}
                          className="rounded-lg bg-primary/25 border border-primary/40 px-2 py-0.5 text-primary font-bold hover:bg-primary/40 transition-colors cursor-pointer"
                          title="Pull this card out to float freely or deck stack"
                        >
                          + Pull 📑
                        </span>
                      </div>
                    </button>
                  </div>
                );
              })}
        </div>
      </section>

      {/* Floating Deck Alignment Control Bar (Appears ONLY when cards are pulled) */}
      {pulledCards.length > 0 && (
        <div className="fixed top-20 sm:top-24 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 p-1.5 rounded-full glass bg-[#090d19]/95 border border-primary/50 shadow-2xl backdrop-blur-2xl animate-scale-up">
          <span className="font-mono text-[10px] text-primary font-bold px-2 py-0.5 border-r border-white/10 flex items-center gap-1">
            <span>📑</span>
            <span>{pulledCards.length} Pulled</span>
          </span>
          <button
            onClick={() => setDeckMode(deckMode === "left" ? "none" : "left")}
            className={`px-3 py-1 rounded-full font-mono text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
              deckMode === "left"
                ? "bg-primary text-primary-foreground shadow-teal"
                : "text-muted-foreground hover:text-foreground hover:bg-white/10"
            }`}
            title="Align pulled cards to left deck stack"
          >
            <span>⊟</span>
            <span>Deck L</span>
          </button>
          <button
            onClick={() => setDeckMode(deckMode === "right" ? "none" : "right")}
            className={`px-3 py-1 rounded-full font-mono text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
              deckMode === "right"
                ? "bg-primary text-primary-foreground shadow-teal"
                : "text-muted-foreground hover:text-foreground hover:bg-white/10"
            }`}
            title="Align pulled cards to right deck stack"
          >
            <span>⊞</span>
            <span>Deck R</span>
          </button>
          {deckMode !== "none" && (
            <button
              onClick={() => setDeckMode("none")}
              className="px-2.5 py-1 rounded-full font-mono text-[11px] text-amber-400 hover:text-amber-300 hover:bg-amber-500/20 transition-all cursor-pointer flex items-center gap-1"
              title="Release alignment to freeform movement"
            >
              <span>✕</span>
              <span>Free</span>
            </button>
          )}
        </div>
      )}

      {/* Floating Pulled Deck Cards (Draggable, Swipable, Cascade Deck) */}
      {pulledCards.map((p) => (
        <FloatingDeckCard
          key={p.store.id}
          store={p.store}
          liveTick={ticks[p.store.id] ?? "Opening channel…"}
          isBought={boughtItems.some((b) => b.store.id === p.store.id)}
          isParked={parkedOffers.some((o) => o.store.id === p.store.id)}
          initialPos={p.pos}
          deckAlignment={getDeckAlignment(p.store.id)}
          isExpanded={expandedCardId === p.store.id}
          onToggleExpand={() => {
            setExpandedCardId(expandedCardId === p.store.id ? null : p.store.id);
          }}
          onNegotiate={(store) => {
            setExpandedCardId(store.id);
            trigger(store);
          }}
          onPark={(store) => {
            const newParked: ParkedOffer = {
              id: `park_${Date.now()}_${store.id}`,
              store,
              price: Math.round(store.open * 0.8),
              counter: Math.round(store.open * 0.76),
              open: store.open,
              expires: Date.now() + 465000,
              parkedAt: Date.now(),
            };
            saveParked([newParked, ...parkedOffers.filter((o) => o.store.id !== store.id)]);
            handleReleaseCard(store.id);
            setExpandedCardId(null);
            setDeal(null);
            setActivePopupDeal(null);
            setMatchedDeckOpen(false);
          }}
          onBuy={(store) => {
            trigger(store);
          }}
          onRelease={handleReleaseCard}
        />
      ))}

      {/* 2-Second Non-Intrusive Deal Match Pop-Up (Auto-disappears to Matched Deck) */}
      <DealMatchPopup
        deal={activePopupDeal}
        onAutoDismissToDeck={handleAutoDismissToDeck}
        onOpenDeck={() => setMatchedDeckOpen(true)}
        onDismiss={() => setActivePopupDeal(null)}
      />

      {/* Matched Deals Deck Modal (Browse, Scroll, Swipe Buy/Park/Discard) */}
      <MatchedDeckModal
        isOpen={matchedDeckOpen}
        onClose={() => setMatchedDeckOpen(false)}
        deck={matchedDeck}
        onBuy={handleBuyFromDeck}
        onPark={handleParkFromDeck}
        onDiscard={handleDiscardFromDeck}
      />

      {/* Independent Floating Action Buttons Carousel (Swipeable Left & Right) */}
      <nav
        aria-label="Independent quick action carousel"
        className="fixed bottom-3 sm:bottom-4 inset-x-0 z-40 flex items-center justify-center pointer-events-none px-2 sm:px-4"
        style={{ bottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <div className="relative w-full max-w-2xl flex items-center justify-center">
          {/* Left Carousel Scroll Nudge Button */}
          {canScrollLeft && (
            <button
              onClick={() => scrollBottomCarousel("left")}
              className="glass pointer-events-auto absolute -left-1 sm:-left-2 z-50 h-8 w-8 sm:h-9 sm:w-9 rounded-full flex items-center justify-center text-xs font-bold text-white bg-[#090d19]/95 border border-white/20 shadow-2xl hover:border-primary hover:bg-primary/20 transition-all cursor-pointer animate-fade-in backdrop-blur-2xl ring-1 ring-white/10 shrink-0"
              title="Slide Left"
              aria-label="Scroll buttons left"
            >
              ◀
            </button>
          )}

          {/* Horizontal Swipable & Scrollable Floating Capsule Carousel with Mouse Hold & Drag */}
          <div
            ref={bottomCarouselRef}
            onPointerDown={handleBottomPointerDown}
            onPointerMove={handleBottomPointerMove}
            onPointerUp={handleBottomPointerUp}
            onPointerCancel={handleBottomPointerUp}
            onPointerLeave={handleBottomPointerUp}
            onScroll={updateScrollIndicators}
            onWheel={(e) => {
              if (bottomCarouselRef.current) {
                bottomCarouselRef.current.scrollLeft += e.deltaY;
              }
            }}
            className={`w-full flex items-center gap-1.5 xs:gap-2 sm:gap-2.5 overflow-x-auto scrollbar-none snap-x snap-mandatory py-2.5 px-6 sm:px-8 pointer-events-auto touch-pan-x select-none transition-all ${
              isBottomDragging ? "cursor-grabbing" : "cursor-grab"
            }`}
            style={{
              WebkitOverflowScrolling: "touch",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {/* 1. Indoor Mall Navigation Simulator Button */}
            <button
              onClick={() => safeBottomAction(() => setMallSimulatorOpen(true))}
              className="glass relative snap-center flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 rounded-2xl px-2.5 sm:px-3.5 py-2 sm:py-2.5 border border-purple-500/50 bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 shadow-[0_0_12px_rgba(168,85,247,0.3)] active:scale-95 transition-all cursor-pointer backdrop-blur-2xl ring-1 ring-purple-500/30 shrink-0 select-none"
              aria-label="Open Indoor Mall Navigation Simulator"
              title="Open Indoor Mall Navigation Simulator"
            >
              <span className="text-base sm:text-lg shrink-0 pointer-events-none">🧭</span>
              <div className="text-left hidden sm:block min-w-0 pointer-events-none">
                <p className="font-mono text-[8px] uppercase tracking-wider text-purple-300 leading-none">
                  Sim
                </p>
                <p className="text-[11px] font-bold text-white truncate">Mall Nav</p>
              </div>
              <span className="text-[8.5px] font-mono text-purple-300 sm:hidden leading-none truncate max-w-full pointer-events-none">
                Mall Sim
              </span>
            </button>

            {/* 2. Home / Re-center Button */}
            <button
              onClick={() =>
                safeBottomAction(() => {
                  rotRef.current = 0;
                  setRot(0);
                  target.current = null;
                  setExpandedCardId(null);
                  setDeal(null);
                  setActivePopupDeal(null);
                  setDrawer(false);
                  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
                    navigator.vibrate?.([20, 30]);
                  }
                })
              }
              className="glass relative snap-center flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 rounded-2xl px-2.5 sm:px-3.5 py-2 sm:py-2.5 border border-white/20 bg-[#090d19]/92 hover:bg-white/15 hover:border-primary shadow-xl active:scale-95 transition-all cursor-pointer backdrop-blur-2xl ring-1 ring-white/10 shrink-0 select-none"
              aria-label="Return to center home view"
              title="Return to Center Origin"
            >
              <span className="text-base sm:text-lg shrink-0 pointer-events-none">🏠</span>
              <div className="text-left hidden sm:block min-w-0 pointer-events-none">
                <p className="font-mono text-[8px] uppercase tracking-wider text-muted-foreground leading-none">
                  App
                </p>
                <p className="text-[11px] font-bold text-foreground truncate">Home</p>
              </div>
              <span className="text-[8.5px] font-mono text-foreground/80 sm:hidden leading-none truncate max-w-full pointer-events-none">
                Home
              </span>
            </button>

            {/* 3. Indoor / Outdoor & Velocity Auto-Switching Button */}
            <button
              onClick={() => safeBottomAction(() => setEnvModalOpen(true))}
              className="glass relative snap-center flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 rounded-2xl px-2.5 sm:px-3.5 py-2 sm:py-2.5 border border-white/20 bg-[#090d19]/92 hover:bg-white/15 hover:border-primary shadow-xl active:scale-95 transition-all cursor-pointer backdrop-blur-2xl ring-1 ring-white/10 shrink-0 select-none"
              title={`Mode: ${isDriving ? "Driving" : isFastWalking ? "Fast Walk" : outdoor ? "Outdoor" : "Indoor"} · Speed: ${effectiveSpeed.toFixed(0)}km/h · Cadence: ${Math.round(currentCadenceMs / 1000)}s · Tap to configure`}
              aria-label="Open Environment and Perimeter Selector"
            >
              <span className="text-base sm:text-lg shrink-0 pointer-events-none">
                {isDriving ? "🚗" : isFastWalking ? "🏃" : outdoor ? "🌳" : "🏢"}
              </span>
              <div className="text-center sm:text-left font-mono leading-none min-w-0 pointer-events-none">
                <div className="flex items-center justify-center sm:justify-start gap-1">
                  <span className="text-[9.5px] sm:text-xs font-bold text-white">
                    {Math.round(currentCadenceMs / 1000)}s
                  </span>
                  {isDriving ? (
                    <span className="rounded-md bg-rose-500/30 text-rose-300 font-mono text-[7px] px-1 py-0.2 font-black">
                      40%+
                    </span>
                  ) : (
                    envMode === "auto" && (
                      <span className="relative flex h-1.5 w-1.5 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent" />
                      </span>
                    )
                  )}
                </div>
                <span className="text-[7.5px] sm:text-[8px] text-muted-foreground uppercase block mt-0.5">
                  {isDriving
                    ? "Drive"
                    : isFastWalking
                      ? "Fast"
                      : `${activeProximityRadius.toFixed(0)}m`}
                </span>
              </div>
            </button>

            {/* 4. Matched Deals Deck Button */}
            <button
              onClick={() => safeBottomAction(() => setMatchedDeckOpen(true))}
              className="glass relative snap-center flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 rounded-2xl px-2.5 sm:px-4 py-2 sm:py-2.5 border border-accent/60 bg-accent/25 hover:bg-accent/35 text-accent shadow-amber active:scale-95 transition-all cursor-pointer backdrop-blur-2xl ring-1 ring-accent/40 shrink-0 select-none"
              title="Open Matched Deals Deck"
              aria-label="Open Matched Deals Deck"
            >
              <span className="text-base sm:text-lg shrink-0 pointer-events-none">⚡</span>
              <div className="text-center sm:text-left font-mono leading-none min-w-0 pointer-events-none">
                <p className="text-[9.5px] sm:text-xs font-bold text-white">Deck</p>
                <p className="text-[7.5px] sm:text-[8px] text-accent mt-0.5 hidden sm:block">
                  {matchedDeck.length} Deals
                </p>
                <span className="text-[7.5px] sm:hidden text-accent mt-0.5 block font-bold">
                  {matchedDeck.length}
                </span>
              </div>
              {matchedDeck.length > 0 && (
                <span className="absolute -top-1 -right-1 sm:static rounded-full bg-accent text-accent-foreground font-mono text-[9px] sm:text-[10px] font-black h-4.5 min-w-4.5 sm:h-5 sm:min-w-5 px-1 flex items-center justify-center shadow-md pointer-events-none">
                  {matchedDeck.length}
                </span>
              )}
            </button>

            {/* 4b. Permanent Deck L Stack Control in Bottom Carousel */}
            <button
              onClick={() =>
                safeBottomAction(() => setDeckMode(deckMode === "left" ? "none" : "left"))
              }
              className={`glass relative snap-center flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 rounded-2xl px-2.5 sm:px-3.5 py-2 sm:py-2.5 border transition-all cursor-pointer backdrop-blur-2xl ring-1 ring-white/10 shrink-0 select-none ${
                deckMode === "left"
                  ? "border-primary bg-primary/25 text-primary shadow-teal"
                  : "border-white/20 bg-[#090d19]/92 hover:bg-white/15 hover:border-primary"
              }`}
              title="Align pulled cards into Left Deck stack"
              aria-label="Align pulled cards to left stack"
            >
              <span className="text-base sm:text-lg shrink-0 pointer-events-none">⊟</span>
              <div className="text-center sm:text-left font-mono leading-none min-w-0 pointer-events-none">
                <p className="text-[9.5px] sm:text-xs font-bold text-white">Deck L</p>
                <p className="text-[7.5px] sm:text-[8px] text-muted-foreground mt-0.5 truncate">
                  {deckMode === "left" ? "Active ✓" : "Stack L"}
                </p>
              </div>
            </button>

            {/* 4c. Permanent Deck R Stack Control in Bottom Carousel */}
            <button
              onClick={() =>
                safeBottomAction(() => setDeckMode(deckMode === "right" ? "none" : "right"))
              }
              className={`glass relative snap-center flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 rounded-2xl px-2.5 sm:px-3.5 py-2 sm:py-2.5 border transition-all cursor-pointer backdrop-blur-2xl ring-1 ring-white/10 shrink-0 select-none ${
                deckMode === "right"
                  ? "border-primary bg-primary/25 text-primary shadow-teal"
                  : "border-white/20 bg-[#090d19]/92 hover:bg-white/15 hover:border-primary"
              }`}
              title="Align pulled cards into Right Deck stack"
              aria-label="Align pulled cards to right stack"
            >
              <span className="text-base sm:text-lg shrink-0 pointer-events-none">⊞</span>
              <div className="text-center sm:text-left font-mono leading-none min-w-0 pointer-events-none">
                <p className="text-[9.5px] sm:text-xs font-bold text-white">Deck R</p>
                <p className="text-[7.5px] sm:text-[8px] text-muted-foreground mt-0.5 truncate">
                  {deckMode === "right" ? "Active ✓" : "Stack R"}
                </p>
              </div>
            </button>

            {/* 4d. Permanent Free Alignment Reset Button in Bottom Carousel */}
            {deckMode !== "none" && (
              <button
                onClick={() => safeBottomAction(() => setDeckMode("none"))}
                className="glass relative snap-center flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 rounded-2xl px-2.5 sm:px-3.5 py-2 sm:py-2.5 border border-amber-500/50 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.3)] transition-all cursor-pointer backdrop-blur-2xl ring-1 ring-amber-500/30 shrink-0 select-none"
                title="Release alignment to freeform movement"
                aria-label="Release alignment to freeform movement"
              >
                <span className="text-base sm:text-lg shrink-0 pointer-events-none">✕</span>
                <div className="text-center sm:text-left font-mono leading-none min-w-0 pointer-events-none">
                  <p className="text-[9.5px] sm:text-xs font-bold text-amber-300">Free</p>
                  <p className="text-[7.5px] sm:text-[8px] text-amber-400 mt-0.5 truncate">
                    Unstack
                  </p>
                </div>
              </button>
            )}

            {/* 5. Floating Agent Control Button */}
            <button
              onClick={() => safeBottomAction(() => setDrawer(true))}
              className="glass relative snap-center flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 rounded-2xl px-2.5 sm:px-4 py-2 sm:py-2.5 border border-primary/50 bg-primary/25 hover:bg-primary/35 text-primary shadow-teal active:scale-95 transition-all cursor-pointer backdrop-blur-2xl ring-1 ring-primary/40 shrink-0 select-none"
              aria-label="Open Agent Control"
              title="Open Agent Control & Guardrails"
            >
              <span className="text-base sm:text-lg shrink-0 pointer-events-none">🤖</span>
              <div className="text-center sm:text-left font-mono leading-none min-w-0 pointer-events-none">
                <p className="text-[9.5px] sm:text-xs font-bold text-white">Agent</p>
                <p className="text-[7.5px] sm:text-[8.5px] text-primary font-semibold mt-0.5 truncate">
                  R{budget >= 1000 ? `${(budget / 1000).toFixed(0)}k` : budget}
                </p>
              </div>
            </button>

            {/* 5b. A2A Bot Hub Button */}
            <button
              onClick={() => safeBottomAction(() => setAgentCommerceOpen(true))}
              className="glass relative snap-center flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 rounded-2xl px-2.5 sm:px-4 py-2 sm:py-2.5 border border-primary/60 bg-gradient-to-r from-primary/25 to-teal-400/20 hover:from-primary/35 hover:to-teal-400/30 text-primary shadow-teal active:scale-95 transition-all cursor-pointer backdrop-blur-2xl ring-1 ring-primary/40 shrink-0 select-none"
              aria-label="Open Agent-to-Agent (A2A) Commerce Core"
              title="Open A2A Machine Negotiation Hub (Muse-ZA & Nibble-ZA)"
            >
              <span className="text-base sm:text-lg shrink-0 pointer-events-none">⚡</span>
              <div className="text-center sm:text-left font-mono leading-none min-w-0 pointer-events-none">
                <p className="text-[9.5px] sm:text-xs font-bold text-white">A2A Hub</p>
                <p className="text-[7.5px] sm:text-[8.5px] text-teal-300 font-semibold mt-0.5 truncate">
                  M2M Deals
                </p>
              </div>
              <span className="absolute -top-1 -right-1 sm:static rounded-full bg-primary text-black font-mono text-[8px] font-black h-4 min-w-4 sm:h-4.5 sm:min-w-4.5 px-1 flex items-center justify-center shadow-md pointer-events-none">
                AI
              </span>
            </button>

            {/* 6. Settings & Telemetry Button */}
            <button
              onClick={() => safeBottomAction(() => setEnvModalOpen(true))}
              className="glass relative snap-center flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 rounded-2xl px-2.5 sm:px-3.5 py-2 sm:py-2.5 border border-white/20 bg-[#090d19]/92 hover:bg-white/15 hover:border-primary shadow-xl active:scale-95 transition-all cursor-pointer backdrop-blur-2xl ring-1 ring-white/10 shrink-0 select-none"
              title="Open Sensors, Audio & System Settings"
              aria-label="Open Settings"
            >
              <span className="text-base sm:text-lg shrink-0 pointer-events-none">⚙️</span>
              <div className="text-left hidden sm:block min-w-0 pointer-events-none">
                <p className="font-mono text-[8px] uppercase tracking-wider text-muted-foreground leading-none">
                  System
                </p>
                <p className="text-[11px] font-bold text-foreground truncate">Settings</p>
              </div>
              <span className="text-[8.5px] font-mono text-muted-foreground sm:hidden leading-none truncate max-w-full pointer-events-none">
                Config
              </span>
            </button>

            {/* 7. Passkey Sign In / Profile Button */}
            <button
              onClick={() => safeBottomAction(() => openPasskeyModal("signin"))}
              className="glass relative snap-center flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 rounded-2xl px-2.5 sm:px-3.5 py-2 sm:py-2.5 border border-primary/30 bg-primary/10 hover:bg-primary/20 hover:border-primary text-primary active:scale-95 transition-all cursor-pointer backdrop-blur-2xl ring-1 ring-primary/20 shrink-0 select-none"
              title={currentUser ? `Signed in as ${currentUser.displayName}` : "Passkey Sign In"}
              aria-label="Passkey Sign In"
            >
              <span className="text-base sm:text-lg shrink-0 pointer-events-none">🔑</span>
              <div className="text-left hidden sm:block min-w-0 pointer-events-none">
                <p className="font-mono text-[8px] uppercase tracking-wider text-muted-foreground leading-none">
                  Profile
                </p>
                <p className="text-[11px] font-bold text-primary truncate max-w-[80px]">
                  {currentUser ? currentUser.displayName : "Sign In"}
                </p>
              </div>
              <span className="text-[8.5px] font-mono text-primary font-bold sm:hidden leading-none truncate max-w-full pointer-events-none">
                Auth
              </span>
            </button>

            {/* 8. Overview / Landing Page Button (Far Right End of Carousel) */}
            <button
              onClick={() => safeBottomAction(() => setView("landing"))}
              className="glass relative snap-center flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 rounded-2xl px-2.5 sm:px-3.5 py-2 sm:py-2.5 border border-white/20 bg-[#090d19]/92 hover:bg-white/15 hover:border-primary shadow-xl active:scale-95 transition-all cursor-pointer backdrop-blur-2xl ring-1 ring-white/10 shrink-0 select-none"
              aria-label="Return to Overview Landing Page"
              title="Return to Overview Landing Page"
            >
              <span className="text-base sm:text-lg shrink-0 pointer-events-none">←</span>
              <div className="text-left hidden sm:block min-w-0 pointer-events-none">
                <p className="font-mono text-[8px] uppercase tracking-wider text-muted-foreground leading-none">
                  Landing
                </p>
                <p className="text-[11px] font-bold text-foreground truncate">Overview</p>
              </div>
              <span className="text-[8.5px] font-mono text-foreground/80 sm:hidden leading-none truncate max-w-full pointer-events-none">
                Overview
              </span>
            </button>

            {/* 9. Interactive Walkthrough Guide Button (Far Right End of Carousel) */}
            <button
              onClick={() => safeBottomAction(() => setWalkthroughOpen(true))}
              className="glass relative snap-center flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 rounded-2xl px-2.5 sm:px-3.5 py-2 sm:py-2.5 border border-primary/40 bg-primary/15 text-primary hover:bg-primary/25 shadow-teal active:scale-95 transition-all cursor-pointer backdrop-blur-2xl ring-1 ring-primary/20 shrink-0 select-none"
              aria-label="Replay Interactive Walkthrough Guide"
              title="Replay Interactive Walkthrough Guide"
            >
              <span className="text-base sm:text-lg shrink-0 pointer-events-none">💡</span>
              <div className="text-left hidden sm:block min-w-0 pointer-events-none">
                <p className="font-mono text-[8px] uppercase tracking-wider text-primary/80 leading-none">
                  Help
                </p>
                <p className="text-[11px] font-bold text-foreground truncate">Guide</p>
              </div>
              <span className="text-[8.5px] font-mono text-primary sm:hidden leading-none truncate max-w-full pointer-events-none">
                Guide
              </span>
            </button>
          </div>

          {/* Right Carousel Scroll Nudge Button */}
          {canScrollRight && (
            <button
              onClick={() => scrollBottomCarousel("right")}
              className="glass pointer-events-auto absolute -right-1 sm:-right-2 z-50 h-8 w-8 sm:h-9 sm:w-9 rounded-full flex items-center justify-center text-xs font-bold text-white bg-[#090d19]/95 border border-white/20 shadow-2xl hover:border-primary hover:bg-primary/20 transition-all cursor-pointer animate-fade-in backdrop-blur-2xl ring-1 ring-white/10 shrink-0"
              title="Slide Right"
              aria-label="Scroll buttons right"
            >
              ▶
            </button>
          )}
        </div>
      </nav>

      {/* Mobile-Optimized Agent Control Bottom Sheet (Opened via Floating Agent Icon) */}
      {drawer && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="agent-control-title"
          className="fixed inset-0 z-50 flex flex-col justify-end bg-black/65 backdrop-blur-sm animate-fade-in"
          onClick={() => setDrawer(false)}
        >
          <div
            className="glass w-full max-w-3xl mx-auto rounded-t-3xl border-t border-primary/40 bg-[#0c101c]/98 shadow-2xl p-4 sm:p-6 max-h-[85dvh] overflow-y-auto animate-slideup text-foreground"
            onClick={(e) => e.stopPropagation()}
            style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🤖</span>
                <div>
                  <h2
                    id="agent-control-title"
                    className="text-sm sm:text-base font-bold text-white"
                  >
                    Agent Control & Parameters
                  </h2>
                  <p className="text-[10px] font-mono text-muted-foreground">
                    {currentUser ? `@${currentUser.name}` : "Autonomous Pilot"} · Budget R{budget}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setDrawer(false)}
                className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-white hover:bg-white/10 transition-colors text-sm cursor-pointer"
                aria-label="Close Agent Control"
              >
                ✕
              </button>
            </div>

            {/* Mobile Tab Switcher */}
            <div className="flex md:hidden border-b border-border/50 my-3">
              <button
                onClick={() => setDrawerTab("profile")}
                className={`flex-1 py-2 text-xs font-mono font-medium border-b-2 transition-colors ${
                  drawerTab === "profile"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground"
                }`}
              >
                Preferences & Budget
              </button>
              <button
                onClick={() => setDrawerTab("logs")}
                className={`flex-1 py-2 text-xs font-mono font-medium border-b-2 transition-colors ${
                  drawerTab === "logs"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground"
                }`}
              >
                Activity Stream ({logs.length})
              </button>
            </div>

            {/* Drawer Body */}
            <div className="grid gap-5 md:grid-cols-2 pt-2">
              {/* Agent Profile & Budget Section */}
              <div className={isMobile && drawerTab !== "profile" ? "hidden md:block" : "block"}>
                {/* A2A Negotiation Hub Launch Banner */}
                <div className="mb-4 p-3.5 rounded-2xl border border-primary/50 bg-gradient-to-r from-primary/20 via-teal-500/15 to-transparent flex items-center justify-between gap-3 shadow-teal">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-2xl">🤖🤝🏪</span>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">
                        Agent-to-Agent (A2A) Commerce Core
                      </h4>
                      <p className="text-[10px] font-mono text-teal-300 truncate">
                        Autonomous M2M Bargaining (Muse-ZA & Nibble-ZA)
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setDrawer(false);
                      setAgentCommerceOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-primary text-black font-mono text-xs font-bold hover:opacity-95 transition-all shadow-md shrink-0 cursor-pointer"
                  >
                    Open Hub ⚡
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <h3 className="text-sm sm:text-base font-bold text-foreground">
                    My Agent Intent & Guardrails
                  </h3>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {tags.length} active tags
                  </span>
                </div>

                {/* Active Intent Tags */}
                <p className="mt-2.5 text-[11px] sm:text-xs text-muted-foreground">
                  Active Intent Keywords
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {tags.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTags(tags.filter((x) => x !== t))}
                      className="group rounded-full border border-secondary/50 bg-secondary/15 px-2.5 py-1 text-[11px] shadow-purple flex items-center gap-1.5 transition-all hover:bg-destructive/20 hover:border-destructive active:scale-95"
                      title="Tap to remove"
                    >
                      <span>{t}</span>
                      <span className="text-muted-foreground group-hover:text-destructive">✕</span>
                    </button>
                  ))}
                  {tags.length === 0 && (
                    <p className="text-[11px] text-muted-foreground italic">
                      No active intent tags. Add some below to guide your agent.
                    </p>
                  )}
                </div>

                {/* Suggested Quick Add Tags */}
                <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                    Quick add:
                  </span>
                  {SUGGESTED_TAGS.filter((s) => !tags.includes(s)).map((suggested) => (
                    <button
                      key={suggested}
                      onClick={() => addTag(suggested)}
                      className="rounded-full border border-border/80 bg-muted/40 px-2 py-0.5 text-[10px] text-foreground/80 hover:border-primary hover:text-primary transition-colors whitespace-nowrap active:scale-95 cursor-pointer"
                    >
                      + {suggested}
                    </button>
                  ))}
                </div>

                {/* Add Custom Tag Form */}
                <form
                  className="mt-3 flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.currentTarget;
                    const f = new FormData(form).get("t")?.toString();
                    if (f) addTag(f);
                    form.reset();
                  }}
                >
                  <input
                    name="t"
                    placeholder="Add custom intent (e.g. Sneakers, Ramen)…"
                    className="flex-1 rounded-xl border border-input bg-muted/70 px-3 py-2 text-xs sm:text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-primary px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shrink-0 cursor-pointer"
                  >
                    Add
                  </button>
                </form>

                {/* Hard Budget Ceiling Slider */}
                <div className="mt-4 rounded-xl border border-border/60 bg-muted/30 p-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-medium">Hard Budget Ceiling</span>
                    <span className="font-mono font-bold text-accent text-sm sm:text-base">
                      R{budget.toLocaleString()}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={10000}
                    step={50}
                    value={budget}
                    onChange={(e) => setBudget(+e.target.value)}
                    className="mt-2 w-full accent-[var(--accent)] cursor-pointer h-2 bg-muted rounded-lg"
                  />
                  <div className="mt-2 flex justify-between gap-1">
                    {[500, 1500, 3000, 6000].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setBudget(preset)}
                        className={`flex-1 rounded-lg py-1 font-mono text-[9px] sm:text-[10px] transition-colors cursor-pointer ${
                          budget === preset
                            ? "bg-accent/20 text-accent font-bold border border-accent/40"
                            : "bg-muted/60 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        R{preset >= 1000 ? `${preset / 1000}k` : preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Proximity Radius Preference Slider */}
                <div className="mt-4 rounded-xl border border-border/60 bg-muted/30 p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-primary font-bold">🎯 Proximity Radius</span>
                      <span className="font-mono text-white font-bold">
                        {activeProximityRadius.toFixed(1)}m
                      </span>
                    </div>
                    <span className="font-mono text-[9.5px] text-muted-foreground">
                      {outdoor ? "Outdoor (0.1–50m)" : "Indoor (0.1–20m)"}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.1}
                    max={outdoor ? 50 : 20}
                    step={0.1}
                    value={activeProximityRadius}
                    onChange={(e) => handleSetProximityRadius(parseFloat(e.target.value))}
                    className="w-full accent-primary cursor-pointer h-2 bg-muted rounded-lg"
                  />
                  <div className="flex justify-between gap-1">
                    {(outdoor ? [5, 15, 30, 50] : [2, 5, 12, 20]).map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handleSetProximityRadius(preset)}
                        className={`flex-1 rounded-lg py-1 font-mono text-[9px] sm:text-[10px] transition-colors cursor-pointer ${
                          Math.abs(activeProximityRadius - preset) < 0.2
                            ? "bg-primary text-primary-foreground font-bold shadow-teal"
                            : "bg-muted/60 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {preset}m
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sound & Vibration Alerts for High-Value (+50% OFF) Deals */}
                <div className="mt-4 rounded-xl border border-border/60 bg-muted/30 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">🔥</span>
                      <span className="text-xs font-bold text-foreground">
                        Deal Notifications (+50% Drops)
                      </span>
                    </div>
                    <span className="font-mono text-[8px] bg-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded font-bold">
                      AUDIO & HAPTICS
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleToggleSound}
                      className={`p-2 rounded-xl border flex items-center justify-between text-xs transition-all cursor-pointer ${
                        soundEnabled
                          ? "border-primary/60 bg-primary/20 text-white shadow-teal font-bold"
                          : "border-border/60 bg-muted/40 text-muted-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{soundEnabled ? "🔊" : "🔇"}</span>
                        <span>Sound</span>
                      </div>
                      <span className="font-mono text-[9px]">{soundEnabled ? "ON" : "OFF"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleToggleVibrate}
                      className={`p-2 rounded-xl border flex items-center justify-between text-xs transition-all cursor-pointer ${
                        vibrateEnabled
                          ? "border-accent/60 bg-accent/20 text-white shadow-amber font-bold"
                          : "border-border/60 bg-muted/40 text-muted-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>📳</span>
                        <span>Vibration</span>
                      </div>
                      <span className="font-mono text-[9px]">{vibrateEnabled ? "ON" : "OFF"}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Live Activity Stream Section */}
              <div className={isMobile && drawerTab !== "logs" ? "hidden md:block" : "block"}>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm sm:text-base font-bold text-foreground">
                    Live Autonomous Agent Activity
                  </h3>
                  <span className="font-mono text-[9px] uppercase tracking-wider text-primary">
                    Mesh Connected
                  </span>
                </div>
                <div className="mt-2.5 h-48 sm:h-60 overflow-y-auto rounded-xl border border-border bg-background/80 p-3 font-mono text-[10px] sm:text-[11px] leading-relaxed space-y-1.5">
                  {logs.length === 0 ? (
                    <p className="text-muted-foreground text-center py-6">
                      Connecting to local autonomous mesh…
                    </p>
                  ) : (
                    logs.map((l) => (
                      <p key={l.id} className="animate-ticker leading-snug break-words">
                        <span className="text-muted-foreground/70">[{l.t}]</span>{" "}
                        <span
                          className={
                            l.msg.startsWith("CLAIMED")
                              ? "text-accent font-bold"
                              : l.msg.startsWith("PARKED")
                                ? "text-primary font-bold"
                                : l.msg.includes("ACK")
                                  ? "text-primary"
                                  : "text-foreground/90"
                          }
                        >
                          {l.msg}
                        </span>
                      </p>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Environment & Perimeter Auto-Detection Selector Modal */}
      <EnvironmentModal
        open={envModalOpen}
        onClose={() => setEnvModalOpen(false)}
        mode={envMode}
        onSetMode={handleSetEnvMode}
        isOutdoor={outdoor}
        autoDetectedAs={autoDetectedAs}
        gpsAccuracy={gpsAccuracy}
        bleNodesCount={outdoor ? OUTDOOR.length : INDOOR.length}
        proximityRadius={activeProximityRadius}
        onSetProximityRadius={handleSetProximityRadius}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        vibrateEnabled={vibrateEnabled}
        onToggleVibrate={handleToggleVibrate}
        mobilityMode={mobilityMode}
        onSetMobilityMode={setMobilityMode}
        currentSpeedKmh={effectiveSpeed}
        currentCadenceSec={Math.round(currentCadenceMs / 1000)}
      />

      {/* Passkey Authentication Modal */}
      <PasskeyModal
        isOpen={passkeyModalOpen}
        onClose={() => setPasskeyModalOpen(false)}
        onSuccess={handlePasskeySuccess}
        initialMode={passkeyModalMode}
      />

      {/* Parking Lot Modal */}
      <ParkingLotModal
        isOpen={parkingLotOpen}
        onClose={() => setParkingLotOpen(false)}
        parkedOffers={parkedOffers}
        onClaimAndBuy={handleClaimFromParkingLot}
        onRemoveOffer={handleRemoveParkedOffer}
      />

      {/* Bought Items / Claimed Bag Modal */}
      <BoughtItemsModal
        isOpen={boughtModalOpen}
        onClose={() => setBoughtModalOpen(false)}
        boughtItems={boughtItems}
        onClearReceipt={handleClearBoughtReceipt}
      />

      {/* Agent-to-Agent (A2A) Commerce Core & Settlement Modal */}
      <AgentCommerceModal
        isOpen={agentCommerceOpen}
        onClose={() => setAgentCommerceOpen(false)}
        currentUser={currentUser}
        availableStores={stores}
        onClaimItem={(boughtItem) => {
          saveBought([boughtItem, ...boughtItems]);
          setClaimed((prev) => [...prev, boughtItem.store.id]);
          setLogs((l) => [
            {
              t: now(),
              msg: `A2A M2M CLEARANCE: ${boughtItem.item} @ R${boughtItem.price} · Voucher ${boughtItem.qrToken} issued`,
              id: logId++,
            },
            ...l,
          ]);
          setBoughtModalOpen(true);
        }}
      />

      {/* Interactive First-Time Walkthrough Guide Modal */}
      <WalkthroughModal
        isOpen={walkthroughOpen}
        onClose={() => setWalkthroughOpen(false)}
        onComplete={handleCompleteWalkthrough}
      />

      {/* Indoor Mall Navigation Simulator Modal */}
      {mallSimulatorOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-xl animate-fade-in p-2 sm:p-4 md:p-6 flex justify-center items-start sm:items-center">
          <div className="w-full max-w-5xl my-auto">
            <MallSimulator
              onClose={() => setMallSimulatorOpen(false)}
              onClaimOffer={(mallStore) => {
                const appStore = stores.find((s) => s.id === mallStore.id) || {
                  id: mallStore.id,
                  name: mallStore.name,
                  offer: mallStore.promo,
                  item: mallStore.category,
                  cat: mallStore.category,
                  price: 199,
                  orig: 299,
                  bearing: 0,
                  dist: 15,
                  claimed: true,
                  color: mallStore.color,
                  perks: mallStore.perks,
                  lat: -26.145,
                  lng: 28.045,
                };
                const boughtItem = {
                  id: `claim-sim-${Date.now()}`,
                  store: appStore,
                  item: appStore.item,
                  price: appStore.price,
                  orig: appStore.orig,
                  boughtAt: now(),
                  qrToken: `VOUCHER-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
                };
                saveBought([boughtItem, ...boughtItems]);
                setClaimed((prev) => [...prev, mallStore.id]);
                setLogs((l) => [
                  {
                    t: now(),
                    msg: `SIMULATOR PROXIMITY CLAIM: ${mallStore.name} · ${mallStore.promo}`,
                    id: logId++,
                  },
                  ...l,
                ]);
              }}
              onParkOffer={(mallStore) => {
                const appStore = stores.find((s) => s.id === mallStore.id) || {
                  id: mallStore.id,
                  name: mallStore.name,
                  offer: mallStore.promo,
                  item: mallStore.category,
                  cat: mallStore.category,
                  price: 199,
                  orig: 299,
                  bearing: 0,
                  dist: 15,
                  claimed: false,
                  color: mallStore.color,
                  perks: mallStore.perks,
                  lat: -26.145,
                  lng: 28.045,
                };
                if (!parkedOffers.some((p) => p.store.id === mallStore.id)) {
                  saveParked([
                    {
                      id: `park-sim-${Date.now()}`,
                      store: appStore,
                      parkedAt: now(),
                      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      }),
                      savedPrice: appStore.price,
                    },
                    ...parkedOffers,
                  ]);
                  setLogs((l) => [
                    {
                      t: now(),
                      msg: `SIMULATOR HOLDING LOT: Parked offer for ${mallStore.name}`,
                      id: logId++,
                    },
                    ...l,
                  ]);
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Offline Status & Cached Offers Indicator */}
      <OfflineIndicator
        isOnline={isOnline}
        cachedOffersCount={matchedDeck.length}
        lastCachedTime={lastCacheSync}
      />
    </main>
  );
}
