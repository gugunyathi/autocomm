import React from "react";
import { Plus, Sparkles } from "lucide-react";

interface FloatingCreateAgentButtonProps {
  isVisible: boolean;
  onClick: () => void;
}

export const FloatingCreateAgentButton: React.FC<FloatingCreateAgentButtonProps> = ({
  isVisible,
  onClick,
}) => {
  if (!isVisible) return null;

  return (
    <aside
      aria-label="Agent Creation Quick Action"
      className="fixed right-2.5 sm:right-5 z-[38] pointer-events-none select-none animate-in fade-in zoom-in-95 duration-300"
      style={{ bottom: "max(5.5rem, calc(env(safe-area-inset-bottom) + 5rem))" }}
    >
      <div className="relative pointer-events-auto group">
        {/* Ambient Pulse Aura */}
        <div
          aria-hidden="true"
          className="absolute -inset-1 rounded-full bg-gradient-to-b from-emerald-500/35 via-cyan-500/25 to-emerald-600/35 blur-sm opacity-70 group-hover:opacity-100 group-hover:blur-md transition-all duration-300 animate-pulse"
        />

        {/* Main Vertical Floating Pill Button - 1/3 shorter, sleek, clear of Bag & bottom menu */}
        <button
          type="button"
          onClick={() => {
            if (typeof navigator !== "undefined" && "vibrate" in navigator) {
              navigator.vibrate?.([40, 25, 40]);
            }
            onClick();
          }}
          aria-label="Create Personal Shopping Agent"
          className="relative flex flex-col items-center justify-center gap-1 py-2 px-1.5 sm:px-2 rounded-full bg-slate-950/95 hover:bg-slate-900 text-slate-100 border border-emerald-500/50 hover:border-emerald-400 shadow-[0_8px_24px_rgba(0,0,0,0.65),0_0_16px_rgba(16,185,129,0.25)] transition-all duration-200 transform group-hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 cursor-pointer"
        >
          {/* Top Pulsing Plus Glyph in compact circle */}
          <div className="relative flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-sm group-hover:rotate-90 transition-transform duration-300">
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span
              aria-hidden="true"
              className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-300 ring-2 ring-slate-950 animate-ping"
            />
          </div>

          {/* Vertical Label Text - compact, sleek, ~1/3 shorter */}
          <div
            className="flex flex-col items-center justify-center my-0.5 text-[8.5px] font-black uppercase tracking-[0.14em] text-emerald-400 group-hover:text-emerald-300 transition-colors select-none"
            style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
          >
            <span className="leading-none">CREATE AGENT</span>
          </div>

          {/* Compact Sparkle & 24/7 Footer */}
          <div className="flex flex-col items-center justify-center gap-0.5 pt-0.5">
            <Sparkles className="w-2.5 h-2.5 text-cyan-400/90 group-hover:text-cyan-300 transition-colors" />
            <span className="text-[7.5px] font-bold text-emerald-400/90 tracking-tight leading-none">
              24/7
            </span>
          </div>
        </button>

        {/* Hover / Tooltip Card (Desktop/Tablet) */}
        <div
          role="tooltip"
          className="absolute right-full top-1/2 -translate-y-1/2 mr-3 px-3 py-2 rounded-xl bg-slate-950/95 text-slate-100 text-xs font-medium border border-emerald-500/30 shadow-2xl backdrop-blur-md opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 translate-x-2 group-hover:translate-x-0 whitespace-nowrap hidden sm:flex items-center gap-2.5"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <div>
            <div className="font-semibold text-emerald-300 flex items-center gap-1.5">
              <span>Deploy Autonomous Agent</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                FREE
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              Personalized .agent · Voice search · 24/7 night bargains
            </div>
          </div>
          {/* Arrow */}
          <div className="absolute left-full top-1/2 -translate-y-1/2 -ml-1 border-4 border-transparent border-l-slate-950" />
        </div>
      </div>
    </aside>
  );
};
