import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import baseURL from "../utils/baseurl";
import { 
    storeToken, 
    storeRefreshToken, 
    getToken, 
    clearTokens,
    isAuthenticated 
} from "../utils/authToken";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const token = await getToken();
                const userData = await AsyncStorage.getItem("user");
                
                if (token && userData) {
                    setUser(JSON.parse(userData));
                }
            } catch (err) {
                console.log("Error loading user", err);
            } finally {
                setLoading(false);
            }
        };
        loadUser();
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
            const res = await axios.post(`${baseURL}/auth/login`, data);
            
            // Use authToken utilities to store tokens
            await storeToken(res.data.access_token);
            
            if (res.data.refresh_token) {
                await storeRefreshToken(res.data.refresh_token);
            }
            
            // Store user data if available
            if (res.data.user) {
                await AsyncStorage.setItem("user", JSON.stringify(res.data.user));
                setUser(res.data.user);
            } else {
                // Create minimal user object if not provided
                const userObj = { 
                    token: res.data.access_token,
                    email: data.email 
                };
                await AsyncStorage.setItem("user", JSON.stringify(userObj));
                setUser(userObj);
            }
            
            return res.data;
        } catch (err) {
            throw err.response?.data || { detail: "Login failed" };
        }
    };

    const logout = async () => {
        try {
            console.log("Starting logout process...");
            
            // Use authToken utility to clear tokens
            await clearTokens();
            
            // Also clear user data
            await AsyncStorage.removeItem("user");
            
            console.log("Setting user to null...");
            setUser(null);
            
            console.log("Logout completed successfully");
        } catch (err) {
            console.log("Error during logout", err);
        }
    };

    // You can also add a utility function to check authentication
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
            checkAuth 
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;