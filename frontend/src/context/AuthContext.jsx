import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import baseURL from "../utils/baseurl";
import { 
    storeToken, 
    getToken, 
    storeUser,
    getUser,
    clearAuth,
    isAuthenticated 
} from "../utils/authToken";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load user from storage on mount - NO verification
    useEffect(() => {
        const loadUser = async () => {
            try {
                const token = await getToken();
                const userData = await getUser();
                
                console.log("Loading user - Token exists:", !!token);
                console.log("User data exists:", !!userData);
                
                if (token && userData) {
                    setUser(userData);
                    console.log("✓ User restored from storage:", userData.email);
                } else {
                    console.log("No stored credentials found");
                    setUser(null);
                }
            } catch (err) {
                console.log("Error loading user", err);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, []);

    // Axios request interceptor - attach token to all requests
    useEffect(() => {
        const requestInterceptor = axios.interceptors.request.use(
            async (config) => {
                const token = await getToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                    console.log("✓ Token attached to request:", config.url);
                } else {
                    console.log("✗ No token available for request:", config.url);
                }
                return config;
            },
            (error) => {
                console.log("Request interceptor error:", error);
                return Promise.reject(error);
            }
        );

        // Axios response interceptor - handle 401 globally
        const responseInterceptor = axios.interceptors.response.use(
            (response) => response,
            async (error) => {
                const status = error.response?.status;
                const url = error.config?.url;
                
                console.log(`⚠️ ${status} ${error.response?.statusText || 'Error'} - ${url}`);
                
                // Only auto-logout on 401 if user is logged in AND it's not the login endpoint
                if (status === 401 && user && !url?.includes('/auth/login')) {
                    console.log("Token invalid/expired - clearing auth");
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
    }, []);

    const register = async (data) => {
        try {
            const res = await axios.post(`${baseURL}/auth/register`, data);
            return res.data;
        } catch (err) {
            throw err.response?.data || { detail: "Registration failed" };
        }
    };

    const login = async (data) => {
        try {
            console.log("Attempting login...");
            const res = await axios.post(`${baseURL}/auth/login`, data);
            console.log("Login response received");
            
            // Store token
            await storeToken(res.data.access_token);
            console.log("Token stored");
            
            // Store user data
            const userData = res.data.user || {
                id: res.data.id,
                email: data.email,
                first_name: res.data.first_name,
                last_name: res.data.last_name,
                role: res.data.role,
                profile_pic: res.data.profile_pic
            };
            
            await storeUser(userData);
            console.log("User data stored");
            setUser(userData);
            
            console.log("Login successful!");
            return res.data;
        } catch (err) {
            console.log("✗ Login failed:", err.response?.data || err.message);
            throw err.response?.data || { detail: "Login failed" };
        }
    };

    const logout = async () => {
        try {
            console.log("Logging out...");
            const token = await getToken();
            
            // Call backend logout if token exists (best effort)
            if (token) {
                try {
                    await axios.post(`${baseURL}/auth/logout`);
                    console.log("Backend logout successful");
                } catch (err) {
                    console.log("Backend logout failed (continuing anyway):", err.message);
                }
            }
            
            // Clear all local data
            await clearAuth();
            setUser(null);
            
            console.log("✓ Logout completed");
        } catch (err) {
            console.log("Logout error:", err);
            // Still clear local data even if backend call fails
            await clearAuth();
            setUser(null);
        }
    };

    const fetchUserProfile = async () => {
        try {
            const response = await axios.get(`${baseURL}/auth/me`);
            
            await storeUser(response.data);
            setUser(response.data);
            console.log("✓ Profile refreshed");
            return response.data;
        } catch (error) {
            console.log("✗ Error fetching profile:", error.response?.status);
            throw error;
        }
    };

    const checkAuth = async () => {
        return await isAuthenticated();
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
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;