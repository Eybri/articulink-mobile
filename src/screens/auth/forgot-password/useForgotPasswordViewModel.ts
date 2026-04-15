import { useState, useContext, useRef, useEffect } from "react";
import { Animated, Dimensions, Alert } from "react-native";
import { AuthContext, AuthContextType } from "./../../../context/AuthContext";

const { height } = Dimensions.get('window');

/**
 * ViewModel for the Forgot Password Screen.
 */
export const useForgotPasswordViewModel = (navigation: any) => {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { forgotPassword } = useContext(AuthContext) as AuthContextType;

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideHeight = useRef(new Animated.Value(-height * 0.3)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
            Animated.spring(slideHeight, { toValue: 0, tension: 20, friction: 8, useNativeDriver: true }),
        ]).start();
    }, []);

    const handleSendCode = async () => {
        if (!email) {
            Alert.alert("Error", "Please enter your email address");
            return;
        }

        setIsLoading(true);
        try {
            await forgotPassword(email.toLowerCase().trim());
            Alert.alert(
                "Success",
                "If an account is associated with this email, you will receive a reset code.",
                [{ text: "Continue", onPress: () => navigation.navigate("ResetPassword", { email: email.toLowerCase().trim() }) }]
            );
        } catch (err: any) {
            Alert.alert("Error", err.detail || "Failed to send reset code");
        } finally {
            setIsLoading(false);
        }
    };

    return {
        email, setEmail,
        isLoading,
        handleSendCode,
        animations: {
            fadeAnim,
            slideHeight
        }
    };
};
