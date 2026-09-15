const API_URL =
    import.meta.env.VITE_API_URL?.replace(/\/+$/, "");

// ============================================================
// LANGUAGE -> SARVAM SPEAKER
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
// GET SPEAKER FOR SELECTED LANGUAGE
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
    speaker = getSpeakerForLanguage(language)
) {
    if (!text || typeof text !== "string") {
        throw new Error("Text is required");
    }

    if (!language) {
        throw new Error("Language is required");
    }

    const selectedSpeaker =
        speaker || getSpeakerForLanguage(language);

    console.log("TTS REQUEST:");
    console.log("Language:", language);
    console.log("Speaker:", selectedSpeaker);

    const response = await fetch(
        `${API_URL}/api/tts`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
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
            await response.json().catch(() => ({}));

        throw new Error(
            errorData.error ||
            `TTS request failed with status ${response.status}`
        );
    }

    const data = await response.json();

    if (!data?.audio) {
        throw new Error(
            "No audio was returned from the TTS service"
        );
    }

    return data;
}