import React from "react";
import {
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
    ArrowRight,
    Shield,
} from "@tamagui/lucide-icons";
import { COLORS } from "./../../../constants/colors";

const { height } = Dimensions.get('window');

interface PasswordCheckProps {
    met: boolean;
    text: string;
}

const PasswordCheck: React.FC<PasswordCheckProps> = ({ met, text }) => (
    <XStack ai="center" gap="$1.5">
        <YStack w={14} h={14} br={7} bg={met ? COLORS.success : COLORS.sandMid} jc="center" ai="center">
            {met && <Check size={8} color="white" />}
        </YStack>
        <SizableText size="$1" color={met ? COLORS.success : COLORS.textMid}>{text}</SizableText>
    </XStack>
);

interface ResetPasswordViewProps {
    vm: any;
    navigation: any;
}

export const ResetPasswordView: React.FC<ResetPasswordViewProps> = ({ vm, navigation }) => {
    return (
        <YStack f={1} bg={COLORS.royalBlue}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

            <ZStack pos="absolute" fullscreen pointerEvents="none">
                <RNImage
                    source={require('../../../../assets/images/bg.jpg')}
                    style={{ width: '100%', height: '100%', position: 'absolute' }}
                    resizeMode="cover"
                />
                <YStack fullscreen bg="black" opacity={0.25} />
                <YStack pos="absolute" b={0} l={0} r={0} h={height * 0.22} jc="center" ai="center" gap="$1">
                    <RNImage
                        source={require('../../../../assets/images/icon-white.png')}
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
                    <Animated.View style={{ transform: [{ translateY: vm.animations.slideHeight }] }}>
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
                                {/* Reset Code */}
                                <YStack gap="$1.5">
                                    <SizableText size="$1" fow="700" color={COLORS.textMid} ls={0.5} tt="uppercase" opacity={0.8}>6-Digit Code</SizableText>
                                    <XStack ai="center" bg={COLORS.cream} br={12} bw={1} bc={COLORS.sandMid} h={48} px="$3" gap="$2.5">
                                        <Shield size={16} color={COLORS.royalBlue} opacity={0.5} />
                                        <Input
                                            f={1} placeholder="Enter reset code" value={vm.otp}
                                            onChangeText={vm.setOtp} keyboardType="numeric" maxLength={6}
                                            bg="transparent" bw={0} size="$3" disabled={vm.isLoading}
                                        />
                                    </XStack>
                                </YStack>

                                {/* New Password */}
                                <YStack gap="$1.5">
                                    <SizableText size="$1" fow="700" color={COLORS.textMid} ls={0.5} tt="uppercase" opacity={0.8}>New Password</SizableText>
                                    <XStack ai="center" bg={COLORS.cream} br={12} bw={1} bc={COLORS.sandMid} h={48} px="$3" gap="$2.5">
                                        <Lock size={16} color={COLORS.royalBlue} opacity={0.5} />
                                        <Input
                                            f={1} placeholder="Enter new password" value={vm.newPassword}
                                            onChangeText={vm.setNewPassword} secureTextEntry={!vm.showPassword}
                                            bg="transparent" bw={0} size="$3" disabled={vm.isLoading}
                                        />
                                        <Button
                                            bg="transparent" p={0}
                                            onPress={() => vm.setShowPassword(!vm.showPassword)}
                                            icon={vm.showPassword ? <EyeOff size={16} color={COLORS.textMid} /> : <Eye size={16} color={COLORS.textMid} />}
                                        />
                                    </XStack>
                                    {vm.newPassword.length > 0 && (
                                        <XStack gap="$3" mt="$1" flexWrap="wrap">
                                            <PasswordCheck met={vm.passwordRequirements.minLength} text="6+ chars" />
                                            <PasswordCheck met={vm.passwordRequirements.hasNumber} text="Number" />
                                            <PasswordCheck met={vm.passwordRequirements.hasUpperCase} text="Uppercase" />
                                        </XStack>
                                    )}
                                </YStack>

                                {/* Confirm Password */}
                                <YStack gap="$1.5">
                                    <SizableText size="$1" fow="700" color={COLORS.textMid} ls={0.5} tt="uppercase" opacity={0.8}>Confirm New Password</SizableText>
                                    <XStack ai="center" bg={COLORS.cream} br={12} bw={1} bc={COLORS.sandMid} h={48} px="$3" gap="$2.5">
                                        <Lock size={16} color={COLORS.royalBlue} opacity={0.5} />
                                        <Input
                                            f={1} placeholder="Re-enter new password" value={vm.confirmPassword}
                                            onChangeText={vm.setConfirmPassword} secureTextEntry={!vm.showPassword}
                                            bg="transparent" bw={0} size="$3" disabled={vm.isLoading}
                                        />
                                    </XStack>
                                    {vm.confirmPassword.length > 0 && (
                                        <XStack ai="center" gap="$1.5" mt="$1">
                                            <Circle size={6} bg={vm.newPassword === vm.confirmPassword ? COLORS.success : COLORS.error} />
                                            <SizableText size="$1" fow="500" color={vm.newPassword === vm.confirmPassword ? COLORS.success : COLORS.error}>
                                                {vm.newPassword === vm.confirmPassword ? "Passwords match" : "Passwords don't match"}
                                            </SizableText>
                                        </XStack>
                                    )}
                                </YStack>

                                <Button
                                    bg={COLORS.royalBlue}
                                    h={52}
                                    br={16}
                                    mt="$2"
                                    onPress={vm.handleReset}
                                    disabled={vm.isLoading || !vm.otp || !vm.newPassword || vm.newPassword !== vm.confirmPassword}
                                    opacity={!vm.otp || !vm.newPassword || vm.newPassword !== vm.confirmPassword ? 0.6 : 1}
                                    pressStyle={{ scale: 0.98, opacity: 0.9 }}
                                    iconAfter={vm.isLoading ? <Spinner color="white" /> : <ArrowRight size={18} color="white" />}
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
