import { Pencil } from "lucide-react";
import { useTheme } from "../../../contexts/ThemeContext";
import { useAuth } from "../../../contexts/AuthContext";
import { useState } from "react";

const ProfileSection = () => {
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
        return (
            <div className="text-center py-8">
                <p style={{ color: currentColors.textSecondary }}>
                    Please log in to view your profile.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Error/Success Messages */}
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

            {success && (
                <div
                    className="p-4 rounded-lg text-sm"
                    style={{
                        backgroundColor: "#D1FAE5",
                        color: "#065F46",
                        border: "1px solid #6EE7B7",
                    }}
                >
                    {success}
                </div>
            )}

            {/* Profile Picture & Basic Info */}
            <div className="flex items-center gap-4">
                <div
                    className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                    style={{
                        background: `linear-gradient(135deg, ${currentPalette.primary}, ${currentPalette.primary}90)`,
                    }}
                >
                    {user.username?.[0]?.toUpperCase() ||
                        user.email[0].toUpperCase()}
                </div>
                <div>
                    <h3 className="text-xl font-semibold">
                        {user.username || "User"}
                    </h3>
                    <p
                        className="italic"
                        style={{ color: currentColors.textSecondary }}
                    >
                        {user.email}
                    </p>
                    <p
                        className="text-xs mt-1"
                        style={{ color: currentColors.textSecondary }}
                    >
                        Member since{" "}
                        {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString()
                            : "N/A"}
                    </p>
                </div>
            </div>

            {/* Edit Profile Form */}
            {isEditing ? (
                <form onSubmit={handleSubmit}>
                    <div
                        className="p-4 rounded-lg border space-y-4"
                        style={{
                            backgroundColor: `${currentColors.bg}`,
                            borderColor: `${currentColors.border}`,
                        }}
                    >
                        <h4 className="font-medium mb-3">Edit Profile</h4>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Username
                            </label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="Enter username"
                                className="w-full p-2 border rounded-lg"
                                style={{
                                    backgroundColor: `${currentColors.surface}`,
                                    borderColor: `${currentColors.border}`,
                                    color: `${currentColors.text}`,
                                }}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter email"
                                className="w-full p-2 border rounded-lg"
                                style={{
                                    backgroundColor: `${currentColors.surface}`,
                                    borderColor: `${currentColors.border}`,
                                    color: `${currentColors.text}`,
                                }}
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-4 py-2 rounded-lg font-medium cursor-pointer"
                                style={{
                                    backgroundColor: `${currentColors.surface}`,
                                    color: `${currentColors.text}`,
                                    border: `1px solid ${currentColors.border}`,
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-4 py-2 text-white rounded-lg font-medium cursor-pointer disabled:opacity-50"
                                style={{
                                    backgroundColor: `${currentPalette.primary}`,
                                }}
                            >
                                {isLoading ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </form>
            ) : (
                <div
                    className="p-4 rounded-lg border"
                    style={{
                        backgroundColor: `${currentColors.bg}`,
                        borderColor: `${currentColors.border}`,
                    }}
                >
                    <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium">Profile Information</h4>
                        <button
                            onClick={() => setIsEditing(true)}
                            className="text-sm font-medium hover:underline cursor-pointer flex items-center gap-1"
                            style={{ color: currentPalette.primary }}
                        >
                            <Pencil size={14} />
                            Edit
                        </button>
                    </div>
                    <div className="space-y-2">
                        <div>
                            <span
                                className="text-sm"
                                style={{ color: currentColors.textSecondary }}
                            >
                                Username:
                            </span>
                            <p className="font-medium">
                                {user.username || "Not set"}
                            </p>
                        </div>
                        <div>
                            <span
                                className="text-sm"
                                style={{ color: currentColors.textSecondary }}
                            >
                                Email:
                            </span>
                            <p className="font-medium">{user.email}</p>
                        </div>
                        <div>
                            <span
                                className="text-sm"
                                style={{ color: currentColors.textSecondary }}
                            >
                                Last Login:
                            </span>
                            <p className="font-medium">
                                {user.lastLogin
                                    ? new Date(user.lastLogin).toLocaleString()
                                    : "N/A"}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Password Change */}
            {/* <div
                className="p-4 rounded-lg border"
                style={{
                    backgroundColor: `${currentColors.bg}`,
                    borderColor: `${currentColors.border}`,
                }}
            >
                <h4 className="font-medium mb-3">Change Password</h4>
                <div className="space-y-3">
                    <div className="flex flex-col gap-3">
                        <input
                            type="password"
                            placeholder="Current password"
                            className="w-full p-2 border rounded-lg"
                            style={{
                                backgroundColor: `${currentColors.surface}`,
                                borderColor: `${currentColors.border}`,
                                color: `${currentColors.text}`,
                            }}
                        />
                        <input
                            type="password"
                            placeholder="New password"
                            className="w-full p-2 border rounded-lg"
                            style={{
                                backgroundColor: `${currentColors.surface}`,
                                borderColor: `${currentColors.border}`,
                                color: `${currentColors.text}`,
                            }}
                        />
                    </div>
                    <div className="flex justify-end">
                        <button
                            className="px-4 py-2 text-white rounded-lg font-medium cursor-pointer"
                            style={{
                                backgroundColor: `${currentPalette.primary}`,
                            }}
                        >
                            Update Password
                        </button>
                    </div>
                </div>
            </div> */}

            {/* Email Signature */}
            {/* <div className="space-y-2">
                <label className="block text-sm font-medium mb-2">
                    Default Email Signature
                </label>
                <textarea
                    className="w-full h-28 p-3 rounded-lg resize-none"
                    placeholder="Best regards,&#10;Your Name&#10;Your Title"
                    style={{
                        backgroundColor: `${currentColors.bg}`,
                        borderColor: `${currentColors.border}`,
                        color: `${currentColors.text}`,
                    }}
                    defaultValue={user.defaultSignature}
                />
            </div> */}
        </div>
    );
};

export default ProfileSection;
