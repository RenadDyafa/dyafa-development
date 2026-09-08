import { NewOpportunityForm } from "@/components/admin/NewOpportunityForm";

export default function NewOpportunityPage() {
  return (
    <div>
      <h1 className="text-xl font-bold text-navy-900">New opportunity</h1>
      <div className="mt-6 max-w-lg">
        <NewOpportunityForm />
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
