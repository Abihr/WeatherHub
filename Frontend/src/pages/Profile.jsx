
import { useNavigate } from "react-router-dom";

import {
  MapPin,
  ShieldOff,
  LogOut,
  ChevronRight,
  Moon,
  Sun,
  Settings,
} from "lucide-react";

import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";

import { useApp } from "../context/AppContext";

import WeatherSharing from "../components/WeatherSharing";
import LocationSharing from "../components/LocationSharing";

export default function Profile() {
  const {
    user,
    friendsList,
    blocked,
    pushToast,
    darkMode,
    toggleDarkMode,
  } = useApp();

  const navigate = useNavigate();

  // ========================================
  // Firebase Sign Out
  // ========================================

  async function handleSignOut() {
    try {
      await signOut(auth);
      console.log("Signed out successfully");

      // App.jsx will detect user === null
      // and automatically show Login.jsx
    } catch (error) {
      console.error("Sign out error:", error);
      pushToast("Failed to sign out. Please try again.", "error");
    }
  }

  // ========================================
  // User Initials
  // ========================================

  const initials = (user?.name || "User")
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // ========================================
  // Safe Location Text
  // ========================================

  const locationText = (() => {
    if (typeof user?.location === "string") {
      return user.location;
    }

    if (typeof user?.location?.city === "string") {
      return user.location.city;
    }

    if (typeof user?.locationText === "string") {
      return user.locationText;
    }

    if (
      typeof user?.location?.lat === "number" &&
      typeof user?.location?.lng === "number"
    ) {
      return `${user.location.lat.toFixed(4)}, ${user.location.lng.toFixed(4)}`;
    }

    return "Location not available";
  })();

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode ? "bg-slate-950" : "bg-slate-50"
      }`}
    >
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 pb-28 md:pb-10 flex flex-col gap-5">

        {/* ========================================
            Header
        ======================================== */}

        <div className="flex items-center justify-between">
          <h1
            className={`text-2xl font-display font-extrabold ${
              darkMode ? "text-white" : "text-ink-900"
            }`}
          >
            Profile
          </h1>

          {/* Dark Mode Button - currently disabled */}
          {/*
          <button
            onClick={toggleDarkMode}
            className={`h-10 w-10 rounded-full flex items-center justify-center transition-colors ${
              darkMode
                ? "bg-slate-800 text-yellow-300 hover:bg-slate-700"
                : "bg-white text-slate-700 shadow-card hover:bg-slate-100"
            }`}
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          */}
        </div>

        {/* ========================================
            Profile Card
        ======================================== */}

        <div className="rounded-xl3 bg-hero-gradient text-white p-5 flex items-center gap-4 shadow-pop">

          {/* Avatar */}
          <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm font-display font-bold text-xl flex items-center justify-center shrink-0">
            {initials}
          </div>

          {/* User Information */}
          <div className="min-w-0">
            <h1 className="text-2xl font-display font-extrabold truncate">
              {user?.name || "User"}
            </h1>

            {/* Location */}
            <p className="text-sky-100 text-2xs flex items-center gap-1 mt-1">
              <MapPin size={11} />
              {locationText}
            </p>
          </div>
        </div>

        {/* ========================================
            Friends / Blocked
        ======================================== */}

        <div className="grid grid-cols-2 gap-3">

          {/* Friends */}
          <div
            className={`rounded-xl2 shadow-card p-4 text-center transition-colors ${
              darkMode ? "bg-slate-900" : "bg-white"
            }`}
          >
            <p
              className={`text-2xl font-display font-bold ${
                darkMode ? "text-white" : "text-ink-900"
              }`}
            >
              {friendsList?.length || 0}
            </p>

            <p
              className={`text-xs ${
                darkMode ? "text-slate-400" : "text-ink-400"
              }`}
            >
              Friends
            </p>
          </div>

          {/* Blocked */}
          <button
            onClick={() => navigate("/blocked")}
            className={`rounded-xl2 shadow-card p-4 text-center transition-colors ${
              darkMode
                ? "bg-slate-900 hover:bg-slate-800"
                : "bg-white hover:bg-sky-50"
            }`}
          >
            <p
              className={`text-2xl font-display font-bold ${
                darkMode ? "text-white" : "text-ink-900"
              }`}
            >
              {blocked?.length || 0}
            </p>

            <p
              className={`text-xs ${
                darkMode ? "text-slate-400" : "text-ink-400"
              }`}
            >
              Blocked
            </p>
          </button>
        </div>

        {/* ========================================
            Weather Sharing
        ======================================== */}

        <WeatherSharing />

        {/* ========================================
            Location Sharing
        ======================================== */}

        {/* <LocationSharing /> */}

        {/* ========================================
            Settings
        ======================================== */}

        <button
          onClick={() => navigate("/settings")}
          className={`rounded-xl2 shadow-card p-4 flex items-center gap-3 transition-colors ${
            darkMode
              ? "bg-slate-900 hover:bg-slate-800"
              : "bg-white hover:bg-sky-50"
          }`}
        >
          <span
            className={`h-9 w-9 rounded-full flex items-center justify-center ${
              darkMode
                ? "bg-slate-800 text-slate-300"
                : "bg-sky-50 text-sky-600"
            }`}
          >
            <Settings size={16} />
          </span>

          <span
            className={`flex-1 text-left text-sm font-medium ${
              darkMode ? "text-slate-200" : "text-ink-700"
            }`}
          >
            Settings
          </span>

          <ChevronRight
            size={16}
            className={darkMode ? "text-slate-500" : "text-ink-400"}
          />
        </button>

        {/* ========================================
            Blocked Users
        ======================================== */}

        <button
          onClick={() => navigate("/blocked")}
          className={`rounded-xl2 shadow-card p-4 flex items-center gap-3 transition-colors ${
            darkMode
              ? "bg-slate-900 hover:bg-slate-800"
              : "bg-white hover:bg-sky-50"
          }`}
        >
          <span
            className={`h-9 w-9 rounded-full flex items-center justify-center ${
              darkMode
                ? "bg-slate-800 text-slate-300"
                : "bg-ink-50 text-ink-500"
            }`}
          >
            <ShieldOff size={16} />
          </span>

          <span
            className={`flex-1 text-left text-sm font-medium ${
              darkMode ? "text-slate-200" : "text-ink-700"
            }`}
          >
            Blocked Users
          </span>

          <ChevronRight
            size={16}
            className={darkMode ? "text-slate-500" : "text-ink-400"}
          />
        </button>

        {/* ========================================
            Sign Out
        ======================================== */}

        <button
          onClick={handleSignOut}
          className={`rounded-xl2 shadow-card p-4 flex items-center gap-3 transition-colors ${
            darkMode
              ? "bg-slate-900 hover:bg-red-950"
              : "bg-white hover:bg-red-50"
          }`}
        >
          <span className="h-9 w-9 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
            <LogOut size={16} />
          </span>

          <span className="flex-1 text-left text-sm font-medium text-red-500">
            Sign Out
          </span>
        </button>

      </div>
    </div>
  );
}

