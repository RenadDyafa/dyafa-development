import { Carousel } from "@/components/ui/Carousel";
import type { TestimonialView } from "@/lib/testimonials/service";
import type { SliderSettings } from "@/lib/settings/sliders";

export function TestimonialSlider({ testimonials, settings }: { testimonials: TestimonialView[]; settings: SliderSettings }) {
  return (
    <Carousel
      ariaLabel="Testimonials"
      showArrows={settings.showArrows}
      showBullets={settings.showBullets}
      autoplayMs={settings.autoplayMs}
      loop={settings.loop}
      className="mx-auto max-w-3xl"
    >
      {testimonials.map((t) => (
        <figure key={t.id} className="flex flex-col items-center rounded-xl border border-grey-200 bg-stone-050 px-6 py-10 text-center sm:px-12">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true" className="text-bronze/40">
            <path
              d="M9.5 18.5c-2.5 0-4.5-2-4.5-4.5S7 9.5 9.5 9.5c1 0 1.8.3 2.5.8-.3-3.3-2.5-5.3-5.5-6l1-2.3c4.3 1 7.5 4.3 7.5 9 0 4-2.6 7.5-5.5 7.5zm14 0c-2.5 0-4.5-2-4.5-4.5s2-4.5 4.5-4.5c1 0 1.8.3 2.5.8-.3-3.3-2.5-5.3-5.5-6l1-2.3c4.3 1 7.5 4.3 7.5 9 0 4-2.6 7.5-5.5 7.5z"
              fill="currentColor"
            />
          </svg>
          <blockquote className="mt-4 max-w-xl text-lg text-navy-900">{t.quote}</blockquote>
          <figcaption className="mt-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-stone-100 text-sm font-semibold text-navy-900">
              {t.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- served by our own /api/media route, not an optimizable remote image
                <img src={t.avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                t.authorName.slice(0, 1)
              )}
            </div>
            <div className="text-start">
              <p className="text-sm font-semibold text-navy-900">{t.authorName}</p>
              {(t.authorRole || t.authorCompany) && (
                <p className="text-xs text-slate">{[t.authorRole, t.authorCompany].filter(Boolean).join(" · ")}</p>
              )}
            </div>
          </figcaption>
        </figure>
      ))}
    </Carousel>
  );
}
