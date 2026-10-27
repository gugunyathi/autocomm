import { useState, useEffect, useCallback } from "react";
import {
  Download,
  ChevronLeft,
  ChevronRight,
  X,
  FileText,
  ExternalLink,
  Sparkles,
  Zap,
  TrendingUp,
  Users,
  CheckCircle2,
} from "lucide-react";
import { PITCH_DECK_SLIDES, downloadPitchDeckPDF } from "@/lib/pitch-deck-pdf";

interface PitchDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PitchDeckModal({ isOpen, onClose }: PitchDeckModalProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const totalSlides = PITCH_DECK_SLIDES.length;
  const currentSlide = PITCH_DECK_SLIDES[currentSlideIndex];

  // Keyboard navigation (Arrow keys & Escape)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "Space") {
        setCurrentSlideIndex((prev) => (prev < totalSlides - 1 ? prev + 1 : prev));
      } else if (e.key === "ArrowLeft") {
        setCurrentSlideIndex((prev) => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, totalSlides, onClose]);

  const handleDownloadPDF = useCallback(async () => {
    try {
      setIsDownloading(true);
      await downloadPitchDeckPDF();
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error("PDF Download error:", err);
    } finally {
      setIsDownloading(false);
    }
  }, []);

  if (!isOpen || !currentSlide) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/90 backdrop-blur-2xl animate-in fade-in overflow-y-auto">
      <div
        className="relative w-full max-w-5xl my-auto flex flex-col rounded-2xl sm:rounded-3xl bg-slate-900 border border-slate-700/80 shadow-[0_0_50px_rgba(13,148,136,0.15)] text-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <header className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-800 bg-slate-950/90 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/40 flex items-center justify-center font-bold text-sm shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-white truncate">
                  Autocomm Pitch Deck
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/30 shrink-0">
                  Seed Stage
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                Slide {currentSlideIndex + 1} of {totalSlides} · {currentSlide.category}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Direct Download PDF Button */}
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="flex items-center gap-1.5 py-2 px-3 sm:px-4 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              title="Download Full Pitch Deck as PDF"
            >
              {downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-slate-950" />
                  <span className="hidden xs:inline">Downloaded!</span>
                </>
              ) : isDownloading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span className="hidden xs:inline">Generating PDF…</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-slate-950" />
                  <span>Download PDF</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close Pitch Deck"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Slide Viewport */}
        <div className="p-4 sm:p-8 min-h-[380px] sm:min-h-[440px] flex flex-col justify-between bg-gradient-to-b from-slate-900 to-slate-950">
          <div>
            {/* Category tag */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-teal-500/10 text-teal-400 font-mono text-[11px] font-bold border border-teal-500/30 mb-2">
              <Sparkles className="w-3 h-3" />
              <span>{currentSlide.category}</span>
            </div>

            {/* Slide Title & Subtitle */}
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">
              {currentSlide.title}
            </h2>
            <p className="text-xs sm:text-sm text-amber-400 font-medium mt-1 mb-5 sm:mb-6">
              {currentSlide.subtitle}
            </p>

            {/* Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
              {/* Bullets List */}
              <div
                className={`${
                  currentSlide.metrics && currentSlide.metrics.length > 0
                    ? "lg:col-span-8"
                    : "lg:col-span-12"
                } space-y-3 bg-slate-950/60 p-4 sm:p-5 rounded-2xl border border-slate-800`}
              >
                {currentSlide.bullets.map((bullet, idx) => {
                  const isTeamName =
                    bullet.startsWith("Gugu Nyathi") || bullet.startsWith("Thami Nyathi");
                  const isLinkedIn = bullet.startsWith("LinkedIn:");
                  const linkedInUrl = isLinkedIn ? bullet.replace("LinkedIn: ", "").trim() : "";

                  if (isTeamName) {
                    return (
                      <div
                        key={idx}
                        className="pt-2 pb-1 border-t border-slate-800/80 first:border-0 first:pt-0"
                      >
                        <h4 className="text-base sm:text-lg font-bold text-amber-300 flex items-center gap-2">
                          <Users className="w-4 h-4 text-teal-400" />
                          <span>{bullet}</span>
                        </h4>
                      </div>
                    );
                  }

                  if (isLinkedIn) {
                    return (
                      <a
                        key={idx}
                        href={linkedInUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-teal-400 hover:text-teal-300 hover:underline bg-teal-950/60 px-3 py-1.5 rounded-lg border border-teal-500/30 transition-colors"
                      >
                        <span>LinkedIn Profile</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    );
                  }

                  const colonIndex = bullet.indexOf(":");
                  const hasPrefix = colonIndex > 0 && colonIndex <= 42;
                  const prefix = hasPrefix ? bullet.substring(0, colonIndex + 1) : "";
                  const rest = hasPrefix ? bullet.substring(colonIndex + 1).trim() : bullet;

                  return (
                    <div key={idx} className="flex items-start gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-teal-400 shrink-0 mt-1.5 shadow-[0_0_8px_rgba(20,184,166,0.6)]" />
                      <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                        {hasPrefix ? (
                          <>
                            <strong className="font-bold text-amber-300 mr-1.5 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                              {prefix}
                            </strong>
                            <span>{rest}</span>
                          </>
                        ) : (
                          bullet
                        )}
                      </p>
                    </div>
                  );
                })}

                {/* Key Takeaway Callout */}
                {currentSlide.highlight && (
                  <div className="mt-4 p-3 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center gap-2 text-xs text-teal-200 font-semibold">
                    <Zap className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>{currentSlide.highlight}</span>
                  </div>
                )}
              </div>

              {/* Right Side Metric Highlights (if present) */}
              {currentSlide.metrics && currentSlide.metrics.length > 0 && (
                <div className="lg:col-span-4 flex flex-col gap-3">
                  {currentSlide.metrics.map((m, mIdx) => (
                    <div
                      key={mIdx}
                      className="p-3.5 sm:p-4 rounded-2xl bg-slate-950/80 border border-amber-500/40 shadow-lg space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                          {m.label}
                        </span>
                        <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                      </div>
                      <p className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
                        {m.value}
                      </p>
                      {m.desc && (
                        <p className="text-[11px] text-slate-300 font-medium leading-tight">
                          {m.desc}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Slide Footer with Page indicator */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>{currentSlide.footerNote || "Autocomm · Silvernest Pty Ltd"}</span>
            <span>INVESTOR PITCH DECK · SEED STAGE</span>
          </div>
        </div>

        {/* Slide Navigation Controller Footer */}
        <footer className="px-4 sm:px-6 py-3.5 border-t border-slate-800 bg-slate-950/90 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          {/* Slide thumbnails / indicators */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0">
            {PITCH_DECK_SLIDES.map((_, sIdx) => (
              <button
                key={sIdx}
                onClick={() => setCurrentSlideIndex(sIdx)}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                  currentSlideIndex === sIdx
                    ? "bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/25 scale-105"
                    : "bg-slate-850 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
                }`}
                title={`Jump to Slide ${sIdx + 1}`}
              >
                {sIdx + 1}
              </button>
            ))}
          </div>

          {/* Prev / Next buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentSlideIndex === 0}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              onClick={() => setCurrentSlideIndex((prev) => Math.min(totalSlides - 1, prev + 1))}
              disabled={currentSlideIndex === totalSlides - 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-md"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
