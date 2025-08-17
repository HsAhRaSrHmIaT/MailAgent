import { useState } from "react";
import { Save } from "lucide-react";

interface Variable {
    key: string;
    value: string;
}

const Variables = () => {
    const [variables, setVariables] = useState<Variable[]>([
        { key: "", value: "" },
        { key: "", value: "" },
        { key: "", value: "" },
    ]);

    // const addVariable = () => {
    //     setVariables([...variables, { key: "", value: "" }]);
    // };

    // const removeVariable = (index: number): void => {
    //     setVariables(variables.filter((_, i) => i !== index));
    // };

    const updateVariable = (
        index: number,
        field: string,
        value: string
    ): void => {
        const updated = variables.map((variable, i) =>
            i === index ? { ...variable, [field]: value } : variable
        );
        setVariables(updated);
    };

    const handleSave = () => {
        console.log(
            "Saving variables:",
            variables.filter((v) => v.key || v.value)
        );
    };

    return (
        <div className="min-h-screen">
            <div className="">
                {/* Header */}
                <div className="m-6 ml-8">
                    <div className="inline-flex gap-3 mb-4">
                        <div className="p-3 bg-blue-500/20 rounded-xl">
                            <span className="w-8 h-8 text-blue-400">.env</span>
                        </div>
                        <h1 className="text-4xl font-bold dark:text-white mb-3">
                            Environment Variables
                        </h1>
                    </div>
                    <p className="text-slate-400 text-lg max-w-2xl">
                        Configure your application's environment variables
                        securely and efficiently
                    </p>
                </div>

                {/* Main Container */}
                <div className="flex max-w-6xl mx-auto gap-4">
                    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-2xl w-3/4">
                        <div className="p-6">
                            {/* Variables List */}
                            <div className="space-y-3 mb-6">
                                {variables.map((variable, index) => (
                                    <div
                                        key={index}
                                        className="group bg-slate-900/50 rounded-xl border border-slate-700/50 p-6 hover:border-slate-600/50 transition-all duration-200"
                                    >
                                        <div className="flex gap-4 items-end">
                                            <div className="flex-1">
                                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                                    Variable Key
                                                </label>
                                                <input
                                                    type="text"
                                                    value={variable.key}
                                                    onChange={(e) =>
                                                        updateVariable(
                                                            index,
                                                            "key",
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="API_KEY"
                                                    className="w-full px-4 py-3 bg-slate-800/70 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-colors"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                                    Variable Value
                                                </label>
                                                <input
                                                    type="text"
                                                    value={variable.value}
                                                    onChange={(e) =>
                                                        updateVariable(
                                                            index,
                                                            "value",
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="your-secret-value"
                                                    className="w-full px-4 py-3 bg-slate-800/70 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-colors"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 justify-end items-center pt-6 border-t border-slate-700/50">
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        className="px-6 py-3 text-slate-300 hover:text-white hover:bg-slate-700/30 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSave}
                                        className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                                    >
                                        <Save className="w-5 h-5" />
                                        Save Variables
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Info Section */}
                    <div className="w-1/4 p-6 bg-slate-800/30 rounded-xl border border-slate-700/30">
                        <h3 className="text-lg font-semibold text-white mb-3">
                            💡 Tips
                        </h3>
                        <ul className="space-y-2 text-slate-400">
                            <li>
                                • Use uppercase with underscores for environment
                                variable names (e.g., API_KEY, DATABASE_URL)
                            </li>
                            <li>
                                • Keep sensitive values secure and never commit
                                them to version control
                            </li>
                            <li>
                                • Remove unused variables to keep your
                                environment clean
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Variables;
