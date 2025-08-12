const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export interface ChatRequest {
    message: string;
    tone?: string;
}

export interface ChatResponse {
    message?: string;
    success: boolean;
    error?: string;
}

export interface EmailRequest {
    receiverEmail: string;
    prompt: string;
    tone?: string;
}

export interface EmailResponse {
    success: boolean;
    email?: {
        subject: string;
        body: string;
        to: string;
    };
    error?: string;
}

export interface SendEmail {
    receiverEmail: string;
    emailMessage: string;
    subject: string;
}

export interface SendEmailResponse {
    message: string;
    success: boolean;
    error?: string;
}

class ApiService {
    private async makeRequest<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                headers: {
                    "Content-Type": "application/json",
                    ...options.headers,
                },
                ...options,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (err) {
            console.error("API request failed: ", err);
            throw err;
        }
    }

    async getStatus(): Promise<{ status: string }> {
        return this.makeRequest<{ status: string }>("/", {
            method: "GET",
        });
    }

    async sendChatMessage(data: ChatRequest): Promise<ChatResponse> {
        return this.makeRequest<ChatResponse>("/chat", {
            method: "POST",
            body: JSON.stringify(data),
        });
    }

    async generateEmail(data: EmailRequest): Promise<EmailResponse> {
        const requestBody = {
            receiver_email: data.receiverEmail,
            prompt: data.prompt,
            tone: data.tone || "",
        }

        console.log('About to send:', requestBody);
        return this.makeRequest<EmailResponse>("/generate-email", {
            method: "POST",
            body: JSON.stringify(requestBody),
        });
    }

    async sendEmail(data: SendEmail): Promise<SendEmailResponse> {
        const requestBody = {
            receiver_email: data.receiverEmail,
            email_message: data.emailMessage,
            subject: data.subject,
        }

        return this.makeRequest<SendEmailResponse>("/send-email", {
            method: "POST",
            body: JSON.stringify(requestBody),
        });
    }
}

export const apiService = new ApiService();
