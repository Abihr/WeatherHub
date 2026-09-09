export function classifySevereWeather({
    weatherCode,
    rain = 0,
    showers = 0,
    precipitation = 0,
    precipitationProbability = 0,
    cape = 0,
    windGust = 0,
}) {
    // Thunderstorm + hail
    if (weatherCode === 96 || weatherCode === 99) {
        return {
            type: "Severe Thunderstorm",
            level: "severe",
            icon: "⛈️",
            message: "Thunderstorm with possible hail",
        };
    }

    // Thunderstorm
    if (weatherCode === 95) {
        if (cape >= 2500 && windGust >= 35) {
            return {
                type: "Severe Thunderstorm",
                level: "severe",
                icon: "⛈️",
                message:
                    "Strong thunderstorm conditions are possible",
            };
        }

        return {
            type: "Thunderstorm",
            level: "high",
            icon: "⛈️",
            message:
                "Thunderstorm activity is forecast",
        };
    }

    // Heavy convective showers
    if (
        showers >= 4 &&
        precipitationProbability >= 70 &&
        cape >= 1500
    ) {
        return {
            type: "Heavy Thundershower Risk",
            level: "high",
            icon: "🌩️",
            message:
                "Heavy convective showers may develop",
        };
    }

    // Heavy precipitation
    if (
        precipitation >= 7.5 &&
        precipitationProbability >= 70
    ) {
        return {
            type: "Heavy Rain",
            level: "high",
            icon: "🌧️",
            message:
                "Heavy rainfall is possible",
        };
    }

    // Strong wind
    if (windGust >= 40) {
        return {
            type: "Strong Wind",
            level: "high",
            icon: "💨",
            message:
                "Strong wind gusts are possible",
        };
    }

    // Normal rain/showers
    if (
        precipitationProbability >= 50 &&
        precipitation > 0
    ) {
        return {
            type: "Rain / Showers",
            level: "moderate",
            icon: "🌦️",
            message:
                "Rain or showers are possible",
        };
    }

    return {
        type: "No Severe Weather",
        level: "normal",
        icon: "☀️",
        message: "No significant severe weather signal",
    };
}