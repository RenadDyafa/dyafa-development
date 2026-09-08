import type { AssetType, LeadStatus, LeadType, LegalStatus, Locale, Persona, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { enqueueEmail } from "@/lib/mail/queue";
import { leadNotificationEmail } from "@/lib/mail/templates";
import { env } from "@/lib/env";
import type { UtmAttribution } from "@/lib/utm";
import type { StoredFile } from "@/lib/storage";
import { computeLeadScore } from "@/lib/leads/scoring";
import { buildLeadReferenceNumber } from "@/lib/leads/reference";

const ROLE_TO_PERSONA: Record<string, Persona> = {
  landowner: "landowner",
  investor: "investor",
  developer: "developer_jv",
  government: "government",
  hotel_owner: "hotel_owner",
  other: "other",
};

export function mapRoleToPersona(role: string | undefined): Persona | undefined {
  if (!role) return undefined;
  return ROLE_TO_PERSONA[role] ?? "other";
}

type CreateLeadInput = {
  type: LeadType;
  persona?: Persona;
  name: string;
  org?: string;
  email: string;
  phone: string;
  city?: string;
  locale: Locale;
  message?: string;
  landLocation?: string;
  landLocationLat?: number;
  landLocationLng?: number;
  landAreaM2?: number;
  legalStatus?: LegalStatus;
  assetType?: AssetType;
  consentAt: Date;
  idempotencyKey?: string;
  utm: UtmAttribution;
  files?: StoredFile[];
  opportunityIntent?: string;
  timeline?: string;
};

export async function createLead(input: CreateLeadInput) {
  if (input.idempotencyKey) {
    const existing = await prisma.lead.findUnique({ where: { idempotencyKey: input.idempotencyKey } });
    if (existing) return { lead: existing, deduped: true };
  }

  // Internal routing score + a reference number shown to the visitor on
  // success - both computed for every lead type (not just site-review),
  // since the same signals (org/city/asset info, if present) are equally
  // useful for triage on contact/meeting submissions.
  const score = computeLeadScore({
    opportunityIntent: input.opportunityIntent,
    city: input.city,
    landLocation: input.landLocation,
    assetType: input.assetType,
    legalStatus: input.legalStatus,
    landAreaM2: input.landAreaM2,
    organization: input.org,
    fileCount: input.files?.length ?? 0,
  });

  const lead = await prisma.lead.create({
    data: {
      type: input.type,
      persona: input.persona,
      status: "new" as LeadStatus,
      name: input.name,
      org: input.org,
      email: input.email,
      phone: input.phone,
      city: input.city,
      locale: input.locale,
      message: input.message,
      landLocation: input.landLocation,
      landLocationLat: input.landLocationLat,
      landLocationLng: input.landLocationLng,
      landAreaM2: input.landAreaM2,
      legalStatus: input.legalStatus,
      assetType: input.assetType,
      opportunityIntent: input.opportunityIntent,
      timeline: input.timeline,
      score,
      campaignId: input.utm.campaignId,
      utmSource: input.utm.utmSource,
      utmMedium: input.utm.utmMedium,
      utmCampaign: input.utm.utmCampaign,
      utmTerm: input.utm.utmTerm,
      utmContent: input.utm.utmContent,
      idempotencyKey: input.idempotencyKey,
      consentAt: input.consentAt,
      files: input.files
        ? {
            create: input.files.map((f) => ({
              path: f.path,
              filename: f.filename,
              mime: f.mime,
              size: f.size,
            })),
          }
        : undefined,
    },
  });

  const referenceNumber = buildLeadReferenceNumber(lead.id);
  const withReference = await prisma.lead.update({ where: { id: lead.id }, data: { referenceNumber } });

  await notifyBdTeam(lead.id);

  return { lead: withReference, deduped: false };
}

async function notifyBdTeam(leadId: string) {
  const lead = await prisma.lead.findUniqueOrThrow({ where: { id: leadId } });
  const { subject, html } = leadNotificationEmail(lead);
  await enqueueEmail({
    to: env.bdNotificationEmails,
    subject,
    template: "lead-notification",
    data: { leadId: lead.id },
    html,
  });
}

export async function addLeadNote(leadId: string, authorId: string, body: string) {
  return prisma.lead.update({
    where: { id: leadId },
    data: { notes: { create: { authorId, body } } },
    include: { notes: true },
  });
}

export async function updateLeadStatus(leadId: string, status: LeadStatus, actorId: string) {
  const before = await prisma.lead.findUniqueOrThrow({ where: { id: leadId } });
  const lead = await prisma.lead.update({ where: { id: leadId }, data: { status } });
  await prisma.approval.create({
    data: {
      entityType: "lead",
      entityId: leadId,
      fromState: before.status,
      toState: status,
      actorId,
    },
  });
  return lead;
}

// PDPL hard-delete: scrubs personal data but keeps the Approval audit trail
// alive (Approval.entityId is a plain string, not an FK) and a tombstone row
// for pipeline/reporting counts.
export async function pdplDeleteLead(leadId: string, actorId: string) {
  await prisma.leadNote.deleteMany({ where: { leadId } });
  await prisma.leadFile.deleteMany({ where: { leadId } });

  const scrubbed = await prisma.lead.update({
    where: { id: leadId },
    data: {
      name: "[deleted]",
      email: "deleted@dyafa.com",
      phone: "[deleted]",
      org: null,
      message: null,
      landLocation: null,
      deletedAt: new Date(),
      status: "archived",
    },
  });

  await prisma.approval.create({
    data: {
      entityType: "lead",
      entityId: leadId,
      fromState: null,
      toState: "pdpl_deleted",
      actorId,
      note: "PDPL hard-delete requested",
    },
  });

  return scrubbed;
}

export type { Prisma };
