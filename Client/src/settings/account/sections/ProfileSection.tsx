import { Pencil, X, Loader2 } from "lucide-react";
import { useTheme } from "../../../contexts/ThemeContext";
import { useAuth } from "../../../contexts/AuthContext";
import { useState } from "react";
import { toast } from "react-toastify";
import { uploadAvatar } from "../../../services/authService";
import AvatarUpload from "./AvatarUpload";
import Avatar from "../../../components/auth/Avatar";

const ProfileSection = () => {
  const { currentColors, currentPalette } = useTheme();
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingAvatar, setPendingAvatar] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  //   const fileInputRef = useRef<HTMLInputElement>(null);

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
  };

  const handleFileSelect = (file: File) => {
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPEG, PNG, GIF, and WebP images are allowed");
      return;
    }

    setPendingAvatar(file);
    setPreviewUrl(URL.createObjectURL(file));
    setRemoveAvatar(false);
  };

  const handleRemoveAvatar = () => {
    setPendingAvatar(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setRemoveAvatar(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const updatedData: any = { ...formData }; /* eslint-disable-line */

      // Handle avatar upload if there's a pending file
      if (pendingAvatar) {
        const result = await uploadAvatar(pendingAvatar);
        if (!result.success) {
          toast.error(result.error || "Failed to upload profile picture");
          setIsLoading(false);
          return;
        }
        updatedData.profilePicture = result.profilePicture || "";
      } else if (removeAvatar) {
        updatedData.profilePicture = "";
      }

      await updateUser(updatedData);
      toast.success("Profile updated successfully!");

      // Cleanup
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      setPendingAvatar(null);
      setRemoveAvatar(false);
      setIsEditing(false);
    } catch (err) {
      toast.error(
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
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setPendingAvatar(null);
    setRemoveAvatar(false);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Profile Picture & Basic Info */}
      {!isEditing && (
        <div className="flex flex-col items-center gap-4">
          <Avatar
            name={user?.username}
            email={user?.email}
            size="xl"
            imageUrl={user?.profilePicture}
          />
          <div className="text-center">
            <h3 className="text-xl font-semibold">
              {user?.username || "User"}
            </h3>
            <p
              className="italic"
              style={{ color: currentColors.textSecondary }}
            >
              {user?.email}
            </p>
            <p
              className="text-xs mt-1"
              style={{ color: currentColors.textSecondary }}
            >
              Member since{" "}
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString()
                : "N/A"}
            </p>
            <p
              className="text-xs mt-1"
              style={{ color: currentColors.textSecondary }}
            >
              Last login:{" "}
              {user?.lastLogin
                ? new Date(user.lastLogin).toLocaleString()
                : "N/A"}
            </p>
          </div>
        </div>
      )}

      {/* Edit Profile Form */}
      {isEditing ? (
        <form
          onSubmit={handleSubmit}
          className="animate-in fade-in duration-300"
        >
          <div
            className="p-4 sm:p-6 rounded-xl border-2 space-y-4 sm:space-y-6 shadow-lg"
            style={{
              backgroundColor: `${currentColors.bg}`,
              borderColor: `${currentPalette.primary}30`,
              boxShadow: `0 4px 20px ${currentPalette.primary}10`,
            }}
          >
            {/* Header */}
            <div
              className="flex items-start sm:items-center justify-between pb-4 border-b gap-2"
              style={{ borderColor: currentColors.border }}
            >
              <div className="flex-1 min-w-0">
                <h4
                  className="font-bold text-lg sm:text-xl truncate"
                  style={{ color: currentPalette.primary }}
                >
                  Edit Profile
                </h4>
                <p
                  className="text-xs mt-1"
                  style={{ color: currentColors.textSecondary }}
                >
                  Update your personal information
                </p>
              </div>
              <button
                type="button"
                onClick={handleCancel}
                className="p-2 rounded-lg transition-all cursor-pointer hover:opacity-70 flex-shrink-0"
                style={{
                  backgroundColor: `${currentColors.surface}`,
                  color: currentColors.textSecondary,
                }}
                title="Close editor"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Avatar Upload Section */}
            <div
              className="bg-gradient-to-br from-transparent to-transparent p-3 sm:p-5 rounded-xl border"
              style={{
                borderColor: currentColors.border,
                backgroundColor: `${currentColors.surface}50`,
              }}
            >
              <AvatarUpload
                isEditing={isEditing}
                pendingAvatar={pendingAvatar}
                previewUrl={previewUrl}
                removeAvatar={removeAvatar}
                onFileSelect={handleFileSelect}
                onRemove={handleRemoveAvatar}
              />
            </div>

            {/* Username Field */}
            <div className="space-y-2">
              <label
                className="block text-sm font-semibold"
                style={{ color: currentColors.text }}
              >
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter username"
                className="w-full p-2 border rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-opacity-50 text-sm sm:text-base"
                style={{
                  backgroundColor: `${currentColors.surface}`,
                  borderColor: `${currentColors.border}`,
                  color: `${currentColors.text}`,
                }}
              />
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label
                className="block text-sm font-semibold"
                style={{ color: currentColors.text }}
              >
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email"
                className="w-full p-2 border rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-opacity-50 text-sm sm:text-base"
                style={{
                  backgroundColor: `${currentColors.surface}`,
                  borderColor: `${currentColors.border}`,
                  color: `${currentColors.text}`,
                }}
              />
            </div>

            {/* Action Buttons */}
            <div
              className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 sm:pt-6 border-t"
              style={{ borderColor: currentColors.border }}
            >
              <button
                type="button"
                onClick={handleCancel}
                disabled={isLoading}
                className="w-full sm:w-auto px-6 py-2.5 rounded-lg font-semibold cursor-pointer transition-all hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
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
                className="w-full sm:w-auto px-6 py-2.5 text-white rounded-lg font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                style={{
                  backgroundColor: `${currentPalette.primary}`,
                  boxShadow: `0 2px 8px ${currentPalette.primary}30`,
                }}
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-center">
            <button
              onClick={() => setIsEditing(true)}
              className="text-sm font-medium cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:opacity-80"
              style={{
                color: currentPalette.primary,
                backgroundColor: `${currentPalette.primary}10`,
                border: `1px solid ${currentPalette.primary}30`,
              }}
            >
              <Pencil size={14} />
              Edit Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSection;
