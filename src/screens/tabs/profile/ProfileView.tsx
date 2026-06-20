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
  Card,
  Separator,
} from "tamagui";
import { LinearGradient } from 'expo-linear-gradient';
import {
  User,
  Shield,
  LogOut,
  ChevronRight,
  TrendingUp,
  Zap,
  Flame,
  BarChart2,
  Bell,
  Volume2,
  Mic,
  Trash2,
  Lock,
  Globe,
  FileText,
} from "@tamagui/lucide-icons";
import { COLORS } from "./../../../constants/colors";
import { 
  SoftOrb, 
  SpeechProgressCard, 
  StatCard, 
  SectionLabel,
  getGreeting,
  WordChip,
  LanguagePill,
  SkeletonCard,
  LanguageStatsCard
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
        <YStack f={1} bg="#F8FAFC">
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

            {/* Top Background Gradient */}
            <LinearGradient
                colors={['rgba(42, 95, 168, 0.8)', 'rgba(42, 95, 168, 0.1)']}
                style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '40%' }}
            />

            <ScrollView
                f={1}
                contentContainerStyle={{
                    paddingBottom: 140,
                    paddingTop: Platform.OS === "android" ? 48 : 54,
                }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={vm.refreshing} onRefresh={vm.onRefresh} tintColor="white" />
                }
            >
                {/* Identity Header */}
                <XStack ai="center" mb="$4" pt="$2" px="$5" w="100%">
                    <YStack w={56} h={56} br={28} jc="center" ai="center" bw={1.5} bc="rgba(255,255,255,0.4)" ov="hidden" elevation={4} shadowColor="#000" shadowOpacity={0.15}>
                        {vm.user.profile_pic ? (
                            <RNImage
                                source={getProfileSource(vm.user.profile_pic)}
                                style={{ width: 56, height: 56, borderRadius: 28 }}
                                resizeMode="cover"
                            />
                        ) : (
                            <YStack f={1} w="100%" bg="white" jc="center" ai="center">
                                <SizableText size="$5" fow="900" color={COLORS.royalBlue}>
                                    {vm.user.username?.[0]?.toUpperCase() ?? "U"}
                                </SizableText>
                            </YStack>
                        )}
                    </YStack>
                    
                    <YStack f={1} ml="$3" mr="$3">
                        <SizableText size="$3" color="rgba(255,255,255,0.8)" fow="600">
                            {getGreeting()},
                        </SizableText>
                        <SizableText size="$6" fow="900" color="white" ls={-0.5} mt={-4} numberOfLines={1}>
                            {vm.user.first_name && vm.user.last_name ? `${vm.user.first_name} ${vm.user.last_name}` : (vm.user.username || "Speaker")}!
                        </SizableText>
                    </YStack>

                    <Button
                        size={48}
                        br={24}
                        bg="rgba(255,255,255,0.15)"
                        bw={1}
                        bc="rgba(255,255,255,0.3)"
                        pressStyle={{ scale: 0.95, bg: "rgba(255,255,255,0.25)" }}
                        icon={<Bell size={22} color="white" />}
                    />
                </XStack>

                <YStack bg="#F8FAFC" borderTopLeftRadius={32} borderTopRightRadius={32} pt={20} pb={40} f={1} elevation={10} shadowColor="#000" shadowOpacity={0.05} shadowRadius={20} shadowOffset={{ width: 0, height: -5 }}>
                    {/* Speech Progress Arc */}
                    <YStack px="$5" mt={-40}>
                        <SpeechProgressCard
                            sessions={vm.analytics.todaySessions}
                            hoursToday={vm.analytics.todayHours}
                            clarityPct={vm.analytics.todayClarityPct}
                            progressPct={vm.analytics.todayProgressPct}
                            onContinue={() => navigation.navigate("Home")}
                        />
                    </YStack>

                {/* Analytics Stats */}
                <YStack px="$5" mt="$4">
                    <SectionLabel text="Your Analytics" />
                    <XStack gap="$3" mb="$3">
                        <StatCard
                            icon={<TrendingUp size={14} color={COLORS.teal} />}
                            value={`${vm.analytics.clarityScore}%`}
                            label="Clarity Score"
                            delta="Average speech confidence"
                            accentColor={COLORS.teal}
                            iconBg={`${COLORS.teal}14`}
                            loading={vm.statsLoading}
                        />
                        <StatCard
                            icon={<BarChart2 size={14} color={COLORS.blue} />}
                            value={`${vm.analytics.totalSessions}`}
                            label="Total Sessions"
                            delta="Overall speech recordings"
                            accentColor={COLORS.blue}
                            iconBg={`${COLORS.blue}14`}
                            loading={vm.statsLoading}
                        />
                    </XStack>
                    <XStack gap="$3" mb="$4">
                        <StatCard
                            icon={<Zap size={14} color={COLORS.amber} />}
                            value={`${vm.analytics.avgResponseSec}s`}
                            label="Avg. Response"
                            delta="Average recording length"
                            accentColor={COLORS.amber}
                            iconBg={`${COLORS.amber}14`}
                            loading={vm.statsLoading}
                        />
                        <StatCard
                            icon={<Flame size={14} color={COLORS.royalBlue} />}
                            value={`${vm.analytics.streakDays}`}
                            label="Day Streak"
                            delta="Consecutive active days"
                            accentColor={COLORS.royalBlue}
                            iconBg={`${COLORS.royalBlue}10`}
                            loading={vm.statsLoading}
                        />
                    </XStack>
                </YStack>

                {/* ── Speech Insights (Top Words, Recent Phrases, Languages) ── */}
                <YStack px="$5" mt="$4" gap="$3">
                    <SectionLabel text="Speech Insights" />
                    
                    {vm.statsLoading ? (
                        <YStack gap="$3">
                            <SkeletonCard />
                            <SkeletonCard />
                        </YStack>
                    ) : vm.stats ? (
                        <>
                            {/* Top Words */}
                            {vm.stats.most_used_words?.length > 0 && (
                                <Card bg="white" br={16} elevation={2} bw={1} bc={COLORS.sandMid} p="$4">
                                    <XStack ai="center" gap="$2" mb="$3">
                                        <YStack w={28} h={28} br={10} bg={`${COLORS.teal}10`} jc="center" ai="center">
                                            <TrendingUp size={14} color={COLORS.teal} />
                                        </YStack>
                                        <SizableText fow="800" size="$3" color={COLORS.textDark}>Your Top Words</SizableText>
                                        <YStack f={1} h={1} bg={COLORS.sandMid} opacity={0.2} ml="$2" />
                                    </XStack>
                                    <XStack flexWrap="wrap" gap="$2">
                                        {vm.stats.most_used_words.map((item: any, i: number) => (
                                            <WordChip key={i} word={item.word} count={item.count} index={i} />
                                        ))}
                                    </XStack>
                                </Card>
                            )}

                            {/* Most Accurate Words */}
                            {vm.stats.most_accurate_words?.length > 0 && (
                                <Card bg="white" br={24} elevation={2} bw={1} bc={COLORS.sandMid} p="$4">
                                    <XStack ai="center" gap="$2" mb="$3">
                                        <YStack w={28} h={28} br={10} bg={`${COLORS.teal}10`} jc="center" ai="center">
                                            <TrendingUp size={14} color={COLORS.teal} />
                                        </YStack>
                                        <SizableText fow="800" size="$3" color={COLORS.textDark}>Most Accurate</SizableText>
                                        <YStack f={1} h={1} bg={COLORS.sandMid} opacity={0.2} ml="$2" />
                                    </XStack>
                                    <XStack flexWrap="wrap" gap="$2">
                                        {vm.stats.most_accurate_words.map((item: any, i: number) => (
                                            <WordChip key={i} word={item.word} badgeText={`${Math.round(item.avg_accuracy)}%`} index={i} />
                                        ))}
                                    </XStack>
                                </Card>
                            )}

                            {/* Lowest Accuracy Words */}
                            {vm.stats.lowest_accuracy_words?.length > 0 && (
                                <Card bg="white" br={24} elevation={2} bw={1} bc={COLORS.sandMid} p="$4">
                                    <XStack ai="center" gap="$2" mb="$3">
                                        <YStack w={28} h={28} br={10} bg="#FEF2F2" jc="center" ai="center">
                                            <TrendingUp size={14} color="#DC2626" />
                                        </YStack>
                                        <SizableText fow="800" size="$3" color={COLORS.textDark}>Words to Improve</SizableText>
                                        <YStack f={1} h={1} bg={COLORS.sandMid} opacity={0.2} ml="$2" />
                                    </XStack>
                                    <XStack flexWrap="wrap" gap="$2">
                                        {vm.stats.lowest_accuracy_words.map((item: any, i: number) => (
                                            <WordChip key={i} word={item.word} badgeText={`${Math.round(item.avg_accuracy)}%`} index={i + 4} />
                                        ))}
                                    </XStack>
                                </Card>
                            )}

                            {/* Recent Phrases */}
                            {vm.stats.recent_phrases?.length > 0 && (
                                <Card bg="white" br={16} elevation={2} bw={1} bc={COLORS.sandMid} p="$4">
                                    <XStack ai="center" gap="$2" mb="$3">
                                        <YStack w={28} h={28} br={10} bg={`${COLORS.royalBlue}08`} jc="center" ai="center">
                                            <FileText size={14} color={COLORS.royalBlue} />
                                        </YStack>
                                        <SizableText fow="800" size="$3" color={COLORS.textDark}>Recent Phrases</SizableText>
                                        <YStack f={1} h={1} bg={COLORS.sandMid} opacity={0.2} ml="$2" />
                                    </XStack>
                                    <YStack gap="$2">
                                        {vm.stats.recent_phrases.map((phrase: string, i: number) => (
                                            <XStack key={i} ai="flex-start" gap="$2" py="$1.5" bbc={i < vm.stats.recent_phrases.length - 1 ? `${COLORS.sandMid}30` : "transparent"} bbw={i < vm.stats.recent_phrases.length - 1 ? 1 : 0}>
                                                <SizableText size="$1" fow="700" color={COLORS.teal} mt={2} opacity={0.5}>{String(i + 1).padStart(2, '0')}</SizableText>
                                                <SizableText size="$2" color={COLORS.textMid} fow="500" f={1} lh={20}>"{phrase}"</SizableText>
                                            </XStack>
                                        ))}
                                    </YStack>
                                </Card>
                            )}

                            {/* Languages Used & Accuracy */}
                            {vm.stats.language_breakdown && Object.keys(vm.stats.language_breakdown).length > 0 && (
                                <LanguageStatsCard 
                                    breakdown={vm.stats.language_breakdown} 
                                    totalRecordings={vm.stats.total_recordings} 
                                />
                            )}
                        </>
                    ) : null}
                </YStack>
 
                {/* Info Footer */}
                <YStack ai="center" gap="$1" mt="$8" opacity={0.4}>
                    <SizableText size="$1" color={COLORS.textMid} fow="800" ls={1}>ARTICULINK v1.0.4 PRO</SizableText>
                    <SizableText size="$1" color={COLORS.textMid} fow="600">Built for Articulation Support</SizableText>
                </YStack>
                </YStack>
            </ScrollView>
        </YStack>
    );
};

