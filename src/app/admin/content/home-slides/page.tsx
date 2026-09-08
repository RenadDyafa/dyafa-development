import { prisma } from "@/lib/prisma";
import { HomeSlidesManager } from "@/components/admin/HomeSlidesManager";
import { getHomeSliderSettings } from "@/lib/settings/sliders";

export default async function AdminHomeSlidesPage() {
  const [slides, settings] = await Promise.all([
    prisma.homeSlide.findMany({ orderBy: { displayOrder: "asc" }, include: { media: true } }),
    getHomeSliderSettings(),
  ]);

  return (
    <div>
      <h1 className="text-xl font-bold text-navy-900">Home slider</h1>
      <p className="mt-1 text-sm text-grey-600">
        Images or short video clips shown in the homepage hero. Empty by default - the homepage keeps its current look
        until at least one slide is published.
      </p>
      <div className="mt-6">
        <HomeSlidesManager slides={slides} settings={settings} />
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
