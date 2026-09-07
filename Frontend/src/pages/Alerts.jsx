import { AlertTriangle, Bell } from "lucide-react";
import { useApp } from "../context/AppContext";
import EmptyState from "../components/EmptyState";

export default function Alerts() {
  const { weatherAlerts } = useApp();

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 pb-28 md:pb-10 flex flex-col gap-5">
      <h1 className="text-xl md:text-2xl font-display font-extrabold text-ink-900">
        Weather Alerts
      </h1>

      {weatherAlerts.length === 0 ? (
        <EmptyState
          icon="🔔"
          title="No alerts"
          message="You'll be notified here about severe weather near you or your friends."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {weatherAlerts.map((a) => (
            <div
              key={a.id}
              className="rounded-xl2 bg-white shadow-card p-4 flex items-start gap-3 animate-enter"
            >
              <span
                className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${
                  a.severity === "high"
                    ? "bg-red-50 text-red-500"
                    : "bg-sun-300/30 text-sun-500"
                }`}
              >
                <AlertTriangle size={16} />
              </span>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ink-800">
                  {a.title}
                </p>

                <p className="text-xs text-ink-400 mt-0.5">
                  {a.detail}
                </p>

                <p className="text-[11px] text-ink-400 mt-1.5 flex items-center gap-1">
                  <Bell size={10} />
                  {a.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}