import Link from "next/link";
import { TaskBoard } from "@/components/admin/TaskBoard";

export default function AdminTaskBoardPage() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-navy-900">Task board</h1>
        <Link href="/admin/tasks" className="text-sm font-semibold text-teal-600 hover:underline">
          View list →
        </Link>
      </div>
      <p className="mt-1 text-sm text-grey-600">
        Real to-do cards plus a live read-aggregation of content-workflow and lead-pipeline states — resolving the underlying item clears its card.
      </p>
      <div className="mt-6">
        <TaskBoard />
      </div>
    </div>
  );
}
