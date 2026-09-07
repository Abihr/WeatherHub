import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";

import {
  Home,
  Users,
  Inbox,
  Map,
  RefreshCw,
  Bell,
  User,
  Settings,
  Bot,
  Sprout,
  Train,
} from "lucide-react";

import { useApp } from "../context/AppContext";

import logo from "../assets/logo_simple.png";

const links = [
  { to: "/", label: "Home", icon: Home },
  { to: "/friends", label: "Friends", icon: Users },
  { to: "/requests", label: "Requests", icon: Inbox },
  { to: "/map", label: "Map", icon: Map },
  { to: "/compare", label: "Compare", icon: RefreshCw },
  { to: "/chatbot", label: "WeatherGPT", icon: Bot },
  { to: "/alerts", label: "Alerts", icon: Bell },
  { to: "/farmer", label: "Agriculture", icon: Sprout },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/railway-weather", label: "Railway Weather", icon: Train },
];

export default function Sidebar() {
  const { received } = useApp();

  const [agricultureMode, setAgricultureMode] = useState(
    localStorage.getItem("agricultureMode") === "true"
  );

  useEffect(() => {
    const handleAgricultureModeChange = () => {
      setAgricultureMode(
        localStorage.getItem("agricultureMode") === "true"
      );
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

  return (
    <aside className="hidden md:flex md:flex-col w-64 shrink-0 h-screen sticky top-0 border-r border-sky-100 bg-white/70 backdrop-blur-sm px-4 py-6">

      {/* Logo */}
      <div className="flex items-center gap-3 px-2 mb-8">
        <div
          className="
            w-15 h-15
            p-1
            rounded-2xl
            shadow-sm
            flex items-center justify-center
            overflow-hidden
          "
        >
          <img
            src={logo}
            className="w-full h-full object-cover transition-transform duration-200 hover:scale-110"
            alt="WeatherHub logo"
          />
        </div>

        <span
          className="
            font-display
            font-extrabold
            text-lg
            text-ink-900
            tracking-tight
          "
        >
          WeatherHub
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-1">
        {links
          .filter(
            ({ to }) =>
              to !== "/farmer" || agricultureMode
          )
          .map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3.5 py-2.5 rounded-xl2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-sky-100 text-sky-700"
                    : "text-ink-500 hover:bg-sky-50 hover:text-ink-800"
                }`
              }
            >
              <Icon
                size={18}
                strokeWidth={2.1}
              />

              <span className="flex-1">
                {label}
              </span>

              {/* Friend request notification */}
              {label === "Requests" && received.length > 0 && (
                <span className="text-[11px] font-semibold bg-sun-400 text-white rounded-full h-5 min-w-5 px-1 flex items-center justify-center">
                  {received.length}
                </span>
              )}
            </NavLink>
          ))}
      </nav>

      {/* Settings */}
      <div className="pt-4 mt-4 border-t border-sky-100">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3.5 py-2.5 rounded-xl2 text-sm font-medium transition-colors ${
              isActive
                ? "bg-sky-100 text-sky-700"
                : "text-ink-500 hover:bg-sky-50 hover:text-ink-800"
            }`
          }
        >
          <Settings
            size={18}
            strokeWidth={2.1}
          />

          Settings
        </NavLink>
      </div>
    </aside>
  );
}