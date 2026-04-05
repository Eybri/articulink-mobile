import { useState, useContext, useRef, useEffect } from "react";
import { Animated, Dimensions, Alert } from "react-native";
import { AuthContext, AuthContextType } from "./../../../context/AuthContext";

const { height } = Dimensions.get('window');

/**
 * Custom hook managing the state and business logic for the Register Screen.
 * This separates "what the screen does" from "how it looks".
 */
export const useRegisterViewModel = (navigation: any) => {
    // Form State
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [gender, setGender] = useState("");
    const [birthdate, setBirthdate] = useState<Date | null>(null);
    
    // UI State
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showGenderSheet, setShowGenderSheet] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    const { register } = useContext(AuthContext) as AuthContextType;

    // ─── Animations ──────────────────────────────────────────────
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideHeight = useRef(new Animated.Value(-height * 0.3)).current;
    const logoFade = useRef(new Animated.Value(0)).current;
    const logoScale = useRef(new Animated.Value(0.8)).current;
    const textFade = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
            Animated.spring(slideHeight, { toValue: 0, tension: 20, friction: 8, useNativeDriver: true }),
        ]).start();

        const timeout = setTimeout(() => {
            Animated.parallel([
                Animated.timing(logoFade, { toValue: 1, duration: 600, useNativeDriver: true }),
                Animated.spring(logoScale, { toValue: 1, tension: 40, friction: 7, useNativeDriver: true }),
                Animated.timing(textFade, { toValue: 1, duration: 800, useNativeDriver: true }),
            ]).start();
        }, 400);
        
        return () => clearTimeout(timeout);
    }, []);

    // ─── Validation & Handlers ────────────────────────────────────
    const validateForm = () => {
        if (!email || !password || !confirmPassword) return "Email and password fields are required";
        if (password.length < 6) return "Password must be at least 6 characters long";
        if (password !== confirmPassword) return "Passwords do not match";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return "Please enter a valid email address";
        return null;
    };

    const handleRegister = async () => {
        const validationError = validateForm();
        if (validationError) {
            Alert.alert("Error", validationError);
            return;
        }

        setIsLoading(true);
        try {
            const registerData: any = {
                email: email.toLowerCase().trim(),
                password: password,
                first_name: firstName.trim() || undefined,
                last_name: lastName.trim() || undefined,
                gender: gender || undefined,
                birthdate: birthdate ? birthdate.toISOString().split('T')[0] : undefined,
            };
            await register(registerData);
            Alert.alert("Success", "Account created! Please verify your email with the code we sent.", [
                { text: "Verify OTP", onPress: () => navigation.navigate("VerifyOTP", { email: email.toLowerCase().trim() }) }
            ]);
        } catch (err: any) {
            const errorMessage = err.detail || err.message || "Registration failed. Please try again.";
            Alert.alert("Registration Failed", errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const passwordRequirements = {
        minLength: password.length >= 6,
        hasNumber: /\d/.test(password),
        hasUpperCase: /[A-Z]/.test(password),
    };

    return {
        // State
        email, setEmail,
        password, setPassword,
        confirmPassword, setConfirmPassword,
        firstName, setFirstName,
        lastName, setLastName,
        gender, setGender,
        birthdate, setBirthdate,
        showDatePicker, setShowDatePicker,
        showGenderSheet, setShowGenderSheet,
        showPassword, setShowPassword,
        showConfirmPassword, setShowConfirmPassword,
        isLoading,
        
        // Logic
        handleRegister,
        passwordRequirements,
        
        // Animations
        animations: {
            fadeAnim,
            slideHeight,
            logoFade,
            logoScale,
            textFade,
        }
    };
};
