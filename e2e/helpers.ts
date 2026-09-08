import type { Page } from "@playwright/test";

export const ADMIN_EMAIL = process.env.ADMIN_SEED_EMAIL ?? "admin@dyafa.com";
export const ADMIN_PASSWORD = process.env.ADMIN_SEED_PASSWORD ?? "ChangeMe123!";

export async function loginAsAdmin(page: Page) {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(ADMIN_EMAIL);
  await page.getByLabel("Password").fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL("**/admin");
}

const WIZARD_LABELS = {
  en: {
    next: "Next",
    submit: "Submit for review",
    fullName: "Full name *",
    role: "Role *",
    email: "Email *",
    phone: "Phone / WhatsApp *",
    city: "City *",
    consent: /I consent to Dyafa Development/,
  },
  ar: {
    next: "التالي",
    submit: "إرسال للمراجعة",
    fullName: "الاسم الكامل *",
    role: "الصفة *",
    email: "البريد الإلكتروني *",
    phone: "الجوال / واتساب *",
    city: "المدينة *",
    consent: /أوافق على معالجة ضيافة للتطوير/,
  },
} as const;

// Drives the 5-step Submit Your Site wizard end to end: skips the optional
// intent step, fills the required contact + opportunity fields, skips the
// optional context step, then checks consent and submits.
export async function fillSiteReviewWizard(
  page: Page,
  locale: "en" | "ar",
  data: { name: string; role: string; email: string; phone: string; city: string },
) {
  const l = WIZARD_LABELS[locale];

  await page.getByRole("button", { name: l.next }).click(); // step 0: intent (optional)

  await page.getByLabel(l.fullName).fill(data.name);
  await page.getByLabel(l.role).selectOption(data.role);
  await page.getByLabel(l.email).fill(data.email);
  await page.getByLabel(l.phone).fill(data.phone);
  await page.getByRole("button", { name: l.next }).click(); // step 1: contact

  await page.getByLabel(l.city).fill(data.city);
  await page.getByRole("button", { name: l.next }).click(); // step 2: opportunity

  await page.getByRole("button", { name: l.next }).click(); // step 3: context (optional)

  await page.getByLabel(l.consent).check();
  await page.getByRole("button", { name: l.submit }).click(); // step 4: documents & consent
}
