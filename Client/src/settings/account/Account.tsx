import { VscAccount } from "react-icons/vsc";
import { useTheme } from "../../contexts/ThemeContext";
import { useState } from "react";
import { User, BarChart3, Shield } from "lucide-react";

import ProfileSection from "./sections/ProfileSection";
// import AIPreferences from "./sections/AIPreferences";
import UsageStats from "./sections/UsageStats";
import SecuritySettings from "./sections/SecuritySettings";

const Account = () => {
    const { currentPalette, currentColors } = useTheme();
    const [activeTab, setActiveTab] = useState("profile");

    const tabs = [
        { id: "profile", label: "Profile", icon: User },
        // { id: "ai-settings", label: "AI Settings", icon: Bot },
        { id: "usage", label: "Usage", icon: BarChart3 },
        { id: "security", label: "Security", icon: Shield },
    ];

    return (
        <div className="max-w-6xl mx-auto select-none">
            <div className="select-none">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
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
                                <VscAccount size={24} />
                            </span>
                        </div>
                        <div>
                            <h1
                                className="text-2xl sm:text-4xl font-bold"
                                style={{ color: currentColors.text }}
                            >
                                Account Settings
                            </h1>
                            <p
                                className="text-base sm:text-lg mt-1"
                                style={{ color: currentColors.textSecondary }}
                            >
                                Configure your account settings and preferences.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <div
                className="space-y-6 border rounded-xl p-4"
                style={{
                    borderColor: currentColors.border,
                    minHeight: "500px",
                }}
            >
                {/* Tabs */}
                <div
                    className="flex flex-col sm:flex-row justify-between gap-4 p-4 rounded-lg w-full"
                    style={{ backgroundColor: currentColors.surface }}
                >
                    <div>
                        <h1
                            className="text-lg font-semibold"
                            style={{ color: currentColors.text }}
                        >
                            Overall Settings
                        </h1>
                        <p
                            className="text-sm"
                            style={{ color: currentColors.textSecondary }}
                        >
                            Manage your profile, usage, and security settings.
                        </p>
                    </div>
                    <nav
                        className="flex items-center gap-1 border p-1 rounded-lg"
                        style={{ borderColor: currentColors.border }}
                    >
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className="flex items-center justify-center gap-1 flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer"
                                style={{
                                    backgroundColor:
                                        activeTab === tab.id
                                            ? currentColors.border
                                            : "transparent",
                                    color: currentColors.text,
                                }}
                            >
                                <tab.icon className="w-5 h-5" />
                                <span className="hidden sm:inline">
                                    {tab.label}
                                </span>
                            </button>
                        ))}
                    </nav>
                </div>
                <div className="flex gap-6">
                    {/* Content */}
                    <div
                        className="flex-1 rounded-lg p-4"
                        style={{ backgroundColor: currentColors.surface }}
                    >
                        <div
                            style={{
                                display:
                                    activeTab === "profile" ? "block" : "none",
                            }}
                        >
                            <ProfileSection />
                        </div>
                        <div
                            style={{
                                display:
                                    activeTab === "usage" ? "block" : "none",
                            }}
                        >
                            <UsageStats />
                        </div>
                        <div
                            style={{
                                display:
                                    activeTab === "security" ? "block" : "none",
                            }}
                        >
                            <SecuritySettings />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Account;
