import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";
import CustomCheckbox from "../hooks/Checkbox";
import {
    FiMail,
    FiLock,
    FiEye,
    FiEyeOff,
    FiUser,
    FiUserPlus,
} from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";

const Register = () => {
    const { currentColors, currentPalette } = useTheme();
    const { register } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        username: "",
        password: "",
        confirmPassword: "",
        agreeTerms: false,
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

    const getPasswordStrength = (
        password: string,
    ): { score: number; text: string; color: string } => {
        let score = 0;
        if (password.length >= 8) score++;
        if (password.length >= 12) score++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
        if (/\d/.test(password)) score++;
        if (/[^a-zA-Z\d]/.test(password)) score++;

        if (score <= 2) return { score, text: "Weak", color: "#EF4444" };
        if (score <= 3) return { score, text: "Fair", color: "#F59E0B" };
        if (score <= 4) return { score, text: "Good", color: "#10B981" };
        return { score, text: "Strong", color: "#059669" };
    };

    const passwordStrength = getPasswordStrength(formData.password);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        // Validation
        if (
            !formData.email ||
            !formData.password ||
            !formData.confirmPassword
        ) {
            toast.error("Please fill in all required fields");
            setIsLoading(false);
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            toast.error("Please enter a valid email address");
            setIsLoading(false);
            return;
        }

        if (formData.password.length < 8) {
            toast.error("Password must be at least 8 characters long");
            setIsLoading(false);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            setIsLoading(false);
            return;
        }

        if (!formData.agreeTerms) {
            toast.error("Please agree to the terms and conditions");
            setIsLoading(false);
            return;
        }

        try {
            const response = await register({
                email: formData.email,
                username: formData.username || undefined,
                password: formData.password,
            });

            if (response.success) {
                if (response.requiresVerification) {
                    // Redirect to OTP verification page
                    toast.success(
                        "Registration successful! Please check your email for verification code.",
                    );
                    navigate("/verify-email", {
                        state: { email: formData.email },
                    });
                } else {
                    // Old flow (shouldn't happen with new implementation)
                    toast.success(
                        "Account created successfully! Welcome aboard.",
                    );
                    navigate("/email-form");
                }
            } else {
                toast.error(
                    response.error || "Registration failed. Please try again.",
                );
            }
        } catch (err) {
            toast.error(
                err instanceof Error ? err.message : "An error occurred",
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center transition-colors duration-300 px-4 py-12 select-none"
            style={{ backgroundColor: currentColors.bg }}
        >
            <div className="w-full max-w-md">
                {/* Register Form */}
                <div
                    className="p-8 rounded-2xl"
                    style={{
                        backgroundColor: currentColors.surface,
                        border: `1px solid ${currentColors.border}`,
                    }}
                >
                    {/* Header */}
                    <div className="flex mb-8 gap-4">
                        <div>
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
                                <FiUserPlus
                                    size={40}
                                    style={{ color: currentColors.text }}
                                />
                            </div>
                        </div>
                        <div>
                            <h1
                                className="text-3xl md:text-4xl font-bold mb-2"
                                style={{ color: currentColors.text }}
                            >
                                Create Account
                            </h1>
                            <p
                                className="text-base"
                                style={{ color: currentColors.textSecondary }}
                            >
                                Join MailAgent today
                            </p>
                        </div>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-5">
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
                                Email Address{" "}
                                <span style={{ color: "#EF4444" }}>*</span>
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

                        {/* Username Field */}
                        <div>
                            <label
                                htmlFor="username"
                                className="block text-sm font-medium mb-2"
                                style={{ color: currentColors.text }}
                            >
                                Username{" "}
                                <span
                                    className="text-xs"
                                    style={{
                                        color: currentColors.textSecondary,
                                    }}
                                >
                                    (optional)
                                </span>
                            </label>
                            <div className="relative">
                                <div
                                    className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                                    style={{
                                        color: currentColors.textSecondary,
                                    }}
                                >
                                    <FiUser size={20} />
                                </div>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={formData.username}
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
                                    placeholder="johndoe"
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
                                Password{" "}
                                <span style={{ color: "#EF4444" }}>*</span>
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
                            {/* Password Strength Indicator */}
                            {formData.password && (
                                <div className="mt-2">
                                    <div className="flex items-center justify-between mb-1">
                                        <span
                                            className="text-xs"
                                            style={{
                                                color: currentColors.textSecondary,
                                            }}
                                        >
                                            Password Strength:
                                        </span>
                                        <span
                                            className="text-xs font-semibold"
                                            style={{
                                                color: passwordStrength.color,
                                            }}
                                        >
                                            {passwordStrength.text}
                                        </span>
                                    </div>
                                    <div
                                        className="h-2 rounded-full"
                                        style={{
                                            backgroundColor:
                                                currentColors.border,
                                        }}
                                    >
                                        <div
                                            className="h-full rounded-full transition-all duration-300"
                                            style={{
                                                width: `${
                                                    (passwordStrength.score /
                                                        5) *
                                                    100
                                                }%`,
                                                backgroundColor:
                                                    passwordStrength.color,
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password Field */}
                        <div>
                            <label
                                htmlFor="confirmPassword"
                                className="block text-sm font-medium mb-2"
                                style={{ color: currentColors.text }}
                            >
                                Confirm Password{" "}
                                <span style={{ color: "#EF4444" }}>*</span>
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
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
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
                                        setShowConfirmPassword(
                                            !showConfirmPassword,
                                        )
                                    }
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    style={{
                                        color: currentColors.textSecondary,
                                    }}
                                >
                                    {showConfirmPassword ? (
                                        <FiEyeOff size={20} />
                                    ) : (
                                        <FiEye size={20} />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Terms Checkbox */}
                        <div className="flex items-start">
                            <CustomCheckbox
                                checked={formData.agreeTerms}
                                onChange={() =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        agreeTerms: !prev.agreeTerms,
                                    }))
                                }
                                label=""
                            />
                            <label
                                className="text-sm cursor-pointer"
                                style={{ color: currentColors.textSecondary }}
                            >
                                I agree to the{" "}
                                <Link
                                    to="/terms"
                                    className="font-medium transition-opacity hover:opacity-80"
                                    style={{ color: currentColors.text }}
                                >
                                    Terms & Conditions
                                </Link>{" "}
                                and{" "}
                                <Link
                                    to="/privacy"
                                    className="font-medium transition-opacity hover:opacity-80"
                                    style={{ color: currentColors.text }}
                                >
                                    Privacy Policy
                                </Link>
                            </label>
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
                            {isLoading
                                ? "Creating account..."
                                : "Create Account"}
                        </button>
                    </form>

                    {/* Login Link */}
                    <div className="mt-6 text-center">
                        <p
                            className="text-sm"
                            style={{ color: currentColors.textSecondary }}
                        >
                            Already have an account?{" "}
                            <Link
                                to="/login"
                                className="font-semibold transition-opacity hover:opacity-80"
                                style={{ color: currentColors.text }}
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Back to Home */}
                <div
                    className="mt-6 text-center border rounded-4xl p-3 w-fit mx-auto hover:opacity-80 transition-opacity duration-300 cursor-pointer"
                    style={{
                        borderColor: currentColors.border,
                        backgroundColor: currentColors.surface,
                    }}
                >
                    <Link
                        to="/"
                        className="text-sm font-medium"
                        style={{ color: currentColors.textSecondary }}
                    >
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
