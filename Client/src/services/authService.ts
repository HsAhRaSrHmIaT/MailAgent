import type {
    LoginCredentials,
    RegisterData,
    AuthResponse,
    User,
} from "../types";

const API_BASE_URL = "http://localhost:8000/api";
const TOKEN_KEY = "auth_token";

// Token management
export const getToken = (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = (): void => {
    localStorage.removeItem(TOKEN_KEY);
};

// Login
export const login = async (
    credentials: LoginCredentials
): Promise<AuthResponse> => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.message || data.error || "Login failed",
            };
        }

        return {
            success: true,
            user: data.user,
            token: data.token,
            message: data.message,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Network error",
        };
    }
};

// Register
export const register = async (data: RegisterData): Promise<AuthResponse> => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: data.email,
                username: data.username,
                password: data.password,
            }),
        });

        const responseData = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error:
                    responseData.message ||
                    responseData.error ||
                    "Registration failed",
            };
        }

        return {
            success: true,
            user: responseData.user,
            token: responseData.token,
            message: responseData.message,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Network error",
        };
    }
};

// Get current user
export const getCurrentUser = async (): Promise<User> => {
    const token = getToken();

    if (!token) {
        throw new Error("No token found");
    }

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to get user");
    }

    const data = await response.json();
    return data.user;
};

// Update profile
export const updateProfile = async (userData: Partial<User>): Promise<User> => {
    const token = getToken();

    if (!token) {
        throw new Error("No token found");
    }

    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
    });

    if (!response.ok) {
        throw new Error("Failed to update profile");
    }

    const data = await response.json();
    return data.user;
};

// Logout
export const logout = (): void => {
    removeToken();
    // You can also call a backend logout endpoint here if needed
    // fetch(`${API_BASE_URL}/auth/logout`, { ... });
};
