
import { Moon, Info } from "lucide-react";

import { useState } from "react";

import { useApp } from "../context/AppContext";

import { Toggle } from "../components/WeatherSharing";

export default function Settings() {
  const { pushToast } = useApp();

  const [units, setUnits] = useState("celsius");
  const [notifs, setNotifs] = useState(true);
  const [radius, setRadius] = useState(5);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 pb-28 md:pb-10 flex flex-col gap-5">
      {/* Settings title */}

      <h1 className="text-xl md:text-2xl font-display font-extrabold text-ink-900">
        Settings
      </h1>

      {/* General settings */}

      <div className="rounded-xl2 bg-white shadow-card p-5 flex flex-col gap-4">
        {/* =====================================================
            TEMPERATURE UNITS
        ====================================================== */}

        {/*
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2.5 text-sm font-medium text-ink-700">
            <Thermometer size={16} className="text-sky-500" />
            Temperature Units
          </span>

          <div className="flex gap-1 bg-sky-50 rounded-full p-1">
            {["celsius", "fahrenheit"].map((u) => (
              <button
                key={u}
                onClick={() => setUnits(u)}
                className={`text-xs font-medium px-3 py-1 rounded-full transition-colors ${
                  units === u
                    ? "bg-white text-sky-700 shadow-card"
                    : "text-ink-500"
                }`}
              >
                {u === "celsius" ? "°C" : "°F"}
              </button>
            ))}
          </div>
        </div>
        */}

        {/* =====================================================
            NEARBY RADIUS
        ====================================================== */}

        {/*
        <div className="flex items-center justify-between pt-4 border-t border-sky-50">
          <span className="flex items-center gap-2.5 text-sm font-medium text-ink-700">
            <Radius size={16} className="text-sky-500" />
            Nearby Radius
          </span>

          <span className="text-sm text-ink-500">
            {radius} km
          </span>
        </div>

        <input
          type="range"
          min="1"
          max="50"
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
          className="accent-sky-500 -mt-2"
        />
        */}

        {/* =====================================================
            WEATHER ALERT NOTIFICATIONS
        ====================================================== */}

        <div className="flex items-center justify-between pt-4 border-t border-sky-50">
          <span className="flex items-center gap-2.5 text-sm font-medium text-ink-700">
            <Moon
              size={16}
              className="text-sky-500"
            />

            Weather Alert Notifications
          </span>

          <Toggle
            checked={notifs}
            onChange={setNotifs}
          />
        </div>
      </div>

      {/* =====================================================
          SAVE SETTINGS
      ====================================================== */}

      <button
        onClick={() => pushToast("Settings saved")}
        className="
          rounded-xl2
          bg-sky-500
          text-white
          font-semibold
          text-sm
          py-2.5
          hover:bg-sky-600
          transition-colors
        "
      >
        Save Changes
      </button>

      {/* =====================================================
          INFORMATION
      ====================================================== */}

      <div className="rounded-xl2 bg-sky-50 p-4 flex items-start gap-2.5 text-sky-700">
        <Info
          size={15}
          className="shrink-0 mt-0.5"
        />

        <p className="text-xs">
          WeatherHub demo build — connect Firebase and a
          weather provider in{" "}
          <code className="font-mono">
            src/firebase
          </code>{" "}
          and{" "}
          <code className="font-mono">
            src/services
          </code>{" "}
          to go live.
        </p>
      </div>
    </div>
  );
}
