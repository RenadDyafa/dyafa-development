import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, AuthError } from "@/lib/authz";
import { unauthorized, forbidden } from "@/lib/api/response";

function csvEscape(value: unknown): string {
  const str = value === null || value === undefined ? "" : String(value);
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

export async function GET(_req: NextRequest) {
  try {
    await requireUser();
  } catch (error) {
    if (error instanceof AuthError) return error.status === 401 ? unauthorized() : forbidden();
    throw error;
  }

  const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });

  const headers = ["id", "type", "persona", "status", "name", "org", "email", "phone", "city", "locale", "campaignId", "utmSource", "utmMedium", "utmCampaign", "createdAt"];
  const rows = leads.map((l) =>
    [l.id, l.type, l.persona, l.status, l.name, l.org, l.email, l.phone, l.city, l.locale, l.campaignId, l.utmSource, l.utmMedium, l.utmCampaign, l.createdAt.toISOString()]
      .map(csvEscape)
      .join(","),
  );

  const csv = [headers.join(","), ...rows].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="leads-export-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
