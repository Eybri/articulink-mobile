import React from "react";
import {
  StatusBar,
  Platform,
  Animated,
  Image as RNImage,
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
  ChevronLeft,
  Mic,
  Brain,
  Volume2,
  Save,
  Users,
  Heart,
  Shield,
  Accessibility,
  AlertTriangle,
  HandHelping,
  Speaker,
} from "@tamagui/lucide-icons";
import { COLORS } from "./../../../constants/colors";
import { Accordion, Bullet, StepCard, InfoBox } from "./components/AboutComponents";

interface AboutViewProps {
    vm: any;
}

export const AboutView: React.FC<AboutViewProps> = ({ vm }) => {
    return (
        <YStack f={1} bg={COLORS.cream}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            {/* ── Fixed Back Button ── */}
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
                    About
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
                {/* ── Parallax Header ── */}
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
                                <RNImage
                                    source={require('../../../../assets/images/whitelogo.png')}
                                    style={{ width: vm.width * 0.13, height: vm.width * 0.13 }}
                                    resizeMode="contain"
                                />
                                <SizableText size="$6" fow="900" color="white" ls={-0.5} mt="$1.5">
                                    articuLink
                                </SizableText>
                                <YStack w={24} h={2} bg={COLORS.teal} br={1} mt="$1" mb="$1.5" />
                                <XStack ai="center" gap="$1">
                                    <Speaker size={8} color="white" opacity={0.4} />
                                    <SizableText size={10} fow="600" color="white" opacity={0.4} ls={1.5} tt="uppercase">
                                        Speech Engine · v1.0.0
                                    </SizableText>
                                </XStack>
                            </Animated.View>
                        </ImageBackground>
                    </View>
                </Animated.View>

                {/* ── Content ── */}
                <YStack px="$4" pt="$4" pb={60}>
                    <SizableText size="$2" color={COLORS.textMid} ta="center" lh={18} fow="500" maw={280} als="center" mb="$4">
                        Empowering communication through AI — making every voice heard.
                    </SizableText>

                    <Accordion icon={<Heart size={14} color={COLORS.royalBlue} />} title="What is Articulink?" defaultOpen={true}>
                        <Paragraph size="$1" color={COLORS.textMid} lh={17} mb="$1.5" fow="500">
                            A speech assistance app designed to help individuals with lisp and hypernasal speech communicate more clearly.
                        </Paragraph>
                        <Paragraph size="$1" color={COLORS.textMid} lh={17} fow="500">
                            The app processes your voice and converts it into a clearer, more understandable speech output — preserving your message.
                        </Paragraph>
                    </Accordion>

                    <Accordion icon={<Users size={14} color={COLORS.royalBlue} />} title="Who Is It For?">
                        <Bullet text="Individuals with lisp speech patterns" />
                        <Bullet text="Individuals with hypernasal speech" />
                        <Bullet text="Speech therapy support users" />
                        <Bullet text="Students and professionals needing clearer communication" />
                        <InfoBox text="Articulink is built for you — we want you to feel seen and understood." />
                    </Accordion>

                    <Accordion icon={<Mic size={14} color={COLORS.royalBlue} />} title="How to Use">
                        <StepCard step="1" icon={<Mic size={14} color={COLORS.royalBlue} />} title="Tap Record" desc="Press the microphone icon and start speaking naturally." />
                        <StepCard step="2" icon={<Brain size={14} color={COLORS.royalBlue} />} title="AI Processing" desc="The app analyzes your speech and enhances clarity using AI." />
                        <StepCard step="3" icon={<Volume2 size={14} color={COLORS.royalBlue} />} title="Hear the Result" desc="Play the improved audio, view the text, or share the output." />
                        <StepCard step="4" icon={<Save size={14} color={COLORS.royalBlue} />} title="Save to History" desc="Save the recording to your private history or discard it." optional />
                        <StepCard step="5" icon={<HandHelping size={14} color={COLORS.royalBlue} />} title="Help Improve" desc="Anonymized recordings may help improve the AI model. Voluntary." optional />
                    </Accordion>

                    <Accordion icon={<Shield size={14} color={COLORS.royalBlue} />} title="Privacy & Security">
                        <XStack ai="center" mb="$2" gap="$1.5">
                            <SizableText size="$2" fow="800" color={COLORS.textDark}>Your Privacy Matters</SizableText>
                        </XStack>
                        <Bullet text="Recordings saved only with permission" color="#059669" />
                        <Bullet text="Delete your data anytime" color="#059669" />
                        <Bullet text="Training contributions are anonymized" color="#059669" />
                        <Bullet text="Encrypted during transfer and storage" color="#059669" />
                        <InfoBox text="Compliant with the Data Privacy Act of 2012 (Philippines)." />
                    </Accordion>

                    <Accordion icon={<Accessibility size={14} color={COLORS.royalBlue} />} title="Accessibility">
                        <Paragraph size="$1" color={COLORS.textMid} lh={17} mb="$1.5" fow="500">
                            Designed for users who may struggle with articulation:
                        </Paragraph>
                        <Bullet text="Large, easy-to-tap buttons" />
                        <Bullet text="Clear, readable fonts" />
                        <Bullet text="Text + audio feedback for all actions" />
                        <Bullet text="Adjustable playback speed" />
                        <Bullet text="Visual waveform display" />
                    </Accordion>

                    <Accordion icon={<AlertTriangle size={14} color={COLORS.royalBlue} />} title="Safety & Responsible Use">
                        <XStack bg="#FFFBEB" p="$2.5" br={10} bw={1} bc="#FEF3C7" gap="$2">
                            <AlertTriangle size={11} color="#D97706" mt={2} />
                            <SizableText f={1} size="$1" color="#92400E" lh={16}>
                                Articulink is a communication tool and{" "}
                                <SizableText fow="800">not a replacement for professional speech therapy.</SizableText>
                            </SizableText>
                        </XStack>
                        <Paragraph size="$1" color={COLORS.textMid} lh={17} mt="$2" fow="500">
                            We encourage working with a qualified speech-language pathologist alongside using Articulink.
                        </Paragraph>
                    </Accordion>

                    {/* Footer */}
                    <YStack ai="center" mt="$6" pb="$2" opacity={0.5}>
                        <XStack ai="center" gap="$1" mb="$1.5">
                            <YStack w={12} h={1} bg={COLORS.textMid} />
                            <Speaker size={8} color={COLORS.textMid} />
                            <YStack w={12} h={1} bg={COLORS.textMid} />
                        </XStack>
                        <SizableText size="$1" color={COLORS.textMid} fow="600" ls={1}>
                            Articulink © 2026
                        </SizableText>
                    </YStack>
                </YStack>
            </Animated.ScrollView>
        </YStack>
    );
};
