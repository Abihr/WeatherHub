
import { useNavigate } from "react-router-dom";
import { MapPin, RefreshCw } from "lucide-react";

import { useApp } from "../context/AppContext";
import { useLanguage } from "../context/LanguageContext";

import WeatherCard from "../components/WeatherCard";
import { weatherIcon } from "../data/mockData";
import EmptyState from "../components/EmptyState";
import ForecastUI from "../components/ForecastUI";

function getLocationText(friend) {
  if (!friend) return "Unknown location";

  // Location already stored as a string
  if (
    typeof friend.location === "string" &&
    friend.location.trim()
  ) {
    return friend.location;
  }

  // Location object: { city, lat, lng }
  if (
    friend.location &&
    typeof friend.location.city === "string" &&
    friend.location.city.trim()
  ) {
    return friend.location.city;
  }

  // Weather location name from Firebase
  if (
    friend.weather?.locationName &&
    typeof friend.weather.locationName === "string"
  ) {
    return friend.weather.locationName;
  }

  // Direct latitude / longitude
  const lat =
    friend.latitude ??
    friend.location?.lat ??
    friend.weather?.latitude;

  const lng =
    friend.longitude ??
    friend.location?.lng ??
    friend.weather?.longitude;

  if (
    typeof lat === "number" &&
    typeof lng === "number"
  ) {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }

  return "Unknown location";
}

function getTemperature(weather) {
  if (!weather) return null;

  if (typeof weather.temperature === "number") {
    return weather.temperature;
  }

  if (typeof weather.temp === "number") {
    return weather.temp;
  }

  return null;
}

/*
  Get greeting from actual local time.

  This avoids relying on an old/stale greeting value
  and keeps the greeting consistent with Day/Night.
*/
function getCurrentGreeting() {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return "Good Morning";
  }

  if (hour >= 12 && hour < 17) {
    return "Good Afternoon";
  }

  if (hour >= 17 && hour < 21) {
    return "Good Evening";
  }

  return "Good Night";
}

export default function Home() {
  const {
    user,
    friendsList,
    detectLocation,
    locating,
  } = useApp();

  const { t } = useLanguage();
  const navigate = useNavigate();

  const friends = friendsList.slice(0, 4);

  /*
    ---------------------------------------------------------
    CURRENT WEATHER
    ---------------------------------------------------------
  */
  const currentWeather = user?.weather || {};

  /*
    ---------------------------------------------------------
    FORECAST LOCATION FALLBACK
    ---------------------------------------------------------

    ForecastUI expects location information.

    Sometimes user.forecast.location is missing even though
    user.weather contains the correct location.

    Build a safe fallback here.
  */
  const forecast = user?.forecast
    ? {
        ...user.forecast,

        location:
          user.forecast.location ||
          user.weather?.location ||
          user.location ||
          {
            name:
              user.weather?.locationName ||
              user.weather?.location ||
              user.location ||
              "Your Location",

            country:
              user.weather?.country ||
              user.country ||
              "IN",

            latitude:
              user.forecast?.latitude ??
              user.weather?.latitude ??
              user.latitude ??
              null,

            longitude:
              user.forecast?.longitude ??
              user.weather?.longitude ??
              user.longitude ??
              null,

            timezone:
              user.forecast?.timezone ||
              user.weather?.timezone ||
              "Asia/Kolkata",
          },
      }
    : null;

  console.log("🏠 HOME FORECAST:", forecast);

  console.log("🏠 HOME WEATHER:", {
    location: user?.location,
    weather: user?.weather,
    forecast: user?.forecast,
  });

  const greeting = getCurrentGreeting();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-28 md:pb-10 flex flex-col gap-6">

      {/* =================================================
          DESKTOP GREETING
      ================================================= */}
      <div className="hidden md:flex items-center justify-between">
        <div>
          <p className="text-sm text-ink-400">
            {t[greeting] || greeting},
          </p>

          <h1 className="text-2xl font-display font-extrabold text-ink-900">
            {user?.name || t.user || "User"}
          </h1>
        </div>

        <button
          type="button"
          onClick={detectLocation}
          disabled={locating}
          className="
            flex items-center gap-2
            text-sm font-medium
            text-sky-600
            bg-sky-50
            px-4 py-2
            rounded-full
            hover:bg-sky-100
            transition-colors
            disabled:opacity-60
          "
        >
          <RefreshCw
            size={14}
            className={locating ? "animate-spin" : ""}
          />

          {locating
            ? t.updating || "Updating..."
            : t.refreshLocation || "Refresh location"}
        </button>
      </div>

      {/* =================================================
          YOUR WEATHER
      ================================================= */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-semibold text-ink-800">
            {t.todaysWeather || "Today's Weather"}
          </h2>

          <button
            type="button"
            onClick={detectLocation}
            disabled={locating}
            className="
              md:hidden
              flex items-center gap-1
              text-xs font-medium
              text-sky-600
              disabled:opacity-60
            "
          >
            <RefreshCw
              size={12}
              className={locating ? "animate-spin" : ""}
            />

            {locating
              ? t.updating || "Updating..."
              : t.refresh || "Refresh"}
          </button>
        </div>

        <WeatherCard
          location={
            user?.location ||
            currentWeather?.locationName ||
            currentWeather?.location ||
            t.yourLocation ||
            "Your Location"
          }
          weather={user?.weather}
          locating={locating}
        />
      </div>

      {/* =================================================
          FORECAST
      ================================================= */}
      {forecast && (
        <ForecastUI
          weatherData={forecast}
        />
      )}

      {/* =================================================
          MY FRIENDS
      ================================================= */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-semibold text-ink-800">
            {t.friendsWeather || "Friends Weather"}
          </h2>

          <button
            type="button"
            onClick={() => navigate("/friends")}
            className="
              text-xs
              font-medium
              text-sky-600
              hover:text-sky-700
            "
          >
            {t.viewAll || "View all"}
          </button>
        </div>

        {friends.length === 0 ? (
          <EmptyState
            icon="👥"
            title={
              t.noFriendsYet ||
              "No friends yet"
            }
            message={
              t.addFriendsWeather ||
              "Add friends to see their weather here."
            }
          />
        ) : (
          <div className="flex flex-col gap-3">
            {friends.map((friend) => {
              const locationText =
                getLocationText(friend);

              const temperature =
                getTemperature(friend.weather);

              return (
                <div
                  key={friend.id}
                  className="
                    rounded-xl
                    bg-white
                    shadow-card
                    p-4
                    flex
                    items-center
                    gap-3
                    animate-enter
                  "
                >

                  {/* FRIEND AVATAR */}
                  <div
                    className="
                      h-11 w-11
                      rounded-full
                      bg-sky-100
                      text-sky-700
                      font-display
                      font-semibold
                      flex
                      items-center
                      justify-center
                      text-sm
                      shrink-0
                    "
                  >
                    {friend.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase() || "U"}
                  </div>

                  {/* FRIEND INFORMATION */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-ink-800 truncate">
                      {friend.name ||
                        t.user ||
                        "User"}
                    </p>

                    <p className="text-xs text-ink-400 flex items-center gap-1 truncate">
                      <MapPin size={11} />

                      <span className="truncate">
                        {locationText}
                      </span>
                    </p>
                  </div>

                  {/* FRIEND WEATHER */}
                  {friend.weatherSharing &&
                  friend.weather ? (
                    <div className="text-right shrink-0">
                      <p className="text-lg leading-none">
                        {weatherIcon[
                          friend.weather.icon
                        ] || "🌤️"}{" "}
                        {temperature !== null
                          ? `${temperature}°C`
                          : "--"}
                      </p>

                      <p className="text-[10px] text-ink-400 mt-1">
                        {friend.weather.condition ||
                          t.weather ||
                          "Weather"}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-ink-400 shrink-0">
                      🔒 {t.hidden || "Hidden"}
                    </p>
                  )}

                  {/* VIEW FRIEND */}
                  <button
                    type="button"
                    onClick={() =>
                      navigate("/friends")
                    }
                    className="
                      text-xs
                      font-medium
                      px-3 py-1.5
                      rounded-full
                      bg-sky-50
                      text-sky-700
                      hover:bg-sky-100
                      transition-colors
                      shrink-0
                    "
                  >
                    {t.view || "View"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
