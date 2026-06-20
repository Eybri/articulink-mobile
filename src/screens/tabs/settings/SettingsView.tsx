import React from 'react';
import {
  ScrollView,
  StatusBar,
  Animated,
  Alert,
  Image as RNImage,
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
  Star,
  MessageSquareQuote,
} from "@tamagui/lucide-icons";
import { COLORS } from "./../../../constants/colors";
import { SettingRow, SliderSetting } from "./components/SettingsComponents";
import { getProfileSource } from "./../../../utils/imageHelper";

interface SettingsViewProps {
    vm: any;
    navigation: any;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ vm, navigation }) => {
    return (
        <YStack f={1} bg="#F8FAFC">
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

            <Animated.View style={{ 
                flex: 1, 
                opacity: vm.animations.fadeAnim, 
                transform: [{ translateY: vm.animations.slideAnim }] 
            }}>
                <ScrollView 
                    showsVerticalScrollIndicator={false} 
                    contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 130, paddingTop: 10, marginTop: 20 }}
                >
                    {/* Identity Header */}
                    {vm.user && (
                        <Card bg="white" br={12} p="$4" mb="$5" elevation={2} shadowColor="#000" shadowOpacity={0.04} shadowRadius={8} bw={1} bc="#E2E8F0">
                            <XStack ai="center" gap="$4">
                                <YStack w={64} h={64} br={32} jc="center" ai="center" bw={2} bc={COLORS.cream} ov="hidden" elevation={4} shadowColor={COLORS.royalBlue} shadowOpacity={0.15}>
                                    {vm.user.profile_pic ? (
                                        <RNImage
                                            source={getProfileSource(vm.user.profile_pic)}
                                            style={{ width: 64, height: 64, borderRadius: 32 }}
                                            resizeMode="cover"
                                        />
                                    ) : (
                                        <YStack f={1} w="100%" bg={COLORS.royalBlue} jc="center" ai="center">
                                            <SizableText size="$6" fow="900" color="white">
                                                {vm.user.username?.[0]?.toUpperCase() ?? "U"}
                                            </SizableText>
                                        </YStack>
                                    )}
                                </YStack>
                                <YStack f={1}>
                                    <SizableText size="$6" fow="900" color={COLORS.textDark} ls={-0.5} numberOfLines={1}>
                                        {vm.user.first_name && vm.user.last_name ? `${vm.user.first_name} ${vm.user.last_name}` : (vm.user.username || "User")}
                                    </SizableText>
                                    {vm.user.username && (
                                        <SizableText size="$3" color={COLORS.royalBlue} fow="700" mt="$1" opacity={0.8}>
                                            @{vm.user.username}
                                        </SizableText>
                                    )}
                                </YStack>
                            </XStack>
                        </Card>
                    )}

                    {/* Section: Account */}
                    <YStack mb="$5">
                        <XStack ai="center" gap="$2" mb="$3" ml="$2">
                            <User size={14} color={COLORS.royalBlue} />
                            <SizableText size="$2" fontWeight="800" color={COLORS.royalBlue} textTransform="uppercase" ls={1.5}>Account</SizableText>
                        </XStack>
                        
                        <Card bg="white" br={12} p="$1" px="$5" elevation={2} shadowColor="#000" shadowOpacity={0.04} shadowRadius={8} bw={1} bc="#E2E8F0">
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
                    <YStack mb="$5">
                        <XStack ai="center" gap="$2" mb="$3" ml="$2">
                            <AppWindow size={14} color={COLORS.royalBlue} />
                            <SizableText size="$2" fontWeight="800" color={COLORS.royalBlue} textTransform="uppercase" ls={1.5}>Preferences</SizableText>
                        </XStack>
                        
                        <Card bg="white" br={12} p="$1" px="$5" elevation={2} shadowColor="#000" shadowOpacity={0.04} shadowRadius={8} bw={1} bc="#E2E8F0">
                            <SettingRow icon={<History size={18} color={COLORS.royalBlue} />} title="Store History" description="Keep logs on this device" isLast>
                                <Switch size="$3" bg={vm.saveHistory ? COLORS.royalBlue : COLORS.sandMid} checked={vm.saveHistory} onCheckedChange={vm.setSaveHistory}>
                                    <Switch.Thumb bg="white" />
                                </Switch>
                            </SettingRow>
                        </Card>
                    </YStack>



                    {/* Section: Privacy & Storage */}
                    <YStack mb="$5">
                        <XStack ai="center" gap="$2" mb="$3" ml="$2">
                            <Lock size={14} color={COLORS.textMid} />
                            <SizableText size="$2" fow="800" color={COLORS.textMid} textTransform="uppercase" ls={1.5}>Privacy & Security</SizableText>
                        </XStack>
                        
                        <Card bg="white" br={12} p="$1" px="$5" elevation={2} shadowColor="#000" shadowOpacity={0.04} shadowRadius={8} bw={1} bc="#E2E8F0">
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
                                onPress={() => navigation.navigate("SecurityPrivacy")}
                            >
                                <ChevronRight size={18} color={COLORS.sandMid} />
                            </SettingRow>
                        </Card>
                    </YStack>

                    {/* Section: Support & Feedback */}
                    <YStack mb="$5">
                        <XStack ai="center" gap="$2" mb="$3" ml="$2">
                            <Star size={14} color={COLORS.royalBlue} />
                            <SizableText size="$2" fow="800" color={COLORS.royalBlue} textTransform="uppercase" ls={1.5}>Support</SizableText>
                        </XStack>
                        
                        <Card bg="white" br={12} p="$1" px="$5" elevation={2} shadowColor="#000" shadowOpacity={0.04} shadowRadius={8} bw={1} bc="#E2E8F0">
                            <SettingRow 
                                icon={<Star size={18} color={COLORS.royalBlue} />} 
                                title="Rate the App" 
                                description="Enjoying Articulink? Leave a review!"
                                onPress={vm.handleReview}
                            >
                                <ChevronRight size={18} color={COLORS.sandMid} />
                            </SettingRow>
                            
                            <SettingRow 
                                icon={<MessageSquareQuote size={18} color={COLORS.royalBlue} />} 
                                title="My Feedbacks" 
                                description="View past feedback and admin replies"
                                onPress={vm.handleMyFeedbacks}
                                isLast
                            >
                                <ChevronRight size={18} color={COLORS.sandMid} />
                            </SettingRow>
                        </Card>
                    </YStack>

                    {/* Logout Button */}
                    <Button
                        mt="$3"
                        mb="$4"
                        bg="rgba(220,38,38,0.04)"
                        h={56}
                        br={12}
                        bw={1}
                        bc="rgba(220,38,38,0.15)"
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
