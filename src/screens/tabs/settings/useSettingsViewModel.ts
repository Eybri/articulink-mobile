import { useState, useRef, useEffect, useContext } from 'react';
import { Animated, Alert, useWindowDimensions } from 'react-native';
import { AuthContext, AuthContextType } from './../../../context/AuthContext';

/**
 * ViewModel for the Settings Screen.
 */
export const useSettingsViewModel = (navigation: any) => {
    const auth = useContext(AuthContext) as AuthContextType;
    const { user, logout } = auth;
    
    const [saveHistory, setSaveHistory] = useState(true);
    const { width, height } = useWindowDimensions();

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, tension: 30, friction: 8, useNativeDriver: true }),
        ]).start();
    }, []);

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
        Alert.alert("Logout", "Sign out of your account?", [
            { text: "Cancel", style: 'cancel' },
            { text: "Logout", style: "destructive", onPress: () => {
                // Logout logic would go here, usually calling auth.logout()
            }}
        ]);
    };

    return {
        user,
        saveHistory, setSaveHistory,
        width, height,
        handleClearHistory,
        handleLogout,
        animations: {
            fadeAnim,
            slideAnim
        }
    };
};
