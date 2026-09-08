import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { AdminNav } from "@/components/admin/AdminNav";
import { montserrat } from "@/lib/fonts";
import "../globals.css";

export const metadata: Metadata = {
  title: "Dyafa Development — Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" dir="ltr" className={montserrat.variable}>
      <body className="bg-stone-050 text-navy-900">
        {session ? (
          <div className="flex min-h-screen">
            <AdminNav user={session.user} />
            <div className="flex-1 overflow-x-auto">
              <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
            </div>
          </div>
        ) : (
          <main>{children}</main>
        )}
      </body>
    </html>
  );
}
