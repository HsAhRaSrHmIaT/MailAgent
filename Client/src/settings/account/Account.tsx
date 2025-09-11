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
        <div className="min-h-screen max-w-6xl mx-auto p-6">
            <div className="select-none">
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
                                className="text-md font-mono font-bold"
                                style={{ color: currentColors.text }}
                            >
                                <VscAccount size={24} />
                            </span>
                        </div>
                        <div>
                            <h1
                                className="text-4xl font-bold"
                                style={{ color: currentColors.text }}
                            >
                                Account Settings
                            </h1>
                            <p
                                className="text-lg mt-1"
                                style={{ color: currentColors.textSecondary }}
                            >
                                Configure your account settings and preferences.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="space-y-6 border rounded-lg p-4">
                {/* Tabs */}
                <div className="flex justify-between gap-4 p-4 border rounded-lg w-full">
                    <div>
                        <h1 className="text-lg font-semibold">
                            Overall Settings
                        </h1>
                        <p className="text-sm">
                            Manage your profile, usage, and security settings.
                        </p>
                    </div>
                    <nav
                        className="flex items-center gap-1 border px-1 rounded-lg"
                        style={{ borderColor: currentColors.border }}
                    >
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-md font-semibold transition-all duration-200 cursor-pointer`}
                                style={{
                                    backgroundColor:
                                        activeTab === tab.id
                                            ? currentColors.border
                                            : "transparent",
                                    color: currentColors.text,
                                }}
                            >
                                <tab.icon className="w-5 h-5" />
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
                <div className="flex gap-6">
                    {/* Content */}
                    <div className="flex-1 rounded-lg border p-6">
                        {activeTab === "profile" && <ProfileSection />}
                        {/* {activeTab === "ai-settings" && <AIPreferences  selectedTone="Professional"/>} */}
                        {activeTab === "usage" && <UsageStats />}
                        {activeTab === "security" && <SecuritySettings />}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Account;
