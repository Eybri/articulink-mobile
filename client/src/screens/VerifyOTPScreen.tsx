import React, { useState, useContext, useRef, useEffect } from "react";
import {
    Alert,
    Animated,
    Dimensions,
    StatusBar,
    Platform,
    KeyboardAvoidingView,

    TextInput,
    Pressable,
} from "react-native";
import {
    YStack,
    XStack,
    Button,
    Input,
    SizableText,
    ScrollView,
    Spinner,
} from "tamagui";
import {

    ShieldCheck,
    Mail,
    ArrowRight,
    Clock,
    RotateCcw,
} from "@tamagui/lucide-icons";
import { AuthContext, AuthContextType } from "./../context/AuthContext";

const { width } = Dimensions.get('window');

// ─── Brand Palette (consistent with Login/Register) ──────────────
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
    textDark: '#1C2B3A',
    textMid: '#4A5A6A',
    white: '#FFFFFF',
    success: '#10b981',
    successBg: '#ecfdf5',
};

const VerifyOTPScreen: React.FC<{ navigation: any, route: any }> = ({ navigation, route }) => {
    const { email } = route.params || {};
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
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 20,
                friction: 8,
                useNativeDriver: true,
            }),
            Animated.timing(logoFade, {
                toValue: 1,
                duration: 600,
                delay: 200,
                useNativeDriver: true,
            }),
            Animated.spring(logoScale, {
                toValue: 1,
                tension: 40,
                friction: 7,
                delay: 200,
                useNativeDriver: true,
            }),
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

    return (
        <YStack flex={1} bg={COLORS.cream}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <StatusBar barStyle="dark-content" backgroundColor={COLORS.cream} />

                <ScrollView f={1} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }}>
                    <YStack f={1} jc="center" py="$6">
                        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                            <YStack px="$5" gap="$4">

                                {/* ─── Single Unified Card ────────────── */}
                                <YStack
                                    bg={COLORS.white}
                                    br={24}
                                    px="$5"
                                    pt="$6"
                                    pb="$5"
                                    bw={1}
                                    bc={COLORS.sandMid}
                                    elevation={3}
                                    shadowColor={COLORS.sandMid}
                                    gap="$5"
                                >
                                    {/* ── Icon + Title ──────────────────── */}
                                    <YStack ai="center" gap="$3">
                                        <Animated.View style={{ opacity: logoFade, transform: [{ scale: logoScale }] }}>
                                            <YStack
                                                w={60} h={60} br={16}
                                                bg={COLORS.cream}
                                                jc="center" ai="center"
                                                bw={1} bc={COLORS.sandMid}
                                            >
                                                <ShieldCheck size={28} color={COLORS.teal} />
                                            </YStack>
                                        </Animated.View>

                                        <YStack gap="$1" ai="center">
                                            <SizableText size="$5" fow="800" color={COLORS.textDark} ls={-0.3}>
                                                Verify Your Email
                                            </SizableText>
                                            <YStack w={24} h={2.5} bg={COLORS.teal} br={1.5} mt="$1" />
                                        </YStack>

                                        <SizableText size="$2" color={COLORS.textMid} lh={18} ta="center">
                                            We've sent a 6-digit code to
                                        </SizableText>
                                        <XStack ai="center" gap="$1.5" bg={COLORS.warmWhite} px="$3" py="$1.5" br={10} bw={1} bc={COLORS.sandMid}>
                                            <Mail size={13} color={COLORS.royalBlue} opacity={0.7} />
                                            <SizableText size="$2" color={COLORS.royalBlue} fow="600">
                                                {email}
                                            </SizableText>
                                        </XStack>
                                    </YStack>

                                    {/* ── Divider ───────────────────────── */}
                                    <YStack h={1} bg={COLORS.sandMid} opacity={0.5} mx="$2" />

                                    {/* ── OTP Input ─────────────────────── */}
                                    <YStack gap="$3">
                                        <SizableText size="$1" fow="700" color={COLORS.textMid} ls={0.5} tt="uppercase" ta="center">
                                            Enter verification code
                                        </SizableText>

                                        {/* Hidden input for keyboard — must have non-zero size to stay focusable */}
                                        <TextInput
                                            ref={hiddenInputRef}
                                            value={otp}
                                            onChangeText={setOtp}
                                            keyboardType="number-pad"
                                            maxLength={6}
                                            editable={!isLoading}
                                            caretHidden
                                            autoFocus
                                            style={{
                                                position: 'absolute',
                                                width: 1,
                                                height: 1,
                                                opacity: 0,
                                            }}
                                        />

                                        {/* Digit Boxes — tap anywhere to re-open keyboard */}
                                        <Pressable onPress={() => {
                                            hiddenInputRef.current?.blur();
                                            setTimeout(() => hiddenInputRef.current?.focus(), 50);
                                        }}>
                                            <XStack jc="center" gap="$1.5">
                                                {[0, 1, 2, 3, 4, 5].map((i) => {
                                                    const digit = otp[i] || "";
                                                    const isFocused = otp.length === i;
                                                    return (
                                                        <YStack
                                                            key={i}
                                                            w={38} h={42}
                                                            br={10}
                                                            bg={digit ? COLORS.warmWhite : COLORS.cream}
                                                            bw={1.5}
                                                            bc={digit ? COLORS.teal : (isFocused ? COLORS.royalBlue : COLORS.sandMid)}
                                                            jc="center" ai="center"
                                                        >
                                                            <SizableText
                                                                size="$5" fow="700"
                                                                color={digit ? COLORS.textDark : COLORS.sandMid}
                                                            >
                                                                {digit || "·"}
                                                            </SizableText>
                                                        </YStack>
                                                    );
                                                })}
                                            </XStack>
                                        </Pressable>

                                        {/* Timer */}
                                        <XStack jc="center" ai="center" gap="$2">
                                            <Clock size={13} color={timer > 0 ? COLORS.teal : COLORS.textMid} />
                                            <SizableText size="$2" fow="600" color={timer > 0 ? COLORS.teal : COLORS.textMid}>
                                                {timer > 0 ? `Code expires in ${formatTime(timer)}` : "Code expired"}
                                            </SizableText>
                                        </XStack>
                                    </YStack>

                                    {/* ── Verify Button ─────────────────── */}
                                    <Button
                                        bg={COLORS.royalBlue}
                                        h={50}
                                        br={14}
                                        onPress={handleVerify}
                                        disabled={otp.length < 6 || isLoading}
                                        opacity={otp.length < 6 ? 0.5 : 1}
                                        pressStyle={{ scale: 0.98, opacity: 0.9 }}
                                        elevation={4}
                                        shadowColor={COLORS.royalBlue}
                                        iconAfter={isLoading ? <Spinner color="white" /> : <ArrowRight size={16} color="white" />}
                                    >
                                        <SizableText color="white" fow="700" size="$2" ls={0.5}>
                                            {isLoading ? "VERIFYING" : "VERIFY & ACTIVATE"}
                                        </SizableText>
                                    </Button>

                                    {/* ── Divider ───────────────────────── */}
                                    <YStack h={1} bg={COLORS.sandMid} opacity={0.5} mx="$2" />

                                    {/* ── Resend Row ────────────────────── */}
                                    <XStack jc="space-between" ai="center">
                                        <YStack f={1} mr="$3">
                                            <SizableText size="$2" color={COLORS.textDark} fow="600">
                                                Didn't get the code?
                                            </SizableText>
                                            <SizableText size="$1" color={COLORS.textMid}>
                                                Check spam folder or request a new one
                                            </SizableText>
                                        </YStack>

                                        <Button
                                            size="$3"
                                            br={12}
                                            bg={timer > 0 ? COLORS.sandLight : COLORS.teal}
                                            onPress={handleResend}
                                            disabled={resendLoading || timer > 0}
                                            opacity={timer > 0 ? 0.6 : 1}
                                            pressStyle={{ scale: 0.98, opacity: 0.9 }}
                                            icon={resendLoading
                                                ? <Spinner size="small" color={COLORS.white} />
                                                : <RotateCcw size={14} color={timer > 0 ? COLORS.textMid : COLORS.white} />
                                            }
                                        >
                                            <SizableText
                                                size="$2"
                                                fow="600"
                                                color={timer > 0 ? COLORS.textMid : COLORS.white}
                                            >
                                                {resendLoading ? "Sending" : (timer > 0 ? `${timer}s` : "Resend")}
                                            </SizableText>
                                        </Button>
                                    </XStack>
                                </YStack>

                                {/* ─── Footer Links ───────────────────── */}
                            </YStack>
                        </Animated.View>
                    </YStack>
                </ScrollView>
            </KeyboardAvoidingView>
        </YStack>
    );
};

export default VerifyOTPScreen;
