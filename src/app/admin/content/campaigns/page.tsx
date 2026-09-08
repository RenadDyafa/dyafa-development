import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { NewCampaignForm } from "@/components/admin/NewCampaignForm";

export default async function AdminCampaignsPage() {
  const campaigns = await prisma.campaign.findMany({ orderBy: { updatedAt: "desc" } });

  return (
    <div>
      <h1 className="text-xl font-bold text-navy-900">Campaigns</h1>
      <p className="mt-1 text-sm text-grey-600">Published campaigns are live at /campaigns/[slug] and inherit the site-review form with UTM + campaign_id.</p>

      <div className="mt-6 max-w-lg">
        <NewCampaignForm />
      </div>

      <table className="mt-8 w-full text-sm">
        <thead>
          <tr className="border-b border-grey-200 text-xs uppercase text-grey-500">
            <th className="py-2 text-start">Name</th>
            <th className="py-2 text-start">Slug</th>
            <th className="py-2 text-start">Status</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((c) => (
            <tr key={c.id} className="border-b border-grey-100">
              <td className="py-2">
                <Link href={`/admin/content/campaigns/${c.id}`} className="font-medium text-teal-600 hover:underline">
                  {c.name}
                </Link>
              </td>
              <td className="py-2">/campaigns/{c.slug}</td>
              <td className="py-2">
                <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs">{c.status}</span>
              </td>
            </tr>
          ))}
          {campaigns.length === 0 && (
            <tr>
              <td colSpan={3} className="py-4 text-grey-500">
                No campaigns yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export const dynamic = "force-dynamic";
