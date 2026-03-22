import React, { useContext, useRef, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { YStack, Spinner } from "tamagui";
import AuthNavigator from "./AuthNavigator";
import TabNavigator from "./TabNavigator";
import { AuthContext, AuthContextType } from "../context/AuthContext";

const AppNavigator = () => {
    const { user, loading } = useContext(AuthContext) as AuthContextType;
    const wasLoggedIn = useRef(false);

    useEffect(() => {
        if (user) {
            wasLoggedIn.current = true;
        }
    }, [user]);

    // Show loading screen while checking authentication
    if (loading) {
        return (
            <YStack f={1} jc="center" ai="center" bg="#FAF8F4">
                <Spinner size="large" color="#1A4480" />
            </YStack>
        );
    }

    // After logout, go to BrandIntro. First-time users see onboarding.
    const authInitialRoute = wasLoggedIn.current ? "BrandIntro" : "Intro";

    return (
        <NavigationContainer>
            {user ? <TabNavigator /> : <AuthNavigator initialRoute={authInitialRoute} />}
        </NavigationContainer>
    );
};

export default AppNavigator;