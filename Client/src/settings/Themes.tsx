import { IoColorPaletteOutline } from "react-icons/io5";
import { RiMoonClearFill } from "react-icons/ri";
import { MdSunny, MdOutlineDesktopWindows } from "react-icons/md";
import { RxReset } from "react-icons/rx";
import { useTheme } from "../contexts/ThemeContext";
import {
    colorPalettes,
    type PaletteKey,
    type ColorPalette,
} from "../contexts/themeTypes";

// Type definitions
type ThemeMode = "light" | "dark";

const Themes: React.FC = () => {
    const {
        theme,
        colorPalette,
        currentColors,
        currentPalette,
        setTheme,
        setColorPalette,
        resetToDefault,
    } = useTheme();

    const toggleLightTheme = (): void => setTheme("light");
    const toggleDarkTheme = (): void => setTheme("dark");

    const toggleSystemTheme = (): void => {
        const systemTheme: ThemeMode = window.matchMedia(
            "(prefers-color-scheme: dark)"
        ).matches
            ? "dark"
            : "light";
        setTheme(systemTheme);
    };

    // const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>): void => {
    //     const target = e.target as HTMLElement;
    //     target.style.color = currentColors.text;
    // };

    // const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>): void => {
    //     const target = e.target as HTMLElement;
    //     target.style.color = currentColors.textSecondary;
    // };

    return (
        <div className="transition-colors duration-300">
            <div className="max-w-6xl mx-auto select-none">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <div
                            className="p-2 sm:p-3 rounded-xl"
                            style={{
                                backgroundColor: `${currentPalette.primary}50`,
                            }}
                        >
                            <IoColorPaletteOutline
                                size={24}
                                style={{ color: currentColors.text }}
                            />
                        </div>
                        <div>
                            <h1
                                className="text-2xl sm:text-4xl font-bold"
                                style={{ color: currentColors.text }}
                            >
                                Customize Theme
                            </h1>
                            <p
                                className="text-base sm:text-lg mt-1"
                                style={{ color: currentColors.textSecondary }}
                            >
                                Change the appearance of the application to suit
                                your preferences
                            </p>
                        </div>
                    </div>
                </div>

                <div
                    className="border rounded-xl p-3 sm:p-4 flex flex-col gap-4"
                    style={{
                        borderColor: currentColors.border,
                        minHeight: "500px",
                    }}
                >
                    {/* Theme Mode Selection */}
                    <div
                        className="flex flex-col sm:flex-row justify-between gap-4 p-3 sm:p-4 rounded-lg w-full"
                        style={{ backgroundColor: currentColors.surface }}
                    >
                        <div>
                            <h1
                                className="text-lg font-semibold"
                                style={{ color: currentColors.text }}
                            >
                                Overall Appearance
                            </h1>
                            <p
                                className="text-sm"
                                style={{ color: currentColors.textSecondary }}
                            >
                                Choose your preferred theme mode
                            </p>
                        </div>
                        <div
                            className="flex flex-wrap items-center gap-1 border px-1 py-1 sm:py-0 rounded-lg"
                            style={{ borderColor: currentColors.border }}
                        >
                            <button
                                className={`flex items-center justify-center gap-1 flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer ${
                                    theme === "light" ? "shadow-sm" : ""
                                }`}
                                style={{
                                    color: currentColors.text,
                                    backgroundColor:
                                        theme === "light"
                                            ? currentColors.border
                                            : "transparent",
                                }}
                                onClick={toggleLightTheme}
                            >
                                <MdSunny />
                                <span className="hidden sm:inline">Light</span>
                            </button>
                            <button
                                className={`flex items-center justify-center gap-1 flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer ${
                                    theme === "dark" ? "shadow-sm" : ""
                                }`}
                                style={{
                                    color: currentColors.text,
                                    backgroundColor:
                                        theme === "dark"
                                            ? currentColors.border
                                            : "transparent",
                                }}
                                onClick={toggleDarkTheme}
                            >
                                <RiMoonClearFill />
                                <span className="hidden sm:inline">Dark</span>
                            </button>
                            <button
                                className="flex items-center justify-center gap-1 flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer"
                                style={{ color: currentColors.text }}
                                onClick={toggleSystemTheme}
                            >
                                <MdOutlineDesktopWindows />
                                <span className="hidden sm:inline">System</span>
                            </button>
                        </div>
                    </div>

                    {/* Color Palette Selection */}
                    <div className="flex flex-col sm:flex-row justify-between px-2">
                        <h1
                            className="text-md font-semibold mt-4"
                            style={{ color: currentColors.text }}
                        >
                            Color Palette ({currentPalette.name} Theme)
                        </h1>
                        <button
                            className="flex text-sm mt-4 cursor-pointer transition-colors duration-200 hover:underline"
                            style={{ color: currentColors.textSecondary }}
                            onClick={resetToDefault}
                        >
                            <RxReset className="mr-1 mt-1" />
                            <span>Restore default</span>
                        </button>
                    </div>

                    <div
                        className="flex flex-col justify-center gap-4 sm:gap-6 p-4 sm:p-6 rounded-lg w-full"
                        style={{ backgroundColor: currentColors.surface }}
                    >
                        {/* Preview Area */}
                        <div className="w-full flex items-center justify-center mb-4 gap-4">
                            <div
                                className="rounded-lg border h-48 sm:h-64 flex flex-col items-center justify-center transition-all duration-300"
                                style={{
                                    borderColor: currentColors.border,
                                    backgroundColor: currentColors.bg,
                                }}
                            >
                                {/* img src - /public/themes/blue.png or dark-blue.png */}
                                <img
                                    src={`/themes/${
                                        theme === "dark" ? "dark-" : ""
                                    }${currentPalette.name.toLowerCase()}.png`}
                                    alt={`${currentPalette.name} Theme`}
                                    className="w-full h-full object-cover rounded-lg"
                                />
                            </div>
                        </div>

                        {/* Color Palette Grid */}
                        <div className="flex items-center justify-center gap-3 flex-wrap">
                            {(
                                Object.entries(colorPalettes) as [
                                    PaletteKey,
                                    ColorPalette
                                ][]
                            ).map(([key, palette]) => (
                                <button
                                    key={key}
                                    className={`relative w-10 h-10 rounded-full border-2 transition-all duration-200 group ${
                                        colorPalette === key
                                            ? "ring-2 ring-offset-2"
                                            : ""
                                    }`}
                                    style={{
                                        backgroundColor: palette.primary,
                                        borderColor:
                                            colorPalette === key
                                                ? palette.primary
                                                : currentColors.border,
                                    }}
                                    onClick={() => setColorPalette(key)}
                                    title={palette.name}
                                    type="button"
                                >
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-transparent via-white/10 to-black/20"></div>
                                    {colorPalette === key && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-3 h-3 bg-white rounded-full"></div>
                                        </div>
                                    )}
                                    <div
                                        className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs font-medium whitespace-nowrap px-2 py-1 rounded-full"
                                        style={{
                                            backgroundColor:
                                                currentColors.surface,
                                            color: currentColors.text,
                                            borderColor: currentColors.border,
                                        }}
                                    >
                                        {palette.name}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Themes;
