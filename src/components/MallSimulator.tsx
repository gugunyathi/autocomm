import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Compass,
  Footprints,
  MapPin,
  Tag,
  Smartphone,
  Radio,
  X,
  BellRing,
  Navigation,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  CheckCircle2,
  BookmarkPlus,
  Zap,
  ShoppingBag,
  QrCode,
  Trash2,
  ExternalLink,
} from "lucide-react";

// --- Domain Models & Data Schemas ---
export interface MallStore {
  id: string;
  name: string;
  category: string;
  x: number; // Top-left X on 1000x1000 map canvas
  y: number; // Top-left Y on 1000x1000 map canvas
  width: number;
  height: number;
  color: string;
  lightColor: string;
  glowColor: string;
  corridorJunctionX: number; // Main corridor connection node
  corridorJunctionY: number;
  entranceX: number; // Door node
  entranceY: number;
  interiorX: number; // Deep interior browse area
  interiorY: number;
  promo: string;
  perks: string[];
  discount: string;
}

export interface SimClaimedVoucher {
  id: string;
  store: MallStore;
  timestamp: number;
  qrToken: string;
}

// 8 Richly Detailed South African Mall Outlets with Accurate Grid Entry/Exit Nodes
export const MALL_DIRECTORY: MallStore[] = [
  {
    id: "s1",
    name: "Zara Fashion",
    category: "Apparel",
    x: 70,
    y: 70,
    width: 210,
    height: 170,
    color: "#f87171",
    lightColor: "#fef2f2",
    glowColor: "rgba(248, 113, 113, 0.45)",
    corridorJunctionX: 175,
    corridorJunctionY: 270,
    entranceX: 175,
    entranceY: 240,
    interiorX: 175,
    interiorY: 150,
    discount: "30% OFF",
    promo: "Exclusive Runway Collection: Buy 2 get 1 free on winter coats & outerwear!",
    perks: ["Free Fitting Room Booking", "Instant Checkout Active", "In-Store Stylist"],
  },
  {
    id: "s2",
    name: "H&M Boutique",
    category: "Apparel",
    x: 320,
    y: 70,
    width: 200,
    height: 170,
    color: "#fbbf24",
    lightColor: "#fffbeb",
    glowColor: "rgba(251, 191, 36, 0.45)",
    corridorJunctionX: 420,
    corridorJunctionY: 270,
    entranceX: 420,
    entranceY: 240,
    interiorX: 420,
    interiorY: 150,
    discount: "15% OFF",
    promo: "15% off student discount code active inside store across all casual lines.",
    perks: ["Garment Recycling Voucher", "Express Click & Collect", "Member Bonus"],
  },
  {
    id: "s3",
    name: "iStore Apple",
    category: "Electronics",
    x: 550,
    y: 70,
    width: 170,
    height: 170,
    color: "#cbd5e1",
    lightColor: "#f8fafc",
    glowColor: "rgba(203, 213, 225, 0.5)",
    corridorJunctionX: 635,
    corridorJunctionY: 270,
    entranceX: 635,
    entranceY: 240,
    interiorX: 635,
    interiorY: 150,
    discount: "R8,000 TRADE-IN",
    promo: "iPhone 16 Pro Upgrade Offer: Get up to R8,000 trade-in value on eligible devices.",
    perks: ["Apple Tech Support Bar", "Demo Stations Open", "0% Interest Financing"],
  },
  {
    id: "s4",
    name: "Exclusive Books",
    category: "Leisure",
    x: 750,
    y: 70,
    width: 180,
    height: 170,
    color: "#4ade80",
    lightColor: "#f0fdf4",
    glowColor: "rgba(74, 222, 128, 0.45)",
    corridorJunctionX: 840,
    corridorJunctionY: 270,
    entranceX: 840,
    entranceY: 240,
    interiorX: 840,
    interiorY: 150,
    discount: "2X POINTS",
    promo: "Coffee Club Members receive double points on all Sunday Times bestsellers today.",
    perks: ["Free Wi-Fi Reading Hub", "Artisan Coffee Bar", "Author Signed Copies"],
  },
  {
    id: "k1",
    name: "Mugg & Bean Kiosk",
    category: "Cafe",
    x: 440,
    y: 440,
    width: 130,
    height: 120,
    color: "#d97706",
    lightColor: "#fffbe2",
    glowColor: "rgba(217, 119, 6, 0.5)",
    corridorJunctionX: 505,
    corridorJunctionY: 380,
    entranceX: 505,
    entranceY: 440,
    interiorX: 505,
    interiorY: 490,
    discount: "FREE MUFFIN",
    promo: "Muffin Combo: Get a giant freshly baked sweet muffin with any mega cappuccino.",
    perks: ["Power Outlets at Tables", "Bottomless Brews", "Free Ultra-Fast Wi-Fi"],
  },
  {
    id: "s5",
    name: "Woolworths Food",
    category: "Grocery",
    x: 70,
    y: 690,
    width: 280,
    height: 230,
    color: "#6366f1",
    lightColor: "#e0e7ff",
    glowColor: "rgba(99, 102, 241, 0.45)",
    corridorJunctionX: 210,
    corridorJunctionY: 660,
    entranceX: 210,
    entranceY: 690,
    interiorX: 210,
    interiorY: 800,
    discount: "SAVE R50",
    promo: "Daily Difference: Save R50 instantly when spending R350 or more on fresh produce.",
    perks: ["WRewards Multiplier Active", "Fresh Bakery Counter", "Organic Produce Section"],
  },
  {
    id: "s6",
    name: "Nike Performance",
    category: "Sportswear",
    x: 390,
    y: 730,
    width: 195,
    height: 190,
    color: "#c084fc",
    lightColor: "#fae8ff",
    glowColor: "rgba(192, 132, 252, 0.45)",
    corridorJunctionX: 487,
    corridorJunctionY: 660,
    entranceX: 487,
    entranceY: 730,
    interiorX: 487,
    interiorY: 820,
    discount: "20% EXTRA",
    promo: "Air Max Week Special: Extra 20% off all performance footwear and dri-fit apparel.",
    perks: ["Gait Analysis Treadmill", "Nike App Member Rewards", "Locker Pickup"],
  },
  {
    id: "s7",
    name: "Clicks Pharmacy",
    category: "Health",
    x: 630,
    y: 730,
    width: 290,
    height: 190,
    color: "#14b8a6",
    lightColor: "#ccfbf1",
    glowColor: "rgba(20, 184, 166, 0.45)",
    corridorJunctionX: 775,
    corridorJunctionY: 660,
    entranceX: 775,
    entranceY: 730,
    interiorX: 775,
    interiorY: 820,
    discount: "3-FOR-2",
    promo:
      "Feel Good Savings: 3-for-2 across all natural health vitamins, skincare and supplements.",
    perks: ["Clinic Sister On Duty", "ClubCard 3x Points", "Blood Pressure Screening"],
  },
];

const MAP_SIZE = 1000;

export interface NavigationWaypoint {
  x: number;
  y: number;
  type: "corridor" | "door" | "inside_shop" | "lounge";
  storeId?: string;
  dwellMs?: number;
  action: string;
}

// Complete Guided Passage & Retail Shop Tour with Clean Transitions
const DEFAULT_MALL_TOUR: NavigationWaypoint[] = [
  // 1. Zara Fashion
  { x: 175, y: 270, type: "corridor", action: "Walking Top Passage to Zara" },
  { x: 175, y: 240, type: "door", storeId: "s1", action: "Entering Zara" },
  {
    x: 175,
    y: 150,
    type: "inside_shop",
    storeId: "s1",
    dwellMs: 3000,
    action: "Browsing Zara Runway Outerwear",
  },
  { x: 175, y: 240, type: "door", storeId: "s1", action: "Exiting Zara" },
  { x: 175, y: 270, type: "corridor", action: "Walking East on Top Passage" },

  // 2. H&M Boutique
  { x: 420, y: 270, type: "corridor", action: "Approaching H&M Boutique" },
  { x: 420, y: 240, type: "door", storeId: "s2", action: "Entering H&M" },
  {
    x: 420,
    y: 150,
    type: "inside_shop",
    storeId: "s2",
    dwellMs: 3000,
    action: "Browsing H&M Casual Lines",
  },
  { x: 420, y: 240, type: "door", storeId: "s2", action: "Exiting H&M" },
  { x: 420, y: 270, type: "corridor", action: "Continuing East on Top Passage" },

  // 3. iStore Apple
  { x: 635, y: 270, type: "corridor", action: "Approaching iStore Apple" },
  { x: 635, y: 240, type: "door", storeId: "s3", action: "Entering iStore" },
  {
    x: 635,
    y: 150,
    type: "inside_shop",
    storeId: "s3",
    dwellMs: 3000,
    action: "Testing iPhone 16 Pro Demo Units",
  },
  { x: 635, y: 240, type: "door", storeId: "s3", action: "Exiting iStore" },
  { x: 635, y: 270, type: "corridor", action: "Walking to Exclusive Books" },

  // 4. Exclusive Books
  { x: 840, y: 270, type: "corridor", action: "Approaching Exclusive Books" },
  { x: 840, y: 240, type: "door", storeId: "s4", action: "Entering Exclusive Books" },
  {
    x: 840,
    y: 150,
    type: "inside_shop",
    storeId: "s4",
    dwellMs: 3000,
    action: "Browsing Bestsellers & Coffee Club",
  },
  { x: 840, y: 240, type: "door", storeId: "s4", action: "Exiting Exclusive Books" },
  { x: 840, y: 270, type: "corridor", action: "Walking West to Central Avenue" },

  // 5. Central Avenue & Mugg & Bean Kiosk
  { x: 505, y: 270, type: "corridor", action: "Turning onto Central Concourse Avenue" },
  { x: 505, y: 380, type: "corridor", action: "Approaching Mugg & Bean Kiosk" },
  { x: 505, y: 440, type: "door", storeId: "k1", action: "Entering Mugg & Bean" },
  {
    x: 505,
    y: 490,
    type: "inside_shop",
    storeId: "k1",
    dwellMs: 3000,
    action: "Enjoying Coffee Kiosk & Bakery",
  },
  { x: 505, y: 560, type: "door", storeId: "k1", action: "Exiting Mugg & Bean" },
  { x: 505, y: 600, type: "corridor", action: "Walking South Concourse" },

  // 6. Atrium Lounge & Bottom Corridor
  { x: 250, y: 490, type: "lounge", dwellMs: 1200, action: "Passing Circular Atrium Lounge" },
  { x: 210, y: 660, type: "corridor", action: "Walking West on Bottom Passage" },

  // 7. Woolworths Food
  { x: 210, y: 690, type: "door", storeId: "s5", action: "Entering Woolworths Food" },
  {
    x: 210,
    y: 800,
    type: "inside_shop",
    storeId: "s5",
    dwellMs: 3000,
    action: "Browsing Woolies Bakery & Produce",
  },
  { x: 210, y: 690, type: "door", storeId: "s5", action: "Exiting Woolworths" },
  { x: 210, y: 660, type: "corridor", action: "Walking East on Bottom Passage" },

  // 8. Nike Performance
  { x: 487, y: 660, type: "corridor", action: "Approaching Nike Performance" },
  { x: 487, y: 730, type: "door", storeId: "s6", action: "Entering Nike Performance" },
  {
    x: 487,
    y: 820,
    type: "inside_shop",
    storeId: "s6",
    dwellMs: 3000,
    action: "Browsing Air Max Performance Shoes",
  },
  { x: 487, y: 730, type: "door", storeId: "s6", action: "Exiting Nike" },
  { x: 487, y: 660, type: "corridor", action: "Continuing East on Bottom Passage" },

  // 9. Clicks Pharmacy
  { x: 775, y: 660, type: "corridor", action: "Approaching Clicks Pharmacy" },
  { x: 775, y: 730, type: "door", storeId: "s7", action: "Entering Clicks Pharmacy" },
  {
    x: 775,
    y: 820,
    type: "inside_shop",
    storeId: "s7",
    dwellMs: 3000,
    action: "Browsing Health, Skincare & Vitamins",
  },
  { x: 775, y: 730, type: "door", storeId: "s7", action: "Exiting Clicks Pharmacy" },
  { x: 775, y: 660, type: "corridor", action: "Returning to Central Concourse" },

  // 10. Loop back up Central Concourse Avenue
  { x: 505, y: 660, type: "corridor", action: "Walking Central Concourse North" },
  { x: 505, y: 270, type: "corridor", action: "Completing Mall Tour Loop" },
];

function buildRouteToStore(
  fromX: number,
  fromY: number,
  targetStore: MallStore,
): NavigationWaypoint[] {
  const route: NavigationWaypoint[] = [];

  const isCloserToTop = fromY < 460;
  const passageY = isCloserToTop ? 270 : 660;

  route.push({
    x: fromX,
    y: passageY,
    type: "corridor",
    action: "Connecting to Passage Grid",
  });

  const targetPassageY = targetStore.corridorJunctionY;
  if (passageY !== targetPassageY) {
    route.push({
      x: 505,
      y: passageY,
      type: "corridor",
      action: "Walking to Central Concourse",
    });
    route.push({
      x: 505,
      y: targetPassageY,
      type: "corridor",
      action: "Navigating Central Concourse",
    });
  }

  route.push({
    x: targetStore.corridorJunctionX,
    y: targetPassageY,
    type: "corridor",
    action: `Approaching ${targetStore.name}`,
  });

  route.push({
    x: targetStore.entranceX,
    y: targetStore.entranceY,
    type: "door",
    storeId: targetStore.id,
    action: `Entering ${targetStore.name}`,
  });

  route.push({
    x: targetStore.interiorX,
    y: targetStore.interiorY,
    type: "inside_shop",
    storeId: targetStore.id,
    dwellMs: 3000,
    action: `Browsing ${targetStore.name}`,
  });

  route.push({
    x: targetStore.entranceX,
    y: targetStore.entranceY,
    type: "door",
    storeId: targetStore.id,
    action: `Exiting ${targetStore.name}`,
  });

  route.push({
    x: targetStore.corridorJunctionX,
    y: targetPassageY,
    type: "corridor",
    action: "Back on Passage Grid",
  });

  return route;
}

interface MallSimulatorProps {
  onClose?: () => void;
  onClaimOffer?: (store: MallStore) => void;
  onParkOffer?: (store: MallStore) => void;
  isFullScreen?: boolean;
}

// Memoized Sub-Component: Control Panel
const TelemetryControlPanel = React.memo(
  ({
    simulationMode,
    onToggleSimulationMode,
    walkScale,
    onChangeWalkScale,
    selectedTargetStore,
    onSelectTargetStore,
  }: {
    simulationMode: "HARDWARE" | "AUTO_WALK";
    onToggleSimulationMode: () => void;
    walkScale: number;
    onChangeWalkScale: (scale: number) => void;
    selectedTargetStore: string;
    onSelectTargetStore: (storeId: string) => void;
  }) => (
    <div className="flex flex-col gap-3">
      {/* Simulation Mode Toggle */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={onToggleSimulationMode}
          className={`py-2 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            simulationMode === "AUTO_WALK"
              ? "bg-blue-600/20 border-blue-500/50 text-blue-400 shadow-md"
              : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850"
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Auto Grid Walk</span>
        </button>

        <button
          onClick={onToggleSimulationMode}
          className={`py-2 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            simulationMode === "HARDWARE"
              ? "bg-purple-600/20 border-purple-500/50 text-purple-400 shadow-md"
              : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850"
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Device Gyro</span>
        </button>
      </div>

      {/* Walk Velocity Controller */}
      <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl space-y-2.5">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-blue-400" />
            Walk Velocity
          </span>
          <span className="text-blue-400 font-bold">{walkScale}x Multiplier</span>
        </div>
        <input
          type="range"
          min="3"
          max="15"
          step="1"
          value={walkScale}
          onChange={(e) => onChangeWalkScale(Number(e.target.value))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
        <div className="flex justify-between text-[10px] font-mono text-slate-500">
          <span>Realistic (3x)</span>
          <span>Standard (6x)</span>
          <span>Brisk (15x)</span>
        </div>
      </div>

      {/* Interactive Destination Waypoint Selector */}
      <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-emerald-400" />
            Direct Shop Route
          </span>
          {selectedTargetStore && (
            <button
              onClick={() => onSelectTargetStore("")}
              className="text-[10px] font-mono text-slate-400 hover:text-white"
            >
              Resume Tour
            </button>
          )}
        </div>
        <select
          value={selectedTargetStore}
          onChange={(e) => onSelectTargetStore(e.target.value)}
          className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-xl p-2.5 outline-none focus:border-blue-500 transition-colors"
        >
          <option value="">-- Guided Mall Passage Tour --</option>
          {MALL_DIRECTORY.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.category}) · {s.discount}
            </option>
          ))}
        </select>
      </div>
    </div>
  ),
);
TelemetryControlPanel.displayName = "TelemetryControlPanel";

// Memoized Sub-Component: Dynamic Offer Card Overlay with GPU Compositor Acceleration
const OfferCardOverlay = React.memo(
  ({
    store,
    onClaim,
    onPark,
    onDismiss,
  }: {
    store: MallStore;
    onClaim: (store: MallStore) => void;
    onPark: (store: MallStore) => void;
    onDismiss: () => void;
  }) => (
    <div className="absolute inset-x-3 bottom-3 z-30 transform transition-transform duration-300 ease-out will-change-transform animate-in fade-in slide-in-from-bottom-3">
      <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-blue-500/40 shadow-2xl text-white">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2 min-w-0">
            <span className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 shrink-0">
              <Tag className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm sm:text-base text-white truncate">{store.name}</h3>
                <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono text-[9px] font-bold shrink-0">
                  {store.discount}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono uppercase tracking-wider">
                {store.category} · In-Store Proximity Triggered
              </p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className="text-xs text-slate-200 font-medium leading-snug mb-2.5">{store.promo}</p>

        {/* Perks badges */}
        <div className="flex flex-wrap gap-1 mb-3">
          {store.perks.map((perk, i) => (
            <span
              key={i}
              className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/60"
            >
              ✓ {perk}
            </span>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onClaim(store)}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition-all active:scale-95 cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Claim Deal</span>
          </button>
          <button
            onClick={() => onPark(store)}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all active:scale-95 cursor-pointer"
          >
            <BookmarkPlus className="w-3.5 h-3.5" />
            <span>Park Offer</span>
          </button>
        </div>
      </div>
    </div>
  ),
);
OfferCardOverlay.displayName = "OfferCardOverlay";

// Modal Component: View Parked Offers Inside Simulator
const SimParkedModal = ({
  isOpen,
  onClose,
  parkedStores,
  onClaim,
  onRemove,
}: {
  isOpen: boolean;
  onClose: () => void;
  parkedStores: MallStore[];
  onClaim: (store: MallStore) => void;
  onRemove: (storeId: string) => void;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div
        className="relative w-full max-w-lg max-h-[85vh] flex flex-col rounded-2xl sm:rounded-3xl bg-slate-900 border border-teal-500/40 shadow-2xl text-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 shrink-0 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/40 flex items-center justify-center font-bold text-base shadow">
              🅿️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">Parked Offers</h3>
                <span className="rounded-full bg-teal-500/20 px-2 py-0.5 text-xs font-mono font-bold text-teal-300 border border-teal-500/30">
                  {parkedStores.length} Saved
                </span>
              </div>
              <p className="text-xs text-slate-400">Reserved in-store retail perks</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3">
          {parkedStores.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <span className="text-4xl inline-block">🅿️</span>
              <p className="text-sm font-semibold text-white">No Parked Offers Yet</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                When walking through the mall, click &quot;Park Offer&quot; on any store deal to
                hold it here for later.
              </p>
            </div>
          ) : (
            parkedStores.map((store) => (
              <div
                key={store.id}
                className="p-3.5 rounded-xl sm:rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-teal-500/40 transition-colors space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-white">{store.name}</h4>
                      <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold">
                        {store.discount}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {store.category} Department
                    </p>
                  </div>
                  <button
                    onClick={() => onRemove(store.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Remove offer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs text-slate-300">{store.promo}</p>

                <div className="flex flex-wrap gap-1">
                  {store.perks.map((perk, i) => (
                    <span
                      key={i}
                      className="text-[9.5px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700"
                    >
                      ✓ {perk}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => onClaim(store)}
                  className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Claim & Redeem Deal</span>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// Modal Component: View Bought/Claimed Items Inside Simulator
const SimBagModal = ({
  isOpen,
  onClose,
  claimedVouchers,
  onClearReceipt,
}: {
  isOpen: boolean;
  onClose: () => void;
  claimedVouchers: SimClaimedVoucher[];
  onClearReceipt: (id: string) => void;
}) => {
  const [selectedVoucher, setSelectedVoucher] = useState<SimClaimedVoucher | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div
        className="relative w-full max-w-lg max-h-[85vh] flex flex-col rounded-2xl sm:rounded-3xl bg-slate-900 border border-amber-500/40 shadow-2xl text-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 shrink-0 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-bold text-base shadow">
              🛍️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Shopping Bag & Vouchers
                </h3>
                <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-mono font-bold text-amber-300 border border-amber-500/30">
                  {claimedVouchers.length} Items
                </span>
              </div>
              <p className="text-xs text-slate-400">Digital checkout QR tokens</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3">
          {claimedVouchers.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <span className="text-4xl inline-block">🛍️</span>
              <p className="text-sm font-semibold text-white">Your Bag is Empty</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Step inside any mall store or click &quot;Claim Deal&quot; to add digital vouchers
                to your bag.
              </p>
            </div>
          ) : (
            claimedVouchers.map((voucher) => (
              <div
                key={voucher.id}
                className="p-3.5 rounded-xl sm:rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-amber-500/40 transition-colors space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-white">{voucher.store.name}</h4>
                      <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                        {voucher.store.discount}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Redeemed{" "}
                      {new Date(voucher.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <button
                    onClick={() => onClearReceipt(voucher.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Remove receipt"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs text-slate-300">{voucher.store.promo}</p>

                {/* Voucher Token Bar */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-white tracking-widest">{voucher.qrToken}</span>
                  </div>
                  <button
                    onClick={() => setSelectedVoucher(voucher)}
                    className="text-[11px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>View QR</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal: Enlarged QR Voucher Dialog */}
        {selectedVoucher && (
          <div className="absolute inset-0 z-20 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md animate-in fade-in">
            <div className="bg-slate-900 p-5 rounded-2xl border border-amber-500/50 shadow-2xl text-center space-y-3 max-w-xs w-full">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-white truncate">
                  {selectedVoucher.store.name}
                </span>
                <button
                  onClick={() => setSelectedVoucher(null)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* High Contrast QR Mock Box */}
              <div className="w-44 h-44 mx-auto bg-white p-3 rounded-xl flex flex-col items-center justify-center shadow-inner">
                <div className="w-full h-full border-4 border-black p-2 flex flex-col items-center justify-center bg-white">
                  <QrCode className="w-24 h-24 text-black" />
                  <span className="text-[10px] font-mono font-black text-black tracking-widest mt-1">
                    {selectedVoucher.qrToken}
                  </span>
                </div>
              </div>

              <p className="text-xs text-amber-300 font-bold">
                {selectedVoucher.store.discount} APPLIED
              </p>
              <p className="text-[10px] text-slate-400">
                Present this QR token at the cashier counter
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function MallSimulator({
  onClose,
  onClaimOffer,
  onParkOffer,
  isFullScreen = false,
}: MallSimulatorProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // --- Low-Frequency React UI States ---
  const [isIndoors, setIsIndoors] = useState<boolean>(true);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [activeStepCount, setActiveStepCount] = useState<number>(0);
  const [activeCardStore, setActiveCardStore] = useState<MallStore | null>(null);
  const [selectedTargetStore, setSelectedTargetStore] = useState<string>("");
  const [simulationMode, setSimulationMode] = useState<"HARDWARE" | "AUTO_WALK">("AUTO_WALK");
  const [walkScale, setWalkScale] = useState<number>(6);
  const [currentNavAction, setCurrentNavAction] = useState<string>("Touring Mall Passages");

  // --- Parked & Bag Collection States ---
  const [parkedStores, setParkedStores] = useState<MallStore[]>([]);
  const [claimedVouchers, setClaimedVouchers] = useState<SimClaimedVoucher[]>([]);
  const [isParkedModalOpen, setIsParkedModalOpen] = useState<boolean>(false);
  const [isBagModalOpen, setIsBagModalOpen] = useState<boolean>(false);

  // --- High-Frequency Mutable References (Zero React Re-render Overhead) ---
  const userMutable = useRef({
    mallX: 175,
    mallY: 270,
    heading: 90,
    lastUpdate: 0,
    stepAccrual: 0,
    waypointIndex: 0,
    customRoute: null as NavigationWaypoint[] | null,
    customRouteIndex: 0,
    dwellUntil: 0,
    currentStoreId: null as string | null,
  });

  const stateBridge = useRef({
    walkScale,
    simulationMode,
    isIndoors,
    isPaused,
    selectedTargetStore,
    activeCardStoreId: activeCardStore?.id || "",
  });

  useEffect(() => {
    stateBridge.current = {
      walkScale,
      simulationMode,
      isIndoors,
      isPaused,
      selectedTargetStore,
      activeCardStoreId: activeCardStore?.id || "",
    };
  }, [walkScale, simulationMode, isIndoors, isPaused, selectedTargetStore, activeCardStore]);

  // If a user selects a target store, calculate direct passage route to it
  useEffect(() => {
    const user = userMutable.current;
    if (selectedTargetStore) {
      const store = MALL_DIRECTORY.find((s) => s.id === selectedTargetStore);
      if (store) {
        user.customRoute = buildRouteToStore(user.mallX, user.mallY, store);
        user.customRouteIndex = 0;
        user.dwellUntil = 0;
      }
    } else {
      user.customRoute = null;
    }
  }, [selectedTargetStore]);

  // --- GPU-Accelerated Hardware Animation Loop with Grid-Aligned Navigation ---
  useEffect(() => {
    let animationFrameId: number;

    const renderLoop = (timestamp: number) => {
      const user = userMutable.current;
      const config = stateBridge.current;

      // 1. Grid-Based Pathfinding & Movement Physics Engine
      if (config.isIndoors && !config.isPaused && timestamp - user.lastUpdate > 20) {
        const deltaMs = Math.min(timestamp - user.lastUpdate, 45);
        user.lastUpdate = timestamp;

        if (config.simulationMode === "AUTO_WALK") {
          // Check if currently pausing/browsing inside a shop
          if (user.dwellUntil > timestamp) {
            const sway = Math.sin(timestamp / 350) * 0.3;
            user.heading = (user.heading + sway + 360) % 360;
          } else {
            // If dwell period just finished while inside a shop, clear store card and proceed
            if (user.currentStoreId && user.dwellUntil > 0) {
              user.currentStoreId = null;
              user.dwellUntil = 0;
              setActiveCardStore(null);
            }

            let targetWp: NavigationWaypoint;
            let isCustom = false;

            if (user.customRoute && user.customRoute.length > 0) {
              isCustom = true;
              targetWp =
                user.customRoute[user.customRouteIndex] ||
                user.customRoute[user.customRoute.length - 1];
            } else {
              targetWp = DEFAULT_MALL_TOUR[user.waypointIndex % DEFAULT_MALL_TOUR.length];
            }

            if (targetWp) {
              const dx = targetWp.x - user.mallX;
              const dy = targetWp.y - user.mallY;
              const distance = Math.hypot(dx, dy);

              const moveStep = (config.walkScale * deltaMs) / 36;

              if (distance <= Math.max(moveStep, 3)) {
                user.mallX = targetWp.x;
                user.mallY = targetWp.y;

                if (targetWp.type === "inside_shop" && targetWp.storeId) {
                  const store = MALL_DIRECTORY.find((s) => s.id === targetWp.storeId);
                  if (store) {
                    user.currentStoreId = store.id;
                    user.dwellUntil = timestamp + (targetWp.dwellMs || 3000);
                    setActiveCardStore(store);
                    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
                      navigator.vibrate?.([30, 40]);
                    }
                  }
                } else if (targetWp.type === "lounge") {
                  if (targetWp.dwellMs) {
                    user.dwellUntil = timestamp + targetWp.dwellMs;
                  }
                }

                if (isCustom) {
                  if (user.customRouteIndex < (user.customRoute?.length || 1) - 1) {
                    user.customRouteIndex += 1;
                  } else {
                    user.customRoute = null;
                  }
                } else {
                  user.waypointIndex = (user.waypointIndex + 1) % DEFAULT_MALL_TOUR.length;
                }

                setCurrentNavAction(targetWp.action);
              } else {
                const unitX = dx / distance;
                const unitY = dy / distance;

                user.mallX += unitX * Math.min(moveStep, distance);
                user.mallY += unitY * Math.min(moveStep, distance);

                const targetHeading = (Math.atan2(dx, -dy) * (180 / Math.PI) + 360) % 360;
                let diff = targetHeading - user.heading;
                if (diff > 180) diff -= 360;
                if (diff < -180) diff += 360;
                user.heading =
                  (user.heading + Math.sign(diff) * Math.min(Math.abs(diff), 25) + 360) % 360;

                user.stepAccrual += moveStep * 0.16;
                const currentIntegerSteps = Math.floor(user.stepAccrual);
                if (currentIntegerSteps > 0 && currentIntegerSteps % 2 === 0) {
                  setActiveStepCount(currentIntegerSteps);
                }
              }
            }
          }
        }
      }

      // 2. High-Speed Native Canvas Rendering Pipeline with Dynamic Resolution Matching
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d", { alpha: false });

      if (canvas && ctx) {
        const rect = canvas.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          const dpr = Math.min(window.devicePixelRatio || 1, 2);
          const targetWidth = Math.round(rect.width * dpr);
          const targetHeight = Math.round(rect.height * dpr);
          if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
            canvas.width = targetWidth;
            canvas.height = targetHeight;
          }
        }

        ctx.save();
        const scale = canvas.width / MAP_SIZE;
        ctx.scale(scale, scale);

        // Floor Base
        ctx.fillStyle = "#f5f3ec";
        ctx.fillRect(0, 0, MAP_SIZE, MAP_SIZE);

        // Tile Grid Lines
        ctx.strokeStyle = "#e8e4d8";
        ctx.lineWidth = 1;
        for (let x = 0; x <= MAP_SIZE; x += 40) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, MAP_SIZE);
          ctx.stroke();
        }
        for (let y = 0; y <= MAP_SIZE; y += 40) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(0, MAP_SIZE);
          ctx.stroke();
        }

        // Marble Concourse Corridor Overlays (Visible Passages)
        const gradTopPassage = ctx.createLinearGradient(0, 250, 0, 290);
        gradTopPassage.addColorStop(0, "rgba(226, 232, 240, 0.6)");
        gradTopPassage.addColorStop(1, "rgba(203, 213, 225, 0.4)");
        ctx.fillStyle = gradTopPassage;
        ctx.fillRect(140, 250, 740, 40);
        ctx.strokeStyle = "rgba(148, 163, 184, 0.4)";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(140, 250, 740, 40);

        const gradCenterPassage = ctx.createLinearGradient(485, 0, 525, 0);
        gradCenterPassage.addColorStop(0, "rgba(226, 232, 240, 0.6)");
        gradCenterPassage.addColorStop(1, "rgba(203, 213, 225, 0.4)");
        ctx.fillStyle = gradCenterPassage;
        ctx.fillRect(485, 250, 40, 430);
        ctx.strokeRect(485, 250, 40, 430);

        const gradBotPassage = ctx.createLinearGradient(0, 640, 0, 680);
        gradBotPassage.addColorStop(0, "rgba(226, 232, 240, 0.6)");
        gradBotPassage.addColorStop(1, "rgba(203, 213, 225, 0.4)");
        ctx.fillStyle = gradBotPassage;
        ctx.fillRect(170, 640, 640, 40);
        ctx.strokeRect(170, 640, 640, 40);

        // Circular Atrium Lounge
        ctx.save();
        ctx.beginPath();
        ctx.arc(250, 490, 50, 0, 2 * Math.PI);
        ctx.fillStyle = "#ded8c8";
        ctx.fill();
        ctx.strokeStyle = "#c8c2b0";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(250, 490, 36, 0.2 * Math.PI, 1.8 * Math.PI);
        ctx.lineWidth = 14;
        ctx.strokeStyle = "#e8e3d3";
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(250, 490, 16, 0, 2 * Math.PI);
        ctx.fillStyle = "#cfc9b8";
        ctx.fill();
        ctx.restore();

        // Architectural Passage Walking Grid Centerlines
        ctx.save();
        ctx.strokeStyle = "#94a3b8";
        ctx.lineWidth = 2.5;
        ctx.setLineDash([6, 4]);

        ctx.beginPath();
        ctx.moveTo(175, 270);
        ctx.lineTo(840, 270);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(505, 270);
        ctx.lineTo(505, 660);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(210, 660);
        ctx.lineTo(775, 660);
        ctx.stroke();

        MALL_DIRECTORY.forEach((store) => {
          ctx.beginPath();
          ctx.moveTo(store.corridorJunctionX, store.corridorJunctionY);
          ctx.lineTo(store.entranceX, store.entranceY);
          ctx.lineTo(store.interiorX, store.interiorY);
          ctx.stroke();
        });

        ctx.setLineDash([]);
        ctx.restore();

        // Draw Stores
        MALL_DIRECTORY.forEach((store) => {
          const isActive = config.activeCardStoreId === store.id;

          ctx.save();
          ctx.beginPath();
          if (typeof ctx.roundRect === "function") {
            ctx.roundRect(store.x, store.y, store.width, store.height, 16);
          } else {
            ctx.rect(store.x, store.y, store.width, store.height);
          }

          const grad = ctx.createLinearGradient(store.x, store.y, store.x, store.y + store.height);
          grad.addColorStop(0, store.lightColor);
          grad.addColorStop(1, store.color);
          ctx.fillStyle = grad;
          ctx.fill();

          ctx.strokeStyle = isActive ? "#2563eb" : store.color;
          ctx.lineWidth = isActive ? 3.5 : 2;
          ctx.stroke();
          ctx.restore();

          // Typography
          ctx.fillStyle = "#0f172a";
          ctx.font = "bold 15px sans-serif";
          ctx.fillText(store.name, store.x + 16, store.y + 32);

          ctx.fillStyle = "#64748b";
          ctx.font = "12px sans-serif";
          ctx.fillText(store.category, store.x + 16, store.y + 50);

          // Door Entrance Node Indicator
          ctx.save();
          ctx.beginPath();
          ctx.arc(store.entranceX, store.entranceY, 7, 0, 2 * Math.PI);
          ctx.fillStyle = "#ffffff";
          ctx.fill();
          ctx.strokeStyle = isActive ? "#2563eb" : "#64748b";
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(store.entranceX, store.entranceY, 3.5, 0, 2 * Math.PI);
          ctx.fillStyle = isActive ? "#2563eb" : "#475569";
          ctx.fill();
          ctx.restore();
        });

        // Directional User Beacon Pointer
        ctx.save();
        ctx.translate(user.mallX, user.mallY);

        ctx.beginPath();
        ctx.arc(0, 0, 20, 0, 2 * Math.PI);
        ctx.fillStyle = "rgba(37, 99, 235, 0.28)";
        ctx.fill();

        ctx.rotate((user.heading * Math.PI) / 180);

        ctx.beginPath();
        ctx.moveTo(0, -15);
        ctx.lineTo(9.5, 10);
        ctx.lineTo(0, 4);
        ctx.lineTo(-9.5, 10);
        ctx.closePath();
        ctx.fillStyle = "#2563eb";
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2.2;
        ctx.stroke();
        ctx.restore();

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    animationFrameId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // --- Throttled Hardware Gyroscope / Compass Event Listener ---
  useEffect(() => {
    if (!isIndoors || simulationMode !== "HARDWARE") return;

    let lastSensorTick = 0;
    const handleOrientation = (e: DeviceOrientationEvent) => {
      const now = performance.now();
      if (now - lastSensorTick < 50) return;
      lastSensorTick = now;

      const webkitHeading = (e as DeviceOrientationEvent & { webkitCompassHeading?: number })
        .webkitCompassHeading;
      const heading = typeof webkitHeading === "number" ? webkitHeading : e.alpha;

      if (heading !== null && heading !== undefined) {
        userMutable.current.heading = Math.round(heading);
      }
    };

    window.addEventListener("deviceorientation", handleOrientation);
    return () => window.removeEventListener("deviceorientation", handleOrientation);
  }, [isIndoors, simulationMode]);

  // Handlers
  const handleToggleSimulationMode = useCallback(() => {
    setSimulationMode((prev) => (prev === "AUTO_WALK" ? "HARDWARE" : "AUTO_WALK"));
  }, []);

  const handleChangeWalkScale = useCallback((scale: number) => {
    setWalkScale(scale);
  }, []);

  const handleSelectTargetStore = useCallback((storeId: string) => {
    setSelectedTargetStore(storeId);
  }, []);

  // When card is claimed: add to bag, dismiss card, immediately end dwell so character leaves to next store
  const handleClaim = useCallback(
    (store: MallStore) => {
      setActiveCardStore(null);
      const user = userMutable.current;
      user.dwellUntil = 0;
      user.currentStoreId = null;

      // Add to claimed vouchers bag
      const newVoucher: SimClaimedVoucher = {
        id: `sim-claim-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        store,
        timestamp: Date.now(),
        qrToken: `VOUCHER-${store.name.substring(0, 3).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      };
      setClaimedVouchers((prev) => [newVoucher, ...prev]);

      // Remove from parked if was parked
      setParkedStores((prev) => prev.filter((p) => p.id !== store.id));

      if (onClaimOffer) onClaimOffer(store);
    },
    [onClaimOffer],
  );

  // When card is parked: add to parked list, dismiss card, immediately end dwell so character leaves to next store
  const handlePark = useCallback(
    (store: MallStore) => {
      setActiveCardStore(null);
      const user = userMutable.current;
      user.dwellUntil = 0;
      user.currentStoreId = null;

      setParkedStores((prev) => {
        if (prev.some((p) => p.id === store.id)) return prev;
        return [store, ...prev];
      });

      if (onParkOffer) onParkOffer(store);
    },
    [onParkOffer],
  );

  const handleRemoveParked = useCallback((storeId: string) => {
    setParkedStores((prev) => prev.filter((p) => p.id !== storeId));
  }, []);

  const handleClearReceipt = useCallback((receiptId: string) => {
    setClaimedVouchers((prev) => prev.filter((v) => v.id !== receiptId));
  }, []);

  // When card is dismissed with X: immediately end dwell so character leaves to next store
  const handleDismiss = useCallback(() => {
    setActiveCardStore(null);
    const user = userMutable.current;
    user.dwellUntil = 0;
    user.currentStoreId = null;
  }, []);

  // Canvas Click / Tap: select a store from map
  const handleCanvasPointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    const clickedStore = MALL_DIRECTORY.find(
      (s) => clickX >= s.x && clickX <= s.x + s.width && clickY >= s.y && clickY <= s.y + s.height,
    );

    if (clickedStore) {
      setSelectedTargetStore(clickedStore.id);
    }
  }, []);

  const handleReset = useCallback(() => {
    const user = userMutable.current;
    user.mallX = 175;
    user.mallY = 270;
    user.heading = 90;
    user.stepAccrual = 0;
    user.waypointIndex = 0;
    user.customRoute = null;
    user.dwellUntil = 0;
    user.currentStoreId = null;
    setActiveStepCount(0);
    setActiveCardStore(null);
    setSelectedTargetStore("");
    setCurrentNavAction("Touring Mall Passages");
  }, []);

  return (
    <div
      className={`w-full ${
        isFullScreen ? "min-h-screen" : "max-w-5xl"
      } mx-auto bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-500/30 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-800 overflow-hidden relative`}
    >
      {/* Simulation Master Controller Action Floating HeadBar */}
      <header className="bg-slate-900/95 border-b border-slate-800 px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 z-10 backdrop-blur-xl">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`p-2.5 rounded-xl transition-all duration-500 shrink-0 ${
              isIndoors && !isPaused
                ? "bg-blue-500/20 text-blue-400 animate-pulse ring-1 ring-blue-500/40 shadow-[0_0_12px_rgba(59,130,246,0.3)]"
                : "bg-slate-800 text-slate-400"
            }`}
          >
            <Radio className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="font-extrabold text-base sm:text-lg tracking-tight text-white flex items-center gap-2 truncate">
              IPS Indoor Context Engine{" "}
              <span className="text-[10px] text-blue-400 font-mono border border-blue-500/30 px-1.5 py-0.5 rounded bg-blue-950/80 shrink-0">
                v2.6-GridCorridor
              </span>
            </h1>
            <p className="text-xs text-slate-400 truncate">
              Grid-Aligned Corridor Navigation & In-Shop Retail Traversal
            </p>
          </div>
        </div>

        {/* Indoor State Mode Trigger Selector & Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 flex-wrap">
          <button
            onClick={() => setIsIndoors((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              isIndoors
                ? "bg-blue-600 text-white border-blue-400 shadow-lg shadow-blue-500/25"
                : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750"
            }`}
            title="Toggle Indoor Autonomous Mode"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>{isIndoors ? "Indoor: ACTIVE" : "Indoor: STANDBY"}</span>
          </button>

          <button
            onClick={() => setIsPaused((prev) => !prev)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
            title={isPaused ? "Resume Walk Simulation" : "Pause Walk Simulation"}
          >
            {isPaused ? (
              <Play className="w-4 h-4 text-emerald-400" />
            ) : (
              <Pause className="w-4 h-4 text-amber-400" />
            )}
          </button>

          <button
            onClick={handleReset}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
            title="Reset Simulation to Beginning of Tour"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 border border-slate-700 transition-colors cursor-pointer"
              title="Close Simulator"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* Main Simulation Viewport Grid */}
      <div className="p-3 sm:p-5 flex flex-col lg:flex-row gap-4 sm:gap-6 items-center lg:items-start justify-center">
        {/* 1. Left Viewport: Interactive Blueprint Canvas */}
        <div className="flex-1 w-full flex flex-col items-center min-w-0">
          <div className="relative border-2 border-slate-700 rounded-2xl overflow-hidden bg-slate-950 shadow-2xl w-full max-w-[340px] xs:max-w-[400px] sm:max-w-[480px] lg:max-w-[450px] aspect-square">
            {/* Top-Left Parked Offers Button Overlay */}
            <button
              onClick={() => setIsParkedModalOpen(true)}
              className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/95 hover:bg-slate-850 text-slate-100 border border-teal-500/50 shadow-lg shadow-teal-500/20 backdrop-blur-md transition-all active:scale-95 cursor-pointer ring-1 ring-teal-500/30"
              title="Open Parked Offers"
            >
              <span className="text-sm">🅿️</span>
              <span className="text-xs font-bold text-teal-300 hidden xs:inline">Parked</span>
              <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-teal-500 text-slate-950 font-mono text-[10px] font-black flex items-center justify-center shadow">
                {parkedStores.length}
              </span>
            </button>

            {/* Top-Right Shopping Bag Button Overlay */}
            <button
              onClick={() => setIsBagModalOpen(true)}
              className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/95 hover:bg-slate-850 text-slate-100 border border-amber-500/50 shadow-lg shadow-amber-500/20 backdrop-blur-md transition-all active:scale-95 cursor-pointer ring-1 ring-amber-500/30"
              title="Open Shopping Bag & Vouchers"
            >
              <span className="text-sm">🛍️</span>
              <span className="text-xs font-bold text-amber-300 hidden xs:inline">Bag</span>
              <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-amber-500 text-slate-950 font-mono text-[10px] font-black flex items-center justify-center shadow">
                {claimedVouchers.length}
              </span>
            </button>

            <canvas
              ref={canvasRef}
              width={MAP_SIZE}
              height={MAP_SIZE}
              onPointerDown={handleCanvasPointerDown}
              className="w-full h-auto aspect-square block cursor-pointer bg-[#f5f3ec] touch-none"
            />

            {/* Dynamic Offer Card Overlay with GPU Layer Compositing */}
            {activeCardStore && (
              <OfferCardOverlay
                store={activeCardStore}
                onClaim={handleClaim}
                onPark={handlePark}
                onDismiss={handleDismiss}
              />
            )}
          </div>

          <p className="text-[11px] sm:text-xs text-slate-400 mt-2 text-center font-medium">
            🧭 Real Passage Navigation: Walks along corridor grid lines, enters shops, pauses to
            browse, and returns to passages
          </p>
        </div>

        {/* 2. Right Viewport: Telemetry & Controls */}
        <div className="w-full lg:w-[350px] flex flex-col gap-3 sm:gap-4 shrink-0">
          {/* Telemetry Dashboard Stats */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex items-center gap-3 shadow-lg">
              <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 shrink-0">
                <Footprints className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                  Steps Logged
                </p>
                <p className="text-lg font-bold text-white font-mono">{activeStepCount}</p>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex items-center gap-3 shadow-lg">
              <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 shrink-0">
                <Compass className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                  Engine Status
                </p>
                <p className="text-sm font-bold text-emerald-400 font-mono">
                  {isPaused ? "Paused" : isIndoors ? "Grid Navigation" : "Standby"}
                </p>
              </div>
            </div>
          </div>

          {/* Current Micro-Location Zone & Navigation Status */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 space-y-2 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                Current Motion Target
              </span>
              <span className="text-[10px] font-mono text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-500/30">
                Grid Waypoint
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">
                  {activeCardStore ? `Inside ${activeCardStore.name}` : currentNavAction}
                </p>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                  {activeCardStore
                    ? `Browsing ${activeCardStore.category} Department`
                    : "Following Architectural Corridor Grid"}
                </p>
              </div>
              {activeCardStore && (
                <span className="p-1 rounded-full bg-emerald-500/20 text-emerald-400 animate-pulse shrink-0">
                  <BellRing className="w-4 h-4" />
                </span>
              )}
            </div>
          </div>

          {/* Memoized Telemetry Control Panel */}
          <TelemetryControlPanel
            simulationMode={simulationMode}
            onToggleSimulationMode={handleToggleSimulationMode}
            walkScale={walkScale}
            onChangeWalkScale={handleChangeWalkScale}
            selectedTargetStore={selectedTargetStore}
            onSelectTargetStore={handleSelectTargetStore}
          />
        </div>
      </div>

      {/* Embedded Modals for Parked Offers & Shopping Bag */}
      <SimParkedModal
        isOpen={isParkedModalOpen}
        onClose={() => setIsParkedModalOpen(false)}
        parkedStores={parkedStores}
        onClaim={(store) => {
          handleClaim(store);
          setIsParkedModalOpen(false);
        }}
        onRemove={handleRemoveParked}
      />

      <SimBagModal
        isOpen={isBagModalOpen}
        onClose={() => setIsBagModalOpen(false)}
        claimedVouchers={claimedVouchers}
        onClearReceipt={handleClearReceipt}
      />
    </div>
  );
}
