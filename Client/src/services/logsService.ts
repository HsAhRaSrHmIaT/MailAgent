import type { UserActivityLog, ActivityStats } from "../types";

export interface ActivityFilters {
    action?: string;
    status?: string;
    search_term?: string;
    limit?: number;
}

export interface CleanupResponse {
    deleted_count: number;
}

class ActivityLogsService {
    private baseUrl = "http://localhost:8000/api/activity-logs";

    async fetchActivities(
        filters: ActivityFilters = {},
        token: string,
    ): Promise<UserActivityLog[]> {
        try {
            const params = new URLSearchParams();
            if (filters.action) params.append("action", filters.action);
            if (filters.status) params.append("status", filters.status);

            const response = await fetch(`${this.baseUrl}?${params}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                throw new Error(
                    `Failed to fetch activities: ${response.statusText}`,
                );
            }
            return await response.json();
        } catch (error) {
            console.error("Error fetching activities:", error);
            throw error;
        }
    }

    async fetchStats(token: string): Promise<ActivityStats> {
        try {
            const response = await fetch(`${this.baseUrl}/stats`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                throw new Error(
                    `Failed to fetch stats: ${response.statusText}`,
                );
            }
            return await response.json();
        } catch (error) {
            console.error("Error fetching stats:", error);
            throw error;
        }
    }

    async clearOldActivities(
        token: string,
        days: number = 30,
    ): Promise<CleanupResponse> {
        try {
            const response = await fetch(
                `${this.baseUrl}/cleanup?days=${days}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );
            if (!response.ok) {
                throw new Error(
                    `Failed to clear activities: ${response.statusText}`,
                );
            }
            return await response.json();
        } catch (error) {
            console.error("Error clearing activities:", error);
            throw error;
        }
    }
}

export const activityLogsService = new ActivityLogsService();
