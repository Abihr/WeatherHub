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

    console.log("TTS REQUEST:");
    console.log("Language:", language);
    console.log("Speaker:", speaker);

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

    const data = await response.json();

    console.log("TTS RESPONSE:", data);

    if (!data?.audio) {
        throw new Error(
            "No audio was returned from the TTS service"
        );
    }

    return data;
}