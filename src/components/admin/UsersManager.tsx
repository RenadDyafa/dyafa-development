"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type User = { id: string; name: string; email: string; role: string; isActive: boolean };
const ROLES = ["marketing", "dev_lead", "ceo", "legal", "admin"];

export function UsersManager({ users }: { users: User[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("marketing");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });
    const json = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(json.error?.message ?? "Could not create user");
      return;
    }
    setName("");
    setEmail("");
    setPassword("");
    router.refresh();
  }

  async function updateRole(id: string, newRole: string) {
    await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    router.refresh();
  }

  async function toggleActive(id: string, isActive: boolean) {
    await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    router.refresh();
  }

  return (
    <div>
      <form onSubmit={createUser} className="grid gap-3 rounded-lg border border-grey-200 bg-stone-050 p-4 sm:grid-cols-4">
        {error && <p className="col-span-full text-sm text-alert">{error}</p>}
        <input aria-label="Name" required placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="rounded-md border border-grey-200 px-3 py-2 text-sm" />
        <input aria-label="Email" required type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-md border border-grey-200 px-3 py-2 text-sm" />
        <input aria-label="Password" required type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="rounded-md border border-grey-200 px-3 py-2 text-sm" />
        <select aria-label="Role" value={role} onChange={(e) => setRole(e.target.value)} className="rounded-md border border-grey-200 px-2 py-2 text-sm">
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <button type="submit" disabled={busy} className="col-span-full rounded-md bg-navy-900 px-4 py-2 text-sm font-semibold text-stone-050 hover:bg-navy-800 sm:col-span-1">
          {busy ? "Creating…" : "Create user"}
        </button>
      </form>

      <table className="mt-6 w-full text-sm">
        <thead>
          <tr className="border-b border-grey-200 text-xs uppercase text-grey-500">
            <th className="py-2 text-start">Name</th>
            <th className="py-2 text-start">Email</th>
            <th className="py-2 text-start">Role</th>
            <th className="py-2 text-start">Active</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b border-grey-100">
              <td className="py-2">{u.name}</td>
              <td className="py-2">{u.email}</td>
              <td className="py-2">
                <select value={u.role} onChange={(e) => updateRole(u.id, e.target.value)} className="rounded-md border border-grey-200 px-2 py-1 text-xs">
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </td>
              <td className="py-2">
                <button onClick={() => toggleActive(u.id, u.isActive)} type="button" className="underline">
                  {u.isActive ? "active" : "inactive"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
