import { useTheme } from "../contexts/ThemeContext";
import type { CustomCheckboxProps } from "../types";

const CustomCheckbox = ({ checked, onChange, label }: CustomCheckboxProps) => {
    const { currentColors, currentPalette } = useTheme();
    return (
        <>
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
        </>
    );
};

export default CustomCheckbox;
