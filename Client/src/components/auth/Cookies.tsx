import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { HiXMark, HiShieldCheck, HiCog6Tooth } from "react-icons/hi2";

const Cookies = () => {
    const { currentColors, currentPalette } = useTheme();
    const [showBanner, setShowBanner] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [preferences, setPreferences] = useState({
        essential: true, // Always true, can't be disabled
        functional: true,
        analytics: true,
    });

    useEffect(() => {
        // Check if user has already made a choice
        const cookieConsent = localStorage.getItem("cookieConsent");
        if (!cookieConsent) {
            // Delay showing banner slightly for better UX
            setTimeout(() => setShowBanner(true), 1000);
        } else {
            // Load saved preferences
            try {
                const savedPreferences = JSON.parse(cookieConsent);
                setPreferences(savedPreferences);
            } catch (error) {
                console.error("Error loading cookie preferences:", error);
            }
        }
    }, []);

    const handleAcceptAll = () => {
        const allAccepted = {
            essential: true,
            functional: true,
            analytics: true,
        };
        localStorage.setItem("cookieConsent", JSON.stringify(allAccepted));
        setPreferences(allAccepted);
        setShowBanner(false);
        setShowSettings(false);
    };

    const handleAcceptSelected = () => {
        localStorage.setItem("cookieConsent", JSON.stringify(preferences));
        setShowBanner(false);
        setShowSettings(false);
    };

    const handleRejectAll = () => {
        const essentialOnly = {
            essential: true,
            functional: false,
            analytics: false,
        };
        localStorage.setItem("cookieConsent", JSON.stringify(essentialOnly));
        setPreferences(essentialOnly);
        setShowBanner(false);
        setShowSettings(false);
    };

    if (!showBanner) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-50 transition-opacity duration-300"
                style={{
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    backdropFilter: "blur(4px)",
                }}
                onClick={() => !showSettings && setShowBanner(false)}
            />

            {/* Cookie Banner */}
            <div
                className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 animate-slide-up"
                style={{
                    animation: "slideUp 0.4s ease-out",
                }}
            >
                <div className="max-w-6xl mx-auto">
                    <div
                        className="rounded-2xl shadow-2xl border backdrop-blur-md overflow-hidden"
                        style={{
                            backgroundColor: `${currentColors.bg}`,
                            borderColor: currentColors.border,
                        }}
                    >
                        {/* Main Banner Content */}
                        {!showSettings ? (
                            <div className="p-6 md:p-8">
                                <div className="flex items-start gap-4">
                                    {/* Icon */}
                                    <div
                                        className="flex-shrink-0 p-3 rounded-xl"
                                        style={{
                                            backgroundColor: `${currentPalette.primary}20`,
                                        }}
                                    >
                                        <HiShieldCheck
                                            size={32}
                                            style={{
                                                color: currentPalette.primary,
                                            }}
                                        />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <h3
                                            className="text-xl md:text-2xl font-bold mb-3"
                                            style={{
                                                color: currentColors.text,
                                            }}
                                        >
                                            We Value Your Privacy
                                        </h3>
                                        <p
                                            className="text-sm md:text-base leading-relaxed mb-4"
                                            style={{
                                                color: currentColors.textSecondary,
                                            }}
                                        >
                                            We use cookies to enhance your
                                            experience, analyze site usage, and
                                            assist in our marketing efforts. By
                                            clicking "Accept All", you consent
                                            to our use of cookies. You can
                                            customize your preferences or learn
                                            more about how we use cookies in our{" "}
                                            <Link
                                                to="/privacy-policy"
                                                className="underline hover:opacity-80 transition-opacity font-medium"
                                                style={{
                                                    color: currentPalette.primary,
                                                }}
                                            >
                                                Privacy Policy
                                            </Link>
                                            .
                                        </p>

                                        {/* Buttons */}
                                        <div className="flex flex-wrap gap-3">
                                            <button
                                                onClick={handleAcceptAll}
                                                className="px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg"
                                                style={{
                                                    backgroundColor:
                                                        currentPalette.primary,
                                                    color: "#FFFFFF",
                                                }}
                                            >
                                                Accept All
                                            </button>
                                            <button
                                                onClick={handleRejectAll}
                                                className="px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105"
                                                style={{
                                                    backgroundColor: `${currentColors.border}60`,
                                                    color: currentColors.text,
                                                }}
                                            >
                                                Reject All
                                            </button>
                                            <button
                                                onClick={() =>
                                                    setShowSettings(true)
                                                }
                                                className="px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 flex items-center gap-2"
                                                style={{
                                                    backgroundColor:
                                                        "transparent",
                                                    color: currentColors.textSecondary,
                                                    border: `1px solid ${currentColors.border}`,
                                                }}
                                            >
                                                <HiCog6Tooth size={20} />
                                                Customize
                                            </button>
                                        </div>
                                    </div>

                                    {/* Close Button */}
                                    <button
                                        onClick={() => setShowBanner(false)}
                                        className="flex-shrink-0 p-2 rounded-lg transition-all duration-200 hover:scale-110"
                                        style={{
                                            backgroundColor: `${currentColors.border}40`,
                                            color: currentColors.textSecondary,
                                        }}
                                    >
                                        <HiXMark size={20} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* Settings Panel */
                            <div className="p-6 md:p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <h3
                                        className="text-xl md:text-2xl font-bold"
                                        style={{ color: currentColors.text }}
                                    >
                                        Cookie Preferences
                                    </h3>
                                    <button
                                        onClick={() => setShowSettings(false)}
                                        className="p-2 rounded-lg transition-all duration-200 hover:scale-110"
                                        style={{
                                            backgroundColor: `${currentColors.border}40`,
                                            color: currentColors.textSecondary,
                                        }}
                                    >
                                        <HiXMark size={20} />
                                    </button>
                                </div>

                                <div className="space-y-4 mb-6">
                                    {/* Essential Cookies */}
                                    <div
                                        className="p-4 rounded-lg border"
                                        style={{
                                            backgroundColor: `${currentColors.border}20`,
                                            borderColor: currentColors.border,
                                        }}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <h4
                                                    className="font-semibold mb-1"
                                                    style={{
                                                        color: currentColors.text,
                                                    }}
                                                >
                                                    Essential Cookies
                                                </h4>
                                                <p
                                                    className="text-sm"
                                                    style={{
                                                        color: currentColors.textSecondary,
                                                    }}
                                                >
                                                    Required for the website to
                                                    function properly. These
                                                    cookies enable core
                                                    functionality such as
                                                    security, authentication,
                                                    and session management.
                                                </p>
                                            </div>
                                            <div
                                                className="flex-shrink-0 px-3 py-1 rounded-full text-sm font-medium"
                                                style={{
                                                    backgroundColor: `${currentPalette.primary}20`,
                                                    color: currentPalette.primary,
                                                }}
                                            >
                                                Always Active
                                            </div>
                                        </div>
                                    </div>

                                    {/* Functional Cookies */}
                                    <div
                                        className="p-4 rounded-lg border"
                                        style={{
                                            backgroundColor: `${currentColors.border}20`,
                                            borderColor: currentColors.border,
                                        }}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <h4
                                                    className="font-semibold mb-1"
                                                    style={{
                                                        color: currentColors.text,
                                                    }}
                                                >
                                                    Functional Cookies
                                                </h4>
                                                <p
                                                    className="text-sm"
                                                    style={{
                                                        color: currentColors.textSecondary,
                                                    }}
                                                >
                                                    Enable enhanced
                                                    functionality and
                                                    personalization, such as
                                                    remembering your
                                                    preferences, theme settings,
                                                    and language choices.
                                                </p>
                                            </div>
                                            <label className="flex-shrink-0 relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        preferences.functional
                                                    }
                                                    onChange={(e) =>
                                                        setPreferences({
                                                            ...preferences,
                                                            functional:
                                                                e.target
                                                                    .checked,
                                                        })
                                                    }
                                                    className="sr-only peer"
                                                />
                                                <div
                                                    className="w-11 h-6 rounded-full peer transition-all duration-200 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                                                    style={{
                                                        backgroundColor:
                                                            preferences.functional
                                                                ? currentPalette.primary
                                                                : `${currentColors.border}80`,
                                                    }}
                                                />
                                            </label>
                                        </div>
                                    </div>

                                    {/* Analytics Cookies */}
                                    <div
                                        className="p-4 rounded-lg border"
                                        style={{
                                            backgroundColor: `${currentColors.border}20`,
                                            borderColor: currentColors.border,
                                        }}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <h4
                                                    className="font-semibold mb-1"
                                                    style={{
                                                        color: currentColors.text,
                                                    }}
                                                >
                                                    Analytics Cookies
                                                </h4>
                                                <p
                                                    className="text-sm"
                                                    style={{
                                                        color: currentColors.textSecondary,
                                                    }}
                                                >
                                                    Help us understand how
                                                    visitors interact with our
                                                    website by collecting and
                                                    reporting information
                                                    anonymously to improve our
                                                    service.
                                                </p>
                                            </div>
                                            <label className="flex-shrink-0 relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        preferences.analytics
                                                    }
                                                    onChange={(e) =>
                                                        setPreferences({
                                                            ...preferences,
                                                            analytics:
                                                                e.target
                                                                    .checked,
                                                        })
                                                    }
                                                    className="sr-only peer"
                                                />
                                                <div
                                                    className="w-11 h-6 rounded-full peer transition-all duration-200 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                                                    style={{
                                                        backgroundColor:
                                                            preferences.analytics
                                                                ? currentPalette.primary
                                                                : `${currentColors.border}80`,
                                                    }}
                                                />
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {/* Settings Buttons */}
                                <div className="flex flex-wrap gap-3">
                                    <button
                                        onClick={handleAcceptSelected}
                                        className="px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg"
                                        style={{
                                            backgroundColor:
                                                currentPalette.primary,
                                            color: "#FFFFFF",
                                        }}
                                    >
                                        Save Preferences
                                    </button>
                                    <button
                                        onClick={handleAcceptAll}
                                        className="px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105"
                                        style={{
                                            backgroundColor: `${currentColors.border}60`,
                                            color: currentColors.text,
                                        }}
                                    >
                                        Accept All
                                    </button>
                                    <button
                                        onClick={() => setShowSettings(false)}
                                        className="px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105"
                                        style={{
                                            backgroundColor: "transparent",
                                            color: currentColors.textSecondary,
                                            border: `1px solid ${currentColors.border}`,
                                        }}
                                    >
                                        Back
                                    </button>
                                </div>

                                <p
                                    className="text-xs mt-4"
                                    style={{
                                        color: currentColors.textSecondary,
                                    }}
                                >
                                    For more information, please read our{" "}
                                    <Link
                                        to="/privacy-policy"
                                        className="underline hover:opacity-80"
                                        style={{
                                            color: currentPalette.primary,
                                        }}
                                    >
                                        Privacy Policy
                                    </Link>{" "}
                                    and{" "}
                                    <Link
                                        to="/terms-and-conditions"
                                        className="underline hover:opacity-80"
                                        style={{
                                            color: currentPalette.primary,
                                        }}
                                    >
                                        Terms and Conditions
                                    </Link>
                                    .
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Animation Styles */}
            <style>{`
                @keyframes slideUp {
                    from {
                        transform: translateY(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
            `}</style>
        </>
    );
};

export default Cookies;
