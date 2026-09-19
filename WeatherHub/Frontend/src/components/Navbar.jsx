import { NavLink, useNavigate } from "react-router-dom";
import {
  Bell,
  User,
  Home,
  Users,
  Map,
  Bot,
  Sprout,
  Train,
  Settings,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";

import { useApp } from "../context/AppContext";
import { useLanguage } from "../context/LanguageContext";

import logo from "../assets/logo_simple.png";
import LanguageSetter from "./LanguageSetter";

import { getGreeting } from "../utils/greeting";

export default function Navbar() {
  const { user, alerts } = useApp();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [agricultureMode, setAgricultureMode] = useState(
    localStorage.getItem("agricultureMode") === "true"
  );

  useEffect(() => {
    const syncAgricultureMode = () => {
      setAgricultureMode(localStorage.getItem("agricultureMode") === "true");
    };
    window.addEventListener("agricultureModeChanged", syncAgricultureMode);
    return () =>
      window.removeEventListener("agricultureModeChanged", syncAgricultureMode);
  }, []);

  const links = [
    { to: "/", label: t.home, icon: Home, end: true },
    { to: "/friends", label: t.friends, icon: Users },
    { to: "/map", label: t.map, icon: Map },
    { to: "/chatbot", label: t.weatherGPT, icon: Bot, sparkle: true },
    { to: "/alerts", label: t.alerts, icon: Bell },
    ...(agricultureMode
      ? [{ to: "/farmer", label: t.agriculture, icon: Sprout }]
      : []),
    { to: "/railway-weather", label: t.railway, icon: Train },
    { to: "/settings", label: t.settings, icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-sky-100 px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center gap-3">

        {/* LEFT — Logo + Greeting */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="h-10 w-10 rounded-xl bg-gradient-to-br from-sky-100 to-blue-50 border border-sky-100 shadow-sm flex items-center justify-center overflow-hidden">
            <img
              src={logo}
              className="w-full h-full p-0 object-contain transition-transform duration-200 hover:scale-110"
              alt="WeatherHub logo"
            />
          </span>

          <div className="hidden sm:block">
            <p className="text-[10px] text-ink-400 leading-none">
              {getGreeting()}
            </p>
            <p className="text-sm font-display font-bold text-ink-900 leading-tight">
              {user?.name || "User"}
            </p>
          </div>
        </div>

        {/* CENTER — Nav Links */}
        <nav className="flex-1 flex justify-center min-w-0 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-1 min-w-max">
            {links.map(({ to, label, icon: Icon, end, sparkle }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `group relative flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? "bg-sky-100 text-sky-700 shadow-sm"
                      : "text-ink-500 hover:bg-sky-50 hover:text-ink-800 hover:-translate-y-0.5 hover:shadow-sm"
                  }`
                }
              >
                <span className="relative flex items-center justify-center">
                  <Icon
                    size={16}
                    strokeWidth={2.2}
                    className="transition-transform duration-200 group-hover:scale-110 group-hover:rotate-3"
                  />
                  {sparkle && (
                    <Sparkles
                      size={10}
                      className="absolute -top-1.5 -right-1.5 text-sun-400 animate-pulse"
                    />
                  )}
                </span>
                <span>{label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        {/* RIGHT — Language + Alerts + Profile */}
        <div className="flex items-center gap-2 shrink-0">
          <LanguageSetter variant="dropdown" />

          <button
            type="button"
            onClick={() => navigate("/alerts")}
            className="relative h-10 w-10 rounded-full bg-white border border-sky-100 shadow-sm flex items-center justify-center text-ink-500 hover:bg-sky-50 hover:text-sky-600 hover:border-sky-200 hover:shadow-md active:scale-95 transition-all duration-200"
            aria-label="Weather Alerts"
          >
            <Bell size={17} strokeWidth={2} />
            {alerts?.length > 0 && (
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white animate-pulse" />
            )}
          </button>

          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="h-10 w-10 rounded-full bg-gradient-to-br from-sky-100 to-blue-50 border border-sky-200 shadow-sm flex items-center justify-center text-sky-600 hover:from-sky-200 hover:to-blue-100 hover:text-sky-700 hover:shadow-md active:scale-95 transition-all duration-200"
            aria-label="Profile"
          >
            <User size={17} strokeWidth={2} />
          </button>
        </div>
      </div>
    </header>
  );
}