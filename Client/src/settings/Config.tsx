import { useState } from "react";
import { SlWrench, SlPlus, SlTrash, SlSettings } from "react-icons/sl";
import { Lightbulb, Save, Maximize2 } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import VideoPlayer from "../components/VideoPlayer";

interface EmailConfig {
    email: string;
    password: string;
}

const Config = () => {
    const { currentColors, currentPalette } = useTheme();
    const MAX_EMAILS = 4;
    const DEFAULT_EMAIL = "default@example.com";

    const [emailConfigs, setEmailConfigs] = useState<EmailConfig[]>([
        { email: DEFAULT_EMAIL, password: "" },
    ]);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [savedConfigs, setSavedConfigs] = useState<EmailConfig[]>([
        { email: DEFAULT_EMAIL, password: "" },
    ]);
    const [isVideoOpen, setIsVideoOpen] = useState(false);

    const addEmailConfig = () => {
        if (emailConfigs.length < MAX_EMAILS) {
            setEmailConfigs([...emailConfigs, { email: "", password: "" }]);
        } else {
            // UX feedback
            alert(`You can only add up to ${MAX_EMAILS} email accounts.`);
        }
    };

    const removeEmailConfig = (index: number) => {
        setEmailConfigs(emailConfigs.filter((_, i) => i !== index));
    };

    const removeSavedConfig = (index: number) => {
        const toRemove = savedConfigs[index];
        if (!toRemove) return;
        if (toRemove.email === DEFAULT_EMAIL) {
            alert("Default email cannot be removed.");
            return;
        }
        if (!window.confirm(`Remove ${toRemove.email}?`)) return;
        const newSaved = savedConfigs.filter((_, i) => i !== index);
        setSavedConfigs(newSaved);
    };

    const updateEmailConfig = (
        index: number,
        field: keyof EmailConfig,
        value: string
    ) => {
        const updatedConfigs = emailConfigs.map((config, i) =>
            i === index ? { ...config, [field]: value } : config
        );
        setEmailConfigs(updatedConfigs);
    };

    const startEditing = () => {
        const defaultEntry = savedConfigs.find(
            (c) => c.email === DEFAULT_EMAIL
        );
        const others = savedConfigs.filter((c) => c.email !== DEFAULT_EMAIL);
        setEmailConfigs([
            { email: DEFAULT_EMAIL, password: defaultEntry?.password || "" },
            ...others,
        ]);
        setIsEditing(true);
    };

    const handleSave = () => {
        setIsSaving(true);
        // Simulate saving process
        setTimeout(() => {
            // ensure default is present and limit total configs
            const filtered = emailConfigs
                .filter((config) => config.email.trim())
                .slice(0, MAX_EMAILS);
            const hasDefault = filtered.some((c) => c.email === DEFAULT_EMAIL);
            let finalConfigs = filtered;
            if (!hasDefault) {
                // ensure default exists as first entry
                finalConfigs = [
                    { email: DEFAULT_EMAIL, password: "" },
                    ...filtered.slice(0, MAX_EMAILS - 1),
                ];
            }
            setSavedConfigs(finalConfigs);
            setIsEditing(false);
            setIsSaving(false);
            console.log("Email configurations saved", finalConfigs);
        }, 1500);
    };

    const handleCancel = () => {
        const defaultEntry = savedConfigs.find(
            (c) => c.email === DEFAULT_EMAIL
        );
        const others = savedConfigs.filter((c) => c.email !== DEFAULT_EMAIL);
        setEmailConfigs([
            { email: DEFAULT_EMAIL, password: defaultEntry?.password || "" },
            ...others,
        ]);
        setIsEditing(false);
    };

    return (
        <div
        // style={{ backgroundColor: currentColors.bg }}
        >
            <div className="max-w-6xl mx-auto select-none">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <div
                            className="p-2 sm:p-3 rounded-xl"
                            style={{
                                backgroundColor: `${currentPalette.primary}20`,
                            }}
                        >
                            <span
                                className="text-md font-mono font-bold"
                                style={{ color: currentPalette.primary }}
                            >
                                <SlWrench size={24} />
                            </span>
                        </div>
                        <div>
                            <h1
                                className="text-2xl sm:text-4xl font-bold"
                                style={{ color: currentColors.text }}
                            >
                                Email Configurations
                            </h1>
                            <p
                                className="text-base sm:text-lg mt-1"
                                style={{ color: currentColors.textSecondary }}
                            >
                                Configure your emails and passwords securely and
                                efficiently
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-6">
                    {/* Main Content */}
                    <div className="flex-2">
                        {isEditing ? (
                            <div
                                className="rounded-xl border shadow-lg"
                                style={{
                                    borderColor: currentColors.border,
                                    minHeight: "500px",
                                }}
                            >
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2
                                            className="text-xl font-semibold"
                                            style={{
                                                color: currentColors.text,
                                            }}
                                        >
                                            Edit Email Configurations
                                        </h2>
                                    </div>

                                    <div className="space-y-4">
                                        {emailConfigs.map((config, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center gap-4 p-4 rounded-lg border"
                                                style={{
                                                    backgroundColor:
                                                        currentColors.bg,
                                                    borderColor:
                                                        currentColors.border,
                                                }}
                                            >
                                                <div className="flex-1">
                                                    <label
                                                        className="block text-sm font-medium mb-1"
                                                        style={{
                                                            color: currentColors.text,
                                                        }}
                                                    >
                                                        Email Address
                                                    </label>
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="email"
                                                            value={config.email}
                                                            onChange={(e) =>
                                                                updateEmailConfig(
                                                                    index,
                                                                    "email",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            disabled={
                                                                index === 0
                                                            }
                                                            className={`w-full p-2 border rounded-lg ${
                                                                index === 0
                                                                    ? "opacity-60 cursor-not-allowed"
                                                                    : ""
                                                            }`}
                                                            style={{
                                                                backgroundColor:
                                                                    currentColors.surface,
                                                                borderColor:
                                                                    currentColors.border,
                                                                color: currentColors.text,
                                                            }}
                                                            placeholder={
                                                                index === 0
                                                                    ? "Default email (not editable)"
                                                                    : "Enter email address"
                                                            }
                                                        />
                                                        {index === 0 && (
                                                            <span
                                                                className="text-xs px-2 py-0.5 rounded"
                                                                style={{
                                                                    backgroundColor: `${currentPalette.primary}20`,
                                                                    color: currentPalette.primary,
                                                                }}
                                                            >
                                                                Primary
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <label
                                                        className="block text-sm font-medium mb-1"
                                                        style={{
                                                            color: currentColors.text,
                                                        }}
                                                    >
                                                        App Password
                                                    </label>
                                                    <input
                                                        type="password"
                                                        value={config.password}
                                                        onChange={(e) =>
                                                            updateEmailConfig(
                                                                index,
                                                                "password",
                                                                e.target.value
                                                            )
                                                        }
                                                        className="w-full p-2 border rounded-lg"
                                                        style={{
                                                            backgroundColor:
                                                                currentColors.surface,
                                                            borderColor:
                                                                currentColors.border,
                                                            color: currentColors.text,
                                                        }}
                                                        placeholder={
                                                            index === 0
                                                                ? "Add or update app password"
                                                                : "Enter app password"
                                                        }
                                                    />
                                                </div>
                                                {index !== 0 && (
                                                    <button
                                                        onClick={() => {
                                                            if (
                                                                !window.confirm(
                                                                    "Remove this email configuration?"
                                                                )
                                                            )
                                                                return;
                                                            removeEmailConfig(
                                                                index
                                                            );
                                                        }}
                                                        className="p-2 rounded-lg transition-colors"
                                                        style={{
                                                            color: "#ef4444",
                                                            backgroundColor:
                                                                "transparent",
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.backgroundColor =
                                                                "#fee2e2";
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.backgroundColor =
                                                                "transparent";
                                                        }}
                                                    >
                                                        <SlTrash size={20} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {emailConfigs.length < MAX_EMAILS ? (
                                        <div>
                                            <button
                                                onClick={addEmailConfig}
                                                className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
                                                style={{
                                                    backgroundColor:
                                                        currentPalette.primary,
                                                    color: "white",
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor = `${currentPalette.primary}cc`;
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor =
                                                        currentPalette.primary;
                                                }}
                                            >
                                                <SlPlus size={16} />
                                                Add Email Account
                                            </button>
                                            <div
                                                className="mt-2 text-sm"
                                                style={{
                                                    color: currentColors.textSecondary,
                                                }}
                                            >
                                                Slots remaining:{" "}
                                                {MAX_EMAILS -
                                                    emailConfigs.length}
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            className="mt-4 text-sm"
                                            style={{
                                                color: currentColors.textSecondary,
                                            }}
                                        >
                                            Maximum of {MAX_EMAILS} accounts
                                            reached.
                                        </div>
                                    )}

                                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-slate-700">
                                        <button
                                            onClick={handleCancel}
                                            className="px-6 py-3 border rounded-sm transition-colors cursor-pointer"
                                            style={{
                                                borderColor:
                                                    currentColors.border,
                                                color: currentColors.text,
                                                backgroundColor:
                                                    currentColors.surface,
                                            }}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            className="inline-flex items-center gap-2 px-8 py-3 text-white font-medium rounded-sm transition-colors shadow-lg cursor-pointer"
                                            style={{
                                                backgroundColor:
                                                    currentPalette.primary,
                                            }}
                                        >
                                            {isSaving ? (
                                                <span className="animate-spin">
                                                    <div className="w-5 h-5 border-2 border-white-500 border-t-transparent rounded-full animate-spin"></div>
                                                </span>
                                            ) : (
                                                <Save className="w-5 h-5" />
                                            )}
                                            <span>
                                                {isSaving
                                                    ? "Saving..."
                                                    : "Save Configurations"}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div
                                className="rounded-xl border shadow-lg"
                                style={{ borderColor: currentColors.border }}
                            >
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2
                                            className="text-xl font-semibold"
                                            style={{
                                                color: currentColors.text,
                                            }}
                                        >
                                            Saved Email Configurations (
                                            {savedConfigs.length})
                                        </h2>
                                    </div>

                                    <div className="space-y-3">
                                        {savedConfigs.length > 0 ? (
                                            savedConfigs.map(
                                                (config, index) => (
                                                    <div
                                                        key={index}
                                                        className="rounded-lg border p-4 transition-colors"
                                                        style={{
                                                            borderColor:
                                                                currentColors.border,
                                                            backgroundColor:
                                                                currentColors.surface,
                                                        }}
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className="flex-1">
                                                                <div
                                                                    className="text-sm font-medium mb-1"
                                                                    style={{
                                                                        color: currentColors.textSecondary,
                                                                    }}
                                                                >
                                                                    Email
                                                                    Address
                                                                </div>
                                                                <div
                                                                    className="px-3 py-2 rounded border font-mono"
                                                                    style={{
                                                                        backgroundColor:
                                                                            currentColors.bg,
                                                                        borderColor:
                                                                            currentColors.border,
                                                                        color: currentColors.text,
                                                                    }}
                                                                >
                                                                    {
                                                                        config.email
                                                                    }
                                                                </div>
                                                            </div>
                                                            <div className="flex-1">
                                                                <div
                                                                    className="text-sm font-medium mb-1"
                                                                    style={{
                                                                        color: currentColors.textSecondary,
                                                                    }}
                                                                >
                                                                    App Password
                                                                </div>
                                                                <div
                                                                    className="px-3 py-2 rounded border font-mono"
                                                                    style={{
                                                                        backgroundColor:
                                                                            currentColors.bg,
                                                                        borderColor:
                                                                            currentColors.border,
                                                                        color: currentColors.text,
                                                                    }}
                                                                >
                                                                    {"•".repeat(
                                                                        Math.min(
                                                                            config
                                                                                .password
                                                                                .length,
                                                                            20
                                                                        )
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                {config.email !==
                                                                    DEFAULT_EMAIL && (
                                                                    <button
                                                                        onClick={() =>
                                                                            removeSavedConfig(
                                                                                index
                                                                            )
                                                                        }
                                                                        className="p-2 rounded-lg"
                                                                        style={{
                                                                            color: "#ef4444",
                                                                        }}
                                                                    >
                                                                        <SlTrash
                                                                            size={
                                                                                18
                                                                            }
                                                                        />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            )
                                        ) : (
                                            <div
                                                className="text-center py-12"
                                                style={{
                                                    color: currentColors.textSecondary,
                                                }}
                                            >
                                                No email configurations saved
                                                yet. Click "Edit Configurations"
                                                to add your first email account.
                                            </div>
                                        )}
                                    </div>
                                    <div
                                        className="flex justify-end gap-3 pt-6 border-t mt-6"
                                        style={{
                                            borderColor: currentColors.border,
                                        }}
                                    >
                                        <button
                                            onClick={startEditing}
                                            className="inline-flex items-center gap-2 px-6 py-3 text-white font-medium rounded-sm transition-colors cursor-pointer"
                                            style={{
                                                backgroundColor:
                                                    currentPalette.primary,
                                            }}
                                        >
                                            <SlSettings className="w-4 h-4" />
                                            Edit Configurations
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Info Section */}
                    <div className="flex-1">
                        <div
                            className="rounded-xl border shadow-lg p-6 sticky top-6"
                            style={{ borderColor: currentColors.border }}
                        >
                            <h3
                                className="flex items-center gap-2 text-lg font-semibold mb-4"
                                style={{
                                    color: currentColors.text,
                                }}
                            >
                                <Lightbulb className="w-6 h-6" />
                                {isEditing
                                    ? "Editing Guidelines"
                                    : "Information"}
                            </h3>

                            {isEditing ? (
                                <div className="space-y-3">
                                    <div className="flex items-start gap-2">
                                        <span className="mt-0.5">•</span>
                                        <span>
                                            The default email is{" "}
                                            <strong>read-only</strong> and
                                            cannot be changed
                                        </span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <span className="mt-0.5">•</span>
                                        <span>
                                            You can add up to {MAX_EMAILS} email
                                            accounts total
                                        </span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <span className="mt-0.5">•</span>
                                        <span>
                                            Use app-specific passwords for
                                            better security
                                        </span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <span className="mt-0.5">•</span>
                                        <span>
                                            Keep your passwords secure and never
                                            share them
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-2">
                                            <span className="mt-0.5">•</span>
                                            <span>
                                                Add up to 4 email accounts for
                                                sending emails
                                            </span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <span className="mt-0.5">•</span>
                                            <span>
                                                Remove unused accounts to keep
                                                your configuration clean
                                            </span>
                                        </div>

                                        <div className="mt-6">
                                            <h4
                                                className="text-sm font-medium mb-3"
                                                style={{
                                                    color: currentColors.text,
                                                }}
                                            >
                                                How to retrieve app passwords
                                            </h4>
                                            <div
                                                className="relative rounded-lg overflow-hidden border-2"
                                                style={{
                                                    borderColor:
                                                        currentPalette.primary,
                                                }}
                                            >
                                                {/* Video Preview */}
                                                <video
                                                    autoPlay
                                                    loop
                                                    muted
                                                    playsInline
                                                    className="w-full aspect-video bg-black"
                                                >
                                                    <source
                                                        src="https://res.cloudinary.com/do3nqivrl/video/upload/v1734735688/How_to_retrieve_app_passwords_-_Made_with_Clipchamp_unjdoi.mp4"
                                                        type="video/mp4"
                                                    />
                                                </video>

                                                {/* Expand Button Overlay */}
                                                <button
                                                    onClick={() =>
                                                        setIsVideoOpen(true)
                                                    }
                                                    className="absolute top-2 right-2 p-2 rounded-lg backdrop-blur-sm transition-all hover:scale-110 cursor-pointer"
                                                    style={{
                                                        backgroundColor: `${currentPalette.primary}dd`,
                                                    }}
                                                    title="Open in full player"
                                                >
                                                    <Maximize2 className="w-5 h-5 text-white" />
                                                </button>

                                                {/* Info Overlay */}
                                                <div
                                                    className="absolute bottom-0 left-0 right-0 p-3 backdrop-blur-sm"
                                                    style={{
                                                        backgroundColor:
                                                            "rgba(0, 0, 0, 0.6)",
                                                    }}
                                                >
                                                    <p className="text-white text-sm font-medium">
                                                        Click expand to watch
                                                        with controls
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <VideoPlayer
                                        isOpen={isVideoOpen}
                                        onClose={() => setIsVideoOpen(false)}
                                        videoUrl="https://res.cloudinary.com/do3nqivrl/video/upload/v1734735688/How_to_retrieve_app_passwords_-_Made_with_Clipchamp_unjdoi.mp4"
                                        title="How to Retrieve App Passwords"
                                        autoplay={true}
                                    />

                                    {savedConfigs.length > 0 && (
                                        <div
                                            className="mt-6 pt-4 border-t"
                                            style={{
                                                borderColor:
                                                    currentColors.border,
                                            }}
                                        >
                                            <div
                                                className="text-sm"
                                                style={{
                                                    color: currentColors.textSecondary,
                                                }}
                                            >
                                                <strong className="font-medium">
                                                    Security:
                                                </strong>{" "}
                                                Passwords are masked for
                                                security. They are stored
                                                encrypted.
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Config;
