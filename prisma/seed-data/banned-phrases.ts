// Union of BRD.md §7, PROMPT.md §3, FEATURES.md §5, and the marketing
// reference docx §37 "Do Not Use" list. Editable by the `legal` role at
// /admin/content/banned-phrases after seeding.
export const BANNED_PHRASES: Array<{ phrase: string; lang: "en" | "ar"; severity: "block" | "flag" }> = [
  { phrase: "guaranteed returns", lang: "en", severity: "block" },
  { phrase: "best developer", lang: "en", severity: "block" },
  { phrase: "risk-free", lang: "en", severity: "block" },
  { phrase: "dream project", lang: "en", severity: "block" },
  { phrase: "dream investment", lang: "en", severity: "block" },
  { phrase: "once-in-a-lifetime", lang: "en", severity: "block" },
  { phrase: "once-in-a-lifetime opportunity", lang: "en", severity: "block" },
  { phrase: "fully approved", lang: "en", severity: "block" },
  { phrase: "unmatched luxury", lang: "en", severity: "block" },
  { phrase: "invest now before it is too late", lang: "en", severity: "block" },
  { phrase: "cheapest construction", lang: "en", severity: "block" },
  { phrase: "world-class", lang: "en", severity: "flag" },

  { phrase: "عوائد مضمونة", lang: "ar", severity: "block" },
  { phrase: "أفضل مطور", lang: "ar", severity: "block" },
  { phrase: "أفضل مطور عقاري", lang: "ar", severity: "block" },
  { phrase: "فرصة لا تعوض", lang: "ar", severity: "block" },
  { phrase: "استثمار بلا مخاطر", lang: "ar", severity: "block" },
  { phrase: "مشروع الأحلام", lang: "ar", severity: "block" },
  { phrase: "فخامة لا مثيل لها", lang: "ar", severity: "block" },
  { phrase: "أعلى عائد", lang: "ar", severity: "block" },
  { phrase: "مضمون الإشغال", lang: "ar", severity: "block" },
  { phrase: "أرخص تكلفة", lang: "ar", severity: "block" },
  // Brand misuse: the transliterated English name used in place of the
  // approved Arabic brand "ضيافة للتطوير".
  { phrase: "ضيافة ديفلوبمنت", lang: "ar", severity: "block" },
];
