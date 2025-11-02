import AsyncStorage from "@react-native-async-storage/async-storage";

// Token storage functions
export const storeTokens = async (accessToken, refreshToken) => {
    try {
        await AsyncStorage.multiSet([
            ["access_token", accessToken],
            ["refresh_token", refreshToken]
        ]);
    } catch (err) {
        console.log("Error storing tokens", err);
    }
};

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

export const getRefreshToken = async () => {
    try {
        return await AsyncStorage.getItem("refresh_token");
    } catch (err) {
        console.log("Error getting refresh token", err);
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

export const removeRefreshToken = async () => {
    try {
        await AsyncStorage.removeItem("refresh_token");
    } catch (err) {
        console.log("Error removing refresh token", err);
    }
};

// User data storage
export const storeUser = async (userData) => {
    try {
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        console.log("User data stored");
    } catch (error) {
        console.log("Error storing user data:", error);
        throw error;
    }
};

export const getUser = async () => {
    try {
        const userJson = await AsyncStorage.getItem('user');
        if (userJson) {
            const userData = JSON.parse(userJson);
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
        await AsyncStorage.multiRemove(["access_token", "refresh_token", "user"]);
    } catch (err) {
        console.log("Error clearing auth data", err);
    }
};