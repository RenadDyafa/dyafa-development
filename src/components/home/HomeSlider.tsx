import { Carousel } from "@/components/ui/Carousel";
import { ButtonLink } from "@/components/ui/Button";
import { ParallaxImage } from "@/components/ui/ParallaxImage";
import type { HomeSlideView } from "@/lib/homeSlides/service";
import type { SliderSettings } from "@/lib/settings/sliders";

/**
 * Full-bleed hero slider. Server-rendered (no "use client" here) - the
 * interactive parts live entirely inside <Carousel>, so each slide's media
 * and overlay copy stay plain server-rendered markup passed as children.
 */
export function HomeSlider({ slides, settings }: { slides: HomeSlideView[]; settings: SliderSettings }) {
  return (
    <Carousel
      ariaLabel="Featured"
      showArrows={settings.showArrows}
      showBullets={settings.showBullets}
      autoplayMs={settings.autoplayMs}
      loop={settings.loop}
      controlsVariant="overlay"
    >
      {slides.map((slide) => (
        <div key={slide.id} className="relative h-[70vh] max-h-[720px] min-h-[420px] w-full bg-navy-900">
          {slide.mediaKind === "video" ? (
            <video src={slide.mediaUrl} className="h-full w-full object-cover" autoPlay muted loop playsInline />
          ) : (
            <ParallaxImage src={slide.mediaUrl} alt="" className="h-full w-full" />
          )}

          {(slide.headline || slide.subheadline || slide.ctaLabel) && (
            <div className="absolute inset-0 flex items-end bg-gradient-to-t from-navy-900/80 via-navy-900/20 to-transparent">
              <div className="mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
                {slide.headline && <h2 className="max-w-2xl text-3xl font-bold text-stone-050 sm:text-4xl">{slide.headline}</h2>}
                {slide.subheadline && <p className="mt-3 max-w-xl text-base text-teal-100">{slide.subheadline}</p>}
                {slide.ctaLabel && slide.ctaHref && (
                  <ButtonLink href={slide.ctaHref} size="lg" className="mt-6">
                    {slide.ctaLabel}
                  </ButtonLink>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </Carousel>
  );
}
