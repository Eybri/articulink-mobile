import React from 'react';
import { ScrollView, Animated, StatusBar, Platform, Image, StyleSheet } from 'react-native';
import { YStack, XStack, SizableText, Button, TextArea, Spinner } from "tamagui";
import { Star, X, ImagePlus } from "@tamagui/lucide-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { useAppReviewViewModel, CATEGORIES } from "./useAppReviewViewModel";
import { COLORS } from "../../../constants/colors";

const AppReviewScreen = ({ navigation }: any) => {
    const vm = useAppReviewViewModel(navigation);

    const getRatingText = () => {
        switch (vm.rating) {
            case 1: return "Terrible experience.";
            case 2: return "Not great, could be better.";
            case 3: return "It's okay, nothing special.";
            case 4: return "Good! I like it.";
            case 5: return "Great 5 star! Can't get any better than that!";
            default: return "Tap a star to rate";
        }
    };

    return (
        <YStack f={1} bg={COLORS.cream}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
            
            {/* Top Background Gradient matches the sophisticated look */}
            <LinearGradient
                colors={['rgba(61, 175, 196, 0.4)', 'rgba(61, 175, 196, 0)']}
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 0.4 }}
            />

            {/* Custom Header with X button */}
            <XStack ai="center" pt={Platform.OS === 'ios' ? 55 : 45} pb={20} px={20} zIndex={10}>
                <Button 
                    size="$3" 
                    circular 
                    icon={<X size={20} color={COLORS.textDark} />} 
                    bg={COLORS.white} 
                    elevation={2}
                    shadowColor="#000"
                    shadowOpacity={0.1}
                    shadowRadius={5}
                    shadowOffset={{ width: 0, height: 2 }}
                    onPress={() => navigation.goBack()}
                />
            </XStack>

            <Animated.View style={{ flex: 1, opacity: vm.animations.fadeAnim, transform: [{ translateY: vm.animations.slideAnim }] }}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}>
                    
                    {/* Stars Section */}
                    <YStack bg="white" br={12} p={24} mb={20} elevation={1} shadowColor="#000" shadowOpacity={0.05} shadowRadius={10} shadowOffset={{ width: 0, height: 4 }}>
                        <SizableText size="$6" fow="700" color={COLORS.textDark} ta="center" mb={20}>
                            How is your experience?
                        </SizableText>
                        
                        <XStack jc="center" gap={12} mb={16}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Button
                                    key={star}
                                    chromeless
                                    p={0}
                                    m={0}
                                    onPress={() => vm.setRating(star)}
                                    pressStyle={{ scale: 0.8 }}
                                    icon={<Star size={44} color={star <= vm.rating ? COLORS.royalGreen : "#E2E8F0"} fill={star <= vm.rating ? COLORS.royalGreen : "transparent"} />}
                                />
                            ))}
                        </XStack>

                        <SizableText size="$3" color={COLORS.textMid} ta="center" fow="500">
                            {getRatingText()}
                        </SizableText>
                    </YStack>

                    {/* What stood out Section */}
                    <YStack bg="white" br={12} p={20} mb={20} elevation={1} shadowColor="#000" shadowOpacity={0.05} shadowRadius={10} shadowOffset={{ width: 0, height: 4 }}>
                        <SizableText size="$4" fow="600" color={COLORS.textDark} mb={16}>
                            What stood out?
                        </SizableText>
                        <XStack flexWrap="wrap" gap={8}>
                            {CATEGORIES.map(cat => {
                                const isSelected = vm.selectedCategories.includes(cat);
                                return (
                                    <Button
                                        key={cat}
                                        size="$3"
                                        br={8}
                                        bw={1}
                                        bc={isSelected ? COLORS.royalGreen : "#E2E8F0"}
                                        bg={isSelected ? `${COLORS.royalGreen}10` : "transparent"}
                                        onPress={() => vm.toggleCategory(cat)}
                                        pressStyle={{ scale: 0.98 }}
                                    >
                                        <SizableText size="$3" fow={isSelected ? "600" : "400"} color={isSelected ? COLORS.royalGreen : COLORS.textMid}>
                                            {cat}
                                        </SizableText>
                                    </Button>
                                )
                            })}
                        </XStack>
                    </YStack>

                    {/* Written Feedback Section */}
                    <YStack bg="white" br={12} p={20} mb={20} elevation={1} shadowColor="#000" shadowOpacity={0.05} shadowRadius={10} shadowOffset={{ width: 0, height: 4 }}>
                        <SizableText size="$4" fow="600" color={COLORS.textDark} mb={12}>
                            Write your review
                        </SizableText>
                        <TextArea
                            size="$4"
                            borderWidth={1}
                            borderColor="#E2E8F0"
                            backgroundColor="#F8FAFC"
                            color={COLORS.textDark}
                            placeholder="Amazing experience! The app was very welcoming..."
                            placeholderTextColor="#94A3B8"
                            value={vm.feedback}
                            onChangeText={vm.setFeedback}
                            minHeight={120}
                            br={8}
                            focusStyle={{ borderColor: COLORS.royalGreen, backgroundColor: "white" }}
                        />
                    </YStack>

                    {/* Attach Images Section */}
                    <YStack bg="white" br={12} p={20} mb={30} elevation={1} shadowColor="#000" shadowOpacity={0.05} shadowRadius={10} shadowOffset={{ width: 0, height: 4 }}>
                        <XStack jc="space-between" ai="center" mb={16}>
                            <SizableText size="$4" fow="600" color={COLORS.textDark}>
                                Share some photos
                            </SizableText>
                            <SizableText size="$2" color={COLORS.textMid}>{vm.images.length}/3</SizableText>
                        </XStack>

                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ overflow: 'visible' }}>
                            <XStack gap={12}>
                                {vm.images.map((uri, index) => (
                                    <YStack key={index} position="relative">
                                        <Image source={{ uri }} style={{ width: 100, height: 100, borderRadius: 8 }} />
                                        <Button 
                                            size="$2" 
                                            circular 
                                            icon={<X size={14} color="white" />} 
                                            bg="rgba(0,0,0,0.5)" 
                                            position="absolute" 
                                            top={4} 
                                            right={4} 
                                            onPress={() => vm.removeImage(index)}
                                            p={0}
                                            w={24}
                                            h={24}
                                        />
                                    </YStack>
                                ))}

                                {vm.images.length < 3 && (
                                    <Button 
                                        width={100}
                                        height={100}
                                        br={8}
                                        bg="#F8FAFC"
                                        bw={1}
                                        bc="#E2E8F0"
                                        borderStyle="dashed"
                                        onPress={vm.pickImage}
                                        ai="center"
                                        jc="center"
                                        icon={<ImagePlus size={24} color="#94A3B8" />}
                                        pressStyle={{ scale: 0.95 }}
                                    />
                                )}
                            </XStack>
                        </ScrollView>
                    </YStack>

                    <Button
                        bg={COLORS.royalGreen}
                        h={56}
                        br={12}
                        onPress={vm.handleSubmit}
                        disabled={vm.isSubmitting}
                        opacity={vm.isSubmitting ? 0.7 : 1}
                        pressStyle={{ scale: 0.97, opacity: 0.9 }}
                        elevation={2}
                        shadowColor={COLORS.royalGreen}
                        shadowOpacity={0.3}
                        shadowRadius={8}
                        shadowOffset={{ width: 0, height: 4 }}
                        icon={vm.isSubmitting ? <Spinner size="small" color="white" /> : undefined}
                    >
                        <SizableText color="white" fow="700" size="$4">
                            {vm.isSubmitting ? "Submitting..." : "Submit your Review"}
                        </SizableText>
                    </Button>

                </ScrollView>
            </Animated.View>
        </YStack>
    );
};

export default AppReviewScreen;
