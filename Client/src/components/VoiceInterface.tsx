import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Pause, Play, Volume2, VolumeX, X } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import Lottie from "lottie-react";
import speakWaveAnimation from "../assets/speak-wave.json";

interface VoiceInterfaceProps {
    onClose: () => void;
}

const VoiceInterface = ({ onClose }: VoiceInterfaceProps) => {
    const { currentColors, currentPalette } = useTheme();
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(true);
    const [isPaused, setIsPaused] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [transcript, setTranscript] = useState(
        "Hello! I'm your AI voice assistant. How can I help you today?",
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lottieRef = useRef<any>(null);

    // Control animation based on pause state
    useEffect(() => {
        if (lottieRef.current) {
            if (isPaused) {
                lottieRef.current.goToAndStop(0, true); // Reset to first frame
            } else {
                lottieRef.current.play();
            }
        }
    }, [isPaused]);

    // Apply theme color to animation
    useEffect(() => {
        const timer = setTimeout(() => {
            if (lottieRef.current?.animationItem?.renderer?.svgElement) {
                const svg = lottieRef.current.animationItem.renderer.svgElement;
                const elements = svg.querySelectorAll(
                    "path, rect, circle, ellipse, polygon",
                );
                elements.forEach((el: SVGElement) => {
                    // Change fill color
                    if (
                        el.getAttribute("fill") &&
                        el.getAttribute("fill") !== "none"
                    ) {
                        el.setAttribute("fill", currentPalette.primary);
                    }
                    // Change stroke color
                    if (
                        el.getAttribute("stroke") &&
                        el.getAttribute("stroke") !== "none"
                    ) {
                        el.setAttribute("stroke", currentPalette.primary);
                    }
                });
            }
        }, 100);
        return () => clearTimeout(timer);
    }, [currentPalette.primary, isSpeaking]);

    const toggleListening = () => {
        setIsListening(!isListening);
    };

    const togglePause = () => {
        setIsPaused(!isPaused);
    };

    const toggleMute = () => {
        setIsMuted(!isMuted);
    };

    return (
        <div
            className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden"
            style={{ backgroundColor: currentColors.bg }}
        >
            {/* Close button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-lg transition-all hover:opacity-70 z-10"
                style={{
                    backgroundColor: currentColors.surface,
                    color: currentColors.text,
                }}
                title="Exit voice mode"
            >
                <X className="w-5 h-5" />
            </button>

            {/* Main content */}
            <div className="flex flex-col items-center gap-8 z-10 max-w-2xl w-full">
                {/* Central AI Avatar/Visualizer */}
                <div className="relative">
                    {/* Voice wave animation */}
                    {isSpeaking && !isMuted && (
                        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                            <div style={{ width: "240px", height: "120px" }}>
                                <Lottie
                                    lottieRef={lottieRef}
                                    animationData={speakWaveAnimation}
                                    loop={true}
                                    autoplay={!isPaused}
                                    rendererSettings={{
                                        preserveAspectRatio: "xMidYMid meet",
                                    }}
                                    style={{
                                        width: "110%",
                                        height: "110%",
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Status text */}
                <div className="text-center space-y-2">
                    <h2
                        className="text-2xl font-bold"
                        style={{ color: currentColors.text }}
                    >
                        {isPaused
                            ? "Paused"
                            : isSpeaking
                              ? "AI is speaking..."
                              : isListening
                                ? "Listening..."
                                : "Waiting"}
                    </h2>
                    <p
                        className="text-sm"
                        style={{ color: currentColors.textSecondary }}
                    >
                        {isPaused
                            ? "Voice assistant paused"
                            : isSpeaking
                              ? "AI is responding to your query"
                              : isListening
                                ? "Speak now, I'm listening"
                                : "Press the microphone to speak"}
                    </p>
                </div>

                {/* Transcript box */}
                <div
                    className="w-full p-6 rounded-2xl border-2 min-h-[120px] max-h-[200px] overflow-y-auto"
                    style={{
                        backgroundColor: currentColors.surface,
                        borderColor: currentColors.border,
                        boxShadow: `0 4px 20px ${currentColors.border}`,
                    }}
                >
                    <p
                        className="text-center leading-relaxed"
                        style={{ color: currentColors.text }}
                    >
                        {transcript}
                    </p>
                </div>

                {/* Control buttons */}
                <div className="flex gap-4">
                    {/* Microphone button */}
                    <button
                        onClick={toggleListening}
                        className="p-5 rounded-full transition-all transform hover:scale-110 active:scale-95 shadow-lg"
                        style={{
                            backgroundColor: isListening
                                ? "#EF4444"
                                : currentPalette.primary,
                            color: "white",
                        }}
                        title={
                            isListening ? "Stop listening" : "Start listening"
                        }
                    >
                        {isListening ? (
                            <MicOff className="w-8 h-8" />
                        ) : (
                            <Mic className="w-8 h-8" />
                        )}
                    </button>

                    {/* Pause/Resume button */}
                    <button
                        onClick={togglePause}
                        disabled={!isSpeaking}
                        className="p-5 rounded-full transition-all transform hover:scale-110 active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                            backgroundColor: currentColors.surface,
                            color: currentPalette.primary,
                            border: `2px solid ${currentPalette.primary}`,
                        }}
                        title={isPaused ? "Resume" : "Pause"}
                    >
                        {isPaused ? (
                            <Play className="w-8 h-8" />
                        ) : (
                            <Pause className="w-8 h-8" />
                        )}
                    </button>

                    {/* Mute/Unmute button */}
                    <button
                        onClick={toggleMute}
                        className="p-5 rounded-full transition-all transform hover:scale-110 active:scale-95 shadow-lg"
                        style={{
                            backgroundColor: isMuted
                                ? "#EF4444"
                                : currentColors.surface,
                            color: isMuted ? "white" : currentPalette.primary,
                            border: `2px solid ${isMuted ? "#EF4444" : currentPalette.primary}`,
                        }}
                        title={isMuted ? "Unmute" : "Mute"}
                    >
                        {isMuted ? (
                            <VolumeX className="w-8 h-8" />
                        ) : (
                            <Volume2 className="w-8 h-8" />
                        )}
                    </button>
                </div>

                {/* Hint text */}
                <p
                    className="text-xs text-center max-w-md"
                    style={{ color: currentColors.textSecondary }}
                >
                    Click the microphone to speak, pause to stop AI response, or
                    mute to silence audio output
                </p>
            </div>
        </div>
    );
};

export default VoiceInterface;
