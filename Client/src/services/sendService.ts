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
        // Parse comma-separated emails (for bulk sends stored as single string)
        const emails = data.toEmail
            .split(",")
            .map((email) => email.trim())
            .filter((email) => email.length > 0);

        // Wrapper that uses bulk endpoint
        const bulkResult = await this.sendBulkEmail({
            emailId: data.emailId,
            toEmails: emails,
            subject: data.subject,
            body: data.body,
        });

        return {
            success: bulkResult.success,
            message: bulkResult.message,
            error: bulkResult.success ? undefined : bulkResult.message,
            total: bulkResult.total,
            successful: bulkResult.successful,
            failed: bulkResult.failed,
            results: bulkResult.results,
        };
    }

    async sendBulkEmail(data: {
        emailId: string;
        toEmails: string[];
        subject: string;
        body: string;
    }): Promise<{
        success: boolean;
        message: string;
        total?: number;
        successful?: number;
        failed?: number;
        results?: Array<{ email: string; success: boolean; error?: string }>;
    }> {
        try {
            const response = await window.fetch(
                `${this.apiUrl}/send-bulk-email`,
                {
                    method: "POST",
                    headers: this.getAuthHeaders(),
                    body: JSON.stringify({
                        email_id: data.emailId,
                        to_emails: data.toEmails,
                        subject: data.subject,
                        body: data.body,
                    }),
                },
            );

            if (!response.ok) {
                const error = await response.json();
                return {
                    success: false,
                    message: error.detail || "Failed to send bulk email",
                };
            }

            const result = await response.json();
            return {
                success: result.failed === 0,
                message:
                    result.failed === 0
                        ? `Successfully sent to all ${result.successful} recipients`
                        : `Sent to ${result.successful} of ${result.total} recipients`,
                total: result.total,
                successful: result.successful,
                failed: result.failed,
                results: result.results,
            };
        } catch (error) {
            return {
                success: false,
                message: "Failed to send bulk email",
            };
        }
    }
}

export const sendService = new SendService(
    import.meta.env.VITE_API_URL || "http://localhost:8000/api",
);
