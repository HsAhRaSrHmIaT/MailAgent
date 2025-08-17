import { useEffect } from "react";
import { useState } from "react";

import { RiMoonClearFill } from "react-icons/ri";
import { MdSunny } from "react-icons/md";

const ToggleTheme = () => {
    const [theme, setTheme] = useState(
        localStorage.getItem("theme") || "light"
    );

    // custom class
    const buttonClass =
        "relative z-10 flex justify-center items-center w-8 h-8 text-gray-600 dark:text-white cursor-pointer";

    useEffect(() => {
        localStorage.setItem("theme", theme);
        document.documentElement.classList.toggle("dark", theme === "dark");
    }, [theme]);

    const toggleTheme = () => {
        setTheme(theme === "light" ? "dark" : "light");
    };
    return (
        <div className="relative flex items-center bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 h-10 p-1 rounded-4xl shadow-md dark:shadow-gray-900/50">
            <div
                className={`absolute w-8 h-8 bg-white dark:bg-gray-600 dark:border dark:border-gray-400 rounded-full shadow-sm transition-transform duration-300 ease-in-out ${
                    theme === "dark" ? "translate-x-8" : "translate-x-0"
                }`}
            />
            <button onClick={toggleTheme} className={buttonClass}>
                <RiMoonClearFill />
            </button>
            <button onClick={toggleTheme} className={buttonClass}>
                <MdSunny />
            </button>
        </div>
    );
};

export default ToggleTheme;
