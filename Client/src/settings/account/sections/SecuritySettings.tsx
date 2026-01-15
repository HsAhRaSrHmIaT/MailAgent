import { useTheme } from "../../../contexts/ThemeContext";
import { useState, useEffect, useRef } from "react";
import CustomCheckbox from "../../../hooks/Checkbox";
import { IoChevronDownOutline } from "react-icons/io5";
import { Info } from "lucide-react";
import { apiService } from "../../../services/apiService";
import { toast } from "react-toastify";
import { useAuth } from "../../../contexts/AuthContext";

const SecuritySettings = () => {
    const { currentColors } = useTheme();
    const { user } = useAuth();
    const [aiLearning, setAiLearning] = useState(false);
    const [saveHistory, setSaveHistory] = useState(false);
    const [language, setLanguage] = useState("English");
    const [defaultTone, setDefaultTone] = useState("Professional");
    const [isLoading, setIsLoading] = useState(true);
    const hasLoadedRef = useRef(false);
    const [sessionInfo, setSessionInfo] = useState({
        os: "Unknown",
        browser: "Unknown",
        location: "Unknown",
    });

    useEffect(() => {
        // Only load once
        if (hasLoadedRef.current) return;
        hasLoadedRef.current = true;

        // Get browser info
        const getBrowser = () => {
            const ua = navigator.userAgent;
            if (ua.includes("Edg")) return "Edge";
            if (ua.includes("Chrome") && !ua.includes("Edg")) return "Chrome";
            if (ua.includes("Firefox")) return "Firefox";
            if (ua.includes("Safari") && !ua.includes("Chrome"))
                return "Safari";
            if (ua.includes("Opera") || ua.includes("OPR")) return "Opera";
            if (ua.includes("Brave")) return "Brave";
            return "Unknown";
        };

        // Get OS info
        const getOS = () => {
            const ua = navigator.userAgent;
            if (ua.includes("Win")) return "Windows";
            if (ua.includes("Mac")) return "macOS";
            if (ua.includes("Linux")) return "Linux";
            if (ua.includes("Android")) return "Android";
            if (ua.includes("iOS") || ua.includes("iPhone")) return "iOS";
            return "Unknown";
        };

        // Get location (using timezone as fallback)
        const getLocation = () => {
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            if (
                timezone.includes("Asia/Kolkata") ||
                timezone.includes("Asia/Calcutta")
            )
                return "India";
            if (timezone.includes("America/New_York")) return "United States";
            if (timezone.includes("Europe/London")) return "United Kingdom";
            if (timezone.includes("Asia/Tokyo")) return "Japan";
            return timezone.split("/")[1]?.replace("_", " ") || "Unknown";
        };

        setSessionInfo({
            os: getOS(),
            browser: getBrowser(),
            location: getLocation(),
        });

        const fetchSettings = async () => {
            try {
                const settings = await apiService.getPreferences();
                setLanguage(settings.language || "English");
                setDefaultTone(settings.default_tone || "Professional");
                setAiLearning(settings.ai_learning || false);
                setSaveHistory(settings.save_history || false);
            } catch (error) {
                console.error("Failed to fetch user settings:", error);
                toast.error(
                    error instanceof Error
                        ? error.message
                        : "Failed to fetch user settings",
                );
            } finally {
                setIsLoading(false);
            }
        };
        fetchSettings();
    }, []);

    // Auto-save preferences when they change
    useEffect(() => {
        // Skip auto-save during initial load
        if (isLoading) return;

        const savePreferences = async () => {
            try {
                await apiService.updatePreferences({
                    language,
                    default_tone: defaultTone,
                    ai_learning: aiLearning,
                    save_history: saveHistory,
                });
            } catch (error) {
                console.error("Failed to save preferences:", error);
                // Silent fail - don't show toast for auto-save errors
            }
        };

        // Debounce for 500ms
        const timeoutId = setTimeout(() => {
            savePreferences();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [language, defaultTone, aiLearning, saveHistory, isLoading]);

    const handleDeleteAllData = async () => {
        if (!user?.email) {
            toast.error("User email not found");
            return;
        }

        const confirmDelete = window.confirm(
            `⚠️ WARNING: This will permanently delete ALL your data including:\n\n` +
                `• All chat conversations\n` +
                `• All generated emails\n` +
                `• All activity logs\n\n` +
                `This action CANNOT be undone!\n\n` +
                `Click OK to receive a verification code via email.`,
        );

        if (!confirmDelete) {
            return; // User cancelled
        }

        try {
            // Step 1: Send verification code to user's email
            toast.info("Sending verification code to your email...");
            await apiService.sendDeleteVerificationCode();

            // Step 2: Ask user to enter the verification code
            const verificationCode = prompt(
                `A 6-digit verification code has been sent to ${user.email}\n\n` +
                    `Please enter the code to confirm deletion:`,
            );

            if (!verificationCode) {
                toast.info("Deletion cancelled");
                return;
            }

            // Step 3: Verify code and delete data
            await apiService.deleteAllUserData(verificationCode.trim());
            toast.success("All data deleted successfully");

            // Reload the page to refresh the UI
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } catch (error) {
            console.error("Failed to delete data:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to delete data",
            );
        }
    };

    return (
        <div className="space-y-6">
            <div>
                {/* Preferences */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Language Selection */}
                    <div>
                        <label
                            className="block text-sm font-medium mb-2"
                            style={{ color: currentColors.text }}
                        >
                            Language
                        </label>
                        <div className="relative">
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="w-full p-2.5 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 transition-all"
                                style={{
                                    backgroundColor: currentColors.surface,
                                    color: currentColors.text,
                                    border: `1px solid ${currentColors.border}`,
                                    paddingRight: "2.5rem",
                                }}
                            >
                                <option value="English">English</option>
                                <option value="Hindi">हिंदी (Hindi)</option>
                            </select>
                            <IoChevronDownOutline
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
                                style={{ color: currentColors.textSecondary }}
                            />
                        </div>
                        <p
                            className="text-xs mt-1"
                            style={{ color: currentColors.textSecondary }}
                        >
                            Chat conversations and voice responses
                        </p>
                    </div>

                    {/* Default Email Tone */}
                    <div>
                        <label
                            className="block text-sm font-medium mb-2"
                            style={{ color: currentColors.text }}
                        >
                            Default Email Tone
                        </label>
                        <div className="relative">
                            <select
                                value={defaultTone}
                                onChange={(e) => setDefaultTone(e.target.value)}
                                className="w-full p-2.5 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 transition-all"
                                style={{
                                    backgroundColor: currentColors.surface,
                                    color: currentColors.text,
                                    border: `1px solid ${currentColors.border}`,
                                    paddingRight: "2.5rem",
                                }}
                            >
                                <option value="Professional">
                                    Professional
                                </option>
                                <option value="Friendly">Friendly</option>
                                <option value="Casual">Casual</option>
                                <option value="Formal">Formal</option>
                                <option value="Confident">Confident</option>
                            </select>
                            <IoChevronDownOutline
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
                                style={{ color: currentColors.textSecondary }}
                            />
                        </div>
                        <p
                            className="text-xs mt-1"
                            style={{ color: currentColors.textSecondary }}
                        >
                            Your preferred tone for generated emails
                        </p>
                    </div>
                </div>
            </div>

            {/* Security & Privacy Section */}
            <div>
                {/* Active Sessions */}
                <div>
                    <h4
                        className="font-medium mb-3 text-sm"
                        style={{ color: currentColors.text }}
                    >
                        Active Sessions
                    </h4>
                    <div className="space-y-2">
                        <div
                            className="flex items-center justify-between p-3 rounded-lg border"
                            style={{
                                backgroundColor: currentColors.surface,
                                borderColor: currentColors.border,
                            }}
                        >
                            <div>
                                <div
                                    className="font-medium"
                                    style={{ color: currentColors.text }}
                                >
                                    Current Session
                                </div>
                                <div
                                    className="text-sm"
                                    style={{
                                        color: currentColors.textSecondary,
                                    }}
                                >
                                    {sessionInfo.os} • {sessionInfo.browser} •{" "}
                                    {sessionInfo.location}
                                </div>
                            </div>
                            <span
                                className="text-sm font-medium px-2 py-1 rounded-full"
                                style={{
                                    backgroundColor: "#10B98115",
                                    color: "#10B981",
                                }}
                            >
                                Active
                            </span>
                        </div>
                    </div>
                </div>

                {/* Data Privacy */}
                <div className="space-y-3">
                    <h4
                        className="font-medium text-sm mt-4"
                        style={{ color: currentColors.text }}
                    >
                        Data & Privacy
                    </h4>
                    <div>
                        <CustomCheckbox
                            checked={aiLearning}
                            onChange={() => setAiLearning(!aiLearning)}
                            label="Allow AI to learn from my email patterns"
                        />
                        <p
                            className="text-xs mt-1 ml-6"
                            style={{ color: currentColors.textSecondary }}
                        >
                            Helps improve email suggestions based on your
                            writing style
                        </p>
                    </div>
                    <div>
                        <div className="flex items-center gap-1">
                            <CustomCheckbox
                                checked={saveHistory}
                                onChange={() => setSaveHistory(!saveHistory)}
                                label="Save conversation history"
                            />
                            <div className="group relative inline-block">
                                <Info
                                    className="w-3.5 h-3.5 cursor-help"
                                    style={{
                                        color: currentColors.textSecondary,
                                    }}
                                />
                                <div
                                    className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2 text-xs rounded-lg shadow-lg z-10"
                                    style={{
                                        backgroundColor: currentColors.surface,
                                        color: currentColors.text,
                                        border: `1px solid ${currentColors.border}`,
                                    }}
                                >
                                    ⚠️ If disabled, all chat messages and email
                                    data will be automatically deleted within 24
                                    hours. Enable to keep your history for
                                    future reference.
                                    <div
                                        className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent"
                                        style={{
                                            borderTopColor:
                                                currentColors.surface,
                                        }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                        <p
                            className="text-xs mt-1 ml-6"
                            style={{ color: currentColors.textSecondary }}
                        >
                            Keep your conversations and emails for easy access
                        </p>
                    </div>
                    <button
                        className="text-sm hover:underline cursor-pointer mt-2 font-medium transition-colors"
                        style={{ color: "#EF4444" }}
                        onClick={handleDeleteAllData}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.color = "#DC2626";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.color = "#EF4444";
                        }}
                    >
                        Delete All My Data
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SecuritySettings;
