import { NewNewsForm } from "@/components/admin/NewNewsForm";

export default function NewNewsPage() {
  return (
    <div>
      <h1 className="text-xl font-bold text-navy-900">New news item</h1>
      <div className="mt-6 max-w-lg">
        <NewNewsForm />
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
