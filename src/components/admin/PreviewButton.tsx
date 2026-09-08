export function PreviewButton({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-md border border-grey-200 px-3 py-1.5 text-xs font-semibold text-navy-900 hover:border-teal-500"
    >
      Preview draft ↗
    </a>
  );
}
