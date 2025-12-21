import { useState, useEffect } from "react";
import type { Variable } from "../types";
import { useTheme } from "../contexts/ThemeContext";
import { apiService } from "../services/apiService";
import { toast } from "react-toastify";

import { Save, Edit2, Eye, EyeOff, Lightbulb } from "lucide-react";

const Variables = () => {
    const { currentPalette, currentColors } = useTheme();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showValues, setShowValues] = useState<{ [key: number]: boolean }>(
        {}
    );

    const [savedVariables, setSavedVariables] = useState<Variable[]>([]);
    const [editingVariables, setEditingVariables] = useState<Variable[]>([]);

    // Predefined keys that users can configure
    const PREDEFINED_KEYS = [
        {
            key: "GOOGLE_API_KEY",
            placeholder: "your Google Gemini API key",
        },
        { key: "MURF_API_KEY", placeholder: "your Murf TTS API key" },
        {
            key: "DEEPGRAM_API_KEY",
            placeholder: "your Deepgram STT API key",
        },
    ];

    // Fetch variables on component mount
    useEffect(() => {
        const loadVariables = async () => {
            await fetchVariables();
        };
        loadVariables();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchVariables = async () => {
        try {
            setIsLoading(true);
            toast.dismiss();
            const response = await apiService.getEnvironmentVariables();

            // Map response to Variable type
            const variables: Variable[] = response.map(
                (item: { key: string; value: string }) => ({
                    key: item.key,
                    value: item.value,
                })
            );

            // Add missing predefined keys
            const existingKeys = variables.map((v) => v.key);
            PREDEFINED_KEYS.forEach((predefinedKey) => {
                if (!existingKeys.includes(predefinedKey.key)) {
                    variables.push({ key: predefinedKey.key, value: "" });
                }
            });

            setSavedVariables(variables);
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : "Failed to load environment variables";
            console.error("Failed to fetch environment variables:", err);
            toast.error(errorMessage);
            // Set default predefined keys on error
            setSavedVariables(
                PREDEFINED_KEYS.map((predefinedKey) => ({
                    key: predefinedKey.key,
                    value: "",
                }))
            );
        } finally {
            setIsLoading(false);
        }
    };

    const startEditing = () => {
        setEditingVariables([...savedVariables]);
        setIsEditing(true);
    };

    const updateVariable = (
        index: number,
        field: keyof Variable,
        value: string
    ): void => {
        const updated = editingVariables.map((variable, i) =>
            i === index ? { ...variable, [field]: value } : variable
        );
        setEditingVariables(updated);
    };

    const handleSave = async () => {
        setIsSaving(true);
        toast.dismiss();

        try {
            // Save only variables with non-empty values
            const variablesToSave = editingVariables.filter(
                (v) => v.key.trim() && v.value.trim()
            );

            // Save each variable
            const savePromises = variablesToSave.map((variable) =>
                apiService.saveEnvironmentVariable(variable.key, variable.value)
            );

            await Promise.all(savePromises);

            // Refresh the list from server
            await fetchVariables();

            setIsEditing(false);
            console.log("Environment variables saved successfully");
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : "Failed to save environment variables";
            console.error("Failed to save environment variables:", err);
            toast.error(errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditingVariables([]);
        toast.dismiss();
    };

    const toggleValueVisibility = (index: number) => {
        setShowValues((prev) => ({
            ...prev,
            [index]: !prev[index],
        }));
    };

    const maskValue = (value: string) => {
        if (!value) return "Not set";
        if (value.length <= 8) return "•".repeat(value.length);
        return (
            "•".repeat(Math.max(4, value.length - 16)) +
            value.substring(value.length - 4)
        );
    };

    return (
        <div>
            <div className="max-w-6xl mx-auto select-none">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <div
                            className="p-2 sm:p-3 px-2 sm:px-2.5 rounded-xl"
                            style={{
                                backgroundColor: `${currentPalette.primary}20`,
                            }}
                        >
                            <span
                                className="text-sm font-mono font-bold"
                                style={{ color: currentColors.text }}
                            >
                                .env
                            </span>
                        </div>
                        <div>
                            <h1
                                className="text-2xl sm:text-4xl font-bold"
                                style={{ color: currentColors.text }}
                            >
                                Environment Variables
                            </h1>
                            <p
                                className="text-base sm:text-lg mt-1"
                                style={{ color: currentColors.textSecondary }}
                            >
                                Configure your application's environment
                                variables securely and efficiently
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-6">
                    {/* Loading State */}
                    {isLoading && !isEditing ? (
                        <div className="flex-2">
                            <div
                                className="rounded-xl border shadow-lg p-12 text-center"
                                style={{ borderColor: currentColors.border }}
                            >
                                <div
                                    className="w-12 h-12 border-4 rounded-full animate-spin mx-auto mb-4"
                                    style={{
                                        borderColor: currentPalette.primary,
                                        borderTopColor: `${currentPalette.primary}20`,
                                    }}
                                ></div>
                                <p
                                    style={{
                                        color: currentColors.textSecondary,
                                    }}
                                >
                                    Loading environment variables...
                                </p>
                            </div>
                        </div>
                    ) : (
                        /* Main Content */
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
                                                Edit Environment Variables
                                            </h2>
                                        </div>

                                        {/* Variables List */}
                                        <div className="space-y-3 mb-6">
                                            {editingVariables.map(
                                                (variable, index) => (
                                                    <div
                                                        key={index}
                                                        className="p-4 transition-colors rounded-lg border"
                                                        style={{
                                                            borderColor:
                                                                currentColors.border,
                                                            backgroundColor:
                                                                currentColors.surface,
                                                        }}
                                                    >
                                                        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                                                            <div className="flex-1">
                                                                <div
                                                                    className="text-sm font-medium mb-2"
                                                                    style={{
                                                                        color: currentColors.textSecondary,
                                                                    }}
                                                                >
                                                                    Key
                                                                    (Read-only)
                                                                </div>
                                                                <div
                                                                    className="w-full font-mono text-sm px-3 py-2.5 rounded-lg border"
                                                                    style={{
                                                                        backgroundColor:
                                                                            currentColors.surface,
                                                                        borderColor:
                                                                            currentColors.border,
                                                                        color: currentColors.text,
                                                                    }}
                                                                >
                                                                    {
                                                                        variable.key
                                                                    }
                                                                </div>
                                                            </div>
                                                            <div className="flex-1">
                                                                <div
                                                                    className="text-sm font-medium mb-2"
                                                                    style={{
                                                                        color: currentColors.textSecondary,
                                                                    }}
                                                                >
                                                                    Value
                                                                </div>
                                                                <input
                                                                    type="text"
                                                                    value={
                                                                        variable.value
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        updateVariable(
                                                                            index,
                                                                            "value",
                                                                            e
                                                                                .target
                                                                                .value
                                                                        )
                                                                    }
                                                                    placeholder={
                                                                        PREDEFINED_KEYS.find(
                                                                            (
                                                                                k
                                                                            ) =>
                                                                                k.key ===
                                                                                variable.key
                                                                        )
                                                                            ?.placeholder ||
                                                                        "Enter your API key"
                                                                    }
                                                                    className="w-full font-mono text-sm px-3 py-2.5 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                                                                    style={{
                                                                        backgroundColor:
                                                                            currentColors.bg,
                                                                        borderColor:
                                                                            currentColors.border,
                                                                        color: currentColors.text,
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            )}
                                        </div>

                                        {/* Action Buttons */}
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
                                                        : "Save Variables"}
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    className="rounded-xl border shadow-lg"
                                    style={{
                                        borderColor: currentColors.border,
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
                                                Saved Environment Variables (
                                                {savedVariables.length})
                                            </h2>
                                        </div>

                                        <div className="space-y-3">
                                            {savedVariables.map(
                                                (variable, index) => (
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
                                                        <div className="flex justify-between items-center">
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                                                                    <div className="flex-1">
                                                                        <div
                                                                            className="text-sm font-medium mb-2"
                                                                            style={{
                                                                                color: currentColors.textSecondary,
                                                                            }}
                                                                        >
                                                                            Key
                                                                        </div>
                                                                        <div
                                                                            className="font-mono text-sm px-3 py-2.5 rounded-lg border"
                                                                            style={{
                                                                                backgroundColor:
                                                                                    currentColors.surface,
                                                                                borderColor:
                                                                                    currentColors.border,
                                                                                color: currentColors.text,
                                                                            }}
                                                                        >
                                                                            {
                                                                                variable.key
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex-2">
                                                                        <div
                                                                            className="text-sm font-medium mb-2"
                                                                            style={{
                                                                                color: currentColors.textSecondary,
                                                                            }}
                                                                        >
                                                                            Value
                                                                        </div>
                                                                        <div className="flex items-center gap-2">
                                                                            <div
                                                                                className="font-mono text-sm px-3 py-2.5 rounded-lg border flex-1"
                                                                                style={{
                                                                                    backgroundColor:
                                                                                        currentColors.bg,
                                                                                    borderColor:
                                                                                        currentColors.border,
                                                                                    color: variable.value
                                                                                        ? currentColors.text
                                                                                        : currentColors.textSecondary,
                                                                                    fontStyle:
                                                                                        variable.value
                                                                                            ? "normal"
                                                                                            : "italic",
                                                                                }}
                                                                            >
                                                                                {variable.value
                                                                                    ? showValues[
                                                                                          index
                                                                                      ]
                                                                                        ? variable.value
                                                                                        : maskValue(
                                                                                              variable.value
                                                                                          )
                                                                                    : PREDEFINED_KEYS.find(
                                                                                          (
                                                                                              k
                                                                                          ) =>
                                                                                              k.key ===
                                                                                              variable.key
                                                                                      )
                                                                                          ?.placeholder ||
                                                                                      "Not set"}
                                                                            </div>
                                                                            {variable.value && (
                                                                                <button
                                                                                    onClick={() =>
                                                                                        toggleValueVisibility(
                                                                                            index
                                                                                        )
                                                                                    }
                                                                                    className="p-2 rounded-lg transition-colors cursor-pointer hover:bg-opacity-10"
                                                                                    style={{
                                                                                        color: currentColors.text,
                                                                                    }}
                                                                                    title={
                                                                                        showValues[
                                                                                            index
                                                                                        ]
                                                                                            ? "Hide value"
                                                                                            : "Show value"
                                                                                    }
                                                                                >
                                                                                    {showValues[
                                                                                        index
                                                                                    ] ? (
                                                                                        <EyeOff className="w-4 h-4" />
                                                                                    ) : (
                                                                                        <Eye className="w-4 h-4" />
                                                                                    )}
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                        <div
                                            className="flex justify-end gap-3 pt-6 border-t mt-6"
                                            style={{
                                                borderColor:
                                                    currentColors.border,
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
                                                <Edit2 className="w-4 h-4" />
                                                Edit Variables
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Info Section */}
                    {!isLoading && (
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
                                                Variable keys are{" "}
                                                <strong>read-only</strong> and
                                                cannot be modified
                                            </span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <span className="mt-0.5">•</span>
                                            <span>
                                                Only the values can be updated
                                                to maintain configuration
                                                stability
                                            </span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <span className="mt-0.5">•</span>
                                            <span>
                                                Keep sensitive values secure and
                                                never share them publicly
                                            </span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <span className="mt-0.5">•</span>
                                            <span>
                                                Ensure all values are properly
                                                formatted before saving
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-3">
                                            <div className="flex items-start gap-2">
                                                <span className="mt-0.5">
                                                    •
                                                </span>
                                                <span>
                                                    Environment variable keys
                                                    are predefined and cannot be
                                                    changed
                                                </span>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <span className="mt-0.5">
                                                    •
                                                </span>
                                                <span>
                                                    Go to their respective
                                                    services to obtain API keys
                                                </span>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <span className="mt-0.5">
                                                    •
                                                </span>
                                                <span>
                                                    Click "Edit Variables" to
                                                    update the values
                                                </span>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <span className="mt-0.5">
                                                    •
                                                </span>
                                                <span>
                                                    Never commit sensitive
                                                    values to version control
                                                </span>
                                            </div>
                                        </div>

                                        {savedVariables.length > 0 && (
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
                                                    Values are masked by
                                                    default. Click the eye icon
                                                    to reveal them.
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Variables;
