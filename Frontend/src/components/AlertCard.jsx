import { AlertTriangle, Bell, X } from "lucide-react";

export default function AlertCard({ alert, onRemove }) {
  return (
    <div className="rounded-xl2 bg-white shadow-card p-4 flex items-start gap-3 animate-enter">
      {/* Alert Icon */}
      <span
        className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${
          alert.severity === "high"
            ? "bg-red-50 text-red-500"
            : "bg-sun-300/30 text-sun-500"
        }`}
      >
        <AlertTriangle size={16} />
      </span>

      {/* Alert Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-ink-800">
          {alert.title}
        </p>

        <p className="text-xs text-ink-400 mt-0.5">
          {alert.detail}
        </p>

        <p className="text-[11px] text-ink-400 mt-1.5 flex items-center gap-1">
          <Bell size={10} />
          {alert.time}
        </p>
      </div>

      {/* Remove Alert */}
      <button
        type="button"
        onClick={() => onRemove(alert.id)}
        className="h-7 w-7 rounded-full flex items-center justify-center shrink-0 text-ink-400 hover:bg-red-50 hover:text-red-500 transition-colors"
        aria-label="Remove alert"
        title="Remove alert"
      >
        <X size={15} />
      </button>
    </div>
  );
}