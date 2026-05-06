import type { ProjectHealth } from "@/lib/utils";

const styles: Record<ProjectHealth, string> = {
  "On Track": "bg-green-100 text-green-800",
  "At Risk": "bg-amber-100 text-amber-800",
  Blocked: "bg-red-100 text-red-800",
  Completed: "bg-gray-100 text-gray-600",
};

export default function StatusChip({ health }: { health: ProjectHealth }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${styles[health]}`}>
      {health}
    </span>
  );
}
