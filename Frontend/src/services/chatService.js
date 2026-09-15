const API_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, "");

export async function sendChatMessage(
    message,
    currentLocation,
    conversationHistory,
    friendContext
) {
    const response = await fetch(
        `${API_URL}/api/chat`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
            },

            body: JSON.stringify({
                message,
                currentLocation,
                conversationHistory,
                friendContext,
            }),
        }
    );

    if (!response.ok) {
        const errorData =
            await response.json().catch(() => ({}));

        throw new Error(
            errorData.error ||
            "Failed to send message"
        );
    }

    return response.json();
}

