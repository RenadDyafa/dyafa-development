"use client";

import { Children, useCallback, useEffect, useRef, useState, type ReactNode, type KeyboardEvent, type TouchEvent } from "react";
import { useLocale } from "next-intl";
import { cn } from "@/lib/cn";

export type CarouselProps = {
  children: ReactNode[];
  ariaLabel: string;
  showArrows?: boolean;
  showBullets?: boolean;
  /** Autoplay interval in ms. 0/undefined disables autoplay entirely. */
  autoplayMs?: number;
  loop?: boolean;
  className?: string;
  /**
   * "below" (default) renders bullets/pause in normal flow under the
   * slides - right for card-style content like testimonials. "overlay"
   * absolutely positions them over the bottom of the slide with a
   * light-on-dark treatment - right for a full-bleed image/video hero.
   */
  controlsVariant?: "below" | "overlay";
  /** Slide to start on (e.g. the thumbnail a gallery lightbox was opened from). Defaults to 0. */
  initialIndex?: number;
};

/**
 * Dependency-free slide carousel (arrows, bullets, autoplay with a pause
 * control, swipe, keyboard nav) - the shared engine behind the homepage
 * hero slider and the testimonial slider. Content-agnostic: each child is
 * rendered as one slide exactly as given, so the caller decides whether a
 * slide is an <img>, a <video>, or a testimonial card.
 *
 * RTL: the slide track is forced to dir="ltr" internally so the
 * translateX math stays simple and predictable; the surrounding arrow/
 * bullet chrome uses logical CSS positions (start-/end-) and inherits the
 * page's real direction, so it still reads correctly right-to-left -
 * "next" always advances forward through the content and sits on the
 * logical end side, matching the reading direction. Physical arrow keys
 * map to physical (not logical) direction, matching OS/carousel convention.
 */
export function Carousel({
  children,
  ariaLabel,
  showArrows = true,
  showBullets = true,
  autoplayMs = 0,
  loop = true,
  className,
  controlsVariant = "below",
  initialIndex = 0,
}: CarouselProps) {
  const locale = useLocale();
  const isRtl = locale === "ar";
  const slides = Children.toArray(children);
  const count = slides.length;

  const [index, setIndex] = useState(initialIndex);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  const goTo = useCallback(
    (next: number) => {
      if (count === 0) return;
      setIndex(loop ? (next + count) % count : Math.min(Math.max(next, 0), count - 1));
    },
    [count, loop],
  );

  const goNext = useCallback(() => goTo(index + 1), [goTo, index]);
  const goPrev = useCallback(() => goTo(index - 1), [goTo, index]);

  const autoplayActive = autoplayMs > 0 && count > 1;

  useEffect(() => {
    if (!autoplayActive || paused || reducedMotion) return;
    const id = setInterval(() => {
      setIndex((i) => (loop ? (i + 1) % count : Math.min(i + 1, count - 1)));
    }, autoplayMs);
    return () => clearInterval(id);
  }, [autoplayActive, autoplayMs, paused, reducedMotion, count, loop]);

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === "ArrowRight") isRtl ? goPrev() : goNext();
    if (e.key === "ArrowLeft") isRtl ? goNext() : goPrev();
  }

  function onTouchStart(e: TouchEvent) {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  }

  function onTouchEnd(e: TouchEvent) {
    if (touchStartX.current === null) return;
    const endX = e.changedTouches[0]?.clientX;
    if (endX === undefined) return;
    const dx = endX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < 40) return;
    const swipedTowardStart = dx > 0;
    if (isRtl ? !swipedTowardStart : swipedTowardStart) goPrev();
    else goNext();
  }

  if (count === 0) return null;

  return (
    <div
      className={cn("group/carousel relative", className)}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={onKeyDown}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="overflow-hidden rounded-lg" dir="ltr">
        <div
          className={cn("flex", !reducedMotion && "transition-transform duration-700 ease-out")}
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {slides.map((slide, i) => (
            <div
              key={i}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} / ${count}`}
              aria-hidden={i !== index}
              className="w-full shrink-0"
              inert={i !== index}
            >
              {slide}
            </div>
          ))}
        </div>
      </div>

      {showArrows && count > 1 && (
        <>
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous slide"
            className="absolute start-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-stone-050/90 p-2 text-navy-900 opacity-0 shadow-md transition-opacity duration-150 hover:bg-stone-050 focus-visible:opacity-100 group-hover/carousel:opacity-100"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Next slide"
            className="absolute end-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-stone-050/90 p-2 text-navy-900 opacity-0 shadow-md transition-opacity duration-150 hover:bg-stone-050 focus-visible:opacity-100 group-hover/carousel:opacity-100"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </>
      )}

      {(showBullets || autoplayActive) && count > 1 && (
        <div
          className={cn(
            "flex items-center justify-center gap-3",
            controlsVariant === "overlay" ? "absolute inset-x-0 bottom-4 z-10" : "mt-3",
          )}
        >
          {showBullets && (
            <div role="tablist" aria-label="Slides" className="flex items-center gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`Go to slide ${i + 1}`}
                  onClick={() => goTo(i)}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    i === index
                      ? "w-6 bg-bronze"
                      : controlsVariant === "overlay"
                        ? "w-2 bg-stone-050/50 hover:bg-stone-050/80"
                        : "w-2 bg-grey-400 hover:bg-grey-600",
                  )}
                />
              ))}
            </div>
          )}
          {autoplayActive && (
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              aria-label={paused ? "Resume autoplay" : "Pause autoplay"}
              className={cn(
                "rounded-full p-1.5",
                controlsVariant === "overlay" ? "text-stone-050/70 hover:bg-stone-050/10 hover:text-stone-050" : "text-grey-600 hover:bg-stone-100 hover:text-navy-900",
              )}
            >
              {paused ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M8 5v14l11-7z" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M6 5h4v14H6zm8 0h4v14h-4z" />
                </svg>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
