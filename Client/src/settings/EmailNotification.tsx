import { useTheme } from "../contexts/ThemeContext";

import { IoNotificationsOutline } from "react-icons/io5";

const EmailNotification = () => {
    const { currentColors, currentPalette } = useTheme();
    return (
        <div className="min-h-screen">
            <div className="max-w-6xl mx-auto p-6 select-none">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <div
                            className="p-3 rounded-xl"
                            style={{
                                backgroundColor: `${currentPalette.primary}20`,
                            }}
                        >
                            <span
                                className="text-md text-blue-400 font-mono font-bold"
                                style={{ color: currentColors.text }}
                            >
                                <IoNotificationsOutline size={24} />
                            </span>
                        </div>
                        <div>
                            <h1
                                className="text-4xl font-bold"
                                style={{ color: currentColors.text }}
                            >
                                Email Notifications
                            </h1>
                            <p
                                className="text-lg mt-1"
                                style={{ color: currentColors.textSecondary }}
                            >
                                Manage your email notifications and preferences
                            </p>
                        </div>
                    </div>
                </div>
                 <div
                    className="h-142 border rounded-xl p-6 flex items-center justify-center"
                    style={{
                        borderColor: currentColors.border,
                        background: currentColors.surface,
                    }}
                >
                    <p style={{ color: currentColors.text }}>
                        No Notifications Available
                    </p>
                </div>
            </div>
        </div>
    );
};

export default EmailNotification;
