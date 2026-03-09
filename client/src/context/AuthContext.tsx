import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import baseURL from "../utils/baseurl";
import {
    storeTokens,
    getToken,
    storeUser,
    getUser,
    clearAuth,
    isAuthenticated
} from "../utils/authToken";

export interface User {
    id?: string;
    email: string;
    first_name?: string;
    last_name?: string;
    role: string;
    profile_pic?: string;
    birthdate?: string;
    gender?: string;
    status: string;
    created_at?: string;
    updated_at?: string;
}

export interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (data: any) => Promise<any>;
    register: (data: any) => Promise<any>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<boolean>;
    fetchUserProfile: () => Promise<User>;
    checkUserStatus: () => boolean;
    setUser: (user: User | null) => void;
    sendChatMessage: (messageText: string, currentHistory: any[]) => Promise<any>;
    clearChatHistory: () => Promise<any>;
    fetchChatHistory: () => Promise<any[]>;
    deleteMessage: (timestamp: string) => Promise<any>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    // Load user from storage on app start
    useEffect(() => {
        const loadUser = async () => {
            try {
                const token = await getToken();
                const userData = await getUser();

                if (token && userData) {
                    if (userData.status === "inactive") {
                        await clearAuth();
                    } else {
                        setUser(userData);
                    }
                }
            } catch (err: any) {
                console.error("Error loading user:", err);
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, []);

    // Setup axios interceptors
    useEffect(() => {
        const requestInterceptor = axios.interceptors.request.use(
            async (config) => {
                const token = await getToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        const responseInterceptor = axios.interceptors.response.use(
            (response) => response,
            async (error: any) => {
                const { status, url, data } = error.response || {};

                if (data?.detail?.includes("deactivated")) {
                    await clearAuth();
                    setUser(null);
                }

                if (status === 401 && !url?.includes('/auth/login') && !url?.includes('/auth/register')) {
                    await clearAuth();
                    setUser(null);
                }

                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.request.eject(requestInterceptor);
            axios.interceptors.response.eject(responseInterceptor);
        };
    }, [user]);

    const register = async (data: any) => {
        try {
            const res = await axios.post(`${baseURL}/auth/register`, data);
            return res.data;
        } catch (err: any) {
            throw err.response?.data || { detail: "Registration failed" };
        }
    };

    const login = async (data: any) => {
        try {
            const res = await axios.post(`${baseURL}/auth/login`, data);

            if (res.data.user?.status === "inactive") {
                throw { detail: "Account deactivated" };
            }

            await storeTokens(res.data.access_token, res.data.refresh_token);

            const userData: User = {
                id: res.data.user?._id || res.data.user?.id,
                email: res.data.user?.email || data.email,
                first_name: res.data.user?.first_name,
                last_name: res.data.user?.last_name,
                role: res.data.user?.role || "user",
                profile_pic: res.data.user?.profile_pic,
                birthdate: res.data.user?.birthdate,
                gender: res.data.user?.gender,
                status: res.data.user?.status || "active",
                created_at: res.data.user?.created_at,
                updated_at: res.data.user?.updated_at
            };

            await storeUser(userData);
            setUser(userData);

            return { ...res.data, user: userData };
        } catch (err: any) {
            throw err.response?.data || { detail: "Login failed" };
        }
    };

    const logout = async () => {
        try {
            const token = await getToken();
            if (token) {
                try {
                    await axios.post(`${baseURL}/auth/logout`);
                } catch (err: any) {
                    // Silently fail backend logout
                }
            }

            await clearAuth();
            setUser(null);
        } catch (err: any) {
            await clearAuth();
            setUser(null);
        }
    };

    const fetchUserProfile = async () => {
        try {
            const response = await axios.get(`${baseURL}/auth/me`);

            if (response.data.status === "inactive") {
                await clearAuth();
                setUser(null);
                throw new Error("Account deactivated");
            }

            const userData: User = {
                id: response.data.id,
                email: response.data.email,
                first_name: response.data.first_name,
                last_name: response.data.last_name,
                role: response.data.role,
                profile_pic: response.data.profile_pic,
                birthdate: response.data.birthdate,
                gender: response.data.gender,
                status: response.data.status || "active",
                created_at: response.data.created_at,
                updated_at: response.data.updated_at
            };

            await storeUser(userData);
            setUser(userData);

            return userData;
        } catch (error: any) {
            if (error.response?.data?.detail?.includes("deactivated")) {
                await clearAuth();
                setUser(null);
                throw new Error("Account deactivated");
            }

            if (error.response?.status === 401) {
                throw new Error("Session expired");
            }

            throw error;
        }
    };

    const checkAuth = async () => {
        return await isAuthenticated();
    };

    const checkUserStatus = () => {
        return user?.status === "active";
    };
    const sendChatMessage = async (messageText: string, currentHistory: any[]) => {
        try {
            const token = await getToken();
            if (!token) {
                throw new Error("Please log in to use the chatbot");
            }

            // Construct new message list for Gemini context
            const userMessage = { role: "user", content: messageText };
            const allMessages = [...currentHistory, userMessage];

            const response = await axios.post(
                `${baseURL}/message`,
                {
                    messages: allMessages.map(msg => ({
                        role: msg.role || (msg.sender === 'bot' ? 'assistant' : 'user'),
                        content: msg.text || msg.content || ""
                    }))
                }
            );

            return {
                success: true,
                data: response.data,
                response: response.data.content || "I received your message.",
            };
        } catch (error: any) {
            console.error("Chatbot error details:", error);
            let errorMessage = "Sorry, I'm having trouble responding. Please try again.";
            if (error.response?.status === 401) errorMessage = "Session expired.";
            return { success: false, error: errorMessage, statusCode: error.response?.status };
        }
    };

    const fetchChatHistory = async () => {
        try {
            const response = await axios.get(`${baseURL}/history`);
            return response.data;
        } catch (error) {
            console.error("Error fetching chat history:", error);
            return [];
        }
    };

    const clearChatHistory = async () => {
        try {
            await axios.delete(`${baseURL}/history`);
            return { success: true };
        } catch (error: any) {
            console.error("Error clearing chat history:", error);
            return { success: false, error: "Failed to clear chat history" };
        }
    };
    const deleteMessage = async (timestamp: string) => {
        try {
            await axios.delete(`${baseURL}/history/${timestamp}`);
            return { success: true };
        } catch (error: any) {
            console.error("Error deleting message:", error);
            return { success: false, error: "Failed to delete message" };
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login,
            register,
            logout,
            checkAuth,
            fetchUserProfile,
            checkUserStatus,
            setUser,
            sendChatMessage,
            clearChatHistory,
            fetchChatHistory,
            deleteMessage
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;