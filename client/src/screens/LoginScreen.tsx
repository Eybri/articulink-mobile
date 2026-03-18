import React, { useState, useContext, useEffect } from "react";
import {
    StyleSheet,
    Alert,
    Dimensions,
    Animated,
    StatusBar,
    Platform,
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
    Spinner,
    Theme,
} from "tamagui";
import { AuthContext, AuthContextType } from "../context/AuthContext";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Shield } from "@tamagui/lucide-icons";

const { width } = Dimensions.get('window');

const LoginScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [fadeAnim] = useState(new Animated.Value(0));
    const [slideAnim] = useState(new Animated.Value(30));

    const { login } = useContext(AuthContext) as AuthContextType;

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

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const formatDeactivationMessage = (errorDetail: string) => {
        const timeMatch = errorDetail.match(/Available in (\d+) days/);
        const reasonMatch = errorDetail.match(/Reason: (.+)$/);
        let message = "";
        let title = "Account Deactivated";

        if (errorDetail.includes("temporarily deactivated")) {
            title = "Account Temporarily Deactivated";
            if (timeMatch) {
                const days = timeMatch[1];
                const daysNum = parseInt(days);
                message = `Your account is temporarily deactivated. It will be automatically reactivated in ${days} day${daysNum > 1 ? 's' : ''}.`;
            } else {
                message = "Your account is temporarily deactivated. Please try again later.";
            }
            if (reasonMatch && reasonMatch[1] && reasonMatch[1] !== "No reason provided") {
                message += `\n\nReason: ${reasonMatch[1]}`;
            }
        } else if (errorDetail.includes("Account deactivated")) {
            title = "Account Permanently Deactivated";
            message = "Your account has been permanently deactivated.";
            if (reasonMatch && reasonMatch[1] && reasonMatch[1] !== "No reason provided") {
                message += `\n\nReason: ${reasonMatch[1]}`;
            }
            message += "\n\nPlease contact support for more information.";
        }
        return { title, message };
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
        if (password.length < 6) {
            Alert.alert("Error", "Password must be at least 6 characters");
            return;
        }

        setIsLoading(true);
        try {
            await login({
                email: email.toLowerCase().trim(),
                password: password.trim()
            });
            setEmail("");
            setPassword("");
        } catch (err: any) {
            let errorMessage = "Invalid credentials";
            let errorTitle = "Login Failed";
            if (err.detail) {
                if (err.detail.includes("deactivated")) {
                    const { title, message } = formatDeactivationMessage(err.detail);
                    errorTitle = title;
                    errorMessage = message;
                } else {
                    errorMessage = err.detail;
                }
            } else if (err.message) {
                errorMessage = err.message;
            }
            Alert.alert(errorTitle, errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <YStack f={1} bg="#fafafa">
            <StatusBar barStyle="dark-content" backgroundColor="#fafafa" />

            {/* Background Orbs */}
            <ZStack pos="absolute" fullscreen pointerEvents="none">
                <Circle
                    pos="absolute"
                    size={width * 0.7}
                    br={500}
                    opacity={0.6}
                    bg="#dbeafe"
                    t={-width * 0.3}
                    r={-width * 0.2}
                />
                <Circle
                    pos="absolute"
                    size={width * 0.5}
                    br={500}
                    opacity={0.6}
                    bg="#f0f9ff"
                    b={-width * 0.2}
                    l={-width * 0.1}
                />
            </ZStack>

            <ScrollView f={1} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                    <YStack px="$6" py="$10" gap="$8">
                        
                        {/* Header */}
                        <YStack ai="center" gap="$4">
                            <XStack ai="center" gap="$3">
                                <YStack
                                    w={44} h={44} br={22} bg="white"
                                    jc="center" ai="center"
                                    elevation={3} shadowColor="#000" shadowOffset={{ width: 0, height: 2 }} shadowOpacity={0.1} shadowRadius={8}
                                >
                                    <Shield size={28} color="#2563eb" />
                                </YStack>
                                <SizableText size="$8" fow="700" color="#1e293b" ls={-0.5}>
                                    Articulink
                                </SizableText>
                            </XStack>
                            <YStack ai="center" gap="$1">
                                <H1 size="$9" fow="700" color="#0f172a" ls={-0.5} ta="center">
                                    Welcome Back
                                </H1>
                                <SizableText size="$4" color="#64748b" ta="center" lh={22} maxWidth={280}>
                                    Sign in to continue your communication journey
                                </SizableText>
                            </YStack>
                        </YStack>

                        {/* Form Card */}
                        <Card p="$6" br={24} bg="white" elevation={8} shadowColor="#000" shadowOpacity={0.08} shadowRadius={16} border borderColor="#f1f5f9">
                            <YStack gap="$4">
                                {/* Email Input */}
                                <XStack ai="center" bg="#f8fafc" br={16} bw={1} bc="#e2e8f0" ov="hidden">
                                    <YStack p="$3" pl="$4">
                                        <Mail size={20} color="#64748b" />
                                    </YStack>
                                    <Input
                                        f={1}
                                        placeholder="Email address"
                                        bg="transparent"
                                        bw={0}
                                        h={56}
                                        size="$4"
                                        value={email}
                                        onChangeText={setEmail}
                                        autoCapitalize="none"
                                        keyboardType="email-address"
                                        placeholderTextColor="#94a3b8"
                                        disabled={isLoading}
                                        autoCorrect={false}
                                        returnKeyType="next"
                                    />
                                </XStack>

                                {/* Password Input */}
                                <XStack ai="center" bg="#f8fafc" br={16} bw={1} bc="#e2e8f0" ov="hidden">
                                    <YStack p="$3" pl="$4">
                                        <Lock size={20} color="#64748b" />
                                    </YStack>
                                    <Input
                                        f={1}
                                        placeholder="Password"
                                        secureTextEntry={!showPassword}
                                        bg="transparent"
                                        bw={0}
                                        h={56}
                                        size="$4"
                                        value={password}
                                        onChangeText={setPassword}
                                        placeholderTextColor="#94a3b8"
                                        disabled={isLoading}
                                        autoCorrect={false}
                                        returnKeyType="done"
                                        onSubmitEditing={handleLogin}
                                    />
                                    <Button
                                        bg="transparent"
                                        p="$3"
                                        pr="$4"
                                        chromeless
                                        onPress={() => setShowPassword(!showPassword)}
                                        disabled={isLoading}
                                        icon={showPassword ? <EyeOff size={20} color="#64748b" /> : <Eye size={20} color="#64748b" />}
                                    />
                                </XStack>

                                {/* Login Button */}
                                <Button
                                    size="$5"
                                    bg="#2563eb"
                                    br={16}
                                    mt="$2"
                                    mb="$4"
                                    onPress={handleLogin}
                                    disabled={isLoading}
                                    pressStyle={{ scale: 0.98 }}
                                    elevation={8}
                                    shadowColor="#2563eb"
                                    iconAfter={isLoading ? <Spinner color="white" /> : <ArrowRight size={20} color="white" />}
                                >
                                    <SizableText fow="600" size="$4" color="white" ls={0.5}>
                                        {isLoading ? "" : "Sign In"}
                                    </SizableText>
                                </Button>

                                <XStack ai="center" gap="$3" mb="$4">
                                    <YStack f={1} h={1} bg="#e2e8f0" />
                                    <SizableText size="$2" color="#94a3b8" fow="500" ls={0.5}>
                                        or
                                    </SizableText>
                                    <YStack f={1} h={1} bg="#e2e8f0" />
                                </XStack>

                                {/* Register Link */}
                                <XStack jc="center" onPress={() => navigation.navigate("Register")}>
                                    <SizableText color="#64748b" size="$4">
                                        Don't have an account?{" "}
                                        <SizableText color="#2563eb" fow="600" ls={0.3}>
                                            Create one
                                        </SizableText>
                                    </SizableText>
                                </XStack>
                            </YStack>
                        </Card>

                        {/* Security Info */}
                        <XStack ai="center" jc="center" bg="#f8fafc" br={16} bw={1} bc="#e2e8f0" p="$4" gap="$2">
                            <Shield size={16} color="#64748b" opacity={0.7} />
                            <SizableText size="$2" color="#64748b" fow="500" ls={0.3}>
                                Your data is securely encrypted and protected
                            </SizableText>
                        </XStack>

                        {/* Footer Links */}
                        <XStack jc="center" ai="center" gap="$2" mt="$4">
                            <Button
                                chromeless
                                onPress={() => navigation.navigate('SecurityPrivacy')}
                                padding={0}
                            >
                                <SizableText size="$2" color="#94a3b8" fow="500">Privacy & Security</SizableText>
                            </Button>
                            <SizableText size="$2" color="#cbd5e1" fow="700">·</SizableText>
                            <Button
                                chromeless
                                onPress={() => navigation.navigate('About')}
                                padding={0}
                            >
                                <SizableText size="$2" color="#94a3b8" fow="500">About</SizableText>
                            </Button>
                        </XStack>
                    </YStack>
                </Animated.View>
            </ScrollView>
        </YStack>
    );
};

export default LoginScreen;