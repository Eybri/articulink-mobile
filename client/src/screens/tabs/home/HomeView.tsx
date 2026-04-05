import React from "react";
import {
  Platform,
  StatusBar,
  Animated,
  Image as RNImage,
} from "react-native";
import {
  YStack,
  XStack,
  ZStack,
  Button,
  Circle,
  H1,
  SizableText,
  TextArea,
  Card,
  Spinner,
  AnimatePresence,
} from "tamagui";
import {
  Mic,
  Square,
  Volume2,
  Trash2,
  ChevronRight,
  FileText,
} from "@tamagui/lucide-icons";
import { COLORS } from "./../../../constants/colors";
import { SoftOrb, AnimatedWaveform, PulseRing } from "./components/HomeComponents";

interface HomeViewProps {
    vm: any;
}

export const HomeView: React.FC<HomeViewProps> = ({ vm }) => {
    const isRecording = !!vm.recording;
    const statusText = vm.loading ? "Processing your speech..." : isRecording ? "Listening..." : "Tap the mic to start";

    return (
        <YStack f={1} bg={COLORS.cream}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

            {/* ── Layered Background ── */}
            <ZStack pos="absolute" fullscreen pointerEvents="none">
                <YStack fullscreen bg={COLORS.cream} />
                
                {vm.orbs.map((orb: any, i: number) => <SoftOrb key={i} {...orb} />)}

                {vm.dotGrid.map((d: any, i: number) => (
                    <Circle
                        key={i}
                        pos="absolute"
                        size={2}
                        bg={COLORS.royalBlue}
                        opacity={0.04}
                        l={d.left}
                        t={d.top}
                    />
                ))}

                <YStack
                    pos="absolute" t={58} l={22} w={34} h={34}
                    borderTopWidth={1.5} borderLeftWidth={1.5}
                    borderColor={`${COLORS.royalBlue}25`}
                    br={6}
                />
                <YStack
                    pos="absolute" b={60} r={22} w={34} h={34}
                    borderBottomWidth={1.5} borderRightWidth={1.5}
                    borderColor={`${COLORS.teal}25`}
                    br={6}
                />
            </ZStack>

            {/* ── Main Content ── */}
            <YStack f={1} px="$5" pt={Platform.OS === "android" ? 48 : 60} pb={Platform.OS === "android" ? 20 : 30} gap="$4">
                
                {/* Header */}
                <Animated.View style={{ opacity: vm.fadeAnim, transform: [{ translateY: vm.slideAnim }] }}>
                    <YStack ai="center" gap="$1">
                        <SizableText size="$1" fontWeight="800" color={COLORS.teal} ls={2.5} tt="uppercase">
                            SPEECH CLARITY ENGINE
                        </SizableText>
                        <H1 fow="900" size="$10" color={COLORS.textDark} ls={-0.5}>
                            Articulink
                        </H1>
                        <SizableText size="$3" color={COLORS.textMid} fow="500">
                            Tap, speak, and let AI understand you
                        </SizableText>
                    </YStack>
                </Animated.View>

                <Animated.View style={{ opacity: vm.fadeAnim, transform: [{ scale: vm.fadeAnim }] }}>
                    <YStack ai="center" gap="$2">
                        <YStack w={120} h={120} jc="center" ai="center">
                            <PulseRing active={isRecording} />
                            <AnimatePresence>
                                {isRecording && (
                                    <Circle
                                        key="active-bg"
                                        pos="absolute"
                                        size={120}
                                        bg={COLORS.teal}
                                        opacity={0.12}
                                    />
                                )}
                            </AnimatePresence>

                            <Button
                                size={88}
                                br={44}
                                bg={isRecording ? '#DC2626' : COLORS.teal}
                                onPress={isRecording ? vm.stopRecording : vm.startRecording}
                                disabled={vm.loading}
                                pressStyle={{ scale: 0.92, opacity: 0.85 }}
                                elevation={10}
                                shadowColor={isRecording ? '#DC2626' : '#2A8FA0'}
                                icon={vm.loading ? <Spinner size="large" color="white" /> : (isRecording ? <Square size={28} color="white" fill="white" /> : <Mic size={32} color="white" />)}
                            />
                        </YStack>

                        <SizableText size="$3" fow="600" color={isRecording ? '#DC2626' : COLORS.textMid}>
                            {statusText}
                        </SizableText>

                        <AnimatePresence>
                            {isRecording && (
                                <YStack
                                    key="waveform"
                                    mt="$2"
                                >
                                    <AnimatedWaveform color={COLORS.teal} />
                                </YStack>
                            )}
                        </AnimatePresence>
                    </YStack>
                </Animated.View>

                {/* Transcript Card */}
                <Animated.View style={{ flex: 1, opacity: vm.fadeAnim, transform: [{ translateY: vm.slideAnim }] }}>
                    <Card f={1} bg="white" br={22} elevation={5} shadowColor="#8A96A4" bw={1} bc={COLORS.sandMid} ov="hidden">
                        <YStack pos="absolute" t={0} l={0} r={0} h={3} bg={COLORS.royalBlue} />
                        <YStack pos="absolute" t={0} l={0} r={0} h={50} bg={`${COLORS.royalBlue}07`} />

                        <YStack f={1} p="$4">
                            <XStack ai="center" gap="$2" mb="$2">
                                <YStack w={30} h={30} br={9} bg={`${COLORS.royalBlue}0C`} jc="center" ai="center">
                                    <FileText size={14} color={COLORS.royalBlue} />
                                </YStack>
                                <SizableText fow="800" size="$3" color={COLORS.textDark} ls={-0.2}>
                                    Transcript
                                </SizableText>
                                <YStack f={1} h={1} bg={COLORS.sandMid} opacity={0.7} />
                                {vm.transcript.length > 0 && (
                                    <YStack bg={`${COLORS.teal}14`} px="$2" py="$1" br={8}>
                                        <SizableText fow="700" size="$1" color={COLORS.teal}>
                                            {vm.transcript.length}
                                        </SizableText>
                                    </YStack>
                                )}
                            </XStack>

                            <TextArea
                                flex={1}
                                bg={`${COLORS.royalBlue}04`}
                                borderColor={COLORS.sandMid}
                                br={14}
                                p="$3"
                                size="$4"
                                fontWeight="500"
                                color={COLORS.textDark}
                                value={vm.transcript}
                                onChangeText={vm.setTranscript}
                                placeholder="Your speech will appear here..."
                                placeholderTextColor={COLORS.textMid as any}
                                borderWidth={1.5}
                            />

                            <YStack pos="absolute" b={12} r={14}>
                                <AnimatedWaveform color={COLORS.royalBlue} />
                            </YStack>
                        </YStack>
                    </Card>
                </Animated.View>

                {/* Action Buttons */}
                <Animated.View style={{ opacity: vm.fadeAnim, transform: [{ translateY: vm.slideAnim }] }}>
                    <YStack gap="$2">
                        <Button
                            size="$5"
                            bg={COLORS.teal}
                            br={18}
                            onPress={vm.speakText}
                            disabled={!vm.transcript}
                            opacity={!vm.transcript ? 0.45 : 1}
                            pressStyle={{ scale: 0.98, opacity: 0.9 }}
                            icon={<Volume2 size={18} color="white" />}
                            iconAfter={<ChevronRight size={18} color="rgba(255,255,255,0.5)" />}
                            elevation={6}
                            shadowColor="#2A8FA0"
                        >
                            <SizableText fow="800" size="$4" color="white" ml="$2">
                                Speak
                            </SizableText>
                        </Button>

                        <Button
                            size="$5"
                            bg="white"
                            br={18}
                            onPress={vm.clearTranscript}
                            disabled={!vm.transcript}
                            opacity={!vm.transcript ? 0.45 : 1}
                            pressStyle={{ scale: 0.98, opacity: 0.9 }}
                            borderWidth={1}
                            borderColor="rgba(220,38,38,0.18)"
                            icon={<Trash2 size={16} color="#DC2626" />}
                            iconAfter={<ChevronRight size={18} color="rgba(220,38,38,0.35)" />}
                            elevation={5}
                            shadowColor="#8A96A4"
                        >
                            <SizableText fow="800" size="$4" color="#DC2626" ml="$2">
                                Clear
                            </SizableText>
                        </Button>
                    </YStack>
                </Animated.View>
            </YStack>
        </YStack>
    );
};
