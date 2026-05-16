import React from "react";
import {
    Platform,
    StatusBar,
    View,
} from "react-native";
import {
    YStack,
    XStack,
    ZStack,
    Button,
    Circle,
    SizableText,
    Input,
    ScrollView,
    Spinner,
} from "tamagui";
import {
    ChevronLeft,
    Lock,
    Eye,
    EyeOff,
    ShieldCheck,
    KeyRound,
} from "@tamagui/lucide-icons";
import { COLORS } from "./../../../constants/colors";

interface ChangePasswordViewProps {
    vm: any;
}

export const ChangePasswordView: React.FC<ChangePasswordViewProps> = ({ vm }) => {
    return (
        <YStack f={1} bg={COLORS.cream}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

            {/* Background Orbs */}
            <ZStack pos="absolute" fullscreen pointerEvents="none">
                <Circle pos="absolute" t={-100} r={-50} size={400} bg={COLORS.sandLight} opacity={0.4} />
                <Circle pos="absolute" b={-50} l={-100} size={300} bg={COLORS.orbTeal} opacity={0.1} />
            </ZStack>

            <ScrollView f={1} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60, paddingTop: Platform.OS === 'ios' ? 60 : 40 }}>
                {/* Header */}
                <XStack ai="center" px="$5" mb="$6">
                    <Button
                        size="$3"
                        br={14}
                        bg="white"
                        bw={1}
                        bc={COLORS.sandMid}
                        icon={<ChevronLeft size={20} color={COLORS.textDark} />}
                        onPress={vm.handleBack}
                        pressStyle={{ scale: 0.95, bg: COLORS.cream }}
                        elevation={2}
                    />
                    <SizableText size="$5" fow="900" color={COLORS.textDark} ml="$4">Change Password</SizableText>
                </XStack>

                <YStack px="$5" gap="$5">
                    {/* Hero Icon */}
                    <YStack ai="center" mb="$4">
                        <Circle size={80} bg={`${COLORS.royalBlue}10`} bw={1} bc={`${COLORS.royalBlue}20`}>
                            <Lock size={32} color={COLORS.royalBlue} />
                        </Circle>
                        <SizableText size="$2" color={COLORS.textMid} ta="center" mt="$4" maw={280}>
                            Keep your account secure by using a strong, unique password.
                        </SizableText>
                    </YStack>

                    {/* Form */}
                    <YStack gap="$4">
                        <PasswordField 
                            label="Current Password" 
                            value={vm.currentPassword} 
                            onChangeText={vm.setCurrentPassword} 
                            show={vm.showCurrent} 
                            setShow={vm.setShowCurrent} 
                            placeholder="Enter current password"
                        />
                        
                        <YStack h={1} bg={COLORS.sandMid} opacity={0.3} my="$1" />

                        <PasswordField 
                            label="New Password" 
                            value={vm.newPassword} 
                            onChangeText={vm.setNewPassword} 
                            show={vm.showNew} 
                            setShow={vm.setShowNew} 
                            placeholder="Enter new password"
                        />

                        <PasswordField 
                            label="Confirm New Password" 
                            value={vm.confirmPassword} 
                            onChangeText={vm.setConfirmPassword} 
                            show={vm.showConfirm} 
                            setShow={vm.setShowConfirm} 
                            placeholder="Repeat new password"
                        />
                    </YStack>

                    {/* Action */}
                    <YStack mt="$6">
                        <Button
                            bg={COLORS.royalBlue}
                            h={60}
                            br={20}
                            elevation={4}
                            shadowColor={COLORS.royalBlue}
                            onPress={vm.handleChangePassword}
                            disabled={vm.loading}
                            iconAfter={vm.loading ? <Spinner color="white" /> : <ShieldCheck size={18} color="white" />}
                            pressStyle={{ scale: 0.98, opacity: 0.9 }}
                        >
                            <SizableText color="white" fow="800" size="$4" ls={0.5}>UPDATE PASSWORD</SizableText>
                        </Button>
                    </YStack>

                    <YStack ai="center" mt="$4" gap="$2" opacity={0.5}>
                        <XStack ai="center" gap="$2">
                            <KeyRound size={12} color={COLORS.textMid} />
                            <SizableText size="$1" fow="700" color={COLORS.textMid}>Secure AES-256 Encryption</SizableText>
                        </XStack>
                    </YStack>
                </YStack>
            </ScrollView>
        </YStack>
    );
};

const PasswordField = ({ label, value, onChangeText, show, setShow, placeholder }: any) => (
    <YStack gap="$2">
        <SizableText size="$2" fow="800" color={COLORS.textMid} ml="$1" textTransform="uppercase" ls={1} opacity={0.6}>
            {label}
        </SizableText>
        <XStack 
            bg="white" 
            h={56} 
            br={16} 
            bw={1} 
            bc={COLORS.sandMid} 
            ai="center" 
            px="$4"
            elevation={1}
        >
            <Input
                f={1}
                bg="transparent"
                bw={0}
                size="$4"
                fontWeight="600"
                color={COLORS.textDark}
                secureTextEntry={!show}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={(`${COLORS.textMid}50`) as any}
                p={0}
                focusStyle={{ bw: 0 }}
            />
            <Button
                chromeless
                size="$2"
                onPress={() => setShow(!show)}
                icon={show ? <EyeOff size={18} color={COLORS.textMid} /> : <Eye size={18} color={COLORS.textMid} />}
            />
        </XStack>
    </YStack>
);
