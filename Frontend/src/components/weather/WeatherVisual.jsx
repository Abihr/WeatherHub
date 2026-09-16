import React from "react";

// ========================================================
// WEATHER TYPE
// ========================================================

function getWeatherType(weather = {}) {
    const code = Number(
        weather.weatherCode ??
        weather.weather_code ??
        weather.code
    );

    // Open-Meteo WMO codes
    if ([95, 96, 99].includes(code)) {
        return "storm";
    }

    if ([71, 73, 75, 77, 85, 86].includes(code)) {
        return "snow";
    }

    if (
        [
            51, 53, 55,
            56, 57,
            61, 63, 65,
            66, 67,
            80, 81, 82
        ].includes(code)
    ) {
        return "rain";
    }

    if ([45, 48].includes(code)) {
        return "fog";
    }

    if ([1, 2, 3].includes(code)) {
        return "cloudy";
    }

    if (code === 0) {
        return "sunny";
    }

    // OpenWeather fallback
    const condition = String(
        weather.condition ??
        weather.weatherMain ??
        ""
    ).toLowerCase();

    if (condition.includes("thunder")) {
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

    if (condition.includes("cloud")) {
        return "cloudy";
    }

    return "sunny";
}

// ========================================================
// DAY / NIGHT
// ========================================================

function isNightTime(weather = {}) {
    const value =
        weather.is_day ??
        weather.isDay ??
        weather.isNight;

    console.log("🌙 WeatherVisual:", {
        is_day: weather.is_day,
        isDay: weather.isDay,
        isNight: weather.isNight,
        icon: weather.icon,
        weatherIcon: weather.weatherIcon,
        value,
    });

    if (value !== undefined && value !== null) {
        // Open-Meteo: 0 = night, 1 = day
        if (Number(value) === 0) return true;
        if (Number(value) === 1) return false;
    }

    if (weather.icon) {
        return String(weather.icon).endsWith("n");
    }

    if (weather.weatherIcon) {
        return String(weather.weatherIcon).endsWith("n");
    }

    return false;
}

// ========================================================
// SUNNY
// ========================================================

function SunnyVisual({ night, small }) {
    console.log("☀️ SunnyVisual night =", night);

    return (
        <div
            className={
                small
                    ? "relative w-12 h-12 flex items-center justify-center"
                    : "relative w-28 h-28 flex items-center justify-center"
            }
        >
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
    const containerSize = small
        ? "relative w-12 h-12 flex items-center justify-center"
        : "relative w-28 h-28 flex items-center justify-center";

    const cloudSize = small
        ? "text-4xl"
        : "text-7xl";

    const backgroundIconSize = small
        ? "text-xl"
        : "text-4xl";

    return (
        <div className={containerSize}>

            <div
                className={
                    small
                        ? "absolute top-0 left-1 text-xl"
                        : "absolute top-0 left-2 text-4xl"
                }
            >
                {night ? "🌙" : "☀️"}
            </div>

            <div className={`${cloudSize} animate-cloud`}>
                ☁️
            </div>
        </div>
    );
}

// ========================================================
// RAIN
// ========================================================

function RainVisual({ night, small }) {
    const containerSize = small
        ? "relative w-12 h-12 flex items-center justify-center"
        : "relative w-28 h-28 flex items-center justify-center";

    const cloudSize = small
        ? "text-4xl"
        : "text-7xl";

    return (
        <div className={containerSize}>

            <div
                className={
                    small
                        ? "absolute top-0 left-1 text-xl"
                        : "absolute top-0 left-2 text-4xl"
                }
            >
                {night ? "🌙" : "☀️"}
            </div>

            <div className={`${cloudSize} animate-cloud`}>
                🌧️
            </div>

            {!small && (
                <div className="absolute bottom-0 left-5 text-sm">
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
    const containerSize = small
        ? "relative w-12 h-12 flex items-center justify-center"
        : "relative w-28 h-28 flex items-center justify-center";

    const stormSize = small
        ? "text-4xl"
        : "text-7xl";

    return (
        <div className={containerSize}>

            {night && (
                <div
                    className={
                        small
                            ? "absolute top-0 left-1 text-lg"
                            : "absolute top-0 left-2 text-3xl"
                    }
                >
                    🌙
                </div>
            )}

            {!night && (
                <div
                    className={
                        small
                            ? "absolute top-0 left-1 text-lg"
                            : "absolute top-0 left-2 text-3xl"
                    }
                >
                    ☀️
                </div>
            )}

            <div className={`${stormSize} animate-lightning`}>
                ⛈️
            </div>
        </div>
    );
}

// ========================================================
// SNOW
// ========================================================

function SnowVisual({ night, small }) {
    const containerSize = small
        ? "relative w-12 h-12 flex items-center justify-center"
        : "relative w-28 h-28 flex items-center justify-center";

    const snowSize = small
        ? "text-4xl"
        : "text-7xl";

    return (
        <div className={containerSize}>

            <div
                className={
                    small
                        ? "absolute top-0 left-1 text-lg"
                        : "absolute top-0 left-2 text-3xl"
                }
            >
                {night ? "🌙" : "☀️"}
            </div>

            <div className={`${snowSize} animate-pulse`}>
                ❄️
            </div>
        </div>
    );
}

// ========================================================
// FOG
// ========================================================

function FogVisual({ night, small }) {
    const containerSize = small
        ? "relative w-12 h-12 flex items-center justify-center"
        : "relative w-28 h-28 flex items-center justify-center";

    const fogSize = small
        ? "text-4xl"
        : "text-7xl";

    return (
        <div className={containerSize}>

            <div
                className={
                    small
                        ? "absolute top-0 left-1 text-lg"
                        : "absolute top-0 left-2 text-3xl"
                }
            >
                {night ? "🌙" : "☀️"}
            </div>

            <div className={`${fogSize} animate-fog`}>
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

    // Calculate ONCE
    const night = isNightTime(weather);

    const type = getWeatherType(weather);

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