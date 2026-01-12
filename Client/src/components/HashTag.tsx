import type { HashTagProps } from "../types";
import { useTheme } from "../contexts/ThemeContext";

const HashTag = ({ hashTag, setHashTag }: HashTagProps) => {
    const { currentColors } = useTheme();

    return (
        <div className="select-none">
            <span className="text-xs font-bold">Tag: </span>
            {hashTag ? (
                <>
                    <span
                        className="text-xs rounded-full px-1"
                        style={{
                            color: currentColors.text,
                            backgroundColor: currentColors.textSecondary + "33",
                        }}
                    >
                        {hashTag}
                    </span>
                    <button
                        onClick={() => setHashTag("")}
                        className="text-xs text-red-500 hover:text-red-600 sm:bg-red-50 sm:hover:bg-red-100 sm:dark:bg-red-900/20 sm:dark:hover:bg-red-900/30 dark:text-red-400 dark:hover:text-red-300 px-2 py-0.5 rounded-full cursor-pointer sm:ml-1 transition-all duration-200"
                        title="Remove tag"
                    >
                        <span className="hidden sm:inline">Remove</span>
                        <span className="sm:hidden font-bold">✕</span>
                    </button>
                </>
            ) : (
                <span
                    className="text-xs rounded-full px-1"
                    style={{
                        color: currentColors.text,
                        backgroundColor: currentColors.textSecondary + "33",
                    }}
                >
                    None
                </span>
            )}
        </div>
    );
};

export default HashTag;
