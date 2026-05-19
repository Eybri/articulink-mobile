import React, { useRef, useEffect, useState } from "react";
import { Platform, StatusBar, Animated } from "react-native";
import { YStack, XStack, ZStack, Button, Circle, SizableText, TextArea, Card, Spinner, AnimatePresence, ScrollView } from "tamagui";
import { Mic, Square, Volume2, Trash2, ChevronRight, FileText, Bookmark, Star } from "@tamagui/lucide-icons";
import { COLORS } from "./../../../constants/colors";
import { SoftOrb, AnimatedWaveform, PulseRing } from "./components/HomeComponents";

interface HomeViewProps {
    vm: any;
}

export const HomeView: React.FC<HomeViewProps> = ({ vm }) => {
    const isRecording = !!vm.recording || vm.isStreaming;
    const statusText = vm.loading ? "Processing speech..." : isRecording ? "Listening..." : (vm.isRealtime ? "Tap to start live listening" : "Tap to record a phrase");

    const [toggleWidth, setToggleWidth] = useState(0);
    const slideAnimToggle = useRef(new Animated.Value(vm.isRealtime ? 1 : 0)).current;

    useEffect(() => {
        Animated.spring(slideAnimToggle, {
            toValue: vm.isRealtime ? 1 : 0,
            useNativeDriver: false,
            tension: 50,
            friction: 7,
        }).start();
    }, [vm.isRealtime]);

    return (
        <YStack f={1} bg={COLORS.cream}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

            <ZStack pos="absolute" fullscreen pointerEvents="none">
                <YStack fullscreen bg={COLORS.cream} />
                {vm.orbs.map((orb: any, i: number) => <SoftOrb key={i} {...orb} />)}
            </ZStack>

            <ScrollView f={1} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Platform.OS === 'ios' ? 200 : 180, paddingTop: Platform.OS === "android" ? 20 : 0 }}>
                <YStack px="$5" gap="$5" pt="$4">
                    {/* Hero Branding Section - Restored */}
                    <Animated.View style={{ opacity: vm.fadeAnim, transform: [{ translateY: vm.slideAnim }] }}>
                        <YStack ai="center" gap="$1.5" mb="$2">
                            <YStack bg={vm.isRealtime ? `${COLORS.teal}10` : `${COLORS.royalBlue}10`} px="$3" py="$1" br={100} bw={1} bc={vm.isRealtime ? `${COLORS.teal}20` : `${COLORS.royalBlue}20`}>
                                <SizableText size="$2" fontWeight="900" color={vm.isRealtime ? COLORS.teal : COLORS.royalBlue} ls={1.2} tt="uppercase">
                                    {vm.isRealtime ? "Live Mode Active" : "Phrase Mode Active"}
                                </SizableText>
                            </YStack>
                            <SizableText size="$3" color={COLORS.textMid} fow="500" ta="center" px="$4" opacity={0.75}>
                                {vm.isRealtime ? "Continuous real-time speech enhancement" : "Record and playback clarified phrases"}
                            </SizableText>
                        </YStack>
                    </Animated.View>

                    {/* Mode Toggle */}
                    <Animated.View style={{ opacity: vm.fadeAnim, transform: [{ translateY: vm.slideAnim }] }}>
                        <XStack bg="white" p="$1" br={100} bw={1} bc="rgba(221, 214, 200, 0.4)" mb="$2" mx="$2" elevation={4} position="relative" onLayout={(e) => setToggleWidth(e.nativeEvent.layout.width)}>
                            {toggleWidth > 0 && (
                                <Animated.View style={{
                                    position: 'absolute', left: 4, top: 4, bottom: 4, width: (toggleWidth - 8) / 2,
                                    transform: [{ translateX: slideAnimToggle.interpolate({ inputRange: [0, 1], outputRange: [0, (toggleWidth - 8) / 2] }) }],
                                    backgroundColor: slideAnimToggle.interpolate({ inputRange: [0, 1], outputRange: [COLORS.royalBlue, COLORS.teal] }),
                                    borderRadius: 100,
                                }} />
                            )}
                            <Button f={1} h={44} br={100} bg="transparent" bw={0} onPress={() => vm.setIsRealtime(false)} disabled={isRecording} opacity={isRecording ? 0.5 : 1} pressStyle={{ bg: "transparent" }}>
                                <SizableText fow={!vm.isRealtime ? "800" : "600"} size="$3" color={!vm.isRealtime ? "white" : COLORS.textMid}>Phrase Mode</SizableText>
                            </Button>
                            <Button f={1} h={44} br={100} bg="transparent" bw={0} onPress={() => vm.setIsRealtime(true)} disabled={isRecording} opacity={isRecording ? 0.5 : 1} pressStyle={{ bg: "transparent" }}>
                                <SizableText fow={vm.isRealtime ? "800" : "600"} size="$3" color={vm.isRealtime ? "white" : COLORS.textMid}>Live Mode</SizableText>
                            </Button>
                        </XStack>
                    </Animated.View>

                    {/* Mic Section */}
                    <Animated.View style={{ opacity: vm.fadeAnim, transform: [{ scale: vm.fadeAnim }] }}>
                        <YStack ai="center" gap="$4">
                            <YStack w={110} h={110} jc="center" ai="center">
                                <PulseRing active={isRecording} color={vm.isRealtime ? COLORS.teal : COLORS.royalBlue} />
                                <Button
                                    size={80} br={40} bg={isRecording ? '#DC2626' : (vm.isRealtime ? COLORS.teal : COLORS.royalBlue)}
                                    onPress={isRecording ? vm.stopRecording : vm.startRecording} disabled={vm.loading}
                                    pressStyle={{ scale: 0.95, opacity: 0.9 }} elevation={12}
                                    icon={vm.loading ? <Spinner size="small" color="white" /> : (isRecording ? <Square size={24} color="white" fill="white" /> : <Mic size={30} color="white" />)}
                                />
                            </YStack>
                            <YStack ai="center" mt="$-2">
                                <SizableText size="$3" fow="700" color={isRecording ? '#DC2626' : COLORS.textDark}>{statusText}</SizableText>
                                {isRecording && <YStack mt="$1"><AnimatedWaveform color={vm.isRealtime ? COLORS.teal : COLORS.royalBlue} /></YStack>}
                            </YStack>
                        </YStack>
                    </Animated.View>

                    {/* Transcript Card */}
                    <Animated.View style={{ opacity: vm.fadeAnim, transform: [{ translateY: vm.slideAnim }] }}>
                        <Card bg="white" br={24} elevation={8} bw={1} bc="rgba(221, 214, 200, 0.4)" ov="hidden" p="$4">
                            <XStack ai="center" gap="$2" mb="$3">
                                <YStack w={28} h={28} br={10} bg={vm.isRealtime ? `${COLORS.teal}08` : `${COLORS.royalBlue}08`} jc="center" ai="center">
                                    <FileText size={14} color={vm.isRealtime ? COLORS.teal : COLORS.royalBlue} />
                                </YStack>
                                <SizableText fow="800" size="$3" color={COLORS.textDark}>{vm.isRealtime ? "Live Transcript" : "Phrase Transcript"}</SizableText>
                                <YStack f={1} h={1} bg={COLORS.sandMid} opacity={0.2} ml="$2" />
                                {vm.confidence > 0 && (
                                    <XStack bg={vm.confidence > 80 ? `${COLORS.teal}10` : (vm.isRealtime ? `${COLORS.teal}10` : `${COLORS.royalBlue}10`)} px="$2" py="$0.5" br={8} ai="center" gap="$1.5">
                                        <SizableText size="$1" fow="800" color={vm.confidence > 80 ? COLORS.teal : (vm.isRealtime ? COLORS.teal : COLORS.royalBlue)}>{Math.round(vm.confidence)}% CLARITY</SizableText>
                                    </XStack>
                                )}
                            </XStack>

                            <ScrollView minHeight={150} maxHeight={vm.isRealtime ? 380 : 180} showsVerticalScrollIndicator={false}>
                                {vm.words && vm.words.length > 0 ? (
                                    <XStack fw="wrap" gap="$1.5">
                                        {vm.words.map((w: any, i: number) => (
                                            <YStack key={i} px="$2" py="$1" br={6} bg={w.confidence > 80 ? (vm.isRealtime ? `${COLORS.teal}08` : `${COLORS.royalBlue}08`) : w.confidence > 50 ? "#F59E0B08" : "#EF444408"} bw={1} bc={w.confidence > 80 ? (vm.isRealtime ? `${COLORS.teal}20` : `${COLORS.royalBlue}20`) : w.confidence > 50 ? "#F59E0B20" : "#EF444420"}>
                                                <SizableText size={vm.isRealtime ? "$5" : "$4"} fow="600" color={w.confidence > 80 ? COLORS.textDark : w.confidence > 50 ? "#B45309" : "#B91C1C"}>{w.word}</SizableText>
                                            </YStack>
                                        ))}
                                    </XStack>
                                ) : (
                                    <TextArea minHeight={150} bg="transparent" borderColor="transparent" p="$0" size="$4" fontWeight="500" color={COLORS.textDark} value={vm.transcript} onChangeText={vm.setTranscript} placeholder="Start speaking..." placeholderTextColor={COLORS.textMid as any} />
                                )}
                            </ScrollView>

                            {/* Integrated Quick Repeat - Optimized UI */}
                            {!vm.isRealtime && vm.phraseVault.length > 0 && (
                                <YStack mt="$3" gap="$2" pt="$3" borderTopWidth={1} borderTopColor="rgba(221, 214, 200, 0.2)">
                                    <XStack ai="center" gap="$2" px="$1">
                                        <Bookmark size={10} color={COLORS.royalBlue} opacity={0.6} />
                                        <SizableText fow="800" size="$1" color={COLORS.textMid} ls={0.8} tt="uppercase">Quick Repeat</SizableText>
                                    </XStack>
                                    <XStack fw="wrap" gap="$1.5">
                                        {vm.phraseVault.map((phrase: string, i: number) => (
                                            <Button 
                                                key={i} h={34} br={12} bg="rgba(221, 214, 200, 0.15)" bw={0} px="$3"
                                                onPress={() => vm.usePhrase(phrase)}
                                                pressStyle={{ scale: 0.95, bg: COLORS.sandMid }}
                                            >
                                                <SizableText size="$1" fow="700" color={COLORS.textDark}>{phrase}</SizableText>
                                            </Button>
                                        ))}
                                    </XStack>
                                </YStack>
                            )}

                            <XStack jc="flex-end" ai="center" mt="$3" gap="$3">
                                {vm.transcript.length > 0 && !vm.isRealtime && (
                                    <Button size="$1" bg="transparent" onPress={vm.saveToVault} icon={<Star size={12} color={COLORS.royalBlue} />} p="$0" mr="$2">
                                        <SizableText size="$1" color={COLORS.royalBlue} fow="700">Pin to Vault</SizableText>
                                    </Button>
                                )}
                                {vm.transcript.length > 0 && (
                                    <SizableText size="$1" color={COLORS.textMid} fow="600" opacity={0.4}>{vm.transcript.split(' ').length} words</SizableText>
                                )}
                            </XStack>
                        </Card>
                    </Animated.View>

                    {/* Action Buttons */}
                    <Animated.View style={{ opacity: vm.fadeAnim, transform: [{ translateY: vm.slideAnim }] }}>
                        <YStack gap="$2.5">
                            <Button h={54} bg={vm.isRealtime ? COLORS.teal : COLORS.royalBlue} br={16} onPress={vm.speakText} disabled={!vm.transcript} opacity={!vm.transcript ? 0.4 : 1} pressStyle={{ scale: 0.98, opacity: 0.9 }} icon={<Volume2 size={18} color="white" />} elevation={6}>
                                <SizableText fow="800" size="$4" color="white" ml="$1.5">Play Clarity Voice</SizableText>
                            </Button>
                            <Button h={54} bg="white" br={16} onPress={vm.clearTranscript} disabled={!vm.transcript} opacity={!vm.transcript ? 0.4 : 1} pressStyle={{ scale: 0.98, opacity: 0.9 }} bw={1} bc="#FEE2E2" icon={<Trash2 size={16} color="#DC2626" />}>
                                <SizableText fow="710" size="$3" color="#DC2626" ml="$1">Reset Transcript</SizableText>
                            </Button>
                        </YStack>
                    </Animated.View>
                </YStack>
            </ScrollView>
        </YStack>
    );
};
