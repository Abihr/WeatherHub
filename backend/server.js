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
```

}

function cleanChatResponse(text) {
if (!text || typeof text !== "string") {
return text;
}

```
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

* Do NOT translate the user's message into English.
* Do NOT answer in English unless the user's message is in English.
* Keep the response natural and conversational in ${language}.
* Use the normal writing system/script of ${language}.
* Do not mix English into the response unnecessarily.
* If weather values contain units such as degrees Celsius, express them naturally in ${language}.
* Return plain text only.
* Do not use Markdown.
* Do not use headings.
* Do not use bullet points.
* Do not use numbered lists.
* Do not use asterisks.
* Do not use underscores.
* Do not use tildes.
* Do not use pipes.
* Do not use tables.
* Do not use Markdown links.
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

app.get("/api/weather", async (req, res) => {
try {
const { location } = req.query;


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

    messages.push(assistantMessage);

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

            messages.push({
                role: "tool",
                tool_call_id: toolCall.id,
                content: JSON.stringify(
                    weatherToolResult
                ),
            });

            continue;
        }

        try {
            const weather =
                await getWeather(location);

            weatherToolResult = weather;

            messages.push({
                role: "tool",
                tool_call_id: toolCall.id,
                content: JSON.stringify(
                    weather
                ),
            });
        } catch (error) {
            console.error(
                "Weather tool error:",
                error
            );

            weatherToolResult = {
                error: error.message,
            };

            messages.push({
                role: "tool",
                tool_call_id: toolCall.id,
                content: JSON.stringify(
                    weatherToolResult
                ),
            });
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

    if (!language || typeof language !== "string") {
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

    if (!supportedLanguages.includes(language)) {
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

app.listen(PORT, () => {
console.log(
`WeatherGPT backend running on port ${PORT}`
);
});
