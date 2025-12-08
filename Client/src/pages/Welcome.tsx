import { Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { HiSparkles } from "react-icons/hi2";
import { BsRocket } from "react-icons/bs";

const Welcome = () => {
    const { currentColors, currentPalette } = useTheme();

    return (
        <div
            className="min-h-screen flex items-center justify-center transition-colors duration-300 px-4 py-12"
            style={{ backgroundColor: currentColors.bg }}
        >
            <div className="max-w-6xl mx-auto w-full">
                {/* Hero Section */}
                <div className="text-center mb-16">
                    {/* Logo/Icon */}
                    <div className="flex justify-center mb-8">
                        <div
                            className="p-8 rounded-3xl relative"
                            style={{
                                backgroundColor: `${currentPalette.primary}15`,
                            }}
                        >
                            <div
                                className="absolute -top-2 -right-2 p-2 rounded-full animate-bounce"
                                style={{
                                    backgroundColor: currentPalette.primary,
                                }}
                            >
                                <HiSparkles size={24} color="#FFFFFF" />
                            </div>
                            <BsRocket
                                size={80}
                                style={{ color: currentPalette.primary }}
                            />
                        </div>
                    </div>

                    {/* Main Heading */}
                    <h1
                        className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-current to-current bg-clip-text"
                        style={{ color: currentColors.text }}
                    >
                        Welcome to MailAgent
                    </h1>

                    {/* Subheading */}
                    <p
                        className="text-xl md:text-2xl mb-4"
                        style={{ color: currentColors.textSecondary }}
                    >
                        Your AI-Powered Email Assistant
                    </p>
                    <p
                        className="text-lg max-w-2xl mx-auto"
                        style={{ color: currentColors.textSecondary }}
                    >
                        Revolutionize your email workflow with intelligent
                        automation, natural language processing, and seamless
                        communication.
                    </p>

                    {/* Get Started Button */}
                    <Link to="/email-form">
                        <button
                            className="group mt-10 flex items-center gap-4 px-10 py-5 rounded-2xl font-bold text-xl transition-all duration-300 mx-auto hover:scale-102 hover:shadow-lg"
                            style={{
                                backgroundColor: currentPalette.primary,
                                color: "#FFFFFF",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform =
                                    "scale(1.05) translateY(-2px)";
                                e.currentTarget.style.boxShadow = `0 20px 60px ${currentPalette.primary}40`;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "scale(1)";
                                e.currentTarget.style.boxShadow = "none";
                            }}
                        >
                            <span>Get Started</span>
                            <BsRocket
                                size={24}
                                className="group-hover:translate-x-1 transition-transform"
                            />
                        </button>
                    </Link>
                </div>
                {/* Copyright */}
                <div className="text-center mt-20">
                    <p
                        className="text-sm"
                        style={{ color: currentColors.textSecondary }}
                    >
                        &copy; {new Date().getFullYear()} MailAgent. All rights
                        reserved.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Welcome;
