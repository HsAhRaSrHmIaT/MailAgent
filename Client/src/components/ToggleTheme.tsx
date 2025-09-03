import { useTheme } from "../contexts/ThemeContext";
import { RiMoonClearFill } from "react-icons/ri";
import { MdSunny } from "react-icons/md";

const ToggleTheme = () => {
    const { theme, setTheme, currentColors } = useTheme();

    const buttonBase =
        "flex justify-center items-center w-8 h-8 rounded-full transition-colors duration-200 cursor-pointer";
    const activeStyle = {
        backgroundColor: currentColors.border,
    };
    const inactiveStyle = {
        backgroundColor: currentColors.surface,
        border: `2px solid transparent`,
    };

    return (
        <div
            className="flex items-center p-1 rounded-4xl shadow-md"
            style={{
                backgroundColor: currentColors.surface,
                border: `1px solid ${currentColors.border}`,
            }}
        >
            <button
                onClick={() => setTheme("dark")}
                className={buttonBase}
                style={theme === "dark" ? activeStyle : inactiveStyle}
                aria-label="Dark mode"
            >
                <RiMoonClearFill
                    style={{ color: currentColors.text }}
                />
            </button>
            <button
                onClick={() => setTheme("light")}
                className={buttonBase}
                style={theme === "light" ? activeStyle : inactiveStyle}
                aria-label="Light mode"
            >
                <MdSunny style={{ color: currentColors.text }} />
            </button>
        </div>
    );
};

export default ToggleTheme;
