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

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

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
            } catch (err) {
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
            async (error) => {
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
            const res = await axios.post(`${baseURL}/auth/login`, data);
            
            if (res.data.user?.status === "inactive") {
                throw { detail: "Account deactivated" };
            }
            
            await storeTokens(res.data.access_token);
            
            const userData = {
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
        } catch (err) {
            throw err.response?.data || { detail: "Login failed" };
        }
    };

    const logout = async () => {
        try {
            const token = await getToken();
            if (token) {
                try {
                    await axios.post(`${baseURL}/auth/logout`);
                } catch (err) {
                    // Silently fail backend logout
                }
            }
            
            await clearAuth();
            setUser(null);
        } catch (err) {
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
            
            const userData = {
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
        } catch (error) {
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

    return (
        <AuthContext.Provider value={{ 
            user, 
            loading, 
            login, 
            register, 
            logout, 
            checkAuth,
            fetchUserProfile,
            checkUserStatus
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;