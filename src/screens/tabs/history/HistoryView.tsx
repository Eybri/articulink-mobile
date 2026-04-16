import React from 'react';
import {
    StatusBar,
    Animated,
    FlatList,
    RefreshControl,
    TouchableOpacity,
} from 'react-native';
import {
    YStack,
    XStack,
    ZStack,
    Button,
    Circle,
    H1,
    SizableText,
    Card,
    Input,
    ScrollView,
} from "tamagui";
import {
    History,
    Search,
    ChevronRight,
    Mic,
    Clock,
    Trash2,
    CheckCircle,
    Play,
    Pause,
    TrendingUp,
    BarChart2,
    Activity,
} from "@tamagui/lucide-icons";
import { COLORS } from "./../../../constants/colors";
import { HistoryItem } from "./useHistoryViewModel";

interface HistoryViewProps {
    vm: any;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ vm }) => {
    const renderItem = ({ item }: { item: HistoryItem }) => (
        <Card
            bg={vm.playingId === item.id ? `${COLORS.royalBlue}05` : "white"}
            br={20}
            p="$3.5"
            mb="$3"
            bw={1.5}
            bc={vm.playingId === item.id ? COLORS.royalBlue : COLORS.sandMid}
            elevation={vm.playingId === item.id ? 5 : 2}
            shadowColor={COLORS.deepNavy}
            shadowOpacity={0.06}
            pressStyle={{ scale: 0.98, bg: COLORS.warmWhite }}
        >
            <XStack jc="space-between" ai="flex-start" mb="$2">
                <XStack ai="center" gap="$2" f={1}>
                    <YStack w={28} h={28} br={8} bg={`${COLORS.teal}0C`} jc="center" ai="center">
                        <Mic size={12} color={COLORS.teal} />
                    </YStack>
                    <SizableText size="$1" fow="800" color={COLORS.textMid} textTransform="uppercase" ls={1} f={1} numberOfLines={1}>
                        {item.speech_type === 'unknown' ? 'Speech Record' : (item.speech_type || 'Saved Recording')}
                    </SizableText>
                </XStack>
                <XStack ai="center" gap="$2.5">
                    <SizableText size="$1" fow="600" color={`${COLORS.textMid}80`}>
                        {vm.formatTimestamp(item.created_at)}
                    </SizableText>
                    <TouchableOpacity onPress={() => vm.handleDelete(item)}>
                        <Trash2 size={12} color="#EF4444" opacity={0.6} />
                    </TouchableOpacity>
                </XStack>
            </XStack>

            <YStack gap="$1.5" mb="$2.5">
                <XStack gap="$2" ai="flex-start">
                    <Circle size={4} mt={8} bg={COLORS.sandMid} />
                    <SizableText f={1} size="$2" color={COLORS.textMid} fow="500" fontStyle="italic">
                        "{item.transcript}"
                    </SizableText>
                </XStack>
                <XStack gap="$2" ai="flex-start">
                    <Circle size={4} mt={8} bg={COLORS.royalBlue} />
                    <SizableText f={1} size="$3" color={COLORS.textDark} fow="700">
                        {item.corrected_transcript}
                    </SizableText>
                </XStack>
            </YStack>

            <XStack jc="space-between" ai="center" pt="$2.5" borderTopWidth={1} borderTopColor={COLORS.sandLight} mt="$1">
                <XStack gap="$3" ai="center" f={1} fw="wrap">
                    {item.audio_url && (
                        <TouchableOpacity
                            onPress={() => vm.playAudio(item.audio_url, item.id)}
                            style={{ 
                                flexDirection: 'row', 
                                alignItems: 'center', 
                                gap: 6,
                                backgroundColor: vm.playingId === item.id ? COLORS.royalBlue : `${COLORS.royalBlue}10`,
                                paddingHorizontal: 10,
                                paddingVertical: 4,
                                borderRadius: 12,
                            }}
                        >
                            {vm.playingId === item.id ? (
                                <Pause size={12} color="white" fill="white" />
                            ) : (
                                <Play size={12} color={COLORS.royalBlue} fill={COLORS.royalBlue} />
                            )}
                            <SizableText size="$1" fow="800" color={vm.playingId === item.id ? "white" : COLORS.royalBlue} textTransform="uppercase" ls={0.5}>
                                {vm.playingId === item.id ? 'Playing' : 'Play Clip'}
                            </SizableText>
                        </TouchableOpacity>
                    )}
                    <XStack ai="center" gap="$1.5">
                        <CheckCircle size={10} color={COLORS.teal} />
                        <SizableText size="$1" fow="800" color={COLORS.teal}>{Math.round((item.confidence_score || 0.95) * 100)}% Match</SizableText>
                    </XStack>
                    <XStack ai="center" gap="$1.5">
                        <Clock size={10} color={COLORS.textMid} />
                        <SizableText size="$1" fow="700" color={COLORS.textMid}>{item.duration_seconds?.toFixed(1) || '0.0'}s</SizableText>
                    </XStack>
                </XStack>
                <ChevronRight size={16} color={COLORS.sandMid} />
            </XStack>
        </Card>
    );

    return (
        <YStack f={1} bg={COLORS.cream}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

            {/* Background blobs */}
            <ZStack pos="absolute" fullscreen pointerEvents="none">
                <Circle pos="absolute" t={-vm.height * 0.15} r={-vm.width * 0.2} size={vm.width * 0.8} bg={COLORS.orbBlue} opacity={0.3} />
                <Circle pos="absolute" b={-vm.height * 0.1} l={-vm.width * 0.2} size={vm.width * 0.7} bg={COLORS.orbTeal} opacity={0.2} />
            </ZStack>

            {/* Content Area */}
            <Animated.View style={{ flex: 1, opacity: vm.animations.fadeAnim, transform: [{ translateY: vm.animations.slideAnim }] }}>
                <FlatList
                    data={vm.filteredHistory}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentInsetAdjustmentBehavior="automatic"
                    contentContainerStyle={{ padding: 20, paddingTop: 10, paddingBottom: 150 }}
                    ListHeaderComponent={
                        <YStack gap="$4" mb="$5">
                            <XStack 
                                bg={COLORS.white} 
                                br={14} 
                                bw={1} 
                                bc={vm.isSearchFocused ? COLORS.royalBlue : COLORS.sandMid} 
                                px="$3.5" 
                                ai="center" 
                                h={42} 
                                elevation={2}
                                shadowColor={COLORS.deepNavy}
                            >
                                <Search size={16} color={vm.isSearchFocused ? COLORS.royalBlue : COLORS.textMid} o={vm.isSearchFocused ? 1 : 0.6} />
                                <Input
                                    flex={1}
                                    bg="transparent"
                                    bw={0}
                                    size="$3"
                                    placeholder="Search recordings..."
                                    placeholderTextColor={COLORS.textMid}
                                    value={vm.searchQuery}
                                    onChangeText={vm.setSearchQuery}
                                    fontWeight="600"
                                    color={COLORS.textDark}
                                    onFocus={() => vm.setIsSearchFocused(true)}
                                    onBlur={() => vm.setIsSearchFocused(false)}
                                />
                            </XStack>

                            <ScrollView 
                                horizontal 
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{ gap: 12, paddingRight: 20 }}
                            >
                                <StatCard 
                                    icon={<TrendingUp size={12} color={COLORS.teal} />} 
                                    label="Accuracy" 
                                    value={`${Math.round(vm.stats.avgConfidence)}%`} 
                                    bg={`${COLORS.teal}10`}
                                />
                                <StatCard 
                                    icon={<Activity size={12} color={COLORS.royalBlue} />} 
                                    label="Time" 
                                    value={`${vm.stats.totalDuration.toFixed(1)}s`} 
                                    bg={`${COLORS.royalBlue}10`}
                                />
                                <StatCard 
                                    icon={<BarChart2 size={12} color="#F59E0B" />} 
                                    label="Words" 
                                    value={vm.stats.totalWords.toString()} 
                                    bg="#F59E0B15"
                                />
                                <StatCard 
                                    icon={<History size={12} color={COLORS.deepNavy} />} 
                                    label="Total" 
                                    value={vm.stats.totalRecordings.toString()} 
                                    bg={`${COLORS.deepNavy}10`}
                                />
                            </ScrollView>
                        </YStack>
                    }
                    refreshControl={
                        <RefreshControl
                            refreshing={vm.refreshing}
                            onRefresh={() => vm.loadHistory(true)}
                            tintColor={COLORS.royalBlue}
                        />
                    }
                    ListEmptyComponent={
                        <YStack ai="center" jc="center" mt="$10" opacity={0.5}>
                            <History size={48} color={COLORS.sandMid} mb="$4" />
                            <SizableText size="$5" fow="700" color={COLORS.textMid}>
                                {vm.loading ? 'Fetching history...' : (vm.searchQuery ? 'No recordings found' : 'No history yet')}
                            </SizableText>
                        </YStack>
                    }
                />
            </Animated.View>
        </YStack>
    );
};

const StatCard = ({ icon, label, value, bg }: { icon: any, label: string, value: string, bg: string }) => (
    <XStack p="$2" px="$3" br={12} bg="white" bw={1} bc={COLORS.sandMid} ai="center" gap="$2.5" elevation={1}>
        <Circle size={24} bg={bg}>
            {icon}
        </Circle>
        <YStack>
            <SizableText size="$1" fow="700" color={COLORS.textMid} opacity={0.6} ls={0.3}>
                {label}
            </SizableText>
            <SizableText size="$2" fow="900" color={COLORS.textDark}>
                {value}
            </SizableText>
        </YStack>
    </XStack>
);
