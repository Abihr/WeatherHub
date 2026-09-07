import { useEffect, useMemo, useState } from "react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  useMap,
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";

import { X, MapPin } from "lucide-react";

import { weatherIcon } from "../data/mockData";

function pin(label, tone) {
  const bg = tone === "you" ? "#3874B8" : "#4A90D9";

  return L.divIcon({
    className: "",
    html: `
      <div style="
        background:${bg};
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
      ">
        <span style="
          transform:rotate(45deg);
          font-size:16px;
          line-height:1;
        ">
          ${label}
        </span>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 36],
  });
}

function FlyTo({ position }) {
  const map = useMap();

  if (position) {
    map.setView(
      position,
      map.getZoom() < 8 ? 9 : map.getZoom()
    );
  }

  return null;
}

function getCoordinates(item) {
  if (!item) return null;

  // Firebase structure:
  // location: { lat, lng }
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

  // Fallback to top-level Firebase fields
  if (
    typeof item.latitude === "number" &&
    typeof item.longitude === "number"
  ) {
    return {
      lat: item.latitude,
      lng: item.longitude,
    };
  }

  return null;
}

function getLocationText(item) {
  if (!item) return "Unknown location";

  // String location
  if (
    typeof item.location === "string" &&
    item.location.trim()
  ) {
    return item.location;
  }

  // location.city
  if (
    item.location &&
    typeof item.location.city === "string" &&
    item.location.city.trim()
  ) {
    return item.location.city;
  }

  // Weather location name
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

/*
 * Format Firebase weatherUpdatedAt.
 *
 * Examples:
 * just now
 * 1 minute ago
 * 5 minutes ago
 * 2 hours ago
 * 08 Sep, 07:30 PM
 */
function formatWeatherUpdatedAt(timestamp) {
  if (!timestamp) {
    return null;
  }

  try {
    const date = timestamp?.toDate
      ? timestamp.toDate()
      : new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    const diffMs = Date.now() - date.getTime();

    // Prevent weird future timestamps
    if (diffMs < 0) {
      return "just now";
    }

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

export default function WeatherMap({
  user,
  friends = [],
}) {
  const [selected, setSelected] = useState(null);

  /*
   * Used to refresh the "Updated X minutes ago"
   * text automatically.
   */
  const [, setTimeTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeTick((value) => value + 1);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const userCoordinates = getCoordinates(user);

  const center = userCoordinates
    ? [userCoordinates.lat, userCoordinates.lng]
    : [22.5726, 88.3639];

  /*
   * Only show friends that have valid Firebase coordinates.
   */
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

  /*
   * Keep selected friend data updated when
   * Firebase sends a new friendsList.
   *
   * This is important for real-time weather updates.
   */
  useEffect(() => {
    if (!selected?.id && !selected?.isYou) {
      return;
    }

    if (selected.isYou) {
      setSelected((current) => ({
        ...current,
        ...user,
        isYou: true,
      }));

      return;
    }

    const updatedFriend = friends.find(
      (friend) => friend.id === selected.id
    );

    if (updatedFriend) {
      const coordinates =
        getCoordinates(updatedFriend);

      setSelected({
        ...updatedFriend,
        latitude: coordinates?.lat,
        longitude: coordinates?.lng,
      });
    }
  }, [friends, user]);

  return (
    <div
      className="
        relative
        rounded-xl3
        overflow-hidden
        shadow-card
        h-[420px]
        sm:h-[520px]
        w-full
      "
    >
      <MapContainer
        center={center}
        zoom={9}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Move map to selected friend */}
        <FlyTo
          position={
            selected
              ? (() => {
                  const coordinates =
                    getCoordinates(selected);

                  return coordinates
                    ? [
                        coordinates.lat,
                        coordinates.lng,
                      ]
                    : null;
                })()
              : null
          }
        />

        {/* YOUR LOCATION */}
        {userCoordinates && (
          <>
            <Marker
              position={[
                userCoordinates.lat,
                userCoordinates.lng,
              ]}
              icon={pin("👤", "you")}
              eventHandlers={{
                click: () =>
                  setSelected({
                    ...user,
                    isYou: true,
                  }),
              }}
            />

            {user.locationSharing !== "exact" && (
              <Circle
                center={[
                  userCoordinates.lat,
                  userCoordinates.lng,
                ]}
                radius={4000}
                pathOptions={{
                  color: "#4A90D9",
                  fillOpacity: 0.08,
                  weight: 1,
                }}
              />
            )}
          </>
        )}

        {/* FRIEND LOCATIONS FROM FIREBASE */}
        {visibleFriends.map((friend) => {
          const coordinates =
            getCoordinates(friend);

          if (!coordinates) return null;

          return (
            <Marker
              key={friend.id}
              position={[
                coordinates.lat,
                coordinates.lng,
              ]}
              icon={pin("👥", "friend")}
              eventHandlers={{
                click: () =>
                  setSelected({
                    ...friend,
                    latitude: coordinates.lat,
                    longitude: coordinates.lng,
                  }),
              }}
            />
          );
        })}
      </MapContainer>

      {/* MAP HEADER */}
      <div
        className="
          absolute
          top-3
          left-3
          right-3
          flex
          items-center
          justify-between
          gap-2
          z-[400]
        "
      >
        <span
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
          "
        >
          {visibleFriends.length} friend
          {visibleFriends.length !== 1
            ? "s"
            : ""}{" "}
          shown
        </span>

        <span
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
          "
        >
          📍 Live locations
        </span>
      </div>

      {/* SELECTED FRIEND / USER */}
      {selected && (
        <div
          className="
            absolute
            bottom-3
            left-3
            right-3
            z-[400]
            bg-white
            rounded-xl2
            shadow-pop
            p-4
            flex
            items-start
            gap-3
            animate-enter
          "
        >
          {/* AVATAR */}
          <div
            className="
              h-10
              w-10
              rounded-full
              bg-sky-100
              text-sky-700
              font-display
              font-semibold
              flex
              items-center
              justify-center
              text-sm
              shrink-0
            "
          >
            {selected.isYou
              ? "You"
              : selected.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase() || "U"}
          </div>

          {/* INFORMATION */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-ink-800">
              {selected.isYou
                ? "Your Location"
                : selected.name || "User"}
            </p>

            <p className="text-xs text-ink-400 flex items-center gap-1">
              <MapPin size={11} />
              {getLocationText(selected)}
            </p>

            {/* WEATHER */}
            {selected.weather &&
            (selected.isYou ||
              selected.weatherSharing) ? (
              <>
                <p className="text-sm mt-1.5">
                  {weatherIcon[
                    selected.weather.icon
                  ] || "🌤️"}{" "}
                  {getTemperature(
                    selected.weather
                  ) !== null
                    ? `${getTemperature(
                        selected.weather
                      )}°C`
                    : "--"}{" "}
                  {" · "}
                  {selected.weather.condition ||
                    "Weather unavailable"}
                </p>

                {/* UPDATED TIME */}
                {selected.weatherUpdatedAt && (
                  <p className="text-xs text-ink-400 mt-1">
                    🕐 Updated{" "}
                    {formatWeatherUpdatedAt(
                      selected.weatherUpdatedAt
                    )}
                  </p>
                )}
              </>
            ) : (
              <p className="text-xs mt-1.5 text-ink-400">
                🔒 Weather not shared
              </p>
            )}
          </div>

          {/* CLOSE */}
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="
              text-ink-400
              hover:text-ink-700
              transition-colors
            "
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}