import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, unauthorized, forbidden } from "@/lib/api/response";
import { requireUser, AuthError } from "@/lib/authz";
import type { LeadStatus, Persona } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    await requireUser();
  } catch (error) {
    if (error instanceof AuthError) return error.status === 401 ? unauthorized() : forbidden();
    throw error;
  }

  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status") as LeadStatus | null;
  const persona = searchParams.get("persona") as Persona | null;
  const campaignId = searchParams.get("campaignId");
  const cursor = searchParams.get("cursor");
  const take = Math.min(Number(searchParams.get("take") ?? "25"), 100);

  const leads = await prisma.lead.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(persona ? { persona } : {}),
      ...(campaignId ? { campaignId } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: { _count: { select: { notes: true, files: true } } },
  });

  const hasMore = leads.length > take;
  const items = hasMore ? leads.slice(0, take) : leads;

  return ok({ items, nextCursor: hasMore ? items[items.length - 1]!.id : null });
}
