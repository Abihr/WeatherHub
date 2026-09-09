
import { Trash2 } from "lucide-react";

import { useApp } from "../context/AppContext";

import EmptyState from "../components/EmptyState";

import AlertCard from "../components/AlertCard";

export default function Alerts() {
  const {
    weatherAlerts,
    removeWeatherAlert,
    clearWeatherAlerts,
  } = useApp();

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 pb-28 md:pb-10 flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl md:text-2xl font-display font-extrabold text-ink-900">
          Weather Alerts
        </h1>

        <div className="flex items-center gap-2">
          {weatherAlerts.length > 0 && (
            <button
              type="button"
              onClick={clearWeatherAlerts}
              className="flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-xl2 transition-colors"
            >
              <Trash2 size={14} />
              Clear All
            </button>
          )}
        </div>
      </div>

      {weatherAlerts.length === 0 ? (
        <EmptyState
          icon="🔔"
          title="No alerts"
          message="You'll be notified here about severe weather near you or your friends."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {weatherAlerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onRemove={removeWeatherAlert}
            />
          ))}
        </div>
      )}
    </div>
  );
}

