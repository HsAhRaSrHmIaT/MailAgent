import type { LogEntry, LogStats } from "../types";

export interface LogFilters {
    level?: string;
    category?: string;
    search_term?: string;
    limit?: number;
}

export interface LogStatus {
    database_available: boolean;
    file_logging: boolean;
    database_error?: string;
}

export interface CleanupResponse {
    deleted_count: number;
}

class LogsService {
    private baseUrl = "http://localhost:8000/api/logs";

    async fetchLogs(filters: LogFilters = {}): Promise<LogEntry[]> {
        try {
            const params = new URLSearchParams();
            if (filters.level) params.append("level", filters.level);
            if (filters.category) params.append("category", filters.category);
            if (filters.search_term)
                params.append("search_term", filters.search_term);
            params.append("limit", (filters.limit || 100).toString());

            const response = await fetch(`${this.baseUrl}?${params}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch logs: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Error fetching logs:", error);
            throw error;
        }
    }

    async fetchStats(): Promise<LogStats> {
        try {
            const response = await fetch(`${this.baseUrl}/stats`);
            if (!response.ok) {
                throw new Error(
                    `Failed to fetch stats: ${response.statusText}`
                );
            }
            return await response.json();
        } catch (error) {
            console.error("Error fetching stats:", error);
            throw error;
        }
    }

    async fetchStatus(): Promise<LogStatus> {
        try {
            const response = await fetch(`${this.baseUrl}/status`);
            if (!response.ok) {
                throw new Error(
                    `Failed to fetch status: ${response.statusText}`
                );
            }
            return await response.json();
        } catch (error) {
            console.error("Error fetching status:", error);
            return {
                database_available: false,
                file_logging: true,
                database_error: "Could not connect to server",
            };
        }
    }

    async clearOldLogs(): Promise<CleanupResponse> {
        try {
            const response = await fetch(`${this.baseUrl}/cleanup`, {
                method: "DELETE",
            });
            if (!response.ok) {
                throw new Error(`Failed to clear logs: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Error clearing logs:", error);
            throw error;
        }
    }
}

export const logsService = new LogsService();
