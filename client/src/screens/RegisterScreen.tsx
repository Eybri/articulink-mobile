import React, { useState, useContext, useRef, useEffect } from "react";
import {
    StyleSheet,
    Alert,
    Animated,
    Dimensions,
    StatusBar,
    Platform,
    KeyboardAvoidingView,
} from "react-native";
import {
    YStack,
    XStack,
    ZStack,
    Button,
    Input,
    SizableText,
    H1,
    Card,
    Circle,
    ScrollView,
    Theme,
} from "tamagui";
import {
    Eye,
    EyeOff,
    Mail,
    Lock,
    ArrowLeft,
    User,
    Sparkles,
    Check
} from "@tamagui/lucide-icons";
import { AuthContext, AuthContextType } from "./../context/AuthContext";

const { width, height } = Dimensions.get('window');

const RegisterScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useContext(AuthContext) as AuthContextType;

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    const validateForm = () => {
        if (!email || !password || !confirmPassword) return "All fields are required";
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
            const registerData = {
                email: email.toLowerCase().trim(),
                password: password,
                first_name: firstName.trim(),
                last_name: lastName.trim()
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

    const PasswordRequirement: React.FC<{ met: boolean; text: string }> = ({ met, text }) => (
        <XStack ai="center" gap="$2">
            <YStack
                w={16} h={16} br={8} bg={met ? '#10b981' : '#e2e8f0'}
                jc="center" ai="center"
            >
                {met && <Check size={10} color="white" />}
            </YStack>
            <SizableText size="$2" color={met ? '#059669' : '#94a3b8'}>
                {text}
            </SizableText>
        </XStack>
    );

    const passwordRequirements = {
        minLength: password.length >= 6,
        hasNumber: /\d/.test(password),
        hasUpperCase: /[A-Z]/.test(password),
    };

    return (
        <YStack flex={1} bg="#fafafa">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
            <StatusBar barStyle="dark-content" backgroundColor="#fafafa" />

            {/* Background */}
            <ZStack pos="absolute" fullscreen pointerEvents="none">
                <Circle pos="absolute" size={width * 0.6} bg="#dbeafe" opacity={0.4} t={-width * 0.2} r={-width * 0.2} />
                <Circle pos="absolute" size={width * 0.4} bg="#f0f9ff" opacity={0.4} b={height * 0.1} l={-width * 0.1} />
            </ZStack>

            <ScrollView f={1} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                {/* Header */}
                <XStack jc="space-between" ai="center" px="$6" pt="$10" pb="$4">
                    <Button
                        size="$4"
                        br={20}
                        bg="white"
                        elevation={3}
                        bw={1}
                        bc="#f1f5f9"
                        onPress={() => navigation.goBack()}
                        icon={<ArrowLeft size={24} color="#475569" />}
                    />
                    <XStack ai="center" gap="$2">
                        <YStack w={36} h={36} br={18} bg="white" jc="center" ai="center" elevation={3}>
                            <Sparkles size={22} color="#2563eb" fill="#2563eb" />
                        </YStack>
                        <SizableText size="$6" fow="700" color="#1e293b" ls={-0.5}>
                            Articulink
                        </SizableText>
                    </XStack>
                    <YStack w={40} />
                </XStack>

                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                    <YStack px="$6" gap="$8">
                        {/* Welcome Section */}
                        <YStack gap="$2">
                            <H1 size="$9" fow="700" color="#0f172a" ls={-0.5}>Create Account</H1>
                            <SizableText size="$4" color="#64748b" lh={22}>
                                Join thousands experiencing seamless communication
                            </SizableText>
                        </YStack>

                        {/* Form */}
                        <YStack gap="$5">
                            {/* Name Row */}
                            <XStack gap="$3">
                                <YStack f={1} gap="$2">
                                    <XStack ai="center" gap="$2">
                                        <User size={16} color="#64748b" />
                                        <SizableText size="$2" fow="600" color="#475569" ls={0.3}>First Name</SizableText>
                                    </XStack>
                                    <Input
                                        size="$4" br={16} bg="white" px="$4" h={56} bw={1} bc="#e2e8f0"
                                        placeholder="Optional"
                                        value={firstName} onChangeText={setFirstName} autoCapitalize="words"
                                        disabled={isLoading}
                                    />
                                </YStack>
                                <YStack f={1} gap="$2">
                                    <XStack ai="center" gap="$2">
                                        <User size={16} color="#64748b" />
                                        <SizableText size="$2" fow="600" color="#475569" ls={0.3}>Last Name</SizableText>
                                    </XStack>
                                    <Input
                                        size="$4" br={16} bg="white" px="$4" h={56} bw={1} bc="#e2e8f0"
                                        placeholder="Optional"
                                        value={lastName} onChangeText={setLastName} autoCapitalize="words"
                                        disabled={isLoading}
                                    />
                                </YStack>
                            </XStack>

                            {/* Email Input */}
                            <YStack gap="$2">
                                <XStack ai="center" gap="$2">
                                    <Mail size={16} color="#64748b" />
                                    <SizableText size="$2" fow="600" color="#475569" ls={0.3}>Email Address *</SizableText>
                                </XStack>
                                <Input
                                    size="$4" br={16} bg="white" px="$4" h={56} bw={1} bc="#e2e8f0"
                                    placeholder="Enter your email"
                                    value={email} onChangeText={setEmail} autoCapitalize="none"
                                    keyboardType="email-address" disabled={isLoading}
                                />
                            </YStack>

                            {/* Password Input */}
                            <YStack gap="$2">
                                <XStack ai="center" gap="$2">
                                    <Lock size={16} color="#64748b" />
                                    <SizableText size="$2" fow="600" color="#475569" ls={0.3}>Password *</SizableText>
                                </XStack>
                                <XStack pos="relative">
                                    <Input
                                        f={1} size="$4" br={16} bg="white" px="$4" pr={50} h={56} bw={1} bc="#e2e8f0"
                                        placeholder="Minimum 6 characters"
                                        value={password} onChangeText={setPassword} secureTextEntry={!showPassword}
                                        autoCapitalize="none" disabled={isLoading}
                                    />
                                    <Button
                                        pos="absolute" r={0} t={0} h={56} chromeless
                                        onPress={() => setShowPassword(!showPassword)}
                                        icon={showPassword ? <EyeOff size={20} color="#64748b" /> : <Eye size={20} color="#64748b" />}
                                    />
                                </XStack>
                                {password.length > 0 && (
                                    <YStack gap="$2" mt="$2">
                                        <PasswordRequirement met={passwordRequirements.minLength} text="At least 6 characters" />
                                        <PasswordRequirement met={passwordRequirements.hasNumber} text="Contains a number" />
                                        <PasswordRequirement met={passwordRequirements.hasUpperCase} text="Contains uppercase letter" />
                                    </YStack>
                                )}
                            </YStack>

                            {/* Confirm Password Input */}
                            <YStack gap="$2">
                                <XStack ai="center" gap="$2">
                                    <Lock size={16} color="#64748b" />
                                    <SizableText size="$2" fow="600" color="#475569" ls={0.3}>Confirm Password *</SizableText>
                                </XStack>
                                <XStack pos="relative">
                                    <Input
                                        f={1} size="$4" br={16} bg="white" px="$4" pr={50} h={56} bw={1} bc="#e2e8f0"
                                        placeholder="Re-enter your password"
                                        value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showConfirmPassword}
                                        autoCapitalize="none" disabled={isLoading}
                                    />
                                    <Button
                                        pos="absolute" r={0} t={0} h={56} chromeless
                                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                        icon={showConfirmPassword ? <EyeOff size={20} color="#64748b" /> : <Eye size={20} color="#64748b" />}
                                    />
                                </XStack>
                                {confirmPassword.length > 0 && (
                                    <XStack ai="center" gap="$2" mt="$1">
                                        <Circle size={8} bg={password === confirmPassword ? '#10b981' : '#ef4444'} />
                                        <SizableText size="$2" fow="500" color={password === confirmPassword ? '#059669' : '#dc2626'}>
                                            {password === confirmPassword ? "Passwords match" : "Passwords do not match"}
                                        </SizableText>
                                    </XStack>
                                )}
                            </YStack>

                            {/* Register Button */}
                            <Button
                                size="$5" br={16} bg="#2563eb" mt="$4"
                                onPress={handleRegister}
                                disabled={!email || !password || !confirmPassword || password !== confirmPassword || isLoading}
                                opacity={(!email || !password || !confirmPassword || password !== confirmPassword) ? 0.45 : 1}
                                pressStyle={{ scale: 0.98 }}
                                elevation={8} shadowColor="#2563eb"
                            >
                                <SizableText fow="600" color="white" ls={0.3}>
                                    {isLoading ? "Creating Account..." : "Create Account"}
                                </SizableText>
                            </Button>

                            {/* Login Link */}
                            <XStack jc="center" ai="center" mt="$2">
                                <SizableText size="$4" color="#64748b">Already have an account? </SizableText>
                                <Button chromeless p={0} onPress={() => navigation.navigate("Login")}>
                                    <SizableText size="$4" fow="600" color="#2563eb">Sign in</SizableText>
                                </Button>
                            </XStack>
                        </YStack>

                        {/* Security Badge */}
                        <XStack jc="center" ai="center" gap="$2">
                            <Lock size={14} color="#64748b" />
                            <SizableText size="$2" color="#64748b" ls={0.3}>
                                Your data is securely encrypted
                            </SizableText>
                        </XStack>
                    </YStack>
                </Animated.View>
            </ScrollView>
            </KeyboardAvoidingView>
        </YStack>
    );
};

export default RegisterScreen;