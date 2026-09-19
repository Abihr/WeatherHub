import {
    Droplets,
    Wind,
    CloudRain,
    MapPin,
} from "lucide-react";

import WeatherVisual from "./weather/WeatherVisual";
import { useLanguage } from "../context/LanguageContext";

export default function WeatherCard({
    location,
    weather,
    size = "hero",
    locating,
}) {
    const { t } = useLanguage();

    // =========================================================
    // LOADING STATE
    // =========================================================

    if (locating) {
        return (
            <div className="rounded-xl3 p-6 bg-white shadow-card">
                <div className="skeleton h-4 w-24 rounded-full mb-4" />
                <div className="skeleton h-12 w-28 rounded-lg mb-3" />
                <div className="skeleton h-4 w-36 rounded-full mb-6" />

                <div className="grid grid-cols-3 gap-3">
                    <div className="skeleton h-14 rounded-xl2" />
                    <div className="skeleton h-14 rounded-xl2" />
                    <div className="skeleton h-14 rounded-xl2" />
                </div>
            </div>
        );
    }

    // =========================================================
    // NO WEATHER DATA
    // =========================================================

    if (!weather) return null;

    // =========================================================
    // SUPPORT BOTH:
    //
    // weather = actual weather object
    //
    // OR
    //
    // weather = { current: {...} }
    // =========================================================

    const currentWeather = weather.current ?? weather;

    // =========================================================
    // TEMPERATURE
    // =========================================================

    const temperature =
        currentWeather.temperature ??
        currentWeather.temp ??
        "--";

    // =========================================================
    // LOCATION
    // =========================================================

    const locationText =
        typeof location === "string"
            ? location
            : location?.city ||
              currentWeather.locationName ||
              currentWeather.location?.name ||
              t.unknownLocation ||
              "Unknown location";

    // =========================================================
    // WEATHER CODE
    // =========================================================

    const weatherCode =
        currentWeather.weatherCode ??
        currentWeather.weather_code ??
        currentWeather.code ??
        null;

    // =========================================================
    // DAY / NIGHT
    // =========================================================
    //
    // Open-Meteo:
    // 1 = Day
    // 0 = Night
    //
    // IMPORTANT:
    // Never use || because 0 is a valid value.
    // =========================================================

    let isDay = null;

    const rawIsDay =
        currentWeather.is_day ??
        currentWeather.isDay;

    if (
        rawIsDay !== undefined &&
        rawIsDay !== null &&
        rawIsDay !== ""
    ) {
        const numericIsDay = Number(rawIsDay);

        if (numericIsDay === 0 || numericIsDay === 1) {
            isDay = numericIsDay;
        }
    }

    // =========================================================
    // OPENWEATHER FALLBACK
    // =========================================================

    const weatherIcon =
        currentWeather.icon ??
        currentWeather.weatherIcon ??
        currentWeather.openWeatherIcon ??
        null;

    if (isDay === null && weatherIcon) {
        const iconString = String(weatherIcon).toLowerCase();

        if (iconString.endsWith("d")) {
            isDay = 1;
        } else if (iconString.endsWith("n")) {
            isDay = 0;
        }
    }

    // =========================================================
    // WEATHER VISUAL DATA
    // =========================================================

    const weatherForVisual = {
        ...currentWeather,

        // Weather code
        weatherCode,

        // Day/night
        // 0 remains 0
        is_day: isDay,

        // Compatibility
        isDay,

        // Icons
        icon: weatherIcon,
        weatherIcon,

        // Condition
        condition:
            currentWeather.condition ||
            currentWeather.main ||
            currentWeather.weatherMain ||
            "",
    };

    // =========================================================
    // DEBUG
    // =========================================================

    console.log("🌤️ WEATHER CARD");

    console.log("Original weather:", weather);

    console.log("Current weather:", currentWeather);

    console.log("Weather visual:", weatherForVisual);

    console.log("is_day:", weatherForVisual.is_day);

    console.log("isDay:", weatherForVisual.isDay);

    console.log("weatherCode:", weatherForVisual.weatherCode);

    // =========================================================
    // WEATHER CONDITION
    // =========================================================

    const condition =
        currentWeather.condition ||
        currentWeather.main ||
        currentWeather.weatherMain ||
        t.unknown ||
        "Unknown";

    // =========================================================
    // COMPACT CARD
    // =========================================================

    if (size === "compact") {
        return (
            <div className="rounded-xl2 bg-sky-50 px-4 py-3 flex items-center gap-3">

                {/* Weather visual */}
                <div className="w-16 h-16 flex items-center justify-center shrink-0">
                    <WeatherVisual
                        weather={weatherForVisual}
                        size="small"
                    />
                </div>

                {/* Weather information */}
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink-800">
                        {condition}
                    </p>

                    <p className="text-xs text-ink-400">
                        {t.humidity || "Humidity"}{" "}
                        {currentWeather.humidity ?? "--"}%
                        {" · "}
                        {t.wind || "Wind"}{" "}
                        {currentWeather.wind ?? "--"} km/h
                    </p>
                </div>

                {/* Temperature */}
                <p className="text-xl font-display font-bold text-ink-900">
                    {temperature}°
                </p>
            </div>
        );
    }

    // =========================================================
    // HERO CARD
    // =========================================================

    return (
        <div
            className="
                rounded-xl3
                p-6 sm:p-7
                bg-hero-gradient
                text-white
                shadow-pop
                relative
                overflow-hidden
                animate-enter
            "
        >

            {/* =================================================
                DECORATIVE BACKGROUND VISUAL
            ================================================= */}

            <div
                className="
                    absolute
                    right-2
                    top-2
                    w-56
                    h-56
                    opacity-80
                    pointer-events-none
                "
            >
                <WeatherVisual
                    weather={weatherForVisual}
                />
            </div>

            <div className="relative z-10">

                {/* =================================================
                    LOCATION
                ================================================= */}

                <p
                    className="
                        flex
                        items-center
                        gap-1
                        text-sm
                        text-sky-100
                        font-medium
                        mb-4
                    "
                >
                    <MapPin size={14} />
                    {locationText}
                </p>

                {/* =================================================
                    TEMPERATURE + VISUAL
                ================================================= */}

                <div
                    className="
                        flex
                        items-end
                        gap-4
                        mb-1
                    "
                >

                    {/* Main weather visual */}
                    <div
                        className="
                            w-28
                            h-28
                            flex
                            items-center
                            justify-center
                            shrink-0
                            overflow-hidden
                        "
                    >
                        <WeatherVisual
                            weather={weatherForVisual}
                        />
                    </div>

                    {/* Temperature */}
                    <span
                        className="
                            text-6xl
                            font-display
                            font-extrabold
                            leading-none
                            tracking-tight
                        "
                    >
                        {temperature}

                        <span className="text-3xl align-top">
                            °C
                        </span>
                    </span>
                </div>

                {/* =================================================
                    CONDITION
                ================================================= */}

                <p
                    className="
                        text-lg
                        font-medium
                        text-sky-50
                        mt-2
                    "
                >
                    {condition}
                </p>

                {/* =================================================
                    DAY / NIGHT
                ================================================= */}

                {isDay !== null && (
                    <p
                        className="
                            text-xs
                            text-sky-100
                            font-medium
                            mt-1
                        "
                    >
                        {isDay === 1
                            ? "☀️ Day"
                            : "🌙 Night"}
                    </p>
                )}

                {/* =================================================
                    FEELS LIKE
                ================================================= */}

                <p className="text-sm text-sky-100/90">
                    {t.feelsLike || "Feels like"}{" "}
                    {currentWeather.feelsLike ??
                        currentWeather.feels_like ??
                        "--"}
                    °C
                </p>

                {/* =================================================
                    STATS
                ================================================= */}

                <div
                    className="
                        grid
                        grid-cols-3
                        gap-3
                        mt-6
                    "
                >
                    <Stat
                        icon={Droplets}
                        label={t.humidity || "Humidity"}
                        value={`${currentWeather.humidity ?? "--"}%`}
                    />

                    <Stat
                        icon={Wind}
                        label={t.wind || "Wind"}
                        value={`${currentWeather.wind ?? "--"} km/h`}
                    />

                    <Stat
                        icon={CloudRain}
                        label={t.rainfall || "Rain"}
                        value={`${currentWeather.rain ?? 0}%`}
                    />
                </div>
            </div>
        </div>
    );
}

// =========================================================
// STAT COMPONENT
// =========================================================

function Stat({
    icon: Icon,
    label,
    value,
}) {
    return (
        <div
            className="
                rounded-xl2
                bg-white/15
                backdrop-blur-sm
                px-3
                py-2.5
                text-center
            "
        >
            <Icon
                size={15}
                className="mx-auto mb-1 text-sky-50"
            />

            <p
                className="
                    text-sm
                    font-semibold
                    leading-none
                "
            >
                {value}
            </p>

            <p
                className="
                    text-[10px]
                    text-sky-100/80
                    mt-1
                "
            >
                {label}
            </p>
        </div>
    );
}