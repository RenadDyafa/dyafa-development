"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/cn";
import type { Role } from "@prisma/client";

const NAV = [
  { href: "/admin", label: "Dashboard", roles: null },
  { href: "/admin/leads", label: "Leads", roles: null },
  { href: "/admin/content/insights", label: "Insights", roles: null },
  { href: "/admin/content/home-slides", label: "Home Slider", roles: null },
  { href: "/admin/content/testimonials", label: "Testimonials", roles: null },
  { href: "/admin/content/pages", label: "Pages", roles: null },
  { href: "/admin/content/projects", label: "Projects", roles: null },
  { href: "/admin/content/opportunities", label: "Opportunities", roles: null },
  { href: "/admin/content/news", label: "News", roles: null },
  { href: "/admin/content/campaigns", label: "Campaigns", roles: null },
  { href: "/admin/content/partners", label: "Partners", roles: null },
  { href: "/admin/content/team", label: "Leadership & Team", roles: null },
  { href: "/admin/content/careers", label: "Careers", roles: null },
  { href: "/admin/content/faqs", label: "FAQs", roles: null },
  { href: "/admin/content/facts", label: "Approved Facts", roles: null },
  { href: "/admin/content/media", label: "Media", roles: null },
  { href: "/admin/content/banned-phrases", label: "Banned Phrases", roles: ["legal", "admin"] as Role[] },
  { href: "/admin/tasks", label: "Tasks", roles: null },
  { href: "/admin/tasks/board", label: "Task Board", roles: null },
  { href: "/admin/users", label: "Users", roles: ["admin"] as Role[] },
  { href: "/admin/settings", label: "Settings", roles: ["admin"] as Role[] },
];

export function AdminNav({ user }: { user: { name: string; email: string; role: Role } }) {
  const pathname = usePathname();

  return (
    <nav className="flex w-64 flex-none flex-col border-r border-grey-200 bg-stone-050">
      <div className="border-b border-grey-200 px-5 py-5">
        <p className="text-sm font-bold text-navy-900">Dyafa Development</p>
        <p className="text-xs text-grey-500">Admin</p>
      </div>
      <div className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {NAV.filter((item) => !item.roles || item.roles.includes(user.role) || user.role === "admin").map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "block rounded-md px-3 py-2 text-sm font-medium text-navy-900/80 hover:bg-stone-100",
              pathname === item.href && "bg-teal-050 text-teal-600",
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>
      <div className="border-t border-grey-200 px-5 py-4">
        <p className="text-xs font-medium text-navy-900">{user.name}</p>
        <p className="text-xs text-grey-500">{user.role}</p>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="mt-2 text-xs font-semibold text-alert hover:underline"
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}
