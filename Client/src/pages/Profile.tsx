import { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { FiUser, FiMail, FiEdit3, FiSave, FiX } from "react-icons/fi";
import { Link } from "react-router-dom";

const Profile = () => {
    const { currentColors, currentPalette } = useTheme();
    const { user, updateUser } = useAuth();

    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [formData, setFormData] = useState({
        username: user?.username || "",
        email: user?.email || "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        setError("");
        setSuccess("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setIsLoading(true);

        try {
            await updateUser(formData);
            setSuccess("Profile updated successfully!");
            setIsEditing(false);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to update profile"
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            username: user?.username || "",
            email: user?.email || "",
        });
        setIsEditing(false);
        setError("");
        setSuccess("");
    };

    if (!user) {
        return null;
    }

    return (
        <div
            className="min-h-screen transition-colors duration-300 px-4 py-12"
            style={{ backgroundColor: currentColors.bg }}
        >
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        to="/settings"
                        className="text-sm mb-4 inline-block transition-opacity hover:opacity-80"
                        style={{ color: currentColors.textSecondary }}
                    >
                        ← Back to Settings
                    </Link>
                    <h1
                        className="text-3xl md:text-4xl font-bold"
                        style={{ color: currentColors.text }}
                    >
                        My Profile
                    </h1>
                    <p
                        className="text-base mt-2"
                        style={{ color: currentColors.textSecondary }}
                    >
                        Manage your account information
                    </p>
                </div>

                {/* Profile Card */}
                <div
                    className="p-8 rounded-2xl"
                    style={{
                        backgroundColor: currentColors.surface,
                        border: `1px solid ${currentColors.border}`,
                    }}
                >
                    {/* Avatar Section */}
                    <div
                        className="flex items-center gap-6 mb-8 pb-8"
                        style={{
                            borderBottom: `1px solid ${currentColors.border}`,
                        }}
                    >
                        <div
                            className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold"
                            style={{
                                backgroundColor: `${currentPalette.primary}20`,
                                color: currentPalette.primary,
                            }}
                        >
                            {user.username?.[0]?.toUpperCase() ||
                                user.email[0].toUpperCase()}
                        </div>
                        <div>
                            <h2
                                className="text-2xl font-semibold mb-1"
                                style={{ color: currentColors.text }}
                            >
                                {user.username || "User"}
                            </h2>
                            <p
                                className="text-sm"
                                style={{ color: currentColors.textSecondary }}
                            >
                                {user.email}
                            </p>
                            <p
                                className="text-xs mt-2"
                                style={{ color: currentColors.textSecondary }}
                            >
                                Member since{" "}
                                {user.createdAt
                                    ? new Date(
                                          user.createdAt
                                      ).toLocaleDateString()
                                    : "N/A"}
                            </p>
                        </div>
                    </div>

                    {/* Messages */}
                    {error && (
                        <div
                            className="p-4 rounded-lg text-sm mb-6"
                            style={{
                                backgroundColor: "#FEE2E2",
                                color: "#991B1B",
                                border: "1px solid #FCA5A5",
                            }}
                        >
                            {error}
                        </div>
                    )}

                    {success && (
                        <div
                            className="p-4 rounded-lg text-sm mb-6"
                            style={{
                                backgroundColor: "#D1FAE5",
                                color: "#065F46",
                                border: "1px solid #6EE7B7",
                            }}
                        >
                            {success}
                        </div>
                    )}

                    {/* Profile Form */}
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-6">
                            {/* Username Field */}
                            <div>
                                <label
                                    htmlFor="username"
                                    className="block text-sm font-medium mb-2"
                                    style={{ color: currentColors.text }}
                                >
                                    Username
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
                                        disabled={!isEditing}
                                        className="w-full pl-10 pr-4 py-3 rounded-lg transition-all duration-200 outline-none"
                                        style={{
                                            backgroundColor: isEditing
                                                ? currentColors.bg
                                                : currentColors.surface,
                                            border: `2px solid ${currentColors.border}`,
                                            color: currentColors.text,
                                            cursor: isEditing
                                                ? "text"
                                                : "not-allowed",
                                        }}
                                        placeholder="Enter username"
                                    />
                                </div>
                            </div>

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
                                        disabled={!isEditing}
                                        className="w-full pl-10 pr-4 py-3 rounded-lg transition-all duration-200 outline-none"
                                        style={{
                                            backgroundColor: isEditing
                                                ? currentColors.bg
                                                : currentColors.surface,
                                            border: `2px solid ${currentColors.border}`,
                                            color: currentColors.text,
                                            cursor: isEditing
                                                ? "text"
                                                : "not-allowed",
                                        }}
                                        placeholder="you@example.com"
                                    />
                                </div>
                            </div>

                            {/* Last Login */}
                            <div>
                                <label
                                    className="block text-sm font-medium mb-2"
                                    style={{ color: currentColors.text }}
                                >
                                    Last Login
                                </label>
                                <p
                                    className="text-sm"
                                    style={{
                                        color: currentColors.textSecondary,
                                    }}
                                >
                                    {user.lastLogin
                                        ? new Date(
                                              user.lastLogin
                                          ).toLocaleString()
                                        : "N/A"}
                                </p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div
                            className="flex gap-4 mt-8 pt-6"
                            style={{
                                borderTop: `1px solid ${currentColors.border}`,
                            }}
                        >
                            {!isEditing ? (
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105"
                                    style={{
                                        backgroundColor: currentPalette.primary,
                                        color: "#FFFFFF",
                                    }}
                                >
                                    <FiEdit3 size={20} />
                                    Edit Profile
                                </button>
                            ) : (
                                <>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                        style={{
                                            backgroundColor:
                                                currentPalette.primary,
                                            color: "#FFFFFF",
                                        }}
                                    >
                                        <FiSave size={20} />
                                        {isLoading
                                            ? "Saving..."
                                            : "Save Changes"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        disabled={isLoading}
                                        className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105"
                                        style={{
                                            backgroundColor: currentColors.bg,
                                            color: currentColors.text,
                                            border: `2px solid ${currentColors.border}`,
                                        }}
                                    >
                                        <FiX size={20} />
                                        Cancel
                                    </button>
                                </>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
