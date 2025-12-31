import { useRef } from "react";
import { useTheme } from "../../../contexts/ThemeContext";
import { useAuth } from "../../../contexts/AuthContext";
import { Camera, X, ImageIcon } from "lucide-react";
import { GoFileDirectory as FileArchive } from "react-icons/go";
import Avatar from "../../../components/auth/Avatar";

interface AvatarUploadProps {
  isEditing?: boolean;
  pendingAvatar: File | null;
  previewUrl: string | null;
  removeAvatar: boolean;
  onFileSelect: (file: File) => void;
  onRemove: () => void;
}

const AvatarUpload = ({
  // isEditing = false,
  pendingAvatar,
  previewUrl,
  removeAvatar,
  onFileSelect,
  onRemove,
}: AvatarUploadProps) => {
  const { currentColors, currentPalette } = useTheme();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getCurrentAvatarUrl = () => {
    if (previewUrl) return previewUrl;
    if (removeAvatar) return undefined;
    return user?.profilePicture;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div className="flex justify-start items-start gap-4">
      <div className="relative group">
        <Avatar
          name={user?.username}
          email={user?.email}
          size="lg"
          imageUrl={getCurrentAvatarUrl()}
        />

        {/* Camera icon overlay */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="absolute -bottom-1 -right-1 p-1 rounded-full shadow-lg transition-all hover:scale-110 active:scale-95 cursor-pointer"
          style={{
            backgroundColor: currentPalette.primary,
            color: "white",
          }}
          title="Upload profile picture"
        >
          <Camera className="w-4 h-4" />
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {/* Remove button when there's an avatar */}
        {getCurrentAvatarUrl() && (
          <button
            type="button"
            onClick={onRemove}
            className="flex items-center gap-1 px-2 py-1 rounded-md shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer border border-transparent hover:border-red-500"
            style={{
              backgroundColor: currentColors.surface,
              color: currentColors.textSecondary,
            }}
            title="Remove profile picture"
          >
            <X className="w-4 h-4" />
            Remove
          </button>
        )}
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* File info and status */}
        <div className="text-center space-y-2">
          {pendingAvatar && (
            <div
              className="flex items-center gap-2 text-sm animate-in slide-in-from-top duration-300"
              style={{ color: currentColors.textSecondary }}
            >
              <div
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: currentPalette.primary }}
              />
              <span className="font-medium">New photo ready to upload</span>
            </div>
          )}

          {removeAvatar && (
            <div
              className="flex items-center gap-2 text-sm animate-in slide-in-from-top duration-300"
              style={{ color: "#EF4444" }}
            >
              <div className="w-2 h-2 rounded-full animate-pulse bg-red-500" />
              <span className="font-medium">Photo will be removed</span>
            </div>
          )}

          <p
            className="text-xs max-w-xs"
            style={{ color: currentColors.textSecondary }}
          >
            <FileArchive className="inline w-3 h-3 mr-1" />
            Max 5MB • <ImageIcon className="inline w-3 h-3 mr-1" />
            JPEG, PNG, GIF, WebP
          </p>
        </div>
      </div>
    </div>
  );
};

export default AvatarUpload;
