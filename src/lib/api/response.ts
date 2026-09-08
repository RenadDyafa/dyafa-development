import { NextResponse } from "next/server";
import type { ZodError } from "zod";

export function ok<T>(data: T, init?: number | ResponseInit) {
  return NextResponse.json({ data, error: null }, typeof init === "number" ? { status: init } : init);
}

export function fail(code: string, message: string, status: number, fields?: Record<string, string[]>) {
  return NextResponse.json(
    { data: null, error: { code, message, ...(fields ? { fields } : {}) } },
    { status },
  );
}

export function validationError(zodError: ZodError) {
  const fields: Record<string, string[]> = {};
  for (const issue of zodError.issues) {
    const key = issue.path.join(".") || "_";
    fields[key] = [...(fields[key] ?? []), issue.message];
  }
  return fail("VALIDATION_ERROR", "Validation failed", 422, fields);
}

export function unauthorized() {
  return fail("UNAUTHENTICATED", "Authentication required", 401);
}

export function forbidden() {
  return fail("FORBIDDEN", "You do not have permission to perform this action", 403);
}

export function notFound(message = "Not found") {
  return fail("NOT_FOUND", message, 404);
}

export function rateLimited(retryAfterMs: number) {
  return NextResponse.json(
    { data: null, error: { code: "RATE_LIMITED", message: "Too many requests" } },
    { status: 429, headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) } },
  );
}

export function serverError(message = "Internal server error") {
  return fail("INTERNAL_ERROR", message, 500);
}
