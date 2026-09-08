// Human-readable reference number shown to the visitor on the site-review
// success screen (design.md §10A/§11). Derived from the lead's own cuid so
// it needs no extra uniqueness check - DYA-<8 uppercase hex chars taken
// from the id's own characters>.
export function buildLeadReferenceNumber(leadId: string): string {
  const hex = leadId.replace(/[^a-z0-9]/gi, "").slice(-8).toUpperCase().padStart(8, "0");
  return `DYA-${hex}`;
}
