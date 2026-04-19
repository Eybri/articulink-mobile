import { useState, useContext, useEffect, useRef } from "react";
import { Animated, Dimensions, Alert } from "react-native";
import { AuthContext, AuthContextType } from "./../../../context/AuthContext";

const { height } = Dimensions.get('window');

/**
 * Custom hook managing the state and business logic for the Login Screen.
 */
export const useLoginViewModel = (navigation: any) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [typedLine1, setTypedLine1] = useState("");
    const [typedLine2, setTypedLine2] = useState("");

    const { login } = useContext(AuthContext) as AuthContextType;

    // ─── Animations ──────────────────────────────────────────────
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideHeight = useRef(new Animated.Value(height * 0.4)).current;
    const textFade = useRef(new Animated.Value(1)).current;
    const logoFade = useRef(new Animated.Value(0)).current;
    const logoScale = useRef(new Animated.Value(0.8)).current;
    const orbAnims = useRef([
        new Animated.Value(0),
        new Animated.Value(0),
        new Animated.Value(0)
    ]).current;

    // Typewriter effect
    useEffect(() => {
        const line1 = "Welcome";
        const line2 = "Back!";
        let i = 0;
        let j = 0;

        const delay = setTimeout(() => {
            const timer1 = setInterval(() => {
                if (i < line1.length) {
                    setTypedLine1(line1.slice(0, i + 1));
                    i++;
                } else {
                    clearInterval(timer1);
                    const timer2 = setInterval(() => {
                        if (j < line2.length) {
                            setTypedLine2(line2.slice(0, j + 1));
                            j++;
                        } else {
                            clearInterval(timer2);
                            setTimeout(() => {
                                Animated.sequence([
                                    Animated.timing(textFade, { toValue: 0, duration: 400, useNativeDriver: true }),
                                    Animated.parallel([
                                        Animated.timing(logoFade, { toValue: 1, duration: 600, useNativeDriver: true }),
                                        Animated.spring(logoScale, { toValue: 1, tension: 40, friction: 7, useNativeDriver: true }),
                                    ]),
                                ]).start();
                            }, 600);
                        }
                    }, 65);
                }
            }, 65);
        }, 300);

        return () => clearTimeout(delay);
    }, []);

    // Entry Animations
    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
            Animated.spring(slideHeight, { toValue: 0, tension: 20, friction: 8, useNativeDriver: true }),
            ...orbAnims.map((anim, i) =>
                Animated.loop(
                    Animated.sequence([
                        Animated.timing(anim, { toValue: 1, duration: 3000 + i * 1000, useNativeDriver: true }),
                        Animated.timing(anim, { toValue: 0, duration: 3000 + i * 1000, useNativeDriver: true }),
                    ])
                )
            ).map(a => { a.start(); return a; })
        ]).start();
    }, []);

    // ─── Handlers ────────────────────────────────────────────────
    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }
        if (!validateEmail(email)) {
            Alert.alert("Error", "Please enter a valid email address");
            return;
        }

        setIsLoading(true);
        try {
            await login({
                email: email.toLowerCase().trim(),
                password: password.trim()
            });
        } catch (err: any) {
            const detail = err.detail || "";
            if (detail.includes("verify your email")) {
                Alert.alert("Verification Required", detail, [
                    { text: "Verify Now", onPress: () => navigation.navigate("VerifyOTP", { email }) },
                    { text: "Cancel", style: "cancel" }
                ]);
            } else {
                Alert.alert("Login Failed", detail || "Invalid credentials");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return {
        // State
        email, setEmail,
        password, setPassword,
        isLoading,
        showPassword, setShowPassword,
        typedLine1, typedLine2,

        // Handlers
        handleLogin,

        // Animations
        animations: {
            fadeAnim,
            slideHeight,
            textFade,
            logoFade,
            logoScale,
            orbAnims
        }
    };
};
