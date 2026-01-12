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
    credentials: LoginCredentials,
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
            requiresVerification: responseData.requiresVerification,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Network error",
        };
    }
};

// Verify OTP
export const verifyOTP = async (
    email: string,
    otp: string,
): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email,
            otp,
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "OTP verification failed");
    }

    return {
        success: true,
        user: data.user,
        token: data.token,
        message: data.message,
    };
};

// Resend OTP
export const resendOTP = async (
    email: string,
): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email,
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "Failed to resend OTP");
    }

    return {
        success: true,
        message: data.message,
    };
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
export const logout = async (): Promise<void> => {
    const token = getToken();

    if (token) {
        try {
            await fetch(`${API_BASE_URL}/auth/logout`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
        } catch (error) {
            console.error("Failed to log logout activity:", error);
        }
    }

    removeToken();
};

// Upload avatar
export const uploadAvatar = async (
    file: File,
): Promise<{ success: boolean; profilePicture?: string; error?: string }> => {
    try {
        const token = getToken();
        if (!token) {
            return {
                success: false,
                error: "Not authenticated",
            };
        }

        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`${API_BASE_URL}/auth/upload-avatar`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.detail || "Failed to upload avatar",
            };
        }

        return {
            success: true,
            profilePicture: data.profilePicture,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Upload failed",
        };
    }
};
