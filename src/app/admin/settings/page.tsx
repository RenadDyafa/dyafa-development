import { prisma } from "@/lib/prisma";
import { SettingsManager } from "@/components/admin/SettingsManager";
import { LogoSettingManager } from "@/components/admin/LogoSettingManager";
import { getSiteLogos, SITE_LOGO_SETTING_KEY, SITE_LOGO_HEADER_KEY, SITE_LOGO_FOOTER_KEY } from "@/lib/settings/logo";

const LOGO_KEYS = new Set([SITE_LOGO_SETTING_KEY, SITE_LOGO_HEADER_KEY, SITE_LOGO_FOOTER_KEY]);

export default async function AdminSettingsPage() {
  const [settings, logos] = await Promise.all([
    prisma.setting.findMany({ orderBy: { key: "asc" } }),
    getSiteLogos(),
  ]);

  // The logo gets its own dedicated upload UI below, not the generic
  // raw-JSON editor every other setting uses.
  const otherSettings = settings.filter((s) => !LOGO_KEYS.has(s.key));

  return (
    <div>
      <h1 className="text-xl font-bold text-navy-900">Settings</h1>
      <p className="mt-1 text-sm text-grey-600">Feature flags, notification emails, WhatsApp number, and dictionaries used by the compliance engine.</p>

      <div className="mt-6">
        <LogoSettingManager headerLogo={logos.header} footerLogo={logos.footer} />
      </div>

      <div className="mt-6">
        <SettingsManager settings={otherSettings} />
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
