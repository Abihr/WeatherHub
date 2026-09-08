
import { weatherIcon } from "../data/mockData";

/*
 * Get a human-readable location name.
 *
 * Priority:
 * 1. weather.locationName
 * 2. locationText
 * 3. location.name
 * 4. location.city
 * 5. string location
 */
function getLocationText(friend) {
  if (!friend) {
    return "Unknown location";
  }

  // 1. Weather location name
  if (
    typeof friend.weather?.locationName === "string" &&
    friend.weather.locationName.trim()
  ) {
    return friend.weather.locationName.trim();
  }

  // 2. Firebase locationText
  if (
    typeof friend.locationText === "string" &&
    friend.locationText.trim()
  ) {
    return friend.locationText.trim();
  }

  // 3. location.name
  if (
    typeof friend.location?.name === "string" &&
    friend.location.name.trim()
  ) {
    return friend.location.name.trim();
  }

  // 4. location.city
  if (
    typeof friend.location?.city === "string" &&
    friend.location.city.trim()
  ) {
    return friend.location.city.trim();
  }

  // 5. location itself is already a string
  if (typeof friend.location === "string") {
    return friend.location;
  }

  return "Unknown location";
}

/*
 * Format Firestore weatherUpdatedAt timestamp.
 *
 * Examples:
 * "just now"
 * "5 minutes ago"
 * "2 hours ago"
 * "08 Sep, 07:30 PM"
 */
function formatWeatherUpdatedAt(timestamp) {
  if (!timestamp) {
    return null;
  }

  try {
    const date = timestamp?.toDate
      ? timestamp.toDate()
      : new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    const diffMs = Date.now() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);

    if (diffMinutes < 1) {
      return "just now";
    }

    if (diffMinutes === 1) {
      return "1 minute ago";
    }

    if (diffMinutes < 60) {
      return `${diffMinutes} minutes ago`;
    }

    const diffHours = Math.floor(diffMinutes / 60);

    if (diffHours === 1) {
      return "1 hour ago";
    }

    if (diffHours < 24) {
      return `${diffHours} hours ago`;
    }

    return date.toLocaleString([], {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return null;
  }
}

/*
 * Comparison row.
 *
 * Displays:
 * +8°C  -> 8°C higher
 * -19%  -> 19% lower
 * 0     -> Same
 */
function Delta({
  label,
  icon,
  you,
  friend,
  unit,
  higherLabel = "higher",
  lowerLabel = "lower",
}) {
  const youValue = Number(you) || 0;
  const friendValue = Number(friend) || 0;

  const diff = friendValue - youValue;
  const absoluteDiff = Math.round(Math.abs(diff));

  let differenceText;
  let differenceClass;

  if (diff === 0) {
    differenceText = "Same";
    differenceClass = "text-ink-500";
  } else if (diff > 0) {
    differenceText = `${absoluteDiff}${unit} ${higherLabel}`;
    differenceClass = "text-sky-600";
  } else {
    differenceText = `${absoluteDiff}${unit} ${lowerLabel}`;
    differenceClass = "text-ink-400";
  }

  /*
   * Bar widths.
   */
  const max = Math.max(
    Math.abs(youValue),
    Math.abs(friendValue),
    1
  );

  const youPct = Math.max(
    (Math.abs(youValue) / max) * 100,
    4
  );

  const friendPct = Math.max(
    (Math.abs(friendValue) / max) * 100,
    4
  );

  return (
    <div className="py-3">
      {/* Label + difference */}
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-ink-600 flex items-center gap-1.5">
          <span>{icon}</span>
          {label}
        </span>

        <span
          className={`text-sm font-semibold ${differenceClass}`}
        >
          {differenceText}
        </span>
      </div>

      {/* Bars */}
      <div className="flex items-center gap-2">
        {/* Your value */}
        <div className="flex-1 h-2 rounded-full bg-sky-100 overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${youPct}%`,
              backgroundColor: "#9BB2C9",
            }}
          />
        </div>

        {/* Friend value */}
        <div className="flex-1 h-2 rounded-full bg-sky-100 overflow-hidden">
          <div
            className="h-full bg-sky-500 rounded-full"
            style={{
              width: `${friendPct}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default function WeatherComparison({
  you,
  youLabel,
  friend,
  friendLabel,
}) {
  /*
   * Your weather.
   */
  const yourWeather = you?.weather || {};

  /*
   * Friend weather is available only when:
   * 1. Friend enabled weather sharing.
   * 2. Friend has weather data.
   */
  const weatherShared =
    friend?.weatherSharing === true &&
    friend?.weather != null;

  const friendWeather = weatherShared
    ? friend.weather
    : {};

  /*
   * Temperature.
   */
  const yourTemperature =
    Number(yourWeather.temperature) || 0;

  const friendTemperature = weatherShared
    ? Number(friendWeather.temperature) || 0
    : 0;

  const tempDiff =
    friendTemperature - yourTemperature;

  const roundedTempDiff = Math.round(
    Math.abs(tempDiff)
  );

  const warmer =
    !weatherShared || tempDiff === 0
      ? null
      : tempDiff > 0;

  /*
   * Weather icons.
   */
  const yourIcon =
    weatherIcon?.[yourWeather.icon] || "🌤️";

  const friendIcon =
    weatherIcon?.[friendWeather.icon] || "🌤️";

  /*
   * Location names.
   */
  const yourLocation = getLocationText(you);
  const friendLocation = getLocationText(friend);

  /*
   * Friend weather update time.
   */
  const friendWeatherUpdatedAt =
    formatWeatherUpdatedAt(
      friend?.weatherUpdatedAt
    );

  return (
    <div className="rounded-xl3 bg-white shadow-card p-6 animate-enter">
      {/* Header */}
      <h3 className="font-display font-bold text-lg text-ink-900 mb-5">
        Compare Weather
      </h3>

      {/* Weather Cards */}
      <div className="grid grid-cols-2 gap-3 mb-2">
        {/* YOU */}
        <div className="rounded-xl2 bg-sky-50 p-4 text-center">
          <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide mb-1">
            {youLabel}
          </p>

          <p className="text-xs text-ink-400 mb-2 truncate">
            📍 {yourLocation}
          </p>

          <p className="text-3xl mb-1">
            {yourIcon}
          </p>

          <p className="text-2xl font-display font-bold text-ink-900">
            {Math.round(yourTemperature)}°C
          </p>
        </div>

        {/* FRIEND */}
        {weatherShared ? (
          <div className="rounded-xl2 bg-hero-gradient p-4 text-center text-white">
            <p className="text-xs font-semibold text-sky-50 uppercase tracking-wide mb-1">
              {friendLabel}
            </p>

            <p className="text-xs text-sky-100 mb-2 truncate">
              📍 {friendLocation}
            </p>

            <p className="text-3xl mb-1">
              {friendIcon}
            </p>

            <p className="text-2xl font-display font-bold">
              {Math.round(friendTemperature)}°C
            </p>

            {/* Weather update time */}
            {friendWeatherUpdatedAt && (
              <p className="text-xs text-sky-100 mt-2">
                Updated {friendWeatherUpdatedAt}
              </p>
            )}
          </div>
        ) : (
          <div className="rounded-xl2 bg-ink-50 p-4 text-center flex flex-col items-center justify-center">
            <p className="text-3xl mb-2">
              🔒
            </p>

            <p className="text-sm font-semibold text-ink-600">
              Weather Not Shared
            </p>

            <p className="text-xs text-ink-400 mt-1">
              {friendLabel} hasn't shared weather data.
            </p>
          </div>
        )}
      </div>

      {/* Temperature Difference */}
      {weatherShared && warmer !== null && (
        <p className="text-center text-sm text-ink-500 my-4">
          {friendLabel}'s area is{" "}
          <span className="font-semibold text-ink-800">
            {roundedTempDiff}°C{" "}
            {warmer ? "warmer" : "cooler"}
          </span>
        </p>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-ink-400 mb-1 px-0.5">
        <span className="flex items-center gap-1.5">
          <span
            className="h-2 w-2 rounded-full"
            style={{
              backgroundColor: "#9BB2C9",
            }}
          />
          {youLabel}
        </span>

        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-sky-500" />
          {friendLabel}
        </span>
      </div>

      {/* Comparison Rows */}
      {weatherShared ? (
        <div className="divide-y divide-sky-50">
          {/* Temperature */}
          <Delta
            label="Temperature"
            icon="🌡️"
            you={yourTemperature}
            friend={friendTemperature}
            unit="°C"
            higherLabel="warmer"
            lowerLabel="cooler"
          />

          {/* Humidity */}
          <Delta
            label="Humidity"
            icon="💧"
            you={yourWeather.humidity}
            friend={friendWeather.humidity}
            unit="%"
            higherLabel="higher"
            lowerLabel="lower"
          />

          {/* Wind */}
          <Delta
            label="Wind"
            icon="💨"
            you={yourWeather.wind}
            friend={friendWeather.wind}
            unit=" km/h"
            higherLabel="faster"
            lowerLabel="slower"
          />

          {/* Rain Probability */}
          <Delta
            label="Rain Probability"
            icon="🌧️"
            you={yourWeather.rainProbability}
            friend={friendWeather.rainProbability}
            unit="%"
            higherLabel="higher"
            lowerLabel="lower"
          />
        </div>
      ) : (
        <div className="mt-4 rounded-xl2 bg-ink-50 p-4 text-center">
          <p className="text-sm font-medium text-ink-600">
            Comparison unavailable
          </p>

          <p className="text-xs text-ink-400 mt-1">
            {friendLabel} has turned off weather sharing.
          </p>
        </div>
      )}
    </div>
  );
}

