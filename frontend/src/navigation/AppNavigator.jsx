import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { View, ActivityIndicator } from "react-native";
import AuthNavigator from "./AuthNavigator";
import TabNavigator from "./TabNavigator";
import { AuthContext } from "../context/AuthContext";

const AppNavigator = () => {
    const { user, loading } = useContext(AuthContext);
    
    // Show loading screen while checking authentication
    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#1e90ff" />
            </View>
        );
    }
    
    return (
        <NavigationContainer>
            {user ? <TabNavigator /> : <AuthNavigator />}
        </NavigationContainer>
    );
};

export default AppNavigator;