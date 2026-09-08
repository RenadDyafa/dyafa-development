"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Carousel } from "@/components/ui/Carousel";

type GalleryImage = { id: string; url: string; caption: string | null };

/**
 * Thumbnail grid + keyboard-accessible modal lightbox for a project's
 * photography, built on the existing Carousel primitive rather than a new
 * slider implementation.
 */
export function ProjectGallery({ images }: { images: GalleryImage[] }) {
  const t = useTranslations("projects");
  const tCommon = useTranslations("common");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    if (openIndex === null) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenIndex(null);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [openIndex]);

  if (images.length === 0) return null;

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((image, i) => (
          <button
            key={image.id}
            type="button"
            onClick={() => setOpenIndex(i)}
            aria-label={`${t("galleryLabel")} ${i + 1} / ${images.length}`}
            className="group aspect-[4/3] overflow-hidden rounded-lg bg-stone-100"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- served by our own /api/media route */}
            <img
              src={image.url}
              alt={image.caption ?? ""}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      {openIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t("galleryLabel")}
          className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/90 p-4"
          onClick={() => setOpenIndex(null)}
        >
          <div className="w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex justify-end">
              <button
                type="button"
                onClick={() => setOpenIndex(null)}
                className="rounded-full bg-stone-050/10 p-2 text-stone-050 hover:bg-stone-050/20"
              >
                <span className="sr-only">{tCommon("close")}</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <Carousel ariaLabel={t("galleryLabel")} initialIndex={openIndex} controlsVariant="overlay">
              {images.map((image) => (
                <div key={image.id} className="flex aspect-[4/3] items-center justify-center bg-navy-900">
                  {/* eslint-disable-next-line @next/next/no-img-element -- served by our own /api/media route */}
                  <img src={image.url} alt={image.caption ?? ""} className="h-full w-full object-contain" />
                </div>
              ))}
            </Carousel>
          </div>
        </div>
      )}
    </div>
  );
}
