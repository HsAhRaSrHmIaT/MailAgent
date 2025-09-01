import { useEffect, useState } from "react";

import { IoColorPaletteOutline } from "react-icons/io5";
import { RiMoonClearFill } from "react-icons/ri";
import {
    MdSunny,
    MdOutlineDesktopWindows,
} from "react-icons/md";
import { RxReset } from "react-icons/rx";

const Themes = () => {
    const [theme, setTheme] = useState(
        localStorage.getItem("theme") || "light"
    );

    useEffect(() => {
        localStorage.setItem("theme", theme);
        document.documentElement.classList.toggle("dark", theme === "dark");
    }, [theme]);

    const toggleLightTheme = () => {
        setTheme("light");
    };

    const toggleDarkTheme = () => {
        setTheme("dark");
    };

    return (
        <div className="min-h-screen">
            <div className="max-w-6xl mx-auto p-6 select-none">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-500/20 rounded-xl">
                            <span className="text-md text-blue-400 font-mono font-bold">
                                <IoColorPaletteOutline size={24} />
                            </span>
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                                Customize Theme
                            </h1>
                            <p className="text-gray-600 dark:text-slate-400 text-lg mt-1">
                                Change the appearance of the application to suit
                                your preferences
                            </p>
                        </div>
                    </div>
                </div>
                <div className="h-142 border border-gray-400 dark:border-slate-700 rounded-xl p-6 flex flex-col">
                    {/* Theme customization options go here */}
                    <div className="flex justify-between gap-4 bg-gray-100 dark:bg-slate-800 p-4 rounded-lg w-full">
                        <div>
                            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Overall Appearance
                            </h1>
                            <p className="text-gray-600 dark:text-slate-400 text-sm">
                                Choose your preferred theme mode
                            </p>
                        </div>
                        <div className="flex items-center gap-1 border border-gray-300 dark:border-slate-600 px-1 rounded-lg">
                            <button
                                className={`flex items-center gap-2 px-4 py-2 rounded-md font-semibold dark:text-white ${
                                    theme === "light"
                                        ? "bg-gray-300"
                                        : "bg-transparent"
                                } hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors cursor-pointer`}
                                onClick={toggleLightTheme}
                            >
                                <MdSunny />
                                <span>Light</span>
                            </button>
                            <button
                                className={`flex items-center gap-2 px-4 py-2 rounded-md font-semibold dark:text-white ${
                                    theme === "dark"
                                        ? "dark:bg-slate-600"
                                        : "bg-transparent"
                                } hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors cursor-pointer`}
                                onClick={toggleDarkTheme}
                            >
                                <RiMoonClearFill />
                                <span>Dark</span>
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 rounded-md font-semibold dark:text-white bg-transparent dark:bg-transparent hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors cursor-pointer">
                                <MdOutlineDesktopWindows />
                                <span>System</span>
                            </button>
                        </div>
                    </div>
                    <div className="flex justify-between px-2">
                        <h1 className="text-md font-semibold text-gray-900 dark:text-white mt-4">
                            Theme
                        </h1>
                        <div className="flex text-sm text-gray-700 dark:text-gray-400 mt-4 cursor-pointer hover:text-gray-900 dark:hover:text-white">
                            <RxReset className="mr-1 mt-1"/>
                            <h1>Restore default</h1>
                        </div>
                    </div>
                    <div className="flex flex-col justify-center gap-4 bg-gray-100 dark:bg-slate-800 p-4 rounded-lg w-full">
                        {/* Display 4x4 box */}
                        <div className="w-full flex items-center justify-center mb-4 md:mb-0">
                            {/* <img
                                src=""
                                className="rounded-lg border border-gray-300 dark:border-slate-600 w-40 h-40 object-cover bg-gray-200 dark:bg-slate-700"
                                alt="No Preview Available"
                            /> */}
                            <p className="text-gray-600 dark:text-slate-400 text-sm rounded-lg border border-gray-300 dark:border-slate-600 w-64 h-64 flex items-center justify-center">
                                No Preview Available
                            </p>
                        </div>
                        {/* Theme Palette */}
                        <div className="w-full md:w-1/2 flex flex-col justify-center">
                            <div className="grid grid-cols-4 gap-2">
                                {/* Color swatches go here */}
                                <div className="w-16 h-16 rounded-lg border border-gray-300 dark:border-slate-600"></div>
                                <div className="w-16 h-16 rounded-lg border border-gray-300 dark:border-slate-600"></div>
                                <div className="w-16 h-16 rounded-lg border border-gray-300 dark:border-slate-600"></div>
                                <div className="w-16 h-16 rounded-lg border border-gray-300 dark:border-slate-600"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Themes;
