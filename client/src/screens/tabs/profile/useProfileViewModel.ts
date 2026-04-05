import { useState, useContext, useCallback } from "react";
import { Alert, useWindowDimensions } from "react-native";
import { AuthContext, AuthContextType } from "./../../../context/AuthContext";
import { useFocusEffect } from "@react-navigation/native";

/**
 * ViewModel for the Profile Screen.
 */
export const useProfileViewModel = (navigation: any) => {
    const auth = useContext(AuthContext) as AuthContextType;
    const { logout, user, fetchUserProfile, loading: authLoading } = auth;
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { width, height } = useWindowDimensions();

    const analytics = {
        clarityScore: 84,
        totalSessions: 147,
        avgResponseSec: 3.2,
        streakDays: 14,
        todaySessions: 12,
        todayHours: 2.3,
        todayClarityPct: 84,
        todayProgressPct: 70,
    };

    const loadProfile = async () => {
        try {
            setError(null);
            await fetchUserProfile();
        } catch (error: any) {
            handleProfileError(error);
        } finally {
            setRefreshing(false);
        }
    };

    const handleProfileError = (error: any) => {
        if (error.message?.includes("Session expired") || error.response?.status === 401) {
            setError("Session expired");
            Alert.alert("Session Expired", "Please log in again", [
                { text: "OK", onPress: () => logout() },
            ]);
        } else {
            setError("Failed to load profile");
        }
    };

    useFocusEffect(useCallback(() => { loadProfile(); }, []));

    const onRefresh = () => { setRefreshing(true); loadProfile(); };

    const handleLogout = () => {
        Alert.alert("Logout", "Are you sure?", [
            { text: "Cancel" },
            { text: "Logout", onPress: async () => await logout() },
        ]);
    };

    const handleEditProfile = () => {
        navigation.navigate("EditProfile", { user });
    };

    const displayName = user?.username ? `@${user.username}` : "Articulink User";

    const memberSince = user?.created_at
        ? `Member since ${new Date(user.created_at).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
        })}`
        : null;

    return {
        user,
        authLoading,
        refreshing,
        error,
        width, height,
        analytics,
        loadProfile,
        onRefresh,
        handleLogout,
        handleEditProfile,
        displayName,
        memberSince
    };
};
