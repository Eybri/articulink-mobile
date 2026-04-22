import { useState, useContext, useRef, useEffect } from "react";
import { Animated, Dimensions, Alert } from "react-native";
import { AuthContext, AuthContextType } from "./../../../context/AuthContext";

const { height } = Dimensions.get('window');

/**
 * ViewModel for the Reset Password Screen.
 */
export const useResetPasswordViewModel = (navigation: any, email: string) => {
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { resetPassword } = useContext(AuthContext) as AuthContextType;

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideHeight = useRef(new Animated.Value(-height * 0.3)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
            Animated.spring(slideHeight, { toValue: 0, tension: 20, friction: 8, useNativeDriver: true }),
        ]).start();
    }, []);

    const handleReset = async () => {
        if (!otp || !newPassword || !confirmPassword) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }
        if (newPassword.length < 6) {
            Alert.alert("Error", "Password must be at least 6 characters");
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match");
            return;
        }

        setIsLoading(true);
        try {
            await resetPassword({
                email,
                otp_code: otp,
                new_password: newPassword
            });
            Alert.alert("Success", "Password reset successfully. Please login with your new password.", [
                { text: "Login", onPress: () => navigation.navigate("Login") }
            ]);
        } catch (err: any) {
            Alert.alert("Reset Failed", err.detail || "Invalid code or reset failed");
        } finally {
            setIsLoading(false);
        }
    };

    const passwordRequirements = {
        minLength: newPassword.length >= 6,
        hasNumber: /\d/.test(newPassword),
        hasUpperCase: /[A-Z]/.test(newPassword),
    };

    return {
        otp, setOtp,
        newPassword, setNewPassword,
        confirmPassword, setConfirmPassword,
        showPassword, setShowPassword,
        isLoading,
        handleReset,
        passwordRequirements,
        animations: {
            fadeAnim,
            slideHeight
        }
    };
};
