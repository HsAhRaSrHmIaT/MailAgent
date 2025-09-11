import { useState } from "react";
import type { Variable } from "../types";
import { useTheme } from "../contexts/ThemeContext";

import { Save, Edit2, Eye, EyeOff, Lightbulb } from "lucide-react";

const Variables = () => {
    const { currentPalette, currentColors } = useTheme();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showValues, setShowValues] = useState<{ [key: number]: boolean }>(
        {}
    );

    // Mock saved data
    const [savedVariables, setSavedVariables] = useState<Variable[]>([
        { key: "GEMINI_API_KEY", value: "pass@localhost:5432/mydb" },
        { key: "MURF_API_KEY", value: "sk-1234567890abcdef" },
        { key: "ASSEMBLYAI_API_KEY", value: "super-secret-jwt-key-123" },
    ]);
    const [editingVariables, setEditingVariables] = useState<Variable[]>([]);

    const startEditing = () => {
        setEditingVariables([...savedVariables]);
        setIsEditing(true);
    };

    // const addVariable = () => {
    //     setEditingVariables([...editingVariables, { key: "", value: "" }]);
    // };

    // const removeVariable = (index: number): void => {
    //     setEditingVariables(editingVariables.filter((_, i) => i !== index));
    // };

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

    const handleSave = () => {
        setIsSaving(true);
        // Simulate saving process
        setTimeout(() => {
            const validVariables = editingVariables.filter(
                (v) => v.key.trim() && v.value.trim()
            );
            setSavedVariables(validVariables);
            setIsEditing(false);
            setIsSaving(false);
            console.log("Environment variables saved", validVariables);
        }, 1500);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditingVariables([]);
    };

    const toggleValueVisibility = (index: number) => {
        setShowValues((prev) => ({
            ...prev,
            [index]: !prev[index],
        }));
    };

    const maskValue = (value: string) => {
        if (value.length <= 8) return "•".repeat(value.length);
        return (
            "•".repeat(Math.max(4, value.length - 8)) +
            value.substring(value.length - 4)
        );
    };

    return (
        <div className="min-h-screen">
            <div className="max-w-6xl mx-auto p-6 select-none">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <div
                            className="p-3 px-2.5 rounded-xl"
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
                                className="text-4xl font-bold"
                                style={{ color: currentColors.text }}
                            >
                                Environment Variables
                            </h1>
                            <p
                                className="text-lg mt-1"
                                style={{ color: currentColors.textSecondary }}
                            >
                                Configure your application's environment
                                variables securely and efficiently
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
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex-1">
                                                            <div
                                                                className="text-sm font-medium mb-1"
                                                                style={{
                                                                    color: currentColors.textSecondary,
                                                                }}
                                                            >
                                                                Key
                                                            </div>
                                                            <input
                                                                type="text"
                                                                value={
                                                                    variable.key
                                                                }
                                                                onChange={(e) =>
                                                                    updateVariable(
                                                                        index,
                                                                        "key",
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                                placeholder="API_KEY"
                                                                className="w-full font-mono px-3 py-2 rounded border focus:outline-none focus:ring-1 
                                                            focus:ring-blue-500
                                                            focus:border-blue-500 dark:focus:ring-gray-200 dark:focus:border-gray-200 transition-colors"
                                                                style={{
                                                                    backgroundColor:
                                                                        currentColors.bg,
                                                                    borderColor:
                                                                        currentColors.border,
                                                                    color: currentColors.text,
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div
                                                                className="text-sm font-medium mb-1"
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
                                                                onChange={(e) =>
                                                                    updateVariable(
                                                                        index,
                                                                        "value",
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                                placeholder="your-secret-value"
                                                                className="w-full font-mono px-3 py-2 rounded border focus:outline-none focus:ring-1 
                                                            focus:ring-blue-500
                                                            focus:border-blue-500 dark:focus:ring-gray-200 dark:focus:border-gray-200 transition-colors"
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
                                                            <div className="flex items-center gap-4">
                                                                <div className="flex-1">
                                                                    <div
                                                                        className="text-sm font-medium mb-1"
                                                                        style={{
                                                                            color: currentColors.textSecondary,
                                                                        }}
                                                                    >
                                                                        Key
                                                                    </div>
                                                                    <div
                                                                        className="font-mono px-3 py-2 rounded border"
                                                                        style={{
                                                                            backgroundColor:
                                                                                currentColors.bg,
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
                                                                        className="text-sm font-medium mb-1"
                                                                        style={{
                                                                            color: currentColors.textSecondary,
                                                                        }}
                                                                    >
                                                                        Value
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <div
                                                                            className="font-mono px-3 py-2 rounded border flex-1"
                                                                            style={{
                                                                                backgroundColor:
                                                                                    currentColors.bg,
                                                                                borderColor:
                                                                                    currentColors.border,
                                                                                color: currentColors.text,
                                                                            }}
                                                                        >
                                                                            {showValues[
                                                                                index
                                                                            ]
                                                                                ? variable.value
                                                                                : maskValue(
                                                                                      variable.value
                                                                                  )}
                                                                        </div>
                                                                        <button
                                                                            onClick={() =>
                                                                                toggleValueVisibility(
                                                                                    index
                                                                                )
                                                                            }
                                                                            className="p-2 rounded transition-colors cursor-pointer"
                                                                            style={{
                                                                                color: currentColors.text,
                                                                            }}
                                                                        >
                                                                            {showValues[
                                                                                index
                                                                            ] ? (
                                                                                <EyeOff className="w-4 h-4" />
                                                                            ) : (
                                                                                <Eye className="w-4 h-4" />
                                                                            )}
                                                                        </button>
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
                                            <Edit2 className="w-4 h-4" />
                                            Edit Variables
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
                                <Lightbulb className="w-6 h-6" />
                                Best Practices
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-start gap-2">
                                    <span className="mt-0.5">•</span>
                                    <span>
                                        Use uppercase with underscores for
                                        variable names (e.g., API_KEY,
                                        DATABASE_URL)
                                    </span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="mt-0.5">•</span>
                                    <span>
                                        Keep sensitive values secure and never
                                        commit them to version control
                                    </span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="mt-0.5">•</span>
                                    <span>
                                        Remove unused variables to keep your
                                        environment clean
                                    </span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="mt-0.5">•</span>
                                    <span>
                                        Use descriptive names that clearly
                                        indicate the variable's purpose
                                    </span>
                                </div>
                            </div>

                            {!isEditing && savedVariables.length > 0 && (
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
                                        Values are masked by default. Click the
                                        eye icon to reveal them.
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

export default Variables;
