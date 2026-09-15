const API_URL =
    import.meta.env.VITE_API_URL?.replace(/\/+$/, "");

// ============================================================
// LANGUAGE → SARVAM SPEAKER
// ============================================================
//
// WeatherGPT automatically selects one dedicated voice
// according to the language selected by the user.
//
// All speaker IDs are lowercase because Sarvam requires
// lowercase, case-sensitive speaker names.
// ============================================================

export const TTS_VOICE_MAP = {
    "en-IN": "ratan",
    "hi-IN": "shubh",
    "bn-IN": "rehan",
    "ta-IN": "rohan",
    "te-IN": "neha",
    "mr-IN": "priya",
    "gu-IN": "ritu",
    "kn-IN": "ishita",
    "ml-IN": "pooja",
    "pa-IN": "mani",
};

// ============================================================
// DEFAULT SPEAKER
// ============================================================

export const DEFAULT_TTS_SPEAKER = "shubh";

// ============================================================
// GET SPEAKER FOR LANGUAGE
// ============================================================

export function getSpeakerForLanguage(language) {
    return (
        TTS_VOICE_MAP[language] ||
        DEFAULT_TTS_SPEAKER
    );
}

// ============================================================
// GENERATE SPEECH
// ============================================================

export async function generateSpeech(
    text,
    language,
    speaker
) {
    if (!text || typeof text !== "string") {
        throw new Error("Text is required");
    }

    if (!language) {
        throw new Error("Language is required");
    }

    // If a speaker was not explicitly supplied,
    // automatically select the speaker for the language.
    const selectedSpeaker =
        speaker ||
        getSpeakerForLanguage(language);

    const response = await fetch(
        `${API_URL}/api/tts`,
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json",
            },

            body: JSON.stringify({
                text,
                language,
                speaker: selectedSpeaker,
            }),
        }
    );

    if (!response.ok) {
        const errorData =
            await response
                .json()
                .catch(() => ({}));

        throw new Error(
            errorData.error ||
            "Failed to generate speech"
        );
    }

    const data =
        await response.json();

    if (!data?.audio) {
        throw new Error(
            "No audio was returned from the TTS service"
        );
    }

    return data;
}