const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const { getAgricultureData } = require("./agricultureService");

dotenv.config({
  path: path.resolve(__dirname, ".env"),
});

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

console.log(
  "🔑 WEATHER_API_KEY:",
  process.env.WEATHER_API_KEY ? "Loaded ✅" : "Missing ❌"
);

// ======================================================
// WEATHER SERVICE
// ======================================================

async function getWeatherByCoordinates(latitude, longitude) {
  try {
    const apiKey = process.env.WEATHER_API_KEY;

    if (!apiKey) {
      throw new Error("WEATHER_API_KEY is not configured");
    }

    const url =
      `https://api.openweathermap.org/data/2.5/weather` +
      `?lat=${encodeURIComponent(latitude)}` +
      `&lon=${encodeURIComponent(longitude)}` +
      `&appid=${encodeURIComponent(apiKey)}` +
      `&units=metric`;

    console.log("🌤️ Calling OpenWeather:", latitude, longitude);

    const response = await fetch(url);
    const text = await response.text();

    let data;

    try {
      data = text ? JSON.parse(text) : {};
    } catch (error) {
      console.error("❌ Invalid JSON from OpenWeather:");
      console.error(text);

      throw new Error("Invalid response from OpenWeather");
    }

    if (!response.ok) {
      console.error("❌ OpenWeather error:", response.status, data);

      throw new Error(
        data?.message || `OpenWeather returned status ${response.status}`
      );
    }

    return {
      location: data.name || "Unknown",
      country: data.sys?.country || "",

      latitude,
      longitude,

      temperature: data.main?.temp ?? null,
      feelsLike: data.main?.feels_like ?? null,
      humidity: data.main?.humidity ?? null,
      pressure: data.main?.pressure ?? null,

      windSpeed: data.wind?.speed ?? null,
      windDirection: data.wind?.deg ?? null,

      condition:
        data.weather?.[0]?.description || "Unknown",

      weatherMain:
        data.weather?.[0]?.main || "Unknown",

      rainfall:
        data.rain?.["1h"] ??
        data.rain?.["3h"] ??
        0,

      visibility: data.visibility ?? null,
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
// WEATHER API
// ======================================================

app.get("/api/weather", async (req, res) => {
  try {
    const { lat, lon } = req.query;

    console.log("🌍 Weather request:", {
      lat,
      lon,
    });

    if (lat === undefined || lon === undefined) {
      return res.status(400).json({
        error: "Latitude and longitude are required",
      });
    }

    const latitude = Number(lat);
    const longitude = Number(lon);

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      return res.status(400).json({
        error: "Invalid latitude or longitude",
      });
    }

    if (latitude < -90 || latitude > 90) {
      return res.status(400).json({
        error: "Latitude must be between -90 and 90",
      });
    }

    if (longitude < -180 || longitude > 180) {
      return res.status(400).json({
        error: "Longitude must be between -180 and 180",
      });
    }

    const weather = await getWeatherByCoordinates(
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
// AGRICULTURE API
// ======================================================

app.get("/api/agriculture", async (req, res) => {
  try {
    const crops = String(req.query.crops || "")
      .split(",")
      .map((crop) => crop.trim())
      .filter(Boolean);

    const data = await getAgricultureData({
      city: req.query.city || "Pune",

      crops,

      farmName:
        req.query.farmName ||
        "Green Valley Farm",

      area:
        req.query.area ||
        "12 Acres",

      soilType:
        req.query.soilType ||
        "Black Soil",
    });

    return res.json(data);
  } catch (error) {
    console.error(
      "/api/agriculture error:",
      error
    );

    return res.status(500).json({
      error:
        error.message ||
        "Failed to fetch agriculture data",
    });
  }
});

// ======================================================
// TEST WEATHER API
// ======================================================

app.get("/api/test-weather", (req, res) => {
  res.json({
    message: "Weather server is working!",

    apiKey: process.env.WEATHER_API_KEY
      ? "Loaded"
      : "Missing",
  });
});

// ======================================================
// ROOT
// ======================================================

app.get("/", (req, res) => {
  res.json({
    message: "Weather API server is running",

    port: process.env.PORT || 5000,

    environment:
      process.env.NODE_ENV ||
      "development",
  });
});

// ======================================================
// SERVER
// ======================================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `🌤️ Weather server running on port ${PORT}`
  );
});