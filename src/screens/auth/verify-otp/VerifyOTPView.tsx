import React from "react";
import {
    Animated,
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
import { COLORS } from "./../../../constants/colors";

interface VerifyOTPViewProps {
    vm: any;
    email: string;
}

export const VerifyOTPView: React.FC<VerifyOTPViewProps> = ({ vm, email }) => {
    return (
        <YStack flex={1} bg={COLORS.cream}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <StatusBar barStyle="dark-content" backgroundColor={COLORS.cream} />

                <ScrollView f={1} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }}>
                    <YStack f={1} jc="center" py="$6">
                        <Animated.View style={{ opacity: vm.animations.fadeAnim, transform: [{ translateY: vm.animations.slideAnim }] }}>
                            <YStack px="$5" gap="$4">

                                {/* Unified Card */}
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
                                    {/* Icon + Title */}
                                    <YStack ai="center" gap="$3">
                                        <Animated.View style={{ opacity: vm.animations.logoFade, transform: [{ scale: vm.animations.logoScale }] }}>
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
维修                                            </SizableText>
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

                                    {/* Divider */}
                                    <YStack h={1} bg={COLORS.sandMid} opacity={0.5} mx="$2" />

                                    {/* OTP Input Section */}
                                    <YStack gap="$3">
                                        <SizableText size="$1" fow="700" color={COLORS.textMid} ls={0.5} tt="uppercase" ta="center">
                                            Enter verification code
                                        </SizableText>

                                        {/* Hidden input for keyboard */}
                                        <TextInput
                                            ref={vm.hiddenInputRef}
                                            value={vm.otp}
                                            onChangeText={vm.setOtp}
                                            keyboardType="number-pad"
                                            maxLength={6}
                                            editable={!vm.isLoading}
                                            caretHidden
                                            autoFocus
                                            style={{
                                                position: 'absolute',
                                                width: 1,
                                                height: 1,
                                                opacity: 0,
                                            }}
                                        />

                                        {/* Digit Boxes */}
                                        <Pressable onPress={() => {
                                            vm.hiddenInputRef.current?.blur();
                                            setTimeout(() => vm.hiddenInputRef.current?.focus(), 50);
                                        }}>
                                            <XStack jc="center" gap="$1.5">
                                                {[0, 1, 2, 3, 4, 5].map((i) => {
                                                    const digit = vm.otp[i] || "";
                                                    const isFocused = vm.otp.length === i;
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

                                        {/* Timer Row */}
                                        <XStack jc="center" ai="center" gap="$2">
                                            <Clock size={13} color={vm.timer > 0 ? COLORS.teal : COLORS.textMid} />
                                            <SizableText size="$2" fow="600" color={vm.timer > 0 ? COLORS.teal : COLORS.textMid}>
                                                {vm.timer > 0 ? `Code expires in ${vm.formatTime(vm.timer)}` : "Code expired"}
                                            </SizableText>
                                        </XStack>
                                    </YStack>

                                    {/* Submit Button */}
                                    <Button
                                        bg={COLORS.royalBlue}
                                        h={50}
                                        br={14}
                                        onPress={vm.handleVerify}
                                        disabled={vm.otp.length < 6 || vm.isLoading}
                                        opacity={vm.otp.length < 6 ? 0.5 : 1}
                                        pressStyle={{ scale: 0.98, opacity: 0.9 }}
                                        elevation={4}
                                        shadowColor={COLORS.royalBlue}
                                        iconAfter={vm.isLoading ? <Spinner color="white" /> : <ArrowRight size={16} color="white" />}
                                    >
                                        <SizableText color="white" fow="700" size="$2" ls={0.5}>
                                            {vm.isLoading ? "VERIFYING" : "VERIFY & ACTIVATE"}
                                        </SizableText>
                                    </Button>

                                    <YStack h={1} bg={COLORS.sandMid} opacity={0.5} mx="$2" />

                                    {/* Resend Logic */}
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
                                            bg={vm.timer > 0 ? COLORS.sandLight : COLORS.teal}
                                            onPress={vm.handleResend}
                                            disabled={vm.resendLoading || vm.timer > 0}
                                            opacity={vm.timer > 0 ? 0.6 : 1}
                                            pressStyle={{ scale: 0.98, opacity: 0.9 }}
                                            icon={vm.resendLoading
                                                ? <Spinner size="small" color={COLORS.white} />
                                                : <RotateCcw size={14} color={vm.timer > 0 ? COLORS.textMid : COLORS.white} />
                                            }
                                        >
                                            <SizableText
                                                size="$2"
                                                fow="600"
                                                color={vm.timer > 0 ? COLORS.textMid : COLORS.white}
                                            >
                                                {vm.resendLoading ? "Sending" : (vm.timer > 0 ? `${vm.timer}s` : "Resend")}
                                            </SizableText>
                                        </Button>
                                    </XStack>
                                </YStack>
                            </YStack>
                        </Animated.View>
                    </YStack>
                </ScrollView>
            </KeyboardAvoidingView>
        </YStack>
    );
};
