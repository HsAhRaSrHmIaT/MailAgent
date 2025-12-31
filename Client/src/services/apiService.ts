import type {
  ChatRequest,
  ChatResponse,
  EmailRequest,
  EmailResponse,
  EnvironmentVariable,
  EnvironmentVariableResponse,
  EmailConfig,
  EmailConfigResponse,
} from "../types";
import { getToken } from "./authService";

class ApiService {
  private ws: WebSocket | null = null;
  private apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
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
          new Error("WebSocket not initialized. Cannot send message!")
        );
      this.ws.onmessage = (event) => {
        try {
          const response = JSON.parse(event.data);

          // Handle 401 Unauthorized
          if (response.status === 401 || response.error === "Unauthorized") {
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
        })
      );
    });
  }

  async generateEmail(data: EmailRequest): Promise<EmailResponse> {
    await this.ensureWebSocket();
    return new Promise<EmailResponse>((resolve, reject) => {
      if (!this.ws)
        return reject(
          new Error("Websocket not initialized. Cannot generate email!")
        );
      this.ws.onmessage = (event) => {
        try {
          const response = JSON.parse(event.data);

          // Handle 401 Unauthorized
          if (response.status === 401 || response.error === "Unauthorized") {
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
        })
      );
    });
  }

  // HTTP request helper with auth
  async fetch(url: string, options: RequestInit = {}): Promise<Response> {
    const headers = this.getAuthHeaders();
    const response = await fetch(url, {
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
    key: string
  ): Promise<EnvironmentVariableResponse> {
    const response = await this.fetch(`${this.apiUrl}/env-vars/${key}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch environment variable: ${key}`);
    }
    return response.json();
  }

  async saveEnvironmentVariable(
    key: string,
    value: string
  ): Promise<EnvironmentVariableResponse> {
    const response = await this.fetch(`${this.apiUrl}/env-vars/`, {
      method: "POST",
      body: JSON.stringify({ key, value }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to save environment variable");
    }
    return response.json();
  }

  async updateEnvironmentVariable(
    key: string,
    value: string
  ): Promise<EnvironmentVariableResponse> {
    const response = await this.fetch(`${this.apiUrl}/env-vars/${key}`, {
      method: "PUT",
      body: JSON.stringify({ value }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to update environment variable");
    }
    return response.json();
  }

  // async deleteEnvironmentVariable(key: string): Promise<any> {
  //     const response = await this.fetch(`${this.apiUrl}/env-vars/${key}`, {
  //         method: "DELETE",
  //     });
  //     if (!response.ok) {
  //         throw new Error("Failed to delete environment variable");
  //     }
  //     return response.json();
  // }

  // async deleteAllEnvironmentVariables(): Promise<any> {
  //     const response = await this.fetch(`${this.apiUrl}/env-vars/`, {
  //         method: "DELETE",
  //     });
  //     if (!response.ok) {
  //         throw new Error("Failed to delete all environment variables");
  //     }
  //     return response.json();
  // }

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
      `${this.apiUrl}/email-configs/${encodeURIComponent(email)}`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch email configuration: ${email}`);
    }
    return response.json();
  }

  async saveEmailConfig(
    email: string,
    password: string
  ): Promise<EmailConfigResponse> {
    const response = await this.fetch(`${this.apiUrl}/email-configs/`, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to save email configuration");
    }
    return response.json();
  }

  async updateEmailConfig(
    email: string,
    password: string
  ): Promise<EmailConfigResponse> {
    const response = await this.fetch(
      `${this.apiUrl}/email-configs/${encodeURIComponent(email)}`,
      {
        method: "PUT",
        body: JSON.stringify({ password }),
      }
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to update email configuration");
    }
    return response.json();
  }

  async deleteEmailConfig(email: string): Promise<{ message: string }> {
    const response = await this.fetch(
      `${this.apiUrl}/email-configs/${encodeURIComponent(email)}`,
      {
        method: "DELETE",
      }
    );
    if (!response.ok) {
      throw new Error("Failed to delete email configuration");
    }
    return response.json();
  }

  async setActiveEmail(email: string): Promise<{ message: string }> {
    const response = await this.fetch(
      `${this.apiUrl}/email-configs/${encodeURIComponent(email)}/set-active`,
      {
        method: "PATCH",
      }
    );
    if (!response.ok) {
      throw new Error("Failed to set active email");
    }
    return response.json();
  }

  // async deleteAllEmailConfigs(): Promise<any> {
  //     const response = await this.fetch(`${this.apiUrl}/email-configs/`, {
  //         method: "DELETE",
  //     });
  //     if (!response.ok) {
  //         throw new Error("Failed to delete all email configurations");
  //     }
  //     return response.json();
  // }
}

export const apiService = new ApiService();
