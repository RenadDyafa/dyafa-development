import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(`${env.siteUrl}/en?newsletter=invalid`);
  }

  const subscriber = await prisma.subscriber.findUnique({ where: { confirmToken: token } });
  if (!subscriber) {
    return NextResponse.redirect(`${env.siteUrl}/en?newsletter=invalid`);
  }

  await prisma.subscriber.update({
    where: { id: subscriber.id },
    data: { confirmedAt: new Date(), confirmToken: null },
  });

  const locale = subscriber.locale === "ar" ? "ar" : "en";
  return NextResponse.redirect(`${env.siteUrl}/${locale}?newsletter=confirmed`);
}
