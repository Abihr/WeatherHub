const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// ======================================================
// LOAD ENVIRONMENT VARIABLES
// ======================================================

// .env is inside the backend folder
dotenv.config({
    path: path.resolve(__dirname, ".env"),
});

const app = express();

// ======================================================
// MIDDLEWARE
// ======================================================

app.use(
    cors({
        origin: "*",
    })
);

app.use(express.json());

// ======================================================
// CHECK API KEY
// ======================================================

console.log(
    "🔑 WEATHER_API_KEY:",
    process.env.WEATHER_API_KEY
        ? "Loaded ✅"
        : "Missing ❌"
);

// ======================================================
// GET WEATHER BY COORDINATES
// ======================================================

async function getWeatherByCoordinates(latitude, longitude) {
    try {
        const apiKey = process.env.WEATHER_API_KEY;

        if (!apiKey) {
            throw new Error(
                "WEATHER_API_KEY is not configured"
            );
        }

        const url =
            `https://api.openweathermap.org/data/2.5/weather` +
            `?lat=${encodeURIComponent(latitude)}` +
            `&lon=${encodeURIComponent(longitude)}` +
            `&appid=${encodeURIComponent(apiKey)}` +
            `&units=metric`;

        console.log(
            "🌤️ Calling OpenWeather:",
            latitude,
            longitude
        );

        const response = await fetch(url);

        // Read response as text first
        const text = await response.text();

        let data;

        try {
            data = text ? JSON.parse(text) : {};
        } catch (error) {
            console.error(
                "❌ Invalid JSON from OpenWeather:"
            );

            console.error(text);

            throw new Error(
                "Invalid response from OpenWeather"
            );
        }

        // OpenWeather API error
        if (!response.ok) {
            console.error(
                "❌ OpenWeather error:",
                response.status,
                data
            );

            throw new Error(
                data?.message ||
                    `OpenWeather returned status ${response.status}`
            );
        }

        // ==================================================
        // RETURN NORMALIZED WEATHER DATA
        // ==================================================

        return {
            location:
                data.name || "Unknown",

            country:
                data.sys?.country || "",

            latitude:
                latitude,

            longitude:
                longitude,

            temperature:
                data.main?.temp ?? null,

            feelsLike:
                data.main?.feels_like ?? null,

            humidity:
                data.main?.humidity ?? null,

            pressure:
                data.main?.pressure ?? null,

            windSpeed:
                data.wind?.speed ?? null,

            windDirection:
                data.wind?.deg ?? null,

            condition:
                data.weather?.[0]?.description ||
                "Unknown",

            weatherMain:
                data.weather?.[0]?.main ||
                "Unknown",

            rainfall:
                data.rain?.["1h"] ??
                data.rain?.["3h"] ??
                0,

            visibility:
                data.visibility ?? null,
        };
    } catch (error) {
        console.error(
            "❌ getWeatherByCoordinates error:",
            error
        );

        throw error;
    }
}

// ======================================================
// WEATHER API ROUTE
// ======================================================

app.get("/api/weather", async (req, res) => {
    try {
        const { lat, lon } = req.query;

        console.log(
            "🌍 Weather request:",
            {
                lat,
                lon,
            }
        );

        // --------------------------------------------------
        // CHECK PARAMETERS
        // --------------------------------------------------

        if (
            lat === undefined ||
            lon === undefined
        ) {
            return res.status(400).json({
                error:
                    "Latitude and longitude are required",
            });
        }

        // --------------------------------------------------
        // CONVERT TO NUMBERS
        // --------------------------------------------------

        const latitude = Number(lat);
        const longitude = Number(lon);

        // --------------------------------------------------
        // CHECK VALID NUMBERS
        // --------------------------------------------------

        if (
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude)
        ) {
            return res.status(400).json({
                error:
                    "Invalid latitude or longitude",
            });
        }

        // --------------------------------------------------
        // CHECK COORDINATE RANGE
        // --------------------------------------------------

        if (
            latitude < -90 ||
            latitude > 90
        ) {
            return res.status(400).json({
                error:
                    "Latitude must be between -90 and 90",
            });
        }

        if (
            longitude < -180 ||
            longitude > 180
        ) {
            return res.status(400).json({
                error:
                    "Longitude must be between -180 and 180",
            });
        }

        // --------------------------------------------------
        // FETCH WEATHER
        // --------------------------------------------------

        const weather =
            await getWeatherByCoordinates(
                latitude,
                longitude
            );

        console.log(
            "✅ Weather fetched:",
            weather.location,
            "|",
            weather.temperature,
            "°C"
        );

        // --------------------------------------------------
        // SEND RESPONSE
        // --------------------------------------------------

        return res.json(weather);

    } catch (error) {
        console.error(
            "❌ /api/weather error:",
            error
        );

        return res.status(500).json({
            error:
                error.message ||
                "Failed to fetch weather",
        });
    }
});

// ======================================================
// TEST ROUTE
// ======================================================

app.get("/api/test-weather", (req, res) => {
    res.json({
        message:
            "Weather server is working!",

        apiKey:
            process.env.WEATHER_API_KEY
                ? "Loaded"
                : "Missing",
    });
});

// ======================================================
// HEALTH CHECK
// ======================================================

app.get("/", (req, res) => {
    res.json({
        message:
            "Weather API server is running",
        port: 5001,
    });
});

// ======================================================
// START SERVER
// ======================================================

const PORT = 5001;

app.listen(PORT, () => {
    console.log(
        `🌤️ Weather server running on http://localhost:${PORT}`
    );
});