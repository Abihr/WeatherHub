
import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import {
  Home,
  Users,
  Map,
  Train,
  Bot,
  Sprout,
  Bell,
  User,
} from "lucide-react";

import { useApp } from "../context/AppContext";
import { useLanguage } from "../context/LanguageContext";
import LanguageSetter from "./LanguageSetter";

import logo from "../assets/logo_simple.png";

import {
  getGreeting,
  getGreetingRefreshDelay,
} from "../utils/greeting";

const primaryLinks = [
  {
    to: "/",
    translationKey: "home",
    icon: Home,
    end: true,
  },
  {
    to: "/friends",
    translationKey: "friends",
    icon: Users,
  },
  {
    to: "/map",
    translationKey: "map",
    icon: Map,
  },
  {
    to: "/railway-weather",
    translationKey: "railway",
    icon: Train,
  },
  {
    to: "/chatbot",
    translationKey: "chatbot",
    icon: Bot,
  },
  {
    to: "/farmer",
    translationKey: "agriculture",
    icon: Sprout,
    agriculture: true,
  },
];

export default function Navbar() {
  const { user, alerts } = useApp();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // =========================================================
  // GREETING
  // =========================================================

  const [greetingKey, setGreetingKey] = useState(() =>
    getGreeting()
  );

  useEffect(() => {
    let timer;

    const updateGreeting = () => {
      setGreetingKey(getGreeting());

      const delay = getGreetingRefreshDelay();

      timer = window.setTimeout(updateGreeting, delay);
    };

    const initialDelay = getGreetingRefreshDelay();

    timer = window.setTimeout(updateGreeting, initialDelay);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  // =========================================================
  // AGRICULTURE MODE
  // =========================================================

  const [agricultureMode, setAgricultureMode] = useState(() => {
    return localStorage.getItem("agricultureMode") === "true";
  });

  // =========================================================
  // LISTEN FOR AGRICULTURE MODE CHANGES
  // =========================================================

  useEffect(() => {
    const handleAgricultureModeChange = () => {
      const value =
        localStorage.getItem("agricultureMode") === "true";

      setAgricultureMode(value);
    };

    window.addEventListener(
      "agricultureModeChanged",
      handleAgricultureModeChange
    );

    return () => {
      window.removeEventListener(
        "agricultureModeChanged",
        handleAgricultureModeChange
      );
    };
  }, []);

  // =========================================================
  // TOGGLE AGRICULTURE
  // =========================================================

  const toggleAgriculture = () => {
    const newValue = !agricultureMode;

    setAgricultureMode(newValue);

    localStorage.setItem(
      "agricultureMode",
      String(newValue)
    );

    window.dispatchEvent(
      new Event("agricultureModeChanged")
    );

    if (newValue) {
      navigate("/farmer");
    }
  };

  // =========================================================
  // TRANSLATED GREETING
  // =========================================================

  const greetingText =
    t[greetingKey] ||
    t.greeting_night ||
    "Good Night";

  return (
    <header
      className="
        sticky top-0 z-50
        w-full
        bg-white/95
        backdrop-blur-md
        border-b border-sky-100
        shadow-sm
      "
    >
      {/* =====================================================
          MOBILE NAVBAR
      ====================================================== */}

      <div
        className="
          md:hidden
          px-3 py-2.5
          flex items-center
          justify-between
          gap-2
        "
      >
        {/* Logo + Greeting */}

        <div className="flex items-center gap-2 min-w-0">
          <span
            className="
              h-10 w-10
              rounded-2xl
              bg-gradient-to-br
              from-sky-100
              to-blue-50
              border border-sky-100
              shadow-sm
              flex items-center justify-center
              overflow-hidden
              shrink-0
            "
          >
            <img
              src={logo}
              alt="WeatherHub logo"
              className="
                w-full h-full
                object-contain
                transition-transform
                duration-200
              "
            />
          </span>

          <div className="min-w-0">
            <p className="text-[11px] text-ink-400 leading-none">
              {greetingText}
            </p>

            <p
              className="
                text-sm
                font-display
                font-bold
                text-ink-900
                leading-tight
                truncate
                max-w-[130px]
              "
            >
              {user?.name || "User"}
            </p>
          </div>
        </div>

        {/* =================================================
            MOBILE RIGHT CONTROLS
        ================================================== */}

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Agriculture */}

          <button
            type="button"
            onClick={toggleAgriculture}
            aria-label={t.agriculture || "Agriculture"}
            aria-pressed={agricultureMode}
            className={`
              h-10 w-10
              rounded-xl
              flex items-center justify-center
              transition-all
              active:scale-95
              ${
                agricultureMode
                  ? "bg-green-100 text-green-600 shadow-sm"
                  : "bg-white text-ink-500 border border-sky-100 hover:bg-green-50 hover:text-green-600"
              }
            `}
          >
            <Sprout
              size={19}
              strokeWidth={agricultureMode ? 2.5 : 2}
            />
          </button>

          {/* Language */}

          <LanguageSetter variant="dropdown" />

          {/* Alerts */}

          <button
            type="button"
            onClick={() => navigate("/alerts")}
            aria-label={t.alerts || "Alerts"}
            className="
              relative
              h-10 w-10
              rounded-full
              bg-white
              border border-sky-100
              shadow-sm
              flex items-center justify-center
              text-ink-500
              hover:bg-sky-50
              hover:text-sky-600
              active:scale-95
              transition-all
            "
          >
            <Bell
              size={17}
              strokeWidth={2}
            />

            {alerts?.length > 0 && (
              <span
                className="
                  absolute top-1 right-1
                  h-2 w-2
                  rounded-full
                  bg-red-500
                  ring-2 ring-white
                "
              />
            )}
          </button>

          {/* Profile */}

          <button
            type="button"
            onClick={() => navigate("/profile")}
            aria-label={t.profile || "Profile"}
            className="
              h-10 w-10
              rounded-full
              bg-gradient-to-br
              from-sky-100
              to-blue-50
              border border-sky-200
              shadow-sm
              flex items-center justify-center
              text-sky-600
              hover:from-sky-200
              hover:to-blue-100
              hover:text-sky-700
              active:scale-95
              transition-all
            "
          >
            <User
              size={17}
              strokeWidth={2}
            />
          </button>
        </div>
      </div>

      {/* =====================================================
          DESKTOP NAVBAR
      ====================================================== */}

      <div
        className="
          hidden md:flex
          min-h-16
          items-center
          gap-4
          px-4
          lg:px-6
        "
      >
        {/* Logo + Greeting */}

        <div className="flex items-center gap-2 shrink-0">
          <span
            className="
              h-11 w-11
              lg:h-12 lg:w-12
              rounded-2xl
              bg-gradient-to-br
              from-sky-100
              to-blue-50
              border border-sky-100
              shadow-sm
              flex items-center justify-center
              overflow-hidden
            "
          >
            <img
              src={logo}
              alt="WeatherHub logo"
              className="
                w-full h-full
                object-contain
                transition-transform
                duration-200
              "
            />
          </span>

          <div className="hidden lg:block">
            <p className="text-[11px] text-ink-400 leading-none">
              {greetingText}
            </p>

            <p
              className="
                text-sm
                font-display
                font-bold
                text-ink-900
                leading-tight
                max-w-[120px]
                truncate
              "
            >
              {user?.name || "User"}
            </p>
          </div>
        </div>

        {/* =================================================
            PRIMARY NAVIGATION
        ================================================== */}

        <nav
          className="
            flex-1
            min-w-0
            overflow-x-auto
            scrollbar-hide
          "
        >
          <div
            className="
              flex
              items-center
              justify-center
              gap-1
              min-w-max
            "
          >
            {primaryLinks.map(
              ({
                to,
                translationKey,
                icon: Icon,
                end,
                agriculture,
              }) => {
                const label =
                  t[translationKey] ||
                  translationKey;

                // Agriculture hidden when OFF

                if (
                  agriculture &&
                  !agricultureMode
                ) {
                  return null;
                }

                // Agriculture toggle

                if (agriculture) {
                  return (
                    <div
                      key={to}
                      className="relative group"
                    >
                      <button
                        type="button"
                        onClick={toggleAgriculture}
                        aria-pressed={agricultureMode}
                        aria-label={label}
                        className={`
                          flex items-center gap-2
                          px-3 py-2
                          rounded-xl
                          text-sm font-medium
                          transition-colors
                          ${
                            agricultureMode
                              ? "bg-green-100 text-green-600 hover:bg-green-200"
                              : "bg-white text-ink-500 hover:bg-sky-50 hover:text-sky-600"
                          }
                        `}
                      >
                        <Sprout className="h-4 w-4" />

                        {label}
                      </button>

                      {/* Tooltip */}

                      <div
                        className="
                          absolute
                          left-1/2
                          -translate-x-1/2
                          top-full
                          mt-2
                          hidden
                          group-hover:block
                          whitespace-nowrap
                          bg-gray-900
                          text-white
                          text-xs
                          px-2
                          py-1
                          rounded-lg
                          shadow-lg
                          z-50
                        "
                      >
                        Agriculture Mode
                      </div>
                    </div>
                  );
                }

                // Normal navigation

                return (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    className={({ isActive }) =>
                      `
                        flex items-center gap-2
                        px-3 py-2
                        rounded-xl
                        text-sm font-medium
                        transition-colors
                        ${
                          isActive
                            ? "bg-sky-100 text-sky-600"
                            : "text-ink-500 hover:bg-sky-50 hover:text-sky-600"
                        }
                      `
                    }
                  >
                    <Icon className="h-4 w-4" />

                    {label}
                  </NavLink>
                );
              }
            )}
          </div>
        </nav>

        {/* =================================================
            RIGHT CONTROLS
        ================================================== */}

        <div className="flex items-center gap-2 shrink-0">
          {/* Agriculture Icon Toggle */}

          <div className="relative group">
            <button
              type="button"
              onClick={toggleAgriculture}
              aria-label={
                t.agriculture ||
                "Agriculture"
              }
              aria-pressed={agricultureMode}
              className={`
                h-10
                w-10
                rounded-xl
                flex
                items-center
                justify-center
                cursor-pointer
                transition-all
                ${
                  agricultureMode
                    ? "bg-green-100 text-green-600 hover:bg-green-200 shadow-sm"
                    : "bg-white text-ink-500 hover:bg-sky-50 hover:text-sky-700"
                }
              `}
            >
              <Sprout
                size={19}
                strokeWidth={
                  agricultureMode ? 2.5 : 2
                }
              />
            </button>

            {/* Tooltip */}

            <div
              className="
                pointer-events-none
                absolute
                right-0
                top-full
                mt-2
                z-50
                whitespace-nowrap
                rounded-lg
                bg-ink-900
                px-2.5
                py-1.5
                text-[11px]
                font-medium
                text-white
                opacity-0
                translate-y-1
                group-hover:opacity-100
                group-hover:translate-y-0
                transition-all
                duration-150
                shadow-lg
              "
            >
              Agriculture Mode
            </div>
          </div>

          {/* Language */}

          <LanguageSetter variant="dropdown" />

          {/* Alerts */}

          <button
            type="button"
            onClick={() => navigate("/alerts")}
            aria-label={t.alerts || "Alerts"}
            className="
              relative
              h-10 w-10
              rounded-full
              bg-white
              border border-sky-100
              shadow-sm
              flex items-center justify-center
              text-ink-500
              hover:bg-sky-50
              hover:text-sky-600
              active:scale-95
              transition-all
            "
          >
            <Bell
              size={18}
              strokeWidth={2}
            />

            {alerts?.length > 0 && (
              <span
                className="
                  absolute
                  top-1 right-1
                  h-2.5 w-2.5
                  rounded-full
                  bg-red-500
                  ring-2 ring-white
                "
              />
            )}
          </button>

          {/* Profile */}

          <button
            type="button"
            onClick={() => navigate("/profile")}
            aria-label={
              t.profile || "Profile"
            }
            className="
              h-10 w-10
              rounded-full
              bg-gradient-to-br
              from-sky-100
              to-blue-50
              border border-sky-200
              shadow-sm
              flex items-center justify-center
              text-sky-600
              hover:from-sky-200
              hover:to-blue-100
              hover:text-sky-700
              active:scale-95
              transition-all
            "
          >
            <User
              size={18}
              strokeWidth={2}
            />
          </button>
        </div>
      </div>
    </header>
  );
}
