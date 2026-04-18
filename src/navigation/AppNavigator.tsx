import React, { useContext, useRef, useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { YStack, Spinner } from "tamagui";
import AuthNavigator from "./AuthNavigator";
import TabNavigator from "./TabNavigator";
import { AuthContext, AuthContextType } from "../context/AuthContext";
import { PrivacyConsentModal } from "../components/PrivacyConsentModal";

const AppNavigator = () => {
    const { user, loading, updateProfile } = useContext(AuthContext) as AuthContextType;
    const wasLoggedIn = useRef(false);
    const [privacyModalVisible, setPrivacyModalVisible] = useState(false);

    useEffect(() => {
        if (user) {
            wasLoggedIn.current = true;
            // Show privacy modal if not yet accepted
            if (user.privacy_accepted === false) {
                setPrivacyModalVisible(true);
            }
        }
    }, [user]);

    const handleAcceptPrivacy = async () => {
        try {
            await updateProfile({ privacy_accepted: true });
            setPrivacyModalVisible(false);
        } catch (err) {
            console.error("Failed to update privacy consent:", err);
            // Optionally show an alert, but usually this should work
        }
    };

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
            {user ? (
                <>
                    <TabNavigator />
                    <PrivacyConsentModal 
                        visible={privacyModalVisible} 
                        onAccept={handleAcceptPrivacy} 
                    />
                </>
            ) : (
                <AuthNavigator initialRoute={authInitialRoute} />
            )}
        </NavigationContainer>
    );
};

export default AppNavigator;