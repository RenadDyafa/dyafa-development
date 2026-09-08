export function EmptyState({ title, body }: { title: string; body?: string }) {
  return (
    <div className="rounded-lg border border-dashed border-grey-200 px-6 py-12 text-center">
      <p className="text-sm font-semibold text-navy-900">{title}</p>
      {body && <p className="mt-2 text-sm text-slate">{body}</p>}
    </div>
  );
}
