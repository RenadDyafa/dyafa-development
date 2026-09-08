import { prisma } from "@/lib/prisma";

export type ComplianceIssue = {
  type:
    | "banned_phrase"
    | "high_risk_number"
    | "high_risk_keyword"
    | "high_risk_government"
    | "high_risk_partner"
    | "high_risk_project"
    | "high_risk_date"
    | "bilingual_incomplete";
  lang: "en" | "ar" | "both";
  match: string;
  message: string;
};

export type ScanResult = {
  blocks: ComplianceIssue[];
  flags: ComplianceIssue[];
};

export type ScanInput = {
  textEn: string;
  textAr: string;
  referencedPartnerNames?: string[];
  referencedProjectNames?: string[];
};

const ARABIC_DIACRITICS = /[ً-ْٰـ]/g;

function normalizeArabic(text: string): string {
  // Lowercased too (in addition to diacritic-stripping) so that the
  // bilingual-completeness equality check below is case-insensitive on both
  // sides — matters if non-Arabic text (e.g. accidental English) ends up in
  // the Arabic field.
  return text.replace(ARABIC_DIACRITICS, "").trim().toLowerCase();
}

function normalizeEnglish(text: string): string {
  return text.toLowerCase().trim();
}

// EN+AR "secured/approved/funded/guaranteed"-class keywords per BRD §6.
const HIGH_RISK_KEYWORDS_EN = ["secured", "approved", "funded", "guaranteed"];
const HIGH_RISK_KEYWORDS_AR = ["مضمون", "معتمد", "ممول", "مؤمّن"];

const NUMBER_OR_CURRENCY_RE = /(\d+(\.\d+)?\s*%|\bSAR\b|\bريال\b|\d{2,})/i;

// Hard delivery-date phrasing: "delivery in <year>", "opening in <year>",
// or a bare 4-digit year presented near delivery/opening language.
const DELIVERY_DATE_RE_EN = /\b(delivery|open(?:ing)?|handover)\b[^.]{0,40}\b(20\d{2}|q[1-4]\s*20\d{2})\b/i;
const DELIVERY_DATE_RE_AR = /(تسليم|افتتاح|التشغيل)[^.]{0,40}(20\d{2}|١٤\d{2})/;

export async function scanContent(input: ScanInput): Promise<ScanResult> {
  const blocks: ComplianceIssue[] = [];
  const flags: ComplianceIssue[] = [];

  const bannedPhrases = await prisma.bannedPhrase.findMany({ where: { active: true } });

  const normalizedEn = normalizeEnglish(input.textEn);
  const normalizedAr = normalizeArabic(input.textAr);

  for (const bp of bannedPhrases) {
    const haystack = bp.lang === "ar" ? normalizedAr : normalizedEn;
    const needle = bp.lang === "ar" ? normalizeArabic(bp.phrase) : normalizeEnglish(bp.phrase);
    if (needle && haystack.includes(needle)) {
      const issue: ComplianceIssue = {
        type: "banned_phrase",
        lang: bp.lang,
        match: bp.phrase,
        message: `Banned phrase detected (${bp.lang.toUpperCase()}): "${bp.phrase}"`,
      };
      (bp.severity === "block" ? blocks : flags).push(issue);
    }
  }

  // HIGH-RISK: numbers / % / currency amounts -> force legal_review (flag).
  const numberMatchEn = input.textEn.match(NUMBER_OR_CURRENCY_RE);
  if (numberMatchEn) {
    flags.push({
      type: "high_risk_number",
      lang: "en",
      match: numberMatchEn[0],
      message: `Number, percentage, or currency amount detected: "${numberMatchEn[0]}"`,
    });
  }
  const numberMatchAr = input.textAr.match(NUMBER_OR_CURRENCY_RE);
  if (numberMatchAr) {
    flags.push({
      type: "high_risk_number",
      lang: "ar",
      match: numberMatchAr[0],
      message: `Number, percentage, or currency amount detected: "${numberMatchAr[0]}"`,
    });
  }

  for (const kw of HIGH_RISK_KEYWORDS_EN) {
    if (normalizedEn.includes(kw)) {
      flags.push({ type: "high_risk_keyword", lang: "en", match: kw, message: `HIGH-RISK keyword detected: "${kw}"` });
    }
  }
  for (const kw of HIGH_RISK_KEYWORDS_AR) {
    if (normalizedAr.includes(kw)) {
      flags.push({ type: "high_risk_keyword", lang: "ar", match: kw, message: `HIGH-RISK keyword detected: "${kw}"` });
    }
  }

  // Government-entity dictionary (seeded in settings, editable by legal).
  const govSetting = await prisma.setting.findUnique({ where: { key: "government_entity_dictionary" } });
  const govEntities = (govSetting?.valueJson as { entities?: string[] } | undefined)?.entities ?? [];
  for (const entity of govEntities) {
    if (input.textEn.includes(entity) || input.textAr.includes(entity)) {
      flags.push({
        type: "high_risk_government",
        lang: "both",
        match: entity,
        message: `Government/ministry reference detected: "${entity}" — requires legal/CEO approval.`,
      });
    }
  }

  // Unapproved partner/project references: any block mentioning a partner or
  // project name that does not resolve to an approved+active row.
  if (input.referencedPartnerNames?.length) {
    const approvedPartners = await prisma.partner.findMany({ where: { active: true, approvedAt: { not: null } } });
    const approvedNames = new Set(approvedPartners.flatMap((p) => [p.nameEn, p.nameAr]));
    for (const name of input.referencedPartnerNames) {
      if (!approvedNames.has(name)) {
        flags.push({ type: "high_risk_partner", lang: "both", match: name, message: `Unapproved partner reference: "${name}"` });
      }
    }
  }
  if (input.referencedProjectNames?.length) {
    const approvedProjects = await prisma.project.findMany({ where: { status: "published", approvedAt: { not: null } } });
    const approvedNames = new Set(approvedProjects.flatMap((p) => [p.nameEn, p.nameAr]));
    for (const name of input.referencedProjectNames) {
      if (!approvedNames.has(name)) {
        flags.push({ type: "high_risk_project", lang: "both", match: name, message: `Unapproved project reference: "${name}"` });
      }
    }
  }

  // Hard delivery dates -> force legal_review.
  const dateMatchEn = input.textEn.match(DELIVERY_DATE_RE_EN);
  if (dateMatchEn) {
    flags.push({ type: "high_risk_date", lang: "en", match: dateMatchEn[0], message: `Delivery date commitment detected: "${dateMatchEn[0]}"` });
  }
  const dateMatchAr = input.textAr.match(DELIVERY_DATE_RE_AR);
  if (dateMatchAr) {
    flags.push({ type: "high_risk_date", lang: "ar", match: dateMatchAr[0], message: `Delivery date commitment detected: "${dateMatchAr[0]}"` });
  }

  // Bilingual completeness: AR must be non-empty and not identical to EN.
  if (!normalizedAr) {
    blocks.push({ type: "bilingual_incomplete", lang: "ar", match: "", message: "Arabic content is empty." });
  } else if (normalizedAr === normalizedEn) {
    blocks.push({ type: "bilingual_incomplete", lang: "ar", match: input.textAr, message: "Arabic content is identical to English (not translated)." });
  }

  return { blocks, flags };
}
