import { useTheme } from "../contexts/ThemeContext";
import { RiMoonClearFill } from "react-icons/ri";
import { MdSunny } from "react-icons/md";

const ToggleTheme = () => {
    const { theme, setTheme, currentColors } = useTheme();

    const activeStyle = {
        backgroundColor: currentColors.border,
    };
    const inactiveStyle = {
        backgroundColor: currentColors.surface,
        border: `2px solid transparent`,
    };

    return (
        <div
            className="flex items-center rounded-4xl shadow-md lg:p-1"
            style={{
                backgroundColor: currentColors.surface,
                border: `1px solid ${currentColors.border}`,
                padding: "4px",
                gap: "4px",
            }}
        >
            <button
                onClick={() => setTheme("dark")}
                className="flex justify-center items-center rounded-full transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 lg:w-8 lg:h-8"
                style={{
                    ...(theme === "dark" ? activeStyle : inactiveStyle),
                    minHeight: "36px",
                    minWidth: "36px",
                }}
                aria-label="Dark mode"
            >
                <RiMoonClearFill
                    size={18}
                    className="lg:w-5 lg:h-5"
                    style={{ color: currentColors.text }}
                />
            </button>
            <button
                onClick={() => setTheme("light")}
                className="flex justify-center items-center rounded-full transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 lg:w-8 lg:h-8"
                style={{
                    ...(theme === "light" ? activeStyle : inactiveStyle),
                    minHeight: "36px",
                    minWidth: "36px",
                }}
                aria-label="Light mode"
            >
                <MdSunny
                    size={18}
                    className="lg:w-5 lg:h-5"
                    style={{ color: currentColors.text }}
                />
            </button>
        </div>
    );
};

export default ToggleTheme;
