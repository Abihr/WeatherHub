const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const Groq = require("groq-sdk");

dotenv.config();

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



// ============================================================
// LANGUAGE DETECTION
// ============================================================

function detectUserLanguage(message) {
    if (!message || typeof message !== "string") {
        return "English";
    }

    // Bengali
    if (/[\u0980-\u09FF]/.test(message)) {
        return "Bengali";
    }

    // Gujarati
    if (/[\u0A80-\u0AFF]/.test(message)) {
        return "Gujarati";
    }

    // Tamil
    if (/[\u0B80-\u0BFF]/.test(message)) {
        return "Tamil";
    }

    // Telugu
    if (/[\u0C00-\u0C7F]/.test(message)) {
        return "Telugu";
    }

    // Kannada
    if (/[\u0C80-\u0CFF]/.test(message)) {
        return "Kannada";
    }

    // Malayalam
    if (/[\u0D00-\u0D7F]/.test(message)) {
        return "Malayalam";
    }

    // Punjabi / Gurmukhi
    if (/[\u0A00-\u0A7F]/.test(message)) {
        return "Punjabi";
    }

    // Devanagari
    if (/[\u0900-\u097F]/.test(message)) {
        return "Hindi";
    }

    return "English";
}



// ============================================================
// RESPONSE CLEANER
// ============================================================

function cleanChatResponse(text) {
    if (!text || typeof text !== "string") {
        return text;
    }

    let cleaned = text;

    // Remove Markdown headings
    cleaned = cleaned.replace(/^#{1,6}\s*/gm, "");

    // Remove bold
    cleaned = cleaned.replace(/\*\*(.*?)\*\*/g, "$1");

    // Remove bold using underscores
    cleaned = cleaned.replace(/__(.*?)__/g, "$1");

    // Remove italic
    cleaned = cleaned.replace(/\*(.*?)\*/g, "$1");

    // Remove italic using underscores
    cleaned = cleaned.replace(/_(.*?)_/g, "$1");

    // Remove strikethrough
    cleaned = cleaned.replace(/~~(.*?)~~/g, "$1");

    // Remove Markdown links but keep their text
    cleaned = cleaned.replace(
        /\[([^\]]+)\]\([^)]+\)/g,
        "$1"
    );

    // Remove bullet points
    cleaned = cleaned.replace(/^\s*[-*+]\s+/gm, "");

    // Remove numbered-list formatting
    cleaned = cleaned.replace(/^\s*\d+\.\s+/gm, "");

    // Remove Markdown table separator rows
    cleaned = cleaned.replace(
        /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)+\|?\s*$/gm,
        ""
    );

    // Remove remaining pipe characters
    cleaned = cleaned.replace(/\|/g, "");

    // Remove backticks
    cleaned = cleaned.replace(/`/g, "");

    // Remove excessive spaces
    cleaned = cleaned.replace(/[ \t]{2,}/g, " ");

    // Remove excessive blank lines
    cleaned = cleaned.replace(/\n{3,}/g, "\n\n");

    return cleaned.trim();
}



// ============================================================
// LANGUAGE INSTRUCTION
// ============================================================

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



// ============================================================
// WEATHER FUNCTION
// ============================================================

async function getWeather(location) {
    try {
        const apiKey = process.env.WEATHER_API_KEY;

        if (!apiKey) {
            throw new Error("WEATHER_API_KEY is not configured");
        }

        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
                location
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



// ============================================================
// WEATHER BY COORDINATES
// ============================================================

async function getWeatherByCoordinates(latitude, longitude) {
    try {
        const apiKey = process.env.WEATHER_API_KEY;

        if (!apiKey) {
            throw new Error("WEATHER_API_KEY is not configured");
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



// ============================================================
// CURRENT LOCATION QUERY DETECTION
// ============================================================

function isCurrentLocationQuery(message) {
    if (!message || typeof message !== "string") {
        return false;
    }

    const normalized = message.toLowerCase().trim();

    // English
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



    // Hindi
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



    // Bengali
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



    // Gujarati
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



    // Tamil
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



    // Telugu
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



    // Kannada
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



    // Malayalam
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



    // Punjabi
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



// ============================================================
// WEATHER API ENDPOINT
// ============================================================

app.get("/api/weather", async (req, res) => {
    try {
        const { location } = req.query;

        if (!location) {
            return res.status(400).json({
                error: "Location is required",
            });
        }

        const weather = await getWeather(location);

        res.json(weather);
    } catch (error) {
        console.error("/api/weather error:", error);

        res.status(500).json({
            error: error.message,
        });
    }
});



// ============================================================
// CHAT ENDPOINT
// ============================================================

app.post("/api/chat", async (req, res) => {
    try {
        const {
            message,
            currentLocation,
            conversationHistory = [],
        } = req.body;

        // IMPORTANT:
        // Frontend sends the coordinates inside currentLocation.
        // Extract them here so the current-location weather
        // feature receives the coordinates correctly.

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



        const userLanguage = detectUserLanguage(message);

        console.log(
            "Detected language:",
            userLanguage
        );



        const languageInstruction =
            getLanguageInstruction(userLanguage);



        // ========================================================
        // CURRENT LOCATION REQUEST
        // ========================================================

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
                completion.choices?.[0]?.message?.content ||
                "Unable to generate a response.";



            const reply =
                cleanChatResponse(rawReply);



            return res.json({
                reply,
            });
        }



        // ========================================================
        // NORMAL CHAT + WEATHER TOOL
        // ========================================================

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



        // ========================================================
        // NO TOOL CALL
        // ========================================================

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



        // ========================================================
        // PROCESS TOOL CALL
        // ========================================================

        messages.push(assistantMessage);



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



            const location = args.location;



            if (!location) {
                messages.push({
                    role: "tool",
                    tool_call_id: toolCall.id,
                    content: JSON.stringify({
                        error:
                            "Location was not provided.",
                    }),
                });

                continue;
            }



            try {
                const weather =
                    await getWeather(location);



                messages.push({
                    role: "tool",
                    tool_call_id: toolCall.id,
                    content: JSON.stringify(weather),
                });
            } catch (error) {
                console.error(
                    "Weather tool error:",
                    error
                );



                messages.push({
                    role: "tool",
                    tool_call_id: toolCall.id,
                    content: JSON.stringify({
                        error: error.message,
                    }),
                });
            }
        }



        // ========================================================
        // FINAL RESPONSE
        // ========================================================

        messages.push({
            role: "system",
            content: `
Now provide the final answer to the user.

${languageInstruction}

Use the weather data returned by the tool when answering weather questions.

Do not invent weather information.

Return only the final answer.
`,
        });



        const finalCompletion =
            await groq.chat.completions.create({
                model: "openai/gpt-oss-20b",
                messages,
                temperature: 0.3,
            });



        const rawReply =
            finalCompletion.choices?.[0]?.message?.content ||
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



// ============================================================
// TEST ENDPOINT
// ============================================================

app.get("/api/test", (req, res) => {
    res.json({
        message: "WeatherGPT backend is working!",
    });
});



// ============================================================
// ROOT ENDPOINT
// ============================================================

app.get("/", (req, res) => {
    res.json({
        message: "WeatherGPT backend is running.",
    });
});



// ============================================================
// START SERVER
// ============================================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(
        `WeatherGPT backend running on port ${PORT}`
    );
});