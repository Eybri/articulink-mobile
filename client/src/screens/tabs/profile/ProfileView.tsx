import React, { useMemo } from "react";
import {
  Platform,
  StatusBar,
  Animated,
  RefreshControl,
  Image as RNImage,
} from "react-native";
import {
  YStack,
  XStack,
  ZStack,
  Button,
  Circle,
  SizableText,
  ScrollView,
  Spinner,
  Switch,
  Card,
  Separator,
} from "tamagui";
import {
  User,
  Shield,
  Edit3,
  LogOut,
  ChevronRight,
  TrendingUp,
  Zap,
  Flame,
  BarChart2,
  Bell,
  Settings,
  History,
  Smartphone,
  Volume2,
  Mic,
  Trash2,
  Lock,
} from "@tamagui/lucide-icons";
import { COLORS } from "./../../../constants/colors";
import { 
  SoftOrb, 
  SpeechProgressCard, 
  StatCard, 
  Accordion, 
  Bullet, 
  SubHeading, 
  InfoBox, 
  SectionLabel,
  SettingRow,
  SliderSetting
} from "./components/ProfileComponents";
import { getProfileSource } from "./../../../utils/imageHelper";

interface ProfileViewProps {
    vm: any;
    navigation: any;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ vm, navigation }) => {
    const orbs = useMemo(
        () => [
            { color: COLORS.orbBlue, size: vm.width * 0.65, x: vm.width * 0.88, y: vm.height * 0.07, duration: 6000, delay: 0 },
            { color: COLORS.orbTeal, size: vm.width * 0.5, x: vm.width * 0.1, y: vm.height * 0.48, duration: 7200, delay: 1000 },
            { color: COLORS.orbSand, size: vm.width * 0.38, x: vm.width * 0.62, y: vm.height * 0.8, duration: 5500, delay: 500 },
        ],
        [vm.width, vm.height]
    );

    if (vm.authLoading || (vm.refreshing && !vm.user)) {
        return (
            <YStack f={1} jc="center" ai="center" bg={COLORS.cream}>
                <Spinner size="large" color={COLORS.royalBlue} />
                <SizableText color={COLORS.textMid} mt="$2">Loading...</SizableText>
            </YStack>
        );
    }

    if (vm.error && !vm.user) {
        return (
            <YStack f={1} jc="center" ai="center" bg={COLORS.cream} p="$5">
                <SizableText color="#DC2626" fow="600" ta="center" mt="$4">{vm.error}</SizableText>
                <Button bg={COLORS.royalBlue} mt="$4" onPress={vm.loadProfile}>
                    <SizableText color="white" fow="800">Retry</SizableText>
                </Button>
            </YStack>
        );
    }

    if (!vm.user) {
        return (
            <YStack f={1} jc="center" ai="center" bg={COLORS.cream} p="$5">
                <SizableText color={COLORS.textMid} mb="$4">No profile data</SizableText>
                <Button bg={COLORS.royalBlue} onPress={vm.handleLogout}>
                    <SizableText color="white" fow="800">Login</SizableText>
                </Button>
            </YStack>
        );
    }

    return (
        <YStack f={1} bg={COLORS.cream}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

            {/* Background Orbs */}
            <ZStack pos="absolute" fullscreen pointerEvents="none">
                <Circle pos="absolute" t={-vm.height * 0.1} r={-vm.width * 0.15} size={vm.width * 0.95} bg={COLORS.sandLight} opacity={0.55} />
                <Circle pos="absolute" b={-vm.height * 0.06} l={-vm.width * 0.2} size={vm.width * 0.8} bg={COLORS.sandMid} opacity={0.22} />
                {orbs.map((orb, i) => <SoftOrb key={i} {...orb} />)}
            </ZStack>

            <ScrollView
                f={1}
                contentContainerStyle={{
                    paddingHorizontal: 20,
                    paddingBottom: 120,
                    paddingTop: Platform.OS === "android" ? 48 : 54,
                }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={vm.refreshing} onRefresh={vm.onRefresh} tintColor={COLORS.royalBlue} />
                }
            >
                {/* Identity Header */}
                <XStack ai="center" jc="space-between" mb="$5" pt="$2">
                    <XStack ai="center" gap="$3">
                        <YStack w={56} h={56} br={28} jc="center" ai="center" bw={1.5} bc={COLORS.sandMid} ov="hidden">
                            {vm.user.profile_pic ? (
                                <RNImage
                                    key={vm.user.profile_pic}
                                    source={getProfileSource(vm.user.profile_pic)}
                                    style={{ width: 56, height: 56, borderRadius: 28 }}
                                    resizeMode="cover"
                                />
                            ) : (
                                <YStack f={1} w="100%" bg={COLORS.royalBlue} jc="center" ai="center">
                                    <SizableText size="$5" fow="900" color="white">
                                        {vm.user.username?.[0]?.toUpperCase() ?? "U"}
                                    </SizableText>
                                </YStack>
                            )}
                        </YStack>
                        
                        <YStack>
                            <SizableText size="$3" color={COLORS.textMid} fow="600">
                                Good Afternoon,
                            </SizableText>
                            <SizableText size="$7" fow="900" color={COLORS.textDark} ls={-0.5} mt={-4}>
                                {vm.user.username || "Speaker"}!
                            </SizableText>
                        </YStack>
                    </XStack>

                    <Button
                        size={48}
                        br={24}
                        bg="white"
                        bw={1}
                        bc={COLORS.sandMid}
                        pressStyle={{ scale: 0.95, bg: COLORS.cream }}
                        icon={<Bell size={20} color={COLORS.textMid} />}
                    />
                </XStack>

                {/* Speech Progress Arc */}
                <SpeechProgressCard
                    sessions={vm.analytics.todaySessions}
                    hoursToday={vm.analytics.todayHours}
                    clarityPct={vm.analytics.todayClarityPct}
                    progressPct={vm.analytics.todayProgressPct}
                    onContinue={() => navigation.navigate("Home")}
                />

                {/* Analytics Stats */}
                <SectionLabel text="Analytics" />
                <XStack gap="$3" mb="$3">
                    <StatCard
                        icon={<TrendingUp size={14} color={COLORS.teal} />}
                        value={`${vm.analytics.clarityScore}%`}
                        label="Clarity Score"
                        delta="↑ +6% this week"
                        accentColor={COLORS.teal}
                        iconBg={`${COLORS.teal}14`}
                    />
                    <StatCard
                        icon={<BarChart2 size={14} color={COLORS.blue} />}
                        value={`${vm.analytics.totalSessions}`}
                        label="Total Sessions"
                        delta="↑ +12 this week"
                        accentColor={COLORS.blue}
                        iconBg={`${COLORS.blue}14`}
                    />
                </XStack>
                <XStack gap="$3" mb="$4">
                    <StatCard
                        icon={<Zap size={14} color={COLORS.amber} />}
                        value={`${vm.analytics.avgResponseSec}s`}
                        label="Avg. Response"
                        delta="↓ −0.4s improved"
                        accentColor={COLORS.amber}
                        iconBg={`${COLORS.amber}14`}
                    />
                    <StatCard
                        icon={<Flame size={14} color={COLORS.royalBlue} />}
                        value={`${vm.analytics.streakDays}`}
                        label="Day Streak"
                        delta="Personal best!"
                        accentColor={COLORS.royalBlue}
                        iconBg={`${COLORS.royalBlue}10`}
                    />
                </XStack>

                {/* Personal Info */}
                <Accordion
                    icon={<User size={16} color={COLORS.royalBlue} />}
                    title="Personal Information"
                    accentColor={COLORS.royalBlue}
                >
                    <SubHeading text="Contact Details" />
                    <Bullet text={vm.user.email} />
                    <Bullet
                        text={vm.user.birthdate ? `Born: ${new Date(vm.user.birthdate).toLocaleDateString()}` : "Birthdate not set"}
                    />
                    <Bullet
                        text={vm.user.gender ? `Gender: ${vm.user.gender.charAt(0).toUpperCase() + vm.user.gender.slice(1)}` : "Gender not set"}
                    />
                    <InfoBox text="Your personal information is securely stored and never shared without consent." />
                </Accordion>

                {/* App Settings & Preferences */}
                <Accordion
                    icon={<Settings size={16} color={COLORS.royalBlue} />}
                    title="Settings & Preferences"
                    accentColor={COLORS.royalBlue}
                    defaultOpen
                >
                    <SubHeading text="Preferences" />
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

                    <SubHeading text="Audio Engine" />
                    <SliderSetting icon={<Volume2 size={18} color={COLORS.teal} />} title="Output Volume" value={vm.voiceVolume} onValueChange={vm.setVoiceVolume} />
                    <Separator bc="rgba(221, 214, 200, 0.4)" />
                    <SliderSetting icon={<Mic size={18} color={COLORS.teal} />} title="Mic Recording" value={vm.micSensitivity} onValueChange={vm.setMicSensitivity} />
                </Accordion>

                {/* Account Security */}
                <Accordion
                    icon={<Shield size={16} color={COLORS.teal} />}
                    title="Account Security"
                    accentColor={COLORS.teal}
                >
                    <SubHeading text="Access Levels" />
                    <Bullet text={`Role: ${vm.user.role || "Standard User"}`} color={COLORS.teal} />
                    <Bullet
                        text={`Account Status: ${vm.user.status === "active" ? "Active" : "Pending/Inactive"}`}
                        color={COLORS.teal}
                    />
                    <InfoBox text="Keep your account secure by reviewing your security settings regularly." type="warning" />
                    
                    <SubHeading text="Privacy" />
                    <SettingRow 
                        icon={<Trash2 size={18} color="#DC2626" />} 
                        title="Clear Local Cache" 
                        description="Remove all local message data"
                        onPress={vm.handleClearHistory}
                    >
                        <ChevronRight size={18} color={COLORS.sandMid} />
                    </SettingRow>
                </Accordion>

                {/* Actions */}
                <YStack gap="$3" mt="$4">
                    <Button
                        size="$5"
                        bg={COLORS.royalBlue}
                        br={18}
                        onPress={vm.handleEditProfile}
                        pressStyle={{ scale: 0.98 }}
                        icon={<Edit3 size={16} color="white" />}
                        iconAfter={<ChevronRight size={18} color="rgba(255,255,255,0.6)" />}
                        elevation={6}
                        shadowColor={COLORS.royalBlue}
                    >
                        <SizableText color="white" fow="800" size="$4" ml="$2">Edit Profile</SizableText>
                    </Button>

                    <Button
                        size="$5"
                        bg="white"
                        br={18}
                        onPress={vm.handleLogout}
                        pressStyle={{ scale: 0.98 }}
                        icon={<LogOut size={16} color="#DC2626" />}
                        iconAfter={<ChevronRight size={18} color="rgba(220,38,38,0.4)" />}
                        bw={1}
                        bc="rgba(220,38,38,0.18)"
                        elevation={5}
                        shadowColor="#8A96A4"
                    >
                        <SizableText color="#DC2626" fow="800" size="$4" ml="$2">Logout</SizableText>
                    </Button>
                </YStack>

                {/* Footer Info */}
                <YStack ai="center" gap="$1" mt="$8" opacity={0.4}>
                    <SizableText size="$1" color={COLORS.textMid} fow="800" ls={1}>ARTICULINK v1.0.4 PRO</SizableText>
                    <SizableText size="$1" color={COLORS.textMid} fow="600">Built for Articulation Support</SizableText>
                </YStack>
            </ScrollView>
        </YStack>
    );
};

