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
  // CHECK IF USER IS UNAVAILABLE
  // ============================================================

  const isUnavailable =
    friend?.blockedMe === true ||
    friend?.isBlocked === true;

  // ============================================================
  // USER INITIALS
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
  // TEMPERATURE
  // ============================================================

  const temperature =
    weather?.temperature ?? weather?.temp;

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="rounded-xl2 bg-white shadow-card p-5 flex flex-col gap-4 animate-enter">

      {/* ========================================================
          HEADER
      ======================================================== */}

      <div className="flex items-start gap-3">

        {/* ======================================================
            AVATAR
        ====================================================== */}

        <div className="h-11 w-11 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
          {isUnavailable ? (
            <Lock
              size={18}
              className="text-ink-400"
            />
          ) : (
            <span className="font-display font-semibold text-sm">
              {initials}
            </span>
          )}
        </div>

        {/* ======================================================
            USER INFORMATION
        ====================================================== */}

        <div className="flex-1 min-w-0">

          {/* NAME */}

          <p className="font-semibold text-ink-800 truncate">
            {isUnavailable
              ? "User unavailable"
              : friend?.name || "User"}
          </p>

          {/* USERNAME
              Hidden when unavailable
          */}

          {!isUnavailable && (
            <p className="text-xs text-ink-400">
              @{friend?.username || "username"}
            </p>
          )}

          {/* LOCATION
              Hidden when unavailable
          */}

          {!isUnavailable && locationText && (
            <p className="text-xs text-ink-400 flex items-center gap-1 mt-0.5">
              <MapPin size={11} />
              {locationText}
            </p>
          )}
        </div>

        {/* ======================================================
            THREE DOT MENU
            COMPLETELY HIDDEN FOR UNAVAILABLE USERS
        ====================================================== */}

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
              className="h-8 w-8 rounded-full flex items-center justify-center text-ink-400 hover:bg-sky-50 hover:text-ink-700 transition-colors"
            >
              <MoreVertical size={16} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-9 z-20 w-48 bg-white rounded-xl2 shadow-pop border border-sky-100 py-1.5 animate-enter">

                {/* COMPARE WEATHER */}

                <MenuItem
                  icon={RefreshCw}
                  label="Compare Weather"
                  onClick={() => {
                    setMenuOpen(false);
                    onCompare?.(friend);
                  }}
                />

                {/* REMOVE FRIEND */}

                <MenuItem
                  icon={UserMinus}
                  label="Remove Friend"
                  onClick={() => {
                    setMenuOpen(false);
                    removeFriend(friend?.id);
                  }}
                />

                {/* BLOCK USER */}

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

      {/* ========================================================
          WEATHER SECTION
      ======================================================== */}

      {weatherShared ? (
        <div className="rounded-xl2 bg-sky-50 px-4 py-3 flex items-center gap-3">

          {/* WEATHER ICON */}

          <span className="text-2xl leading-none">
            {weatherIcon?.[weather.icon] || "🌤️"}
          </span>

          {/* WEATHER INFORMATION */}

          <div className="flex-1 min-w-0">

            <p className="text-sm font-semibold text-ink-800">
              {weather.condition || "Current Weather"}
            </p>

            {weather.humidity !== undefined &&
              weather.humidity !== null && (
                <p className="text-xs text-ink-400">
                  Humidity {weather.humidity}%
                </p>
              )}

            {locationText && (
              <p className="text-xs text-ink-400 truncate">
                {locationText}
              </p>
            )}
          </div>

          {/* TEMPERATURE */}

          <p className="text-xl font-display font-bold text-ink-900">
            {temperature !== undefined &&
            temperature !== null
              ? `${temperature}°`
              : "--"}
          </p>
        </div>
      ) : (
        /* ======================================================
           WEATHER NOT SHARED / USER UNAVAILABLE
        ====================================================== */

        <div className="rounded-xl2 bg-ink-50 px-4 py-3.5 flex items-center gap-2.5 text-ink-400">

          <Lock size={14} />

          <div>
            <p className="text-sm font-medium text-ink-500">
              Weather Not Shared
            </p>

            <p className="text-xs">
              {isUnavailable
                ? "User hasn't shared weather data yet."
                : `${
                    (
                      friend?.name ||
                      "This user"
                    ).split(" ")[0]
                  } hasn't shared weather data yet.`}
            </p>
          </div>
        </div>
      )}

      {/* ========================================================
          COMPARE BUTTON
          HIDDEN FOR UNAVAILABLE USERS
      ======================================================== */}

      {!isUnavailable && (
        <div className="flex gap-2">

          <button
            type="button"
            onClick={() => onCompare?.(friend)}
            className="flex-1 text-sm font-medium py-2 rounded-xl2 bg-sky-500 text-white hover:bg-sky-600 transition-colors"
          >
            Compare
          </button>

        </div>
      )}

    </div>
  );
}

// ================================================================
// MENU ITEM COMPONENT
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
      className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-sm hover:bg-sky-50 transition-colors ${
        tone === "danger"
          ? "text-red-500 hover:bg-red-50"
          : "text-ink-700"
      }`}
    >
      <Icon size={15} />
      {label}
    </button>
  );
}