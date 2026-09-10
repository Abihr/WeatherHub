import {
  MapPin,
  Droplets,
  CloudRain,
  Wind,
  CloudLightning,
} from "lucide-react";

/* ============================================================
   TIME FORMATTER
   ============================================================ */

function formatHour(time, timezone = "Asia/Kolkata") {
  if (!time) return "--";

  // Open-Meteo returns local ISO strings such as:
  // 2026-09-10T21:00
  //
  // Adding a timezone to a string without an offset can cause
  // browser timezone conversion problems, so handle Open-Meteo
  // local time separately.

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

/* ============================================================
   DATE FORMATTER
   ============================================================ */

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

/* ============================================================
   RAIN COLOR
   ============================================================ */

function getRainColor(probability = 0) {
  const value = Number(probability) || 0;

  if (value >= 80) return "text-blue-600";
  if (value >= 50) return "text-sky-500";

  return "text-ink-400";
}

/* ============================================================
   WEATHER ICON
   ============================================================ */

function getWeatherIcon(hour) {
  const severe = hour?.severeWeather;

  // Direct thunderstorm signal
  if (
    hour?.weatherCode === 95 ||
    hour?.weatherCode === 96 ||
    hour?.weatherCode === 99
  ) {
    if (
      severe?.level === "severe" ||
      hour?.weatherCode === 96 ||
      hour?.weatherCode === 99
    ) {
      return "⛈️";
    }

    return "🌩️";
  }

  if (severe?.type === "Heavy Rain") {
    return "🌧️";
  }

  if (severe?.type === "Strong Wind") {
    return "💨";
  }

  if (Number(hour?.rainProbability) >= 60) {
    return "🌧️";
  }

  if (Number(hour?.temperature) >= 30) {
    return "☀️";
  }

  return "🌤️";
}

/* ============================================================
   SEVERE WEATHER
   ============================================================ */

function getSevereWeatherLabel(hour) {
  const severe = hour?.severeWeather;

  if (!severe || severe.level === "normal") {
    return null;
  }

  return severe;
}

/* ============================================================
   SEVERITY CLASSES
   ============================================================ */

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

/* ============================================================
   GET CURRENT LOCAL HOUR
   ============================================================ */

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

/* ============================================================
   FIND NEXT 24 HOURS
   ============================================================ */

function getNext24Hours(hourly, timezone = "Asia/Kolkata") {
  if (!Array.isArray(hourly) || hourly.length === 0) {
    return [];
  }

  const currentHour = getCurrentLocalHour(timezone);

  /*
   * Open-Meteo hourly times are sorted chronologically.
   *
   * Example:
   *
   * 00:00
   * 01:00
   * 02:00
   * ...
   * 20:00
   * 21:00  <-- current hour
   * 22:00
   *
   * We find 21:00 and take the next 24 records.
   */

  let startIndex = hourly.findIndex((hour) => {
    if (!hour?.time) return false;

    return String(hour.time).slice(0, 13) >=
      currentHour.slice(0, 13);
  });

  /*
   * If exact current hour isn't available, find the first
   * forecast hour after the current time.
   */

  if (startIndex === -1) {
    startIndex = 0;
  }

  return hourly.slice(startIndex, startIndex + 24);
}

/* ============================================================
   MAIN COMPONENT
   ============================================================ */

export default function ForecastUI({ weatherData }) {
  if (!weatherData) {
    return (
      <div className="rounded-xl2 bg-white shadow-card p-6 text-center">
        <p className="text-sm text-ink-400">
          Weather forecast unavailable
        </p>
      </div>
    );
  }

  const {
    location,
    country,
    latitude,
    longitude,
    timezone = "Asia/Kolkata",
    current,
    daily = [],
    hourly = [],
  } = weatherData;

  /* ============================================================
     IMPORTANT HOURLY FIX
     ============================================================ */

  const next24Hours = getNext24Hours(hourly, timezone);

  /* ============================================================
     SEVERE WEATHER
     ============================================================ */

  const severeHours = next24Hours.filter(
    (hour) =>
      hour?.severeWeather &&
      hour.severeWeather.level !== "normal"
  );

  const thunderstormHours = next24Hours.filter(
    (hour) =>
      hour?.weatherCode === 95 ||
      hour?.weatherCode === 96 ||
      hour?.weatherCode === 99
  );

  return (
    <div className="flex flex-col gap-6">

      {/* ======================================================
          LOCATION
      ====================================================== */}

      <div className="bg-white rounded-xl2 shadow-card p-5">
        <div className="flex items-center gap-3">

          <div className="h-11 w-11 rounded-full bg-sky-50 flex items-center justify-center">
            <MapPin
              size={20}
              className="text-sky-600"
            />
          </div>

          <div className="flex-1 min-w-0">

            <h2 className="font-display font-bold text-lg text-ink-900 truncate">
              {location || "Unknown Location"}
            </h2>

            <p className="text-xs text-ink-400">
              {country || "IN"}
            </p>

          </div>

        </div>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">

          {/* LATITUDE */}
          <div className="rounded-xl bg-sky-50 p-3">
            <p className="text-[10px] text-ink-400">
              Latitude
            </p>

            <p className="text-sm font-semibold text-ink-800">
              {Number.isFinite(Number(latitude))
                ? Number(latitude).toFixed(4)
                : "--"}
            </p>
          </div>

          {/* LONGITUDE */}
          <div className="rounded-xl bg-sky-50 p-3">
            <p className="text-[10px] text-ink-400">
              Longitude
            </p>

            <p className="text-sm font-semibold text-ink-800">
              {Number.isFinite(Number(longitude))
                ? Number(longitude).toFixed(4)
                : "--"}
            </p>
          </div>

          {/* TIMEZONE */}
          <div className="rounded-xl bg-sky-50 p-3">
            <p className="text-[10px] text-ink-400">
              Timezone
            </p>

            <p className="text-sm font-semibold text-ink-800 truncate">
              {timezone}
            </p>
          </div>

          {/* COORDINATES */}
          <div className="rounded-xl bg-sky-50 p-3">
            <p className="text-[10px] text-ink-400">
              Coordinates
            </p>

            <p className="text-sm font-semibold text-ink-800">
              GPS
            </p>
          </div>

        </div>
      </div>

      {/* ======================================================
          CURRENT WEATHER
      ====================================================== */}

      <div>

        <h2 className="font-display font-semibold text-ink-800 mb-3">
          Current Weather
        </h2>

        <div className="rounded-xl2 bg-white shadow-card p-5">

          <div className="flex items-center justify-between">

            <div>

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

            </div>

            <div className="text-6xl">
              🌤️
            </div>

          </div>

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

      {/* ======================================================
          SEVERE WEATHER ALERT
      ====================================================== */}

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
                Thunderstorm activity is detected in
                the forecast.
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

      {/* ======================================================
          7 DAY FORECAST
      ====================================================== */}

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

          {daily.map((day, index) => (

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

              {/* ICON */}
              <div className="text-2xl">

                {Number(day.rainProbability) >= 60
                  ? "🌧️"
                  : "🌤️"}

              </div>

              {/* TEMPERATURE */}
              <div className="flex-1">

                <div className="flex items-center gap-2">

                  <span className="font-semibold text-ink-900">
                    {Number.isFinite(Number(day.maxTemp))
                      ? Math.round(Number(day.maxTemp))
                      : "--"}
                    °
                  </span>

                  <span className="text-sm text-ink-400">
                    {Number.isFinite(Number(day.minTemp))
                      ? Math.round(Number(day.minTemp))
                      : "--"}
                    °
                  </span>

                </div>

                <div className="h-1.5 bg-sky-50 rounded-full mt-2 overflow-hidden">

                  <div
                    className="h-full bg-sky-400 rounded-full"
                    style={{
                      width: `${Math.min(
                        Number(day.rainProbability) || 0,
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

          ))}

        </div>

      </div>

      {/* ======================================================
          HOURLY FORECAST
      ====================================================== */}

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

          {/* ==================================================
              IMPORTANT:
              USE next24Hours INSTEAD OF hourly.slice(0, 24)
          ================================================== */}

          {next24Hours.length > 0 ? (
            next24Hours.map((hour, index) => {

              const severe =
                getSevereWeatherLabel(hour);

              const severityClasses =
                severe
                  ? getSeverityClasses(severe.level)
                  : null;

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

                  {/* WEATHER ICON */}
                  <div className="text-2xl my-2">
                    {getWeatherIcon(hour)}
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

                  {/* SEVERE WEATHER LABEL */}
                  {severe && (
                    <div
                      className={`
                        mt-2
                        text-[10px]
                        font-bold
                        ${severityClasses.text}
                      `}
                    >

                      {severe.icon}{" "}
                      {severe.type}

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

                  {/* CONVECTIVE INFORMATION */}
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