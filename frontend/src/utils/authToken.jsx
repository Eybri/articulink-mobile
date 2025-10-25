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
    } catch (err) {
        console.log("Error removing token", err);
    }
};

// User data storage
export const storeUser = async (user) => {
    try {
        await AsyncStorage.setItem("user", JSON.stringify(user));
    } catch (err) {
        console.log("Error storing user", err);
    }
};

export const getUser = async () => {
    try {
        const userData = await AsyncStorage.getItem("user");
        return userData ? JSON.parse(userData) : null;
    } catch (err) {
        console.log("Error getting user", err);
        return null;
    }
};

export const removeUser = async () => {
    try {
        await AsyncStorage.removeItem("user");
    } catch (err) {
        console.log("Error removing user", err);
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

// Clear all auth data (logout)
export const clearAuth = async () => {
    try {
        await AsyncStorage.multiRemove(["access_token", "user"]);
    } catch (err) {
        console.log("Error clearing auth data", err);
    }
};