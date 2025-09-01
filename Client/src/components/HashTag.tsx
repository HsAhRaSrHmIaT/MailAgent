import type { HashTagProps } from "../types";
import { useTheme } from "../contexts/ThemeContext";

const HashTag = ({ hashTag, setHashTag }: HashTagProps) => {
    const { currentColors } = useTheme();

    return (
        <div className="select-none">
            <span className="text-xs font-bold">
                Tag:{" "}
            </span>
            {hashTag ? (
                <>
                    <span className="text-xs rounded-full px-1" style={{ color: currentColors.text, backgroundColor: currentColors.textSecondary + "33" }}>
                        {hashTag}
                    </span>
                    <button
                        onClick={() => setHashTag("")}
                        className="text-xs text-red-400 bg-red-50 hover:bg-red-100 px-1 rounded-full cursor-pointer ml-1"
                    >
                        Remove
                    </button>
                </>
            ) : (
                <span className="text-xs rounded-full px-1" style={{ color: currentColors.text, backgroundColor: currentColors.textSecondary + "33" }}>
                    None
                </span>
            )}
        </div>
    );
};

export default HashTag;
