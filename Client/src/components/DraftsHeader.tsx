import { useTheme } from "../contexts/ThemeContext";
import { Link } from "react-router-dom";
import { MdHome } from "react-icons/md";
import { IoSettingsOutline } from "react-icons/io5";

const DraftsHeader = () => {
    const { currentColors } = useTheme();
    return (
        <div
            className="sticky top-0 z-50 flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 backdrop-blur-md shadow-sm select-none"
            style={{
                backgroundColor: currentColors.surface + "f5",
                borderBottom: `1px solid ${currentColors.border}`,
            }}
        >
            {/* Left: Brand & Page Title */}
            <div className="flex items-center">
                <div className="flex">
                    <h1
                        className="text-lg sm:text-xl font-bold"
                        style={{ color: currentColors.text }}
                    >
                        m<span className="text-blue-500 font-mono">AI</span>
                        lAgent
                    </h1>
                    <span
                        className="text-xs sm:text-sm font-medium italic ml-2 self-end mb-1"
                        style={{ color: currentColors.textSecondary }}
                    >
                      Drafts
                    </span>
                </div>
            </div>

            {/* Right: Navigation Links */}
            <div className="flex items-center gap-2">
                <Link
                    to="/email-form"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg hover:scale-105 transition-all duration-200"
                    style={{
                        color: currentColors.text,
                        backgroundColor: currentColors.bg,
                        border: `1px solid ${currentColors.border}`,
                    }}
                    title="Home"
                >
                    <MdHome size={18} />
                    <span className="hidden sm:inline text-sm font-medium">Home</span>
                </Link>

                <Link
                    to="/settings"
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg hover:scale-105 transition-all duration-200"
                    style={{
                        color: currentColors.text,
                        backgroundColor: currentColors.bg,
                        border: `1px solid ${currentColors.border}`,
                    }}
                    title="Settings"
                >
                    <IoSettingsOutline size={18} />
                    <span className="hidden sm:inline text-sm font-medium">
                        Settings
                    </span>
                </Link>
            </div>
        </div>
    );
};

export default DraftsHeader;
