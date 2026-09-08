"use client";

import { useEffect, useState } from "react";

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueAt: string | null;
  assignee: { name: string } | null;
};

const STATUSES = ["todo", "in_progress", "blocked", "done", "cancelled"];
const PRIORITIES = ["low", "medium", "high", "urgent"];

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch("/api/admin/tasks");
    const json = await res.json();
    setTasks(json.data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function createTask(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    await fetch("/api/admin/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, priority }),
    });
    setTitle("");
    load();
  }

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/admin/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  if (loading) return <p className="text-sm text-grey-500">Loading…</p>;

  return (
    <div>
      <form onSubmit={createTask} className="flex gap-2">
        <input
          aria-label="New task"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New task…"
          className="flex-1 rounded-md border border-grey-200 px-3 py-2 text-sm"
        />
        <select aria-label="Priority" value={priority} onChange={(e) => setPriority(e.target.value)} className="rounded-md border border-grey-200 px-2 py-2 text-sm">
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded-md bg-navy-900 px-4 py-2 text-sm font-semibold text-stone-050 hover:bg-navy-800">
          Add
        </button>
      </form>

      <ul className="mt-6 space-y-2">
        {tasks.map((task) => (
          <li key={task.id} id={task.id} className="flex items-center gap-3 rounded-md border border-grey-200 bg-stone-050 p-3 text-sm">
            <span className="flex-1">
              <span className="font-medium text-navy-900">{task.title}</span>
              {task.assignee && <span className="ms-2 text-xs text-grey-500">· {task.assignee.name}</span>}
              {task.dueAt && <span className="ms-2 text-xs text-grey-500">· due {task.dueAt.slice(0, 10)}</span>}
            </span>
            <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs">{task.priority}</span>
            <select value={task.status} onChange={(e) => updateStatus(task.id, e.target.value)} className="rounded-md border border-grey-200 px-2 py-1 text-xs">
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </li>
        ))}
        {tasks.length === 0 && <p className="text-sm text-grey-500">No tasks yet.</p>}
      </ul>
    </div>
  );
}
