import { describe, it, expect, afterAll } from "vitest";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { createLead, mapRoleToPersona, pdplDeleteLead } from "./service";

const createdLeadIds: string[] = [];

async function ensureTestUser() {
  return prisma.user.upsert({
    where: { email: "vitest-actor@dyafa.com" },
    update: {},
    create: { email: "vitest-actor@dyafa.com", name: "Vitest Actor", passwordHash: "x", role: "admin" },
  });
}

afterAll(async () => {
  await prisma.approval.deleteMany({ where: { entityId: { in: createdLeadIds } } });
  await prisma.lead.deleteMany({ where: { id: { in: createdLeadIds } } });
  await prisma.$disconnect();
});

describe("mapRoleToPersona", () => {
  it("maps known roles to their persona", () => {
    expect(mapRoleToPersona("landowner")).toBe("landowner");
    expect(mapRoleToPersona("investor")).toBe("investor");
    expect(mapRoleToPersona("developer")).toBe("developer_jv");
    expect(mapRoleToPersona("government")).toBe("government");
    expect(mapRoleToPersona("hotel_owner")).toBe("hotel_owner");
  });

  it("falls back to other for unknown/undefined roles", () => {
    expect(mapRoleToPersona("something-else")).toBe("other");
    expect(mapRoleToPersona(undefined)).toBeUndefined();
  });
});

describe("createLead", () => {
  it("persists a lead with UTM attribution", async () => {
    const { lead, deduped } = await createLead({
      type: "site_review",
      persona: "landowner",
      name: "Vitest Lead",
      email: "vitest-lead@example.com",
      phone: "+966500000000",
      locale: "en",
      consentAt: new Date(),
      utm: { utmSource: "linkedin", utmMedium: "social", utmCampaign: "cityscape" },
    });
    createdLeadIds.push(lead.id);

    expect(deduped).toBe(false);
    expect(lead.utmSource).toBe("linkedin");
    expect(lead.status).toBe("new");
  });

  it("dedupes a second submission with the same idempotency key", async () => {
    const idempotencyKey = randomUUID();
    const first = await createLead({
      type: "contact",
      name: "Idempotent Lead",
      email: "idempotent@example.com",
      phone: "+966500000001",
      locale: "en",
      consentAt: new Date(),
      idempotencyKey,
      utm: {},
    });
    createdLeadIds.push(first.lead.id);

    const second = await createLead({
      type: "contact",
      name: "Idempotent Lead — should be ignored",
      email: "idempotent@example.com",
      phone: "+966500000001",
      locale: "en",
      consentAt: new Date(),
      idempotencyKey,
      utm: {},
    });

    expect(second.deduped).toBe(true);
    expect(second.lead.id).toBe(first.lead.id);
  });
});

describe("pdplDeleteLead", () => {
  it("scrubs personal data but keeps an audit trail", async () => {
    const actor = await ensureTestUser();
    const { lead } = await createLead({
      type: "contact",
      name: "To Be Deleted",
      email: "delete-me@example.com",
      phone: "+966500000002",
      locale: "en",
      message: "please delete my data",
      consentAt: new Date(),
      utm: {},
    });
    createdLeadIds.push(lead.id);

    const scrubbed = await pdplDeleteLead(lead.id, actor.id);
    expect(scrubbed.name).toBe("[deleted]");
    expect(scrubbed.email).not.toBe("delete-me@example.com");
    expect(scrubbed.message).toBeNull();
    expect(scrubbed.deletedAt).not.toBeNull();

    const approval = await prisma.approval.findFirst({ where: { entityId: lead.id, toState: "pdpl_deleted" } });
    expect(approval).not.toBeNull();
    expect(approval?.actorId).toBe(actor.id);
  });
});
