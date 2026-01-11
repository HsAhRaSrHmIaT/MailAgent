import {
    LuLogs,
    LuRefreshCw,
    LuTrash2,
    LuFilter,
    LuChevronDown,
} from "react-icons/lu";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { useState, useEffect, useCallback } from "react";
import type { UserActivityLog, ActivityStats } from "../../types";
import { activityLogsService } from "../../services/logsService";

const ACTIVITY_ACTIONS = [
    "login",
    "logout",
    "email_generated",
    "email_sent",
    "email_failed",
    "variable_added",
    "variable_updated",
    "config_added",
    "config_updated",
    "config_deleted",
    "profile_updated",
    "password_changed",
];

const ACTIVITY_STATUSES = ["success", "error", "warning"];

const Logs = () => {
    const { currentColors, currentPalette } = useTheme();
    const { token } = useAuth();
    const [activities, setActivities] = useState<UserActivityLog[]>([]);
    const [stats, setStats] = useState<ActivityStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        action: "",
        status: "",
    });
    const [expandedLog, setExpandedLog] = useState<number | null>(null);

    const fetchActivities = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const data = await activityLogsService.fetchActivities(
                filters,
                token,
            );
            setActivities(data);
        } catch (error) {
            console.error("Error fetching activities:", error);
        } finally {
            setLoading(false);
        }
    }, [filters, token]);

    const fetchStats = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const data = await activityLogsService.fetchStats(token);
            setStats(data);
        } catch (error) {
            console.error("Error fetching stats:", error);
        } finally {
            setLoading(false);
        }
    }, [token]);

    const clearOldActivities = async () => {
        if (!token) return;
        if (
            confirm("Are you sure you want to clear old activities (90+ days)?")
        ) {
            try {
                const result = await activityLogsService.clearOldActivities(
                    token,
                );
                alert(`${result.deleted_count} old activities deleted`);
                fetchActivities();
                fetchStats();
            } catch (error) {
                console.error("Error clearing activities:", error);
            }
        }
    };

    useEffect(() => {
        fetchActivities();
        fetchStats();
    }, [fetchActivities, fetchStats]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "error":
                return "#ef4444";
            case "warning":
                return "#f59e0b";
            case "success":
                return "#10b981";
            default:
                return currentColors.text;
        }
    };

    const formatAction = (action: string) => {
        return action
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    };

    const formatTimestamp = (timestamp: string) => {
        return new Date(timestamp).toLocaleString();
    };

    const handleRefresh = () => {
        fetchActivities();
        fetchStats();
    };

    return (
        <div>
            <div className="max-w-6xl mx-auto select-none">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <div
                                className="p-2 sm:p-3 rounded-xl"
                                style={{
                                    backgroundColor: `${currentPalette.primary}20`,
                                }}
                            >
                                <LuLogs
                                    size={24}
                                    style={{ color: currentColors.text }}
                                />
                            </div>
                            <div>
                                <h1
                                    className="text-2xl sm:text-4xl font-bold"
                                    style={{ color: currentColors.text }}
                                >
                                    Activity Logs
                                </h1>
                                <p
                                    className="text-base sm:text-lg mt-1"
                                    style={{
                                        color: currentColors.textSecondary,
                                    }}
                                >
                                    Track your account activities and actions
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <button
                                onClick={handleRefresh}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
                                style={{
                                    backgroundColor: currentPalette.primary,
                                    color: "white",
                                }}
                                disabled={loading}
                            >
                                <LuRefreshCw
                                    size={16}
                                    className={loading ? "animate-spin" : ""}
                                />
                                <span className="hidden sm:block">Refresh</span>
                            </button>
                            <button
                                onClick={clearOldActivities}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
                                style={{
                                    backgroundColor: "#ef4444",
                                    color: "white",
                                }}
                            >
                                <LuTrash2 size={16} />
                                <span className="hidden sm:block">
                                    Clean Old
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Stats */}
                    {stats && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div
                                className="p-4 rounded-lg"
                                style={{
                                    backgroundColor: currentColors.surface,
                                    borderColor: currentColors.border,
                                }}
                            >
                                <div
                                    style={{
                                        color: currentColors.textSecondary,
                                    }}
                                    className="text-sm"
                                >
                                    Total
                                </div>
                                <div
                                    style={{ color: currentColors.text }}
                                    className="text-2xl font-bold"
                                >
                                    {stats.total_activities}
                                </div>
                            </div>
                            <div
                                className="p-4 rounded-lg"
                                style={{
                                    backgroundColor: currentColors.surface,
                                    borderColor: currentColors.border,
                                }}
                            >
                                <div
                                    style={{ color: "#10b981" }}
                                    className="text-sm"
                                >
                                    Success
                                </div>
                                <div
                                    style={{ color: "#10b981" }}
                                    className="text-2xl font-bold"
                                >
                                    {stats.success_count}
                                </div>
                            </div>
                            <div
                                className="p-4 rounded-lg"
                                style={{
                                    backgroundColor: currentColors.surface,
                                    borderColor: currentColors.border,
                                }}
                            >
                                <div
                                    style={{ color: "#ef4444" }}
                                    className="text-sm"
                                >
                                    Errors
                                </div>
                                <div
                                    style={{ color: "#ef4444" }}
                                    className="text-2xl font-bold"
                                >
                                    {stats.error_count}
                                </div>
                            </div>
                            <div
                                className="p-4 rounded-lg"
                                style={{
                                    backgroundColor: currentColors.surface,
                                    borderColor: currentColors.border,
                                }}
                            >
                                <div
                                    style={{ color: "#f59e0b" }}
                                    className="text-sm"
                                >
                                    Warnings
                                </div>
                                <div
                                    style={{ color: "#f59e0b" }}
                                    className="text-2xl font-bold"
                                >
                                    {stats.warning_count}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Filters */}
                    <div
                        className="p-4 rounded-lg mb-6"
                        style={{
                            backgroundColor: currentColors.surface,
                            borderColor: currentColors.border,
                        }}
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-wrap">
                            <div className="flex items-center font-medium gap-2">
                                <LuFilter
                                    size={20}
                                    style={{ color: currentColors.text }}
                                    className=""
                                />
                                <span className="">Filters</span>
                            </div>

                            <select
                                value={filters.action}
                                onChange={(e) =>
                                    setFilters({
                                        ...filters,
                                        action: e.target.value,
                                    })
                                }
                                className="px-3 py-2 rounded border"
                                style={{
                                    backgroundColor: currentColors.surface,
                                    borderColor: currentColors.border,
                                    color: currentColors.text,
                                }}
                            >
                                <option value="">All Actions</option>
                                {ACTIVITY_ACTIONS.map((action) => (
                                    <option key={action} value={action}>
                                        {formatAction(action)}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={filters.status}
                                onChange={(e) =>
                                    setFilters({
                                        ...filters,
                                        status: e.target.value,
                                    })
                                }
                                className="px-3 py-2 rounded border"
                                style={{
                                    backgroundColor: currentColors.surface,
                                    borderColor: currentColors.border,
                                    color: currentColors.text,
                                }}
                            >
                                <option value="">All Statuses</option>
                                {ACTIVITY_STATUSES.map((status) => (
                                    <option key={status} value={status}>
                                        {status.charAt(0).toUpperCase() +
                                            status.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Activities Table */}
                <div
                    className="border rounded-xl overflow-y-auto max-h-96 shadow-lg"
                    style={{
                        borderColor: currentColors.border,
                        background: currentColors.surface,
                    }}
                >
                    {activities.length === 0 ? (
                        <div className="p-8 flex items-center justify-center">
                            <p style={{ color: currentColors.text }}>
                                {loading
                                    ? "Loading activities..."
                                    : "No activities available"}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto max-h-80">
                            <table className="w-full">
                                <thead
                                    style={{
                                        backgroundColor: currentColors.bg,
                                        position: "sticky",
                                        top: 0,
                                        borderBottom: `1px solid ${currentColors.border}`,
                                        zIndex: 1,
                                    }}
                                >
                                    <tr>
                                        <th
                                            className="px-4 py-3 text-left"
                                            style={{
                                                color: currentColors.text,
                                            }}
                                        >
                                            Time
                                        </th>
                                        <th
                                            className="px-4 py-3 text-left"
                                            style={{
                                                color: currentColors.text,
                                            }}
                                        >
                                            Action
                                        </th>
                                        <th
                                            className="px-4 py-3 text-left"
                                            style={{
                                                color: currentColors.text,
                                            }}
                                        >
                                            Status
                                        </th>
                                        <th
                                            className="px-4 py-3 text-left"
                                            style={{
                                                color: currentColors.text,
                                            }}
                                        >
                                            Message
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {activities.map((activity) => (
                                        <>
                                            <tr
                                                key={activity.id}
                                                className="border-t cursor-pointer hover:bg-opacity-50 transition-all"
                                                style={{
                                                    borderColor:
                                                        currentColors.border,
                                                    backgroundColor:
                                                        expandedLog ===
                                                        activity.id
                                                            ? `${currentPalette.primary}15`
                                                            : "transparent",
                                                }}
                                                onClick={() =>
                                                    setExpandedLog(
                                                        expandedLog ===
                                                            activity.id
                                                            ? null
                                                            : activity.id,
                                                    )
                                                }
                                                title="Click to view details"
                                            >
                                                <td
                                                    className="px-4 py-3 text-sm"
                                                    style={{
                                                        color: currentColors.textSecondary,
                                                    }}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <LuChevronDown
                                                            size={16}
                                                            className="transition-transform duration-200 flex-shrink-0"
                                                            style={{
                                                                transform:
                                                                    expandedLog ===
                                                                    activity.id
                                                                        ? "rotate(180deg)"
                                                                        : "rotate(0deg)",
                                                                color: currentPalette.primary,
                                                            }}
                                                        />
                                                        {formatTimestamp(
                                                            activity.created_at,
                                                        )}
                                                    </div>
                                                </td>
                                                <td
                                                    className="px-4 py-3 text-sm"
                                                    style={{
                                                        color: currentColors.text,
                                                    }}
                                                >
                                                    {formatAction(
                                                        activity.action,
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className="px-2 py-1 rounded text-xs font-medium"
                                                        style={{
                                                            backgroundColor: `${getStatusColor(
                                                                activity.status,
                                                            )}20`,
                                                            color: getStatusColor(
                                                                activity.status,
                                                            ),
                                                        }}
                                                    >
                                                        {activity.status}
                                                    </span>
                                                </td>
                                                <td
                                                    className="px-4 py-3 text-sm"
                                                    style={{
                                                        color: currentColors.text,
                                                    }}
                                                >
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span>
                                                            {activity.message
                                                                .length > 80
                                                                ? `${activity.message.substring(
                                                                      0,
                                                                      80,
                                                                  )}...`
                                                                : activity.message}
                                                        </span>
                                                        <span
                                                            className="text-xs px-2 py-0.5 rounded"
                                                            style={{
                                                                color: currentColors.text,
                                                                backgroundColor: `${currentPalette.primary}20`,
                                                                whiteSpace:
                                                                    "nowrap",
                                                            }}
                                                        >
                                                            {expandedLog ===
                                                            activity.id
                                                                ? "Hide"
                                                                : "Click to View"}
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                            {expandedLog === activity.id && (
                                                <tr
                                                    key={`${activity.id}-expanded`}
                                                    style={{
                                                        backgroundColor: `${currentPalette.primary}10`,
                                                    }}
                                                >
                                                    <td
                                                        colSpan={4}
                                                        className="px-4 py-4"
                                                    >
                                                        <div className="space-y-2">
                                                            <div>
                                                                <strong
                                                                    style={{
                                                                        color: currentColors.text,
                                                                    }}
                                                                >
                                                                    Full
                                                                    Message:
                                                                </strong>
                                                                <p
                                                                    style={{
                                                                        color: currentColors.text,
                                                                    }}
                                                                    className="mt-1"
                                                                >
                                                                    {
                                                                        activity.message
                                                                    }
                                                                </p>
                                                            </div>
                                                            {activity.details && (
                                                                <div>
                                                                    <strong
                                                                        style={{
                                                                            color: currentColors.text,
                                                                        }}
                                                                    >
                                                                        Details:
                                                                    </strong>
                                                                    <pre
                                                                        className="mt-1 text-xs overflow-x-auto p-2 rounded"
                                                                        style={{
                                                                            backgroundColor:
                                                                                currentColors.surface,
                                                                            color: currentColors.text,
                                                                        }}
                                                                    >
                                                                        {JSON.stringify(
                                                                            activity.details,
                                                                            null,
                                                                            2,
                                                                        )}
                                                                    </pre>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Logs;
