const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const Groq = require("groq-sdk");

dotenv.config();

const app = express();

// ============================================================
// MIDDLEWARE
// ============================================================

app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

app.use(express.json());



// ============================================================
// GROQ
// ============================================================

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});



// ============================================================
// WEATHER FUNCTIONS
// ============================================================

async function getWeather(location) {
    const url =
        `https://api.openweathermap.org/data/2.5/weather` +
        `?q=${encodeURIComponent(location)}` +
        `&appid=${process.env.WEATHER_API_KEY}` +
        `&units=metric`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(
            `Could not find weather for ${location}`
        );
    }

    const data = await response.json();

    return {
        location: data.name,
        country: data.sys?.country || "",
        temperature: data.main?.temp ?? null,
        feelsLike: data.main?.feels_like ?? null,
        humidity: data.main?.humidity ?? null,
        pressure: data.main?.pressure ?? null,
        windSpeed: data.wind?.speed ?? null,
        condition:
            data.weather?.[0]?.description ||
            "Unknown",
        weatherMain:
            data.weather?.[0]?.main ||
            "Unknown",
        rain:
            data.rain?.["1h"] ??
            data.rain?.["3h"] ??
            0,
    };
}



async function getWeatherByCoordinates(
    latitude,
    longitude
) {
    const url =
        `https://api.openweathermap.org/data/2.5/weather` +
        `?lat=${latitude}` +
        `&lon=${longitude}` +
        `&appid=${process.env.WEATHER_API_KEY}` +
        `&units=metric`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(
            "Could not get weather for the current location."
        );
    }

    const data = await response.json();

    return {
        location: data.name,
        country: data.sys?.country || "",
        temperature: data.main?.temp ?? null,
        feelsLike: data.main?.feels_like ?? null,
        humidity: data.main?.humidity ?? null,
        pressure: data.main?.pressure ?? null,
        windSpeed: data.wind?.speed ?? null,
        condition:
            data.weather?.[0]?.description ||
            "Unknown",
        weatherMain:
            data.weather?.[0]?.main ||
            "Unknown",
        rain:
            data.rain?.["1h"] ??
            data.rain?.["3h"] ??
            0,
    };
}



// ============================================================
// NORMAL WEATHER API
// ============================================================

app.get("/api/weather", async (req, res) => {
    try {
        const { city, lat, lon } = req.query;

        let url;

        if (lat && lon) {
            url =
                `https://api.openweathermap.org/data/2.5/weather` +
                `?lat=${lat}` +
                `&lon=${lon}` +
                `&appid=${process.env.WEATHER_API_KEY}` +
                `&units=metric`;
        } else if (city) {
            url =
                `https://api.openweathermap.org/data/2.5/weather` +
                `?q=${encodeURIComponent(city)}` +
                `&appid=${process.env.WEATHER_API_KEY}` +
                `&units=metric`;
        } else {
            return res.status(400).json({
                error:
                    "Please provide a city or coordinates.",
            });
        }

        const response = await fetch(url);

        if (!response.ok) {
            const errorData =
                await response
                    .json()
                    .catch(() => ({}));

            return res.status(response.status).json({
                error:
                    errorData.message ||
                    "Failed to fetch weather.",
            });
        }

        const data = await response.json();

        res.json(data);
    } catch (error) {
        console.error(
            "Weather API error:",
            error
        );

        res.status(500).json({
            error: "Failed to fetch weather.",
        });
    }
});



// ============================================================
// CURRENT LOCATION QUERY DETECTION
// ============================================================

function isCurrentLocationQuery(message) {
    const normalizedMessage =
        message.toLowerCase().trim();

    const patterns = [
        /\bwhere am i\b/,
        /\bwhere i am\b/,
        /\bwhere i'm\b/,
        /\bwhere i['’]m\b/,
        /\bmy location\b/,
        /\bcurrent location\b/,
        /\bwhere i live\b/,
        /\bweather here\b/,
        /\bweather around me\b/,
        /\bweather near me\b/,
        /\bweather at my location\b/,
        /\bweather at my current location\b/,
        /\btemperature here\b/,
        /\btemperature around me\b/,
        /\btemperature near me\b/,
        /\btemperature at my location\b/,
        /\bwhat's the weather here\b/,
        /\bwhat is the weather here\b/,
        /\bwhat's the weather around me\b/,
        /\bwhat is the weather around me\b/,
        /\bwhat's the weather near me\b/,
        /\bwhat is the weather near me\b/,
        /\bwhat's it like outside here\b/,
        /\bwhat is it like outside here\b/,
    ];

    return patterns.some((pattern) =>
        pattern.test(normalizedMessage)
    );
}



// ============================================================
// CHATBOT API
// ============================================================

app.post("/api/chat", async (req, res) => {
    try {
        const {
            message,
            currentLocation,
        } = req.body;

        if (
            typeof message !== "string" ||
            !message.trim()
        ) {
            return res.status(400).json({
                error: "Message is required.",
            });
        }

        console.log(
            "💬 USER MESSAGE:",
            message
        );

        console.log(
            "📍 CURRENT LOCATION:",
            currentLocation
        );



        // ====================================================
        // CURRENT LOCATION WEATHER
        // ====================================================

        if (isCurrentLocationQuery(message)) {
            console.log(
                "📍 CURRENT LOCATION REQUEST DETECTED"
            );

            if (
                !currentLocation ||
                currentLocation.latitude == null ||
                currentLocation.longitude == null
            ) {
                return res.json({
                    reply:
                        "I can't access your current location right now. Please make sure location permission is enabled.",
                });
            }

            console.log(
                "📍 USING CURRENT LOCATION WEATHER"
            );

            const weatherData =
                await getWeatherByCoordinates(
                    currentLocation.latitude,
                    currentLocation.longitude
                );

            console.log(
                "🌡️ CURRENT LOCATION WEATHER:",
                weatherData
            );



            const weatherCompletion =
                await groq.chat.completions.create({
                    model:
                        "openai/gpt-oss-20b",

                    messages: [
                        {
                            role: "system",
                            content: `
You are WeatherGPT, an AI weather assistant.

Answer the user's question using the supplied current-location weather data.

Do not invent weather information.

Keep the response natural, concise, and conversational.

Respond in the same language as the user's message.

Do not use Markdown formatting.
Do not use bullet points, numbered lists, asterisks, underscores, tildes, pipes, headings, tables, or special formatting characters.

Return plain text only.

If the user asks about the weather, temperature, humidity, wind, rain, or conditions, use the supplied data.

If the user asks "where am I", identify the location from the supplied weather data.

Do not mention GPS coordinates.

Do not claim to know anything that is not contained in the supplied weather data.
`,
                        },

                        {
                            role: "user",
                            content: message,
                        },

                        {
                            role: "system",
                            content:
                                `Current-location weather data:\n${JSON.stringify(
                                    weatherData
                                )}`,
                        },
                    ],
                });

            return res.json({
                reply:
                    weatherCompletion
                        .choices[0]
                        ?.message
                        ?.content ||
                    "I couldn't generate a weather response.",
            });
        }



        // ====================================================
        // NORMAL GROQ CHAT + CITY WEATHER TOOL
        // ====================================================

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

Respond in the same language as the user's message.

Do not use Markdown formatting.
Do not use bullet points, numbered lists, asterisks, underscores, tildes, pipes, headings, tables, or special formatting characters.

Return plain text only.

For unrelated questions, answer normally.

Do not mention internal tools, APIs, function calls, or implementation details.
`,
            },

            {
                role: "user",
                content: message.trim(),
            },
        ];



        // ====================================================
        // WEATHER TOOL
        // ====================================================

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
                                    "The city or location to get the current weather for.",
                            },
                        },

                        required: [
                            "location",
                        ],
                    },
                },
            },
        ];



        // ====================================================
        // FIRST GROQ REQUEST
        // ====================================================

        const completion =
            await groq.chat.completions.create({
                model:
                    "openai/gpt-oss-20b",

                messages,

                tools,

                tool_choice: "auto",
            });



        const assistantMessage =
            completion.choices[0]?.message;



        // ====================================================
        // NO TOOL CALL
        // ====================================================

        if (
            !assistantMessage ||
            !assistantMessage.tool_calls ||
            assistantMessage.tool_calls.length === 0
        ) {
            return res.json({
                reply:
                    assistantMessage?.content ||
                    "I couldn't generate a response.",
            });
        }



        // ====================================================
        // TOOL CALL
        // ====================================================

        messages.push(
            assistantMessage
        );



        for (
            const toolCall
            of assistantMessage.tool_calls
        ) {
            const toolName =
                toolCall.function?.name;

            let argumentsObject = {};

            try {
                argumentsObject =
                    JSON.parse(
                        toolCall.function
                            ?.arguments || "{}"
                    );
            } catch (error) {
                console.error(
                    "Tool argument parsing error:",
                    error
                );

                throw new Error(
                    "Invalid weather tool arguments."
                );
            }



            let toolResult;



            if (
                toolName === "get_weather"
            ) {
                const location =
                    argumentsObject.location;

                if (
                    !location ||
                    typeof location !== "string"
                ) {
                    throw new Error(
                        "Weather location is missing."
                    );
                }

                console.log(
                    "🌍 WEATHER TOOL:",
                    location
                );

                toolResult =
                    await getWeather(
                        location
                    );
            } else {
                throw new Error(
                    `Unknown tool: ${toolName}`
                );
            }



            messages.push({
                role: "tool",

                tool_call_id:
                    toolCall.id,

                content:
                    JSON.stringify(
                        toolResult
                    ),
            });
        }



        // ====================================================
        // FINAL GROQ RESPONSE
        // ====================================================

        const finalCompletion =
            await groq.chat.completions.create({
                model:
                    "openai/gpt-oss-20b",

                messages,
            });



        const finalMessage =
            finalCompletion
                .choices[0]
                ?.message
                ?.content;



        return res.json({
            reply:
                finalMessage ||
                "I couldn't generate a weather response.",
        });
    } catch (error) {
        console.error(
            "❌ Chat API error:",
            error
        );

        return res.status(500).json({
            error:
                "Failed to process chat request.",
        });
    }
});



// ============================================================
// TEST ENDPOINT
// ============================================================

app.get("/api/test", (req, res) => {
    res.json({
        message:
            "Backend is working!",
    });
});



// ============================================================
// ROOT ENDPOINT
// ============================================================

app.get("/", (req, res) => {
    res.json({
        message: "WeatherHub backend is running!",
        endpoints: {
            test: "/api/test",
            weather: "/api/weather",
            chat: "/api/chat",
        },
    });
});



// ============================================================
// SERVER
// ============================================================

// IMPORTANT:
// Render provides the PORT through process.env.PORT.
// Do NOT hard-code port 5000 for production.

const PORT =
    process.env.PORT || 5000;

app.listen(
    PORT,
    "0.0.0.0",
    () => {
        console.log(
            `🚀 Server running on port ${PORT}`
        );
    }
);