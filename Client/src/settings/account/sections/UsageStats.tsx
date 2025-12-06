import { Mail } from "lucide-react";
import { useTheme } from "../../../contexts/ThemeContext";

const UsageStats = () => {
    const { currentColors, currentPalette } = useTheme();
    const recentActivity = [
        { action: "Generated email for project update", time: "2 hours ago" },
        { action: "Customized AI tone settings", time: "1 day ago" },
        { action: "Reviewed usage statistics", time: "3 days ago" },
        { action: "Generated email for project update", time: "2 hours ago" },
        { action: "Customized AI tone settings", time: "1 day ago" },
        { action: "Reviewed usage statistics", time: "3 days ago" },
    ];

    return (
        <div className="space-y-6 select-none">
            <h3 className="text-lg font-semibold">Your MailAgent Usage</h3>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3">
                <div
                    className="p-4 rounded-lg text-center"
                    style={{ backgroundColor: `${currentColors.bg}` }}
                >
                    <div className="text-xl sm:text-2xl font-bold text-blue-600">247</div>
                    <div
                        className="text-xs sm:text-sm"
                        style={{ color: currentColors.textSecondary }}
                    >
                        Emails Generated
                    </div>
                </div>
                <div
                    className="p-4 rounded-lg text-center"
                    style={{ backgroundColor: `${currentColors.bg}` }}
                >
                    <div className="text-xl sm:text-2xl font-bold text-green-600">89%</div>
                    <div
                        className="text-xs sm:text-sm"
                        style={{ color: currentColors.textSecondary }}
                    >
                        Success Rate
                    </div>
                </div>
                <div
                    className="p-4 rounded-lg text-center"
                    style={{ backgroundColor: `${currentColors.bg}` }}
                >
                    <div className="text-xl sm:text-2xl font-bold text-purple-600">
                        45min
                    </div>
                    <div
                        className="text-xs sm:text-sm"
                        style={{ color: currentColors.textSecondary }}
                    >
                        Time Saved
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div>
                <h4 className="font-medium mb-3">Recent Activity</h4>
                <div className="space-y-2 overflow-y-auto max-h-48 pr-2">
                    {recentActivity.map((activity, i) => (
                        <div
                            key={i}
                            className="flex items-center gap-3 p-3 rounded-lg"
                            style={{ backgroundColor: `${currentColors.bg}` }}
                        >
                            <div className="w-8 h-8 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: `${currentPalette.primary}20` }}
                            >
                                <Mail className="w-4 h-4 "
                                style={{ color: currentPalette.primary }}
                                 />
                            </div>
                            <div className="flex-1">
                                <div className="text-sm font-medium">
                                    {activity.action}
                                </div>
                                <div className="text-xs "
                                    style={{ color: currentColors.textSecondary }}>
                                    {activity.time}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default UsageStats;
