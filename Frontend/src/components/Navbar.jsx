import { useNavigate } from "react-router-dom";
import { Bell, User } from "lucide-react";

import { useApp } from "../context/AppContext";

import logo from "../assets/logo_simple.png";

import { getGreeting } from "../utils/greeting";

export default function Navbar() {
  const { user, alerts } = useApp();
  const navigate = useNavigate();

  return (
    <header className="md:hidden sticky top-0 z-30 bg-white/85 backdrop-blur-sm border-b border-sky-100 px-4 py-3 flex items-center justify-between">

      {/* Logo + Greeting */}
      <div className="flex items-center gap-2">
        <span className="h-10 w-10 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-sky-100 to-blue-50 border border-sky-100 shadow-sm flex items-center justify-center overflow-hidden shrink-0">
          <img
            src={logo}
            className="
              w-full h-full
              p-0
              object-contain
              transition-transform duration-200
              hover:scale-110
            "
            alt="WeatherHub logo"
          />
        </span>

        <div>
          <p className="text-[11px] text-ink-400 leading-none">
            {getGreeting()}
          </p>

          <p className="text-sm font-display font-bold text-ink-900 leading-tight">
            {user?.name || "User"}
          </p>
        </div>
      </div>

      {/* Alerts + Profile */}
      <div className="flex items-center gap-2">

        {/* Alert Button */}
        <button
          type="button"
          onClick={() => navigate("/alerts")}
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
            hover:border-sky-200
            hover:shadow-md
            active:scale-95
            transition-all duration-200
          "
          aria-label="Weather Alerts"
        >
          <Bell size={17} strokeWidth={2} />

          {alerts?.length > 0 && (
            <span
              className="
                absolute
                top-1
                right-1
                h-2 w-2
                rounded-full
                bg-red-500
                ring-2 ring-white
              "
            />
          )}
        </button>

        {/* Profile Button */}
        <button
          type="button"
          onClick={() => navigate("/profile")}
          className="
            h-10 w-10
            rounded-full
            bg-gradient-to-br from-sky-100 to-blue-50
            border border-sky-200
            shadow-sm
            flex items-center justify-center
            text-sky-600
            hover:from-sky-200
            hover:to-blue-100
            hover:text-sky-700
            hover:shadow-md
            active:scale-95
            transition-all duration-200
          "
          aria-label="Profile"
        >
          <User size={17} strokeWidth={2} />
        </button>

      </div>
    </header>
  );
}