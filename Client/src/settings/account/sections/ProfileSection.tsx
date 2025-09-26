import { Pencil } from "lucide-react";
import { useTheme } from "../../../contexts/ThemeContext";

const ProfileSection = ({
    user = {
        fullName: "Harshit",
        email: "harshit@example.com",
        defaultSignature: "Best regards,\nHarshit\nSoftware Engineer\n",
    },
}) => {
    const { currentColors, currentPalette } = useTheme();
    return (
        <div className="space-y-6">
            {/* Profile Picture & Basic Info */}
            <div className="flex items-center gap-4">
                <div
                    className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                    style={{
                        background: `linear-gradient(135deg, ${currentPalette.primary}, ${currentPalette.primary}90)`,
                    }}
                >
                    {user.fullName.charAt(0)}
                </div>
                <div>
                    <h3 className="text-xl font-semibold">{user.fullName}</h3>
                    <p
                        className="italic"
                        style={{ color: currentColors.textSecondary }}
                    >
                        {user.email}
                        <Pencil className="inline-block ml-1" size={16} />
                    </p>
                    <button
                        className="text-sm cursor-pointer mt-1 font-medium hover:underline"
                        style={{ color: currentPalette.primary }}
                    >
                        Change Avatar
                    </button>
                </div>
            </div>

            {/* Password Change */}
            <div
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
            </div>

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
