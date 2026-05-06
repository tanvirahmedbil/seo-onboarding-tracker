import { clientTypeLabel } from "@/lib/utils";
import type { ClientType } from "@/lib/types";

const colors: Record<ClientType, string> = {
  new_site: "bg-blue-100 text-blue-800",
  no_prior_seo: "bg-purple-100 text-purple-800",
  prior_seo: "bg-indigo-100 text-indigo-800",
};

export default function TypeBadge({ type }: { type: ClientType }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors[type]}`}>
      {clientTypeLabel(type)}
    </span>
  );
}
