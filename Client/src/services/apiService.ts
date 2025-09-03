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
    private ws: WebSocket | null = null;
    private wsUrl = import.meta.env.VITE_WS_URL || "ws://localhost:8000/api";
    private wsReady: Promise<void> | null = null;

    // private async makeRequest<T>(
    //     endpoint: string,
    //     options: RequestInit = {}
    // ): Promise<T> {
    //     try {
    //         const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    //             headers: {
    //                 "Content-Type": "application/json",
    //                 ...options.headers,
    //             },
    //             ...options,
    //         });
    //         if (!response.ok) {
    //             throw new Error(`HTTP error! status: ${response.status}`);
    //         }
    //         return await response.json();
    //     } catch (err) {
    //         console.error("API request failed: ", err);
    //         throw err;
    //     }
    // }

    // async getStatus(): Promise<{ status: string }> {
    //     return this.makeRequest<{ status: string }>("/", {
    //         method: "GET",
    //     });
    // }

    // WebSocket logic for chat messages only
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
            if (!this.ws) return reject(new Error("WebSocket not initialized. Cannot send message!"));
            this.ws.onmessage = (event) => {
                try {
                    const response = JSON.parse(event.data);
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
            this.ws.send(
                JSON.stringify({
                    role: "user",
                    type: "chat",
                    content: data.message,
                    ...(data.tone ? { tone: data.tone } : {}),
                })
            );
        });
    }

    // async generateEmail(data: EmailRequest): Promise<EmailResponse> {
    //     const requestBody = {
    //         receiver_email: data.receiverEmail,
    //         prompt: data.prompt,
    //         tone: data.tone || "",
    //     };
    //     console.log("About to send:", requestBody);
    //     return this.makeRequest<EmailResponse>("/generate-email", {
    //         method: "POST",
    //         body: JSON.stringify(requestBody),
    //     });
    // }

    async generateEmail(data: EmailRequest): Promise<EmailResponse> {
        await this.ensureWebSocket();
        return new Promise<EmailResponse>((resolve, reject) => {
            if (!this.ws) return reject(new Error("Websocket not initialized. Cannot generate email!"));
            this.ws.onmessage = (event) => {
                try {
                    const response = JSON.parse(event.data);
                    resolve(response);
                    console.log("Received response:", response);
                } catch (err) {
                    reject(err);
                }
            }
            this.ws.onerror = (err) => {
                reject(err);
            }
            this.ws.send(
                JSON.stringify({
                    role: "user",
                    type: "email",
                    receiverEmail: data.receiverEmail,
                    prompt: data.prompt,
                    ...(data.tone ? { tone: data.tone } : {}),
                })
            )
        });
    }

    // async sendEmail(data: SendEmail): Promise<SendEmailResponse> {
    //     const requestBody = {
    //         receiver_email: data.receiverEmail,
    //         email_message: data.emailMessage,
    //         subject: data.subject,
    //     };
    //     return this.makeRequest<SendEmailResponse>("/send-email", {
    //         method: "POST",
    //         body: JSON.stringify(requestBody),
    //     });
    // }

    isWebSocketConnected(): boolean {
        return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
    }
}

export const apiService = new ApiService();
