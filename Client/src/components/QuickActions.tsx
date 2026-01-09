import type { QuickActionsProps } from "../types";
import { useTheme } from "../contexts/ThemeContext";

const QuickActions = ({
    setMessage,
    setHashTag,
    hashTag,
}: QuickActionsProps) => {
    const { currentColors, currentPalette } = useTheme();

    const buttonStyles = (isActive: boolean = false) => ({
        backgroundColor: isActive
            ? currentPalette.primary + "20"
            : currentColors.surface,
        color: isActive ? currentPalette.primary : currentColors.text,
        borderColor: isActive ? currentPalette.primary : currentColors.border,
    });

    return (
        <div className="flex flex-wrap gap-2 mt-3 mb-1">
            <button
                onClick={() => setMessage("/")}
                className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 border flex-shrink-0"
                style={buttonStyles()}
            >
                <span className="font-mono">/</span>commands
            </button>
            <button
                onClick={() => setHashTag("#confident")}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 border flex-shrink-0 ${
                    hashTag === "#confident" ? "hidden" : ""
                }`}
                style={buttonStyles()}
            >
                confident
            </button>
            <button
                onClick={() => setHashTag("#formal")}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 border flex-shrink-0 ${
                    hashTag === "#formal" ? "hidden" : ""
                }`}
                style={buttonStyles()}
            >
                formal
            </button>
            <button
                onClick={() => setHashTag("#casual")}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 border flex-shrink-0 ${
                    hashTag === "#casual" ? "hidden" : ""
                }`}
                style={buttonStyles()}
            >
                casual
            </button>
        </div>
    );
};

export default QuickActions;
