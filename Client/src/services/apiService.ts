import type {
    ChatRequest,
    ChatResponse,
    EmailRequest,
    EmailResponse,
    EnvironmentVariable,
    EnvironmentVariableResponse,
    EmailConfig,
    EmailConfigResponse,
    Message,
    ChatHistoryResponse,
    EmailHistoryResponse,
    UsageStats,
    PreferenceSettings,
} from "../types";
import { getToken } from "./authService";

class ApiService {
    private ws: WebSocket | null = null;
    private apiUrl =
        import.meta.env.VITE_API_URL || "http://localhost:8000/api";
    private wsUrl = import.meta.env.VITE_WS_URL || "ws://localhost:8000/api";
    private wsReady: Promise<void> | null = null;

    private ensureWebSocket(): Promise<void> {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            return Promise.resolve();
        }
        if (this.wsReady) {
            return this.wsReady;
        }
        this.ws = new WebSocket(this.wsUrl);
        this.wsReady = new Promise((resolve, reject) => {
            this.ws!.onopen = () => resolve();
            this.ws!.onerror = (err) => reject(err);
        });
        return this.wsReady;
    }

    private getAuthHeaders(): HeadersInit {
        const token = getToken();
        const headers: HeadersInit = {
            "Content-Type": "application/json",
        };

        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        return headers;
    }

    public connectWebSocket(): void {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            this.ws = new WebSocket(this.wsUrl);
            this.wsReady = new Promise((resolve, reject) => {
                this.ws!.onopen = () => resolve();
                this.ws!.onerror = (err) => reject(err);
            });
        }
    }

    async sendChatMessage(data: ChatRequest): Promise<ChatResponse> {
        await this.ensureWebSocket();
        return new Promise<ChatResponse>((resolve, reject) => {
            if (!this.ws)
                return reject(
                    new Error(
                        "WebSocket not initialized. Cannot send message!",
                    ),
                );
            this.ws.onmessage = (event) => {
                try {
                    const response = JSON.parse(event.data);

                    // Handle 401 Unauthorized
                    if (
                        response.status === 401 ||
                        response.error === "Unauthorized"
                    ) {
                        window.location.href = "/login";
                        reject(new Error("Unauthorized"));
                        return;
                    }

                    resolve({
                        message: response.content || response.message,
                        success: true,
                        error: undefined,
                    });
                } catch (err) {
                    reject(err);
                }
            };
            this.ws.onerror = (err) => {
                reject(err);
            };

            const token = getToken();
            this.ws.send(
                JSON.stringify({
                    role: "user",
                    type: "chat",
                    content: data.message,
                    ...(data.tone ? { tone: data.tone } : {}),
                    ...(token ? { token } : {}),
                }),
            );
        });
    }

    async generateEmail(data: EmailRequest): Promise<EmailResponse> {
        await this.ensureWebSocket();
        return new Promise<EmailResponse>((resolve, reject) => {
            if (!this.ws)
                return reject(
                    new Error(
                        "Websocket not initialized. Cannot generate email!",
                    ),
                );
            this.ws.onmessage = (event) => {
                try {
                    const response = JSON.parse(event.data);

                    // Handle 401 Unauthorized
                    if (
                        response.status === 401 ||
                        response.error === "Unauthorized"
                    ) {
                        window.location.href = "/login";
                        reject(new Error("Unauthorized"));
                        return;
                    }

                    resolve(response);
                    console.log("Received response:", response);
                } catch (err) {
                    reject(err);
                }
            };
            this.ws.onerror = (err) => {
                reject(err);
            };

            const token = getToken();
            this.ws.send(
                JSON.stringify({
                    role: "user",
                    type: "email",
                    receiverEmail: data.receiverEmail,
                    prompt: data.prompt,
                    ...(data.tone ? { tone: data.tone } : {}),
                    ...(token ? { token } : {}),
                }),
            );
        });
    }

    // HTTP request helper with auth
    async fetch(url: string, options: RequestInit = {}): Promise<Response> {
        const headers = this.getAuthHeaders();
        const response = await window.fetch(url, {
            ...options,
            headers: {
                ...headers,
                ...options.headers,
            },
        });

        // Handle 401 Unauthorized
        if (response.status === 401) {
            // Redirect to login
            window.location.href = "/login";
            throw new Error("Unauthorized");
        }

        return response;
    }

    isWebSocketConnected(): boolean {
        return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
    }

    async getEnvironmentVariables(): Promise<EnvironmentVariable[]> {
        const response = await this.fetch(`${this.apiUrl}/env-vars/`);
        if (!response.ok) {
            throw new Error("Failed to fetch environment variables");
        }
        return response.json();
    }

    async getEnvironmentVariable(
        key: string,
    ): Promise<EnvironmentVariableResponse> {
        const response = await this.fetch(`${this.apiUrl}/env-vars/${key}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch environment variable: ${key}`);
        }
        return response.json();
    }

    async saveEnvironmentVariable(
        key: string,
        value: string,
    ): Promise<EnvironmentVariableResponse> {
        const response = await this.fetch(`${this.apiUrl}/env-vars/`, {
            method: "POST",
            body: JSON.stringify({ key, value }),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(
                error.detail || "Failed to save environment variable",
            );
        }
        return response.json();
    }

    async updateEnvironmentVariable(
        key: string,
        value: string,
    ): Promise<EnvironmentVariableResponse> {
        const response = await this.fetch(`${this.apiUrl}/env-vars/${key}`, {
            method: "PUT",
            body: JSON.stringify({ value }),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(
                error.detail || "Failed to update environment variable",
            );
        }
        return response.json();
    }

    // Email Configuration API Methods
    async getEmailConfigs(): Promise<EmailConfig[]> {
        const response = await this.fetch(`${this.apiUrl}/email-configs/`);
        if (!response.ok) {
            throw new Error("Failed to fetch email configurations");
        }
        return response.json();
    }

    async getEmailConfig(email: string): Promise<EmailConfigResponse> {
        const response = await this.fetch(
            `${this.apiUrl}/email-configs/${encodeURIComponent(email)}`,
        );
        if (!response.ok) {
            throw new Error(`Failed to fetch email configuration: ${email}`);
        }
        return response.json();
    }

    async saveEmailConfig(
        email: string,
        password: string,
    ): Promise<EmailConfigResponse> {
        const response = await this.fetch(`${this.apiUrl}/email-configs/`, {
            method: "POST",
            body: JSON.stringify({ email, password }),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(
                error.detail || "Failed to save email configuration",
            );
        }
        return response.json();
    }

    async updateEmailConfig(
        email: string,
        password: string,
    ): Promise<EmailConfigResponse> {
        const response = await this.fetch(
            `${this.apiUrl}/email-configs/${encodeURIComponent(email)}`,
            {
                method: "PUT",
                body: JSON.stringify({ password }),
            },
        );
        if (!response.ok) {
            const error = await response.json();
            throw new Error(
                error.detail || "Failed to update email configuration",
            );
        }
        return response.json();
    }

    async deleteEmailConfig(email: string): Promise<{ message: string }> {
        const response = await this.fetch(
            `${this.apiUrl}/email-configs/${encodeURIComponent(email)}`,
            {
                method: "DELETE",
            },
        );
        if (!response.ok) {
            throw new Error("Failed to delete email configuration");
        }
        return response.json();
    }

    async setActiveEmail(email: string): Promise<{ message: string }> {
        const response = await this.fetch(
            `${this.apiUrl}/email-configs/${encodeURIComponent(
                email,
            )}/set-active`,
            {
                method: "PATCH",
            },
        );
        if (!response.ok) {
            throw new Error("Failed to set active email");
        }
        return response.json();
    }

    async getActiveEmail(): Promise<EmailConfigResponse> {
        const response = await this.fetch(
            `${this.apiUrl}/email-configs/active`,
        );
        if (!response.ok) {
            throw new Error("Failed to fetch active email");
        }
        return response.json();
    }

    // Chat History API Methods
    async saveMessage(message: Message): Promise<void> {
        await this.fetch(`${this.apiUrl}/chat/messages`, {
            method: "POST",
            body: JSON.stringify({
                message_id: message.id,
                content: message.content,
                sender: message.sender,
                timestamp: message.timestamp.toISOString(),
                tone: message.hashtag,
                message_type: message.type || "text",
                email_data: message.emailData,
            }),
        });
    }

    async getChatHistory(
        limit: number = 50,
        beforeTimestamp?: string,
    ): Promise<ChatHistoryResponse> {
        const params = new URLSearchParams({
            limit: limit.toString(),
            ...(beforeTimestamp && { before: beforeTimestamp }),
        });

        const response = await this.fetch(
            `${this.apiUrl}/chat/messages?${params}`,
        );
        if (!response.ok) throw new Error("Failed to fetch chat history");

        const data = (await response.json()) as {
            messages: Array<{
                id: string;
                content: string;
                sender: string;
                timestamp: string;
                hashtag?: string;
                type: string;
                emailData?: unknown;
            }>;
            hasMore: boolean;
            total: number;
        };

        return {
            messages: data.messages.map((msg) => ({
                id: msg.id,
                content: msg.content,
                sender: msg.sender as "user" | "assistant",
                timestamp: new Date(msg.timestamp),
                hashtag: msg.hashtag,
                type: msg.type as "text" | "email",
                emailData: msg.emailData as Message["emailData"],
            })),
            hasMore: data.hasMore,
            total: data.total,
        };
    }

    async clearChatHistory(): Promise<void> {
        const response = await this.fetch(`${this.apiUrl}/chat/messages`, {
            method: "DELETE",
        });
        if (!response.ok) throw new Error("Failed to clear chat history");
    }

    // Email History API Methods
    async saveEmail(
        emailId: string,
        toEmail: string,
        subject: string,
        body: string,
        timestamp: Date,
        tone?: string,
        prompt?: string,
        status: string = "unsent",
    ): Promise<void> {
        await this.fetch(`${this.apiUrl}/emails`, {
            method: "POST",
            body: JSON.stringify({
                email_id: emailId,
                to_email: toEmail,
                subject: subject,
                body: body,
                tone: tone,
                prompt: prompt,
                timestamp: timestamp.toISOString(),
                status: status,
            }),
        });
    }

    async getEmailHistory(
        limit: number = 50,
        beforeTimestamp?: string,
    ): Promise<EmailHistoryResponse> {
        const params = new URLSearchParams({
            limit: limit.toString(),
            ...(beforeTimestamp && { before: beforeTimestamp }),
        });

        const response = await this.fetch(`${this.apiUrl}/emails?${params}`);
        if (!response.ok) throw new Error("Failed to fetch email history");

        const data = (await response.json()) as {
            emails: Array<{
                id: string;
                to_email: string;
                subject: string;
                body: string;
                tone?: string;
                prompt?: string;
                status: string;
                sent_at?: string;
                regeneration_count: number;
                version: number;
                timestamp: string;
            }>;
            hasMore: boolean;
            total: number;
        };

        return {
            emails: data.emails.map((email) => ({
                id: email.id,
                to_email: email.to_email,
                subject: email.subject,
                body: email.body,
                tone: email.tone,
                prompt: email.prompt,
                status: email.status,
                sent_at: email.sent_at,
                regeneration_count: email.regeneration_count,
                version: email.version,
                timestamp: new Date(email.timestamp),
            })),
            hasMore: data.hasMore,
            total: data.total,
        };
    }

    async updateEmail(
        emailId: string,
        updates: {
            status?: string;
            body?: string;
            subject?: string;
            to_email?: string;
        },
    ): Promise<void> {
        const response = await this.fetch(`${this.apiUrl}/emails/${emailId}`, {
            method: "PATCH",
            body: JSON.stringify(updates),
        });
        if (!response.ok) throw new Error("Failed to update email");
    }

    async regenerateEmail(emailId: string): Promise<void> {
        const response = await this.fetch(
            `${this.apiUrl}/emails/${emailId}/regenerate`,
            {
                method: "POST",
            },
        );
        if (!response.ok) throw new Error("Failed to regenerate email");
    }

    async clearEmailHistory(): Promise<void> {
        const response = await this.fetch(`${this.apiUrl}/emails`, {
            method: "DELETE",
        });
        if (!response.ok) throw new Error("Failed to clear email history");
    }

    async getDrafts(): Promise<EmailHistoryResponse> {
        const params = new URLSearchParams({
            status: "draft",
        });

        const response = await this.fetch(`${this.apiUrl}/emails?${params}`);
        if (!response.ok) throw new Error("Failed to fetch drafts");

        const data = (await response.json()) as {
            emails: Array<{
                id: string;
                to_email: string;
                subject: string;
                body: string;
                tone?: string;
                prompt?: string;
                status: string;
                sent_at?: string;
                regeneration_count: number;
                version: number;
                timestamp: string;
            }>;
            hasMore: boolean;
            total: number;
        };

        return {
            emails: data.emails.map((email) => ({
                id: email.id,
                to_email: email.to_email,
                subject: email.subject,
                body: email.body,
                tone: email.tone,
                prompt: email.prompt,
                status: email.status,
                sent_at: email.sent_at,
                regeneration_count: email.regeneration_count,
                version: email.version,
                timestamp: new Date(email.timestamp),
            })),
            hasMore: data.hasMore,
            total: data.total,
        };
    }

    async getUsageStats(): Promise<UsageStats> {
        const response = await this.fetch(`${this.apiUrl}/usage-stats`);
        if (!response.ok) throw new Error("Failed to fetch usage stats");
        return response.json();
    }

    async forgotPassword(
        email: string,
    ): Promise<{ message: string; success: boolean }> {
        const response = await fetch(`${this.apiUrl}/auth/forgot-password`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
        });
        if (!response.ok) throw new Error("Failed to send reset link");
        return response.json();
    }

    async verifyResetToken(
        token: string,
    ): Promise<{ message: string; success: boolean }> {
        const response = await fetch(`${this.apiUrl}/auth/verify-reset-token`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token }),
        });
        if (!response.ok) throw new Error("Invalid or expired token");
        return response.json();
    }

    async resetPassword(
        token: string,
        newPassword: string,
    ): Promise<{ message: string; success: boolean }> {
        const response = await fetch(`${this.apiUrl}/auth/reset-password`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token, new_password: newPassword }),
        });
        if (!response.ok) throw new Error("Failed to reset password");
        return response.json();
    }

    async getPreferences(): Promise<PreferenceSettings> {
        const response = await this.fetch(`${this.apiUrl}/auth/preferences`);
        if (!response.ok) {
            throw new Error("Failed to fetch user preferences");
        }
        const data = await response.json();
        return data.preferences;
    }

    async updatePreferences(preferences: {
        language?: string;
        default_tone?: string;
        ai_learning?: boolean;
        save_history?: boolean;
    }): Promise<PreferenceSettings> {
        const response = await this.fetch(`${this.apiUrl}/auth/preferences`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(preferences),
        });
        if (!response.ok) {
            throw new Error("Failed to update user preferences");
        }
        return response.json();
    }

    async sendDeleteVerificationCode(): Promise<void> {
        const response = await this.fetch(
            `${this.apiUrl}/auth/send-delete-verification`,
            {
                method: "POST",
            },
        );
        if (!response.ok) {
            throw new Error("Failed to send verification code");
        }
    }

    async deleteAllUserData(verificationCode: string): Promise<void> {
        const response = await this.fetch(
            `${this.apiUrl}/auth/delete-all-data`,
            {
                method: "DELETE",
                body: JSON.stringify({ verification_code: verificationCode }),
            },
        );
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "Failed to delete user data");
        }
    }

    async sendEmailChangeVerification(email: string): Promise<void> {
        const response = await this.fetch(
            `${this.apiUrl}/auth/send-email-change-verification`,
            {
                method: "POST",
                body: JSON.stringify({ email }),
            },
        );
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "Failed to send verification code");
        }
    }

    async verifyEmailChange(otp: string): Promise<void> {
        const response = await this.fetch(
            `${this.apiUrl}/auth/verify-email-change`,
            {
                method: "POST",
                body: JSON.stringify({ otp }),
            },
        );
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "Invalid verification code");
        }
    }
}

export const apiService = new ApiService();
