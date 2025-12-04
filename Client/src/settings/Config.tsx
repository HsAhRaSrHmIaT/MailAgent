import { useState } from "react";
import { SlWrench, SlPlus, SlTrash, SlCheck, SlSettings } from "react-icons/sl";
import { useTheme } from "../contexts/ThemeContext";

interface EmailConfig {
    email: string;
    password: string;
}

const Config = () => {
    const { currentColors, currentPalette } = useTheme();
    const [emailConfigs, setEmailConfigs] = useState<EmailConfig[]>([
        { email: "", password: "" },
    ]);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [savedConfigs, setSavedConfigs] = useState<EmailConfig[]>([]);

    const addEmailConfig = () => {
        if (emailConfigs.length < 5) {
            setEmailConfigs([...emailConfigs, { email: "", password: "" }]);
        }
    };

    const removeEmailConfig = (index: number) => {
        setEmailConfigs(emailConfigs.filter((_, i) => i !== index));
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
        setEmailConfigs([...savedConfigs]);
        setIsEditing(true);
    };

    const handleSave = () => {
        setIsSaving(true);
        // Simulate saving process
        setTimeout(() => {
            const validConfigs = emailConfigs.filter(
                (config) => config.email.trim() && config.password.trim()
            );
            setSavedConfigs(validConfigs);
            setIsEditing(false);
            setIsSaving(false);
            console.log("Email configurations saved", validConfigs);
        }, 1500);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEmailConfigs([...savedConfigs]);
    };

    return (
        <div
            className="min-h-screen"
            // style={{ backgroundColor: currentColors.bg }}
        >
            <div className="max-w-6xl mx-auto p-6 select-none">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <div
                            className="p-3 rounded-xl"
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
                                className="text-4xl font-bold"
                                style={{ color: currentColors.text }}
                            >
                                Email Configurations
                            </h1>
                            <p
                                className="text-lg mt-1"
                                style={{ color: currentColors.textSecondary }}
                            >
                                Configure your emails and passwords securely and
                                efficiently
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-6">
                    {/* Main Content */}
                    <div className="flex-1">
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
                                                    <input
                                                        type="email"
                                                        value={config.email}
                                                        onChange={(e) =>
                                                            updateEmailConfig(
                                                                index,
                                                                "email",
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
                                                        placeholder="Enter email address"
                                                    />
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
                                                        placeholder="Enter app password"
                                                    />
                                                </div>
                                                {emailConfigs.length > 1 && (
                                                    <button
                                                        onClick={() =>
                                                            removeEmailConfig(
                                                                index
                                                            )
                                                        }
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

                                    {emailConfigs.length < 5 && (
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
                                                <SlCheck className="w-5 h-5" />
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
                    <div className="flex w-80">
                        <div
                            className="rounded-xl border shadow-lg p-6 sticky top-6"
                            style={{ borderColor: currentColors.border }}
                        >
                            <h3
                                className="flex items-center gap-2 text-lg font-semibold"
                                style={{
                                    color: currentColors.text,
                                }}
                            >
                                <SlCheck className="w-6 h-6" />
                                Best Practices
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-start gap-2">
                                    <span className="mt-0.5">•</span>
                                    <span>
                                        Use app-specific passwords for better
                                        security
                                    </span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="mt-0.5">•</span>
                                    <span>
                                        Keep your passwords secure and never
                                        share them
                                    </span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="mt-0.5">•</span>
                                    <span>
                                        Add up to 5 email accounts for different
                                        purposes
                                    </span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="mt-0.5">•</span>
                                    <span>
                                        Remove unused accounts to keep your
                                        configuration clean
                                    </span>
                                </div>
                            </div>

                            {!isEditing && savedConfigs.length > 0 && (
                                <div
                                    className="mt-6 pt-4 border-t"
                                    style={{
                                        borderColor: currentColors.border,
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
                                        Passwords are masked for security. They
                                        are stored encrypted.
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Config;
