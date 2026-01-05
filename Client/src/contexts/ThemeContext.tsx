import React, { createContext, useContext, useEffect, useState } from "react";
import type { ThemeMode, PaletteKey } from "./themeTypes";
import { colorPalettes } from "./themeTypes";
import type { ThemeContextType } from "../types";

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    // Initialize theme from localStorage or system preference
    const getInitialTheme = (): ThemeMode => {
        const saved = localStorage.getItem("theme");
        if (saved === "light" || saved === "dark") {
            return saved;
        }
        // Check system preference
        return window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
    };

    // Initialize palette from localStorage
    const getInitialPalette = (): PaletteKey => {
        const saved = localStorage.getItem("colorPalette");
        if (saved && Object.keys(colorPalettes).includes(saved)) {
            return saved as PaletteKey;
        }
        return "default";
    };

    const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);
    const [colorPalette, setColorPalette] =
        useState<PaletteKey>(getInitialPalette);

    const currentPalette = colorPalettes[colorPalette];
    const currentColors =
        theme === "dark" ? currentPalette.dark : currentPalette.light;

    useEffect(() => {
        // Apply CSS custom properties
        const root: HTMLElement = document.documentElement;
        root.style.setProperty("--color-primary", currentPalette.primary);
        root.style.setProperty("--color-bg", currentColors.bg);
        root.style.setProperty("--color-surface", currentColors.surface);
        root.style.setProperty("--color-border", currentColors.border);
        root.style.setProperty("--color-text", currentColors.text);
        root.style.setProperty("--color-text-secondary", currentColors.textSecondary);
        root.style.setProperty("--color-hover-bg", currentColors.hoverBg);
        root.style.setProperty(
            "--color-text-secondary",
            currentColors.textSecondary
        );

        // Store theme in class
        document.documentElement.classList.toggle("dark", theme === "dark");

        // Persist to localStorage
        localStorage.setItem("theme", theme);
        localStorage.setItem("colorPalette", colorPalette);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [theme, colorPalette]); // Only depend on the state values, not computed values

    // Listen for system theme changes
    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = (e: MediaQueryListEvent) => {
            // Only update if no manual preference is saved
            if (!localStorage.getItem("theme")) {
                setTheme(e.matches ? "dark" : "light");
            }
        };

        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, []);

    const toggleTheme = () => {
        setTheme((prev) => (prev === "light" ? "dark" : "light"));
    };

    const resetToDefault = () => {
        setTheme("light");
        setColorPalette("default");
    };

    const value: ThemeContextType = {
        theme,
        colorPalette,
        currentColors,
        currentPalette,
        setTheme,
        setColorPalette,
        toggleTheme,
        resetToDefault,
    };

    return (
        <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
};
