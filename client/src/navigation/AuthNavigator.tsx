// navigation/AuthNavigator.js
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import StartUpScreen from "../screens/StartUpScreen";
import BrandIntroScreen from "../screens/BrandIntroScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import VerifyOTPScreen from "../screens/VerifyOTPScreen";
import SecurityPrivacyScreen from "../screens/Extras/SecurityPrivacyScreen";
import AboutScreen from "../screens/Extras/AboutScreen";

const Stack = createNativeStackNavigator();

const AuthNavigator = ({ initialRoute = "Intro" }: { initialRoute?: string }) => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRoute}>
            <Stack.Screen name="Intro" component={StartUpScreen} />
            <Stack.Screen name="BrandIntro" component={BrandIntroScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="VerifyOTP" component={VerifyOTPScreen} />
            <Stack.Screen name="SecurityPrivacy" component={SecurityPrivacyScreen} />
            <Stack.Screen name="About" component={AboutScreen} />
        </Stack.Navigator>
    );
};

export default AuthNavigator;