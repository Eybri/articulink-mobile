import React, { useState, useContext, useRef, useEffect } from "react";
import {
    Alert,
    Animated,
    Dimensions,
    StatusBar,
    Platform,
    KeyboardAvoidingView,
    Image as RNImage,
} from "react-native";
import {
    YStack,
    XStack,
    ZStack,
    Button,
    Input,
    SizableText,
    Circle,
    ScrollView,
    Spinner,
} from "tamagui";
import {
    Lock,
    Eye,
    EyeOff,
    Check,
    ArrowLeft,
    ArrowRight,
    Shield,
} from "@tamagui/lucide-icons";
import { AuthContext, AuthContextType } from "./../context/AuthContext";

const { width, height } = Dimensions.get('window');

const COLORS = {
    cream: '#FAF8F4',
    warmWhite: '#F5F1EA',
    sandLight: '#EDE8DF',
    sandMid: '#DDD6C8',
    royalBlue: '#1A4480',
    teal: '#2A8FA0',
    textDark: '#1C2B3A',
    textMid: '#4A5A6A',
    white: '#FFFFFF',
    success: '#10b981',
    error: '#ef4444',
};

const ResetPasswordScreen: React.FC<{ navigation: any, route: any }> = ({ navigation, route }) => {
    const { email } = route.params || {};
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

    const PasswordCheck: React.FC<{ met: boolean; text: string }> = ({ met, text }) => (
        <XStack ai="center" gap="$1.5">
            <YStack w={14} h={14} br={7} bg={met ? COLORS.success : COLORS.sandMid} jc="center" ai="center">
                {met && <Check size={8} color="white" />}
            </YStack>
            <SizableText size="$1" color={met ? COLORS.success : COLORS.textMid}>{text}</SizableText>
        </XStack>
    );

    return (
        <YStack f={1} bg={COLORS.royalBlue}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

            <ZStack pos="absolute" fullscreen pointerEvents="none">
                <RNImage
                    source={require('../../assets/images/bg.jpg')}
                    style={{ width: '100%', height: '100%', position: 'absolute' }}
                    resizeMode="cover"
                />
                <YStack fullscreen bg="black" opacity={0.25} />
                <YStack pos="absolute" b={0} l={0} r={0} h={height * 0.22} jc="center" ai="center" gap="$1">
                    <RNImage
                        source={require('../../assets/images/whitelogo.png')}
                        style={{ width: 80, height: 80 }}
                        resizeMode="contain"
                    />
                    <SizableText size="$3" fow="700" color="white" ls={0.3}>Articulink</SizableText>
                </YStack>
            </ZStack>

            <ScrollView
                f={1}
                contentContainerStyle={{ flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                    <Animated.View style={{ transform: [{ translateY: slideHeight }] }}>
                        <YStack
                            bg={COLORS.white}
                            borderBottomLeftRadius={40}
                            borderBottomRightRadius={40}
                            px="$5"
                            pt="$10"
                            pb="$8"
                            shadowColor="rgba(0,0,0,0.15)"
                            shadowRadius={15}
                            shadowOffset={{ width: 0, height: 8 }}
                            shadowOpacity={0.08}
                        >

                            <YStack gap="$1" mb="$5">
                                <SizableText size="$7" fow="800" color={COLORS.royalBlue}>Reset Password</SizableText>
                                <YStack w={30} h={3} bg={COLORS.teal} br={1.5} />
                                <SizableText size="$2" color={COLORS.textMid} mt="$2">
                                    Secure your account with a new password.
                                </SizableText>
                            </YStack>

                            <YStack gap="$4">
                                {/* ── Reset Code ────────────────── */}
                                <YStack gap="$1.5">
                                    <SizableText size="$1" fow="700" color={COLORS.textMid} ls={0.5} tt="uppercase" opacity={0.8}>6-Digit Code</SizableText>
                                    <XStack ai="center" bg={COLORS.cream} br={12} bw={1} bc={COLORS.sandMid} h={48} px="$3" gap="$2.5">
                                        <Shield size={16} color={COLORS.royalBlue} opacity={0.5} />
                                        <Input
                                            f={1} placeholder="Enter reset code" value={otp}
                                            onChangeText={setOtp} keyboardType="numeric" maxLength={6}
                                            bg="transparent" bw={0} size="$3" disabled={isLoading}
                                        />
                                    </XStack>
                                </YStack>

                                {/* ── New Password ───────────────── */}
                                <YStack gap="$1.5">
                                    <SizableText size="$1" fow="700" color={COLORS.textMid} ls={0.5} tt="uppercase" opacity={0.8}>New Password</SizableText>
                                    <XStack ai="center" bg={COLORS.cream} br={12} bw={1} bc={COLORS.sandMid} h={48} px="$3" gap="$2.5">
                                        <Lock size={16} color={COLORS.royalBlue} opacity={0.5} />
                                        <Input
                                            f={1} placeholder="Enter new password" value={newPassword}
                                            onChangeText={setNewPassword} secureTextEntry={!showPassword}
                                            bg="transparent" bw={0} size="$3" disabled={isLoading}
                                        />
                                        <Button
                                            bg="transparent" p={0}
                                            onPress={() => setShowPassword(!showPassword)}
                                            icon={showPassword ? <EyeOff size={16} color={COLORS.textMid} /> : <Eye size={16} color={COLORS.textMid} />}
                                        />
                                    </XStack>
                                    {newPassword.length > 0 && (
                                        <XStack gap="$3" mt="$1" flexWrap="wrap">
                                            <PasswordCheck met={passwordRequirements.minLength} text="6+ chars" />
                                            <PasswordCheck met={passwordRequirements.hasNumber} text="Number" />
                                            <PasswordCheck met={passwordRequirements.hasUpperCase} text="Uppercase" />
                                        </XStack>
                                    )}
                                </YStack>

                                {/* ── Confirm Password ───────────── */}
                                <YStack gap="$1.5">
                                    <SizableText size="$1" fow="700" color={COLORS.textMid} ls={0.5} tt="uppercase" opacity={0.8}>Confirm New Password</SizableText>
                                    <XStack ai="center" bg={COLORS.cream} br={12} bw={1} bc={COLORS.sandMid} h={48} px="$3" gap="$2.5">
                                        <Lock size={16} color={COLORS.royalBlue} opacity={0.5} />
                                        <Input
                                            f={1} placeholder="Re-enter new password" value={confirmPassword}
                                            onChangeText={setConfirmPassword} secureTextEntry={!showPassword}
                                            bg="transparent" bw={0} size="$3" disabled={isLoading}
                                        />
                                    </XStack>
                                    {confirmPassword.length > 0 && (
                                        <XStack ai="center" gap="$1.5" mt="$1">
                                            <Circle size={6} bg={newPassword === confirmPassword ? COLORS.success : COLORS.error} />
                                            <SizableText size="$1" fow="500" color={newPassword === confirmPassword ? COLORS.success : COLORS.error}>
                                                {newPassword === confirmPassword ? "Passwords match" : "Passwords don't match"}
                                            </SizableText>
                                        </XStack>
                                    )}
                                </YStack>

                                <Button
                                    bg={COLORS.royalBlue}
                                    h={52}
                                    br={16}
                                    mt="$2"
                                    onPress={handleReset}
                                    disabled={isLoading || !otp || !newPassword || newPassword !== confirmPassword}
                                    opacity={!otp || !newPassword || newPassword !== confirmPassword ? 0.6 : 1}
                                    pressStyle={{ scale: 0.98, opacity: 0.9 }}
                                    iconAfter={isLoading ? <Spinner color="white" /> : <ArrowRight size={18} color="white" />}
                                    elevation={4}
                                    shadowColor={COLORS.royalBlue}
                                >
                                    <SizableText color="white" fow="700" size="$3" ls={0.5}>RESET PASSWORD</SizableText>
                                </Button>
                            </YStack>
                        </YStack>
                    </Animated.View>
                </KeyboardAvoidingView>
            </ScrollView>
        </YStack>
    );
};

export default ResetPasswordScreen;
