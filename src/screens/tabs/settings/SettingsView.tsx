import React from 'react';
import {
  ScrollView,
  StatusBar,
  Animated,
  Alert,
} from 'react-native';
import {
  YStack,
  XStack,
  ZStack,
  Button,
  Circle,
  SizableText,
  Card,
  Switch,
  Separator,
  Paragraph,
} from "tamagui";
import {
  User,
  Bell,
  History,
  Volume2,
  Mic,
  ShieldCheck,
  Smartphone,
  ChevronRight,
  Trash2,
  LogOut,
  AppWindow,
  Lock,
} from "@tamagui/lucide-icons";
import { COLORS } from "./../../../constants/colors";
import { SettingRow, SliderSetting } from "./components/SettingsComponents";

interface SettingsViewProps {
    vm: any;
    navigation: any;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ vm, navigation }) => {
    return (
        <YStack f={1} bg={COLORS.cream}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
            
            {/* Background blobs for depth */}
            <ZStack pos="absolute" fullscreen pointerEvents="none">
                <Circle pos="absolute" t={-vm.height * 0.1} r={-vm.width * 0.25} size={vm.width * 0.9} bg={COLORS.sandLight} opacity={0.35} />
                <Circle pos="absolute" b={-vm.height * 0.15} l={-vm.width * 0.2} size={vm.width * 0.8} bg={COLORS.orbTeal} opacity={0.15} />
                <Circle pos="absolute" t={vm.height * 0.4} r={-vm.width * 0.1} size={vm.width * 0.2} bg={COLORS.orbSand} opacity={0.2} />
            </ZStack>

            <Animated.View style={{ 
                flex: 1, 
                opacity: vm.animations.fadeAnim, 
                transform: [{ translateY: vm.animations.slideAnim }] 
            }}>
                <ScrollView 
                    showsVerticalScrollIndicator={false} 
                    contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 140, paddingTop: 10, marginTop: 40 }}
                >
                    {/* Section: Account */}
                    <YStack mb="$7">
                        <XStack ai="center" gap="$2" mb="$3" ml="$2">
                            <User size={14} color={COLORS.royalBlue} />
                            <SizableText size="$2" fontWeight="800" color={COLORS.royalBlue} textTransform="uppercase" ls={1.5}>Account</SizableText>
                        </XStack>
                        
                        <Card bg="white" br={28} p="$1" px="$5" elevation={6} shadowColor="#8A96A4" shadowOpacity={0.08} bw={1} bc="rgba(221, 214, 200, 0.4)">
                            <SettingRow 
                                icon={<User size={18} color={COLORS.royalBlue} />} 
                                title="Manage Profile" 
                                description="Update your personal info"
                                onPress={() => navigation.navigate("EditProfile")}
                            >
                                <ChevronRight size={18} color={COLORS.sandMid} />
                            </SettingRow>
                            
                            <SettingRow 
                                icon={<Lock size={18} color={COLORS.royalBlue} />} 
                                title="Password & Security" 
                                description="Update password and security"
                                onPress={() => navigation.navigate("ChangePassword")}
                            >
                                <ChevronRight size={18} color={COLORS.sandMid} />
                            </SettingRow>

                            <SettingRow 
                                icon={<Volume2 size={18} color={COLORS.royalBlue} />} 
                                title="Voice & TTS" 
                                description="Text-to-speech preferences"
                                onPress={() => navigation.navigate("TtsSettings")}
                                isLast
                            >
                                <ChevronRight size={18} color={COLORS.sandMid} />
                            </SettingRow>
                        </Card>
                    </YStack>

                    {/* Section: Configuration */}
                    <YStack mb="$7">
                        <XStack ai="center" gap="$2" mb="$3" ml="$2">
                            <AppWindow size={14} color={COLORS.royalBlue} />
                            <SizableText size="$2" fontWeight="800" color={COLORS.royalBlue} textTransform="uppercase" ls={1.5}>Preferences</SizableText>
                        </XStack>
                        
                        <Card bg="white" br={28} p="$1" px="$5" elevation={6} shadowColor="#8A96A4" shadowOpacity={0.08} bw={1} bc="rgba(221, 214, 200, 0.4)">
                            <SettingRow icon={<Bell size={18} color={COLORS.royalBlue} />} title="Push Notifications" description="Daily exercise reminders">
                                <Switch size="$3" bg={vm.notifications ? COLORS.royalBlue : COLORS.sandMid} checked={vm.notifications} onCheckedChange={vm.setNotifications}>
                                    <Switch.Thumb bg="white" />
                                </Switch>
                            </SettingRow>
                            
                            <SettingRow icon={<History size={18} color={COLORS.royalBlue} />} title="Store History" description="Keep logs on this device">
                                <Switch size="$3" bg={vm.saveHistory ? COLORS.royalBlue : COLORS.sandMid} checked={vm.saveHistory} onCheckedChange={vm.setSaveHistory}>
                                    <Switch.Thumb bg="white" />
                                </Switch>
                            </SettingRow>
                            
                            <SettingRow icon={<Smartphone size={18} color={COLORS.royalBlue} />} title="Haptic Feedback" description="Vibrate on interaction" isLast>
                                <Switch size="$3" bg={vm.vibrationFeedback ? COLORS.royalBlue : COLORS.sandMid} checked={vm.vibrationFeedback} onCheckedChange={vm.setVibrationFeedback}>
                                    <Switch.Thumb bg="white" />
                                </Switch>
                            </SettingRow>
                        </Card>
                    </YStack>

                    {/* Section: Audio Controls */}
                    <YStack mb="$7">
                        <XStack ai="center" gap="$2" mb="$3" ml="$2">
                            <Volume2 size={14} color={COLORS.teal} />
                            <SizableText size="$2" fontWeight="800" color={COLORS.teal} textTransform="uppercase" ls={1.5}>Audio Engine</SizableText>
                        </XStack>
                        
                        <Card bg="white" br={28} p="$1" px="$5" elevation={6} shadowColor="#8A96A4" shadowOpacity={0.08} bw={1} bc="rgba(221, 214, 200, 0.4)">
                            <SliderSetting icon={<Volume2 size={18} color={COLORS.teal} />} title="Output Volume" value={vm.voiceVolume} onValueChange={vm.setVoiceVolume} />
                            <Separator bc="rgba(221, 214, 200, 0.4)" />
                            <SliderSetting icon={<Mic size={18} color={COLORS.teal} />} title="Mic Recording" value={vm.micSensitivity} onValueChange={vm.setMicSensitivity} />
                        </Card>
                    </YStack>

                    {/* Section: Privacy & Storage */}
                    <YStack mb="$8">
                        <XStack ai="center" gap="$2" mb="$3" ml="$2">
                            <Lock size={14} color={COLORS.textMid} />
                            <SizableText size="$2" fow="800" color={COLORS.textMid} textTransform="uppercase" ls={1.5}>Privacy & Security</SizableText>
                        </XStack>
                        
                        <Card bg="white" br={28} p="$1" px="$5" elevation={6} shadowColor="#8A96A4" shadowOpacity={0.08} bw={1} bc="rgba(221, 214, 200, 0.4)">
                            <SettingRow 
                                icon={<Trash2 size={18} color="#DC2626" />} 
                                title="Clear Local Cache" 
                                description="Remove all local message data"
                                onPress={vm.handleClearHistory}
                            >
                                <ChevronRight size={18} color={COLORS.sandMid} />
                            </SettingRow>
                            
                            <SettingRow 
                                icon={<ShieldCheck size={18} color={COLORS.royalBlue} />} 
                                title="Privacy Policy" 
                                description="Review data handling" 
                                isLast
                                onPress={() => Alert.alert("Privacy Policy", "Your data is encrypted.")}
                            >
                                <ChevronRight size={18} color={COLORS.sandMid} />
                            </SettingRow>
                        </Card>
                    </YStack>

                    {/* Footer Info */}
                    <YStack ai="center" gap="$2" mt="$4" opacity={0.6}>
                        <SizableText size="$1" color={COLORS.textMid} fow="800" ls={1}>ARTICULINK v1.0.4 PRO</SizableText>
                        <XStack ai="center" gap="$1.5">
                            <Circle size={4} bg={COLORS.teal} />
                            <Paragraph size="$1" color={COLORS.textMid} fow="600">Built for Articulation Support</Paragraph>
                            <Circle size={4} bg={COLORS.teal} />
                        </XStack>
                    </YStack>

                    {/* Logout Button */}
                    <Button
                        mt="$10"
                        bg="rgba(220,38,38,0.06)"
                        h={62}
                        br={20}
                        bw={1.5}
                        bc="rgba(220,38,38,0.12)"
                        onPress={vm.handleLogout}
                        icon={<LogOut size={20} color="#DC2626" />}
                        pressStyle={{ scale: 0.97, bg: "rgba(220,38,38,0.1)" }}
                    >
                        <SizableText color="#DC2626" fow="800" size="$4" ls={-0.2}>Logout Session</SizableText>
                    </Button>
                </ScrollView>
            </Animated.View>
        </YStack>
    );
};
