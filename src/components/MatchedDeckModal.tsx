import { useState, useRef, useEffect, useCallback } from "react";
import type { MatchedDeal } from "@/components/DealMatchPopup";

interface MatchedDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  deck: MatchedDeal[];
  onBuy: (deal: MatchedDeal) => void;
  onPark: (deal: MatchedDeal) => void;
  onDiscard: (dealId: string) => void;
}

interface SwipableCardProps {
  deal: MatchedDeal;
  nowTime: number;
  onBuy: (deal: MatchedDeal) => void;
  onPark: (deal: MatchedDeal) => void;
  onDiscard: (dealId: string) => void;
}

function SwipableCard({ deal, nowTime, onBuy, onPark, onDiscard }: SwipableCardProps) {
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startPos = useRef<{ x: number; y: number } | null>(null);
  const isHorizontalSwipe = useRef<boolean | null>(null);

  // Dynamic special offer expiration calculation
  const totalDuration = deal.total || 465;
  const timeLeft = Math.max(0, Math.round((deal.expires - nowTime) / 1000));
  const progressPercent = Math.min(100, Math.max(0, (timeLeft / totalDuration) * 100));

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  const isCritical = timeLeft < 60;
  const isUrgent = timeLeft < 180;

  const handlePointerDown = (e: React.PointerEvent) => {
    // Only capture primary touch/mouse button
    if (e.button !== undefined && e.button !== 0) return;
    startPos.current = { x: e.clientX, y: e.clientY };
    isHorizontalSwipe.current = null;
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !startPos.current) return;
    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;

    // Lock in horizontal vs vertical swipe direction
    if (isHorizontalSwipe.current === null) {
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8) {
        isHorizontalSwipe.current = true;
      } else if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 8) {
        isHorizontalSwipe.current = false;
      }
    }

    // Only apply horizontal transform if horizontal gesture is locked in
    if (isHorizontalSwipe.current === true) {
      setDragX(dx);
    }
  };

  const handlePointerUp = useCallback(() => {
    if (!isDragging) return;

    const threshold = 70;
    if (dragX > threshold) {
      // Swiped Right -> BUY
      onBuy(deal);
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate?.([60, 40, 90]);
      }
    } else if (dragX < -threshold) {
      // Swiped Left -> PARK
      onPark(deal);
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate?.([40, 60]);
      }
    }

    setIsDragging(false);
    setDragX(0);
    startPos.current = null;
    isHorizontalSwipe.current = null;
  }, [isDragging, dragX, deal, onBuy, onPark]);

  const swipeAction = dragX > 45 ? "buy" : dragX < -45 ? "park" : null;

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className="relative select-none transition-transform duration-100 ease-out touch-pan-y"
      style={{
        transform: `translateX(${dragX}px) rotate(${dragX * 0.04}deg)`,
      }}
    >
      {/* Visual Swipe Direction Indicators */}
      {swipeAction === "buy" && (
        <div className="absolute inset-0 z-30 rounded-2xl sm:rounded-3xl bg-accent/35 border-2 border-accent backdrop-blur-sm flex flex-col items-center justify-center text-accent font-bold animate-fade-in pointer-events-none p-3 text-center shadow-amber">
          <span className="text-3xl sm:text-4xl animate-bounce">🛍️</span>
          <p className="mt-1 font-mono text-xs sm:text-sm uppercase tracking-widest text-accent font-black">
            Release to Buy Now
          </p>
        </div>
      )}

      {swipeAction === "park" && (
        <div className="absolute inset-0 z-30 rounded-2xl sm:rounded-3xl bg-primary/35 border-2 border-primary backdrop-blur-sm flex flex-col items-center justify-center text-primary font-bold animate-fade-in pointer-events-none p-3 text-center shadow-teal">
          <span className="text-3xl sm:text-4xl animate-bounce">🅿️</span>
          <p className="mt-1 font-mono text-xs sm:text-sm uppercase tracking-widest text-primary font-black">
            Release to Park in Lot
          </p>
        </div>
      )}

      {/* Main Card Container */}
      <div className="rounded-2xl sm:rounded-3xl border border-white/20 bg-gradient-to-b from-[#141929] to-[#0c101c] p-3 sm:p-5 shadow-2xl relative overflow-hidden">
        {/* Top Header Strip */}
        <div className="flex items-center justify-between gap-1.5 mb-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
            </span>
            <span className="font-mono text-[8.5px] sm:text-[9.5px] uppercase tracking-[0.15em] sm:tracking-[0.2em] text-accent font-bold truncate">
              ⚡ Matched Deal
            </span>
          </div>
          <span className="font-mono text-[8px] sm:text-[9px] text-muted-foreground shrink-0 bg-white/5 border border-white/10 px-1.5 sm:px-2 py-0.5 rounded-full">
            Right 🛍️ Buy · Left 🅿️ Park
          </span>
        </div>

        {/* Item Image Banner */}
        {deal.store.image && (
          <div className="relative h-28 sm:h-36 md:h-40 w-full overflow-hidden rounded-xl sm:rounded-2xl border border-white/15 shadow-inner group">
            <img
              src={deal.store.image}
              alt={deal.store.item}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c101c] via-transparent to-black/25" />
            {deal.store.specialBadge && (
              <span className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 rounded-full bg-accent text-accent-foreground font-mono text-[8.5px] sm:text-[9.5px] font-black px-2 py-0.5 shadow-md">
                ⚡ {deal.store.specialBadge}
              </span>
            )}
            <span className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 rounded-lg bg-black/75 backdrop-blur-md px-1.5 sm:px-2 py-0.5 font-mono text-[8.5px] sm:text-[9.5px] text-white border border-white/15">
              {deal.store.dist}m away
            </span>
          </div>
        )}

        {/* Item Header */}
        <div className="mt-2.5 sm:mt-3 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base md:text-lg font-bold text-white truncate">
              {deal.store.item}
            </h3>
            <p className="text-[11px] sm:text-xs text-muted-foreground truncate flex items-center gap-1 mt-0.5">
              <span>{deal.store.icon}</span>
              <span className="font-semibold text-white/90 truncate">{deal.store.name}</span>
              <span>·</span>
              <span className="text-primary font-mono shrink-0">{deal.store.cat}</span>
            </p>
          </div>

          <div className="text-xl sm:text-2xl place-items-center rounded-xl sm:rounded-2xl bg-white/5 p-1.5 sm:p-2 border border-white/10 shrink-0">
            {deal.store.icon}
          </div>
        </div>

        {/* Dynamic Special Offer Countdown Timer & Visual Progress Bar */}
        <div className="mt-2.5 sm:mt-3 rounded-xl sm:rounded-2xl bg-black/45 border border-white/10 p-2 sm:p-3 space-y-1.5 sm:space-y-2">
          <div className="flex items-center justify-between text-[11px] sm:text-xs font-mono">
            <div className="flex items-center gap-1 sm:gap-1.5">
              <span className={`text-xs sm:text-sm ${isCritical ? "animate-bounce" : ""}`}>
                {isCritical ? "🔥" : "⏳"}
              </span>
              <span className="text-muted-foreground font-semibold text-[9.5px] sm:text-[10.5px]">
                {timeLeft === 0 ? "Expired" : "Expiration Window:"}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span
                className={`font-black tracking-wider text-[10.5px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-md ${
                  isCritical
                    ? "bg-rose-500/25 text-rose-400 border border-rose-500/40 animate-pulse"
                    : isUrgent
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                }`}
              >
                {timeFormatted}
              </span>
              <span className="text-[9px] sm:text-[10px] text-muted-foreground">left</span>
            </div>
          </div>

          {/* Visual Depleting Progress Bar */}
          <div className="relative h-1.5 sm:h-2 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-linear ${
                isCritical
                  ? "bg-gradient-to-r from-rose-500 to-red-600 shadow-[0_0_10px_rgba(244,63,94,0.7)]"
                  : isUrgent
                    ? "bg-gradient-to-r from-amber-400 to-orange-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                    : "bg-gradient-to-r from-emerald-400 to-teal-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[8.5px] sm:text-[9.5px] font-mono text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              <span>Dynamic Mesh</span>
            </span>
            <span
              className={
                isCritical
                  ? "text-rose-400 font-bold"
                  : isUrgent
                    ? "text-amber-400 font-semibold"
                    : "text-emerald-400 font-semibold"
              }
            >
              {isCritical ? "⚡ Ending shortly!" : `${Math.round(progressPercent)}% left`}
            </span>
          </div>
        </div>

        {/* Pricing Comparison */}
        <div className="mt-2.5 sm:mt-3 flex items-baseline justify-between pt-2 border-t border-white/10">
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-xl sm:text-2xl md:text-3xl font-extrabold text-accent">
              R{deal.price}
            </span>
            <span className="text-[11px] sm:text-xs text-muted-foreground line-through">
              R{deal.store.open}
            </span>
          </div>

          <span className="rounded-md bg-accent/20 px-1.5 sm:px-2 py-0.5 font-mono text-[10px] sm:text-xs font-bold text-accent">
            -{Math.round(((deal.store.open - deal.price) / deal.store.open) * 100)}% OFF
          </span>
        </div>

        {/* Action Buttons Row - Fully Responsive Flexible Touch Targets */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 pt-2.5 sm:pt-3">
          <button
            onClick={() => onDiscard(deal.store.id)}
            className="py-2 sm:py-2.5 px-1 sm:px-2 rounded-xl sm:rounded-2xl border border-white/15 bg-white/5 hover:bg-destructive/20 hover:border-destructive text-muted-foreground hover:text-destructive text-[11px] sm:text-xs font-mono font-bold transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1"
          >
            <span>🗑️</span>
            <span>Discard</span>
          </button>

          <button
            onClick={() => onPark(deal)}
            className="py-2 sm:py-2.5 px-1 sm:px-2 rounded-xl sm:rounded-2xl border border-primary/40 bg-primary/15 hover:bg-primary/25 text-primary text-[11px] sm:text-xs font-mono font-bold transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1 shadow-teal"
          >
            <span>🅿️</span>
            <span>Park</span>
          </button>

          <button
            onClick={() => onBuy(deal)}
            className="py-2 sm:py-2.5 px-1 sm:px-2 rounded-xl sm:rounded-2xl border border-accent/40 bg-accent text-accent-foreground hover:opacity-95 text-[11px] sm:text-xs font-mono font-black transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1 shadow-amber"
          >
            <span>🛍️</span>
            <span>Buy</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export function MatchedDeckModal({
  isOpen,
  onClose,
  deck,
  onBuy,
  onPark,
  onDiscard,
}: MatchedDeckModalProps) {
  const [nowTime, setNowTime] = useState(Date.now());

  // Real-time ticking for live expiration countdowns
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => setNowTime(Date.now()), 500);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="matched-deck-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="glass relative w-full max-w-[94vw] sm:max-w-md md:max-w-lg max-h-[92dvh] flex flex-col rounded-3xl border border-accent/40 bg-[#0c101c]/98 shadow-2xl overflow-hidden text-foreground animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative glow */}
        <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-accent/20 blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between p-3.5 sm:p-5 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="grid h-8 w-8 sm:h-10 sm:w-10 place-items-center rounded-xl sm:rounded-2xl bg-accent/20 text-accent border border-accent/30 font-bold text-base sm:text-lg shadow-amber shrink-0">
              ⚡
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h2
                  id="matched-deck-title"
                  className="text-sm sm:text-base md:text-lg font-bold text-white truncate"
                >
                  Matched Deals Deck
                </h2>
                <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] sm:text-xs font-mono font-bold text-accent shrink-0">
                  {deck.length} {deck.length === 1 ? "Deal" : "Deals"}
                </span>
              </div>
              <p className="text-[9.5px] sm:text-[10.5px] font-mono text-muted-foreground truncate mt-0.5">
                ↕️ Scroll vertically · Right 🛍️ Buy · Left 🅿️ Park
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-white hover:bg-white/10 transition-colors text-sm cursor-pointer shrink-0"
            aria-label="Close Matched Deck"
          >
            ✕
          </button>
        </div>

        {/* Vertically Scrollable Card Feed Body */}
        <div className="p-2.5 sm:p-4 overflow-y-auto flex-1 space-y-3.5 sm:space-y-4 max-h-[80dvh] scrollbar-thin">
          {deck.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <span className="text-4xl sm:text-5xl">🃏</span>
              <p className="text-sm font-bold text-white">Matched Deck is Empty</p>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                All matched deals have been acted upon. Sweep with your phone or tap Scan to
                discover new deals!
              </p>
              <button
                onClick={onClose}
                className="mt-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-teal hover:opacity-95 transition-opacity cursor-pointer"
              >
                Return to 3D Stream
              </button>
            </div>
          ) : (
            deck.map((deal) => (
              <SwipableCard
                key={deal.store.id}
                deal={deal}
                nowTime={nowTime}
                onBuy={onBuy}
                onPark={onPark}
                onDiscard={onDiscard}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
