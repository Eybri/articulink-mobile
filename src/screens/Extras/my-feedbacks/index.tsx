import React from 'react';
import { ScrollView, Animated, StatusBar, Platform, Image } from 'react-native';
import { YStack, XStack, SizableText, Button, Card, Spinner } from "tamagui";
import { ChevronLeft, Star, MessageSquareQuote, BadgeCheck, Clock } from "@tamagui/lucide-icons";
import { useMyFeedbacksViewModel, FeedbackItem } from "./useMyFeedbacksViewModel";
import { COLORS } from "../../../constants/colors";

const MyFeedbacksScreen = ({ navigation }: any) => {
    const vm = useMyFeedbacksViewModel(navigation);

    return (
        <YStack f={1} bg={COLORS.cream}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

            {/* Custom Header */}
            <XStack ai="center" jc="space-between" pt={Platform.OS === 'ios' ? 50 : 40} pb={15} px={20} bg={COLORS.cream} zIndex={10}>
                <Button 
                    size="$3" 
                    circular 
                    icon={<ChevronLeft size={24} color={COLORS.textDark} />} 
                    bg={COLORS.white} 
                    elevation={2}
                    onPress={() => navigation.goBack()}
                />
                <SizableText fow="800" size="$6" color={COLORS.textDark} ls={-0.5}>My Feedbacks</SizableText>
                <YStack w={40} />
            </XStack>

            <Animated.View style={{ flex: 1, opacity: vm.animations.fadeAnim, transform: [{ translateY: vm.animations.slideAnim }] }}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}>
                    
                    {vm.loading ? (
                        <YStack ai="center" jc="center" mt={100}>
                            <Spinner size="large" color={COLORS.royalBlue} />
                            <SizableText mt="$4" color={COLORS.textMid} fow="500">
                                Loading your feedbacks...
                            </SizableText>
                        </YStack>
                    ) : vm.feedbacks.length === 0 ? (
                        <YStack ai="center" jc="center" mt={100} gap="$4">
                            <MessageSquareQuote size={64} color={COLORS.sandMid} />
                            <SizableText size="$4" color={COLORS.textMid} ta="center">
                                You haven't submitted any feedback yet.
                            </SizableText>
                        </YStack>
                    ) : (
                        vm.feedbacks.map((item: FeedbackItem) => (
                            <FeedbackCard key={item.id} item={item} />
                        ))
                    )}

                </ScrollView>
            </Animated.View>
        </YStack>
    );
};

const FeedbackCard = React.memo(({ item }: { item: FeedbackItem }) => {
    return (
        <Card bg="white" br={20} p="$5" mb="$5" elevation={4} shadowColor="#8A96A4" shadowOpacity={0.08} bw={1} bc="rgba(221, 214, 200, 0.4)">
            <XStack jc="space-between" ai="flex-start" mb="$3">
                <XStack gap="$1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                            key={star}
                            size={16} 
                            color={star <= item.rating ? "#FFD700" : COLORS.sandMid} 
                            fill={star <= item.rating ? "#FFD700" : "transparent"} 
                        />
                    ))}
                </XStack>
                <SizableText size="$2" color={COLORS.textMid} fow="600">{item.dateSubmitted}</SizableText>
            </XStack>

            {item.categories.length > 0 && (
                <XStack flexWrap="wrap" gap="$2" mb="$3">
                    {item.categories.map(cat => (
                        <YStack key={cat} bg={COLORS.sandLight} px="$2" py="$1" br={8}>
                            <SizableText size="$1" color={COLORS.textDark} fow="600">{cat}</SizableText>
                        </YStack>
                    ))}
                </XStack>
            )}

            {!!item.feedbackText && (
                <SizableText size="$3" color={COLORS.textDark} lh={22} mb={(item.attachedImages && item.attachedImages.length > 0) ? "$3" : (item.adminReply ? "$4" : "$0")}>
                    "{item.feedbackText}"
                </SizableText>
            )}

            {item.attachedImages && item.attachedImages.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: item.adminReply ? 15 : 0 }}>
                    <XStack gap="$3" pr="$4">
                        {item.attachedImages.map((uri, index) => (
                            <Image key={index} source={{ uri }} style={{ width: 80, height: 100, borderRadius: 12 }} />
                        ))}
                    </XStack>
                </ScrollView>
            )}

            {item.adminReply ? (
                <YStack bg="rgba(26, 68, 128, 0.05)" br={12} p="$3" bw={1} bc="rgba(26, 68, 128, 0.1)">
                    <XStack ai="center" gap="$2" mb="$2">
                        <BadgeCheck size={16} color={COLORS.royalBlue} />
                        <SizableText size="$2" fow="800" color={COLORS.royalBlue} textTransform="uppercase" ls={1}>
                            Admin Reply
                        </SizableText>
                    </XStack>
                    <SizableText size="$3" color={COLORS.textDark} lh={20}>
                        {item.adminReply}
                    </SizableText>
                </YStack>
            ) : (
                <XStack ai="center" gap="$2" mt="$4" opacity={0.6}>
                    <Clock size={14} color={COLORS.textMid} />
                    <SizableText size="$2" color={COLORS.textMid} fow="500">
                        Pending admin review...
                    </SizableText>
                </XStack>
            )}
        </Card>
    );
});

export default MyFeedbacksScreen;
