import AsyncStorage from "@react-native-async-storage/async-storage";

// Token storage functions
export const storeToken = async (token) => {
    try {
        await AsyncStorage.setItem("access_token", token);
    } catch (err) {
        console.log("Error storing token", err);
    }
};

export const getToken = async () => {
    try {
        return await AsyncStorage.getItem("access_token");
    } catch (err) {
        console.log("Error getting token", err);
        return null;
    }
};

export const removeToken = async () => {
    try {
        await AsyncStorage.removeItem("access_token");
        await AsyncStorage.removeItem("refresh_token");
    } catch (err) {
        console.log("Error removing token", err);
    }
};

// Refresh token functions
export const storeRefreshToken = async (token) => {
    try {
        await AsyncStorage.setItem("refresh_token", token);
    } catch (err) {
        console.log("Error storing refresh token", err);
    }
};

export const getRefreshToken = async () => {
    try {
        return await AsyncStorage.getItem("refresh_token");
    } catch (err) {
        console.log("Error getting refresh token", err);
        return null;
    }
};

// Check if user is authenticated
export const isAuthenticated = async () => {
    try {
        const token = await getToken();
        return token !== null;
    } catch (err) {
        console.log("Error checking authentication", err);
        return false;
    }
};

// Clear all tokens (logout)
export const clearTokens = async () => {
    try {
        await AsyncStorage.multiRemove(["access_token", "refresh_token"]);
    } catch (err) {
        console.log("Error clearing tokens", err);
    }
};