import { useState, useRef, useEffect } from "react";

import {
  MoreVertical,
  Lock,
  MapPin,
  RefreshCw,
  UserMinus,
  ShieldOff,
} from "lucide-react";

import { weatherIcon } from "../data/mockData";
import { useApp } from "../context/AppContext";

// ================================================================
// FORMAT WEATHER UPDATED TIME
// ================================================================

function formatWeatherUpdatedAt(timestamp) {
  if (!timestamp) return null;

  try {
    const date = timestamp?.toDate
      ? timestamp.toDate()
      : new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    const diffMinutes = Math.floor(
      (Date.now() - date.getTime()) / 60000
    );

    if (diffMinutes < 1) {
      return "Updated just now";
    }

    if (diffMinutes < 60) {
      return `Updated ${diffMinutes} ${
        diffMinutes === 1 ? "minute" : "minutes"
      } ago`;
    }

    const diffHours = Math.floor(diffMinutes / 60);

    if (diffHours < 24) {
      return `Updated ${diffHours} ${
        diffHours === 1 ? "hour" : "hours"
      } ago`;
    }

    return `Updated ${date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
    })}, ${date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })}`;
  } catch {
    return null;
  }
}

// ================================================================
// FRIEND CARD
// ================================================================

export default function FriendCard({
  friend,
  onCompare,
  onBlock,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const menuRef = useRef(null);

  const { removeFriend } = useApp();

  // ============================================================
  // CLOSE MENU WHEN CLICKING OUTSIDE
  // ============================================================

  useEffect(() => {
    function onClick(e) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", onClick);

    return () => {
      document.removeEventListener("mousedown", onClick);
    };
  }, []);

  // ============================================================
  // UNAVAILABLE USER
  // ============================================================

  const isUnavailable =
    friend?.blockedMe === true ||
    friend?.isBlocked === true;

  // ============================================================
  // INITIALS
  // ============================================================

  const initials = (friend?.name || "User")
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // ============================================================
  // WEATHER
  // ============================================================

  const weather = friend?.weather;

  const weatherShared =
    friend?.weatherSharing === true &&
    !!weather &&
    !isUnavailable;

  const temperature =
    weather?.temperature ?? weather?.temp;

  // ============================================================
  // LOCATION
  // ============================================================

  const locationText =
    typeof friend?.location === "string"
      ? friend.location
      : friend?.location?.city ||
        weather?.locationName ||
        "";

  // ============================================================
  // UPDATED TIME
  // ============================================================

  const weatherUpdatedText =
    formatWeatherUpdatedAt(
      friend?.weatherUpdatedAt
    );

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div
      className="
        bg-white
        rounded-2xl
        border border-slate-100
        shadow-[0_4px_20px_rgba(15,23,42,0.06)]
        p-4
        flex flex-col
        gap-4
        transition-all
        duration-200
        hover:shadow-[0_8px_28px_rgba(15,23,42,0.09)]
        hover:-translate-y-0.5
      "
    >

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex items-center gap-3">

        {/* AVATAR */}

        <div
          className="
            h-11
            w-11
            rounded-full
            bg-sky-100
            text-sky-600
            flex
            items-center
            justify-center
            shrink-0
            ring-4
            ring-sky-50
          "
        >
          {isUnavailable ? (
            <Lock
              size={17}
              className="text-slate-400"
            />
          ) : (
            <span className="font-semibold text-sm">
              {initials}
            </span>
          )}
        </div>

        {/* USER INFO */}

        <div className="flex-1 min-w-0">

          <p className="font-semibold text-[15px] text-slate-800 truncate leading-tight">
            {isUnavailable
              ? "User unavailable"
              : friend?.name || "User"}
          </p>

          {/* USERNAME */}

          <p className="text-xs text-slate-400 mt-0.5">
            @{friend?.username || "username"}
          </p>

          {/* LOCATION */}

          {!isUnavailable && locationText && (
            <div className="flex items-center gap-1 mt-1">

              <MapPin
                size={11}
                className="text-slate-400 shrink-0"
              />

              <p className="text-[11px] text-slate-400 truncate">
                {locationText}
              </p>

            </div>
          )}

        </div>

        {/* THREE DOT MENU */}

        {!isUnavailable && (
          <div
            className="relative"
            ref={menuRef}
          >
            <button
              type="button"
              onClick={() =>
                setMenuOpen((value) => !value)
              }
              className="
                h-8
                w-8
                rounded-full
                flex
                items-center
                justify-center
                text-slate-400
                hover:bg-slate-50
                hover:text-slate-600
                transition-colors
              "
            >
              <MoreVertical size={17} />
            </button>

            {menuOpen && (
              <div
                className="
                  absolute
                  right-0
                  top-9
                  z-30
                  w-48
                  bg-white
                  rounded-xl
                  border
                  border-slate-100
                  shadow-xl
                  py-1.5
                  overflow-hidden
                "
              >

                {/* COMPARE */}

                <MenuItem
                  icon={RefreshCw}
                  label="Compare Weather"
                  onClick={() => {
                    setMenuOpen(false);
                    onCompare?.(friend);
                  }}
                />

                {/* REMOVE */}

                <MenuItem
                  icon={UserMinus}
                  label="Remove Friend"
                  onClick={() => {
                    setMenuOpen(false);
                    removeFriend(friend?.id);
                  }}
                />

                {/* BLOCK */}

                <MenuItem
                  icon={ShieldOff}
                  label="Block User"
                  tone="danger"
                  onClick={() => {
                    setMenuOpen(false);
                    onBlock?.(friend);
                  }}
                />

              </div>
            )}
          </div>
        )}

      </div>

      {/* ======================================================
          WEATHER CARD
      ====================================================== */}

      {weatherShared ? (

        <div
          className="
            rounded-2xl
            bg-gradient-to-br
            from-sky-50
            to-blue-50
            border
            border-sky-100
            px-4
            py-3.5
            flex
            items-center
            gap-3
          "
        >

          {/* WEATHER ICON */}

          <div
            className="
              h-11
              w-11
              rounded-full
              bg-white
              flex
              items-center
              justify-center
              shadow-sm
              shrink-0
            "
          >
            <span className="text-2xl">
              {weatherIcon?.[weather.icon] || "🌤️"}
            </span>
          </div>

          {/* WEATHER INFO */}

          <div className="flex-1 min-w-0">

            <p
              className="
                text-sm
                font-semibold
                text-slate-700
                capitalize
                truncate
              "
            >
              {weather.condition || "Current Weather"}
            </p>

            {/* HUMIDITY */}

            {weather.humidity !== undefined &&
              weather.humidity !== null && (
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Humidity {weather.humidity}%
                </p>
              )}

            {/* LOCATION */}

            {locationText && (
              <p className="text-[11px] text-slate-400 truncate">
                {locationText}
              </p>
            )}

            {/* UPDATED */}

            {weatherUpdatedText && (
              <p className="text-[10px] text-slate-400 mt-1">
                {weatherUpdatedText}
              </p>
            )}

          </div>

          {/* TEMPERATURE */}

          <div className="shrink-0 text-right">

            <p
              className="
                text-2xl
                font-bold
                tracking-tight
                text-slate-800
              "
            >
              {temperature !== undefined &&
              temperature !== null
                ? `${temperature}°`
                : "--"}
            </p>

          </div>

        </div>

      ) : (

        /* ====================================================
           WEATHER NOT SHARED
        ==================================================== */

        <div
          className="
            rounded-2xl
            bg-slate-50
            border
            border-slate-100
            px-4
            py-3.5
            flex
            items-center
            gap-3
          "
        >

          <div
            className="
              h-9
              w-9
              rounded-full
              bg-white
              flex
              items-center
              justify-center
              shrink-0
            "
          >
            <Lock
              size={14}
              className="text-slate-400"
            />
          </div>

          <div>

            <p className="text-sm font-medium text-slate-600">
              Weather Not Shared
            </p>

            <p className="text-[11px] text-slate-400 mt-0.5">
              {isUnavailable
                ? "User hasn't shared weather data yet."
                : `${
                    friend?.name || "This user"
                  } hasn't shared weather data yet.`}
            </p>

          </div>

        </div>
      )}

      {/* ======================================================
          COMPARE BUTTON
      ====================================================== */}

      {!isUnavailable && (
        <button
          type="button"
          onClick={() => onCompare?.(friend)}
          className="
            w-full
            text-sm
            font-semibold
            py-2.5
            rounded-full
            bg-sky-500
            text-white
            shadow-sm
            hover:bg-sky-600
            hover:shadow-md
            active:scale-[0.98]
            transition-all
          "
        >
          Compare
        </button>
      )}

    </div>
  );
}

// ================================================================
// MENU ITEM
// ================================================================

function MenuItem({
  icon: Icon,
  label,
  onClick,
  tone,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full
        flex
        items-center
        gap-2.5
        px-3.5
        py-2.5
        text-sm
        transition-colors
        ${
          tone === "danger"
            ? "text-red-500 hover:bg-red-50"
            : "text-slate-600 hover:bg-slate-50"
        }
      `}
    >
      <Icon size={15} />
      {label}
    </button>
  );
}