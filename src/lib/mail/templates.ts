import type { Lead } from "@prisma/client";

export function leadNotificationEmail(lead: Lead) {
  const subject = `New ${lead.type.replace("_", " ")} lead: ${lead.name}`;
  const html = `
    <h2>New lead: ${escapeHtml(lead.name)}</h2>
    <table cellpadding="4">
      <tr><td><strong>Type</strong></td><td>${escapeHtml(lead.type)}</td></tr>
      <tr><td><strong>Persona</strong></td><td>${escapeHtml(lead.persona ?? "-")}</td></tr>
      <tr><td><strong>Email</strong></td><td>${escapeHtml(lead.email)}</td></tr>
      <tr><td><strong>Phone</strong></td><td>${escapeHtml(lead.phone)}</td></tr>
      <tr><td><strong>City</strong></td><td>${escapeHtml(lead.city ?? "-")}</td></tr>
      <tr><td><strong>Locale</strong></td><td>${escapeHtml(lead.locale)}</td></tr>
      <tr><td><strong>Message</strong></td><td>${escapeHtml(lead.message ?? "-")}</td></tr>
    </table>
    <p>View in admin: /admin/leads</p>
  `;
  return { subject, html };
}

export function dailyDigestEmail(counts: Record<string, number>, total: number) {
  const subject = `Dyafa Development — daily lead digest (${total} new)`;
  const rows = Object.entries(counts)
    .map(([type, count]) => `<tr><td>${escapeHtml(type)}</td><td>${count}</td></tr>`)
    .join("");
  const html = `
    <h2>Daily lead digest</h2>
    <p>${total} new lead(s) in the last 24 hours.</p>
    <table cellpadding="4"><thead><tr><th>Type</th><th>Count</th></tr></thead><tbody>${rows}</tbody></table>
  `;
  return { subject, html };
}

export function newsletterConfirmEmail(confirmUrl: string) {
  return {
    subject: "Confirm your subscription to Dyafa Development",
    html: `<p>Please confirm your subscription by clicking the link below:</p><p><a href="${confirmUrl}">${confirmUrl}</a></p>`,
  };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
