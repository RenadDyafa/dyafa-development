import { Link } from "@/lib/i18n/navigation";

export type BreadcrumbItem = { label: string; href: string };

/**
 * Visual breadcrumb trail. Pairs with src/lib/seo/breadcrumbs.ts, which
 * builds the matching BreadcrumbList JSON-LD from the same item list —
 * kept as two separate calls (not one component that emits both) since the
 * JSON-LD needs absolute URLs and page-level metadata context that this
 * purely-visual component doesn't need.
 */
export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-slate">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, i) => (
          <li key={item.href} className="flex items-center gap-2">
            {i > 0 && (
              <span aria-hidden="true" className="text-grey-600">
                /
              </span>
            )}
            {i === items.length - 1 ? (
              <span aria-current="page" className="font-medium text-navy-900">
                {item.label}
              </span>
            ) : (
              <Link href={item.href} className="hover:text-teal-600">
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
