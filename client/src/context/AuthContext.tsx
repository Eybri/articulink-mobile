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
    sendChatMessage: (messageText: string) => Promise<any>;
    clearChatHistory: () => Promise<any>;
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
    const sendChatMessage = async (messageText: string) => {
        try {
            const token = await getToken();
            if (!token) {
                throw new Error("Please log in to use the chatbot");
            }

            // Get existing conversation from AsyncStorage
            let conversation = [];
            try {
                const storedConversation = await AsyncStorage.getItem(`chat_conversation_${user?.id}`);
                if (storedConversation) {
                    conversation = JSON.parse(storedConversation);
                }
            } catch (storageError: any) {
                console.error("Error loading conversation:", storageError);
            }

            // Add user message to conversation
            const userMessage = {
                role: "user",
                content: messageText
            };

            // Add assistant's previous reply if exists
            const allMessages = [...conversation, userMessage];

            console.log("Sending to backend:", {
                messages: allMessages.map(msg => ({
                    role: msg.role,
                    content: msg.content.substring(0, 50) + (msg.content.length > 50 ? "..." : "")
                }))
            });

            const response = await axios.post(
                `${baseURL}/message`,
                {
                    messages: allMessages.map(msg => ({
                        role: msg.role,
                        content: msg.content
                    }))
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    timeout: 30000, // Increase timeout for longer responses
                }
            );

            console.log("Backend response:", {
                status: response.status,
                dataLength: response.data?.content?.length || 0,
                contentPreview: response.data?.content?.substring(0, 100) + "..."
            });

            // Add assistant's response to conversation
            const assistantMessage = {
                role: "assistant",
                content: response.data.content || response.data.reply || ""
            };

            const updatedConversation = [...allMessages, assistantMessage];

            // Save updated conversation (limit to last 20 messages to prevent storage bloat)
            const limitedConversation = updatedConversation.slice(-20);
            await AsyncStorage.setItem(
                `chat_conversation_${user?.id}`,
                JSON.stringify(limitedConversation)
            );

            return {
                success: true,
                data: response.data,
                response: response.data.content || response.data.reply || "I received your message.",
            };
        } catch (error: any) {
            console.error("Chatbot error details:", {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });

            let errorMessage = "Sorry, I'm having trouble responding. Please try again.";

            if (error.response?.status === 401) {
                errorMessage = "Session expired. Please log in again.";
            } else if (error.response?.data?.detail) {
                errorMessage = error.response.data.detail;
            } else if (error.message === "Please log in to use the chatbot") {
                errorMessage = error.message;
            } else if (error.code === 'ECONNABORTED') {
                errorMessage = "Request timed out. Please try a shorter message.";
            }

            return {
                success: false,
                error: errorMessage,
                statusCode: error.response?.status,
            };
        }
    };
    const clearChatHistory = async () => {
        try {
            if (user?.id) {
                await AsyncStorage.removeItem(`chat_conversation_${user.id}`);
            }
            return { success: true };
        } catch (error: any) {
            console.error("Error clearing chat history:", error);
            return { success: false, error: "Failed to clear chat history" };
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
            clearChatHistory
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;