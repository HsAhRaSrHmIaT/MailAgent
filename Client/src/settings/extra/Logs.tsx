import {
    LuLogs,
    LuRefreshCw,
    LuTrash2,
    LuFilter,
    LuSearch,
} from "react-icons/lu";
import { useTheme } from "../../contexts/ThemeContext";
import { useState, useEffect, useCallback } from "react";
import type { LogEntry, LogStats } from "../../types";
import { logsService, type LogStatus } from "../../services/logsService";

const LOG_LEVELS = ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"];
const LOG_CATEGORIES = [
    "GENERAL",
    "API",
    "WEBSOCKET",
    "EMAIL",
    "LLM",
    "AUTH",
    "DATABASE",
];

const Logs = () => {
    const { currentColors, currentPalette } = useTheme();
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [stats, setStats] = useState<LogStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [dbStatus, setDbStatus] = useState<LogStatus | null>(null);
    const [filters, setFilters] = useState({
        level: "",
        category: "",
        search_term: "",
        limit: 100,
    });
    const [expandedLog, setExpandedLog] = useState<number | null>(null);

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        try {
            const data = await logsService.fetchLogs(filters);
            setLogs(data);
        } catch (error) {
            console.error("Error fetching logs:", error);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    const fetchStats = useCallback(async () => {
        try {
            const data = await logsService.fetchStats();
            setStats(data);
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    }, []);

    const clearOldLogs = async () => {
        if (confirm("Are you sure you want to clear old logs (30+ days)?")) {
            try {
                const result = await logsService.clearOldLogs();
                alert(`${result.deleted_count} old logs deleted`);
                fetchLogs();
                fetchStats();
            } catch (error) {
                console.error("Error clearing logs:", error);
            }
        }
    };

    const fetchStatus = useCallback(async () => {
        try {
            const data = await logsService.fetchStatus();
            setDbStatus(data);
        } catch (error) {
            console.error("Error fetching status:", error);
        }
    }, []);

    useEffect(() => {
        fetchLogs();
        fetchStats();
        fetchStatus();
    }, [fetchLogs, fetchStats, fetchStatus]);

    const getLevelColor = (level: string) => {
        switch (level) {
            case "ERROR":
                return "#ef4444";
            case "CRITICAL":
                return "#dc2626";
            case "WARNING":
                return "#f59e0b";
            case "INFO":
                return "#3b82f6";
            case "DEBUG":
                return "#6b7280";
            default:
                return currentColors.text;
        }
    };

    const formatTimestamp = (timestamp: string) => {
        return new Date(timestamp).toLocaleString();
    };

    return (
        <div className="min-h-screen">
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
                                    Application Logs
                                </h1>
                                <p
                                    className="text-base sm:text-lg mt-1"
                                    style={{
                                        color: currentColors.textSecondary,
                                    }}
                                >
                                    Monitor system activity and troubleshoot
                                    issues
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <button
                                onClick={fetchLogs}
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
                                onClick={clearOldLogs}
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
                        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
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
                                    {stats.total_logs}
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
                            <div
                                className="p-4 rounded-lg"
                                style={{
                                    backgroundColor: currentColors.surface,
                                    borderColor: currentColors.border,
                                }}
                            >
                                <div
                                    style={{ color: "#3b82f6" }}
                                    className="text-sm"
                                >
                                    Info
                                </div>
                                <div
                                    style={{ color: "#3b82f6" }}
                                    className="text-2xl font-bold"
                                >
                                    {stats.info_count}
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
                                    style={{ color: "#6b7280" }}
                                    className="text-sm"
                                >
                                    Debug
                                </div>
                                <div
                                    style={{ color: "#6b7280" }}
                                    className="text-2xl font-bold"
                                >
                                    {stats.debug_count}
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
                                    style={{ color: "#dc2626" }}
                                    className="text-sm"
                                >
                                    Critical
                                </div>
                                <div
                                    style={{ color: "#dc2626" }}
                                    className="text-2xl font-bold"
                                >
                                    {stats.critical_count}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Status Banner */}
                    {dbStatus && !dbStatus.database_available && (
                        <div
                            className="p-4 rounded-lg mb-6 border-l-4"
                            style={{
                                backgroundColor: "#fef3c7",
                                borderLeftColor: "#f59e0b",
                                color: "#92400e",
                            }}
                        >
                            <div className="flex items-center gap-2">
                                <span className="font-semibold">
                                    ⚠️ Database Unavailable
                                </span>
                            </div>
                            <p className="text-sm mt-1">
                                {dbStatus.database_error ||
                                    "Database connection failed"}
                                . Using file-based logging as fallback. Some
                                features may be limited.
                            </p>
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
                        <div className="flex items-center gap-4 flex-wrap">
                            <LuFilter
                                size={20}
                                style={{ color: currentColors.text }}
                            />

                            <select
                                value={filters.level}
                                onChange={(e) =>
                                    setFilters({
                                        ...filters,
                                        level: e.target.value,
                                    })
                                }
                                className="px-3 py-2 rounded border"
                                style={{
                                    backgroundColor: currentColors.surface,
                                    borderColor: currentColors.border,
                                    color: currentColors.text,
                                }}
                            >
                                <option value="">All Levels</option>
                                {LOG_LEVELS.map((level) => (
                                    <option key={level} value={level}>
                                        {level}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={filters.category}
                                onChange={(e) =>
                                    setFilters({
                                        ...filters,
                                        category: e.target.value,
                                    })
                                }
                                className="px-3 py-2 rounded border"
                                style={{
                                    backgroundColor: currentColors.surface,
                                    borderColor: currentColors.border,
                                    color: currentColors.text,
                                }}
                            >
                                <option value="">All Categories</option>
                                {LOG_CATEGORIES.map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>

                            <div className="flex items-center gap-2">
                                <LuSearch
                                    size={16}
                                    style={{
                                        color: currentColors.textSecondary,
                                    }}
                                />
                                <input
                                    type="text"
                                    placeholder="Search logs..."
                                    value={filters.search_term}
                                    onChange={(e) =>
                                        setFilters({
                                            ...filters,
                                            search_term: e.target.value,
                                        })
                                    }
                                    className="px-3 py-2 rounded border"
                                    style={{
                                        backgroundColor: currentColors.surface,
                                        borderColor: currentColors.border,
                                        color: currentColors.text,
                                    }}
                                />
                            </div>

                            <select
                                value={filters.limit}
                                onChange={(e) =>
                                    setFilters({
                                        ...filters,
                                        limit: parseInt(e.target.value),
                                    })
                                }
                                className="px-3 py-2 rounded border"
                                style={{
                                    backgroundColor: currentColors.surface,
                                    borderColor: currentColors.border,
                                    color: currentColors.text,
                                }}
                            >
                                <option value={50}>50 logs</option>
                                <option value={100}>100 logs</option>
                                <option value={250}>250 logs</option>
                                <option value={500}>500 logs</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Logs Table */}
                <div
                    className="border rounded-xl overflow-y-auto max-h-96"
                    style={{
                        borderColor: currentColors.border,
                        background: currentColors.surface,
                    }}
                >
                    {logs.length === 0 ? (
                        <div className="p-8 flex items-center justify-center">
                            <p style={{ color: currentColors.text }}>
                                {loading
                                    ? "Loading logs..."
                                    : "No logs available"}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead
                                    style={{
                                        backgroundColor: currentColors.surface,
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
                                            Level
                                        </th>
                                        <th
                                            className="px-4 py-3 text-left"
                                            style={{
                                                color: currentColors.text,
                                            }}
                                        >
                                            Category
                                        </th>
                                        <th
                                            className="px-4 py-3 text-left"
                                            style={{
                                                color: currentColors.text,
                                            }}
                                        >
                                            Message
                                        </th>
                                        <th
                                            className="px-4 py-3 text-left"
                                            style={{
                                                color: currentColors.text,
                                            }}
                                        >
                                            Source
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.map((log) => (
                                        <>
                                            <tr
                                                key={log.id}
                                                className="border-t cursor-pointer hover:opacity-80"
                                                style={{
                                                    borderColor:
                                                        currentColors.border,
                                                }}
                                                onClick={() =>
                                                    setExpandedLog(
                                                        expandedLog === log.id
                                                            ? null
                                                            : log.id
                                                    )
                                                }
                                            >
                                                <td
                                                    className="px-4 py-3 text-sm"
                                                    style={{
                                                        color: currentColors.textSecondary,
                                                    }}
                                                >
                                                    {formatTimestamp(
                                                        log.timestamp
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className="px-2 py-1 rounded text-xs font-medium"
                                                        style={{
                                                            backgroundColor: `${getLevelColor(
                                                                log.level
                                                            )}20`,
                                                            color: getLevelColor(
                                                                log.level
                                                            ),
                                                        }}
                                                    >
                                                        {log.level}
                                                    </span>
                                                </td>
                                                <td
                                                    className="px-4 py-3 text-sm"
                                                    style={{
                                                        color: currentColors.text,
                                                    }}
                                                >
                                                    {log.category}
                                                </td>
                                                <td
                                                    className="px-4 py-3 text-sm"
                                                    style={{
                                                        color: currentColors.text,
                                                    }}
                                                >
                                                    {log.message.length > 100
                                                        ? `${log.message.substring(
                                                              0,
                                                              100
                                                          )}...`
                                                        : log.message}
                                                </td>
                                                <td
                                                    className="px-4 py-3 text-sm"
                                                    style={{
                                                        color: currentColors.textSecondary,
                                                    }}
                                                >
                                                    {log.source ||
                                                        log.session_id ||
                                                        "-"}
                                                </td>
                                            </tr>
                                            {expandedLog === log.id && (
                                                <tr
                                                    key={`${log.id}-expanded`}
                                                    style={{
                                                        backgroundColor: `${currentPalette.primary}10`,
                                                    }}
                                                >
                                                    <td
                                                        colSpan={5}
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
                                                                        log.message
                                                                    }
                                                                </p>
                                                            </div>
                                                            {log.details && (
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
                                                                            log.details,
                                                                            null,
                                                                            2
                                                                        )}
                                                                    </pre>
                                                                </div>
                                                            )}
                                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                                                                {log.user_id && (
                                                                    <div>
                                                                        <strong
                                                                            style={{
                                                                                color: currentColors.text,
                                                                            }}
                                                                        >
                                                                            User
                                                                            ID:
                                                                        </strong>
                                                                        <p
                                                                            style={{
                                                                                color: currentColors.textSecondary,
                                                                            }}
                                                                        >
                                                                            {
                                                                                log.user_id
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                )}
                                                                {log.session_id && (
                                                                    <div>
                                                                        <strong
                                                                            style={{
                                                                                color: currentColors.text,
                                                                            }}
                                                                        >
                                                                            Session:
                                                                        </strong>
                                                                        <p
                                                                            style={{
                                                                                color: currentColors.textSecondary,
                                                                            }}
                                                                        >
                                                                            {
                                                                                log.session_id
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                )}
                                                                {log.ip_address && (
                                                                    <div>
                                                                        <strong
                                                                            style={{
                                                                                color: currentColors.text,
                                                                            }}
                                                                        >
                                                                            IP:
                                                                        </strong>
                                                                        <p
                                                                            style={{
                                                                                color: currentColors.textSecondary,
                                                                            }}
                                                                        >
                                                                            {
                                                                                log.ip_address
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                )}
                                                                {log.user_agent && (
                                                                    <div>
                                                                        <strong
                                                                            style={{
                                                                                color: currentColors.text,
                                                                            }}
                                                                        >
                                                                            User
                                                                            Agent:
                                                                        </strong>
                                                                        <p
                                                                            style={{
                                                                                color: currentColors.textSecondary,
                                                                            }}
                                                                        >
                                                                            {log
                                                                                .user_agent
                                                                                .length >
                                                                            50
                                                                                ? `${log.user_agent.substring(
                                                                                      0,
                                                                                      50
                                                                                  )}...`
                                                                                : log.user_agent}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </div>
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
