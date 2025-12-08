import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { FiMail, FiLock, FiEye, FiEyeOff, FiLogIn } from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";

const Login = () => {
    const { currentColors, currentPalette } = useTheme();
    const { login } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        rememberMe: false,
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
        setError("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        // Validation
        if (!formData.email || !formData.password) {
            setError("Please fill in all fields");
            setIsLoading(false);
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError("Please enter a valid email address");
            setIsLoading(false);
            return;
        }

        try {
            const response = await login(formData);

            if (response.success) {
                navigate("/email-form");
            } else {
                setError(response.error || "Login failed. Please try again.");
            }
        } catch (err) {
            setError("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center transition-colors duration-300 px-4 py-12"
            style={{ backgroundColor: currentColors.bg }}
        >
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div
                            className="p-4 rounded-2xl relative"
                            style={{
                                backgroundColor: `${currentPalette.primary}15`,
                            }}
                        >
                            <div
                                className="absolute -top-1 -right-1 p-1 rounded-full"
                                style={{
                                    backgroundColor: currentPalette.primary,
                                }}
                            >
                                <HiSparkles size={16} color="#FFFFFF" />
                            </div>
                            <FiLogIn
                                size={40}
                                style={{ color: currentPalette.primary }}
                            />
                        </div>
                    </div>
                    <h1
                        className="text-3xl md:text-4xl font-bold mb-2"
                        style={{ color: currentColors.text }}
                    >
                        Welcome Back
                    </h1>
                    <p
                        className="text-base"
                        style={{ color: currentColors.textSecondary }}
                    >
                        Sign in to continue to MailAgent
                    </p>
                </div>

                {/* Login Form */}
                <div
                    className="p-8 rounded-2xl"
                    style={{
                        backgroundColor: currentColors.surface,
                        border: `1px solid ${currentColors.border}`,
                    }}
                >
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Error Message */}
                        {error && (
                            <div
                                className="p-4 rounded-lg text-sm"
                                style={{
                                    backgroundColor: "#FEE2E2",
                                    color: "#991B1B",
                                    border: "1px solid #FCA5A5",
                                }}
                            >
                                {error}
                            </div>
                        )}

                        {/* Email Field */}
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium mb-2"
                                style={{ color: currentColors.text }}
                            >
                                Email Address
                            </label>
                            <div className="relative">
                                <div
                                    className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                                    style={{
                                        color: currentColors.textSecondary,
                                    }}
                                >
                                    <FiMail size={20} />
                                </div>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 rounded-lg transition-all duration-200 outline-none"
                                    style={{
                                        backgroundColor: currentColors.bg,
                                        border: `2px solid ${currentColors.border}`,
                                        color: currentColors.text,
                                    }}
                                    onFocus={(e) => {
                                        e.currentTarget.style.borderColor =
                                            currentPalette.primary;
                                    }}
                                    onBlur={(e) => {
                                        e.currentTarget.style.borderColor =
                                            currentColors.border;
                                    }}
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium mb-2"
                                style={{ color: currentColors.text }}
                            >
                                Password
                            </label>
                            <div className="relative">
                                <div
                                    className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                                    style={{
                                        color: currentColors.textSecondary,
                                    }}
                                >
                                    <FiLock size={20} />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-12 py-3 rounded-lg transition-all duration-200 outline-none"
                                    style={{
                                        backgroundColor: currentColors.bg,
                                        border: `2px solid ${currentColors.border}`,
                                        color: currentColors.text,
                                    }}
                                    onFocus={(e) => {
                                        e.currentTarget.style.borderColor =
                                            currentPalette.primary;
                                    }}
                                    onBlur={(e) => {
                                        e.currentTarget.style.borderColor =
                                            currentColors.border;
                                    }}
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    style={{
                                        color: currentColors.textSecondary,
                                    }}
                                >
                                    {showPassword ? (
                                        <FiEyeOff size={20} />
                                    ) : (
                                        <FiEye size={20} />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="rememberMe"
                                    checked={formData.rememberMe}
                                    onChange={handleChange}
                                    className="mr-2 cursor-pointer"
                                    style={{
                                        accentColor: currentPalette.primary,
                                    }}
                                />
                                <span
                                    className="text-sm"
                                    style={{
                                        color: currentColors.textSecondary,
                                    }}
                                >
                                    Remember me
                                </span>
                            </label>
                            <Link
                                to="/forgot-password"
                                className="text-sm font-medium transition-opacity hover:opacity-80"
                                style={{ color: currentPalette.primary }}
                            >
                                Forgot password?
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 rounded-lg font-semibold text-lg transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                                backgroundColor: currentPalette.primary,
                                color: "#FFFFFF",
                            }}
                            onMouseEnter={(e) => {
                                if (!isLoading) {
                                    e.currentTarget.style.opacity = "0.9";
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.opacity = "1";
                            }}
                        >
                            {isLoading ? "Signing in..." : "Sign In"}
                        </button>
                    </form>

                    {/* Register Link */}
                    <div className="mt-6 text-center">
                        <p
                            className="text-sm"
                            style={{ color: currentColors.textSecondary }}
                        >
                            Don't have an account?{" "}
                            <Link
                                to="/register"
                                className="font-semibold transition-opacity hover:opacity-80"
                                style={{ color: currentPalette.primary }}
                            >
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Back to Home */}
                <div className="mt-6 text-center">
                    <Link
                        to="/"
                        className="text-sm transition-opacity hover:opacity-80"
                        style={{ color: currentColors.textSecondary }}
                    >
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
