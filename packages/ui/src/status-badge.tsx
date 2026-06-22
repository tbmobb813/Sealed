const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-800",
  SENT: "bg-blue-100 text-blue-800",
  VIEWED: "bg-indigo-100 text-indigo-800",
  ACCEPTED: "bg-green-100 text-green-800",
  SIGNED: "bg-green-100 text-green-800",
  PAID: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  DECLINED: "bg-red-100 text-red-800",
  EXPIRED: "bg-yellow-100 text-yellow-800",
  OVERDUE: "bg-red-100 text-red-800",
  PARTIALLY_PAID: "bg-amber-100 text-amber-800",
  VOID: "bg-gray-100 text-gray-600",
  CANCELED: "bg-gray-100 text-gray-600",
  PENDING: "bg-yellow-100 text-yellow-800",
  SUCCEEDED: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
  REFUNDED: "bg-gray-100 text-gray-600",
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const colorClass = statusColors[status] ?? "bg-gray-100 text-gray-800";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClass} ${className}`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}
