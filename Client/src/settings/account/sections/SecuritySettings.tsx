import { useTheme } from "../../../contexts/ThemeContext";
import { useState } from "react";

const SecuritySettings = () => {
    const { currentColors, currentPalette } = useTheme();
    const [aiLearning, setAiLearning] = useState(false);
    const [saveHistory, setSaveHistory] = useState(false);

    type CustomCheckboxProps = {
        checked: boolean;
        onChange: () => void;
        label: string;
    };
    const CustomCheckbox = ({
        checked,
        onChange,
        label,
    }: CustomCheckboxProps) => (
        <label className="flex items-center gap-2 cursor-pointer">
            <div
                className="w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-200"
                style={{
                    backgroundColor: checked
                        ? currentPalette.primary
                        : currentColors.surface,
                    borderColor: checked
                        ? currentPalette.primary
                        : currentColors.border,
                }}
                onClick={onChange}
            >
                {checked && (
                    <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                        />
                    </svg>
                )}
            </div>
            <span style={{ color: currentColors.text }}>{label}</span>
        </label>
    );

    return (
        <div className="space-y-2">
            <h3 className="text-lg font-semibold">Security & Privacy</h3>
            {/* Preferences */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-2">
                        AI Language
                    </label>
                    <select className="w-full p-2 border rounded-lg">
                        <option>English</option>
                        <option>Hindi</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">
                        System Language
                    </label>
                    <select className="w-full p-2 border rounded-lg">
                        <option>English</option>
                        <option>Hindi</option>
                    </select>
                </div>
            </div>

            {/* Active Sessions */}
            <div>
                <h4 className="font-medium mb-2">Active Sessions</h4>
                <div className="space-y-2">
                    <div
                        className="flex items-center justify-between p-3 rounded-lg"
                        style={{ backgroundColor: `${currentColors.bg}` }}
                    >
                        <div>
                            <div className="font-medium">Current Session</div>
                            <div
                                className="text-sm"
                                style={{ color: currentColors.textSecondary }}
                            >
                                Windows • Chrome • India
                            </div>
                        </div>
                        <span className="text-green-600 text-sm">Active</span>
                    </div>
                </div>
            </div>

            {/* Data Privacy */}
            <div className="space-y-2">
                <h4
                    className="font-medium"
                    style={{ color: currentColors.text }}
                >
                    Data & Privacy
                </h4>
                <CustomCheckbox
                    checked={aiLearning}
                    onChange={() => setAiLearning(!aiLearning)}
                    label="Allow AI to learn from my email patterns"
                />
                <CustomCheckbox
                    checked={saveHistory}
                    onChange={() => setSaveHistory(!saveHistory)}
                    label="Save conversation history for 30 days"
                />
                <button className="text-red-600 hover:text-red-700 text-sm hover:underline cursor-pointer">
                    Delete All My Data
                </button>
            </div>
        </div>
    );
};

export default SecuritySettings;
