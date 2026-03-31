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
    Circle,
    ScrollView,
} from "tamagui";
import {
    ArrowLeft,
    Sparkles,
    ShieldCheck,
    RefreshCw
} from "@tamagui/lucide-icons";
import { AuthContext, AuthContextType } from "./../context/AuthContext";

const { width, height } = Dimensions.get('window');

const VerifyOTPScreen: React.FC<{ navigation: any, route: any }> = ({ navigation, route }) => {
    const { email } = route.params || {};
    const [otp, setOtp] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const { verifyOTP, resendOTP } = useContext(AuthContext) as AuthContextType;

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

        if (!email) {
            Alert.alert("Error", "No email provided for verification");
            navigation.navigate("Register");
        }
    }, [email]);

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
        setResendLoading(true);
        try {
            await resendOTP(email);
            Alert.alert("Success", "A new verification code has been sent to your email.");
        } catch (err: any) {
            const errorMessage = err.detail || err.message || "Failed to resend code";
            Alert.alert("Error", errorMessage);
        } finally {
            setResendLoading(false);
        }
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
                    <YStack px="$6" gap="$8" mt="$4">
                        {/* Title Section */}
                        <YStack gap="$2" ai="center">
                            <YStack w={80} h={80} br={40} bg="#eff6ff" jc="center" ai="center" mb="$4">
                                <ShieldCheck size={40} color="#2563eb" />
                            </YStack>
                            <H1 size="$8" fow="700" color="#0f172a" ls={-0.5} ta="center">Verify Email</H1>
                            <SizableText size="$4" color="#64748b" lh={22} ta="center">
                                We've sent a 6-digit verification code to
                            </SizableText>
                            <SizableText size="$4" color="#1e293b" fow="600" ta="center">
                                {email}
                            </SizableText>
                        </YStack>

                        {/* Input Section */}
                        <YStack gap="$6">
                            <YStack gap="$2">
                                <SizableText size="$2" fow="600" color="#475569" ls={0.3} ta="center">ENTER 6-DIGIT CODE</SizableText>
                                <Input
                                    size="$6"
                                    br={16}
                                    bg="white"
                                    px="$4"
                                    h={70}
                                    bw={1}
                                    bc="#e2e8f0"
                                    placeholder="000000"
                                    aria-label="OTP Input"
                                    value={otp}
                                    onChangeText={setOtp}
                                    keyboardType="number-pad"
                                    maxLength={6}
                                    disabled={isLoading}
                                    shadowColor="#e2e8f0"
                                    shadowRadius={10}
                                    shadowOffset={{ width: 0, height: 4 }}
                                    textAlign="center"
                                    fontWeight="700"
                                    letterSpacing={10}
                                    fontSize={28}
                                />
                            </YStack>

                            <Button
                                size="$5"
                                br={16}
                                bg="#2563eb"
                                onPress={handleVerify}
                                disabled={otp.length < 6 || isLoading}
                                opacity={otp.length < 6 ? 0.6 : 1}
                                pressStyle={{ scale: 0.98 }}
                                elevation={8}
                                shadowColor="#2563eb"
                            >
                                <SizableText fow="600" color="white" ls={0.3}>
                                    {isLoading ? "Verifying..." : "Verify & Activate"}
                                </SizableText>
                            </Button>

                            <XStack jc="center" ai="center" mt="$2">
                                <SizableText size="$4" color="#64748b">Didn't receive the code? </SizableText>
                                <Button 
                                    chromeless 
                                    p={0} 
                                    onPress={handleResend} 
                                    disabled={resendLoading}
                                >
                                    <XStack ai="center" gap="$1">
                                        {resendLoading && <RefreshCw size={14} color="#2563eb" />}
                                        <SizableText size="$4" fow="600" color="#2563eb">
                                            {resendLoading ? "Sending..." : "Resend"}
                                        </SizableText>
                                    </XStack>
                                </Button>
                            </XStack>
                        </YStack>

                        <YStack ai="center" mt="$10">
                            <Button 
                                chromeless 
                                onPress={() => navigation.navigate("Register")}
                            >
                                <SizableText size="$3" color="#94a3b8">Use a different email address</SizableText>
                            </Button>
                        </YStack>
                    </YStack>
                </Animated.View>
            </ScrollView>
            </KeyboardAvoidingView>
        </YStack>
    );
};

export default VerifyOTPScreen;
