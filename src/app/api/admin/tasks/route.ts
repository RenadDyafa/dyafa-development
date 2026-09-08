import type { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, fail, validationError, unauthorized, forbidden } from "@/lib/api/response";
import { requireUser, AuthError } from "@/lib/authz";
import { assertSameOrigin } from "@/lib/security/csrf";

const createSchema = z.object({
  title: z.string().min(1).max(300),
  description: z.string().max(4000).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  assigneeId: z.string().optional(),
  dueAt: z.string().datetime().optional(),
});

export async function GET(req: NextRequest) {
  try {
    await requireUser();
  } catch (error) {
    if (error instanceof AuthError) return error.status === 401 ? unauthorized() : forbidden();
    throw error;
  }

  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status");
  const assigneeId = searchParams.get("assigneeId");

  const tasks = await prisma.task.findMany({
    where: {
      category: "general",
      ...(status ? { status: status as never } : {}),
      ...(assigneeId ? { assigneeId } : {}),
    },
    include: { assignee: true, createdBy: true },
    orderBy: [{ status: "asc" }, { dueAt: "asc" }],
  });

  return ok(tasks);
}

export async function POST(req: NextRequest) {
  if (!assertSameOrigin(req)) return forbidden();

  let user;
  try {
    user = await requireUser();
  } catch (error) {
    if (error instanceof AuthError) return error.status === 401 ? unauthorized() : forbidden();
    throw error;
  }

  const body = await req.json().catch(() => null);
  if (!body) return fail("VALIDATION_ERROR", "Invalid JSON body", 422);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  const task = await prisma.task.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      priority: parsed.data.priority,
      assigneeId: parsed.data.assigneeId,
      dueAt: parsed.data.dueAt ? new Date(parsed.data.dueAt) : undefined,
      category: "general",
      createdById: user.id,
    },
  });

  return ok(task, 201);
}
