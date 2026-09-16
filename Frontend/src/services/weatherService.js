
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
        // Backend API URL from Vite environment variable
        const API_URL = import.meta.env.VITE_WEATHER_API_URL;
        console.log("🔥 VITE_WEATHER_API_URL:", API_URL);
        // Check whether API URL is configured
        if (!API_URL) {
            throw new Error(
                "VITE_WEATHER_API_URL is not configured"
            );
        }

        // Remove trailing slash from API URL
        const baseURL = API_URL.replace(/\/+$/, "");

        // Create weather API URL
        const weatherURL =
            `${baseURL}/api/weather` +
            `?lat=${encodeURIComponent(latitude)}` +
            `&lon=${encodeURIComponent(longitude)}`;

        console.log("🌐 WEATHER API:", weatherURL);

        console.log("📍 Coordinates:", {
            latitude,
            longitude,
        });

        // Fetch weather from backend
        const response = await fetch(weatherURL);

        // Read response as text first
        const text = await response.text();

        let data = {};

        // Convert response to JSON
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
            console.error(
                "❌ Weather server error:",
                response.status,
                data
            );

            throw new Error(
                data?.error ||
                `Weather server returned status ${response.status}`
            );
        }

        console.log("🌍 WEATHER DATA:", data);

        // Temperature
        const temperature = Number(data.temperature);

        const safeTemperature = Number.isFinite(temperature)
            ? Math.round(temperature)
            : null;

        // Feels like temperature
        const feelsLike = Number(data.feelsLike);

        const safeFeelsLike = Number.isFinite(feelsLike)
            ? Math.round(feelsLike)
            : null;

        // OpenWeather wind speed is m/s.
        // Convert to km/h.
        const windSpeed = Number(data.windSpeed);

        const safeWind = Number.isFinite(windSpeed)
            ? Math.round(windSpeed * 3.6)
            : 0;

        // Return data in WeatherHub frontend format
        return {
    // OpenWeather icon: 01d / 01n / 02d / 02n etc.
    icon: data.weatherIcon || "01d",

    // Weather category
    weatherType: mapWeatherIcon(data.weatherMain),

    // IMPORTANT: preserve day/night
    is_day:
        data.is_day !== undefined && data.is_day !== null
            ? Number(data.is_day)
            : data.weatherIcon?.endsWith("n")
                ? 0
                : 1,

    // Weather condition
    condition: data.condition || "Unknown",

    // Temperature
    temp: safeTemperature,
    temperature: safeTemperature,

    // Feels like
    feelsLike: safeFeelsLike,

    // Humidity
    humidity: data.humidity ?? null,

    // Wind
    wind: safeWind,

    // Pressure
    pressure: data.pressure ?? null,

    // Rain
    rain: data.rainfall ?? 0,

    // Location
    locationName: data.location || "Unknown",
    country: data.country || "",

    // Coordinates
    latitude: data.latitude ?? latitude,
    longitude: data.longitude ?? longitude,

    // Visibility
    visibility: data.visibility ?? null,

    // Wind direction
    windDirection: data.windDirection ?? null,
};
    } catch (error) {
        console.error(
            "❌ getCurrentWeather error:",
            error
        );

        throw error;
    }
}

