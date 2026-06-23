import { useState, useRef, useEffect, useContext } from 'react';
import { Animated, Alert, useWindowDimensions } from 'react-native';
import { AuthContext, AuthContextType } from './../../../context/AuthContext';

/**
 * ViewModel for the Settings Screen.
 */
export const useSettingsViewModel = (navigation: any) => {
    const auth = useContext(AuthContext) as AuthContextType;
    const { user, logout } = auth;
    
    const { width, height } = useWindowDimensions();

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, tension: 30, friction: 8, useNativeDriver: true }),
        ]).start();
    }, []);



    const handleLogout = () => {
        Alert.alert("Logout", "Sign out of your account?", [
            { text: "Cancel", style: 'cancel' },
            { text: "Logout", style: "destructive", onPress: () => {
                logout();
            }}
        ]);
    };

    const handleReview = () => {
        navigation.navigate("AppReview");
    };

    const handleMyFeedbacks = () => {
        navigation.navigate("MyFeedbacks");
    };

    return {
        user,
        width, height,

        handleLogout,
        handleReview,
        handleMyFeedbacks,
        animations: {
            fadeAnim,
            slideAnim
        }
    };
};
