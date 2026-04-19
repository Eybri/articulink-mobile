import { useState, useContext, useCallback, useMemo } from "react";
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

    // Settings States (Moved from Settings Screen)
    const [saveHistory, setSaveHistory] = useState(true);
    const [vibrationFeedback, setVibrationFeedback] = useState(true);
    const [voiceVolume, setVoiceVolume] = useState(0.7);
    const [micSensitivity, setMicSensitivity] = useState(0.8);
    const [notifications, setNotifications] = useState(true);

    // ── Speech Stats ──
    const [stats, setStats] = useState<any>(null);
    const [statsLoading, setStatsLoading] = useState(true);

    const analytics = useMemo(() => {
        const totalDuration = stats?.total_duration_seconds ?? 0;
        return {
            clarityScore: 84, 
            totalSessions: stats?.total_recordings ?? 0,
            avgResponseSec: 3.2,
            streakDays: stats?.streak_days ?? 0,
            todaySessions: stats?.today_recordings ?? 0,
            todayHours: +(totalDuration / 3600).toFixed(1),
            todayClarityPct: 84,
            todayProgressPct: Math.min(100, Math.round(((stats?.today_recordings ?? 0) / 5) * 100)),
        };
    }, [stats]);

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

    const loadStats = async () => {
        try {
            setStatsLoading(true);
            const data = await auth.fetchSpeechStats();
            if (data) setStats(data);
        } catch (e) {
            console.error("Profile stats fetch failed:", e);
        } finally {
            setStatsLoading(false);
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

    useFocusEffect(useCallback(() => {
        loadProfile();
        loadStats();
    }, []));

    const onRefresh = () => {
        setRefreshing(true);
        loadProfile();
        loadStats();
    };

    const handleClearHistory = () => {
        Alert.alert(
            "Clear History",
            "Are you sure you want to clear all translation history? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Clear", style: "destructive", onPress: () => {
                        Alert.alert("Success", "Translation history cleared successfully!");
                    }
                }
            ]
        );
    };

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
        handleClearHistory,
        displayName,
        memberSince,
        // Settings exports
        saveHistory, setSaveHistory,
        vibrationFeedback, setVibrationFeedback,
        voiceVolume, setVoiceVolume,
        micSensitivity, setMicSensitivity,
        notifications, setNotifications,
        // Speech stats
        stats, statsLoading,
    };
};

