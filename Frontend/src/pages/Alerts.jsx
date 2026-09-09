import { Trash2 } from "lucide-react";

import { useApp } from "../context/AppContext";

import EmptyState from "../components/EmptyState";

import AlertCard from "../components/AlertCard";

export default function Alerts() {
  const {
    weatherAlerts,
    removeWeatherAlert,
    clearWeatherAlerts,
    disasterNotifications,
    markDisasterNotificationRead,
    removeDisasterNotification,
    clearDisasterNotifications,
  } = useApp();

  const totalAlerts =
    weatherAlerts.length + disasterNotifications.length;

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
              Clear Weather
            </button>
          )}

          {disasterNotifications.length > 0 && (
            <button
              type="button"
              onClick={clearDisasterNotifications}
              className="flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-xl2 transition-colors"
            >
              <Trash2 size={14} />
              Clear Disaster
            </button>
          )}
        </div>
      </div>

      {totalAlerts === 0 ? (
        <EmptyState
          icon="🔔"
          title="No alerts"
          message="You'll be notified here about severe weather near you or your friends."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {disasterNotifications.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-sm font-bold text-red-600">
                Disaster Alerts
              </h2>

              {disasterNotifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => {
                    if (!notification.read) {
                      markDisasterNotificationRead(notification.id);
                    }
                  }}
                  className={`rounded-2xl border p-4 transition-colors cursor-pointer ${
                    notification.read
                      ? "bg-white border-gray-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">⚠️</span>

                        <h3 className="font-bold text-ink-900">
                          {notification.title || "Disaster Alert"}
                        </h3>

                        {!notification.read && (
                          <span className="text-[10px] font-bold uppercase tracking-wide text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                            New
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-ink-700">
                        {notification.message}
                      </p>

                      <div className="flex flex-wrap gap-2 mt-3 text-xs text-ink-500">
                        {notification.locationName && (
                          <span>
                            📍 {notification.locationName}
                          </span>
                        )}

                        {typeof notification.distanceKm === "number" && (
                          <span>
                            • {notification.distanceKm.toFixed(1)} km away
                          </span>
                        )}

                        {notification.severity && (
                          <span className="capitalize">
                            • {notification.severity} severity
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        removeDisasterNotification(notification.id);
                      }}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      aria-label="Remove disaster notification"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {weatherAlerts.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-sm font-bold text-ink-700">
                Weather Alerts
              </h2>

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
      )}
    </div>
  );
}

