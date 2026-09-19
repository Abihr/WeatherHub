import { useEffect, useMemo, useState } from "react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  useMap,
  LayersControl,
  WMSTileLayer,
  ZoomControl,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

import {
  X,
  MapPin,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from "lucide-react";

import { weatherIcon } from "../data/mockData";

/* =========================================================
   CONFIG
========================================================= */

const WEATHER_BACKEND_URL = "https://weathergpt-idq6.onrender.com";

const DEFAULT_CENTER = [22.5726, 88.3639];
const DEFAULT_ZOOM = 9;

const FRIEND_RADIUS_METERS = 2000;

const IMD_ALERT_REFRESH_MS = 5 * 60 * 1000;
const SATELLITE_REFRESH_MS = 15 * 60 * 1000;

/* =========================================================
   MAP COLORS
========================================================= */

const MAP_COLORS = {
  user: "#3874B8",
  friend: "#4A90D9",
  circle: "#4A90D9",
};

/* =========================================================
   GET COORDINATES
========================================================= */

function getCoordinates(item) {
  if (!item) return null;

  if (
    item.location &&
    typeof item.location.lat === "number" &&
    typeof item.location.lng === "number"
  ) {
    return {
      lat: item.location.lat,
      lng: item.location.lng,
    };
  }

  if (typeof item.latitude === "number" && typeof item.longitude === "number") {
    return {
      lat: item.latitude,
      lng: item.longitude,
    };
  }

  return null;
}

/* =========================================================
   LOCATION TEXT
========================================================= */

function getLocationText(item) {
  if (!item) return "Unknown location";

  if (typeof item.location === "string" && item.location.trim()) {
    return item.location;
  }

  if (
    item.location &&
    typeof item.location.city === "string" &&
    item.location.city.trim()
  ) {
    return item.location.city;
  }

  if (
    item.weather?.locationName &&
    typeof item.weather.locationName === "string"
  ) {
    return item.weather.locationName;
  }

  const coordinates = getCoordinates(item);

  if (coordinates) {
    return `${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)}`;
  }

  return "Unknown location";
}

/* =========================================================
   TEMPERATURE
========================================================= */

function getTemperature(weather) {
  if (!weather) return null;

  if (typeof weather.temperature === "number") {
    return weather.temperature;
  }

  if (typeof weather.temp === "number") {
    return weather.temp;
  }

  return null;
}

/* =========================================================
   WEATHER UPDATED TIME
========================================================= */

function formatWeatherUpdatedAt(timestamp) {
  if (!timestamp) return null;

  try {
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    const diffMs = Date.now() - date.getTime();

    if (diffMs < 0) return "just now";

    const diffMinutes = Math.floor(diffMs / 60000);

    if (diffMinutes < 1) {
      return "just now";
    }

    if (diffMinutes === 1) {
      return "1 minute ago";
    }

    if (diffMinutes < 60) {
      return `${diffMinutes} minutes ago`;
    }

    const diffHours = Math.floor(diffMinutes / 60);

    if (diffHours === 1) {
      return "1 hour ago";
    }

    if (diffHours < 24) {
      return `${diffHours} hours ago`;
    }

    return date.toLocaleString([], {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return null;
  }
}

/* =========================================================
   PRIVACY-SAFE FRIEND LOCATION
========================================================= */

function getApproximateFriendCenter(coordinates, friendId) {
  if (!coordinates) return null;

  const seedString = String(friendId || "friend");

  let seed = 0;

  for (let i = 0; i < seedString.length; i++) {
    seed = (seed * 31 + seedString.charCodeAt(i)) >>> 0;
  }

  const randomLat = ((seed % 1000) / 1000) * 2 - 1;

  const randomLng = (((seed >> 10) % 1000) / 1000) * 2 - 1;

  const maxOffsetKm = 1.5;

  const latOffset = (randomLat * maxOffsetKm) / 111;

  const longitudeFactor = Math.cos((coordinates.lat * Math.PI) / 180);

  const lngOffset = (randomLng * maxOffsetKm) / (111 * longitudeFactor);

  return {
    lat: coordinates.lat + latOffset,
    lng: coordinates.lng + lngOffset,
  };
}

/* =========================================================
   CUSTOM MAP PIN
========================================================= */

function createMapPin(label, type = "friend") {
  const background = type === "you" ? MAP_COLORS.user : MAP_COLORS.friend;

  return L.divIcon({
    className: "weather-map-pin",

    html: `
      <div
        style="
          background:${background};
          color:white;
          width:38px;
          height:38px;
          border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          display:flex;
          align-items:center;
          justify-content:center;
          box-shadow:0 6px 14px rgba(34,73,111,0.35);
          border:2px solid white;
        "
      >
        <span
          style="
            transform:rotate(45deg);
            font-size:16px;
            line-height:1;
          "
        >
          ${label}
        </span>
      </div>
    `,

    iconSize: [38, 38],
    iconAnchor: [19, 36],
  });
}

/* =========================================================
   FLY TO SELECTED LOCATION
========================================================= */

function FlyToLocation({ position }) {
  const map = useMap();

  useEffect(() => {
    if (!position) return;

    const currentZoom = map.getZoom();

    map.setView(position, currentZoom < 8 ? 9 : currentZoom, {
      animate: true,
      duration: 0.6,
    });
  }, [map, position]);

  return null;
}

/* =========================================================
   ALERT SEVERITY
========================================================= */

function getAlertSeverityClass(severity) {
  switch (String(severity || "").toLowerCase()) {
    case "extreme":
      return {
        badge: "bg-red-100 text-red-700",
        border: "border-red-200",
        icon: "text-red-600",
      };

    case "severe":
      return {
        badge: "bg-orange-100 text-orange-700",
        border: "border-orange-200",
        icon: "text-orange-600",
      };

    case "moderate":
      return {
        badge: "bg-yellow-100 text-yellow-700",
        border: "border-yellow-200",
        icon: "text-yellow-600",
      };

    case "minor":
      return {
        badge: "bg-blue-100 text-blue-700",
        border: "border-blue-200",
        icon: "text-blue-600",
      };

    default:
      return {
        badge: "bg-gray-100 text-gray-700",
        border: "border-gray-200",
        icon: "text-gray-500",
      };
  }
}

/* =========================================================
   ALERT EXPIRY
========================================================= */

function formatAlertExpiry(expires) {
  if (!expires) {
    return "No expiry specified";
  }

  const date = new Date(expires);

  if (Number.isNaN(date.getTime())) {
    return expires;
  }

  return date.toLocaleString([], {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* =========================================================
   IMD ALERT CARD
========================================================= */

function IMDAlertCard({ alert }) {
  const [expanded, setExpanded] = useState(false);

  const severity = getAlertSeverityClass(alert.severity);

  return (
    <div
      className={`
        border
        ${severity.border}
        rounded-xl
        p-3
        bg-white
      `}
    >
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="
          w-full
          text-left
          flex
          items-start
          gap-2.5
        "
      >
        <AlertTriangle
          size={17}
          className={`
            mt-0.5
            shrink-0
            ${severity.icon}
          `}
        />

        <div className="flex-1 min-w-0">
          <div
            className="
              flex
              items-start
              justify-between
              gap-2
            "
          >
            <p
              className="
                text-xs
                font-semibold
                text-ink-800
                leading-snug
              "
            >
              {alert.event || alert.headline || "Weather Alert"}
            </p>

            <span
              className={`
                shrink-0
                text-[10px]
                font-semibold
                px-2
                py-0.5
                rounded-full
                ${severity.badge}
              `}
            >
              {alert.severity || "Unknown"}
            </span>
          </div>

          {alert.headline && (
            <p
              className="
                text-xs
                text-ink-500
                mt-1
                leading-snug
              "
            >
              {alert.headline}
            </p>
          )}

          {alert.area && (
            <p
              className="
                text-[11px]
                text-ink-400
                mt-1.5
              "
            >
              📍 {alert.area}
            </p>
          )}
        </div>

        {expanded ? (
          <ChevronUp
            size={15}
            className="
              text-ink-400
              shrink-0
            "
          />
        ) : (
          <ChevronDown
            size={15}
            className="
              text-ink-400
              shrink-0
            "
          />
        )}
      </button>

      {expanded && (
        <div
          className="
            mt-3
            pt-3
            border-t
            border-ink-100
            space-y-3
          "
        >
          {alert.description && (
            <div>
              <p
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-wide
                  text-ink-400
                "
              >
                Description
              </p>

              <p
                className="
                  text-xs
                  text-ink-600
                  mt-1
                  leading-relaxed
                "
              >
                {alert.description}
              </p>
            </div>
          )}

          <div
            className="
              grid
              grid-cols-2
              gap-3
            "
          >
            <div>
              <p
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-wide
                  text-ink-400
                "
              >
                Urgency
              </p>

              <p
                className="
                  text-xs
                  text-ink-700
                  mt-1
                "
              >
                {alert.urgency || "Not specified"}
              </p>
            </div>

            <div>
              <p
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-wide
                  text-ink-400
                "
              >
                Certainty
              </p>

              <p
                className="
                  text-xs
                  text-ink-700
                  mt-1
                "
              >
                {alert.certainty || "Not specified"}
              </p>
            </div>
          </div>

          <div>
            <p
              className="
                text-[10px]
                font-semibold
                uppercase
                tracking-wide
                text-ink-400
              "
            >
              Expires
            </p>

            <p
              className="
                text-xs
                text-ink-700
                mt-1
              "
            >
              {formatAlertExpiry(alert.expires)}
            </p>
          </div>

          {alert.instruction && (
            <div>
              <p
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-wide
                  text-ink-400
                "
              >
                Instructions
              </p>

              <p
                className="
                  text-xs
                  text-ink-600
                  mt-1
                  leading-relaxed
                "
              >
                {alert.instruction}
              </p>
            </div>
          )}

          <p
            className="
              text-[10px]
              text-ink-400
            "
          >
            Source: India Meteorological Department
          </p>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   IMD ALERT PANEL
========================================================= */

function IMDAlertPanel({ alerts, loading, error, onRefresh, onClose }) {
  return (
    <div
      className="
        absolute
        top-3
        right-3
        z-[450]
        w-[calc(100%-24px)]
        sm:w-[390px]
        max-h-[calc(100%-24px)]
        bg-white/98
        backdrop-blur-md
        rounded-xl
        shadow-pop
        overflow-hidden
        flex
        flex-col
      "
    >
      {/* Header */}
      <div
        className="
          px-4
          py-3
          border-b
          border-ink-100
          flex
          items-center
          justify-between
          gap-3
        "
      >
        <div
          className="
            flex
            items-center
            gap-2
          "
        >
          <div
            className="
              h-8
              w-8
              rounded-full
              bg-orange-100
              text-orange-600
              flex
              items-center
              justify-center
            "
          >
            <AlertTriangle size={16} />
          </div>

          <div>
            <p
              className="
                text-sm
                font-semibold
                text-ink-800
              "
            >
              IMD Weather Alerts
            </p>

            <p
              className="
                text-[10px]
                text-ink-400
              "
            >
              India Meteorological Department
            </p>
          </div>
        </div>

        <div
          className="
            flex
            items-center
            gap-1
          "
        >
          <button
            type="button"
            title="Refresh alerts"
            onClick={onRefresh}
            disabled={loading}
            className="
              h-7
              w-7
              rounded-full
              flex
              items-center
              justify-center
              text-ink-400
              hover:bg-ink-50
              hover:text-ink-700
              disabled:opacity-50
            "
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="
              h-7
              w-7
              rounded-full
              flex
              items-center
              justify-center
              text-ink-400
              hover:bg-ink-50
              hover:text-ink-700
            "
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div
        className="
          overflow-y-auto
          p-3
          space-y-2
        "
      >
        {loading && (
          <div
            className="
              py-8
              text-center
              text-xs
              text-ink-400
            "
          >
            <RefreshCw
              size={18}
              className="
                animate-spin
                mx-auto
                mb-2
              "
            />
            Loading official IMD alerts...
          </div>
        )}

        {!loading && error && (
          <div
            className="
              rounded-xl
              bg-red-50
              border
              border-red-100
              p-3
              text-xs
              text-red-700
            "
          >
            <p className="font-semibold">Unable to load IMD alerts</p>

            <p className="mt-1">{error}</p>

            <button
              type="button"
              onClick={onRefresh}
              className="
                mt-2
                font-semibold
                underline
              "
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && alerts.length === 0 && (
          <div
            className="
                py-8
                text-center
              "
          >
            <div
              className="
                  h-10
                  w-10
                  rounded-full
                  bg-green-100
                  text-green-600
                  flex
                  items-center
                  justify-center
                  mx-auto
                  mb-2
                "
            >
              ✓
            </div>

            <p
              className="
                  text-sm
                  font-semibold
                  text-ink-700
                "
            >
              No active alerts
            </p>

            <p
              className="
                  text-xs
                  text-ink-400
                  mt-1
                "
            >
              No active IMD CAP alerts were returned.
            </p>
          </div>
        )}

        {!loading && !error && alerts.length > 0 && (
          <>
            <p
              className="
                  px-1
                  pb-1
                  text-[10px]
                  text-ink-400
                "
            >
              {alerts.length} active alert
              {alerts.length !== 1 ? "s" : ""} · Official IMD data
            </p>

            {alerts.map((alert, index) => (
              <IMDAlertCard
                key={alert.identifier || alert.id || index}
                alert={alert}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   IMD ALERT BUTTON
========================================================= */

function IMDAlertButton({ alerts, loading, onClick }) {
  return (
    <div
      className="
        absolute
        top-14
        right-3
        z-[400]
      "
    >
      <button
        type="button"
        onClick={onClick}
        className="
          bg-white/95
          backdrop-blur-sm
          text-xs
          font-medium
          text-ink-600
          px-3
          py-1.5
          rounded-full
          shadow-card
          flex
          items-center
          gap-1.5
          hover:bg-white
          transition
          active:scale-95
        "
      >
        <AlertTriangle
          size={13}
          className={alerts.length > 0 ? "text-orange-500" : "text-ink-400"}
        />

        <span>IMD</span>

        <span
          className="
            min-w-[18px]
            h-[18px]
            px-1
            rounded-full
            bg-orange-100
            text-orange-700
            text-[10px]
            font-bold
            flex
            items-center
            justify-center
          "
        >
          {loading ? "…" : alerts.length}
        </span>
      </button>
    </div>
  );
}

/* =========================================================
   SELECTED LOCATION CARD
========================================================= */

function SelectedLocationCard({ selected, onClose }) {
  if (!selected) return null;

  const temperature = getTemperature(selected.weather);

  const weatherIsVisible =
    selected.weather && (selected.isYou || selected.weatherSharing);

  const initials = selected.isYou
    ? "You"
    : selected.name
      ? selected.name
          .split(" ")
          .map((name) => name[0])
          .slice(0, 2)
          .join("")
          .toUpperCase()
      : "U";

  return (
    <div
      className="
        absolute
        bottom-3
        left-3
        right-3
        z-[400]
        bg-white
        rounded-xl
        shadow-pop
        p-4
        flex
        items-start
        gap-3
      "
    >
      {/* Avatar */}
      <div
        className="
          h-10
          w-10
          rounded-full
          bg-sky-100
          text-sky-700
          font-semibold
          flex
          items-center
          justify-center
          text-sm
          shrink-0
        "
      >
        {initials}
      </div>

      {/* Information */}
      <div
        className="
          flex-1
          min-w-0
        "
      >
        <p
          className="
            text-sm
            font-semibold
            text-ink-800
          "
        >
          {selected.isYou ? "Your Location" : selected.name || "User"}
        </p>

        <p
          className="
            text-xs
            text-ink-400
            flex
            items-center
            gap-1
          "
        >
          <MapPin size={11} />

          {selected.isYou
            ? getLocationText(selected)
            : "Approximate location · within 2 km"}
        </p>

        {weatherIsVisible ? (
          <>
            <p className="text-sm mt-1.5">
              {weatherIcon?.[selected.weather.icon] || "🌤️"}{" "}
              {temperature !== null ? `${temperature}°C` : "--"}
              {" · "}
              {selected.weather.condition || "Weather unavailable"}
            </p>

            {selected.weatherUpdatedAt && (
              <p
                className="
                  text-xs
                  text-ink-400
                  mt-1
                "
              >
                🕐 Updated {formatWeatherUpdatedAt(selected.weatherUpdatedAt)}
              </p>
            )}
          </>
        ) : (
          <p
            className="
              text-xs
              mt-1.5
              text-ink-400
            "
          >
            🔒 Weather not shared
          </p>
        )}
      </div>

      {/* Close */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close location details"
        className="
          text-ink-400
          hover:text-ink-700
          transition
          shrink-0
        "
      >
        <X size={16} />
      </button>
    </div>
  );
}

/* =========================================================
   MAP LAYERS
========================================================= */

function WeatherMapLayers({ satelliteWmsUrl }) {
  return (
    <LayersControl position="topleft">
      {/* Map */}
      <LayersControl.BaseLayer
        checked
        name="🗺️ Map"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </LayersControl.BaseLayer>

      {/* Satellite */}
      <LayersControl.BaseLayer
        name="🛰️ Satellite"
      >
        <TileLayer
          attribution="© Esri"
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        />
      </LayersControl.BaseLayer>

      {/* Precipitation */}
      <LayersControl.Overlay
        name="🌧️ Precipitation"
      >
        <TileLayer
          attribution="© OpenWeather"
          url={`${WEATHER_BACKEND_URL}/api/weather-map/precipitation_new/{z}/{x}/{y}.png`}
          opacity={0.6}
        />
      </LayersControl.Overlay>

      {/* IMD Satellite */}
      <LayersControl.Overlay
        name="🇮🇳 IMD Satellite — TIR1"
      >
        {satelliteWmsUrl && (
          <WMSTileLayer
            url={satelliteWmsUrl}
            layers="IMG_TIR1"
            format="image/png"
            transparent={true}
            version="1.3.0"
            opacity={0.75}
            attribution="© MOSDAC / ISRO"
          />
        )}
      </LayersControl.Overlay>
    </LayersControl>
  );
}
/* =========================================================
   USER MARKER
========================================================= */

function UserMarker({ user, coordinates, onSelect }) {
  if (!coordinates) return null;

  return (
    <>
      <Marker
        position={[coordinates.lat, coordinates.lng]}
        icon={createMapPin("👤", "you")}
        eventHandlers={{
          click: () =>
            onSelect({
              ...user,
              isYou: true,
            }),
        }}
      />

      {user.locationSharing !== "exact" && (
        <Circle
          center={[coordinates.lat, coordinates.lng]}
          radius={4000}
          pathOptions={{
            color: MAP_COLORS.circle,
            fillOpacity: 0.08,
            weight: 1,
          }}
        />
      )}
    </>
  );
}

/* =========================================================
   FRIEND MARKER
========================================================= */

function FriendMarker({ friend, onSelect }) {
  const coordinates = getCoordinates(friend);

  if (!coordinates) return null;

  const approximateCenter = getApproximateFriendCenter(coordinates, friend.id);

  if (!approximateCenter) return null;

  return (
    <div>
      <Circle
        center={[approximateCenter.lat, approximateCenter.lng]}
        radius={FRIEND_RADIUS_METERS}
        pathOptions={{
          color: MAP_COLORS.circle,
          fillOpacity: 0.08,
          weight: 1,
        }}
      />

      <Marker
        position={[approximateCenter.lat, approximateCenter.lng]}
        icon={createMapPin("👥", "friend")}
        eventHandlers={{
          click: () =>
            onSelect({
              ...friend,
              latitude: coordinates.lat,
              longitude: coordinates.lng,
              approximateLatitude: approximateCenter.lat,
              approximateLongitude: approximateCenter.lng,
            }),
        }}
      />
    </div>
  );
}

/* =========================================================
   MAIN WEATHER MAP
========================================================= */

export default function WeatherMap({ user, friends = [] }) {
  const [selected, setSelected] = useState(null);

  const [satelliteWmsUrl, setSatelliteWmsUrl] = useState(null);

  const [imdAlerts, setImdAlerts] = useState([]);

  const [imdAlertsLoading, setImdAlertsLoading] = useState(true);

  const [imdAlertsError, setImdAlertsError] = useState(null);

  const [showImdAlerts, setShowImdAlerts] = useState(false);

  /* =======================================================
     USER COORDINATES
  ======================================================= */

  const userCoordinates = useMemo(() => getCoordinates(user), [user]);

  const center = userCoordinates
    ? [userCoordinates.lat, userCoordinates.lng]
    : DEFAULT_CENTER;

  /* =======================================================
     VISIBLE FRIENDS
  ======================================================= */

  const visibleFriends = useMemo(() => {
    return friends.filter((friend) => {
      const coordinates = getCoordinates(friend);

      return (
        coordinates &&
        Number.isFinite(coordinates.lat) &&
        Number.isFinite(coordinates.lng)
      );
    });
  }, [friends]);

  /* =======================================================
     SATELLITE FETCH
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    async function fetchLatestSatellite() {
      try {
        const response = await fetch(
          `${WEATHER_BACKEND_URL}/api/imd-satellite/latest`,
        );

        if (!response.ok) {
          throw new Error(`Satellite request failed: ${response.status}`);
        }

        const data = await response.json();

        if (mounted && data.success && data.wmsUrl) {
          setSatelliteWmsUrl(data.wmsUrl);
        }
      } catch (error) {
        console.error("Failed to fetch IMD satellite:", error);
      }
    }

    fetchLatestSatellite();

    const interval = setInterval(fetchLatestSatellite, SATELLITE_REFRESH_MS);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  /* =======================================================
     IMD ALERT FETCH
  ======================================================= */

  async function fetchIMDAlerts() {
    try {
      setImdAlertsError(null);
      setImdAlertsLoading(true);

      const response = await fetch(`${WEATHER_BACKEND_URL}/api/imd-alerts`);

      if (!response.ok) {
        throw new Error(`IMD alert request failed: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Unable to retrieve IMD alerts.");
      }

      setImdAlerts(Array.isArray(data.alerts) ? data.alerts : []);
    } catch (error) {
      console.error("Failed to fetch IMD alerts:", error);

      setImdAlertsError(error.message || "Unable to load IMD alerts.");
    } finally {
      setImdAlertsLoading(false);
    }
  }

  useEffect(() => {
    fetchIMDAlerts();

    const interval = setInterval(fetchIMDAlerts, IMD_ALERT_REFRESH_MS);

    return () => clearInterval(interval);
  }, []);

  /* =======================================================
     KEEP SELECTED DATA FRESH
  ======================================================= */

  useEffect(() => {
    if (!selected) return;

    if (selected.isYou) {
      setSelected((current) => ({
        ...current,
        ...user,
        isYou: true,
      }));

      return;
    }

    if (!selected.id) return;

    const updatedFriend = friends.find((friend) => friend.id === selected.id);

    if (!updatedFriend) return;

    const coordinates = getCoordinates(updatedFriend);

    setSelected({
      ...updatedFriend,
      latitude: coordinates?.lat,
      longitude: coordinates?.lng,
    });
  }, [friends, user, selected?.id, selected?.isYou]);

  /* =======================================================
     SELECTED POSITION
  ======================================================= */

  const selectedPosition = useMemo(() => {
    if (!selected) return null;

    const coordinates = getCoordinates(selected);

    if (!coordinates) return null;

    return [coordinates.lat, coordinates.lng];
  }, [selected]);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div
      className="
        relative
        rounded-xl
        overflow-hidden
        shadow-card
        h-[420px]
        sm:h-[520px]
        w-full
      "
    >
      {/* =================================================
          LEAFLET MAP
      ================================================= */}

      <MapContainer
        center={center}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom={true}
        zoomControl={false}
        className="weather-map h-full w-full"
      >
        {/* Layers → top-left */}
        <WeatherMapLayers satelliteWmsUrl={satelliteWmsUrl} />
        {/* Zoom → bottom-left */}
        <ZoomControl position="bottomleft" />
        ...
      </MapContainer>

      {/* ===================================================
          IMD ALERT PANEL
      =================================================== */}

      {showImdAlerts && (
        <IMDAlertPanel
          alerts={imdAlerts}
          loading={imdAlertsLoading}
          error={imdAlertsError}
          onRefresh={fetchIMDAlerts}
          onClose={() => setShowImdAlerts(false)}
        />
      )}

      {/* ===================================================
          IMD ALERT BUTTON
      =================================================== */}

      {!showImdAlerts && (
        <IMDAlertButton
          alerts={imdAlerts}
          loading={imdAlertsLoading}
          onClick={() => setShowImdAlerts(true)}
        />
      )}

      {/* ===================================================
          SELECTED LOCATION
      =================================================== */}

      <SelectedLocationCard
        selected={selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
