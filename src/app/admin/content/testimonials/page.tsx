import { prisma } from "@/lib/prisma";
import { TestimonialsManager } from "@/components/admin/TestimonialsManager";
import { getTestimonialSliderSettings } from "@/lib/settings/sliders";

export default async function AdminTestimonialsPage() {
  const [testimonials, settings] = await Promise.all([
    prisma.testimonial.findMany({ orderBy: { displayOrder: "asc" }, include: { avatarMedia: true } }),
    getTestimonialSliderSettings(),
  ]);

  return (
    <div>
      <h1 className="text-xl font-bold text-navy-900">Testimonials</h1>
      <p className="mt-1 text-sm text-grey-600">
        Only add a quote that was actually given by a real client or partner. Empty by default - the homepage section
        stays hidden until at least one is published.
      </p>
      <div className="mt-6">
        <TestimonialsManager testimonials={testimonials} settings={settings} />
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
