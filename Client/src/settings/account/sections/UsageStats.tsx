import { useState, useEffect, useRef } from "react";
import { Mail } from "lucide-react";
import { useTheme } from "../../../contexts/ThemeContext";
import { apiService } from "../../../services/apiService";
import { ChatLoader, ListLoader } from "../../../components/Loader";
import type { UsageStats as UsageStatsType } from "../../../types";

const UsageStats = () => {
  const { currentColors, currentPalette } = useTheme();
  const hasLoadedRef = useRef(false);
  const [stats, setStats] = useState<UsageStatsType>({
    total_emails: 0,
    success_rate: 0,
    time_saved_hours: 0,
    recent_activity: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (hasLoadedRef.current) return;

    const fetchUsageStats = async () => {
      try {
        const data = await apiService.getUsageStats();
        setStats(data);
        hasLoadedRef.current = true;
      } catch (error) {
        console.error("Failed to fetch usage stats:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsageStats();
  }, []);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60)
      return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    return date.toLocaleDateString();
  };

  const recentActivity = stats.recent_activity.map((item) => ({
    action: item.action,
    time: item.time,
  }));

  return (
    <div className="space-y-6 select-none">
      <h3 className="text-lg font-semibold">Your MailAgent Usage</h3>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div
          className="p-4 rounded-lg text-center"
          style={{ backgroundColor: `${currentColors.bg}` }}
        >
          <div className="text-xl sm:text-2xl font-bold text-blue-600">
            {isLoading ? <ChatLoader /> : stats.total_emails}
          </div>
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
          <div className="text-xl sm:text-2xl font-bold text-green-600">
            {isLoading ? <ChatLoader /> : `${stats.success_rate}%`}
          </div>
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
            {isLoading ? (
              <ChatLoader />
            ) : (
              `${Math.floor(stats.time_saved_hours)}h`
            )}
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
          {isLoading ? (
            <ListLoader />
          ) : (
            recentActivity.map((activity, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-lg"
                style={{ backgroundColor: `${currentColors.bg}` }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${currentPalette.primary}20` }}
                >
                  <Mail
                    className="w-4 h-4 "
                    style={{ color: currentPalette.primary }}
                  />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{activity.action}</div>
                  <div
                    className="text-xs "
                    style={{ color: currentColors.textSecondary }}
                  >
                    {formatTime(activity.time)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default UsageStats;
