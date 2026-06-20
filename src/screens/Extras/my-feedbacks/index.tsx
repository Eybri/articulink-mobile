import React from 'react';
import { ScrollView, Animated, StatusBar, Platform, Image, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { YStack, XStack, SizableText, Button, Spinner } from "tamagui";
import { ChevronLeft, Star, MessageSquareQuote, BadgeCheck, Clock, X } from "@tamagui/lucide-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { useMyFeedbacksViewModel, FeedbackItem } from "./useMyFeedbacksViewModel";
import { COLORS } from "../../../constants/colors";
import { SkeletonFeedbackCard } from "../../../components/Loader";

const MyFeedbacksScreen = ({ navigation }: any) => {
    const vm = useMyFeedbacksViewModel(navigation);
    const [viewImage, setViewImage] = React.useState<string | null>(null);

    return (
        <YStack f={1} bg="#FFFFFF">
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

            {/* Top Background Gradient */}
            <LinearGradient
                colors={['rgba(42, 95, 168, 0.8)', 'rgba(42, 95, 168, 0.1)']}
                style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '40%' }}
            />

            {/* Custom Header */}
            <XStack ai="center" jc="space-between" pt={Platform.OS === 'ios' ? 55 : 45} pb={20} px={20} zIndex={10}>
                <Button
                    size="$3"
                    circular
                    icon={<ChevronLeft size={24} color={COLORS.textDark} />}
                    bg={COLORS.white}
                    elevation={2}
                    shadowColor="#000"
                    shadowOpacity={0.1}
                    shadowRadius={5}
                    shadowOffset={{ width: 0, height: 2 }}
                    onPress={() => navigation.goBack()}
                />
                <SizableText fow="700" size="$5" color="white" textShadowColor="rgba(0,0,0,0.1)" textShadowRadius={4} textShadowOffset={{ width: 0, height: 1 }}>
                    My Feedbacks
                </SizableText>
                <YStack w={40} />
            </XStack>

            <Animated.View style={{ flex: 1, opacity: vm.animations.fadeAnim, transform: [{ translateY: vm.animations.slideAnim }] }}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}>

                    {/* Appreciation Banner inside the gradient */}
                    <YStack px={24} pt={10} pb={30}>
                        <XStack ai="center" gap={16}>
                            <Image
                                source={require('../../../../assets/images/icon-white.png')}
                                style={{ width: 48, height: 48, resizeMode: 'contain' }}
                            />
                            <YStack f={1}>
                                <SizableText size="$5" color="white" fow="800" textShadowColor="rgba(0,0,0,0.1)" textShadowRadius={4} textShadowOffset={{ width: 0, height: 1 }}>
                                    Thank You!
                                </SizableText>
                                <SizableText size="$3" color="white" fow="500" opacity={0.9} mt={2}>
                                    Your continuous feedback helps us shape the future of Articulink.
                                </SizableText>
                            </YStack>
                        </XStack>
                    </YStack>

                    {/* Main White Sheet Overlapping the Image */}
                    <YStack bg="white" borderTopLeftRadius={32} borderTopRightRadius={32} pt={30} px={24} pb={100} f={1} elevation={10} shadowColor="#000" shadowOpacity={0.05} shadowRadius={20} shadowOffset={{ width: 0, height: -5 }}>

                        {vm.loading ? (
                            <YStack mt={10}>
                                {[1, 2, 3].map((key) => (
                                    <SkeletonFeedbackCard key={key} />
                                ))}
                            </YStack>
                        ) : vm.feedbacks.length === 0 ? (
                            <YStack ai="center" jc="center" mt={40} bg="#F8FAFC" p={40} br={24} elevation={2} shadowColor="#000" shadowOpacity={0.05} shadowRadius={10} shadowOffset={{ width: 0, height: 4 }} bw={1} bc="#E2E8F0">
                                <MessageSquareQuote size={64} color="#94A3B8" />
                                <SizableText size="$4" color={COLORS.textMid} ta="center" mt={16} fow="500">
                                    You haven't submitted any feedback yet.
                                </SizableText>
                                <Button
                                    mt={24}
                                    bg={COLORS.royalBlue}
                                    br={12}
                                    onPress={() => navigation.navigate("AppReview")}
                                    pressStyle={{ scale: 0.97 }}
                                >
                                    <SizableText color="white" fow="600">Write a Review</SizableText>
                                </Button>
                            </YStack>
                        ) : (
                            vm.feedbacks.map((item: FeedbackItem) => (
                                <FeedbackCard key={item.id} item={item} onImagePress={setViewImage} />
                            ))
                        )}
                    </YStack>

                </ScrollView>
            </Animated.View>

            {/* Fullscreen Image Viewer Modal */}
            <Modal visible={!!viewImage} transparent={true} animationType="fade" onRequestClose={() => setViewImage(null)}>
                <YStack f={1} bg="rgba(0,0,0,0.9)" ai="center" jc="center" position="relative">
                    <Button 
                        position="absolute" 
                        top={Platform.OS === 'ios' ? 60 : 40} 
                        right={20} 
                        circular 
                        icon={<X size={24} color="white" />} 
                        bg="rgba(255,255,255,0.2)" 
                        onPress={() => setViewImage(null)}
                        zIndex={100}
                    />
                    {viewImage && (
                        <Image source={{ uri: viewImage }} style={{ width: '100%', height: '100%', resizeMode: 'contain' }} />
                    )}
                </YStack>
            </Modal>
        </YStack>
    );
};

const FeedbackCard = React.memo(({ item, onImagePress }: { item: FeedbackItem, onImagePress: (uri: string) => void }) => {
    return (
        <YStack bg="white" br={16} p={20} mb={20} elevation={2} shadowColor="#000" shadowOpacity={0.06} shadowRadius={12} shadowOffset={{ width: 0, height: 4 }} bw={1} bc="#E2E8F0">
            <XStack jc="space-between" ai="center" mb={12}>
                <XStack gap={4}>
                    {[1, 2, 3, 4, 5].map((starIndex) => {
                        let fillWidth: any = "0%";
                        if (item.rating >= starIndex) fillWidth = "100%";
                        else if (item.rating + 0.5 === starIndex) fillWidth = "50%";

                        return (
                            <YStack key={starIndex} width={16} height={16} position="relative">
                                <YStack position="absolute" top={0} left={0}>
                                    <Star size={16} color="#E2E8F0" />
                                </YStack>
                                <YStack position="absolute" top={0} left={0} width={fillWidth} overflow="hidden">
                                    <Star size={16} color={COLORS.royalBlue} fill={COLORS.royalBlue} />
                                </YStack>
                            </YStack>
                        );
                    })}
                </XStack>
                <XStack ai="center" gap={6}>
                    <Clock size={12} color="#94A3B8" />
                    <SizableText size="$2" color="#94A3B8" fow="500">
                        {item.createdAt}
                    </SizableText>
                </XStack>
            </XStack>

            <SizableText size="$3" color={COLORS.textMid} fow="400" lh={22} mb={16}>
                {item.feedbackText}
            </SizableText>

            {item.categories && item.categories.length > 0 && (
                <XStack gap={8} flexWrap="wrap" mb={item.attachedImages?.length || item.adminReply ? 16 : 0}>
                    {item.categories.map((cat, idx) => (
                        <YStack key={idx} bg={`${COLORS.royalBlue}10`} px={12} py={4} br={12} bw={1} bc={`${COLORS.royalBlue}20`}>
                            <SizableText size="$2" color={COLORS.royalBlue} fow="600">
                                {cat}
                            </SizableText>
                        </YStack>
                    ))}
                </XStack>
            )}

            {item.attachedImages && item.attachedImages.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: item.adminReply ? 20 : 0 }}>
                    <XStack gap={12} pr={16}>
                        {item.attachedImages.map((uri, index) => (
                            <TouchableOpacity key={index} onPress={() => onImagePress(uri)} activeOpacity={0.8}>
                                <Image source={{ uri }} style={{ width: 80, height: 80, borderRadius: 8 }} />
                            </TouchableOpacity>
                        ))}
                    </XStack>
                </ScrollView>
            )}

            {item.adminReply && (
                <YStack bg="#F8FAFC" p={16} br={12} bw={1} bc="#E2E8F0" position="relative" overflow="hidden">
                    <YStack position="absolute" top={0} left={0} bottom={0} width={4} bg={COLORS.royalBlue} />
                    <XStack ai="center" gap={8} mb={8}>
                        <BadgeCheck size={16} color={COLORS.royalBlue} />
                        <SizableText size="$2" fow="700" color={COLORS.textDark} textTransform="uppercase" ls={1}>
                            Admin Reply
                        </SizableText>
                    </XStack>
                    <SizableText size="$3" color={COLORS.textMid} fow="400" lh={22}>
                        {item.adminReply}
                    </SizableText>
                </YStack>
            )}
        </YStack>
    );
});

export default MyFeedbacksScreen;
