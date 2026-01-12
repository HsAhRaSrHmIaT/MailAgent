import React, { createContext, useContext, useState, useEffect } from "react";
import type {
    AuthContextType,
    User,
    LoginCredentials,
    RegisterData,
    AuthResponse,
    EmailConfigResponse,
} from "../types";
import * as authService from "../services/authService";
import { apiService } from "../services/apiService";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [emailConfigs, setEmailConfigs] = useState<EmailConfigResponse[]>([]);

    // Fetch email configurations
    const fetchEmailConfigs = async () => {
        try {
            const configs = await apiService.getEmailConfigs();
            // Filter to only show emails with passwords
            const configsWithPasswords = configs.filter(
                (config) => config.password && config.password.trim() !== "",
            );
            setEmailConfigs(configsWithPasswords);
        } catch (error) {
            console.error("Failed to fetch email configurations:", error);
            setEmailConfigs([]);
        }
    };

    // Initialize auth state from localStorage
    useEffect(() => {
        const initAuth = async () => {
            const storedToken = authService.getToken();
            if (storedToken) {
                setToken(storedToken);
                try {
                    const currentUser = await authService.getCurrentUser();
                    setUser(currentUser);
                    // Fetch email configs after user is loaded
                    await fetchEmailConfigs();
                } catch (error) {
                    authService.removeToken();
                    setToken(null);
                    console.error("Failed to fetch current user:", error);
                }
            }
            setIsLoading(false);
        };

        initAuth();
    }, []);

    const login = async (
        credentials: LoginCredentials,
    ): Promise<AuthResponse> => {
        try {
            const response = await authService.login(credentials);

            if (response.success && response.token && response.user) {
                setToken(response.token);
                setUser(response.user);
                authService.setToken(response.token);
                // Fetch email configs after successful login
                await fetchEmailConfigs();
            }

            return response;
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "Login failed",
            };
        }
    };

    const setUserDirectly = async (user: User, token: string) => {
        setToken(token);
        setUser(user);
        authService.setToken(token);
        await fetchEmailConfigs();
    };

    const register = async (data: RegisterData): Promise<AuthResponse> => {
        try {
            const response = await authService.register(data);

            if (response.success && response.token && response.user) {
                setToken(response.token);
                setUser(response.user);
                authService.setToken(response.token);
                // Fetch email configs after successful registration
                await fetchEmailConfigs();
            }

            return response;
        } catch (error) {
            return {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "Registration failed",
            };
        }
    };

    const logout = async () => {
        await authService.logout();
        setUser(null);
        setToken(null);
        setEmailConfigs([]);
    };

    const updateUser = async (userData: Partial<User>) => {
        const updatedUser = await authService.updateProfile(userData);
        setUser(updatedUser);
    };

    const value: AuthContextType = {
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        emailConfigs,
        login,
        register,
        logout,
        setUserDirectly,
        updateUser,
        refreshEmailConfigs: fetchEmailConfigs,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
