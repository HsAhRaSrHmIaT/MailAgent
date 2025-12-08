import { Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { FiHome } from "react-icons/fi";
import { BiErrorCircle } from "react-icons/bi";

const PageNotFound = () => {
    const { currentColors, currentPalette } = useTheme();

    return (
        <div
            className="min-h-screen flex items-center justify-center transition-colors duration-300 px-4"
            style={{ backgroundColor: currentColors.bg }}
        >
            <div className="text-center max-w-2xl mx-auto">
                {/* Error Icon */}
                <div className="flex justify-center mb-8">
                    <div
                        className="p-6 rounded-full"
                        style={{
                            backgroundColor: `${currentPalette.primary}20`,
                        }}
                    >
                        <BiErrorCircle
                            size={80}
                            style={{ color: currentPalette.primary }}
                        />
                    </div>
                </div>

                {/* 404 Text */}
                <h1
                    className="text-8xl md:text-9xl font-bold mb-4"
                    style={{ color: currentColors.text }}
                >
                    404
                </h1>

                {/* Message */}
                <h2
                    className="text-2xl md:text-3xl font-semibold mb-4"
                    style={{ color: currentColors.text }}
                >
                    Page Not Found
                </h2>
                <p
                    className="text-lg mb-8"
                    style={{ color: currentColors.textSecondary }}
                >
                    Oops! The page you're looking for doesn't exist or has been
                    moved.
                </p>

                {/* Home Button */}
                <Link to="/">
                    <button
                        className="group flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 mx-auto hover:scale-105 cursor-pointer"
                        style={{
                            backgroundColor: currentPalette.primary,
                            color: "#FFFFFF",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = "0.9";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = "1";
                        }}
                    >
                        <FiHome size={24} />
                        <span>Back to Home</span>
                    </button>
                </Link>
            </div>
        </div>
    );
};

export default PageNotFound;
