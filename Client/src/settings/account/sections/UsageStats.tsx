import { Mail } from "lucide-react";

const UsageStats = () => {
    const recentActivity = [
        { action: "Generated email for project update", time: "2 hours ago" },
        { action: "Customized AI tone settings", time: "1 day ago" },
        { action: "Reviewed usage statistics", time: "3 days ago" },
    ];

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold">Your MailAgent Usage</h3>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">247</div>
                    <div className="text-sm text-gray-600">
                        Emails Generated
                    </div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">89%</div>
                    <div className="text-sm text-gray-600">Success Rate</div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-600">
                        45min
                    </div>
                    <div className="text-sm text-gray-600">Time Saved</div>
                </div>
            </div>

            {/* Recent Activity */}
            <div>
                <h4 className="font-medium mb-3">Recent Activity</h4>
                <div className="space-y-2">
                    {recentActivity.map((activity, i) => (
                        <div
                            key={i}
                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                        >
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <Mail className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <div className="text-sm font-medium">
                                    {activity.action}
                                </div>
                                <div className="text-xs text-gray-500">
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
