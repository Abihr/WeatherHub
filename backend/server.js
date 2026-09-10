const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const Groq = require("groq-sdk");
const {
    getAgricultureData,
} = require("../Frontend/src/services/agricultureService");

dotenv.config({
    path: __dirname + "/.env",
});

const app = express();

app.use(
    cors({
        origin: "*",
    })
);

app.use(express.json());

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

function detectUserLanguage(message) {
    if (!message || typeof message !== "string") {
        return "English";
    }

    if (/[\u0980-\u09FF]/.test(message)) {
        return "Bengali";
    }

    if (/[\u0A80-\u0AFF]/.test(message)) {
        return "Gujarati";
    }

    if (/[\u0B80-\u0BFF]/.test(message)) {
        return "Tamil";
    }

    if (/[\u0C00-\u0C7F]/.test(message)) {
        return "Telugu";
    }

    if (/[\u0C80-\u0CFF]/.test(message)) {
        return "Kannada";
    }

    if (/[\u0D00-\u0D7F]/.test(message)) {
        return "Malayalam";
    }

    if (/[\u0A00-\u0A7F]/.test(message)) {
        return "Punjabi";
    }

    if (/[\u0900-\u097F]/.test(message)) {
        return "Hindi";
    }

    return "English";
}

function cleanChatResponse(text) {
    if (!text || typeof text !== "string") {
        return text;
    }

    let cleaned = text;

    cleaned = cleaned.replace(/^#{1,6}\s*/gm, "");
    cleaned = cleaned.replace(/\*\*(.*?)\*\*/g, "$1");
    cleaned = cleaned.replace(/__(.*?)__/g, "$1");
    cleaned = cleaned.replace(/\*(.*?)\*/g, "$1");
    cleaned = cleaned.replace(/_(.*?)_/g, "$1");
    cleaned = cleaned.replace(/~~(.*?)~~/g, "$1");

    cleaned = cleaned.replace(
        /\[([^\]]+)\]\([^)]+\)/g,
        "$1"
    );

    cleaned = cleaned.replace(
        /^\s*[-*+]\s+/gm,
        ""
    );

    cleaned = cleaned.replace(
        /^\s*\d+\.\s+/gm,
        ""
    );

    cleaned = cleaned.replace(
        /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)+\|?\s*$/gm,
        ""
    );

    cleaned = cleaned.replace(/\|/g, "");
    cleaned = cleaned.replace(/`/g, "");
    cleaned = cleaned.replace(/[ \t]{2,}/g, " ");
    cleaned = cleaned.replace(/\n{3,}/g, "\n\n");

    return cleaned.trim();
}

function getLanguageInstruction(language) {
    return `
The user is communicating in ${language}.

Respond in ${language}.

IMPORTANT:

- Do NOT translate the user's message into English.
- Do NOT answer in English unless the user's message is in English.
- Keep the response natural and conversational in ${language}.
- Use the normal writing system/script of ${language}.
- Do not mix English into the response unnecessarily.
- If weather values contain units such as degrees Celsius, express them naturally in ${language}.
- Return plain text only.
- Do not use Markdown.
- Do not use headings.
- Do not use bullet points.
- Do not use numbered lists.
- Do not use asterisks.
- Do not use underscores.
- Do not use tildes.
- Do not use pipes.
- Do not use tables.
- Do not use Markdown links.
`;
}

function normalizeWeatherLocation(location) {
    if (!location || typeof location !== "string") {
        return location;
    }

    const normalized = location.trim().toLowerCase();

    const kalyaniVariants = [
        "kolayni",
        "kolayani",
        "kalyaniy",
        "kalyanii",
        "kalyani",
        "কল্যাণী",
        "কল্যাণী শহর",
    ];

    if (kalyaniVariants.includes(normalized)) {
        return "Kalyani";
    }

    return location.trim();
}

async function getWeather(location) {
    try {
        const apiKey = process.env.WEATHER_API_KEY;

        if (!apiKey) {
            throw new Error(
                "WEATHER_API_KEY is not configured"
            );
        }

        const normalizedLocation =
            normalizeWeatherLocation(location);

        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
                normalizedLocation
            )}&appid=${apiKey}&units=metric`
        );

        if (!response.ok) {
            throw new Error(
                `Weather API returned status ${response.status}`
            );
        }

        const data = await response.json();

        return {
            location: data.name,
            country: data.sys?.country,
            temperature: data.main?.temp,
            feelsLike: data.main?.feels_like,
            humidity: data.main?.humidity,
            pressure: data.main?.pressure,
            windSpeed: data.wind?.speed,
            windDirection: data.wind?.deg,
            condition: data.weather?.[0]?.description,
            rainfall:
                data.rain?.["1h"] ??
                data.rain?.["3h"] ??
                0,
            visibility: data.visibility,
        };
    } catch (error) {
        console.error("getWeather error:", error);

        throw new Error(
            `Unable to fetch weather for ${location}`
        );
    }
}

async function getWeatherByCoordinates(
    latitude,
    longitude
) {
    try {
        const apiKey = process.env.WEATHER_API_KEY;

        if (!apiKey) {
            throw new Error(
                "WEATHER_API_KEY is not configured"
            );
        }

        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`
        );

        if (!response.ok) {
            throw new Error(
                `Weather API returned status ${response.status}`
            );
        }

        const data = await response.json();

        return {
            location: data.name,
            country: data.sys?.country,
            latitude,
            longitude,
            temperature: data.main?.temp,
            feelsLike: data.main?.feels_like,
            humidity: data.main?.humidity,
            pressure: data.main?.pressure,
            windSpeed: data.wind?.speed,
            windDirection: data.wind?.deg,
            condition: data.weather?.[0]?.description,
            rainfall:
                data.rain?.["1h"] ??
                data.rain?.["3h"] ??
                0,
            visibility: data.visibility,
        };
    } catch (error) {
        console.error(
            "getWeatherByCoordinates error:",
            error
        );

        throw new Error(
            "Unable to fetch weather for the current location"
        );
    }
}

function isCurrentLocationQuery(message) {
    if (!message || typeof message !== "string") {
        return false;
    }

    const normalized = message.toLowerCase().trim();

    const englishPatterns = [
        /\bwhere am i\b/,
        /\bmy current location\b/,
        /\bmy location\b/,
        /\bcurrent location\b/,
        /\bweather here\b/,
        /\bweather at my location\b/,
        /\bweather at my current location\b/,
        /\bweather where i am\b/,
        /\bweather around me\b/,
        /\bweather near me\b/,
        /\bwhat is the weather here\b/,
        /\bwhat is it like outside here\b/,
        /\bhow is the weather here\b/,
    ];

    if (
        englishPatterns.some((pattern) =>
            pattern.test(normalized)
        )
    ) {
        return true;
    }

    const hindiPatterns = [
        /मैं कहाँ हूँ/,
        /मैं किस जगह पर हूँ/,
        /मेरी लोकेशन/,
        /मेरी वर्तमान लोकेशन/,
        /मेरे यहां का मौसम/,
        /मेरे यहाँ का मौसम/,
        /यहाँ का मौसम/,
        /यहां का मौसम/,
        /जहां मैं हूँ/,
        /जहाँ मैं हूँ/,
        /मेरे आसपास का मौसम/,
        /मेरे पास का मौसम/,
    ];

    if (
        hindiPatterns.some((pattern) =>
            pattern.test(message)
        )
    ) {
        return true;
    }

    const bengaliPatterns = [
        /আমি কোথায় আছি/,
        /আমি কোথায় আছি/,
        /আমার লোকেশন/,
        /আমার বর্তমান লোকেশন/,
        /আমি যে লোকেশনে আছি/,
        /আমি যেই লোকেশনে আছি/,
        /এখানকার আবহাওয়া/,
        /এখানকার আবহাওয়া/,
        /আমার এখানে আবহাওয়া/,
        /আমার এখানে আবহাওয়া/,
        /আমার আশেপাশের আবহাওয়া/,
        /আমার আশেপাশের আবহাওয়া/,
    ];

    if (
        bengaliPatterns.some((pattern) =>
            pattern.test(message)
        )
    ) {
        return true;
    }

    const gujaratiPatterns = [
        /હું ક્યાં છું/,
        /મારી લોકેશન/,
        /મારું લોકેશન/,
        /મારી વર્તમાન લોકેશન/,
        /મારા અહીંનું હવામાન/,
        /અહીંનું હવામાન/,
        /મારી જગ્યાનું હવામાન/,
        /હું જ્યાં છું ત્યાંનું હવામાન/,
        /મારા આસપાસનું હવામાન/,
    ];

    if (
        gujaratiPatterns.some((pattern) =>
            pattern.test(message)
        )
    ) {
        return true;
    }

    const tamilPatterns = [
        /நான் எங்கே இருக்கிறேன்/,
        /என் இருப்பிடம்/,
        /எனது இருப்பிடம்/,
        /தற்போதைய இருப்பிடம்/,
        /இங்கே வானிலை/,
        /நான் இருக்கும் இடத்தின் வானிலை/,
        /என்னைச் சுற்றியுள்ள வானிலை/,
    ];

    if (
        tamilPatterns.some((pattern) =>
            pattern.test(message)
        )
    ) {
        return true;
    }

    const teluguPatterns = [
        /నేను ఎక్కడ ఉన్నాను/,
        /నా ప్రస్తుత స్థానం/,
        /నా లొకేషన్/,
        /ఇక్కడ వాతావరణం/,
        /నేను ఉన్న చోట వాతావరణం/,
        /నా చుట్టుపక్కల వాతావరణం/,
    ];

    if (
        teluguPatterns.some((pattern) =>
            pattern.test(message)
        )
    ) {
        return true;
    }

    const kannadaPatterns = [
        /ನಾನು ಎಲ್ಲಿದ್ದೇನೆ/,
        /ನನ್ನ ಸ್ಥಳ/,
        /ನನ್ನ ಪ್ರಸ್ತುತ ಸ್ಥಳ/,
        /ಇಲ್ಲಿನ ಹವಾಮಾನ/,
        /ನಾನು ಇರುವ ಸ್ಥಳದ ಹವಾಮಾನ/,
        /ನನ್ನ ಸುತ್ತಮುತ್ತಲಿನ ಹವಾಮಾನ/,
    ];

    if (
        kannadaPatterns.some((pattern) =>
            pattern.test(message)
        )
    ) {
        return true;
    }

    const malayalamPatterns = [
        /ഞാൻ എവിടെയാണ്/,
        /എന്റെ സ്ഥലം/,
        /എന്റെ നിലവിലെ സ്ഥലം/,
        /ഇവിടുത്തെ കാലാവസ്ഥ/,
        /ഞാൻ ഉള്ള സ്ഥലത്തെ കാലാവസ്ഥ/,
        /എന്റെ ചുറ്റുമുള്ള കാലാവസ്ഥ/,
    ];

    if (
        malayalamPatterns.some((pattern) =>
            pattern.test(message)
        )
    ) {
        return true;
    }

    const punjabiPatterns = [
        /ਮੈਂ ਕਿੱਥੇ ਹਾਂ/,
        /ਮੇਰੀ ਲੋਕੇਸ਼ਨ/,
        /ਮੇਰੀ ਮੌਜੂਦਾ ਲੋਕੇਸ਼ਨ/,
        /ਇੱਥੋਂ ਦਾ ਮੌਸਮ/,
        /ਜਿੱਥੇ ਮੈਂ ਹਾਂ ਉੱਥੇ ਦਾ ਮੌਸਮ/,
        /ਮੇਰੇ ਆਲੇ ਦੁਆਲੇ ਦਾ ਮੌਸਮ/,
    ];

    if (
        punjabiPatterns.some((pattern) =>
            pattern.test(message)
        )
    ) {
        return true;
    }

    return false;
}

const railwayStations = [
    {
        id: "1",
        name: "Mumbai Central",
        code: "BCT",
        zone: "Western",
        city: "Mumbai",
        latitude: 18.9696,
        longitude: 72.8194,
    },
    {
        id: "2",
        name: "Delhi Junction",
        code: "DLI",
        zone: "Northern",
        city: "Delhi",
        latitude: 28.6448,
        longitude: 77.2167,
    },
    {
        id: "3",
        name: "Kolkata Howrah",
        code: "HWH",
        zone: "Eastern",
        city: "Kolkata",
        latitude: 22.5839,
        longitude: 88.3426,
    },
    {
        id: "4",
        name: "Chennai Central",
        code: "MAS",
        zone: "Southern",
        city: "Chennai",
        latitude: 13.0827,
        longitude: 80.2707,
    },
    {
        id: "5",
        name: "Surat",
        code: "ST",
        zone: "Western",
        city: "Surat",
        latitude: 21.2049,
        longitude: 72.8401,
    },
    {
        id: "6",
        name: "Patna Junction",
        code: "PNBE",
        zone: "East Central",
        city: "Patna",
        latitude: 25.5941,
        longitude: 85.1376,
    },
    {
        id: "7",
        name: "Lucknow Charbagh",
        code: "LKO",
        zone: "Northern",
        city: "Lucknow",
        latitude: 26.832,
        longitude: 80.9215,
    },
];

function getRailwayWeatherStatus(rainfall, windSpeed) {
    if (rainfall >= 50 || windSpeed >= 50) {
        return "Critical";
    }

    if (rainfall >= 25 || windSpeed >= 35) {
        return "Alert";
    }

    if (rainfall >= 10 || windSpeed >= 25) {
        return "Caution";
    }

    return "Safe";
}

app.get("/api/railway_weather", async (req, res) => {
    try {
        const apiKey = process.env.WEATHER_API_KEY;

        const results = await Promise.all(
            railwayStations.map(async (station) => {
                const response = apiKey
                    ? await fetch(
                          `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
                              station.city
                          )},IN&appid=${encodeURIComponent(
                              apiKey
                          )}&units=metric`
                      )
                    : await fetch(
                          `https://api.open-meteo.com/v1/forecast?latitude=${station.latitude}&longitude=${station.longitude}&current=temperature_2m,relative_humidity_2m,rain,wind_speed_10m&wind_speed_unit=kmh`
                      );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        `${station.city}: ${
                            data.message ||
                            "Weather API request failed"
                        }`
                    );
                }

                const rainfall = apiKey
                    ? data.rain?.["1h"] ??
                      data.rain?.["3h"] ??
                      0
                    : data.current?.rain ?? 0;
                const windSpeed = Math.round(
                    apiKey
                        ? (data.wind?.speed ?? 0) * 3.6
                        : data.current?.wind_speed_10m ?? 0
                );
                const weatherStatus =
                    getRailwayWeatherStatus(
                        rainfall,
                        windSpeed
                    );

                return {
                    id: station.id,
                    stationName: station.name,
                    stationCode: station.code,
                    zone: station.zone,
                    city: station.city,
                    latitude: station.latitude,
                    longitude: station.longitude,
                    weatherStatus,
                    temperature: Math.round(
                        apiKey
                            ? data.main?.temp ?? 0
                            : data.current?.temperature_2m ?? 0
                    ),
                    humidity: apiKey
                        ? data.main?.humidity ?? 0
                        : data.current?.relative_humidity_2m ?? 0,
                    rainfall,
                    windSpeed,
                    lastUpdated: new Date().toISOString(),
                    waterLevel: null,
                    trainDelays: null,
                    routeStatus: "Unknown",
                    alertMessage:
                        weatherStatus === "Critical"
                            ? "Severe weather conditions detected. Immediate monitoring advised."
                            : weatherStatus === "Alert"
                            ? "Severe weather conditions detected. Track monitoring advised."
                            : weatherStatus === "Caution"
                            ? "Moderate weather conditions detected. Continue monitoring."
                            : null,
                };
            })
        );

        return res.json(results);
    } catch (error) {
        console.error(
            "/api/railway_weather error:",
            error
        );

        return res.status(500).json({
            error:
                error.message ||
                "Failed to fetch railway weather data",
        });
    }
});

app.get("/api/agriculture", async (req, res) => {
    try {
        const crops = String(req.query.crops || "")
            .split(",")
            .map((crop) => crop.trim())
            .filter(Boolean);

        const data = await getAgricultureData({
            city: req.query.city || "Pune",
            crops,
            farmName: req.query.farmName || "Green Valley Farm",
            area: req.query.area || "12 Acres",
            soilType: req.query.soilType || "Black Soil",
        });

        return res.json(data);
    } catch (error) {
        console.error("/api/agriculture error:", error);

        return res.status(500).json({
            error:
                error.message ||
                "Failed to fetch agriculture data",
        });
    }
});

app.get("/api/farmer", async (req, res) => {
    try {
        const city = String(req.query.city || "").trim();
        const crop = String(req.query.crop || "").trim();

        if (!city || !crop) {
            return res.status(400).json({
                error: "City and crop are required",
            });
        }

        const geocodingResponse = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
                city
            )}&count=1&language=en&format=json`
        );
        const geocodingData = await geocodingResponse.json();
        const location = geocodingData.results?.[0];

        if (!location) {
            return res.status(404).json({
                error: `Location not found: ${city}`,
            });
        }

        const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,rain,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,rain_sum,precipitation_probability_max,weather_code&forecast_days=7&timezone=auto&wind_speed_unit=kmh`
        );
        const weatherData = await weatherResponse.json();

        if (!weatherResponse.ok) {
            throw new Error(
                weatherData.reason ||
                    "Weather service request failed"
            );
        }

        const current = weatherData.current || {};
        const temperature = current.temperature_2m ?? 0;
        const humidity = current.relative_humidity_2m ?? 0;
        const windSpeed = current.wind_speed_10m ?? 0;
        const rainfall = current.rain ?? 0;
        const risks = [];

        if (humidity >= 80) {
            risks.push({
                type: "Disease Risk",
                severity: "Medium",
                message: `High humidity may increase disease risk in ${crop}.`,
                action: "Inspect crops for fungal infection.",
            });
        }

        if (rainfall >= 25) {
            risks.push({
                type: "Heavy Rain",
                severity: "High",
                message: "Heavy rainfall may affect field conditions.",
                action: "Check drainage and avoid unnecessary irrigation.",
            });
        }

        if (temperature >= 35) {
            risks.push({
                type: "Heat Stress",
                severity: "High",
                message: `High temperature may cause heat stress in ${crop}.`,
                action: "Monitor soil moisture and irrigation requirements.",
            });
        }

        if (windSpeed >= 35) {
            risks.push({
                type: "Strong Wind",
                severity: "Medium",
                message: "Strong winds may cause physical crop damage.",
                action: "Inspect crops for lodging or physical damage.",
            });
        }

        if (risks.length === 0) {
            risks.push({
                type: "Weather Status",
                severity: "Low",
                message: `Current weather conditions look favorable for ${crop}.`,
                action: "Continue normal farm monitoring.",
            });
        }

        const daily = weatherData.daily || {};
        const forecast = (daily.time || []).map((date, index) => ({
            date,
            temperature: {
                min: daily.temperature_2m_min?.[index] ?? 0,
                max: daily.temperature_2m_max?.[index] ?? 0,
            },
            humidity,
            rainfall: daily.rain_sum?.[index] ?? 0,
            precipitationProbability:
                daily.precipitation_probability_max?.[index] ?? 0,
            windSpeed,
            condition: "Weather",
            description: "",
        }));

        return res.json({
            location: location.name || city,
            crop,
            temperature,
            feelsLike: temperature,
            humidity,
            windSpeed,
            condition: "Current conditions",
            rainfall,
            forecast,
            risks,
        });
    } catch (error) {
        console.error("/api/farmer error:", error);

        return res.status(500).json({
            error:
                error.message ||
                "Failed to fetch farmer weather",
        });
    }
});

app.get("/api/weather", async (req, res) => {
    try {
        const {
            location,
            lat,
            lon,
        } = req.query;

        if (lat !== undefined || lon !== undefined) {
            const latitude = Number(lat);
            const longitude = Number(lon);

            if (
                !Number.isFinite(latitude) ||
                !Number.isFinite(longitude) ||
                latitude < -90 ||
                latitude > 90 ||
                longitude < -180 ||
                longitude > 180
            ) {
                return res.status(400).json({
                    error: "Invalid latitude or longitude",
                });
            }

            if (process.env.WEATHER_API_KEY) {
                return res.json(
                    await getWeatherByCoordinates(
                        latitude,
                        longitude
                    )
                );
            }

            const response = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,rain,pressure_msl,wind_speed_10m,wind_direction_10m,weather_code&timezone=auto&wind_speed_unit=ms`
            );
            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.reason ||
                        "Weather service request failed"
                );
            }

            const current = data.current || {};

            return res.json({
                location: "Current location",
                country: "",
                latitude,
                longitude,
                temperature: current.temperature_2m,
                feelsLike: current.temperature_2m,
                humidity: current.relative_humidity_2m,
                pressure: current.pressure_msl,
                windSpeed: current.wind_speed_10m,
                windDirection: current.wind_direction_10m,
                rainfall: current.rain ?? 0,
                condition: "Current conditions",
                weatherMain: "Current",
                visibility: null,
            });
        }

        if (!location) {
            return res.status(400).json({
                error: "Location is required",
            });
        }

        const weather =
            await getWeather(location);

        res.json(weather);
    } catch (error) {
        console.error(
            "/api/weather error:",
            error
        );

        res.status(500).json({
            error: error.message,
        });
    }
});

app.post("/api/chat", async (req, res) => {
    try {
        const {
            message,
            currentLocation,
            conversationHistory = [],
        } = req.body;

        const latitude =
            currentLocation?.latitude ?? null;

        const longitude =
            currentLocation?.longitude ?? null;

        if (
            !message ||
            typeof message !== "string" ||
            !message.trim()
        ) {
            return res.status(400).json({
                error: "Message is required",
            });
        }

        console.log("User message:", message);

        console.log(
            "Current location:",
            latitude,
            longitude
        );

        const userLanguage =
            detectUserLanguage(message);

        console.log(
            "Detected language:",
            userLanguage
        );

        const languageInstruction =
            getLanguageInstruction(
                userLanguage
            );

        if (isCurrentLocationQuery(message)) {
            console.log(
                "Current location query detected"
            );

            if (
                latitude === null ||
                longitude === null
            ) {
                return res.status(400).json({
                    error:
                        "Current location coordinates are required for this request.",
                });
            }

            const weather =
                await getWeatherByCoordinates(
                    latitude,
                    longitude
                );

            const messages = [
                {
                    role: "system",
                    content: `
You are WeatherGPT, an AI weather assistant.

Answer the user's question using the supplied current-location weather data.

Do not invent weather information.

Keep the response natural, concise, and conversational.

If the user asks about weather, temperature, humidity, wind, rain, or conditions, use the supplied data.

If the user asks where they are, identify the location from the supplied weather data.

Do not mention GPS coordinates.

Do not claim to know anything that is not contained in the supplied weather data.

${languageInstruction}
`,
                },
                {
                    role: "user",
                    content: message,
                },
                {
                    role: "system",
                    content: `
Current-location weather data:

${JSON.stringify(weather, null, 2)}

Answer using only the supplied weather information.
`,
                },
            ];

            const completion =
                await groq.chat.completions.create({
                    model: "openai/gpt-oss-20b",
                    messages,
                    temperature: 0.3,
                });

            const rawReply =
                completion.choices?.[0]?.message
                    ?.content ||
                "Unable to generate a response.";

            const reply =
                cleanChatResponse(rawReply);

            return res.json({
                reply,
            });
        }

        const messages = [
            {
                role: "system",
                content: `
You are WeatherGPT, an AI weather assistant.

You can answer normal conversational questions.

When the user asks about weather for a specific city or location, use the get_weather tool.

Do not invent current weather information.

When weather data is supplied by the tool, use that data to answer the user.

Keep responses natural and conversational.

For unrelated questions, answer normally.

Do not mention internal tools, APIs, function calls, or implementation details.

${languageInstruction}
`,
            },
            ...conversationHistory,
            {
                role: "user",
                content: message,
            },
        ];

        const tools = [
            {
                type: "function",
                function: {
                    name: "get_weather",
                    description:
                        "Get the current weather for a specific city or location.",
                    parameters: {
                        type: "object",
                        properties: {
                            location: {
                                type: "string",
                                description:
                                    "The city or location to get weather for.",
                            },
                        },
                        required: ["location"],
                    },
                },
            },
        ];

        const firstCompletion =
            await groq.chat.completions.create({
                model: "openai/gpt-oss-20b",
                messages,
                tools,
                tool_choice: "auto",
                temperature: 0.3,
            });

        const assistantMessage =
            firstCompletion.choices?.[0]?.message;

        if (
            !assistantMessage?.tool_calls ||
            assistantMessage.tool_calls.length === 0
        ) {
            const rawReply =
                assistantMessage?.content ||
                "Sorry, I couldn't generate a response.";

            const reply =
                cleanChatResponse(rawReply);

            return res.json({
                reply,
            });
        }

        let weatherToolResult = null;

        for (const toolCall of assistantMessage.tool_calls) {
            if (
                toolCall.function?.name !==
                "get_weather"
            ) {
                continue;
            }

            let args;

            try {
                args = JSON.parse(
                    toolCall.function.arguments
                );
            } catch (error) {
                console.error(
                    "Invalid tool arguments:",
                    error
                );

                args = {};
            }

            const location =
                args.location;

            if (!location) {
                weatherToolResult = {
                    error:
                        "Location was not provided.",
                };

                continue;
            }

            try {
                const weather =
                    await getWeather(location);

                weatherToolResult = weather;
            } catch (error) {
                console.error(
                    "Weather tool error:",
                    error
                );

                weatherToolResult = {
                    error: error.message,
                };
            }
        }

        const finalMessages = [
            {
                role: "system",
                content: `
You are WeatherGPT, an AI weather assistant.

Provide the final answer to the user's original question.

The weather data below has already been retrieved by the application.

Use that data when answering weather questions.

Do not call or request any tools.

Do not invent weather information.

Keep the response natural, concise, and conversational.

${languageInstruction}

Return only the final answer.
`,
            },
            {
                role: "user",
                content: message,
            },
            {
                role: "system",
                content: `
Retrieved weather data:

${JSON.stringify(
    weatherToolResult,
    null,
    2
)}

Use this information to answer the user's question.
`,
            },
        ];

        const finalCompletion =
            await groq.chat.completions.create({
                model: "openai/gpt-oss-20b",
                messages: finalMessages,
                temperature: 0.3,
            });

        const rawReply =
            finalCompletion.choices?.[0]?.message
                ?.content ||
            "Sorry, I couldn't generate a response.";

        const reply =
            cleanChatResponse(rawReply);

        return res.json({
            reply,
        });
    } catch (error) {
        console.error(
            "/api/chat error:",
            error
        );

        return res.status(500).json({
            error:
                error.message ||
                "Something went wrong while processing your request.",
        });
    }
});

app.post("/api/tts", async (req, res) => {
    try {
        const { text, language } = req.body;

        if (!text || typeof text !== "string") {
            return res.status(400).json({
                error: "Text is required",
            });
        }

        if (
            !language ||
            typeof language !== "string"
        ) {
            return res.status(400).json({
                error: "Language is required",
            });
        }

        const apiKey =
            process.env.SARVAM_API_KEY;

        if (!apiKey) {
            return res.status(500).json({
                error:
                    "SARVAM_API_KEY is not configured",
            });
        }

        const supportedLanguages = [
            "en-IN",
            "hi-IN",
            "bn-IN",
            "ta-IN",
            "te-IN",
            "mr-IN",
            "gu-IN",
            "kn-IN",
            "ml-IN",
            "pa-IN",
            "od-IN",
        ];

        if (
            !supportedLanguages.includes(language)
        ) {
            return res.status(400).json({
                error:
                    `Unsupported language: ${language}`,
            });
        }

        if (text.length > 2500) {
            return res.status(400).json({
                error:
                    "Text is too long for a single TTS request.",
            });
        }

        console.log(
            `Sarvam TTS request: ${language}`
        );

        const response = await fetch(
            "https://api.sarvam.ai/text-to-speech",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "api-subscription-key":
                        apiKey,
                },
                body: JSON.stringify({
                    text,
                    language_code: language,
                    model: "bulbul:v3",
                    speaker: "shubh",
                    output_audio_codec: "wav",
                }),
            }
        );

        if (!response.ok) {
            const errorText =
                await response.text();

            console.error(
                "Sarvam TTS error:",
                response.status,
                errorText
            );

            return res.status(response.status).json({
                error:
                    "Sarvam TTS request failed",
            });
        }

        const data =
            await response.json();

        if (
            !data.audios ||
            !Array.isArray(data.audios) ||
            !data.audios[0]
        ) {
            return res.status(500).json({
                error:
                    "Sarvam TTS returned no audio",
            });
        }

        return res.json({
            audio: data.audios[0],
            language,
        });
    } catch (error) {
        console.error(
            "/api/tts error:",
            error
        );

        return res.status(500).json({
            error:
                error.message ||
                "Something went wrong while generating speech.",
        });
    }
});

app.get("/api/test", (req, res) => {
    res.json({
        message:
            "WeatherGPT backend is working!",
    });
});

app.get("/", (req, res) => {
    res.json({
        message:
            "WeatherGPT backend is running.",
    });
});

const PORT =
    process.env.PORT || 5000;

const HOST =
    process.env.HOST || "0.0.0.0";

app.listen(PORT, HOST, () => {
    console.log(
        `WeatherGPT backend running on ${HOST}:${PORT}`
    );
});