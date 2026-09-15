const API_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, "");

// ------------------------------------------------------------
// TTS SPEAKERS
// ------------------------------------------------------------
//
// These are kept here so the frontend has one central place
// for speaker configuration.
//
// IMPORTANT:
// The current backend still hardcodes "shubh".
// Therefore changing the speaker here will NOT change the
// actual voice until the backend accepts the speaker field.
//
// We will keep this structure ready for that future change.
// ------------------------------------------------------------

export const TTS_SPEAKERS = {
    shubh: {
        id: "shubh",
        label: "Shubh",
    },

    // Future speakers can be added here once the backend
    // supports dynamic speaker selection.

    // speaker2: {
    //     id: "speaker2",
    //     label: "Speaker 2",
    // },

    // speaker3: {
    //     id: "speaker3",
    //     label: "Speaker 3",
    // },
};

// ------------------------------------------------------------
// DEFAULT SPEAKER
// ------------------------------------------------------------

export const DEFAULT_TTS_SPEAKER = "shubh";

// ------------------------------------------------------------
// GENERATE SPEECH
// ------------------------------------------------------------

export async function generateSpeech(
    text,
    language,
    speaker = DEFAULT_TTS_SPEAKER
) {
    if (!text || typeof text !== "string") {
        throw new Error("Text is required");
    }

    if (!language) {
        throw new Error("Language is required");
    }

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
                speaker,
            }),
        }
    );

    if (!response.ok) {
        const errorData =
            await response.json().catch(() => ({}));

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