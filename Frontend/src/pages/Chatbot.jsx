import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

import {
    Send,
    Bot,
    User,
    Mic,
    MicOff,
    Volume2,
    VolumeX,
    ChevronDown,
} from "lucide-react";

import { useApp } from "../context/AppContext";
import { sendChatMessage } from "../services/chatService";

// ------------------------------------------------------------
// SUPPORTED LANGUAGES
// ------------------------------------------------------------

const VOICE_LANGUAGES = [
    { code: "en-IN", label: "English" },
    { code: "hi-IN", label: "Hindi" },
    { code: "bn-IN", label: "Bengali" },
    { code: "ta-IN", label: "Tamil" },
    { code: "te-IN", label: "Telugu" },
    { code: "mr-IN", label: "Marathi" },
    { code: "gu-IN", label: "Gujarati" },
    { code: "kn-IN", label: "Kannada" },
    { code: "ml-IN", label: "Malayalam" },
    { code: "pa-IN", label: "Punjabi" },
];

export default function Chatbot() {
    const { user } = useApp();

    // --------------------------------------------------------
    // CHAT STATE
    // --------------------------------------------------------

    const [messages, setMessages] = useState([
        {
            id: 1,
            role: "assistant",
            text: "Hi! I'm WeatherGPT 🌤️ Ask me anything!",
        },
    ]);

    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    // --------------------------------------------------------
    // VOICE STATE
    // --------------------------------------------------------

    const [selectedLanguage, setSelectedLanguage] =
        useState("en-IN");

    const [isListening, setIsListening] =
        useState(false);

    const [isSpeaking, setIsSpeaking] =
        useState(false);

    const [voiceSupported, setVoiceSupported] =
        useState(true);

    const [voiceError, setVoiceError] =
        useState("");

    // --------------------------------------------------------
    // RECOGNITION REF
    // --------------------------------------------------------

    const recognitionRef = useRef(null);

    // --------------------------------------------------------
    // SPEECH SYNTHESIS VOICES
    // --------------------------------------------------------

    const [availableVoices, setAvailableVoices] =
        useState([]);

    // ========================================================
    // LOAD BROWSER VOICES
    // ========================================================

    useEffect(() => {
        if (!("speechSynthesis" in window)) {
            return;
        }

        function loadVoices() {
            const voices =
                window.speechSynthesis.getVoices();

            setAvailableVoices(voices);

            console.log(
                "Available speech voices:",
                voices.map((voice) => ({
                    name: voice.name,
                    lang: voice.lang,
                }))
            );
        }

        loadVoices();

        window.speechSynthesis.onvoiceschanged =
            loadVoices;

        return () => {
            window.speechSynthesis.onvoiceschanged =
                null;
        };
    }, []);

    // ========================================================
    // CLEAN TEXT FOR SPEECH
    // ========================================================

    function cleanTextForSpeech(text) {
        if (!text || typeof text !== "string") {
            return "";
        }

        let cleaned = text;

        // ----------------------------------------------------
        // Remove Markdown links
        // ----------------------------------------------------

        cleaned = cleaned.replace(
            /\[([^\]]+)\]\([^)]+\)/g,
            "$1"
        );

        // ----------------------------------------------------
        // Remove Markdown headings
        // ----------------------------------------------------

        cleaned = cleaned.replace(
            /^#{1,6}\s*/gm,
            ""
        );

        // ----------------------------------------------------
        // Remove bold / italic markers
        // ----------------------------------------------------

        cleaned = cleaned.replace(
            /\*\*(.*?)\*\*/g,
            "$1"
        );

        cleaned = cleaned.replace(
            /__(.*?)__/g,
            "$1"
        );

        cleaned = cleaned.replace(
            /\*(.*?)\*/g,
            "$1"
        );

        cleaned = cleaned.replace(
            /_(.*?)_/g,
            "$1"
        );

        // ----------------------------------------------------
        // Remove strikethrough
        // ----------------------------------------------------

        cleaned = cleaned.replace(
            /~~(.*?)~~/g,
            "$1"
        );

        // ----------------------------------------------------
        // Remove bullet markers
        // ----------------------------------------------------

        cleaned = cleaned.replace(
            /^\s*[-*+]\s+/gm,
            ""
        );

        // ----------------------------------------------------
        // Remove numbered-list markers
        // ----------------------------------------------------

        cleaned = cleaned.replace(
            /^\s*\d+\.\s+/gm,
            ""
        );

        // ----------------------------------------------------
        // Remove Markdown table pipes
        // ----------------------------------------------------

        cleaned = cleaned.replace(
            /\|/g,
            " "
        );

        // ----------------------------------------------------
        // Remove Markdown table separator characters
        // ----------------------------------------------------

        cleaned = cleaned.replace(
            /^\s*:?-+:?\s*$/gm,
            ""
        );

        // ----------------------------------------------------
        // Remove backticks
        // ----------------------------------------------------

        cleaned = cleaned.replace(
            /`/g,
            ""
        );

        // ----------------------------------------------------
        // Remove common Markdown formatting characters
        // ----------------------------------------------------

        cleaned = cleaned.replace(
            /[~*_#]/g,
            ""
        );

        // ----------------------------------------------------
        // Remove URLs
        // ----------------------------------------------------

        cleaned = cleaned.replace(
            /https?:\/\/\S+/gi,
            ""
        );

        // ----------------------------------------------------
        // Remove emojis
        // ----------------------------------------------------

        cleaned = cleaned.replace(
            /[\u{1F300}-\u{1FAFF}]/gu,
            ""
        );

        cleaned = cleaned.replace(
            /[\u{2600}-\u{27BF}]/gu,
            ""
        );

        // ----------------------------------------------------
        // Remove variation selectors
        // ----------------------------------------------------

        cleaned = cleaned.replace(
            /[\uFE0E\uFE0F]/g,
            ""
        );

        // ----------------------------------------------------
        // Remove zero-width characters
        // ----------------------------------------------------

        cleaned = cleaned.replace(
            /[\u200B-\u200D\u2060]/g,
            ""
        );

        // ----------------------------------------------------
        // Normalize whitespace
        // ----------------------------------------------------

        cleaned = cleaned.replace(
            /[ \t]{2,}/g,
            " "
        );

        cleaned = cleaned.replace(
            /\n{3,}/g,
            "\n\n"
        );

        return cleaned.trim();
    }

    // ========================================================
    // FIND VOICE FOR SELECTED LANGUAGE
    // ========================================================

    function getBestVoice(languageCode) {
        if (!availableVoices.length) {
            return null;
        }

        const baseLanguage =
            languageCode
                .split("-")[0]
                .toLowerCase();

        // ----------------------------------------------------
        // First: exact Indian locale
        // Example: gu-IN
        // ----------------------------------------------------

        const exactIndianVoice =
            availableVoices.find(
                (voice) =>
                    voice.lang?.toLowerCase() ===
                    languageCode.toLowerCase()
            );

        if (exactIndianVoice) {
            return exactIndianVoice;
        }

        // ----------------------------------------------------
        // Second: same language, any region
        // Example: gu
        // ----------------------------------------------------

        const sameLanguageVoice =
            availableVoices.find(
                (voice) =>
                    voice.lang
                        ?.toLowerCase()
                        .startsWith(
                            `${baseLanguage}-`
                        ) ||
                    voice.lang
                        ?.toLowerCase() ===
                        baseLanguage
            );

        if (sameLanguageVoice) {
            return sameLanguageVoice;
        }

        // ----------------------------------------------------
        // No matching voice
        // ----------------------------------------------------

        return null;
    }

    // ========================================================
    // CREATE SPEECH RECOGNITION INSTANCE
    // ========================================================

    useEffect(() => {
        const SpeechRecognition =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            setVoiceSupported(false);
            return;
        }

        const recognition =
            new SpeechRecognition();

        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognitionRef.current = recognition;

        // ----------------------------------------------------
        // Recognition started
        // ----------------------------------------------------

        recognition.onstart = () => {
            setIsListening(true);
            setVoiceError("");
        };

        // ----------------------------------------------------
        // Recognition result
        // ----------------------------------------------------

        recognition.onresult = (event) => {
            let transcript = "";

            for (
                let i = event.resultIndex;
                i < event.results.length;
                i++
            ) {
                transcript +=
                    event.results[i][0].transcript;
            }

            setInput(transcript);
        };

        // ----------------------------------------------------
        // Recognition ended
        // ----------------------------------------------------

        recognition.onend = () => {
            setIsListening(false);
        };

        // ----------------------------------------------------
        // Recognition error
        // ----------------------------------------------------

        recognition.onerror = (event) => {
            console.error(
                "Speech recognition error:",
                event.error
            );

            setIsListening(false);

            if (event.error === "not-allowed") {
                setVoiceError(
                    "Microphone permission was denied."
                );
            } else if (
                event.error === "language-not-supported"
            ) {
                setVoiceError(
                    "This language is not supported by your browser."
                );
            } else if (
                event.error === "no-speech"
            ) {
                setVoiceError(
                    "No speech was detected. Please try again."
                );
            } else {
                setVoiceError(
                    "Voice recognition failed. Please try again."
                );
            }
        };

        return () => {
            try {
                recognition.stop();
            } catch (error) {
                // Recognition may already be stopped.
            }

            recognitionRef.current = null;
        };
    }, []);

    // ========================================================
    // UPDATE RECOGNITION LANGUAGE
    // ========================================================

    useEffect(() => {
        if (recognitionRef.current) {
            recognitionRef.current.lang =
                selectedLanguage;
        }
    }, [selectedLanguage]);

    // ========================================================
    // START / STOP LISTENING
    // ========================================================

    function toggleListening() {
        if (!voiceSupported) {
            setVoiceError(
                "Voice recognition is not supported in this browser."
            );
            return;
        }

        const recognition =
            recognitionRef.current;

        if (!recognition) {
            setVoiceError(
                "Voice recognition is unavailable."
            );
            return;
        }

        setVoiceError("");

        if (isListening) {
            recognition.stop();
            return;
        }

        recognition.lang =
            selectedLanguage;

        try {
            recognition.start();
        } catch (error) {
            console.error(
                "Failed to start recognition:",
                error
            );
        }
    }

    // ========================================================
    // TEXT TO SPEECH
    // ========================================================

    function speakText(text) {
        if (
            !text ||
            !("speechSynthesis" in window)
        ) {
            return;
        }

        const speechText =
            cleanTextForSpeech(text);

        if (!speechText) {
            return;
        }

        // ----------------------------------------------------
        // Stop previous speech
        // ----------------------------------------------------

        window.speechSynthesis.cancel();

        const utterance =
            new SpeechSynthesisUtterance(
                speechText
            );

        // ----------------------------------------------------
        // Set requested language
        // ----------------------------------------------------

        utterance.lang =
            selectedLanguage;

        utterance.rate = 1;
        utterance.pitch = 1;
        utterance.volume = 1;

        // ----------------------------------------------------
        // Select matching browser voice
        // ----------------------------------------------------

        const selectedVoice =
            getBestVoice(selectedLanguage);

        if (selectedVoice) {
            utterance.voice =
                selectedVoice;

            console.log(
                "Using speech voice:",
                selectedVoice.name,
                selectedVoice.lang
            );
        } else {
            console.warn(
                `No installed speech voice found for ${selectedLanguage}. Browser may use a fallback voice.`
            );

            setVoiceError(
                `Your browser does not have a ${selectedLanguage} voice installed. Speech may use an English fallback.`
            );
        }

        // ----------------------------------------------------
        // Speech started
        // ----------------------------------------------------

        utterance.onstart = () => {
            setIsSpeaking(true);
        };

        // ----------------------------------------------------
        // Speech ended
        // ----------------------------------------------------

        utterance.onend = () => {
            setIsSpeaking(false);
        };

        // ----------------------------------------------------
        // Speech error
        // ----------------------------------------------------

        utterance.onerror = (event) => {
            console.error(
                "Speech synthesis error:",
                event
            );

            setIsSpeaking(false);
        };

        // ----------------------------------------------------
        // Speak
        // ----------------------------------------------------

        window.speechSynthesis.speak(
            utterance
        );
    }

    // ========================================================
    // STOP SPEAKING
    // ========================================================

    function stopSpeaking() {
        if ("speechSynthesis" in window) {
            window.speechSynthesis.cancel();
        }

        setIsSpeaking(false);
    }

    // ========================================================
    // SEND MESSAGE
    // ========================================================

    async function handleSend() {
        const text = input.trim();

        if (!text || loading) {
            return;
        }

        // Stop recording if active
        if (
            isListening &&
            recognitionRef.current
        ) {
            recognitionRef.current.stop();
        }

        // Stop previous speech
        stopSpeaking();

        const userMessage = {
            id: Date.now(),
            role: "user",
            text,
        };

        setMessages((previous) => [
            ...previous,
            userMessage,
        ]);

        setInput("");
        setLoading(true);
        setVoiceError("");

        const currentLocation = {
            latitude:
                user?.location?.lat ??
                user?.latitude ??
                null,

            longitude:
                user?.location?.lng ??
                user?.longitude ??
                null,
        };

        console.log(
            "📤 CHATBOT SENDING LOCATION:",
            currentLocation
        );

        try {
            const data =
                await sendChatMessage(
                    text,
                    currentLocation
                );

            const reply =
                data?.reply ||
                "Sorry, I couldn't generate a response.";

            const assistantMessage = {
                id: Date.now() + 1,
                role: "assistant",
                text: reply,
            };

            setMessages((previous) => [
                ...previous,
                assistantMessage,
            ]);

            // ------------------------------------------------
            // Speak AI response automatically
            // ------------------------------------------------

            speakText(reply);

        } catch (error) {
            console.error(
                "Chat error:",
                error
            );

            const errorMessage = {
                id: Date.now() + 1,
                role: "assistant",
                text:
                    "Sorry, I couldn't connect to the AI right now.",
            };

            setMessages((previous) => [
                ...previous,
                errorMessage,
            ]);

        } finally {
            setLoading(false);
        }
    }

    // ========================================================
    // ENTER KEY
    // ========================================================

    function handleKeyDown(event) {
        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {
            event.preventDefault();
            handleSend();
        }
    }

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-28 md:pb-10">

            {/* ------------------------------------------------
                HEADER
            ------------------------------------------------- */}

            <div className="mb-6">

                <h1 className="text-xl md:text-2xl font-display font-extrabold text-ink-900">
                    WeatherGPT
                </h1>

                <p className="text-sm text-ink-400 mt-1">
                    Your AI weather assistant
                </p>

            </div>

            {/* ------------------------------------------------
                CHAT CONTAINER
            ------------------------------------------------- */}

            <div className="bg-white rounded-xl3 shadow-card overflow-hidden">

                {/* ------------------------------------------------
                    MESSAGES
                ------------------------------------------------- */}

                <div className="h-[520px] overflow-y-auto px-4 sm:px-7 py-6">

                    <div className="space-y-7">

                        {messages.map((message) => {

                            const isUser =
                                message.role === "user";

                            return (
                                <div
                                    key={message.id}
                                    className={`flex gap-3 ${
                                        isUser
                                            ? "justify-end"
                                            : "justify-start"
                                    }`}
                                >

                                    {/* Assistant icon */}

                                    {!isUser && (
                                        <div className="w-9 h-9 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center shrink-0 mt-1">
                                            <Bot size={18} />
                                        </div>
                                    )}

                                    {/* User message */}

                                    {isUser ? (

                                        <>
                                            <div className="max-w-[75%]">

                                                <div className="px-4 py-3 rounded-2xl rounded-br-md bg-sky-500 text-white text-sm leading-6">
                                                    {message.text}
                                                </div>

                                            </div>

                                            <div className="w-9 h-9 rounded-full bg-ink-100 text-ink-600 flex items-center justify-center shrink-0 mt-1">
                                                <User size={18} />
                                            </div>
                                        </>

                                    ) : (

                                        /* Assistant message */

                                        <div className="max-w-[88%] sm:max-w-[82%] text-ink-700 text-sm leading-6">

                                            <ReactMarkdown
                                                components={{

                                                    p: ({ children }) => (
                                                        <p className="mb-4 last:mb-0">
                                                            {children}
                                                        </p>
                                                    ),

                                                    strong: ({ children }) => (
                                                        <strong className="font-bold text-ink-900">
                                                            {children}
                                                        </strong>
                                                    ),

                                                    em: ({ children }) => (
                                                        <em className="italic">
                                                            {children}
                                                        </em>
                                                    ),

                                                    ol: ({ children }) => (
                                                        <ol className="space-y-4 my-4 pl-6 list-decimal marker:font-semibold marker:text-sky-600">
                                                            {children}
                                                        </ol>
                                                    ),

                                                    ul: ({ children }) => (
                                                        <ul className="space-y-2 my-4 pl-6 list-disc marker:text-sky-500">
                                                            {children}
                                                        </ul>
                                                    ),

                                                    li: ({ children }) => (
                                                        <li className="pl-1 leading-6">
                                                            {children}
                                                        </li>
                                                    ),

                                                    h1: ({ children }) => (
                                                        <h1 className="text-xl font-bold text-ink-900 mt-5 mb-3">
                                                            {children}
                                                        </h1>
                                                    ),

                                                    h2: ({ children }) => (
                                                        <h2 className="text-lg font-bold text-ink-900 mt-5 mb-3">
                                                            {children}
                                                        </h2>
                                                    ),

                                                    h3: ({ children }) => (
                                                        <h3 className="text-base font-bold text-ink-900 mt-4 mb-2">
                                                            {children}
                                                        </h3>
                                                    ),

                                                    blockquote: ({ children }) => (
                                                        <blockquote className="border-l-4 border-sky-300 pl-4 my-4 text-ink-500 italic">
                                                            {children}
                                                        </blockquote>
                                                    ),

                                                    hr: () => (
                                                        <hr className="my-5 border-ink-100" />
                                                    ),

                                                    code: ({ children }) => (
                                                        <code className="px-1.5 py-0.5 rounded-md bg-ink-100 text-ink-800 text-xs">
                                                            {children}
                                                        </code>
                                                    ),

                                                    a: ({ children, href }) => (
                                                        <a
                                                            href={href}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sky-600 underline hover:text-sky-700"
                                                        >
                                                            {children}
                                                        </a>
                                                    ),

                                                }}
                                            >
                                                {message.text}
                                            </ReactMarkdown>

                                            {/* Read aloud button */}

                                            {"speechSynthesis" in window && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        isSpeaking
                                                            ? stopSpeaking()
                                                            : speakText(
                                                                message.text
                                                            )
                                                    }
                                                    className="mt-2 inline-flex items-center gap-1.5 text-xs text-ink-400 hover:text-sky-600 transition-colors"
                                                >
                                                    {isSpeaking ? (
                                                        <>
                                                            <VolumeX size={14} />
                                                            Stop
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Volume2 size={14} />
                                                            Read aloud
                                                        </>
                                                    )}
                                                </button>
                                            )}

                                        </div>
                                    )}

                                </div>
                            );
                        })}

                        {/* Loading */}

                        {loading && (
                            <div className="flex gap-3 justify-start">

                                <div className="w-9 h-9 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center shrink-0 mt-1">
                                    <Bot size={18} />
                                </div>

                                <div className="flex items-center gap-1.5 pt-3">

                                    <span className="w-2 h-2 rounded-full bg-ink-300 animate-bounce" />

                                    <span
                                        className="w-2 h-2 rounded-full bg-ink-300 animate-bounce"
                                        style={{
                                            animationDelay:
                                                "120ms"
                                        }}
                                    />

                                    <span
                                        className="w-2 h-2 rounded-full bg-ink-300 animate-bounce"
                                        style={{
                                            animationDelay:
                                                "240ms"
                                        }}
                                    />

                                </div>

                            </div>
                        )}

                    </div>

                </div>


                {/* ------------------------------------------------
                    VOICE ERROR
                ------------------------------------------------- */}

                {voiceError && (
                    <div className="px-4 sm:px-7 pb-2">

                        <div className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                            {voiceError}
                        </div>

                    </div>
                )}


                {/* ------------------------------------------------
                    INPUT AREA
                ------------------------------------------------- */}

                <div className="border-t border-ink-100 p-3 sm:p-4">

                    {/* Voice controls */}

                    <div className="flex items-center justify-between mb-2">

                        {/* Language selector */}

                        <div className="relative">

                            <select
                                value={selectedLanguage}
                                onChange={(event) =>
                                    setSelectedLanguage(
                                        event.target.value
                                    )
                                }
                                disabled={isListening}
                                className="appearance-none bg-sky-50 border border-sky-100 rounded-lg px-3 py-1.5 pr-8 text-xs text-ink-700 outline-none focus:border-sky-300 disabled:opacity-60"
                            >
                                {VOICE_LANGUAGES.map(
                                    (language) => (
                                        <option
                                            key={
                                                language.code
                                            }
                                            value={
                                                language.code
                                            }
                                        >
                                            {language.label}
                                        </option>
                                    )
                                )}
                            </select>

                            <ChevronDown
                                size={14}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none"
                            />

                        </div>


                        {/* Voice status */}

                        {isListening && (
                            <div className="flex items-center gap-2 text-xs text-red-500">

                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />

                                Listening...

                            </div>
                        )}

                    </div>


                    <div className="flex items-center gap-2">

                        {/* Text input */}

                        <input
                            type="text"
                            value={input}
                            onChange={(event) =>
                                setInput(
                                    event.target.value
                                )
                            }
                            onKeyDown={handleKeyDown}
                            placeholder={
                                isListening
                                    ? "Speak now..."
                                    : "Ask WeatherGPT..."
                            }
                            disabled={loading}
                            className="flex-1 px-4 py-3 rounded-xl bg-sky-50 border border-sky-100 outline-none text-sm text-ink-800 placeholder:text-ink-400 focus:border-sky-300 focus:ring-2 focus:ring-sky-100 disabled:opacity-60"
                        />


                        {/* Microphone */}

                        <button
                            type="button"
                            onClick={toggleListening}
                            disabled={
                                loading ||
                                !voiceSupported
                            }
                            title={
                                !voiceSupported
                                    ? "Voice recognition is not supported in this browser"
                                    : isListening
                                    ? "Stop listening"
                                    : "Start voice input"
                            }
                            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                                isListening
                                    ? "bg-red-500 text-white hover:bg-red-600"
                                    : "bg-sky-100 text-sky-600 hover:bg-sky-200"
                            } disabled:opacity-40`}
                        >

                            {isListening ? (
                                <MicOff size={18} />
                            ) : (
                                <Mic size={18} />
                            )}

                        </button>


                        {/* Send */}

                        <button
                            onClick={handleSend}
                            disabled={
                                !input.trim() ||
                                loading
                            }
                            className="w-11 h-11 rounded-xl bg-sky-500 text-white flex items-center justify-center disabled:opacity-40 hover:bg-sky-600 transition-colors shrink-0"
                        >

                            <Send size={18} />

                        </button>

                    </div>

                </div>

            </div>
        </div>
    );
}