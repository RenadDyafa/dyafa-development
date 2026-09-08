import { prisma } from "@/lib/prisma";
import { MediaLibrary } from "@/components/admin/MediaLibrary";

export default async function AdminMediaPage() {
  const media = await prisma.media.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <h1 className="text-xl font-bold text-navy-900">Media library</h1>
      <div className="mt-6">
        <MediaLibrary media={media} />
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
