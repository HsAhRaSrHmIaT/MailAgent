import React, { createContext, useContext, useState, useEffect } from "react";
import type {
    AuthContextType,
    User,
    LoginCredentials,
    RegisterData,
    AuthResponse,
} from "../types";
import * as authService from "../services/authService";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Initialize auth state from localStorage
    useEffect(() => {
        const initAuth = async () => {
            const storedToken = authService.getToken();
            if (storedToken) {
                setToken(storedToken);
                try {
                    const currentUser = await authService.getCurrentUser();
                    setUser(currentUser);
                } catch (error) {
                    // Token invalid or expired
                    authService.removeToken();
                    setToken(null);
                }
            }
            setIsLoading(false);
        };

        initAuth();
    }, []);

    const login = async (
        credentials: LoginCredentials
    ): Promise<AuthResponse> => {
        try {
            const response = await authService.login(credentials);

            if (response.success && response.token && response.user) {
                setToken(response.token);
                setUser(response.user);
                authService.setToken(response.token);
            }

            return response;
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "Login failed",
            };
        }
    };

    const register = async (data: RegisterData): Promise<AuthResponse> => {
        try {
            const response = await authService.register(data);

            if (response.success && response.token && response.user) {
                setToken(response.token);
                setUser(response.user);
                authService.setToken(response.token);
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

    const logout = () => {
        authService.logout();
        setUser(null);
        setToken(null);
    };

    const updateUser = async (userData: Partial<User>) => {
        try {
            const updatedUser = await authService.updateProfile(userData);
            setUser(updatedUser);
        } catch (error) {
            throw error;
        }
    };

    const value: AuthContextType = {
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        register,
        logout,
        updateUser,
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
