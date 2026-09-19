
import {
  MapPin,
  Droplets,
  CloudRain,
  Wind,
  CloudLightning,
} from "lucide-react";

import WeatherVisual from "./weather/WeatherVisual";
import { ForecastUISkeleton } from "./Loading";

// ============================================================
// TIME FORMATTER
// ============================================================

function formatHour(time, timezone = "Asia/Kolkata") {
  if (!time) return "--";

  const match = String(time).match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/
  );

  if (match) {
    const [, year, month, day, hour, minute] = match;

    const date = new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute)
    );

    return date.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  const date = new Date(time);

  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return date.toLocaleTimeString("en-IN", {
    timeZone: timezone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// ============================================================
// DATE FORMATTER
// ============================================================

function formatDate(date) {
  if (!date) return "--";

  const d = new Date(`${date}T00:00:00`);

  if (Number.isNaN(d.getTime())) {
    return "--";
  }

  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

// ============================================================
// RAIN COLOR
// ============================================================

function getRainColor(probability = 0) {
  const value = Number(probability) || 0;

  if (value >= 80) {
    return "text-blue-600";
  }

  if (value >= 50) {
    return "text-sky-500";
  }

  return "text-ink-400";
}

// ============================================================
// SEVERE WEATHER
// ============================================================

function getSevereWeatherLabel(hour) {
  const severe = hour?.severeWeather;

  if (!severe || severe.level === "normal") {
    return null;
  }

  return severe;
}

// ============================================================
// SEVERITY CLASSES
// ============================================================

function getSeverityClasses(level) {
  switch (level) {
    case "severe":
      return {
        container: "bg-red-50 border border-red-200",
        text: "text-red-700",
      };

    case "high":
      return {
        container: "bg-orange-50 border border-orange-200",
        text: "text-orange-700",
      };

    case "moderate":
      return {
        container: "bg-yellow-50 border border-yellow-200",
        text: "text-yellow-700",
      };

    default:
      return {
        container: "bg-sky-50 border border-sky-100",
        text: "text-sky-700",
      };
  }
}

// ============================================================
// CURRENT LOCAL HOUR
// ============================================================

function getCurrentLocalHour(timezone = "Asia/Kolkata") {
  const now = new Date();

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);

  const values = {};

  parts.forEach((part) => {
    if (part.type !== "literal") {
      values[part.type] = part.value;
    }
  });

  return `${values.year}-${values.month}-${values.day}T${values.hour}:00`;
}

// ============================================================
// NEXT 24 HOURS
// ============================================================

function getNext24Hours(
  hourly,
  timezone = "Asia/Kolkata"
) {
  if (!Array.isArray(hourly) || hourly.length === 0) {
    return [];
  }

  const currentHour = getCurrentLocalHour(timezone);

  let startIndex = hourly.findIndex((hour) => {
    if (!hour?.time) {
      return false;
    }

    return (
      String(hour.time).slice(0, 13) >=
      currentHour.slice(0, 13)
    );
  });

  if (startIndex === -1) {
    startIndex = 0;
  }

  return hourly.slice(startIndex, startIndex + 24);
}

// ============================================================
// GET IS DAY
// ============================================================
//
// Open-Meteo:
// 1 = DAY
// 0 = NIGHT
//
// ============================================================

function getIsDay(data) {
  const rawValue =
    data?.is_day ??
    data?.isDay;

  if (
    rawValue === undefined ||
    rawValue === null ||
    rawValue === ""
  ) {
    return null;
  }

  const value = Number(rawValue);

  if (value === 1) {
    return 1;
  }

  if (value === 0) {
    return 0;
  }

  return null;
}

// ============================================================
// DAY / NIGHT LABEL
// ============================================================

function getDayNightLabel(data) {
  const isDay = getIsDay(data);

  if (isDay === null) {
    return null;
  }

  return isDay === 1
    ? "☀️ Day"
    : "🌙 Night";
}

// ============================================================
// WEATHER VISUAL DATA
// ============================================================

function buildWeatherVisualData(data = {}) {
  const weatherCode =
    data.weatherCode ??
    data.weather_code ??
    data.code ??
    null;

  const isDay = getIsDay(data);

  return {
    weatherCode,

    is_day: isDay,

    isDay: isDay,

    condition:
      data.condition ??
      data.weatherMain ??
      data.main ??
      "",

    weatherMain:
      data.weatherMain ??
      data.main ??
      "",

    temperature:
      data.temperature ??
      data.temp ??
      null,

    rainProbability:
      data.rainProbability ??
      data.precipitationProbability ??
      0,

    icon:
      data.icon ??
      data.weatherIcon ??
      data.openWeatherIcon ??
      null,

    weatherIcon:
      data.weatherIcon ??
      data.openWeatherIcon ??
      data.icon ??
      null,

    openWeatherIcon:
      data.openWeatherIcon ??
      data.weatherIcon ??
      data.icon ??
      null,
  };
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function ForecastUI({
  weatherData,
}) {
  // ==========================================================
  // LOADING
  // ==========================================================

  if (!weatherData) {
    return <ForecastUISkeleton />;
  }

  // ==========================================================
  // BACKEND DATA
  // ==========================================================

  const {
    location: locationData,
    current,
    daily = [],
    hourly = [],
  } = weatherData;

  // ==========================================================
  // LOCATION
  // ==========================================================

  const {
    name: location = "Unknown Location",
    country = "IN",
    latitude,
    longitude,
    timezone = "Asia/Kolkata",
  } = locationData || {};

  // ==========================================================
  // NEXT 24 HOURS
  // ==========================================================

  const next24Hours = getNext24Hours(
    hourly,
    timezone
  );

  // ==========================================================
  // CURRENT DAY / NIGHT
  // ==========================================================

  const currentIsDay = getIsDay(current);

  const currentDayNightLabel =
    getDayNightLabel(current);

  // ==========================================================
  // DEBUG
  // ==========================================================

  console.log("🌤️ WeatherHub Current:", current);

  console.log(
    "🌞 WeatherHub Current is_day:",
    current?.is_day
  );

  console.log(
    "🌞 WeatherHub Current resolved:",
    currentIsDay
  );

  console.log(
    "🕐 WeatherHub Hourly:",
    next24Hours.map((hour) => ({
      time: hour.time,
      is_day: hour.is_day,
      weatherCode: hour.weatherCode,
    }))
  );

  // ==========================================================
  // SEVERE WEATHER
  // ==========================================================

  const severeHours = next24Hours.filter(
    (hour) =>
      hour?.severeWeather &&
      hour.severeWeather.level !== "normal"
  );

  // ==========================================================
  // THUNDERSTORM
  // ==========================================================

  const thunderstormHours = next24Hours.filter(
    (hour) => {
      const code = Number(hour?.weatherCode);

      return (
        code === 95 ||
        code === 96 ||
        code === 99
      );
    }
  );

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="flex flex-col gap-6">

      {/* ====================================================
          LOCATION
      ==================================================== */}

     

      {/* ====================================================
          CURRENT WEATHER
      ==================================================== */}

      <div>

        <h2 className="font-display font-semibold text-ink-800 mb-3">
          Current Weather
        </h2>

        <div className="rounded-xl2 bg-white shadow-card p-5">

          <div className="flex items-center justify-between gap-4">

            {/* WEATHER TEXT */}

            <div className="min-w-0">

              <p className="text-sm text-ink-400">
                Right now
              </p>

              <div className="flex items-end gap-2 mt-1">

                <span className="text-4xl font-display font-extrabold text-ink-900">
                  {current?.temperature ?? "--"}°
                </span>

                <span className="text-sm text-ink-400 mb-1">
                  C
                </span>

              </div>

              <p className="text-sm text-ink-500 mt-1 capitalize">
                {current?.condition ||
                  "Weather unavailable"}
              </p>

              {/* DAY / NIGHT */}

              {currentDayNightLabel && (
                <p className="text-xs text-sky-600 mt-1 font-medium">
                  {currentDayNightLabel}
                </p>
              )}

            </div>

            {/* WEATHER VISUAL */}

            <div className="w-32 h-28 flex items-center justify-center shrink-0 overflow-visible">

              <WeatherVisual
                weather={buildWeatherVisualData(
                  current
                )}
                size="large"
              />

            </div>

          </div>

          {/* WEATHER DETAILS */}

          <div className="grid grid-cols-3 gap-3 mt-5">

            {/* HUMIDITY */}

            <div className="rounded-xl bg-sky-50 p-3">

              <Droplets
                size={16}
                className="text-sky-600 mb-2"
              />

              <p className="text-[10px] text-ink-400">
                Humidity
              </p>

              <p className="font-semibold text-ink-800">
                {current?.humidity ?? "--"}%
              </p>

            </div>

            {/* FEELS LIKE */}

            <div className="rounded-xl bg-sky-50 p-3">

              <Wind
                size={16}
                className="text-sky-600 mb-2"
              />

              <p className="text-[10px] text-ink-400">
                Feels Like
              </p>

              <p className="font-semibold text-ink-800">
                {current?.feelsLike ?? "--"}°
              </p>

            </div>

            {/* CONDITION */}

            <div className="rounded-xl bg-sky-50 p-3">

              <CloudRain
                size={16}
                className="text-sky-600 mb-2"
              />

              <p className="text-[10px] text-ink-400">
                Condition
              </p>

              <p className="font-semibold text-ink-800 capitalize truncate">
                {current?.condition || "--"}
              </p>

            </div>

          </div>

        </div>

      </div>

      {/* ====================================================
          THUNDERSTORM ALERT
      ==================================================== */}

      {thunderstormHours.length > 0 && (

        <div className="rounded-xl2 bg-orange-50 border border-orange-200 p-5">

          <div className="flex items-start gap-3">

            <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">

              <CloudLightning
                size={20}
                className="text-orange-600"
              />

            </div>

            <div className="min-w-0">

              <h2 className="font-display font-bold text-orange-800">
                Thunderstorm Forecast
              </h2>

              <p className="text-sm text-orange-700 mt-1">
                Thunderstorm activity is detected
                in the forecast.
              </p>

              <p className="text-xs text-orange-600 mt-2">
                {thunderstormHours.length} forecast hour
                {thunderstormHours.length !== 1
                  ? "s"
                  : ""}{" "}
                affected
              </p>

            </div>

          </div>

        </div>

      )}

      {/* ====================================================
          OTHER SEVERE WEATHER
      ==================================================== */}

      {severeHours.length > 0 &&
        thunderstormHours.length === 0 && (

          <div className="rounded-xl2 bg-orange-50 border border-orange-200 p-5">

            <div className="flex items-start gap-3">

              <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">

                <CloudLightning
                  size={20}
                  className="text-orange-600"
                />

              </div>

              <div>

                <h2 className="font-display font-bold text-orange-800">
                  Severe Weather Alert
                </h2>

                <p className="text-sm text-orange-700 mt-1">
                  Severe weather conditions are
                  detected in the upcoming forecast.
                </p>

              </div>

            </div>

          </div>

        )}

      {/* ====================================================
          7 DAY FORECAST
      ==================================================== */}

      <div>

        <div className="flex items-center justify-between mb-3">

          <h2 className="font-display font-semibold text-ink-800">
            7-Day Forecast
          </h2>

          <span className="text-xs text-ink-400">
            Rain probability
          </span>

        </div>

        <div className="flex flex-col gap-2">

          {daily.length > 0 ? (

            daily.map((day, index) => {

              // Daily forecast represents daytime
              // conditions.

              const dailyVisual =
                buildWeatherVisualData({
                  weatherCode:
                    day.weatherCode ??
                    day.weather_code,

                  is_day: 1,

                  condition:
                    day.condition ||
                    (Number(day.rainProbability) >= 60
                      ? "rain"
                      : "clear"),

                  temperature:
                    day.maxTemp,

                  rainProbability:
                    day.rainProbability,
                });

              return (

                <div
                  key={day.date || index}
                  className="
                    bg-white
                    rounded-xl2
                    shadow-card
                    px-4
                    py-3
                    flex
                    items-center
                    gap-3
                  "
                >

                  {/* DATE */}

                  <div className="w-20 shrink-0">

                    <p className="text-sm font-semibold text-ink-800">
                      {index === 0
                        ? "Today"
                        : formatDate(day.date)}
                    </p>

                  </div>

                  {/* WEATHER VISUAL */}

                  <div className="w-12 h-12 flex items-center justify-center shrink-0">

                    <WeatherVisual
                      weather={dailyVisual}
                      size="small"
                    />

                  </div>

                  {/* TEMPERATURE */}

                  <div className="flex-1 min-w-0">

                    <div className="flex items-center gap-2">

                      <span className="font-semibold text-ink-900">
                        {Number.isFinite(
                          Number(day.maxTemp)
                        )
                          ? Math.round(
                              Number(day.maxTemp)
                            )
                          : "--"}
                        °
                      </span>

                      <span className="text-sm text-ink-400">
                        {Number.isFinite(
                          Number(day.minTemp)
                        )
                          ? Math.round(
                              Number(day.minTemp)
                            )
                          : "--"}
                        °
                      </span>

                    </div>

                    {/* RAIN BAR */}

                    <div className="h-1.5 bg-sky-50 rounded-full mt-2 overflow-hidden">

                      <div
                        className="
                          h-full
                          bg-sky-400
                          rounded-full
                          transition-all
                          duration-700
                        "
                        style={{
                          width: `${Math.min(
                            Number(
                              day.rainProbability
                            ) || 0,
                            100
                          )}%`,
                        }}
                      />

                    </div>

                  </div>

                  {/* RAIN */}

                  <div className="text-right shrink-0">

                    <p
                      className={`text-sm font-semibold ${getRainColor(
                        day.rainProbability
                      )}`}
                    >
                      {day.rainProbability ?? 0}%
                    </p>

                    <p className="text-[10px] text-ink-400">
                      {day.rain ?? 0} mm
                    </p>

                  </div>

                </div>

              );
            })

          ) : (

            <div className="rounded-xl2 bg-white shadow-card p-5 text-center">

              <p className="text-sm text-ink-400">
                Daily forecast unavailable
              </p>

            </div>

          )}

        </div>

      </div>

      {/* ====================================================
          HOURLY FORECAST
      ==================================================== */}

      <div>

        <div className="flex items-center justify-between mb-3">

          <h2 className="font-display font-semibold text-ink-800">
            Hourly Forecast
          </h2>

          <span className="text-xs text-ink-400">
            Next 24 hours
          </span>

        </div>

        <div
          className="
            flex
            gap-3
            overflow-x-auto
            pb-2
            scrollbar-hide
          "
        >

          {next24Hours.length > 0 ? (

            next24Hours.map((hour, index) => {

              const severe =
                getSevereWeatherLabel(hour);

              const severityClasses = severe
                ? getSeverityClasses(
                    severe.level
                  )
                : null;

              const hourDayNight =
                getDayNightLabel(hour);

              return (

                <div
                  key={`${hour.time}-${index}`}
                  className={`
                    min-w-[125px]
                    rounded-xl2
                    shadow-card
                    p-3
                    text-center
                    shrink-0
                    border
                    ${
                      severe
                        ? severityClasses.container
                        : "bg-white border-transparent"
                    }
                  `}
                >

                  {/* TIME */}

                  <p className="text-xs font-medium text-ink-400">

                    {index === 0
                      ? "Now"
                      : formatHour(
                          hour.time,
                          timezone
                        )}

                  </p>

                  {/* DAY / NIGHT */}

                  {hourDayNight && (

                    <p className="text-[9px] text-sky-500 mt-1 font-medium">
                      {hourDayNight}
                    </p>

                  )}

                  {/* WEATHER VISUAL */}

                  <div className="w-14 h-14 mx-auto my-1 flex items-center justify-center overflow-visible">

                    <WeatherVisual
                      weather={buildWeatherVisualData(
                        hour
                      )}
                      size="small"
                    />

                  </div>

                  {/* TEMPERATURE */}

                  <p className="text-lg font-display font-bold text-ink-900">

                    {Number.isFinite(
                      Number(hour.temperature)
                    )
                      ? Math.round(
                          Number(hour.temperature)
                        )
                      : "--"}

                    °

                  </p>

                  {/* SEVERE WEATHER */}

                  {severe && (

                    <div
                      className={`
                        mt-2
                        text-[10px]
                        font-bold
                        ${severityClasses.text}
                      `}
                    >
                      {severe.icon} {severe.type}
                    </div>

                  )}

                  {/* HUMIDITY */}

                  <div className="flex items-center justify-center gap-1 mt-2">

                    <Droplets
                      size={11}
                      className="text-sky-500"
                    />

                    <span className="text-[10px] text-ink-400">
                      {hour.humidity ?? "--"}%
                    </span>

                  </div>

                  {/* RAIN PROBABILITY */}

                  <div className="flex items-center justify-center gap-1 mt-1">

                    <CloudRain
                      size={11}
                      className="text-sky-500"
                    />

                    <span
                      className={`
                        text-[10px]
                        font-medium
                        ${getRainColor(
                          hour.rainProbability
                        )}
                      `}
                    >
                      {hour.rainProbability ?? 0}%
                    </span>

                  </div>

                  {/* RAIN AMOUNT */}

                  {Number(hour.precipitation) > 0 && (

                    <p className="text-[10px] text-ink-400 mt-1">

                      💧{" "}

                      {Number(
                        hour.precipitation
                      ).toFixed(1)}{" "}

                      mm

                    </p>

                  )}

                  {/* CAPE / WIND GUST */}

                  {severe &&
                    (Number(hour.cape) > 0 ||
                      Number(hour.windGust) > 0) && (

                      <div className="mt-2 pt-2 border-t border-black/5">

                        {Number(hour.cape) > 0 && (

                          <p className="text-[9px] text-ink-400">

                            CAPE{" "}

                            {Math.round(
                              Number(hour.cape)
                            )}

                          </p>

                        )}

                        {Number(hour.windGust) > 0 && (

                          <p className="text-[9px] text-ink-400">

                            Gust{" "}

                            {Math.round(
                              Number(hour.windGust)
                            )}{" "}

                            km/h

                          </p>

                        )}

                      </div>

                    )}

                </div>

              );
            })

          ) : (

            <div className="w-full rounded-xl2 bg-white shadow-card p-5 text-center">

              <p className="text-sm text-ink-400">
                Hourly forecast unavailable
              </p>

            </div>

          )}

        </div>

      </div>

    </div>
  );
}
