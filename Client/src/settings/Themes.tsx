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
        <div
            className="min-h-screen transition-colors duration-300"
        >
            <div className="max-w-6xl mx-auto p-6 select-none">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <div
                            className="p-3 rounded-xl"
                            style={{
                                backgroundColor: `${currentPalette.primary}20`,
                            }}
                        >
                            <IoColorPaletteOutline
                                size={24}
                                style={{ color: currentColors.text }}
                            />
                        </div>
                        <div>
                            <h1
                                className="text-4xl font-bold"
                                style={{ color: currentColors.text }}
                            >
                                Customize Theme
                            </h1>
                            <p
                                className="text-lg mt-1"
                                style={{ color: currentColors.textSecondary }}
                            >
                                Change the appearance of the application to suit
                                your preferences
                            </p>
                        </div>
                    </div>
                </div>

                <div
                    className="border rounded-xl p-6 flex flex-col gap-4"
                    style={{
                        borderColor: currentColors.border,
                        minHeight: "500px",
                    }}
                >
                    {/* Theme Mode Selection */}
                    <div
                        className="flex justify-between gap-4 p-4 rounded-lg w-full"
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
                            className="flex items-center gap-1 border px-1 rounded-lg"
                            style={{ borderColor: currentColors.border }}
                        >
                            <button
                                className={`flex items-center gap-2 px-4 py-2 rounded-md font-semibold transition-all duration-200 cursor-pointer ${
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
                                <span>Light</span>
                            </button>
                            <button
                                className={`flex items-center gap-2 px-4 py-2 rounded-md font-semibold transition-all duration-200 cursor-pointer ${
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
                                <span>Dark</span>
                            </button>
                            <button
                                className="flex items-center gap-2 px-4 py-2 rounded-md font-semibold transition-all duration-200 cursor-pointer"
                                style={{ color: currentColors.text }}
                                onClick={toggleSystemTheme}
                            >
                                <MdOutlineDesktopWindows />
                                <span>System</span>
                            </button>
                        </div>
                    </div>

                    {/* Color Palette Selection */}
                    <div className="flex justify-between px-2">
                        <h1
                            className="text-md font-semibold mt-4"
                            style={{ color: currentColors.text }}
                        >
                            Color Palette
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
                        className="flex flex-col justify-center gap-6 p-6 rounded-lg w-full"
                        style={{ backgroundColor: currentColors.surface }}
                    >
                        {/* Preview Area */}
                        <div className="w-full flex items-center justify-center mb-4 gap-4">
                            {/* <div
                                className="rounded-lg border w-72 h-40 flex flex-col items-center justify-center p-4 transition-all duration-300"
                                style={{
                                    borderColor: currentColors.border,
                                    backgroundColor: currentColors.bg,
                                }}
                            >
                                <div
                                    className="w-12 h-12 rounded-full mb-3 flex items-center justify-center"
                                    style={{
                                        backgroundColor: currentPalette.primary,
                                    }}
                                >
                                    <IoColorPaletteOutline
                                        size={24}
                                        color="white"
                                    />
                                </div>
                                <h3
                                    className="font-semibold text-center"
                                    style={{ color: currentColors.text }}
                                >
                                    {currentPalette.name} Theme
                                </h3>
                                <p
                                    className="text-sm text-center"
                                    style={{
                                        color: currentColors.textSecondary,
                                    }}
                                >
                                    {theme === "dark"
                                        ? "Dark Mode"
                                        : "Light Mode"}
                                </p>
                            </div> */}
                            <div
                                className="rounded-lg border h-64 flex flex-col items-center justify-center transition-all duration-300"
                                style={{
                                    borderColor: currentColors.border,
                                    backgroundColor: currentColors.bg,
                                }}
                            >
                               {/* img src - /public/themes/blue.png or dark-blue.png */}
                               {/* Not working for ultradark and dark-ultradark */}
                                <img src={`/public/themes/${theme === "dark" ? "dark-" : ""}${currentPalette.name.toLowerCase()}.png`} alt={`${currentPalette.name} Theme`} className="w-full h-full object-cover rounded-lg" />
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

                        {/* Current Palette Info */}
                        {/* <div 
                            className="mt-6 p-4 rounded-lg border"
                            style={{ 
                                backgroundColor: currentColors.bg,
                                borderColor: currentColors.border
                            }}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <h3 
                                    className="font-semibold"
                                    style={{ color: currentColors.text }}
                                >
                                    Current Palette: {currentPalette.name}
                                </h3>
                                <div 
                                    className="w-8 h-8 rounded-full border-2"
                                    style={{ 
                                        backgroundColor: currentPalette.primary,
                                        borderColor: currentColors.border
                                    }}
                                ></div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                {[
                                    { color: currentPalette.primary, label: "Primary" },
                                    { color: currentColors.bg, label: "Background" },
                                    { color: currentColors.surface, label: "Surface" },
                                    { color: currentColors.text, label: "Text" },
                                    { color: currentColors.border, label: "Border" }
                                ].map(({ color, label }) => (
                                    <div key={label} className="text-center">
                                        <div 
                                            className="w-full h-8 rounded border mb-1"
                                            style={{ 
                                                backgroundColor: color,
                                                borderColor: currentColors.border
                                            }}
                                        ></div>
                                        <span 
                                            className="text-xs"
                                            style={{ color: currentColors.textSecondary }}
                                        >
                                            {label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div> */}

                        {/* Sample UI Elements */}
                        {/* <div 
                            className="mt-6 p-4 rounded-lg border"
                            style={{ 
                                backgroundColor: currentColors.bg,
                                borderColor: currentColors.border
                            }}
                        >
                            <h3 
                                className="font-semibold mb-4"
                                style={{ color: currentColors.text }}
                            >
                                Preview
                            </h3>
                            <div className="space-y-3">
                                <button 
                                    type="button"
                                    className="px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:opacity-90"
                                    style={{ 
                                        backgroundColor: currentPalette.primary,
                                        color: "white"
                                    }}
                                >
                                    Primary Button
                                </button>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        placeholder="Sample input"
                                        className="px-3 py-2 rounded border transition-colors duration-200"
                                        style={{ 
                                            backgroundColor: currentColors.bg,
                                            borderColor: currentColors.border,
                                            color: currentColors.text
                                        }}
                                    />
                                    <button 
                                        type="button"
                                        className="px-3 py-2 rounded border font-medium transition-all duration-200"
                                        style={{ 
                                            backgroundColor: currentColors.surface,
                                            borderColor: currentColors.border,
                                            color: currentColors.text
                                        }}
                                    >
                                        Secondary
                                    </button>
                                </div>
                                <div 
                                    className="p-3 rounded border"
                                    style={{ 
                                        backgroundColor: currentColors.surface,
                                        borderColor: currentColors.border
                                    }}
                                >
                                    <p style={{ color: currentColors.text }}>
                                        This is sample content with your selected theme.
                                    </p>
                                    <a 
                                        href="#" 
                                        className="underline transition-colors duration-200"
                                        style={{ color: currentPalette.primary }}
                                        onClick={(e: React.MouseEvent) => e.preventDefault()}
                                    >
                                        Sample link
                                    </a>
                                </div>
                            </div>
                        </div> */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Themes;
