import { useState, useRef, useEffect } from "react";
import {
    X,
    Play,
    Pause,
    Maximize,
    Minimize,
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

interface VideoPlayerProps {
    isOpen: boolean;
    onClose: () => void;
    videoUrl?: string;
    title?: string;
    autoplay?: boolean;
}

const VideoPlayer = ({
    isOpen,
    onClose,
    videoUrl,
    title = "Tutorial Video",
    autoplay = false,
}: VideoPlayerProps) => {
    const { currentColors, currentPalette } = useTheme();
    const [isPlaying, setIsPlaying] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) {
            setIsPlaying(false);
            setCurrentTime(0);
            if (videoRef.current) {
                videoRef.current.pause();
                videoRef.current.currentTime = 0;
            }
        } else if (isOpen && autoplay && videoRef.current && videoUrl) {
            // Autoplay when modal opens
            setTimeout(() => {
                videoRef.current?.play();
                setIsPlaying(true);
            }, 300);
        }
    }, [isOpen, autoplay, videoUrl]);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value);
        if (videoRef.current) {
            videoRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}
            onClick={onClose}
        >
            <div
                ref={containerRef}
                className="relative w-full max-w-3xl rounded-xl overflow-hidden shadow-2xl"
                style={{ backgroundColor: currentColors.bg }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div
                    className="flex items-center justify-between p-4 border-b"
                    style={{ borderColor: currentColors.border }}
                >
                    <h3
                        className="text-lg font-semibold"
                        style={{ color: currentColors.text }}
                    >
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg transition-colors hover:bg-opacity-10 cursor-pointer"
                        style={{ color: currentColors.text }}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Video Container */}
                <div className="relative bg-black aspect-video">
                    {videoUrl ? (
                        <video
                            ref={videoRef}
                            className="w-full h-full"
                            onTimeUpdate={handleTimeUpdate}
                            onLoadedMetadata={handleLoadedMetadata}
                            onEnded={() => setIsPlaying(false)}
                        >
                            <source src={videoUrl} type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <Play className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                                <p className="text-gray-400">
                                    No video available yet
                                </p>
                                <p className="text-sm text-gray-500 mt-2">
                                    Tutorial video will be added soon
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Play/Pause Overlay */}
                    {videoUrl && !isPlaying && (
                        <div
                            className="absolute inset-0 flex items-center justify-center cursor-pointer"
                            onClick={togglePlay}
                        >
                            <div
                                className="p-6 rounded-full transition-all hover:scale-110"
                                style={{
                                    backgroundColor: `${currentPalette.primary}90`,
                                }}
                            >
                                <Play
                                    className="w-12 h-12 text-white"
                                    fill="white"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Controls */}
                {videoUrl && (
                    <div
                        className="p-4 border-t"
                        style={{ borderColor: currentColors.border }}
                    >
                        {/* Progress Bar */}
                        <div className="mb-3">
                            <input
                                type="range"
                                min="0"
                                max={duration || 0}
                                value={currentTime}
                                onChange={handleSeek}
                                className="w-full h-1 rounded-lg appearance-none cursor-pointer"
                                style={{
                                    background: `linear-gradient(to right, ${
                                        currentPalette.primary
                                    } 0%, ${currentPalette.primary} ${
                                        (currentTime / duration) * 100
                                    }%, ${currentColors.border} ${
                                        (currentTime / duration) * 100
                                    }%, ${currentColors.border} 100%)`,
                                }}
                            />
                            <div
                                className="flex justify-between text-xs mt-1"
                                style={{ color: currentColors.textSecondary }}
                            >
                                <span>{formatTime(currentTime)}</span>
                                <span>{formatTime(duration)}</span>
                            </div>
                        </div>

                        {/* Control Buttons */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={togglePlay}
                                    className="p-2 rounded-lg transition-colors cursor-pointer"
                                    style={{ color: currentColors.text }}
                                >
                                    {isPlaying ? (
                                        <Pause className="w-5 h-5" />
                                    ) : (
                                        <Play className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                            <button
                                onClick={toggleFullscreen}
                                className="p-2 rounded-lg transition-colors cursor-pointer"
                                style={{ color: currentColors.text }}
                            >
                                {isFullscreen ? (
                                    <Minimize className="w-5 h-5" />
                                ) : (
                                    <Maximize className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoPlayer;
