// navigation/AuthNavigator.js
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import StartUpScreen from '../screens/onboarding/startup';
import BrandIntroScreen from '../screens/onboarding/brand-intro';
import LoginScreen from "../screens/auth/login";
import RegisterScreen from "../screens/auth/register";
import VerifyOTPScreen from "../screens/auth/verify-otp";
import SecurityPrivacyScreen from "../screens/Extras/security";
import AboutScreen from "../screens/Extras/about";
import ForgotPasswordScreen from "../screens/auth/forgot-password";
import ResetPasswordScreen from "../screens/auth/reset-password";

const Stack = createNativeStackNavigator();

const AuthNavigator = ({ initialRoute = "Intro" }: { initialRoute?: string }) => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRoute}>
            <Stack.Screen name="Intro" component={StartUpScreen} />
            <Stack.Screen name="BrandIntro" component={BrandIntroScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="VerifyOTP" component={VerifyOTPScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
            <Stack.Screen name="SecurityPrivacy" component={SecurityPrivacyScreen} />
            <Stack.Screen name="About" component={AboutScreen} />
        </Stack.Navigator>
    );
};

export default AuthNavigator;