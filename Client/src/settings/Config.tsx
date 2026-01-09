import { useState, useEffect, useRef } from "react";
import { SlWrench, SlPlus, SlTrash, SlSettings } from "react-icons/sl";
import { Lightbulb, Save, Maximize2, Eye, EyeOff } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import VideoPlayer from "../components/VideoPlayer";
import { useAuth } from "../contexts/AuthContext";
import { apiService } from "../services/apiService";
import { toast } from "react-toastify";

interface EmailConfig {
  email: string;
  password: string;
}

const Config = () => {
  const { user, refreshEmailConfigs } = useAuth();
  const { currentColors, currentPalette } = useTheme();
  const MAX_EMAILS = 4;
  const PLACEHOLDER_PASSWORD = "your-app-password";
  const DEFAULT_EMAIL = user?.email || "";

  const [emailConfigs, setEmailConfigs] = useState<EmailConfig[]>([
    { email: DEFAULT_EMAIL, password: "" },
  ]);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const hasLoadedRef = useRef(false);
  const [savedConfigs, setSavedConfigs] = useState<EmailConfig[]>([
    { email: DEFAULT_EMAIL, password: "" },
  ]);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [showPasswords, setShowPasswords] = useState<{
    [key: number]: boolean;
  }>({});
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
  const [deletedIndex, setDeletedIndex] = useState<number | null>(null);

  // Fetch email configs on component mount
  useEffect(() => {
    // Only load once
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    const loadEmailConfigs = async () => {
      await fetchEmailConfigs();
    };
    loadEmailConfigs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchEmailConfigs = async () => {
    try {
      setIsLoading(true);
      toast.dismiss();
      const response = await apiService.getEmailConfigs();

      if (response && response.length > 0) {
        setSavedConfigs(response);
      } else {
        // No configs in DB, set default
        setSavedConfigs([{ email: DEFAULT_EMAIL, password: "" }]);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to load email configurations";
      console.error("Failed to fetch email configurations:", err);
      toast.error(errorMessage);
      // Set default on error
      setSavedConfigs([{ email: DEFAULT_EMAIL, password: "" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const addEmailConfig = () => {
    if (emailConfigs.length < MAX_EMAILS) {
      setEmailConfigs([...emailConfigs, { email: "", password: "" }]);
    } else {
      // UX feedback
      toast.warning(`You can only add up to ${MAX_EMAILS} email accounts.`);
    }
  };

  const removeEmailConfig = (index: number) => {
    setEmailConfigs(emailConfigs.filter((_, i) => i !== index));
  };

  const removeSavedConfig = async (index: number) => {
    const toRemove = savedConfigs[index];
    if (!toRemove) return;
    if (toRemove.email === DEFAULT_EMAIL) {
      toast.warning("Default email cannot be removed.");
      return;
    }
    if (!window.confirm(`Remove ${toRemove.email}?`)) return;

    try {
      setDeletingIndex(index);
      await apiService.deleteEmailConfig(toRemove.email);

      // Remove from local state instead of fetching
      setSavedConfigs(savedConfigs.filter((_, i) => i !== index));

      // Show success checkmark
      setDeletingIndex(null);
      setDeletedIndex(index);

      // Refresh email configs in AuthContext
      await refreshEmailConfigs();

      toast.success(
        `Email configuration for ${toRemove.email} removed successfully`
      );

      // Clear checkmark after 2 seconds
      setTimeout(() => {
        setDeletedIndex(null);
      }, 2000);
    } catch (err) {
      setDeletingIndex(null);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to delete email configuration";
      console.error("Failed to delete email configuration:", err);
      toast.error(errorMessage);
    }
  };

  const updateEmailConfig = (
    index: number,
    field: keyof EmailConfig,
    value: string
  ) => {
    const updatedConfigs = emailConfigs.map((config, i) =>
      i === index ? { ...config, [field]: value } : config
    );
    setEmailConfigs(updatedConfigs);
  };

  const startEditing = () => {
    const defaultEntry = savedConfigs.find((c) => c.email === DEFAULT_EMAIL);
    const others = savedConfigs.filter((c) => c.email !== DEFAULT_EMAIL);
    setEmailConfigs([
      { email: DEFAULT_EMAIL, password: defaultEntry?.password || "" },
      ...others,
    ]);
    setIsEditing(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    toast.dismiss();

    try {
      // Save all configs with valid emails (password optional)
      const configsToSave = emailConfigs.filter((c) => c.email.trim());

      if (configsToSave.length === 0) {
        toast.warning("Please provide at least one email address");
        setIsSaving(false);
        return;
      }

      // Save each configuration (password can be empty)
      const savePromises = configsToSave.map((config) =>
        apiService.saveEmailConfig(config.email, config.password || "")
      );

      await Promise.all(savePromises);

      // Refresh the list from server
      await fetchEmailConfigs();

      // Refresh email configs in AuthContext
      await refreshEmailConfigs();

      setIsEditing(false);
      toast.success("Email configurations saved successfully");
      console.log("Email configurations saved successfully");
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to save email configurations";
      console.error("Failed to save email configurations:", err);
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    const defaultEntry = savedConfigs.find((c) => c.email === DEFAULT_EMAIL);
    const others = savedConfigs.filter((c) => c.email !== DEFAULT_EMAIL);
    setEmailConfigs([
      { email: DEFAULT_EMAIL, password: defaultEntry?.password || "" },
      ...others,
    ]);
    setIsEditing(false);
    toast.dismiss();
  };

  const togglePasswordVisibility = (index: number) => {
    setShowPasswords((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const maskPassword = (password: string) => {
    if (!password) return PLACEHOLDER_PASSWORD;
    if (password.length <= 8) return "•".repeat(password.length);
    return (
      "•".repeat(Math.max(4, password.length - 4)) +
      password.substring(password.length - 4)
    );
  };

  return (
    <div>
      <div className="max-w-6xl mx-auto select-none">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div
              className="p-2 sm:p-3 rounded-xl"
              style={{
                backgroundColor: `${currentPalette.primary}50`,
              }}
            >
              <span
                className="text-md font-mono font-bold"
                style={{ color: currentColors.text }}
              >
                <SlWrench size={24} />
              </span>
            </div>
            <div>
              <h1
                className="text-2xl sm:text-4xl font-bold"
                style={{ color: currentColors.text }}
              >
                Email Configurations
              </h1>
              <p
                className="text-base sm:text-lg mt-1"
                style={{ color: currentColors.textSecondary }}
              >
                Configure your emails and passwords securely and efficiently
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-6">
          {/* Loading State */}
          {isLoading && !isEditing ? (
            <div className="flex-2">
              <div
                className="rounded-xl border shadow-lg p-12 text-center"
                style={{ borderColor: currentColors.border }}
              >
                <div
                  className="w-12 h-12 border-4 rounded-full animate-spin mx-auto mb-4"
                  style={{
                    borderColor: currentPalette.primary,
                    borderTopColor: `${currentPalette.primary}20`,
                  }}
                ></div>
                <p
                  style={{
                    color: currentColors.textSecondary,
                  }}
                >
                  Loading email configurations...
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Main Content */}
              <div className="flex-2">
                {isEditing ? (
                  <div
                    className="rounded-xl border shadow-lg"
                    style={{
                      borderColor: currentColors.border,
                      minHeight: "500px",
                    }}
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-center mb-6">
                        <h2
                          className="text-xl font-semibold"
                          style={{
                            color: currentColors.text,
                          }}
                        >
                          Edit Email Configurations
                        </h2>
                      </div>

                      <div className="space-y-4">
                        {emailConfigs.map((config, index) => (
                          <div
                            key={index}
                            className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg border"
                            style={{
                              backgroundColor: currentColors.bg,
                              borderColor: currentColors.border,
                            }}
                          >
                            {/* Email Field */}
                            <div className="flex-1">
                              <label
                                className="block text-sm font-medium mb-2"
                                style={{
                                  color: currentColors.text,
                                }}
                              >
                                Email Address
                              </label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="email"
                                  value={config.email}
                                  onChange={(e) =>
                                    updateEmailConfig(
                                      index,
                                      "email",
                                      e.target.value
                                    )
                                  }
                                  disabled={index === 0}
                                  className={`flex-1 px-3 py-2.5 border rounded-lg text-sm ${
                                    index === 0
                                      ? "opacity-60 cursor-not-allowed"
                                      : ""
                                  }`}
                                  style={{
                                    backgroundColor: currentColors.surface,
                                    borderColor: currentColors.border,
                                    color: currentColors.text,
                                  }}
                                  placeholder={
                                    index === 0
                                      ? "Default email (not editable)"
                                      : "Enter email address"
                                  }
                                />
                                {index === 0 && (
                                  <span
                                    className="text-xs px-2 py-1 rounded whitespace-nowrap"
                                    style={{
                                      backgroundColor: `${currentPalette.primary}20`,
                                      color: currentPalette.primary,
                                    }}
                                  >
                                    Primary
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Password Field with Actions */}
                            <div className="flex-1">
                              <label
                                className="block text-sm font-medium mb-2"
                                style={{
                                  color: currentColors.text,
                                }}
                              >
                                App Password
                              </label>
                              <div className="flex items-center gap-2">
                                <input
                                  type={"text"}
                                  value={config.password}
                                  onChange={(e) =>
                                    updateEmailConfig(
                                      index,
                                      "password",
                                      e.target.value
                                    )
                                  }
                                  className="flex-1 px-3 py-2.5 border rounded-lg text-sm"
                                  style={{
                                    backgroundColor: currentColors.surface,
                                    borderColor: currentColors.border,
                                    color: currentColors.text,
                                  }}
                                  placeholder={
                                    index === 0
                                      ? "Add or update app password"
                                      : "Enter app password"
                                  }
                                />

                                {index !== 0 && (
                                  <button
                                    onClick={() => {
                                      if (
                                        !window.confirm(
                                          "Remove this email configuration?"
                                        )
                                      )
                                        return;
                                      removeEmailConfig(index);
                                    }}
                                    className="p-2.5 transition-all cursor-pointer border rounded-lg"
                                    style={{
                                      backgroundColor: currentColors.surface,
                                      borderColor: currentColors.border,
                                      color: "#ef4444",
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.backgroundColor =
                                        currentPalette.primary + "15";
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor =
                                        currentColors.surface;
                                    }}
                                    title="Remove configuration"
                                  >
                                    <SlTrash size={16} />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {emailConfigs.length < MAX_EMAILS ? (
                        <div>
                          <button
                            onClick={addEmailConfig}
                            className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
                            style={{
                              backgroundColor: currentPalette.primary,
                              color: "white",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = `${currentPalette.primary}cc`;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor =
                                currentPalette.primary;
                            }}
                          >
                            <SlPlus size={16} />
                            Add Email Account
                          </button>
                          <div
                            className="mt-6 text-sm"
                            style={{
                              color: currentColors.textSecondary,
                            }}
                          >
                            Slots remaining: {MAX_EMAILS - emailConfigs.length}
                          </div>
                        </div>
                      ) : (
                        <div
                          className="mt-6 text-sm"
                          style={{
                            color: currentColors.textSecondary,
                          }}
                        >
                          Maximum of {MAX_EMAILS} accounts reached.
                        </div>
                      )}

                      <div
                        className="flex justify-end gap-3 pt-6 border-t"
                        style={{
                          borderColor: currentColors.border,
                        }}
                      >
                        <button
                          onClick={handleCancel}
                          className="px-6 py-3 border rounded-lg hover:shadow-md transition-colors cursor-pointer"
                          style={{
                            borderColor: currentColors.border,
                            color: currentColors.text,
                            backgroundColor: currentColors.surface,
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSave}
                          className="inline-flex items-center gap-2 px-8 py-3 text-white font-medium rounded-lg transition-colors shadow-lg cursor-pointer hover:opacity-90 active:scale-95"
                          style={{
                            backgroundColor: currentPalette.primary,
                          }}
                        >
                          {isSaving ? (
                            <span className="animate-spin">
                              <div className="w-5 h-5 border-2 border-white-500 border-t-transparent rounded-full animate-spin"></div>
                            </span>
                          ) : (
                            <Save className="w-5 h-5" />
                          )}
                          <span>{isSaving ? "Saving..." : "Save Configs"}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    className="rounded-xl border shadow-lg"
                    style={{
                      borderColor: currentColors.border,
                    }}
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-center mb-6">
                        <h2
                          className="text-xl font-semibold"
                          style={{
                            color: currentColors.text,
                          }}
                        >
                          Saved Email Configurations ({savedConfigs.length})
                        </h2>
                      </div>

                      <div className="space-y-3">
                        {savedConfigs.length > 0 ? (
                          savedConfigs.map((config, index) => (
                            <div
                              key={index}
                              className="rounded-lg border p-4 transition-colors"
                              style={{
                                borderColor: currentColors.border,
                                backgroundColor: currentColors.surface,
                              }}
                            >
                              <div className="flex flex-col sm:flex-row gap-4">
                                {/* Email Field */}
                                <div className="flex-1">
                                  <div
                                    className="text-sm font-medium mb-2"
                                    style={{
                                      color: currentColors.textSecondary,
                                    }}
                                  >
                                    Email Address
                                  </div>
                                  <div
                                    className="px-3 py-2.5 rounded-lg border font-mono text-sm"
                                    style={{
                                      backgroundColor: currentColors.bg,
                                      borderColor: currentColors.border,
                                      color: currentColors.text,
                                    }}
                                  >
                                    {config.email}
                                  </div>
                                </div>

                                {/* Password Field with Actions */}
                                <div className="flex-1">
                                  <div
                                    className="text-sm font-medium mb-2"
                                    style={{
                                      color: currentColors.textSecondary,
                                    }}
                                  >
                                    App Password
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="px-3 py-2.5 rounded-lg border font-mono text-sm flex-1"
                                      style={{
                                        backgroundColor: currentColors.bg,
                                        borderColor: currentColors.border,
                                        color: config.password
                                          ? currentColors.text
                                          : currentColors.textSecondary,
                                        fontStyle: config.password
                                          ? "normal"
                                          : "italic",
                                      }}
                                    >
                                      {config.password
                                        ? showPasswords[index]
                                          ? config.password
                                          : maskPassword(config.password)
                                        : PLACEHOLDER_PASSWORD}
                                    </div>

                                    {/* Action Buttons Group */}
                                    <div
                                      className="flex items-center rounded-lg border overflow-hidden"
                                      style={{
                                        borderColor: currentColors.border,
                                      }}
                                    >
                                      {config.password && (
                                        <button
                                          onClick={() =>
                                            togglePasswordVisibility(index)
                                          }
                                          className="p-2.5 transition-all cursor-pointer"
                                          style={{
                                            backgroundColor: currentColors.bg,
                                            borderColor: currentColors.border,
                                            color: currentColors.textSecondary,
                                          }}
                                          onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = `${currentPalette.primary}15`;
                                            e.currentTarget.style.color =
                                              currentPalette.primary;
                                          }}
                                          onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor =
                                              currentColors.bg;
                                            e.currentTarget.style.color =
                                              currentColors.textSecondary;
                                          }}
                                          title={
                                            showPasswords[index]
                                              ? "Hide password"
                                              : "Show password"
                                          }
                                        >
                                          {showPasswords[index] ? (
                                            <EyeOff className="w-4 h-4" />
                                          ) : (
                                            <Eye className="w-4 h-4" />
                                          )}
                                        </button>
                                      )}
                                      {config.email !== DEFAULT_EMAIL && (
                                        <button
                                          onClick={() =>
                                            removeSavedConfig(index)
                                          }
                                          disabled={
                                            deletingIndex === index ||
                                            deletedIndex === index
                                          }
                                          className={`p-2.5 transition-all cursor-pointer ${
                                            config.password ? "border-l" : ""
                                          }`}
                                          style={{
                                            backgroundColor: currentColors.bg,
                                            borderColor: currentColors.border,
                                            color: "#ef4444",
                                            opacity:
                                              deletingIndex === index ? 0.6 : 1,
                                          }}
                                          onMouseEnter={(e) => {
                                            if (
                                              deletingIndex !== index &&
                                              deletedIndex !== index
                                            ) {
                                              e.currentTarget.style.backgroundColor =
                                                currentPalette.primary + "15";
                                            }
                                          }}
                                          onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor =
                                              currentColors.bg;
                                          }}
                                          title="Remove configuration"
                                        >
                                          {deletingIndex === index ? (
                                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                          ) : (
                                            <SlTrash size={16} />
                                          )}
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div
                            className="text-center py-12"
                            style={{
                              color: currentColors.textSecondary,
                            }}
                          >
                            No email configurations saved yet. Click "Edit
                            Configurations" to add your first email account.
                          </div>
                        )}
                      </div>
                      <div
                        className="flex justify-end gap-3 pt-6 border-t mt-6"
                        style={{
                          borderColor: currentColors.border,
                        }}
                      >
                        <button
                          onClick={startEditing}
                          className="inline-flex items-center gap-2 px-6 py-3 text-white font-medium rounded-lg transition-colors cursor-pointer hover:opacity-90 active:scale-95 shadow-lg"
                          style={{
                            backgroundColor: currentPalette.primary,
                          }}
                        >
                          <SlSettings className="w-5 h-5" />
                          Edit Configs
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Info Section */}
              <div className="flex-1">
                <div
                  className="rounded-xl border shadow-lg p-6 sticky top-6"
                  style={{
                    borderColor: currentColors.border,
                  }}
                >
                  <h3
                    className="flex items-center gap-2 text-lg font-semibold mb-4"
                    style={{
                      color: currentColors.text,
                    }}
                  >
                    <Lightbulb className="w-6 h-6" />
                    {isEditing ? "Editing Guidelines" : "Information"}
                  </h3>

                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5">•</span>
                        <span>
                          The default email is <strong>read-only</strong> and
                          cannot be changed
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5">•</span>
                        <span>
                          You can add up to {MAX_EMAILS} email accounts total
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5">•</span>
                        <span>
                          Use app-specific passwords for better security
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5">•</span>
                        <span>
                          Keep your passwords secure and never share them
                        </span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <span className="mt-0.5">•</span>
                          <span>
                            Add up to 4 email accounts for sending emails
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="mt-0.5">•</span>
                          <span>
                            Remove unused accounts to keep your configuration
                            clean
                          </span>
                        </div>

                        <div className="mt-6">
                          <h4
                            className="text-sm font-medium mb-3"
                            style={{
                              color: currentColors.text,
                            }}
                          >
                            How to retrieve app passwords
                          </h4>
                          <div
                            className="relative rounded-lg overflow-hidden border-2"
                            style={{
                              borderColor: currentPalette.primary,
                            }}
                          >
                            {/* Video Preview */}
                            <video
                              autoPlay
                              loop
                              muted
                              playsInline
                              className="w-full aspect-video bg-black"
                            >
                              <source
                                src="https://res.cloudinary.com/do3nqivrl/video/upload/v1734735688/How_to_retrieve_app_passwords_-_Made_with_Clipchamp_unjdoi.mp4"
                                type="video/mp4"
                              />
                            </video>

                            {/* Expand Button Overlay */}
                            <button
                              onClick={() => setIsVideoOpen(true)}
                              className="absolute top-2 right-2 p-2 rounded-lg backdrop-blur-sm transition-all hover:scale-110 cursor-pointer"
                              style={{
                                backgroundColor: `${currentPalette.primary}dd`,
                              }}
                              title="Open in full player"
                            >
                              <Maximize2 className="w-5 h-5 text-white" />
                            </button>

                            {/* Info Overlay */}
                            <div
                              className="absolute bottom-0 left-0 right-0 p-3 backdrop-blur-sm"
                              style={{
                                backgroundColor: "rgba(0, 0, 0, 0.6)",
                              }}
                            >
                              <p className="text-white text-sm font-medium">
                                Click expand to watch with controls
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <VideoPlayer
                        isOpen={isVideoOpen}
                        onClose={() => setIsVideoOpen(false)}
                        videoUrl="https://res.cloudinary.com/do3nqivrl/video/upload/v1734735688/How_to_retrieve_app_passwords_-_Made_with_Clipchamp_unjdoi.mp4"
                        title="How to Retrieve App Passwords"
                        autoplay={true}
                      />

                      {savedConfigs.length > 0 && (
                        <div
                          className="mt-6 pt-4 border-t"
                          style={{
                            borderColor: currentColors.border,
                          }}
                        >
                          <div
                            className="text-sm"
                            style={{
                              color: currentColors.textSecondary,
                            }}
                          >
                            <strong className="font-medium">Security:</strong>{" "}
                            Passwords are masked for security. They are stored
                            encrypted.
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Config;
