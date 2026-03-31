import React, { useState, useContext, useEffect, useRef } from "react";
import {
    Animated,
    StatusBar,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    Alert,
    Image as RNImage,
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
    const [typedLine1, setTypedLine1] = useState("");
    const [typedLine2, setTypedLine2] = useState("");

    const { login } = useContext(AuthContext) as AuthContextType;

    // Animations
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

    // Typewriter → then crossfade to logo
    useEffect(() => {
        const line1 = "Welcome";
        const line2 = "Back!";
        let i = 0;
        let j = 0;
        const delay = setTimeout(() => {
            // Type line 1 first
            const timer1 = setInterval(() => {
                if (i < line1.length) {
                    setTypedLine1(line1.slice(0, i + 1));
                    i++;
                } else {
                    clearInterval(timer1);
                    // Then type line 2
                    const timer2 = setInterval(() => {
                        if (j < line2.length) {
                            setTypedLine2(line2.slice(0, j + 1));
                            j++;
                        } else {
                            clearInterval(timer2);
                            // Pause, then fade out text and fade in logo
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

    return (
        <YStack f={1} bg={COLORS.royalBlue}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
            <ZStack pos="absolute" fullscreen pointerEvents="none">
                <RNImage
                    source={require('../../assets/images/bg.jpg')}
                    style={{ width: '100%', height: '100%', position: 'absolute' }}
                    resizeMode="cover"
                />
                <YStack fullscreen bg="black" opacity={0.2} />
                <Animated.View style={{ opacity: textFade, position: 'absolute', top: '18%', width: '100%', paddingHorizontal: 32 }}>
                    <SizableText size="$10" fow="900" color="white" ls={-1}>{typedLine1}</SizableText>
                    {typedLine2.length > 0 && <SizableText size="$10" fow="900" color="white" ls={-1}>{typedLine2}</SizableText>}
                </Animated.View>
                <YStack pos="absolute" t={0} l={0} r={0} h={height * 0.42} jc="center" ai="center">
                    <Animated.View style={{ opacity: logoFade, transform: [{ scale: logoScale }] }}>
                        <RNImage
                            source={require('../../assets/images/whitelogo.png')}
                            style={{ width: 122, height: 122 }}
                            resizeMode="contain"
                        />
                    </Animated.View>
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
                                                disabled={isLoading}
                                            />
                                        </XStack>
                                    </YStack>

                                    <YStack gap="$1.5">
                                        <XStack jc="space-between" ai="center">
                                            <SizableText size="$1" fow="700" color={COLORS.textMid} ls={0.5} tt="uppercase" opacity={0.8}>Password</SizableText>
                                            <Button chromeless p={0} h="auto" onPress={() => navigation.navigate("ForgotPassword")}><SizableText size="$1" fow="700" color={COLORS.teal}>Forgot?</SizableText></Button>
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
                                    <YStack ai="center" gap="$3" mt="$1">
                                        <XStack ai="center" gap="$3" w="100%">
                                            <YStack f={1} h={1} bg={COLORS.sandMid} opacity={0.5} />
                                            <SizableText size="$1" color={COLORS.textMid} fow="600" opacity={0.6}>OR SIGN IN WITH</SizableText>
                                            <YStack f={1} h={1} bg={COLORS.sandMid} opacity={0.5} />
                                        </XStack>
                                        <XStack gap="$4" jc="center" ai="center">
                                            <Circle size={40} bg={COLORS.cream} bw={1} bc={COLORS.sandMid} pressStyle={{ bg: COLORS.sandLight }}><Facebook size={16} color="#1877F2" /></Circle>
                                            <Circle size={40} bg={COLORS.cream} bw={1} bc={COLORS.sandMid} pressStyle={{ bg: COLORS.sandLight }}><Twitter size={16} color="#1DA1F2" /></Circle>
                                            <Circle size={40} bg={COLORS.cream} bw={1} bc={COLORS.sandMid} pressStyle={{ bg: COLORS.sandLight }}><Globe size={16} color={COLORS.deepNavy} /></Circle>
                                            <Circle size={40} bg={COLORS.cream} bw={1} bc={COLORS.sandMid} pressStyle={{ bg: COLORS.sandLight }}><Github size={16} color={COLORS.deepNavy} /></Circle>
                                        </XStack>
                                    </YStack>
                                    <XStack jc="center" ai="center" gap="$2" mt="$1"><SizableText color={COLORS.textMid} size="$2">Don't have an account?</SizableText><Button chromeless p={0} h="auto" onPress={() => navigation.navigate("Register")}><SizableText color={COLORS.royalBlue} fow="700" size="$2" textDecorationLine="underline">Sign up</SizableText></Button></XStack>
                                    <XStack jc="center" ai="center" gap="$3" mt="$2" opacity={0.5}><Button chromeless onPress={() => navigation.navigate('SecurityPrivacy')} padding={0} h="auto"><SizableText size="$1" color={COLORS.textMid} fow="600">Privacy & Security</SizableText></Button><Circle size={3} bg={COLORS.sandMid} /><Button chromeless onPress={() => navigation.navigate('About')} padding={0} h="auto"><SizableText size="$1" color={COLORS.textMid} fow="600">About</SizableText></Button></XStack>
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