import type { SendEmailResult } from "../types";
import { getToken } from "./authService";

export class SendService {
    private apiUrl: string;

    constructor(apiUrl: string) {
        this.apiUrl = apiUrl;
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

    async sendEmail(data: {
        emailId: string;
        toEmail: string;
        subject: string;
        body: string;
    }): Promise<SendEmailResult> {
        try {
            const response = await window.fetch(`${this.apiUrl}/send-email`, {
                method: "POST",
                headers: this.getAuthHeaders(),
                body: JSON.stringify({
                    email_id: data.emailId,
                    to_email: data.toEmail,
                    subject: data.subject,
                    body: data.body,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                return {
                    success: false,
                    message: "Failed to send email",
                    error: error.detail || "Unknown error",
                };
            }

            const result = await response.json();
            return {
                success: true,
                message: result.message || "Email sent successfully",
            };
        } catch (error) {
            return {
                success: false,
                message: "Failed to send email",
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }
}

export const sendService = new SendService(
    import.meta.env.VITE_API_URL || "http://localhost:8000/api",
);
