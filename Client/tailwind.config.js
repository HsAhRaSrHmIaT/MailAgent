/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                primary: "var(--color-primary)",
                bg: "var(--color-bg)",
                surface: "var(--color-surface)",
                border: "var(--color-border)",
                text: {
                    DEFAULT: "var(--color-text)",
                    secondary: "var(--color-text-secondary)",
                },
            },
        },
    },
    plugins: [],
};
