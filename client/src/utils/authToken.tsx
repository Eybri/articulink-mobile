import AsyncStorage from "@react-native-async-storage/async-storage";

// Token storage functions
export const storeToken = async (token: string): Promise<void> => {
    try {
        await AsyncStorage.setItem("access_token", token);
    } catch (err) {
        console.log("Error storing token", err);
    }
};

export const getToken = async (): Promise<string | null> => {
    try {
        return await AsyncStorage.getItem("access_token");
    } catch (err) {
        console.log("Error getting token", err);
        return null;
    }
};

export const removeToken = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem("access_token");
    } catch (err) {
        console.log("Error removing token", err);
    }
};

import { User } from "../context/AuthContext";

// User data storage
export const storeUser = async (userData: User): Promise<void> => {
    try {
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        console.log("User data stored");
    } catch (error) {
        console.log("Error storing user data:", error);
        throw error;
    }
};

export const getUser = async (): Promise<User | null> => {
    try {
        const userJson = await AsyncStorage.getItem('user');
        if (userJson) {
            const userData = JSON.parse(userJson) as User;
            // Check if user is deactivated
            if (userData.status === "inactive") {
                console.log("Stored user is deactivated - clearing");
                await clearAuth();
                return null;
            }
            return userData;
        }
        return null;
    } catch (error) {
        console.log("Error getting user data:", error);
        return null;
    }
};

export const removeUser = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem("user");
    } catch (err) {
        console.log("Error removing user", err);
    }
};

// Check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
    try {
        const token = await getToken();
        return token !== null;
    } catch (err) {
        console.log("Error checking authentication", err);
        return false;
    }
};

// Clear all auth data (logout)
export const clearAuth = async (): Promise<void> => {
    try {
        // Only clear access_token and user (no refresh_token)
        await AsyncStorage.multiRemove(["access_token", "user"]);
        console.log("Auth data cleared");
    } catch (err) {
        console.log("Error clearing auth data", err);
    }
};

// Kept for backward compatibility (for now, but can be removed later)
export const storeTokens = async (accessToken: string, refreshToken?: string): Promise<void> => {
    try {
        // Only store access token (ignore refreshToken)
        await AsyncStorage.setItem("access_token", accessToken);
        console.log("Access token stored (legacy function)");
    } catch (err) {
        console.log("Error storing tokens", err);
    }
};
