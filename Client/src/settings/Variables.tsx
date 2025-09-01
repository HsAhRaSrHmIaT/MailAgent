import { useState } from "react";
import { Save, Edit2, Eye, EyeOff, Lightbulb } from "lucide-react";
// import { GoLightBulb } from "react-icons/go";

interface Variable {
    key: string;
    value: string;
}

const Variables = () => {
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
                        <div className="p-3 px-2.5 bg-blue-500/20 rounded-xl">
                            <span className="text-sm text-blue-400 font-mono font-bold">
                                .env
                            </span>
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                                Environment Variables
                            </h1>
                            <p className="text-gray-600 dark:text-slate-400 text-lg mt-1">
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
                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-lg">
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                            Edit Environment Variables
                                        </h2>
                                    </div>

                                    {/* Variables List */}
                                    <div className="space-y-3 mb-6">
                                        {editingVariables.map(
                                            (variable, index) => (
                                                <div
                                                    key={index}
                                                    className="bg-gray-50 dark:bg-slate-900/50 rounded-lg border border-gray-200 dark:border-slate-700 p-4 hover:border-gray-300 dark:hover:border-slate-600 transition-colors"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex-1">
                                                            <div className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
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
                                                                className="w-full font-mono text-gray-900 dark:text-white bg-gray-100 dark:bg-slate-800 px-3 py-2 rounded border border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-1 
                                                            focus:ring-blue-500
                                                            focus:border-blue-500 dark:focus:ring-gray-200 dark:focus:border-gray-200 transition-colors"
                                                            />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
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
                                                                className="w-full font-mono text-gray-900 dark:text-white bg-gray-100 dark:bg-slate-800 px-3 py-2 rounded border border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-1 
                                                            focus:ring-blue-500
                                                            focus:border-blue-500 dark:focus:ring-gray-200 dark:focus:border-gray-200 transition-colors"
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
                                            className="px-6 py-3 text-gray-700 dark:text-slate-300 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-sm transition-colors cursor-pointer"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-sm transition-colors shadow-lg cursor-pointer"
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
                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-lg">
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                            Saved Environment Variables (
                                            {savedVariables.length})
                                        </h2>
                                    </div>

                                    <div className="space-y-3">
                                        {savedVariables.map(
                                            (variable, index) => (
                                                <div
                                                    key={index}
                                                    className="bg-gray-50 dark:bg-slate-900/50 rounded-lg border border-gray-200 dark:border-slate-700 p-4 hover:border-gray-300 dark:hover:border-slate-600 transition-colors"
                                                >
                                                    <div className="flex justify-between items-center">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-4">
                                                                <div className="flex-1">
                                                                    <div className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                                                                        Key
                                                                    </div>
                                                                    <div className="font-mono text-gray-900 dark:text-white bg-gray-100 dark:bg-slate-800 px-3 py-2 rounded border">
                                                                        {
                                                                            variable.key
                                                                        }
                                                                    </div>
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                                                                        Value
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="font-mono text-gray-900 dark:text-white bg-gray-100 dark:bg-slate-800 px-3 py-2 rounded border flex-1">
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
                                                                            className="p-2 text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition-colors cursor-pointer"
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
                                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-slate-700 mt-6">
                                        <button
                                            onClick={startEditing}
                                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-sm transition-colors cursor-pointer"
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
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-lg p-6 sticky top-6">
                            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                <Lightbulb className="w-6 h-6" />
                                Best Practices
                            </h3>
                            <div className="space-y-3 text-gray-600 dark:text-slate-400">
                                <div className="flex items-start gap-2">
                                    <span className="text-blue-500 mt-0.5">
                                        •
                                    </span>
                                    <span>
                                        Use uppercase with underscores for
                                        variable names (e.g., API_KEY,
                                        DATABASE_URL)
                                    </span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="text-blue-500 mt-0.5">
                                        •
                                    </span>
                                    <span>
                                        Keep sensitive values secure and never
                                        commit them to version control
                                    </span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="text-blue-500 mt-0.5">
                                        •
                                    </span>
                                    <span>
                                        Remove unused variables to keep your
                                        environment clean
                                    </span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="text-blue-500 mt-0.5">
                                        •
                                    </span>
                                    <span>
                                        Use descriptive names that clearly
                                        indicate the variable's purpose
                                    </span>
                                </div>
                            </div>

                            {!isEditing && savedVariables.length > 0 && (
                                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-slate-700">
                                    <div className="text-sm text-gray-500 dark:text-slate-400">
                                        <strong className="text-gray-700 dark:text-slate-300">
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
