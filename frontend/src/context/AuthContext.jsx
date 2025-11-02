import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import baseURL from "../utils/baseurl";
import { 
    storeTokens, 
    getToken, 
    getRefreshToken,
    storeUser,
    getUser,
    clearAuth,
    isAuthenticated 
} from "../utils/authToken";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load user from storage on mount
    useEffect(() => {
        const loadUser = async () => {
            try {
                const token = await getToken();
                const userData = await getUser();
                
                console.log("Loading user - Token exists:", !!token);
                console.log("User data exists:", !!userData);
                
                if (token && userData) {
                    // Check if user is deactivated (though this should be caught by token validation)
                    if (userData.status === "inactive") {
                        console.log("User is deactivated - clearing auth");
                        await clearAuth();
                        setUser(null);
                    } else {
                        setUser(userData);
                        console.log("✓ User restored from storage:", userData.email);
                    }
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

    // Function to refresh access token with deactivation handling
    const refreshAccessToken = async () => {
        try {
            const refreshToken = await getRefreshToken();
            if (!refreshToken) {
                throw new Error("No refresh token available");
            }

            console.log("Refreshing access token...");
            const response = await axios.post(`${baseURL}/auth/refresh`, {
                refresh_token: refreshToken
            });

            const { access_token, user: userData } = response.data;
            
            // Check if user is deactivated
            if (userData.status === "inactive") {
                console.log("User is deactivated during token refresh");
                await clearAuth();
                setUser(null);
                throw new Error("Account deactivated");
            }
            
            // Store new access token
            await storeToken(access_token);
            console.log("✓ Access token refreshed");
            
            return access_token;
        } catch (error) {
            console.log("✗ Token refresh failed:", error.response?.data || error.message);
            
            // Handle deactivation errors specifically
            if (error.response?.data?.detail?.includes("deactivated")) {
                await clearAuth();
                setUser(null);
                throw new Error("Account deactivated");
            }
            
            // Clear auth data if refresh fails
            await clearAuth();
            setUser(null);
            throw error;
        }
    };

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

        // Axios response interceptor - handle 401 globally with token refresh
        const responseInterceptor = axios.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;
                const status = error.response?.status;
                const url = originalRequest?.url;
                const errorDetail = error.response?.data?.detail;
                
                console.log(`⚠️ ${status} ${error.response?.statusText || 'Error'} - ${url}`);
                
                // Check for deactivation errors
                if (errorDetail && errorDetail.includes("deactivated")) {
                    console.log("Account deactivated detected - logging out");
                    await clearAuth();
                    setUser(null);
                    
                    // Show deactivation alert if it's a user-facing request
                    if (!url?.includes('/auth/') && user) {
                        // You might want to use a global alert system here
                        console.log("User was deactivated during app usage");
                    }
                    
                    return Promise.reject(error);
                }
                
                // If 401 and not already retrying and not login/refresh endpoints
                if (status === 401 && 
                    !originalRequest._retry && 
                    !url?.includes('/auth/login') &&
                    !url?.includes('/auth/refresh')) {
                    
                    originalRequest._retry = true;
                    
                    try {
                        console.log("Token expired - attempting refresh...");
                        const newToken = await refreshAccessToken();
                        
                        // Retry original request with new token
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        console.log("✓ Retrying request with new token");
                        return axios(originalRequest);
                        
                    } catch (refreshError) {
                        console.log("Token refresh failed - logging out");
                        await clearAuth();
                        setUser(null);
                        return Promise.reject(refreshError);
                    }
                }
                
                // For other 401 errors or if refresh fails
                if (status === 401 && user && !url?.includes('/auth/login')) {
                    console.log("Authentication failed - clearing auth");
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
            
            // Check if user is deactivated (shouldn't happen if backend blocks it, but just in case)
            if (res.data.user?.status === "inactive") {
                throw { 
                    detail: "Account deactivated. Please contact support." 
                };
            }
            
            // Store both tokens
            await storeTokens(res.data.access_token, res.data.refresh_token);
            console.log("Tokens stored");
            
            // Store user data
            const userData = res.data.user || {
                id: res.data.id,
                email: data.email,
                first_name: res.data.first_name,
                last_name: res.data.last_name,
                role: res.data.role,
                profile_pic: res.data.profile_pic,
                status: res.data.status || "active"
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

    const logout = async (allDevices = false) => {
        try {
            console.log("Logging out...");
            const token = await getToken();
            
            // Call backend logout if token exists (best effort)
            if (token) {
                try {
                    if (allDevices) {
                        await axios.post(`${baseURL}/auth/logout-all`);
                        console.log("Backend logout from all devices successful");
                    } else {
                        await axios.post(`${baseURL}/auth/logout`);
                        console.log("Backend logout successful");
                    }
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
            
            // Check if user got deactivated
            if (response.data.status === "inactive") {
                console.log("User profile shows deactivated - logging out");
                await clearAuth();
                setUser(null);
                throw new Error("Account deactivated");
            }
            
            await storeUser(response.data);
            setUser(response.data);
            console.log("✓ Profile refreshed");
            return response.data;
        } catch (error) {
            console.log("✗ Error fetching profile:", error.response?.status);
            
            // Handle deactivation
            if (error.response?.data?.detail?.includes("deactivated")) {
                await clearAuth();
                setUser(null);
                throw new Error("Account deactivated");
            }
            
            throw error;
        }
    };

    const checkAuth = async () => {
        return await isAuthenticated();
    };

    // Function to check if current user is deactivated
    const checkUserStatus = () => {
        return user?.status === "active";
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
            refreshAccessToken,
            checkUserStatus // Export status checker
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;