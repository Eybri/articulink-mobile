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
    ScrollView,
    Spinner,
} from "tamagui";
import {
    Mail,
    ArrowRight,
} from "@tamagui/lucide-icons";
import { COLORS } from "./../../../constants/colors";

const { height } = Dimensions.get('window');

interface ForgotPasswordViewProps {
    vm: any;
    navigation: any;
}

export const ForgotPasswordView: React.FC<ForgotPasswordViewProps> = ({ vm, navigation }) => {
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
                <YStack pos="absolute" b={0} l={0} r={0} h={height * 0.4} jc="center" ai="center" gap="$1">
                    <RNImage
                        source={require('../../../../assets/images/icon-white.png')}
                        style={{ width: 100, height: 100 }}
                        resizeMode="contain"
                    />
                    <SizableText size="$5" fow="700" color="white" ls={0.3}>Articulink</SizableText>
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

                            <YStack gap="$2" mb="$6">
                                <SizableText size="$8" fow="800" color={COLORS.royalBlue}>Forgot Password?</SizableText>
                                <YStack w={40} h={4} bg={COLORS.teal} br={2} />
                                <SizableText size="$3" color={COLORS.textMid} mt="$2" lh={20}>
                                    Enter your email and we'll send you a 6-digit code to reset your password.
                                </SizableText>
                            </YStack>

                            <YStack gap="$4">
                                <YStack gap="$1.5">
                                    <SizableText size="$1" fow="700" color={COLORS.textMid} ls={0.5} tt="uppercase" opacity={0.8}>Email address</SizableText>
                                    <XStack ai="center" bg={COLORS.cream} br={12} bw={1} bc={COLORS.sandMid} h={52} px="$4" gap="$3">
                                        <Mail size={18} color={COLORS.royalBlue} opacity={0.5} />
                                        <Input
                                            f={1}
                                            placeholder="Enter your email"
                                            value={vm.email}
                                            onChangeText={vm.setEmail}
                                            bg="transparent"
                                            bw={0}
                                            size="$4"
                                            autoCapitalize="none"
                                            keyboardType="email-address"
                                            disabled={vm.isLoading}
                                        />
                                    </XStack>
                                </YStack>

                                <Button
                                    bg={COLORS.royalBlue}
                                    h={56}
                                    br={16}
                                    mt="$2"
                                    onPress={vm.handleSendCode}
                                    disabled={vm.isLoading || !vm.email}
                                    opacity={!vm.email ? 0.6 : 1}
                                    pressStyle={{ scale: 0.98, opacity: 0.9 }}
                                    iconAfter={vm.isLoading ? <Spinner color="white" /> : <ArrowRight size={18} color="white" />}
                                    elevation={4}
                                    shadowColor={COLORS.royalBlue}
                                >
                                    <SizableText color="white" fow="700" size="$3" ls={0.5}>SEND RESET CODE</SizableText>
                                </Button>

                                <XStack jc="center" ai="center" mt="$2">
                                    <SizableText color={COLORS.textMid} size="$2">Remembered your password? </SizableText>
                                    <Button chromeless p={0} h="auto" onPress={() => navigation.navigate("Login")}>
                                        <SizableText color={COLORS.royalBlue} fow="700" size="$2" textDecorationLine="underline">Sign in</SizableText>
                                    </Button>
                                </XStack>
                            </YStack>
                        </YStack>
                    </Animated.View>
                </KeyboardAvoidingView>
            </ScrollView>
        </YStack>
    );
};
