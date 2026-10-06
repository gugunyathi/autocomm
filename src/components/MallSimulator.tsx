import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Compass,
  Footprints,
  MapPin,
  Tag,
  Radio,
  X,
  BellRing,
  Navigation,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  CheckCircle2,
  Trash2,
  QrCode,
} from "lucide-react";

// --- Domain Models & Data Schemas ---
export interface MallStore {
  id: string;
  name: string;
  category: string;
  logoSymbol: string;
  brandBgColor: string;
  brandTextColor: string;
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

// 8 Richly Detailed South African Mall Outlets with Official Brand Badges & Grid Entry/Exit Nodes
export const MALL_DIRECTORY: MallStore[] = [
  {
    id: "s1",
    name: "Zara Fashion",
    category: "Apparel",
    logoSymbol: "ZARA",
    brandBgColor: "#000000",
    brandTextColor: "#ffffff",
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
    logoSymbol: "H&M",
    brandBgColor: "#e11d48",
    brandTextColor: "#ffffff",
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
    logoSymbol: " iStore",
    brandBgColor: "#0f172a",
    brandTextColor: "#ffffff",
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
    logoSymbol: "📚 EB",
    brandBgColor: "#15803d",
    brandTextColor: "#ffffff",
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
    logoSymbol: "☕ M&B",
    brandBgColor: "#78350f",
    brandTextColor: "#fef3c7",
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
    logoSymbol: "WOOLWORTHS",
    brandBgColor: "#000000",
    brandTextColor: "#ffffff",
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
    logoSymbol: "✔️ NIKE",
    brandBgColor: "#0f172a",
    brandTextColor: "#ffffff",
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
    logoSymbol: "💊 CLICKS",
    brandBgColor: "#0284c7",
    brandTextColor: "#ffffff",
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

export interface MallSimulatorProps {
  onClose?: () => void;
  onClaimOffer?: (store: MallStore) => void;
  onParkOffer?: (store: MallStore) => void;
  isFullScreen?: boolean;
  compactEmbed?: boolean;
  onLaunch3D?: () => void;
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
    simulationMode: "AUTO_WALK" | "HARDWARE";
    onToggleSimulationMode: () => void;
    walkScale: number;
    onChangeWalkScale: (scale: number) => void;
    selectedTargetStore: string;
    onSelectTargetStore: (id: string) => void;
  }) => (
    <div className="space-y-3.5">
      {/* Simulation Engine Mode Selector */}
      <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-blue-400" />
            Motion Driver Engine
          </span>
          <span className="text-blue-400 font-bold">{simulationMode}</span>
        </div>
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={onToggleSimulationMode}
            className={`py-2 px-3 rounded-xl font-mono text-xs font-bold transition-all border cursor-pointer ${
              simulationMode === "AUTO_WALK"
                ? "bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-500/20"
                : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
            }`}
          >
            🤖 Guided Auto Walk
          </button>

          <button
            onClick={onToggleSimulationMode}
            className={`py-2 px-3 rounded-xl font-mono text-xs font-bold transition-all border cursor-pointer ${
              simulationMode === "HARDWARE"
                ? "bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-500/20"
                : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
            }`}
          >
            🧭 Hardware Compass
          </button>
        </div>
      </div>

      {/* Speed Multiplier Slider */}
      <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400 uppercase tracking-wider">Passage Pace</span>
          <span className="text-emerald-400 font-bold font-mono">{walkScale}x Speed</span>
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

// Memoized Sub-Component: Dynamic Offer Card Overlay (Micro-Proportionally Responsive to Canvas Viewport)
const OfferCardOverlay = React.memo(
  ({
    store,
    isClaimed = false,
    isParked = false,
    onClaim,
    onPark,
    onDismiss,
  }: {
    store: MallStore;
    isClaimed?: boolean;
    isParked?: boolean;
    onClaim: (store: MallStore) => void;
    onPark: (store: MallStore) => void;
    onDismiss: () => void;
  }) => (
    <div className="absolute right-[3.5%] top-[31%] z-30 w-[34%] min-w-[130px] sm:min-w-[190px] max-w-[280px] max-h-[40%] transform transition-all duration-300 ease-out will-change-transform animate-in fade-in zoom-in-95 slide-in-from-right-3">
      <div className="p-1.5 xs:p-2 sm:p-3 rounded-lg xs:rounded-xl sm:rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.3)] text-white flex flex-col justify-between space-y-1 xs:space-y-1.5 sm:space-y-2 ring-1 ring-blue-500/30 overflow-hidden">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-1">
          <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
            {/* Official Brand Logo Badge */}
            <span
              className="px-1 sm:px-1.5 py-0.2 sm:py-0.5 rounded text-[8px] xs:text-[9px] sm:text-[10px] font-black font-mono shadow-sm shrink-0 border border-white/20"
              style={{ backgroundColor: store.brandBgColor, color: store.brandTextColor }}
            >
              {store.logoSymbol}
            </span>
            <div className="min-w-0">
              <h3 className="font-extrabold text-[9.5px] xs:text-[11px] sm:text-xs text-white truncate leading-tight">
                {store.name}
              </h3>
              <p className="text-[7.5px] xs:text-[8.5px] sm:text-[9px] text-slate-400 font-mono uppercase tracking-wider truncate">
                {store.category}
              </p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="p-0.5 sm:p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
            title="Dismiss offer popup"
          >
            <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </button>
        </div>

        {/* AI Agent Status / Discount Badge */}
        <div className="flex items-center gap-1 flex-wrap">
          <div className="inline-flex items-center gap-0.5 sm:gap-1 px-1 sm:px-1.5 py-0.2 sm:py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono text-[7.5px] xs:text-[8.5px] sm:text-[9.5px] font-extrabold self-start shrink-0">
            <span>⚡</span>
            <span className="truncate">{store.discount} SPECIAL</span>
          </div>

          {isClaimed && (
            <span className="px-1 sm:px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[7px] xs:text-[8px] font-mono font-bold flex items-center gap-0.5">
              <span>🤖 AI Claimed</span>
            </span>
          )}
          {isParked && (
            <span className="px-1 sm:px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-300 border border-teal-500/40 text-[7px] xs:text-[8px] font-mono font-bold flex items-center gap-0.5">
              <span>🤖 AI Parked</span>
            </span>
          )}
        </div>

        {/* Promo text */}
        <p className="text-[8.5px] xs:text-[9.5px] sm:text-[10.5px] text-slate-200 font-medium leading-tight sm:leading-snug line-clamp-2">
          {store.promo}
        </p>

        {/* Perks badges */}
        <div className="hidden sm:flex flex-wrap gap-1">
          {store.perks.slice(0, 2).map((perk, i) => (
            <span
              key={i}
              className="text-[8px] sm:text-[9px] font-mono px-1 py-0.2 sm:px-1.5 sm:py-0.5 rounded bg-slate-800/90 text-slate-300 border border-slate-700/80 truncate max-w-full"
            >
              ✓ {perk}
            </span>
          ))}
        </div>

        {/* Compact Action Buttons */}
        <div className="grid grid-cols-2 gap-1 sm:gap-1.5 pt-0.5 sm:pt-1 border-t border-slate-800/80 shrink-0">
          <button
            onClick={() => onClaim(store)}
            className={`flex items-center justify-center gap-0.5 sm:gap-1 py-0.5 xs:py-1 sm:py-1.5 px-1 sm:px-2 rounded-md sm:rounded-xl font-bold text-[8.5px] xs:text-[9.5px] sm:text-[10.5px] shadow-sm transition-all active:scale-95 cursor-pointer whitespace-nowrap ${
              isClaimed
                ? "bg-emerald-600 text-white shadow-emerald-500/30 ring-1 ring-emerald-400"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/20"
            }`}
          >
            <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
            <span>{isClaimed ? "Claimed" : "Claim"}</span>
          </button>
          <button
            onClick={() => onPark(store)}
            className={`flex items-center justify-center gap-0.5 sm:gap-1 py-0.5 xs:py-1 sm:py-1.5 px-1 sm:px-2 rounded-md sm:rounded-xl font-bold text-[8.5px] xs:text-[9.5px] sm:text-[10.5px] transition-all active:scale-95 cursor-pointer whitespace-nowrap border ${
              isParked
                ? "bg-amber-600 text-white border-amber-400 shadow-md shadow-amber-500/30"
                : "bg-slate-800 hover:bg-slate-750 text-amber-300 border-amber-500/30"
            }`}
          >
            <span>{isParked ? "🅿️ Parked" : "🅿️ Park"}</span>
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
              <h3 className="font-extrabold text-base text-white">Parked Deals</h3>
              <p className="text-xs text-slate-400">
                {parkedStores.length} saved offers ready for claim
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1">
          {parkedStores.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <span className="text-3xl">🅿️</span>
              <p className="text-sm font-bold text-slate-300">No Parked Offers Yet</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                When walking the mall corridors, click "Park Offer" to hold a voucher while
                browsing.
              </p>
            </div>
          ) : (
            parkedStores.map((store) => (
              <div
                key={store.id}
                className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-teal-500/40 transition-colors space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="px-2 py-0.5 rounded text-xs font-black font-mono"
                      style={{ backgroundColor: store.brandBgColor, color: store.brandTextColor }}
                    >
                      {store.logoSymbol}
                    </span>
                    <h4 className="font-bold text-sm text-white truncate">{store.name}</h4>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold shrink-0">
                    {store.discount}
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-medium leading-snug">{store.promo}</p>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => onRemove(store.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors text-xs flex items-center gap-1 font-mono"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Discard</span>
                  </button>
                  <button
                    onClick={() => onClaim(store)}
                    className="py-1.5 px-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Claim &amp; Generate QR</span>
                  </button>
                </div>
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
              <h3 className="font-extrabold text-base text-white">Shopping Bag &amp; Receipts</h3>
              <p className="text-xs text-slate-400">
                {claimedVouchers.length} active digital vouchers &amp; passkeys
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1">
          {claimedVouchers.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <span className="text-3xl">🛍️</span>
              <p className="text-sm font-bold text-slate-300">Bag is Empty</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Walk through shop doors during the simulator tour to claim live discount vouchers.
              </p>
            </div>
          ) : (
            claimedVouchers.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/40 transition-colors space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="px-2 py-0.5 rounded text-xs font-black font-mono"
                      style={{
                        backgroundColor: item.store.brandBgColor,
                        color: item.store.brandTextColor,
                      }}
                    >
                      {item.store.logoSymbol}
                    </span>
                    <h4 className="font-bold text-sm text-white truncate">{item.store.name}</h4>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold shrink-0">
                    {item.store.discount}
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-medium leading-snug">
                  {item.store.promo}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-400">
                  <span>Token: {item.qrToken}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onClearReceipt(item.id)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                      title="Clear receipt"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setSelectedVoucher(item)}
                      className="py-1 px-2.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold hover:bg-amber-500/30 transition-colors flex items-center gap-1"
                    >
                      <QrCode className="w-3 h-3" />
                      <span>Show POS Passkey QR</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Selected QR Passkey Modal overlay */}
        {selectedVoucher && (
          <div
            className="absolute inset-0 z-30 bg-slate-950/95 p-6 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in"
            onClick={() => setSelectedVoucher(null)}
          >
            <button
              onClick={() => setSelectedVoucher(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span
                className="px-3 py-1 rounded-lg text-sm font-black font-mono inline-block mb-1"
                style={{
                  backgroundColor: selectedVoucher.store.brandBgColor,
                  color: selectedVoucher.store.brandTextColor,
                }}
              >
                {selectedVoucher.store.logoSymbol}
              </span>
              <h3 className="text-lg font-bold text-white">{selectedVoucher.store.name}</h3>
              <p className="text-xs text-slate-400">WebAuthn Signed Biometric Passkey Voucher</p>
            </div>

            <div className="p-4 rounded-2xl bg-white shadow-2xl space-y-2">
              <div className="w-44 h-44 bg-slate-100 rounded-xl p-2 flex flex-col items-center justify-center border-2 border-slate-900">
                <QrCode className="w-28 h-28 text-black" />
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
  compactEmbed = false,
  onLaunch3D,
}: MallSimulatorProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Core Reactive States
  const [simulationMode, setSimulationMode] = useState<"AUTO_WALK" | "HARDWARE">("AUTO_WALK");
  const [walkScale, setWalkScale] = useState<number>(6); // Speed multiplier
  const [isIndoors, setIsIndoors] = useState<boolean>(true);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [selectedTargetStore, setSelectedTargetStore] = useState<string>("");

  // Telemetry & Offers State
  const [activeStepCount, setActiveStepCount] = useState<number>(0);
  const [activeCardStore, setActiveCardStore] = useState<MallStore | null>(null);
  const [currentNavAction, setCurrentNavAction] = useState<string>(
    "Touring Mall Corridor Passages",
  );

  // Local Parked Offers & Claimed Shopping Bag (Pre-seeded so initial counts are active)
  const [parkedStores, setParkedStores] = useState<MallStore[]>([
    MALL_DIRECTORY[1], // H&M Boutique 15% OFF
  ]);
  const [claimedVouchers, setClaimedVouchers] = useState<SimClaimedVoucher[]>([
    {
      id: "sim-seed-zara",
      store: MALL_DIRECTORY[0], // Zara Fashion 30% OFF
      timestamp: 1775500000000,
      qrToken: "VOUCHER-ZAR-89FA",
    },
  ]);
  const [isParkedModalOpen, setIsParkedModalOpen] = useState<boolean>(false);
  const [isBagModalOpen, setIsBagModalOpen] = useState<boolean>(false);

  // User State Mutable Ref for High Frequency Canvas Animation Frame Loop (60 FPS)
  const userMutable = useRef<{
    mallX: number;
    mallY: number;
    heading: number;
    tourIndex: number;
    customRoute: NavigationWaypoint[] | null;
    customIndex: number;
    dwellStart: number;
    dwellUntil: number;
    currentStoreId: string | null;
    currentShopAutoHandled: boolean;
  }>({
    mallX: DEFAULT_MALL_TOUR[0].x,
    mallY: DEFAULT_MALL_TOUR[0].y,
    heading: 90,
    tourIndex: 0,
    customRoute: null,
    customIndex: 0,
    dwellStart: 0,
    dwellUntil: 0,
    currentStoreId: null,
    currentShopAutoHandled: false,
  });

  // Keep latest state refs for render loop
  const stateRef = useRef({
    isIndoors,
    isPaused,
    walkScale,
    simulationMode,
    selectedTargetStore,
    activeCardStoreId: activeCardStore?.id || null,
  });

  useEffect(() => {
    stateRef.current = {
      isIndoors,
      isPaused,
      walkScale,
      simulationMode,
      selectedTargetStore,
      activeCardStoreId: activeCardStore?.id || null,
    };
  }, [isIndoors, isPaused, walkScale, simulationMode, selectedTargetStore, activeCardStore?.id]);

  // Handle custom destination store route build
  useEffect(() => {
    if (!selectedTargetStore) {
      userMutable.current.customRoute = null;
      userMutable.current.customIndex = 0;
      return;
    }

    const targetStore = MALL_DIRECTORY.find((s) => s.id === selectedTargetStore);
    if (targetStore) {
      const u = userMutable.current;
      u.customRoute = buildRouteToStore(u.mallX, u.mallY, targetStore);
      u.customIndex = 0;
      u.dwellStart = performance.now();
      u.dwellUntil = 0;
      u.currentShopAutoHandled = false;
    }
  }, [selectedTargetStore]);

  // --- Main Canvas Render & Motion Loop (60 FPS GPU RequestAnimationFrame) ---
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const renderLoop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1); // clamp delta
      lastTime = now;

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      const config = stateRef.current;
      const user = userMutable.current;

      if (canvas && ctx) {
        // --- 1. Physics Motion & Waypoint Traversal Update ---
        if (config.isIndoors && !config.isPaused) {
          const nowMs = performance.now();

          // Check if in dwell state
          if (nowMs < user.dwellUntil) {
            // Dwelling inside shop or lounge area: Autonomous AI Agent Bargaining Trigger
            if (
              !user.currentShopAutoHandled &&
              user.currentStoreId &&
              nowMs - user.dwellStart >= 1000
            ) {
              user.currentShopAutoHandled = true;
              const store = MALL_DIRECTORY.find((s) => s.id === user.currentStoreId);
              if (store) {
                // Dynamic Priority Filter: Parse discount percentage
                let discountPercent = 0;
                if (store.discount.includes("%")) {
                  discountPercent = parseInt(store.discount.replace(/[^0-9]/g, ""), 10) || 0;
                } else if (
                  store.discount.includes("FREE") ||
                  store.discount.includes("TRADE-IN") ||
                  store.id === "s3" ||
                  store.id === "k1" ||
                  store.id === "s5"
                ) {
                  discountPercent = 55; // High-priority instant drop (>50%)
                }

                // If strictly > 50%, trigger instant checkout auto-conversion directly into active Shopping Bag!
                const isInstantAutoBag = discountPercent > 50;

                if (isInstantAutoBag) {
                  setClaimedVouchers((prev) => {
                    if (prev.some((v) => v.store.id === store.id)) return prev;
                    return [
                      {
                        id: `sim-claim-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                        store,
                        timestamp: Date.now(),
                        qrToken: `VOUCHER-${store.name.substring(0, 3).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
                      },
                      ...prev,
                    ];
                  });
                  setParkedStores((prev) => prev.filter((p) => p.id !== store.id));
                  setCurrentNavAction(
                    `⚡ PRIORITY >50% DROP: AI Agent Auto-Converted ${store.name} into Bag!`,
                  );
                } else {
                  // Standard <= 50% discount -> Route into Parked Deals drawer
                  setParkedStores((prev) => {
                    if (prev.some((p) => p.id === store.id)) return prev;
                    return [store, ...prev];
                  });
                  setCurrentNavAction(`🅿️ AI Agent Routed ${store.discount} to Parked Deals`);
                }
              }
            }
          } else {
            // Select active waypoint route
            const activeRoute = user.customRoute || DEFAULT_MALL_TOUR;
            const activeIdx = user.customRoute ? user.customIndex : user.tourIndex;
            const targetWp = activeRoute[activeIdx];

            if (targetWp) {
              const dx = targetWp.x - user.mallX;
              const dy = targetWp.y - user.mallY;
              const dist = Math.hypot(dx, dy);

              if (dist < 4) {
                // Waypoint Reached
                user.mallX = targetWp.x;
                user.mallY = targetWp.y;

                if (targetWp.action) {
                  setCurrentNavAction(targetWp.action);
                }

                // Check store entry & offer triggers
                if (targetWp.storeId) {
                  const store = MALL_DIRECTORY.find((s) => s.id === targetWp.storeId);
                  if (store) {
                    user.currentStoreId = store.id;
                    if (targetWp.type === "inside_shop") {
                      setActiveCardStore(store);
                    }
                  }
                } else {
                  user.currentStoreId = null;
                }

                // Set dwell timer if specified
                if (targetWp.dwellMs && targetWp.dwellMs > 0) {
                  user.dwellStart = nowMs;
                  user.dwellUntil = nowMs + targetWp.dwellMs;
                  user.currentShopAutoHandled = false;
                }

                // Advance Waypoint Index
                if (user.customRoute) {
                  user.customIndex++;
                  if (user.customIndex >= user.customRoute.length) {
                    // Completed custom route, revert to main tour
                    user.customRoute = null;
                    setSelectedTargetStore("");
                  }
                } else {
                  user.tourIndex = (user.tourIndex + 1) % DEFAULT_MALL_TOUR.length;
                }
              } else {
                // Move towards target waypoint
                const speed = 42 * config.walkScale; // pixels per second
                const step = speed * dt;
                const ratio = Math.min(step / dist, 1);

                user.mallX += dx * ratio;
                user.mallY += dy * ratio;

                // Update heading angle
                const angleRad = Math.atan2(dy, dx);
                const targetHeading = Math.round((angleRad * 180) / Math.PI + 90);
                user.heading = targetHeading;

                setActiveStepCount((prev) => prev + Math.round(step * 0.22));
              }
            }
          }
        }

        // --- 2. Canvas Painting & Architectural Blueprint Render ---
        ctx.save();
        ctx.clearRect(0, 0, MAP_SIZE, MAP_SIZE);

        // Blueprint Floor Background Fill
        ctx.fillStyle = "#f5f3ec";
        ctx.fillRect(0, 0, MAP_SIZE, MAP_SIZE);

        // Subtle Architectural Grid Lines
        ctx.strokeStyle = "#e2e8f0";
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
          ctx.lineTo(MAP_SIZE, y);
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

        // Draw Stores with Official Logos & Center-Aligned Typography
        MALL_DIRECTORY.forEach((store) => {
          const isActive = config.activeCardStoreId === store.id;
          const centerX = store.x + store.width / 2;

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

          // Official Brand Logo Badge Centered
          ctx.save();
          const badgeWidth = Math.min(store.width - 24, 120);
          const badgeHeight = 26;
          const badgeX = centerX - badgeWidth / 2;
          const badgeY = store.y + 16;

          ctx.beginPath();
          if (typeof ctx.roundRect === "function") {
            ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 6);
          } else {
            ctx.rect(badgeX, badgeY, badgeWidth, badgeHeight);
          }
          ctx.fillStyle = store.brandBgColor;
          ctx.fill();

          ctx.fillStyle = store.brandTextColor;
          ctx.font = "bold 11px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(store.logoSymbol, centerX, badgeY + badgeHeight / 2);
          ctx.restore();

          // Centered Store Name & Category Typography
          ctx.save();
          ctx.textAlign = "center";
          ctx.textBaseline = "top";

          ctx.fillStyle = "#0f172a";
          ctx.font = "bold 14px sans-serif";
          ctx.fillText(store.name, centerX, store.y + 48);

          ctx.fillStyle = "#334155";
          ctx.font = "600 11px sans-serif";
          ctx.fillText(store.category, centerX, store.y + 68);

          // Centered Discount Pill Badge
          const discY = store.y + store.height - 36;
          const discWidth = Math.min(store.width - 32, 115);
          const discX = centerX - discWidth / 2;
          ctx.beginPath();
          if (typeof ctx.roundRect === "function") {
            ctx.roundRect(discX, discY, discWidth, 22, 10);
          } else {
            ctx.rect(discX, discY, discWidth, 22);
          }
          ctx.fillStyle = isActive ? "#2563eb" : "rgba(15, 23, 42, 0.85)";
          ctx.fill();

          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 10px monospace";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(store.discount, centerX, discY + 11);
          ctx.restore();

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

  const handleClaim = useCallback(
    (store: MallStore) => {
      setActiveCardStore(null);
      const user = userMutable.current;
      user.dwellUntil = 0;
      user.currentStoreId = null;

      const newVoucher: SimClaimedVoucher = {
        id: `sim-claim-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        store,
        timestamp: Date.now(),
        qrToken: `VOUCHER-${store.name.substring(0, 3).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      };
      setClaimedVouchers((prev) => [newVoucher, ...prev]);
      setParkedStores((prev) => prev.filter((p) => p.id !== store.id));

      if (onClaimOffer) onClaimOffer(store);
    },
    [onClaimOffer],
  );

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

  const handleDismiss = useCallback(() => {
    setActiveCardStore(null);
    const user = userMutable.current;
    user.dwellUntil = 0;
    user.currentStoreId = null;
  }, []);

  const handleRemoveParked = useCallback((storeId: string) => {
    setParkedStores((prev) => prev.filter((p) => p.id !== storeId));
  }, []);

  const handleClearReceipt = useCallback((id: string) => {
    setClaimedVouchers((prev) => prev.filter((v) => v.id !== id));
  }, []);

  const handleCanvasPointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = MAP_SIZE / rect.width;
    const scaleY = MAP_SIZE / rect.height;

    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    // Check if clicked inside any store
    const clickedStore = MALL_DIRECTORY.find(
      (s) => clickX >= s.x && clickX <= s.x + s.width && clickY >= s.y && clickY <= s.y + s.height,
    );

    if (clickedStore) {
      setSelectedTargetStore(clickedStore.id);
    }
  }, []);

  const handleReset = useCallback(() => {
    const user = userMutable.current;
    user.mallX = DEFAULT_MALL_TOUR[0].x;
    user.mallY = DEFAULT_MALL_TOUR[0].y;
    user.heading = 90;
    user.tourIndex = 0;
    user.customRoute = null;
    user.customIndex = 0;
    user.dwellUntil = 0;
    user.currentStoreId = null;
    setActiveStepCount(0);
    setActiveCardStore(null);
    setSelectedTargetStore("");
    setCurrentNavAction("Touring Mall Passages");
  }, []);

  // --- Hero Section Compact Embedding View ---
  if (compactEmbed) {
    return (
      <div className="w-full bg-slate-950 text-slate-100 flex flex-col font-sans rounded-2xl overflow-hidden relative border border-slate-800 shadow-2xl">
        {/* Sleek Minimal Header */}
        <header className="bg-slate-900/90 border-b border-slate-800 px-3.5 py-2.5 flex items-center justify-between gap-2 z-10 backdrop-blur-md">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 animate-pulse ring-1 ring-blue-500/40 shrink-0">
              <Radio className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-xs sm:text-sm text-white truncate">
                  IPS Indoor Grid Engine
                </h3>
                <span className="text-[9px] text-blue-400 font-mono border border-blue-500/30 px-1.5 py-0.2 rounded bg-blue-950/80 shrink-0 hidden xs:inline">
                  v2.6-GridCorridor
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate">
                8 Outlets · Live Passage Walk Simulation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setIsPaused((prev) => !prev)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer text-xs"
              title={isPaused ? "Resume Walk Simulation" : "Pause Walk Simulation"}
            >
              {isPaused ? (
                <Play className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Pause className="w-3.5 h-3.5 text-amber-400" />
              )}
            </button>
            <button
              onClick={handleReset}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer text-xs"
              title="Reset Simulation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            {onLaunch3D && (
              <button
                onClick={onLaunch3D}
                className="bg-primary text-primary-foreground font-bold text-[11px] px-2.5 py-1 rounded-lg shadow hover:bg-primary/90 transition-colors shrink-0 cursor-pointer hidden sm:flex items-center gap-1"
              >
                <span>Open 3D</span>
                <span>→</span>
              </button>
            )}
          </div>
        </header>

        {/* Blueprint Canvas Container: 100% Uncropped Responsive Square Scale */}
        <div className="relative w-full aspect-square bg-[#f5f3ec] overflow-hidden flex items-center justify-center">
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
            className="w-full h-full aspect-square block cursor-pointer bg-[#f5f3ec] touch-none object-contain"
          />

          {/* Dynamic Offer Card Overlay with GPU Compositor Acceleration */}
          {activeCardStore && (
            <OfferCardOverlay
              store={activeCardStore}
              isClaimed={claimedVouchers.some((v) => v.store.id === activeCardStore.id)}
              isParked={parkedStores.some((p) => p.id === activeCardStore.id)}
              onClaim={handleClaim}
              onPark={handlePark}
              onDismiss={handleDismiss}
            />
          )}
        </div>

        {/* Dedicated Status Bar Below Canvas (NEVER blocks bottom row shops) */}
        <div className="px-3.5 py-2.5 border-t border-slate-800 bg-slate-900/95 flex items-center justify-between gap-2 shadow-xl text-white">
          <div className="flex items-center gap-2 min-w-0 text-left">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <div className="min-w-0">
              <p className="text-[11px] sm:text-xs font-bold text-white truncate">
                {activeCardStore ? `Inside ${activeCardStore.name}` : currentNavAction}
              </p>
              <p className="text-[9px] sm:text-[10px] font-mono text-teal-300 truncate">
                Auto Grid Tour · {activeStepCount} Steps Logged
              </p>
            </div>
          </div>
          {onLaunch3D && (
            <button
              onClick={onLaunch3D}
              className="rounded-lg bg-primary px-3 py-1.5 text-[10px] sm:text-[11px] font-bold text-primary-foreground hover:bg-primary/90 transition-colors shrink-0 cursor-pointer shadow-md"
            >
              Open 3D
            </button>
          )}
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

  // --- Full Standalone / Modal View ---
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
              Grid-Aligned Corridor Navigation &amp; In-Shop Retail Traversal
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
          <div className="relative border-2 border-slate-700 rounded-2xl overflow-hidden bg-slate-950 shadow-2xl w-full max-w-[500px] aspect-square">
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
              title="Open Shopping Bag &amp; Vouchers"
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
                isClaimed={claimedVouchers.some((v) => v.store.id === activeCardStore.id)}
                isParked={parkedStores.some((p) => p.id === activeCardStore.id)}
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
