import { useEffect, useState } from "react";

import { NavLink } from "react-router-dom";

import {
  Home,
  Users,
  Map,
  Train,
  MoreHorizontal,
  RefreshCw,
  User,
  Bot,
  Inbox,
  Bell,
  Sprout,
  Settings,
  X,
} from "lucide-react";

const primaryLinks = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/friends", label: "Friends", icon: Users },
  { to: "/map", label: "Map", icon: Map },
  { to: "/railway-weather", label: "Railway", icon: Train },
];

const moreLinks = [
  { to: "/compare", label: "Compare", icon: RefreshCw },
  { to: "/chatbot", label: "WeatherGPT", icon: Bot },
  { to: "/requests", label: "Requests", icon: Inbox },
  { to: "/alerts", label: "Alerts", icon: Bell },
  { to: "/farmer", label: "Farmer", icon: Sprout },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function BottomNav() {
  const [moreOpen, setMoreOpen] = useState(false);

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

  const visibleMoreLinks = moreLinks.filter(
    ({ to }) =>
      to !== "/farmer" || agricultureMode
  );

  return (
    <>
      {/* More Menu */}
      {moreOpen && (
        <>
          {/* Background overlay */}
          <div
            className="md:hidden fixed inset-0 z-40 bg-black/20"
            onClick={() => setMoreOpen(false)}
          />

          {/* More panel */}
          <div className="md:hidden fixed bottom-[70px] left-3 right-3 z-50 bg-white rounded-2xl shadow-xl border border-sky-100 p-3">
            <div className="flex items-center justify-between px-2 pb-2 mb-2 border-b border-sky-100">
              <span className="text-sm font-semibold text-ink-800">
                More
              </span>

              <button
                onClick={() => setMoreOpen(false)}
                className="p-1.5 rounded-lg text-ink-400 hover:bg-sky-50"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {visibleMoreLinks.map(
                ({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => setMoreOpen(false)}
                    className={({ isActive }) =>
                      `flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl text-[11px] font-medium transition-colors ${
                        isActive
                          ? "bg-sky-100 text-sky-700"
                          : "text-ink-500 hover:bg-sky-50"
                      }`
                    }
                  >
                    <Icon
                      size={20}
                      strokeWidth={2.1}
                    />

                    {label}
                  </NavLink>
                )
              )}
            </div>
          </div>
        </>
      )}

      {/* Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-sm border-t border-sky-100 px-2 py-1.5 flex items-center justify-between pb-[calc(0.375rem+env(safe-area-inset-bottom))]">

        {/* Primary links */}
        {primaryLinks.map(
          ({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 py-1.5 px-2 sm:px-3 rounded-xl2 text-[10px] sm:text-[10.5px] font-medium transition-colors ${
                  isActive
                    ? "text-sky-600"
                    : "text-ink-400"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={19}
                    strokeWidth={
                      isActive ? 2.4 : 2
                    }
                  />

                  {label}
                </>
              )}
            </NavLink>
          )
        )}

        {/* More button */}
        <button
          onClick={() => setMoreOpen(!moreOpen)}
          className={`flex flex-col items-center gap-0.5 py-1.5 px-2 sm:px-3 rounded-xl2 text-[10px] sm:text-[10.5px] font-medium transition-colors ${
            moreOpen
              ? "text-sky-600"
              : "text-ink-400"
          }`}
        >
          <MoreHorizontal
            size={19}
            strokeWidth={moreOpen ? 2.4 : 2}
          />

          More
        </button>
      </nav>
    </>
  );
}