import React from "react";
import {
    Platform,
    StatusBar,
    Animated,
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
    ScrollView, 
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
    const statusText = vm.loading ? "Processing speech..." : isRecording ? "Listening..." : "Tap the mic to start";

    return (
        <YStack f={1} bg={COLORS.cream}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

            {/* ── Layered Background ── */}
            <ZStack pos="absolute" fullscreen pointerEvents="none">
                <YStack fullscreen bg={COLORS.cream} />
                {vm.orbs.map((orb: any, i: number) => <SoftOrb key={i} {...orb} />)}
            </ZStack>

            <ScrollView
                f={1}
                showsVerticalScrollIndicator={false}
                contentInsetAdjustmentBehavior="automatic"
                contentContainerStyle={{
                    paddingBottom: Platform.OS === 'ios' ? 200 : 180, 
                    paddingTop: Platform.OS === "android" ? 20 : 0,
                }}
            >
                <YStack px="$5" gap="$5" pt="$4">
                    {/* Hero Branding Section (Restored & Refined) */}
                    <Animated.View style={{ opacity: vm.fadeAnim, transform: [{ translateY: vm.slideAnim }] }}>
                        <YStack ai="center" gap="$1.5" mb="$1">
                            <YStack bg={`${COLORS.teal}10`} px="$2.5" py="$0.5" br={100} bw={1} bc={`${COLORS.teal}20`}>
                                <SizableText size="$1" fontWeight="800" color={COLORS.teal} ls={1.2} tt="uppercase">
                                    AI Clarity Engine
                                </SizableText>
                            </YStack>
                            <SizableText size="$3" color={COLORS.textMid} fow="500" ta="center" px="$4" opacity={0.75}>
                                Enhancing speech clarity with premium AI
                            </SizableText>
                        </YStack>
                    </Animated.View>

                    {/* Mic Section (Compact) */}
                    <Animated.View style={{ opacity: vm.fadeAnim, transform: [{ scale: vm.fadeAnim }] }}>
                        <YStack ai="center" gap="$4">
                            <YStack w={110} h={110} jc="center" ai="center">
                                <PulseRing active={isRecording} />
                                <AnimatePresence>
                                    {isRecording && (
                                        <Circle
                                            key="active-bg"
                                            pos="absolute"
                                            size={110}
                                            bg={COLORS.teal}
                                            opacity={0.08}
                                        />
                                    )}
                                </AnimatePresence>

                                <Button
                                    size={80}
                                    br={40}
                                    bg={isRecording ? '#DC2626' : COLORS.royalBlue}
                                    onPress={isRecording ? vm.stopRecording : vm.startRecording}
                                    disabled={vm.loading}
                                    pressStyle={{ scale: 0.95, opacity: 0.9 }}
                                    elevation={12}
                                    shadowColor={isRecording ? '#DC2626' : COLORS.royalBlue}
                                    shadowOffset={{ width: 0, height: 8 }}
                                    shadowOpacity={0.15}
                                    shadowRadius={15}
                                    icon={vm.loading ? <Spinner size="small" color="white" /> : (isRecording ? <Square size={24} color="white" fill="white" /> : <Mic size={30} color="white" />)}
                                />
                            </YStack>

                            <YStack ai="center" mt="$-2">
                                <SizableText size="$3" fow="700" color={isRecording ? '#DC2626' : COLORS.textDark}>
                                    {statusText}
                                </SizableText>
                                {isRecording && <YStack mt="$1"><AnimatedWaveform color={COLORS.teal} /></YStack>}
                            </YStack>
                        </YStack>
                    </Animated.View>

                    {/* Transcript Area - Sophisticated Card (Refined) */}
                    <Animated.View style={{ opacity: vm.fadeAnim, transform: [{ translateY: vm.slideAnim }] }}>
                        <Card
                            bg="white"
                            br={24}
                            elevation={8}
                            shadowColor={COLORS.deepNavy}
                            shadowOpacity={0.05}
                            shadowRadius={20}
                            bw={1}
                            bc="rgba(221, 214, 200, 0.4)"
                            ov="hidden"
                            p="$4"
                        >
                            <XStack ai="center" gap="$2" mb="$3">
                                <YStack w={28} h={28} br={10} bg={`${COLORS.royalBlue}08`} jc="center" ai="center">
                                    <FileText size={14} color={COLORS.royalBlue} />
                                </YStack>
                                <SizableText fow="800" size="$3" color={COLORS.textDark}>
                                    Transcript
                                </SizableText>
                                <YStack f={1} h={1} bg={COLORS.sandMid} opacity={0.2} ml="$2" />
                            </XStack>

                            <TextArea
                                h={180}
                                bg="transparent"
                                borderColor="transparent"
                                p="$0"
                                size="$4"
                                fontWeight="500"
                                color={COLORS.textDark}
                                value={vm.transcript}
                                onChangeText={vm.setTranscript}
                                placeholder="Start speaking..."
                                placeholderTextColor={COLORS.textMid as any}
                            />

                            {vm.transcript.length > 0 && (
                                <XStack jc="flex-end" mt="$1">
                                    <SizableText size="$1" color={COLORS.textMid} fow="600" opacity={0.4}>
                                        {vm.transcript.split(' ').length} words
                                    </SizableText>
                                </XStack>
                            )}
                        </Card>
                    </Animated.View>

                    {/* Action Buttons - Primary Style (Compact) */}
                    <Animated.View style={{ opacity: vm.fadeAnim, transform: [{ translateY: vm.slideAnim }] }}>
                        <YStack gap="$2.5">
                            <Button
                                h={54}
                                bg={COLORS.royalBlue}
                                br={16}
                                onPress={vm.speakText}
                                disabled={!vm.transcript}
                                opacity={!vm.transcript ? 0.4 : 1}
                                pressStyle={{ scale: 0.98, opacity: 0.9 }}
                                icon={<Volume2 size={18} color="white" />}
                                iconAfter={<ChevronRight size={16} color="rgba(255,255,255,0.4)" />}
                                elevation={6}
                                shadowColor={COLORS.royalBlue}
                                shadowOpacity={0.15}
                            >
                                <SizableText fow="800" size="$4" color="white" ml="$1.5">
                                    Play Clarity Voice
                                </SizableText>
                            </Button>

                            <Button
                                h={54}
                                bg="white"
                                br={16}
                                onPress={vm.clearTranscript}
                                disabled={!vm.transcript}
                                opacity={!vm.transcript ? 0.4 : 1}
                                pressStyle={{ scale: 0.98, opacity: 0.9 }}
                                borderWidth={1}
                                borderColor="#FEE2E2"
                                icon={<Trash2 size={16} color="#DC2626" />}
                            >
                                <SizableText fow="710" size="$3" color="#DC2626" ml="$1">
                                    Reset Transcript
                                </SizableText>
                            </Button>
                        </YStack>
                    </Animated.View>

                </YStack>
            </ScrollView>
        </YStack>
    );
};
