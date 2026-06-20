import React from 'react';
import { ScrollView, Animated, StatusBar, Platform } from 'react-native';
import { YStack, XStack, SizableText, Button, TextArea, Card, Spinner } from "tamagui";
import { Star, ShieldAlert, ChevronLeft } from "@tamagui/lucide-icons";
import { useAppReviewViewModel, CATEGORIES } from "./useAppReviewViewModel";
import { COLORS } from "../../../constants/colors";

const AppReviewScreen = ({ navigation }: any) => {
    const vm = useAppReviewViewModel(navigation);

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
                <SizableText fow="800" size="$6" color={COLORS.textDark} ls={-0.5}>Feedback</SizableText>
                <YStack w={40} />
            </XStack>

            <Animated.View style={{ flex: 1, opacity: vm.animations.fadeAnim, transform: [{ translateY: vm.animations.slideAnim }] }}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}>
                    
                    <SizableText size="$8" fow="900" color={COLORS.royalBlue} mt="$4" mb="$2" ls={-1}>
                        How are we doing?
                    </SizableText>
                    <SizableText size="$4" color={COLORS.textMid} mb="$6" lh={22}>
                        Your feedback helps us improve Articulink and make language learning better.
                    </SizableText>

                    {/* Rating Section */}
                    <Card bg="white" br={20} p="$5" mb="$5" elevation={4} shadowColor="#8A96A4" shadowOpacity={0.08} bw={1} bc="rgba(221, 214, 200, 0.4)">
                        <SizableText size="$3" fow="700" color={COLORS.textDark} mb="$3" textTransform="uppercase" ls={1}>
                            Rate Your Experience
                        </SizableText>
                        <XStack jc="center" gap="$3" py="$2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Button
                                    key={star}
                                    chromeless
                                    p={0}
                                    m={0}
                                    onPress={() => vm.setRating(star)}
                                    pressStyle={{ scale: 0.8 }}
                                    icon={<Star size={40} color={star <= vm.rating ? "#FFD700" : COLORS.sandMid} fill={star <= vm.rating ? "#FFD700" : "transparent"} />}
                                />
                            ))}
                        </XStack>
                    </Card>

                    {/* Categories Section */}
                    <Card bg="white" br={20} p="$5" mb="$5" elevation={4} shadowColor="#8A96A4" shadowOpacity={0.08} bw={1} bc="rgba(221, 214, 200, 0.4)">
                        <SizableText size="$3" fow="700" color={COLORS.textDark} mb="$3" textTransform="uppercase" ls={1}>
                            What stood out? (Optional)
                        </SizableText>
                        <XStack flexWrap="wrap" gap="$2">
                            {CATEGORIES.map(cat => {
                                const isSelected = vm.selectedCategories.includes(cat);
                                return (
                                    <Button
                                        key={cat}
                                        size="$3"
                                        br={20}
                                        bw={1}
                                        bc={isSelected ? COLORS.royalBlue : COLORS.sandMid}
                                        bg={isSelected ? COLORS.royalBlue : "transparent"}
                                        onPress={() => vm.toggleCategory(cat)}
                                    ><SizableText size="$3" fow={isSelected ? "700" : "500"} color={isSelected ? "white" : COLORS.textDark}>{cat}</SizableText></Button>
                                )
                            })}
                        </XStack>
                    </Card>

                    {/* Written Feedback Section */}
                    <Card bg="white" br={20} p="$5" mb="$5" elevation={4} shadowColor="#8A96A4" shadowOpacity={0.08} bw={1} bc="rgba(221, 214, 200, 0.4)">
                        <SizableText size="$3" fow="700" color={COLORS.textDark} mb="$3" textTransform="uppercase" ls={1}>
                            Tell us more (Optional)
                        </SizableText>
                        <TextArea
                            size="$4"
                            borderWidth={2}
                            borderColor={COLORS.sandLight}
                            backgroundColor={COLORS.cream}
                            color={COLORS.textDark}
                            placeholder="Share your thoughts, suggestions, or issues..."
                            placeholderTextColor={COLORS.textMid as any}
                            value={vm.feedback}
                            onChangeText={vm.setFeedback}
                            minHeight={120}
                            br={12}
                            focusStyle={{ borderColor: COLORS.royalBlue }}
                        />
                    </Card>

                    <XStack ai="center" gap="$2" mb="$5" jc="center">
                        <ShieldAlert size={16} color={COLORS.textMid} />
                        <SizableText size="$2" color={COLORS.textMid} fow="500">
                            Feedback visible only to administrators.
                        </SizableText>
                    </XStack>

                    <Button
                        bg={COLORS.royalBlue}
                        h={56}
                        br={16}
                        onPress={vm.handleSubmit}
                        disabled={vm.isSubmitting}
                        opacity={vm.isSubmitting ? 0.7 : 1}
                        pressStyle={{ scale: 0.97, opacity: 0.9 }}
                        icon={vm.isSubmitting ? <Spinner size="small" color="white" /> : undefined}
                    ><SizableText color="white" fow="800" size="$4">{vm.isSubmitting ? "Submitting..." : "Submit Feedback"}</SizableText></Button>

                </ScrollView>
            </Animated.View>
        </YStack>
    );
};

export default AppReviewScreen;
