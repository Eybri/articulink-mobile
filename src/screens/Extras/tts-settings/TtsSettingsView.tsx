import React from "react";
import { Platform, StatusBar } from "react-native";
import { YStack, XStack, ZStack, Button, Circle, SizableText, ScrollView, Spinner, Card } from "tamagui";
import { ChevronLeft, Volume2, Play, Save, Settings2, Globe, Music } from "@tamagui/lucide-icons";
import Slider from "@react-native-community/slider";
import { COLORS } from "../../../constants/colors";
import { useTtsSettingsViewModel } from "./useTtsSettingsViewModel";

export const TtsSettingsView = () => {
    const vm = useTtsSettingsViewModel();

    return (
        <YStack f={1} bg={COLORS.cream}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

            {/* Background Decor */}
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
                    <SizableText size="$5" fow="900" color={COLORS.textDark} ml="$4">Voice Settings</SizableText>
                </XStack>

                <YStack px="$5" gap="$5">
                    {/* Hero Section */}
                    <YStack ai="center" mb="$4">
                        <Circle size={80} bg={`${COLORS.teal}10`} bw={1} bc={`${COLORS.teal}20`}>
                            <Volume2 size={32} color={COLORS.teal} />
                        </Circle>
                        <SizableText size="$2" color={COLORS.textMid} ta="center" mt="$4" maw={280}>
                            Customize how the app speaks back to you. Adjust the speed and tone to your preference.
                        </SizableText>
                    </YStack>

                    {/* Settings Card */}
                    <Card bg="white" br={24} p="$5" bw={1} bc={COLORS.sandMid} elevation={2}>
                        <YStack gap="$6">
                            {/* Speech Rate */}
                            <YStack gap="$3">
                                <XStack ai="center" gap="$2">
                                    <Music size={16} color={COLORS.royalBlue} />
                                    <SizableText size="$2" fow="800" color={COLORS.textDark} ls={0.5} tt="uppercase">Speech Rate</SizableText>
                                    <XStack f={1} />
                                    <SizableText size="$2" fow="700" color={COLORS.royalBlue}>{vm.rate.toFixed(1)}x</SizableText>
                                </XStack>
                                <Slider
                                    style={{ width: '100%', height: 40 }}
                                    minimumValue={0.5}
                                    maximumValue={2.0}
                                    step={0.1}
                                    value={vm.rate}
                                    onValueChange={vm.setRate}
                                    minimumTrackTintColor={COLORS.royalBlue}
                                    maximumTrackTintColor={COLORS.sandMid}
                                    thumbTintColor={COLORS.royalBlue}
                                />
                                <XStack jc="space-between" px="$1">
                                    <SizableText size="$1" color={COLORS.textMid}>Slower</SizableText>
                                    <SizableText size="$1" color={COLORS.textMid}>Faster</SizableText>
                                </XStack>
                            </YStack>

                            <YStack h={1} bg={COLORS.sandMid} opacity={0.3} />

                            {/* Pitch */}
                            <YStack gap="$3">
                                <XStack ai="center" gap="$2">
                                    <Settings2 size={16} color={COLORS.royalBlue} />
                                    <SizableText size="$2" fow="800" color={COLORS.textDark} ls={0.5} tt="uppercase">Pitch</SizableText>
                                    <XStack f={1} />
                                    <SizableText size="$2" fow="700" color={COLORS.royalBlue}>{vm.pitch.toFixed(1)}</SizableText>
                                </XStack>
                                <Slider
                                    style={{ width: '100%', height: 40 }}
                                    minimumValue={0.5}
                                    maximumValue={2.0}
                                    step={0.1}
                                    value={vm.pitch}
                                    onValueChange={vm.setPitch}
                                    minimumTrackTintColor={COLORS.royalBlue}
                                    maximumTrackTintColor={COLORS.sandMid}
                                    thumbTintColor={COLORS.royalBlue}
                                />
                                <XStack jc="space-between" px="$1">
                                    <SizableText size="$1" color={COLORS.textMid}>Deeper</SizableText>
                                    <SizableText size="$1" color={COLORS.textMid}>Higher</SizableText>
                                </XStack>
                            </YStack>

                            <YStack h={1} bg={COLORS.sandMid} opacity={0.3} />

                            {/* Language */}
                            <YStack gap="$3">
                                <XStack ai="center" gap="$2">
                                    <Globe size={16} color={COLORS.royalBlue} />
                                    <SizableText size="$2" fow="800" color={COLORS.textDark} ls={0.5} tt="uppercase">Preferred Language</SizableText>
                                </XStack>
                                <XStack fw="wrap" gap="$2" mt="$1">
                                    {vm.languages.map((lang) => (
                                        <Button
                                            key={lang.value}
                                            size="$3"
                                            br={12}
                                            bg={vm.language === lang.value ? COLORS.royalBlue : "white"}
                                            bw={1}
                                            bc={vm.language === lang.value ? COLORS.royalBlue : COLORS.sandMid}
                                            onPress={() => vm.setLanguage(lang.value)}
                                            pressStyle={{ scale: 0.98 }}
                                        >
                                            <SizableText 
                                                color={vm.language === lang.value ? "white" : COLORS.textDark} 
                                                fow="700" 
                                                size="$2"
                                            >
                                                {lang.label}
                                            </SizableText>
                                        </Button>
                                    ))}
                                </XStack>
                            </YStack>
                        </YStack>
                    </Card>

                    {/* Test & Save Buttons */}
                    <YStack mt="$4" gap="$3">
                        <Button
                            bg={COLORS.teal}
                            h={56}
                            br={18}
                            icon={<Play size={18} color="white" />}
                            onPress={vm.testVoice}
                            pressStyle={{ scale: 0.98, opacity: 0.9 }}
                        >
                            <SizableText color="white" fow="800" size="$3" ls={0.5}>PREVIEW VOICE</SizableText>
                        </Button>

                        <Button
                            bg={COLORS.royalBlue}
                            h={60}
                            br={20}
                            elevation={4}
                            onPress={vm.handleSave}
                            disabled={vm.loading}
                            iconAfter={vm.loading ? <Spinner color="white" /> : <Save size={18} color="white" />}
                            pressStyle={{ scale: 0.98, opacity: 0.9 }}
                        >
                            <SizableText color="white" fow="800" size="$4" ls={0.5}>SAVE PREFERENCES</SizableText>
                        </Button>
                    </YStack>
                </YStack>
            </ScrollView>
        </YStack>
    );
};
