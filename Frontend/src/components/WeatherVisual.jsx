
import React from "react";

// ========================================================
// WEATHER TYPE
// ========================================================

function getWeatherType(weather = {}) {
  const rawCode =
    weather.weatherCode ??
    weather.weather_code ??
    weather.code;

  const code = Number(rawCode);

  // ======================================================
  // Open-Meteo WMO CODES
  // ======================================================

  // Thunderstorm
  if ([95, 96, 99].includes(code)) {
    return "storm";
  }

  // Snow
  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return "snow";
  }

  // Rain / Drizzle
  if (
    [
      51,
      53,
      55,
      56,
      57,
      61,
      63,
      65,
      66,
      67,
      80,
      81,
      82,
    ].includes(code)
  ) {
    return "rain";
  }

  // Fog
  if ([45, 48].includes(code)) {
    return "fog";
  }

  // Cloudy
  if ([1, 2, 3].includes(code)) {
    return "cloudy";
  }

  // Clear / Sunny
  if (code === 0) {
    return "sunny";
  }

  // ======================================================
  // TEXT FALLBACK
  // ======================================================

  const condition = String(
    weather.condition ??
      weather.weatherMain ??
      weather.main ??
      ""
  ).toLowerCase();

  if (
    condition.includes("thunder") ||
    condition.includes("storm")
  ) {
    return "storm";
  }

  if (condition.includes("snow")) {
    return "snow";
  }

  if (
    condition.includes("rain") ||
    condition.includes("drizzle")
  ) {
    return "rain";
  }

  if (
    condition.includes("fog") ||
    condition.includes("mist") ||
    condition.includes("haze")
  ) {
    return "fog";
  }

  if (
    condition.includes("cloud") ||
    condition.includes("overcast")
  ) {
    return "cloudy";
  }

  if (
    condition.includes("clear") ||
    condition.includes("sunny")
  ) {
    return "sunny";
  }

  return "cloudy";
}

// ========================================================
// DAY / NIGHT
// ========================================================
//
// Open-Meteo:
// is_day = 1 → DAY
// is_day = 0 → NIGHT
//
// OpenWeather:
// icon ending "d" → DAY
// icon ending "n" → NIGHT
// ========================================================

function getIsDay(weather = {}) {
  // ------------------------------------------------------
  // Open-Meteo
  // ------------------------------------------------------

  const value =
    weather.is_day ??
    weather.isDay;

  if (
    value !== undefined &&
    value !== null &&
    value !== ""
  ) {
    const numericValue = Number(value);

    // 1 = DAY
    if (numericValue === 1) {
      return true;
    }

    // 0 = NIGHT
    if (numericValue === 0) {
      return false;
    }
  }

  // ------------------------------------------------------
  // OpenWeather fallback
  // ------------------------------------------------------

  const icon =
    weather.icon ??
    weather.weatherIcon ??
    weather.openWeatherIcon;

  if (icon) {
    const iconString = String(icon).toLowerCase();

    // OpenWeather:
    // 01d, 02d, 03d... = DAY
    // 01n, 02n, 03n... = NIGHT

    if (iconString.endsWith("d")) {
      return true;
    }

    if (iconString.endsWith("n")) {
      return false;
    }
  }

  // ------------------------------------------------------
  // Unknown
  // ------------------------------------------------------
  //
  // Default to DAY instead of incorrectly showing NIGHT.
  //

  return true;
}

// ========================================================
// NIGHT CHECK
// ========================================================

function isNightTime(weather = {}) {
  return getIsDay(weather) === false;
}

// ========================================================
// CONTAINER SIZE
// ========================================================

function getContainerSize(small) {
  return small
    ? "relative w-12 h-12 flex items-center justify-center"
    : "relative w-28 h-28 flex items-center justify-center";
}

// ========================================================
// SUNNY
// ========================================================

function SunnyVisual({ night, small }) {
  return (
    <div className={getContainerSize(small)}>
      {night ? (
        <>
          <div
            className={
              small
                ? "text-4xl animate-pulse"
                : "text-7xl animate-pulse"
            }
          >
            🌙
          </div>

          <span className="absolute top-1 right-1 text-xs">
            ✨
          </span>

          <span className="absolute bottom-2 left-2 text-xs">
            ✨
          </span>
        </>
      ) : (
        <div
          className={
            small
              ? "text-4xl animate-spin-slow"
              : "text-7xl animate-spin-slow"
          }
        >
          ☀️
        </div>
      )}
    </div>
  );
}

// ========================================================
// CLOUDY
// ========================================================

function CloudyVisual({ night, small }) {
  return (
    <div className={getContainerSize(small)}>
      <div
        className={
          small
            ? "absolute top-0 left-1 text-xl"
            : "absolute top-0 left-2 text-4xl"
        }
      >
        {night ? "🌙" : "☀️"}
      </div>

      <div
        className={
          small
            ? "text-4xl animate-cloud"
            : "text-7xl animate-cloud"
        }
      >
        ☁️
      </div>
    </div>
  );
}

// ========================================================
// RAIN
// ========================================================

function RainVisual({ night, small }) {
  return (
    <div className={getContainerSize(small)}>
      <div
        className={
          small
            ? "absolute top-0 left-1 text-xl"
            : "absolute top-0 left-2 text-4xl"
        }
      >
        {night ? "🌙" : "☀️"}
      </div>

      <div
        className={
          small
            ? "text-4xl animate-cloud"
            : "text-7xl animate-cloud"
        }
      >
        🌧️
      </div>

      {!small && (
        <div className="absolute bottom-0 left-5 text-sm animate-pulse">
          💧 💧 💧
        </div>
      )}
    </div>
  );
}

// ========================================================
// STORM
// ========================================================

function StormVisual({ night, small }) {
  return (
    <div className={getContainerSize(small)}>
      <div
        className={
          small
            ? "absolute top-0 left-1 text-lg"
            : "absolute top-0 left-2 text-3xl"
        }
      >
        {night ? "🌙" : "☀️"}
      </div>

      <div
        className={
          small
            ? "text-4xl animate-lightning"
            : "text-7xl animate-lightning"
        }
      >
        ⛈️
      </div>
    </div>
  );
}

// ========================================================
// SNOW
// ========================================================

function SnowVisual({ night, small }) {
  return (
    <div className={getContainerSize(small)}>
      <div
        className={
          small
            ? "absolute top-0 left-1 text-lg"
            : "absolute top-0 left-2 text-3xl"
        }
      >
        {night ? "🌙" : "☀️"}
      </div>

      <div
        className={
          small
            ? "text-4xl animate-snow"
            : "text-7xl animate-snow"
        }
      >
        ❄️
      </div>
    </div>
  );
}

// ========================================================
// FOG
// ========================================================

function FogVisual({ night, small }) {
  return (
    <div className={getContainerSize(small)}>
      <div
        className={
          small
            ? "absolute top-0 left-1 text-lg"
            : "absolute top-0 left-2 text-3xl"
        }
      >
        {night ? "🌙" : "☀️"}
      </div>

      <div
        className={
          small
            ? "text-4xl animate-fog"
            : "text-7xl animate-fog"
        }
      >
        🌫️
      </div>
    </div>
  );
}

// ========================================================
// MAIN COMPONENT
// ========================================================

export default function WeatherVisual({
  weather = {},
  size = "large",
}) {
  const small = size === "small";

  // ======================================================
  // RESOLVE DAY / NIGHT
  // ======================================================

  const isDay = getIsDay(weather);

  const night = !isDay;

  // ======================================================
  // RESOLVE WEATHER TYPE
  // ======================================================

  const type = getWeatherType(weather);

  // ======================================================
  // DEBUG
  // ======================================================

  console.log("🔥 WeatherVisual RESULT:", {
    weatherCode:
      weather.weatherCode ??
      weather.weather_code ??
      weather.code,

    is_day: weather.is_day,

    isDay: weather.isDay,

    resolvedIsDay: isDay,

    night,

    type,
  });

  // ======================================================
  // RENDER
  // ======================================================

  switch (type) {
    case "sunny":
      return (
        <SunnyVisual
          night={night}
          small={small}
        />
      );

    case "cloudy":
      return (
        <CloudyVisual
          night={night}
          small={small}
        />
      );

    case "rain":
      return (
        <RainVisual
          night={night}
          small={small}
        />
      );

    case "storm":
      return (
        <StormVisual
          night={night}
          small={small}
        />
      );

    case "snow":
      return (
        <SnowVisual
          night={night}
          small={small}
        />
      );

    case "fog":
      return (
        <FogVisual
          night={night}
          small={small}
        />
      );

    default:
      return (
        <CloudyVisual
          night={night}
          small={small}
        />
      );
  }
}
