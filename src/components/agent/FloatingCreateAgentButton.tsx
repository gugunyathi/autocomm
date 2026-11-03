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
      className="fixed right-3 sm:right-6 top-1/2 -translate-y-1/2 z-[9990] pointer-events-none select-none animate-in fade-in zoom-in-95 duration-500"
    >
      <div className="relative pointer-events-auto group">
        {/* Ambient Pulse Aura */}
        <div
          aria-hidden="true"
          className="absolute -inset-1.5 rounded-full bg-gradient-to-b from-emerald-500/40 via-cyan-500/30 to-emerald-600/40 blur-md opacity-75 group-hover:opacity-100 group-hover:blur-lg transition-all duration-500 animate-pulse"
        />

        {/* Main Vertical Floating Pill Button */}
        <button
          type="button"
          onClick={() => {
            if (typeof navigator !== "undefined" && "vibrate" in navigator) {
              navigator.vibrate?.([40, 25, 40]);
            }
            onClick();
          }}
          aria-label="Create Personal Shopping Agent"
          className="relative flex flex-col items-center justify-center gap-2 py-4 px-2 sm:px-3 rounded-full bg-slate-950/90 hover:bg-slate-900 text-slate-100 border border-emerald-500/50 hover:border-emerald-400 shadow-[0_12px_36px_rgba(0,0,0,0.6),0_0_20px_rgba(16,185,129,0.25)] transition-all duration-300 transform group-hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
        >
          {/* Top Pulsing Plus Glyphs */}
          <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 text-slate-950 shadow-md group-hover:rotate-90 transition-transform duration-300">
            <Plus className="w-5 h-5 stroke-[2.75]" />
            <span
              aria-hidden="true"
              className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-300 ring-2 ring-slate-950 animate-ping"
            />
          </div>

          {/* Vertical Label Text */}
          <div
            className="flex flex-col items-center justify-center gap-0.5 my-1 text-[10px] font-black uppercase tracking-[0.22em] text-emerald-400 group-hover:text-emerald-300 transition-colors"
            style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
          >
            <span className="leading-tight">CREATE AGENT</span>
          </div>

          {/* Sparkle Icon at Bottom */}
          <div className="text-cyan-400/80 group-hover:text-cyan-300 transition-colors">
            <Sparkles className="w-3.5 h-3.5" />
          </div>

          {/* Subtle Live Badge */}
          <span className="text-[8px] font-semibold text-emerald-400/90 tracking-tighter">
            24/7
          </span>
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
