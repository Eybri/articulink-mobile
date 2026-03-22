import React, { useState, useContext, useEffect, useRef } from "react";
import {
    Animated,
    StatusBar,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from "react-native";
import {
    YStack,
    XStack,
    ZStack,
    Button,
    Input,
    SizableText,
    Card,
    Circle,
    ScrollView,
    Spinner,
    AnimatePresence,
} from "tamagui";
import { AuthContext, AuthContextType } from "../context/AuthContext";
import {
    Eye,
    EyeOff,
    ArrowRight,
    Globe,
    Github,
    Twitter,
    Facebook,
    Mail,
    Lock
} from "@tamagui/lucide-icons";

const { width, height } = Dimensions.get('window');

// ─── Brand Palette ───────────────────────────────────────────────
const COLORS = {
    cream: '#FAF8F4',
    warmWhite: '#F5F1EA',
    sandLight: '#EDE8DF',
    sandMid: '#DDD6C8',
    deepNavy: '#0F2847',
    royalBlue: '#1A4480',
    mediumBlue: '#2A5FA8',
    teal: '#2A8FA0',
    tealLight: '#3DAFC4',
    orbBlue: '#C8D8EE',
    orbTeal: '#BEE4EC',
    orbSand: '#E8E0D0',
    textDark: '#1C2B3A',
    textMid: '#4A5A6A',
    white: '#FFFFFF',
};

const LoginScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { login } = useContext(AuthContext) as AuthContextType;

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideHeight = useRef(new Animated.Value(height * 0.4)).current;
    const orbAnims = useRef([
        new Animated.Value(0),
        new Animated.Value(0),
        new Animated.Value(0)
    ]).current;

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
            Alert.alert("Login Failed", err.detail || err.message || "Invalid credentials");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <YStack f={1} bg={COLORS.royalBlue}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.royalBlue} />

            {/* Background Composition */}
            <ZStack pos="absolute" fullscreen pointerEvents="none">
                <YStack fullscreen bg={COLORS.royalBlue} />

                {/* Blobs from inspiration image */}
                <Circle
                    size={width * 1.2}
                    bg={COLORS.mediumBlue}
                    opacity={0.3}
                    t={-width * 0.4}
                    r={-width * 0.4}
                    br={width * 0.6}
                />
                <Circle
                    size={width}
                    bg={COLORS.teal}
                    opacity={0.2}
                    t={-width * 0.2}
                    l={-width * 0.3}
                    br={width * 0.5}
                />

                {/* Floating Orbs (Glass Spheres) */}
                {orbAnims.map((anim, i) => {
                    const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -15 - i * 5] });
                    const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] });
                    const positions = [
                        { t: '15%', r: '10%', size: 80, tint: COLORS.orbBlue },
                        { t: '50%', l: '5%', size: 60, tint: COLORS.orbTeal },
                        { t: '5%', l: '10%', size: 100, tint: COLORS.orbSand },
                    ];
                    return (
                        <Animated.View key={i} style={{
                            position: 'absolute',
                            top: positions[i].t as any,
                            left: positions[i].l as any,
                            right: positions[i].r as any,
                            transform: [{ translateY }, { scale }]
                        }}>
                            <Circle
                                size={positions[i].size}
                                bg={positions[i].tint}
                                opacity={0.6}
                                shadowColor="rgba(0,0,0,0.2)"
                                shadowRadius={10}
                                shadowOffset={{ width: 4, height: 4 }}
                                shadowOpacity={0.3}
                            >
                                <Circle
                                    size={positions[i].size * 0.8}
                                    bg="white"
                                    opacity={0.2}
                                    t={positions[i].size * 0.05}
                                    l={positions[i].size * 0.05}
                                />
                            </Circle>
                        </Animated.View>
                    );
                })}

                {/* Welcome Back Header (On top of background) */}
                <YStack pos="absolute" t="18%" w="100%" px="$8" gap="$1">
                    <SizableText size="$10" fow="900" color="white" ls={-1}>
                        Welcome Back!
                    </SizableText>
                </YStack>
            </ZStack>

            <ScrollView
                f={1}
                contentContainerStyle={{ flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                    <Animated.View style={{ flex: 1, transform: [{ translateY: slideHeight }], justifyContent: 'flex-end' }}>
                        {/* The White Login Card */}
                        <YStack
                            bg={COLORS.white}
                            borderTopLeftRadius={40}
                            borderTopRightRadius={40}
                            px="$6"
                            pt="$6"
                            pb="$6"
                            mt={height * 0.38}
                            shadowColor="rgba(0,0,0,0.15)"
                            shadowRadius={15}
                            shadowOffset={{ width: 0, height: -8 }}
                            shadowOpacity={0.08}
                        >
                            <YStack gap="$4">
                                <YStack gap="$1">
                                    <SizableText size="$7" fow="800" color={COLORS.royalBlue}>Get Started</SizableText>
                                    <YStack w={30} h={3} bg={COLORS.teal} br={1.5} />
                                </YStack>

                                <YStack gap="$3">
                                    {/* Email Input Group */}
                                    <YStack gap="$1.5">
                                        <SizableText size="$1" fow="700" color={COLORS.textMid} ls={0.5} tt="uppercase" opacity={0.8}>Email address</SizableText>
                                        <XStack ai="center" bg={COLORS.cream} br={12} bw={1} bc={COLORS.sandMid} h={48} px="$3" gap="$2.5">
                                            <Mail size={16} color={COLORS.royalBlue} opacity={0.5} />
                                            <Input
                                                f={1}
                                                placeholder="Enter your email"
                                                value={email}
                                                onChangeText={setEmail}
                                                bg="transparent"
                                                bw={0}
                                                size="$3"
                                                autoCapitalize="none"
                                                keyboardType="email-address"
                                                placeholderTextColor={COLORS.textMid}
                                                disabled={isLoading}
                                            />
                                        </XStack>
                                    </YStack>

                                    {/* Password Input Group */}
                                    <YStack gap="$1.5">
                                        <XStack jc="space-between" ai="center">
                                            <SizableText size="$1" fow="700" color={COLORS.textMid} ls={0.5} tt="uppercase" opacity={0.8}>Password</SizableText>
                                            <Button chromeless p={0} h="auto" onPress={() => { }}>
                                                <SizableText size="$1" fow="700" color={COLORS.teal}>Forgot?</SizableText>
                                            </Button>
                                        </XStack>
                                        <XStack ai="center" bg={COLORS.cream} br={12} bw={1} bc={COLORS.sandMid} h={48} px="$3" gap="$2.5">
                                            <Lock size={16} color={COLORS.royalBlue} opacity={0.5} />
                                            <Input
                                                f={1}
                                                placeholder="Enter password"
                                                value={password}
                                                onChangeText={setPassword}
                                                secureTextEntry={!showPassword}
                                                bg="transparent"
                                                bw={0}
                                                size="$3"
                                                placeholderTextColor={COLORS.textMid}
                                                disabled={isLoading}
                                            />
                                            <Button
                                                bg="transparent"
                                                p={0}
                                                onPress={() => setShowPassword(!showPassword)}
                                                icon={showPassword ? <EyeOff size={16} color={COLORS.textMid} /> : <Eye size={16} color={COLORS.textMid} />}
                                            />
                                        </XStack>
                                    </YStack>

                                    {/* Sign In Button */}
                                    <Button
                                        bg={COLORS.royalBlue}
                                        h={52}
                                        br={16}
                                        mt="$2"
                                        onPress={handleLogin}
                                        disabled={isLoading}
                                        pressStyle={{ scale: 0.98, opacity: 0.9 }}
                                        iconAfter={isLoading ? <Spinner color="white" /> : <ArrowRight size={18} color="white" />}
                                        elevation={4}
                                        shadowColor={COLORS.royalBlue}
                                    >
                                        <SizableText color="white" fow="700" size="$3" ls={0.5}>SIGN IN</SizableText>
                                    </Button>

                                    {/* Social Sign In */}
                                    <YStack ai="center" gap="$3" mt="$1">
                                        <XStack ai="center" gap="$3" w="100%">
                                            <YStack f={1} h={1} bg={COLORS.sandMid} opacity={0.5} />
                                            <SizableText size="$1" color={COLORS.textMid} fow="600" opacity={0.6}>OR SIGN IN WITH</SizableText>
                                            <YStack f={1} h={1} bg={COLORS.sandMid} opacity={0.5} />
                                        </XStack>

                                        <XStack gap="$4" jc="center" ai="center">
                                            <Circle size={40} bg={COLORS.cream} bw={1} bc={COLORS.sandMid} pressStyle={{ bg: COLORS.sandLight }}>
                                                <Facebook size={16} color="#1877F2" />
                                            </Circle>
                                            <Circle size={40} bg={COLORS.cream} bw={1} bc={COLORS.sandMid} pressStyle={{ bg: COLORS.sandLight }}>
                                                <Twitter size={16} color="#1DA1F2" />
                                            </Circle>
                                            <Circle size={40} bg={COLORS.cream} bw={1} bc={COLORS.sandMid} pressStyle={{ bg: COLORS.sandLight }}>
                                                <Globe size={16} color={COLORS.deepNavy} />
                                            </Circle>
                                            <Circle size={40} bg={COLORS.cream} bw={1} bc={COLORS.sandMid} pressStyle={{ bg: COLORS.sandLight }}>
                                                <Github size={16} color={COLORS.deepNavy} />
                                            </Circle>
                                        </XStack>
                                    </YStack>

                                    {/* Sign Up Link */}
                                    <XStack jc="center" ai="center" gap="$2" mt="$1">
                                        <SizableText color={COLORS.textMid} size="$2">Don't have an account?</SizableText>
                                        <Button chromeless p={0} h="auto" onPress={() => navigation.navigate("Register")}>
                                            <SizableText color={COLORS.royalBlue} fow="700" size="$2" textDecorationLine="underline">Sign up</SizableText>
                                        </Button>
                                    </XStack>

                                    {/* Footer Links */}
                                    <XStack jc="center" ai="center" gap="$3" mt="$2" opacity={0.5}>
                                        <Button
                                            chromeless
                                            onPress={() => navigation.navigate('SecurityPrivacy')}
                                            padding={0}
                                            h="auto"
                                        >
                                            <SizableText size="$1" color={COLORS.textMid} fow="600">Privacy & Security</SizableText>
                                        </Button>
                                        <Circle size={3} bg={COLORS.sandMid} />
                                        <Button
                                            chromeless
                                            onPress={() => navigation.navigate('About')}
                                            padding={0}
                                            h="auto"
                                        >
                                            <SizableText size="$1" color={COLORS.textMid} fow="600">About</SizableText>
                                        </Button>
                                    </XStack>
                                </YStack>
                            </YStack>
                        </YStack>
                    </Animated.View>
                </KeyboardAvoidingView>
            </ScrollView>
        </YStack>
    );
};

export default LoginScreen;