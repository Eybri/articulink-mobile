import React from "react";
import {
  StatusBar,
  Platform,
  Animated,
  ImageBackground,
  View,
} from "react-native";
import {
  YStack,
  XStack,
  Button,
  SizableText,
  Paragraph,
} from "tamagui";
import {
  Shield,
  Lock,
  ChevronLeft,
  Mic,
  Database,
  Globe,
  ShieldCheck,
} from "@tamagui/lucide-icons";
import { COLORS } from "./../../../constants/colors";
import { Accordion, Bullet, SubHeading, InfoBox } from "./components/SecurityComponents";

interface SecurityViewProps {
    vm: any;
}

export const SecurityView: React.FC<SecurityViewProps> = ({ vm }) => {
    return (
        <YStack f={1} bg={COLORS.cream}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            {/* Fixed Back Button */}
            <XStack pos="absolute" t={Platform.OS === "android" ? 40 : 52} l={0} r={0} px="$5" zIndex={20} jc="space-between" ai="center">
                <Button
                    size="$3"
                    br={14}
                    bg="rgba(255,255,255,0.15)"
                    bw={1}
                    bc="rgba(255,255,255,0.2)"
                    icon={<ChevronLeft size={20} color="white" />}
                    onPress={vm.handleBack}
                    pressStyle={{ scale: 0.95, opacity: 0.7 }}
                />
                <SizableText size="$1" fow="700" color="white" ls={3} tt="uppercase" opacity={0.5}>
                    Security
                </SizableText>
                <View style={{ width: 40 }} />
            </XStack>

            <Animated.ScrollView
                showsVerticalScrollIndicator={false}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: vm.scrollY } } }],
                    { useNativeDriver: true }
                )}
                scrollEventThrottle={16}
            >
                {/* Parallax Header */}
                <Animated.View style={{
                    transform: [{ translateY: vm.animations.headerTranslateY }, { scale: vm.animations.headerScale }],
                }}>
                    <View style={{
                        borderBottomLeftRadius: 35,
                        borderBottomRightRadius: 35,
                        overflow: 'hidden',
                    }}>
                        <ImageBackground
                            source={require('../../../../assets/images/bg.jpg')}
                            resizeMode="cover"
                            style={{
                                paddingTop: Platform.OS === "android" ? 90 : 100,
                                paddingBottom: 40,
                                alignItems: 'center',
                            }}
                        >
                            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.15)' }} />
                            <Animated.View style={{ opacity: Animated.multiply(vm.animations.fadeAnim, vm.animations.headerOpacity), transform: [{ translateY: vm.animations.slideAnim }], alignItems: 'center' }}>
                                <Shield size={40} color="white" opacity={0.9} />
                                <SizableText size="$6" fow="900" color="white" ls={-0.5} mt="$2">
                                    Security First
                                </SizableText>
                                <YStack w={24} h={2} bg={COLORS.teal} br={1} mt="$1" mb="$1.5" />
                                <XStack ai="center" gap="$1">
                                    <ShieldCheck size={8} color="white" opacity={0.4} />
                                    <SizableText size={10} fow="600" color="white" opacity={0.4} ls={1.5} tt="uppercase">
                                        Privacy Protected
                                    </SizableText>
                                </XStack>
                            </Animated.View>
                        </ImageBackground>
                    </View>
                </Animated.View>

                {/* Content */}
                <YStack px="$4" pt="$4" pb={60}>
                    <SizableText size="$2" color={COLORS.textMid} ta="center" lh={18} fow="500" maw={280} als="center" mb="$4">
                        Your speech data is processed with extreme care. We prioritize your privacy above all else.
                    </SizableText>

                    <Accordion
                        icon={<Mic size={14} color={COLORS.royalBlue} />}
                        title="User Consent & Control"
                        tagText="Top Priority"
                        defaultOpen={true}
                    >
                        <SubHeading icon={<Mic size={10} color={COLORS.royalBlue} />} text="Voice Recording Management" />
                        <Paragraph size="$1" color={COLORS.textMid} lh={17} mb="$1.5" fow="500">
                            We never store your recordings unless you explicitly choose to save them to your history.
                        </Paragraph>
                        <Bullet text="Choose where your data lives" />
                        <Bullet text="Delete any recording instantly" />
                        <Bullet text="Opt-out of model training at any time" />

                        <SubHeading text="Core Rights:" />
                        <Bullet text="Full control over storage permissions" />
                        <Bullet text="Transparent data handling policies" />
                        <InfoBox text="Privacy is baked into our core architecture. You are always in control." />
                    </Accordion>

                    <Accordion icon={<Database size={14} color={COLORS.royalBlue} />} title="Data Protection Layers">
                        <SubHeading text="Sensitive Data Handling" />
                        <Bullet text="Audio files (Biometric data)" color="#F87171" />
                        <Bullet text="Transcription text (High protection)" color="#F87171" />

                        <SubHeading text="Standard Identity Data" />
                        <Bullet text="Encrypted user profile metrics" />
                        <Bullet text="Secure authentication tokens" />
                        <InfoBox text="Sensitive speech data is isolated and encrypted separately from your profile." />
                    </Accordion>

                    <Accordion icon={<Lock size={14} color={COLORS.royalBlue} />} title="Encryption & Integrity" tagText="Advanced">
                        <SubHeading icon={<Lock size={10} color={COLORS.royalBlue} />} text="How We Secure Your Voice" />
                        <Bullet text="End-to-end encryption in transit" />
                        <Bullet text="AES-256 at-rest storage standards" />
                        <Bullet text="Hardware-level security modules" />
                        <InfoBox text="No one at Articulink can access your private voice recordings." type="warning" />
                    </Accordion>

                    <Accordion icon={<Globe size={14} color={COLORS.royalBlue} />} title="Legal & Compliance" tagText="PH Compliant">
                        <SubHeading text="Data Privacy Act of 2012" />
                        <Bullet text="Fully strictly regulated by NPC" />
                        <Bullet text="Global best practices (GDPR aligned)" />
                        <InfoBox text="We undergo regular privacy impact assessments." />
                    </Accordion>

                    <YStack bg={COLORS.white} br={16} p="$3.5" mt="$1" mb="$2" bw={1} bc={COLORS.sandMid}>
                        <XStack gap="$2.5" ai="flex-start">
                            <Shield size={12} color={COLORS.royalBlue} mt={2} />
                            <SizableText f={1} size="$1" color={COLORS.textMid} lh={17} fontStyle="italic" fow="500">
                                "At Articulink, your voice belongs to you. Our mission is to amplify your speech, not compromise your identity."
                            </SizableText>
                        </XStack>
                    </YStack>

                    {/* Footer */}
                    <YStack ai="center" mt="$6" pb="$2" opacity={0.5}>
                        <XStack ai="center" gap="$1" mb="$1.5">
                            <YStack w={12} h={1} bg={COLORS.textMid} />
                            <ShieldCheck size={8} color={COLORS.textMid} />
                            <YStack w={12} h={1} bg={COLORS.textMid} />
                        </XStack>
                        <SizableText size="$1" color={COLORS.textMid} fow="600" ls={1}>
                            Articulink Security © 2026
                        </SizableText>
                    </YStack>
                </YStack>
            </Animated.ScrollView>
        </YStack>
    );
};
