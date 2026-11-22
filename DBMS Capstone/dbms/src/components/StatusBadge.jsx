
const styles = {
  Active: "bg-orange-50 text-orange-700",
  Inactive: "bg-gray-100 text-gray-600",
  Paid: "bg-orange-50 text-orange-700",
  Pending: "bg-amber-50 text-amber-700",
  Overdue: "bg-rose-50 text-rose-700",
  Open: "bg-sky-50 text-sky-700",
  "In Progress": "bg-orange-50 text-orange-700",
  Resolved: "bg-orange-50 text-orange-700",
  Available: "bg-orange-50 text-orange-700",
  Occupied: "bg-rose-50 text-rose-700",
  Reserved: "bg-amber-50 text-amber-700",
  High: "bg-rose-50 text-rose-700",
  Medium: "bg-amber-50 text-amber-700",
  Low: "bg-orange-50 text-orange-700",
  Owner: "bg-orange-50 text-orange-700",
  Tenant: "bg-sky-50 text-sky-700",
  Completed: "bg-orange-50 text-orange-700",
  "Under Maintenance": "bg-amber-50 text-amber-700",
};

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${
        styles[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
}
