import React, { useState } from "react";
import { Platform, StatusBar } from "react-native";
import { YStack, XStack, ZStack, Button, Circle, SizableText, ScrollView, Spinner, Card, Separator } from "tamagui";
import { ChevronLeft, Volume2, Play, Save, Settings2, Globe, Music, Mic, User, UserPlus, Info } from "@tamagui/lucide-icons";
import Slider from "@react-native-community/slider";
import { COLORS } from "../../../constants/colors";
import { useTtsSettingsViewModel } from "./useTtsSettingsViewModel";

export const TtsSettingsView = () => {
    const vm = useTtsSettingsViewModel();
    const [activeTab, setActiveTab] = useState<'male' | 'female'>('female');

    const VoiceCard = ({ voice }: { voice: any }) => (
        <Button
            key={voice.identifier}
            h={52}
            br={16}
            bg={vm.selectedVoice === voice.identifier ? COLORS.teal : "white"}
            bw={1}
            bc={vm.selectedVoice === voice.identifier ? COLORS.teal : COLORS.sandMid}
            onPress={() => {
                vm.setSelectedVoice(voice.identifier);
                vm.testVoice(voice.identifier);
            }}
            pressStyle={{ scale: 0.98 }}
            jc="flex-start"
            px="$4"
            mb="$2"
            elevation={vm.selectedVoice === voice.identifier ? 4 : 0}
        >
            <XStack ai="center" gap="$3" w="100%">
                <Circle size={8} bg={vm.selectedVoice === voice.identifier ? "white" : (voice.gender === 'male' ? COLORS.royalBlue : COLORS.teal)} />
                <YStack f={1}>
                    <SizableText 
                        color={vm.selectedVoice === voice.identifier ? "white" : COLORS.textDark} 
                        fow="700" 
                        size="$3"
                        numberOfLines={1}
                    >
                        {voice.friendlyName}
                    </SizableText>
                </YStack>
                {vm.selectedVoice === voice.identifier && <Play size={14} color="white" />}
            </XStack>
        </Button>
    );

    const currentVoices = activeTab === 'male' ? vm.categorizedVoices.male : vm.categorizedVoices.female;

    return (
        <YStack f={1} bg={COLORS.cream}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

            <ZStack pos="absolute" fullscreen pointerEvents="none">
                <Circle pos="absolute" t={-100} r={-50} size={400} bg={COLORS.sandLight} opacity={0.4} />
            </ZStack>

            <ScrollView f={1} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100, paddingTop: Platform.OS === 'ios' ? 60 : 40 }}>
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
                    <SizableText size="$5" fow="900" color={COLORS.textDark} ml="$4">Voice Selection</SizableText>
                </XStack>

                <YStack px="$5" gap="$5">
                    {/* Voice Selection Section */}
                    <YStack gap="$4">
                        <XStack ai="center" gap="$2">
                            <Mic size={18} color={COLORS.royalBlue} />
                            <SizableText size="$4" fow="900" color={COLORS.textDark}>Choose Persona</SizableText>
                        </XStack>

                        <Card bg="white" br={24} p="$2.5" bw={1} bc={COLORS.sandMid} elevation={6}>
                            {/* Gender Tabs */}
                            <XStack bg={COLORS.cream} br={20} p="$1.5" mb="$3">
                                <Button
                                    f={1} h={44} br={16}
                                    bg={activeTab === 'male' ? COLORS.royalBlue : "transparent"}
                                    onPress={() => setActiveTab('male')}
                                    icon={<User size={16} color={activeTab === 'male' ? "white" : COLORS.textMid} />}
                                >
                                    <SizableText color={activeTab === 'male' ? "white" : COLORS.textMid} fow="800" size="$2" tt="uppercase">Male</SizableText>
                                </Button>
                                <Button
                                    f={1} h={44} br={16}
                                    bg={activeTab === 'female' ? COLORS.teal : "transparent"}
                                    onPress={() => setActiveTab('female')}
                                    icon={<UserPlus size={16} color={activeTab === 'female' ? "white" : COLORS.textMid} />}
                                >
                                    <SizableText color={activeTab === 'female' ? "white" : COLORS.textMid} fow="800" size="$2" tt="uppercase">Female</SizableText>
                                </Button>
                            </XStack>

                            {/* Top 6 Voices List */}
                            <YStack p="$1">
                                {currentVoices.length > 0 ? (
                                    currentVoices.map((v) => <VoiceCard key={v.identifier} voice={v} />)
                                ) : (
                                    <YStack ai="center" py="$8">
                                        <Info size={32} color={COLORS.sandMid} opacity={0.5} />
                                        <SizableText color={COLORS.textMid} opacity={0.6} mt="$2" ta="center">
                                            No {activeTab} voices available.
                                        </SizableText>
                                    </YStack>
                                )}
                            </YStack>
                        </Card>
                    </YStack>

                    {/* Tone Settings */}
                    <YStack gap="$4" mt="$2">
                        <XStack ai="center" gap="$2">
                            <Settings2 size={18} color={COLORS.royalBlue} />
                            <SizableText size="$4" fow="900" color={COLORS.textDark}>Tone & Speed</SizableText>
                        </XStack>

                        <Card bg="white" br={24} p="$5" bw={1} bc={COLORS.sandMid} elevation={2}>
                            <YStack gap="$5">
                                <YStack gap="$2">
                                    <XStack ai="center" jc="space-between">
                                        <XStack ai="center" gap="$2">
                                            <Music size={14} color={COLORS.textMid} />
                                            <SizableText size="$2" fow="700" color={COLORS.textDark}>Speech Speed</SizableText>
                                        </XStack>
                                        <SizableText size="$2" fow="800" color={COLORS.royalBlue}>{vm.rate.toFixed(1)}x</SizableText>
                                    </XStack>
                                    <Slider
                                        style={{ width: '100%', height: 40 }}
                                        minimumValue={0.5} maximumValue={2.0} step={0.1}
                                        value={vm.rate} onValueChange={vm.setRate}
                                        minimumTrackTintColor={COLORS.royalBlue} thumbTintColor={COLORS.royalBlue}
                                    />
                                </YStack>

                                <Separator />

                                <YStack gap="$2">
                                    <XStack ai="center" jc="space-between">
                                        <XStack ai="center" gap="$2">
                                            <Volume2 size={14} color={COLORS.textMid} />
                                            <SizableText size="$2" fow="700" color={COLORS.textDark}>Voice Pitch</SizableText>
                                        </XStack>
                                        <SizableText size="$2" fow="800" color={COLORS.royalBlue}>{vm.pitch.toFixed(1)}</SizableText>
                                    </XStack>
                                    <Slider
                                        style={{ width: '100%', height: 40 }}
                                        minimumValue={0.5} maximumValue={2.0} step={0.1}
                                        value={vm.pitch} onValueChange={vm.setPitch}
                                        minimumTrackTintColor={COLORS.royalBlue} thumbTintColor={COLORS.royalBlue}
                                    />
                                </YStack>
                            </YStack>
                        </Card>
                    </YStack>

                    {/* Language Selection */}
                    <YStack gap="$4" mt="$2">
                        <XStack ai="center" gap="$2">
                            <Globe size={18} color={COLORS.royalBlue} />
                            <SizableText size="$4" fow="900" color={COLORS.textDark}>Language</SizableText>
                        </XStack>
                        <XStack fw="wrap" gap="$2">
                            {vm.languages.map((lang) => (
                                <Button
                                    key={lang.value} size="$3" br={12}
                                    bg={vm.language === lang.value ? COLORS.royalBlue : "white"}
                                    bw={1} bc={vm.language === lang.value ? COLORS.royalBlue : COLORS.sandMid}
                                    onPress={() => vm.setLanguage(lang.value)}
                                    pressStyle={{ scale: 0.98 }}
                                >
                                    <SizableText color={vm.language === lang.value ? "white" : COLORS.textDark} fow="700" size="$2">{lang.label}</SizableText>
                                </Button>
                            ))}
                        </XStack>
                    </YStack>

                    <Button
                        mt="$6" bg={COLORS.royalBlue} h={60} br={20} elevation={8}
                        onPress={vm.handleSave} disabled={vm.loading}
                        iconAfter={vm.loading ? <Spinner color="white" /> : <Save size={18} color="white" />}
                        pressStyle={{ scale: 0.98, opacity: 0.9 }}
                    >
                        <SizableText color="white" fow="900" size="$4" ls={1}>APPLY PERSONA</SizableText>
                    </Button>
                </YStack>
            </ScrollView>
        </YStack>
    );
};
