import { NavLink } from "react-router-dom";
import {
  Home,
  Users,
  Inbox,
  Map,
  RefreshCw,
  Bell,
  User,
  Settings,
  CloudSun,
  Train,           // ← NEW
  AlertTriangle,   // ← NEW
} from "lucide-react";
import { useApp } from "../context/AppContext";
import logo from "../assets/logo_simple.png";

const links = [
  { to: "/", label: "Home", icon: Home },
  { to: "/friends", label: "Friends", icon: Users },
  { to: "/requests", label: "Requests", icon: Inbox },
  { to: "/map", label: "Map", icon: Map },
  { to: "/compare", label: "Compare", icon: RefreshCw },
  { to: "/alerts", label: "Alerts", icon: Bell },
  { to: "/railway", label: "Railway", icon: Train },
  { to: "/farmer", label: "Farmer", icon: Sprout }, // ← NEW
  { to: "/profile", label: "Profile", icon: User },
];

export default function Sidebar() {
  const { received } = useApp();

  // Mock data - replace with actual state later
  const criticalAlerts = 2; // ← For badge on Railway

  return (
    <aside className="hidden md:flex md:flex-col w-64 shrink-0 h-screen sticky top-0 border-r border-sky-100 bg-white/70 backdrop-blur-sm px-4 py-6">
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
            className="
        w-full hfull
        object-cover
        transition-transform duration-200
        hover:scale-110
      "
            alt="WeatherCircle logo"
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
          WeatherCircle
        </span>
      </div>

      <nav className="flex-1 flex flex-col gap-1">
        {links.map(({ to, label, icon: Icon }) => (
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
            <Icon size={18} strokeWidth={2.1} />
            <span className="flex-1">{label}</span>
            
            {/* Badge for Requests */}
            {label === "Requests" && received.length > 0 && (
              <span className="text-[11px] font-semibold bg-sun-400 text-white rounded-full h-5 min-w-5 px-1 flex items-center justify-center">
                {received.length}
              </span>
            )}

            {/* Badge for Railway Critical Alerts */}
            {label === "Railway" && criticalAlerts > 0 && (
              <span className="text-[11px] font-semibold bg-red-500 text-white rounded-full h-5 min-w-5 px-1 flex items-center justify-center animate-pulse">
                {criticalAlerts}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

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
          <Settings size={18} strokeWidth={2.1} />
          Settings
        </NavLink>
      </div>
    </aside>
  );
}