"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Subtle scroll-linked parallax for a full-bleed hero image - the image
 * sits in an oversized wrapper and shifts a few percent as the section
 * scrolls past, capped low enough to stay "premium" rather than "gimmicky"
 * (design brief: "subtle parallax where appropriate... never over-animate").
 * Respects prefers-reduced-motion (no transform at all in that case) and
 * throttles to one requestAnimationFrame per scroll/resize event.
 */
export function ParallaxImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [reducedMotion, setReducedMotion] = useState(true);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(query.matches);
    if (query.matches) return;

    let ticking = false;
    function update() {
      ticking = false;
      const wrapper = wrapperRef.current;
      const img = imgRef.current;
      if (!wrapper || !img) return;
      const rect = wrapper.getBoundingClientRect();
      const viewportH = window.innerHeight || 1;
      // -0.5..0.5 as the section moves from just-below to just-above the
      // viewport - centered on the section being vertically centered.
      const progress = (rect.top + rect.height / 2 - viewportH / 2) / (viewportH + rect.height);
      const offsetPercent = Math.max(-6, Math.min(6, progress * 12));
      img.style.transform = `scale(1.12) translateY(${offsetPercent}%)`;
    }
    function onScrollOrResize() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }
    update();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, []);

  return (
    <div ref={wrapperRef} className={className ? `relative overflow-hidden ${className}` : "relative h-full w-full overflow-hidden"}>
      {/* eslint-disable-next-line @next/next/no-img-element -- served by our own /api/media route, not an optimizable remote image */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className="h-full w-full object-cover"
        style={reducedMotion ? undefined : { transform: "scale(1.12) translateY(0%)", willChange: "transform" }}
      />
    </div>
  );
}
