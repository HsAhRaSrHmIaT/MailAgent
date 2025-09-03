// Type definitions
export type ThemeMode = "light" | "dark";
export type PaletteKey =
    | "default"
    | "pink"
    | "purple"
    | "red"
    | "orange"
    | "green"
    | "yellow"
    | "blue"
    | "ultraDark";

export interface ColorScheme {
    bg: string;
    surface: string;
    border: string;
    text: string;
    textSecondary: string;
}

export interface ColorPalette {
    name: string;
    primary: string;
    light: ColorScheme;
    dark: ColorScheme;
}

export type ColorPalettes = Record<PaletteKey, ColorPalette>;

// Define color palettes
export const colorPalettes: ColorPalettes = {
    default: {
        name: "Default",
        primary: "#3B82F6", // blue-500
        light: {
            bg: "rgb(253, 255, 255)",
            surface: "#F3F4F6", // gray-100
            border: "#D1D5DB", // gray-300
            text: "#494a4aff", // gray-900
            textSecondary: "#6B7280", // gray-600
        },
        dark: {
            bg: "#1F2937", // gray-800
            surface: "#374151", // gray-700
            border: "#4B5563", // gray-600
            text: "#FFFFFF",
            textSecondary: "#9CA3AF", // gray-400
        },
    },
    pink: {
        name: "Pink",
        primary: "#EC4899", // pink-500
        light: {
            bg: "#FDF2F8", // pink-50
            surface: "#FCE7F3", // pink-100
            border: "#F9A8D4", // pink-300
            text: "#831843", // pink-900
            textSecondary: "#BE185D", // pink-700
        },
        dark: {
            bg: "#251525ff",
            surface: "#2D1B2E",
            border: "#EC4899",
            text: "#FFFFFF",
            textSecondary: "#F9A8D4",
        },
    },
    purple: {
        name: "Purple",
        primary: "#8B5CF6", // purple-500
        light: {
            bg: "#F5F3FF", // purple-50
            surface: "#EDE9FE", // purple-100
            border: "#C4B5FD", // purple-300
            text: "#4C1D95", // purple-900
            textSecondary: "#7C3AED", // purple-700
        },
        dark: {
            bg: "#1F1B2F",
            surface: "#2D1B3E",
            border: "#8B5CF6",
            text: "#FFFFFF",
            textSecondary: "#C4B5FD",
        },
    },
    red: {
        name: "Red",
        primary: "#EF4444", // red-500
        light: {
            bg: "#FEF2F2", // red-50
            surface: "#FEE2E2", // red-100
            border: "#FCA5A5", // red-300
            text: "#7F1D1D", // red-900
            textSecondary: "#B91C1C", // red-700
        },
        dark: {
            bg: "#1F1B1B",
            surface: "#2D1B1B",
            border: "#EF4444",
            text: "#FFFFFF",
            textSecondary: "#FCA5A5",
        },
    },
    orange: {
        name: "Orange",
        primary: "#F97316", // orange-500
        light: {
            bg: "#FFF7ED", // orange-50
            surface: "#FFEDD5", // orange-100
            border: "#FDBA74", // orange-300
            text: "#7C2D12", // orange-900
            textSecondary: "#C2410C", // orange-700
        },
        dark: {
            bg: "#1F1B17",
            surface: "#2D1F17",
            border: "#F97316",
            text: "#FFFFFF",
            textSecondary: "#FDBA74",
        },
    },
    green: {
        name: "Green",
        primary: "#10B981", // emerald-500
        light: {
            bg: "#ECFDF5", // emerald-50
            surface: "#D1FAE5", // emerald-100
            border: "#6EE7B7", // emerald-300
            text: "#064E3B", // emerald-900
            textSecondary: "#047857", // emerald-700
        },
        dark: {
            bg: "#1B1F1B",
            surface: "#1B2D1B",
            border: "#10B981",
            text: "#FFFFFF",
            textSecondary: "#6EE7B7",
        },
    },
    yellow: {
        name: "Yellow",
        primary: "#F59E0B", // amber-500
        light: {
            bg: "#FFFBEB", // amber-50
            surface: "#FEF3C7", // amber-100
            border: "#FCD34D", // amber-300
            text: "#78350F", // amber-900
            textSecondary: "#B45309", // amber-700
        },
        dark: {
            bg: "#1F1F1B",
            surface: "#2D2D1B",
            border: "#F59E0B",
            text: "#FFFFFF",
            textSecondary: "#FCD34D",
        },
    },
    blue: {
        name: "Blue",
        primary: "#3B82F6", // blue-500
        light: {
            bg: "#EFF6FF", // blue-50
            surface: "#DBEAFE", // blue-100
            border: "#93C5FD", // blue-300
            text: "#1E3A8A", // blue-900
            textSecondary: "#1D4ED8", // blue-700
        },
        dark: {
            bg: "#1B1F2F",
            surface: "#1B2D3F",
            border: "#3B82F6",
            text: "#FFFFFF",
            textSecondary: "#93C5FD",
        },
    },
    ultraDark: {
        name: "Ultra Dark",
        primary: "#111111",
        light: {
            bg: "#F8F9FA",
            surface: "#E9ECEF",
            border: "#DEE2E6",
            text: "#212529",
            textSecondary: "#6C757D",
        },
        dark: {
            bg: "#2c2c2c",
            surface: "#1a1a1a",
            border: "#404040",
            text: "#FFFFFF",
            textSecondary: "#CCCCCC",
        },
    },
};
