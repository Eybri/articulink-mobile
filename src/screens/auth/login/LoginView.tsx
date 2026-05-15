import React from "react";
import {
    Animated,
    StatusBar,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
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
    Eye,
    EyeOff,
    ArrowRight,
    Mail,
    Lock
} from "@tamagui/lucide-icons";
import { COLORS } from "./../../../constants/colors";

const { height } = Dimensions.get('window');

interface LoginViewProps {
    vm: any;
    navigation: any;
}

export const LoginView: React.FC<LoginViewProps> = ({ vm, navigation }) => {
    return (
        <YStack f={1} bg={COLORS.royalBlue}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            {/* Background Layer */}
            <ZStack pos="absolute" fullscreen pointerEvents="none">
                <RNImage
                    source={require('../../../../assets/images/bg.jpg')}
                    style={{ width: '100%', height: '100%', position: 'absolute' }}
                    resizeMode="cover"
                />
                <YStack fullscreen bg="black" opacity={0.2} />

                {/* Typewriter Text */}
                <Animated.View style={{ opacity: vm.animations.textFade, position: 'absolute', top: '18%', width: '100%', paddingHorizontal: 32 }}>
                    <SizableText size="$10" fow="900" color="white" ls={-1}>{vm.typedLine1}</SizableText>
                    {vm.typedLine2.length > 0 && <SizableText size="$10" fow="900" color="white" ls={-1}>{vm.typedLine2}</SizableText>}
                </Animated.View>

                {/* Logo Section */}
                <YStack pos="absolute" t={0} l={0} r={0} h={height * 0.42} jc="center" ai="center">
                    <Animated.View style={{ opacity: vm.animations.logoFade, transform: [{ scale: vm.animations.logoScale }] }}>
                        <RNImage
                            source={require('../../../../assets/images/icon-white.png')}
                            style={{ width: 85, height: 85 }}
                            resizeMode="contain"
                        />
                    </Animated.View>
                </YStack>
            </ZStack>

            {/* Scrollable Form */}
            <ScrollView
                f={1}
                contentContainerStyle={{ flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                    <Animated.View style={{ flex: 1, transform: [{ translateY: vm.animations.slideHeight }], justifyContent: 'flex-end' }}>
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
                                    {/* Email */}
                                    <YStack gap="$1.5">
                                        <SizableText size="$1" fow="700" color={COLORS.textMid} ls={0.5} tt="uppercase" opacity={0.8}>Email address</SizableText>
                                        <XStack ai="center" bg={COLORS.cream} br={12} bw={1} bc={COLORS.sandMid} h={48} px="$3" gap="$2.5">
                                            <Mail size={16} color={COLORS.royalBlue} opacity={0.5} />
                                            <Input
                                                f={1}
                                                placeholder="Enter your email"
                                                value={vm.email}
                                                onChangeText={vm.setEmail}
                                                bg="transparent"
                                                bw={0}
                                                size="$3"
                                                autoCapitalize="none"
                                                keyboardType="email-address"
                                                disabled={vm.isLoading}
                                            />
                                        </XStack>
                                    </YStack>

                                    {/* Password */}
                                    <YStack gap="$1.5">
                                        <XStack jc="space-between" ai="center">
                                            <SizableText size="$1" fow="700" color={COLORS.textMid} ls={0.5} tt="uppercase" opacity={0.8}>Password</SizableText>
                                            <Button chromeless p={0} h="auto" onPress={() => navigation.navigate("ForgotPassword")}>
                                                <SizableText size="$1" fow="700" color={COLORS.teal}>Forgot?</SizableText>
                                            </Button>
                                        </XStack>
                                        <XStack ai="center" bg={COLORS.cream} br={12} bw={1} bc={COLORS.sandMid} h={48} px="$3" gap="$2.5">
                                            <Lock size={16} color={COLORS.royalBlue} opacity={0.5} />
                                            <Input
                                                f={1}
                                                placeholder="Enter password"
                                                value={vm.password}
                                                onChangeText={vm.setPassword}
                                                secureTextEntry={!vm.showPassword}
                                                bg="transparent"
                                                bw={0}
                                                size="$3"
                                                disabled={vm.isLoading}
                                            />
                                            <Button
                                                bg="transparent"
                                                p={0}
                                                onPress={() => vm.setShowPassword(!vm.showPassword)}
                                                icon={vm.showPassword ? <EyeOff size={16} color={COLORS.textMid} /> : <Eye size={16} color={COLORS.textMid} />}
                                            />
                                        </XStack>
                                    </YStack>

                                    {/* Submit */}
                                    <Button
                                        bg={COLORS.royalBlue}
                                        h={52}
                                        br={16}
                                        mt="$2"
                                        onPress={vm.handleLogin}
                                        disabled={vm.isLoading}
                                        pressStyle={{ scale: 0.98, opacity: 0.9 }}
                                        iconAfter={vm.isLoading ? <Spinner color="white" /> : <ArrowRight size={18} color="white" />}
                                        elevation={4}
                                        shadowColor={COLORS.royalBlue}
                                    >
                                        <SizableText color="white" fow="700" size="$3" ls={0.5}>SIGN IN</SizableText>
                                    </Button>

                                    {/* Footer Links */}
                                    <XStack jc="center" ai="center" gap="$2" mt="$1">
                                        <SizableText color={COLORS.textMid} size="$2">Don't have an account?</SizableText>
                                        <Button chromeless p={0} h="auto" onPress={() => navigation.navigate("Register")}>
                                            <SizableText color={COLORS.royalBlue} fow="700" size="$2" textDecorationLine="underline">Sign up</SizableText>
                                        </Button>
                                    </XStack>

                                    <XStack jc="center" ai="center" gap="$3" mt="$2" opacity={0.5}>
                                        <Button chromeless onPress={() => navigation.navigate('SecurityPrivacy')} padding={0} h="auto">
                                            <SizableText size="$1" color={COLORS.textMid} fow="600">Privacy & Security</SizableText>
                                        </Button>
                                        <Circle size={3} bg={COLORS.sandMid} />
                                        <Button chromeless onPress={() => navigation.navigate('About')} padding={0} h="auto">
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
