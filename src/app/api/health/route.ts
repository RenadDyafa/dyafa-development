import { prisma } from "@/lib/prisma";
import { ok, serverError } from "@/lib/api/response";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return ok({ status: "ok", timestamp: new Date().toISOString() });
  } catch {
    return serverError("Database unavailable");
  }
}
