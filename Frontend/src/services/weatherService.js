function mapWeatherIcon(weatherMain = "") {
    const condition = weatherMain.toLowerCase();

    if (condition.includes("thunderstorm")) return "storm";
    if (condition.includes("drizzle")) return "rain";
    if (condition.includes("rain")) return "rain";
    if (condition.includes("snow")) return "snow";

    if (
        condition.includes("mist") ||
        condition.includes("fog") ||
        condition.includes("haze")
    ) {
        return "fog";
    }

    if (condition.includes("cloud")) return "cloudy";
    if (condition.includes("clear")) return "sunny";

    return "cloudy";
}

export async function getCurrentWeather(latitude, longitude) {
    try {
        const response = await fetch(
            `http://localhost:5001/api/weather?lat=${encodeURIComponent(
                latitude
            )}&lon=${encodeURIComponent(longitude)}`
        );

        // Read response as text first
        const text = await response.text();

        let data = {};

        try {
            data = text ? JSON.parse(text) : {};
        } catch (error) {
            console.error(
                "❌ Invalid JSON from weather server:",
                text
            );

            throw new Error(
                "Weather server returned an invalid response"
            );
        }

        // Handle HTTP errors
        if (!response.ok) {
            throw new Error(
                data?.error ||
                    `Weather server returned status ${response.status}`
            );
        }

        console.log("🌍 WEATHER DATA:", data);

        // Return data in the format your frontend expects
        return {
            icon: mapWeatherIcon(data.weatherMain),

            condition:
                data.condition || "Unknown",

            temp:
                Number.isFinite(Number(data.temperature))
                    ? Math.round(Number(data.temperature))
                    : null,

            // Keep both temperature and temp
            temperature:
                Number.isFinite(Number(data.temperature))
                    ? Math.round(Number(data.temperature))
                    : null,

            feelsLike:
                Number.isFinite(Number(data.feelsLike))
                    ? Math.round(Number(data.feelsLike))
                    : null,

            humidity:
                data.humidity ?? null,

            // OpenWeather wind speed is m/s
            // Convert to km/h
            wind:
                Number.isFinite(Number(data.windSpeed))
                    ? Math.round(
                          Number(data.windSpeed) * 3.6
                      )
                    : 0,

            pressure:
                data.pressure ?? null,

            rain:
                data.rainfall ?? 0,

            locationName:
                data.location || "Unknown",

            country:
                data.country || "",

            latitude:
                data.latitude ?? latitude,

            longitude:
                data.longitude ?? longitude,

            visibility:
                data.visibility ?? null,

            windDirection:
                data.windDirection ?? null,
        };
    } catch (error) {
        console.error(
            "❌ getCurrentWeather error:",
            error
        );

        throw error;
    }
}