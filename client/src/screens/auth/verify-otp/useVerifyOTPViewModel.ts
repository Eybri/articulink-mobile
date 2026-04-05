import { useState, useContext, useRef, useEffect } from "react";
import { Animated, Alert, TextInput } from "react-native";
import { AuthContext, AuthContextType } from "./../../../context/AuthContext";

/**
 * ViewModel hook for the OTP Verification Screen.
 */
export const useVerifyOTPViewModel = (navigation: any, email: string) => {
    const [otp, setOtp] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [timer, setTimer] = useState(60);
    
    const { verifyOTP, resendOTP } = useContext(AuthContext) as AuthContextType;
    const hiddenInputRef = useRef<TextInput>(null);

    // ─── Animations ──────────────────────────────────────────────
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const logoScale = useRef(new Animated.Value(0.85)).current;
    const logoFade = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, tension: 20, friction: 8, useNativeDriver: true }),
            Animated.timing(logoFade, { toValue: 1, duration: 600, delay: 200, useNativeDriver: true }),
            Animated.spring(logoScale, { toValue: 1, tension: 40, friction: 7, delay: 200, useNativeDriver: true }),
        ]).start();

        if (!email) {
            Alert.alert("Error", "No email provided for verification");
            navigation.navigate("Register");
        }
    }, [email]);

    // ─── Countdown Timer ─────────────────────────────────────────
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    // ─── Handlers ────────────────────────────────────────────────
    const handleVerify = async () => {
        if (otp.length < 6) {
            Alert.alert("Error", "Please enter the 6-digit code");
            return;
        }

        setIsLoading(true);
        try {
            await verifyOTP(email, otp);
            Alert.alert("Success", "Account verified successfully! You can now login.", [
                { text: "Login Now", onPress: () => navigation.navigate("Login") }
            ]);
        } catch (err: any) {
            const errorMessage = err.detail || err.message || "Verification failed";
            Alert.alert("Verification Failed", errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (timer > 0) return;
        setResendLoading(true);
        try {
            await resendOTP(email);
            Alert.alert("Success", "A new verification code has been sent to your email.");
            setTimer(60);
        } catch (err: any) {
            const errorMessage = err.detail || err.message || "Failed to resend code";
            Alert.alert("Error", errorMessage);
        } finally {
            setResendLoading(false);
        }
    };

    const formatTime = (s: number) => {
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    return {
        // State
        otp, setOtp,
        isLoading,
        resendLoading,
        timer,
        hiddenInputRef,
        
        // Handlers
        handleVerify,
        handleResend,
        formatTime,
        
        // Animations
        animations: {
            fadeAnim,
            slideAnim,
            logoScale,
            logoFade
        }
    };
};
