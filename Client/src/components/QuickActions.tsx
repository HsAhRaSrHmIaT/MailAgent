import type { QuickActionsProps } from "../types";
import { useTheme } from "../contexts/ThemeContext";

const QuickActions = ({
    setMessage,
    setHashTag,
    hashTag,
}: QuickActionsProps) => {
    const { currentColors } = useTheme();
    return (
        <div className="flex flex-wrap gap-2 mt-2">
            <button
                onClick={() => setMessage("/")}
                className="px-3 py-1 rounded-full text-sm cursor-pointer shadow-sm dark:shadow-gray-900/30"
                style={{
                    backgroundColor: currentColors.textSecondary + "33",
                    color: currentColors.text,
                }}
            >
                /commands
            </button>
            <button
                onClick={() => setHashTag("#confident")}
                className={`px-3 py-1 rounded-full text-sm cursor-pointer shadow-sm dark:shadow-gray-900/30 ${
                    hashTag === "#confident" ? "hidden" : ""
                }`}
                style={{
                    backgroundColor: currentColors.textSecondary + "33",
                    color: currentColors.text,
                }}
            >
                confident
            </button>
            <button
                onClick={() => setHashTag("#formal")}
                className={`px-3 py-1 rounded-full text-sm cursor-pointer shadow-sm dark:shadow-gray-900/30 ${
                    hashTag === "#formal" ? "hidden" : ""
                }`}
                style={{
                    backgroundColor: currentColors.textSecondary + "33",
                    color: currentColors.text,
                }}
            >
                formal
            </button>
            <button
                onClick={() => setHashTag("#casual")}
                className={`px-3 py-1 rounded-full text-sm cursor-pointer shadow-sm dark:shadow-gray-900/30 ${
                    hashTag === "#casual" ? "hidden" : ""
                }`}
                style={{
                    backgroundColor: currentColors.textSecondary + "33",
                    color: currentColors.text,
                }}
            >
                casual
            </button>
        </div>
    );
};

export default QuickActions;
