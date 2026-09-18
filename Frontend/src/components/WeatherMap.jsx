import { useEffect, useMemo, useState } from "react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  useMap,
  LayersControl,
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";

import { X, MapPin } from "lucide-react";

import { weatherIcon } from "../data/mockData";

/* =========================================================
   CONFIG
========================================================= */

const WEATHER_BACKEND_URL =
  "https://weathergpt-idq6.onrender.com";

const FRIEND_RADIUS_METERS = 2000;

/* =========================================================
   CUSTOM MAP PIN
========================================================= */

function pin(label, tone) {
  const bg =
    tone === "you"
      ? "#3874B8"
      : "#4A90D9";

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

/* =========================================================
   MOVE MAP
========================================================= */

function FlyTo({ position }) {
  const map = useMap();

  if (position) {
    map.setView(
      position,
      map.getZoom() < 8
        ? 9
        : map.getZoom()
    );
  }

  return null;
}

/* =========================================================
   FIREBASE COORDINATES
========================================================= */

function getCoordinates(item) {
  if (!item) {
    return null;
  }

  /*
   * Firebase structure:
   *
   * location: {
   *   lat,
   *   lng
   * }
   */

  if (
    item.location &&
    typeof item.location.lat ===
      "number" &&
    typeof item.location.lng ===
      "number"
  ) {
    return {
      lat: item.location.lat,
      lng: item.location.lng,
    };
  }

  /*
   * Fallback to top-level Firebase fields.
   */

  if (
    typeof item.latitude ===
      "number" &&
    typeof item.longitude ===
      "number"
  ) {
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
  if (!item) {
    return "Unknown location";
  }

  /*
   * String location
   */

  if (
    typeof item.location ===
      "string" &&
    item.location.trim()
  ) {
    return item.location;
  }

  /*
   * location.city
   */

  if (
    item.location &&
    typeof item.location.city ===
      "string" &&
    item.location.city.trim()
  ) {
    return item.location.city;
  }

  /*
   * Weather location name
   */

  if (
    item.weather?.locationName &&
    typeof item.weather.locationName ===
      "string"
  ) {
    return item.weather.locationName;
  }

  /*
   * Coordinate fallback
   */

  const coordinates =
    getCoordinates(item);

  if (coordinates) {
    return `${coordinates.lat.toFixed(
      4
    )}, ${coordinates.lng.toFixed(4)}`;
  }

  return "Unknown location";
}

/* =========================================================
   TEMPERATURE
========================================================= */

function getTemperature(weather) {
  if (!weather) {
    return null;
  }

  if (
    typeof weather.temperature ===
    "number"
  ) {
    return weather.temperature;
  }

  if (
    typeof weather.temp === "number"
  ) {
    return weather.temp;
  }

  return null;
}

/* =========================================================
   WEATHER UPDATED TIME
========================================================= */

function formatWeatherUpdatedAt(
  timestamp
) {
  if (!timestamp) {
    return null;
  }

  try {
    const date = timestamp?.toDate
      ? timestamp.toDate()
      : new Date(timestamp);

    if (
      Number.isNaN(date.getTime())
    ) {
      return null;
    }

    const diffMs =
      Date.now() - date.getTime();

    /*
     * Prevent weird future timestamps.
     */

    if (diffMs < 0) {
      return "just now";
    }

    const diffMinutes =
      Math.floor(diffMs / 60000);

    if (diffMinutes < 1) {
      return "just now";
    }

    if (diffMinutes === 1) {
      return "1 minute ago";
    }

    if (diffMinutes < 60) {
      return `${diffMinutes} minutes ago`;
    }

    const diffHours =
      Math.floor(diffMinutes / 60);

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
   APPROXIMATE FRIEND LOCATION
========================================================= */

/*
 * Friends are NOT shown at their exact
 * Firebase coordinates.
 *
 * A deterministic offset is generated from
 * the friend's ID so the approximate area
 * remains stable across renders.
 */

function getApproximateFriendCenter(
  coordinates,
  friendId
) {
  if (!coordinates) {
    return null;
  }

  const seedString = String(
    friendId || "friend"
  );

  let seed = 0;

  for (
    let i = 0;
    i < seedString.length;
    i++
  ) {
    seed =
      (seed * 31 +
        seedString.charCodeAt(i)) >>>
      0;
  }

  const randomLat =
    ((seed % 1000) / 1000) * 2 - 1;

  const randomLng =
    (((seed >> 10) % 1000) / 1000) *
      2 -
    1;

  /*
   * Keep the generated center
   * comfortably inside the 2 km privacy
   * circle.
   */

  const maxOffsetKm = 1.5;

  const latOffset =
    (randomLat * maxOffsetKm) / 111;

  const longitudeFactor = Math.cos(
    (coordinates.lat * Math.PI) / 180
  );

  const lngOffset =
    (randomLng * maxOffsetKm) /
    (111 * longitudeFactor);

  return {
    lat:
      coordinates.lat + latOffset,

    lng:
      coordinates.lng + lngOffset,
  };
}

/* =========================================================
   WEATHER MAP
========================================================= */

export default function WeatherMap({
  user,
  friends = [],
}) {
  const [selected, setSelected] =
    useState(null);

  /*
   * Used to refresh:
   *
   * "Updated X minutes ago"
   */

  const [, setTimeTick] =
    useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeTick(
        (value) => value + 1
      );
    }, 60000);

    return () =>
      clearInterval(interval);
  }, []);

  /* =======================================================
     USER LOCATION
  ======================================================= */

  const userCoordinates =
    getCoordinates(user);

  const center = userCoordinates
    ? [
        userCoordinates.lat,
        userCoordinates.lng,
      ]
    : [22.5726, 88.3639];

  /* =======================================================
     FRIENDS WITH VALID COORDINATES
  ======================================================= */

  const visibleFriends = useMemo(() => {
    return friends.filter(
      (friend) => {
        const coordinates =
          getCoordinates(friend);

        return (
          coordinates &&
          Number.isFinite(
            coordinates.lat
          ) &&
          Number.isFinite(
            coordinates.lng
          )
        );
      }
    );
  }, [friends]);

  /* =======================================================
     KEEP SELECTED USER / FRIEND UPDATED
  ======================================================= */

  useEffect(() => {
    if (
      !selected?.id &&
      !selected?.isYou
    ) {
      return;
    }

    /*
     * Selected user
     */

    if (selected.isYou) {
      setSelected(
        (current) => ({
          ...current,
          ...user,
          isYou: true,
        })
      );

      return;
    }

    /*
     * Selected friend
     */

    const updatedFriend =
      friends.find(
        (friend) =>
          friend.id === selected.id
      );

    if (updatedFriend) {
      const coordinates =
        getCoordinates(
          updatedFriend
        );

      const approximateCenter =
        getApproximateFriendCenter(
          coordinates,
          updatedFriend.id
        );

      setSelected({
        ...updatedFriend,

        latitude:
          coordinates?.lat,

        longitude:
          coordinates?.lng,

        approximateCenter,
      });
    }
  }, [
    friends,
    user,
    selected?.id,
    selected?.isYou,
  ]);

  /* =======================================================
     SELECTED MAP POSITION
  ======================================================= */

  const selectedMapPosition =
    selected
      ? selected.isYou
        ? (() => {
            const coordinates =
              getCoordinates(
                selected
              );

            return coordinates
              ? [
                  coordinates.lat,
                  coordinates.lng,
                ]
              : null;
          })()
        : selected.approximateCenter
        ? [
            selected
              .approximateCenter.lat,
            selected
              .approximateCenter.lng,
          ]
        : null
      : null;

  /* =======================================================
     RENDER
  ======================================================= */

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
        {/* =================================================
            MAP LAYERS
        ================================================= */}

        <LayersControl
          position="topright"
          collapsed={false}
        >
          {/* =================================================
              NORMAL MAP
          ================================================= */}

          <LayersControl.BaseLayer
            checked
            name="🗺️ Map"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>

          {/* =================================================
              SATELLITE
          ================================================= */}

          <LayersControl.BaseLayer
            name="🛰️ Satellite"
          >
            <TileLayer
              attribution="© Esri"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </LayersControl.BaseLayer>

          {/* =================================================
              PRECIPITATION
          ================================================= */}

          <LayersControl.Overlay
            checked={false}
            name="🌧️ Precipitation"
          >
            <TileLayer
              attribution="© OpenWeather"
              url={`${WEATHER_BACKEND_URL}/api/weather-map/precipitation_new/{z}/{x}/{y}.png`}
              opacity={0.6}
              zIndex={10}
            />
          </LayersControl.Overlay>
        </LayersControl>

        {/* =================================================
            MOVE MAP TO SELECTED PERSON
        ================================================= */}

        <FlyTo
          position={
            selectedMapPosition
          }
        />

        {/* =================================================
            YOUR LOCATION
        ================================================= */}

        {userCoordinates && (
          <>
            <Marker
              position={[
                userCoordinates.lat,
                userCoordinates.lng,
              ]}
              icon={pin(
                "👤",
                "you"
              )}
              eventHandlers={{
                click: () =>
                  setSelected({
                    ...user,
                    isYou: true,
                  }),
              }}
            />

            {/* =============================================
                USER PRIVACY CIRCLE
            ============================================= */}

            {user.locationSharing !==
              "exact" && (
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

        {/* =================================================
            FRIEND LOCATIONS
        ================================================= */}

        {visibleFriends.map(
          (friend) => {
            const coordinates =
              getCoordinates(
                friend
              );

            if (!coordinates) {
              return null;
            }

            /*
             * IMPORTANT:
             *
             * Exact Firebase coordinates are
             * never rendered directly.
             */

            const approximateCenter =
              getApproximateFriendCenter(
                coordinates,
                friend.id
              );

            if (
              !approximateCenter
            ) {
              return null;
            }

            return (
              <Circle
                key={friend.id}
                center={[
                  approximateCenter.lat,
                  approximateCenter.lng,
                ]}
                radius={
                  FRIEND_RADIUS_METERS
                }
                pathOptions={{
                  color: "#4A90D9",
                  fillColor:
                    "#4A90D9",
                  fillOpacity: 0.12,
                  weight: 2,
                }}
                eventHandlers={{
                  click: () =>
                    setSelected({
                      ...friend,

                      /*
                       * Exact coordinates are retained
                       * internally for weather/data.
                       *
                       * They are NOT used as the
                       * displayed map position.
                       */

                      latitude:
                        coordinates.lat,

                      longitude:
                        coordinates.lng,

                      approximateCenter,
                    }),
                }}
              />
            );
          }
        )}
      </MapContainer>

      {/* =====================================================
          MAP HEADER
      ===================================================== */}

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
          {visibleFriends.length}{" "}
          friend
          {visibleFriends.length !==
          1
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

      {/* =====================================================
          SELECTED FRIEND / USER CARD
      ===================================================== */}

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
          {/* =================================================
              AVATAR
          ================================================= */}

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
                  .map(
                    (n) => n[0]
                  )
                  .slice(0, 2)
                  .join("")
                  .toUpperCase() ||
                "U"}
          </div>

          {/* =================================================
              INFORMATION
          ================================================= */}

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-ink-800">
              {selected.isYou
                ? "Your Location"
                : selected.name ||
                  "User"}
            </p>

            <p className="text-xs text-ink-400 flex items-center gap-1">
              <MapPin size={11} />

              {selected.isYou
                ? getLocationText(
                    selected
                  )
                : "Approximate location · within 2 km"}
            </p>

            {/* =============================================
                WEATHER
            ============================================= */}

            {selected.weather &&
            (selected.isYou ||
              selected.weatherSharing) ? (
              <>
                <p className="text-sm mt-1.5">
                  {weatherIcon[
                    selected.weather
                      .icon
                  ] || "🌤️"}{" "}
                  {getTemperature(
                    selected.weather
                  ) !== null
                    ? `${getTemperature(
                        selected.weather
                      )}°C`
                    : "--"}{" "}
                  {" · "}
                  {selected.weather
                    .condition ||
                    "Weather unavailable"}
                </p>

                {/* =========================================
                    UPDATED TIME
                ========================================= */}

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

          {/* =================================================
              CLOSE BUTTON
          ================================================= */}

          <button
            type="button"
            onClick={() =>
              setSelected(null)
            }
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

