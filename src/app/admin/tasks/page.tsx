import Link from "next/link";
import { TaskList } from "@/components/admin/TaskList";

export default function AdminTasksPage() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-navy-900">Tasks</h1>
        <Link href="/admin/tasks/board" className="text-sm font-semibold text-teal-600 hover:underline">
          View board →
        </Link>
      </div>
      <div className="mt-6">
        <TaskList />
      </div>
    </div>
  );
}
