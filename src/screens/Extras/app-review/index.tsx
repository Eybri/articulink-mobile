import React from 'react';
import { ScrollView, Animated, StatusBar, Platform, Image, StyleSheet, Modal } from 'react-native';
import { YStack, XStack, SizableText, Button, TextArea, Spinner } from "tamagui";
import { Star, X, ImagePlus } from "@tamagui/lucide-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { useAppReviewViewModel, CATEGORIES } from "./useAppReviewViewModel";
import { COLORS } from "../../../constants/colors";

const AppReviewScreen = ({ navigation }: any) => {
    const vm = useAppReviewViewModel(navigation);

    const getRatingText = () => {
        if (vm.rating === 0) return "Tap or drag to rate";
        if (vm.rating <= 1.5) return "Terrible experience.";
        if (vm.rating <= 2.5) return "Not great, could be better.";
        if (vm.rating <= 3.5) return "It's okay, nothing special.";
        if (vm.rating <= 4.5) return "Good! I like it.";
        return "Great! Can't get any better than that!";
    };

    return (
        <YStack f={1} bg="#FFFFFF">
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

            {/* Top Background Gradient */}
            <LinearGradient
                colors={['rgba(42, 95, 168, 0.8)', 'rgba(42, 95, 168, 0.1)']}
                style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '40%' }}
            />

            {/* Custom Header with X button */}
            <XStack ai="center" jc="space-between" pt={Platform.OS === 'ios' ? 55 : 45} pb={10} px={20} zIndex={10}>
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
                <SizableText fow="700" size="$5" color="white" textShadowColor="rgba(0,0,0,0.1)" textShadowRadius={4} textShadowOffset={{ width: 0, height: 1 }}>
                    Reviews and Ratings
                </SizableText>
                <YStack w={40} />
            </XStack>

            <Animated.View style={{ flex: 1, opacity: vm.animations.fadeAnim, transform: [{ translateY: vm.animations.slideAnim }] }}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}>

                    {/* Top gap to reveal the gradient before the sheet starts */}
                    <YStack h={100} jc="flex-end" px={20} pb={20}>
                        <XStack bg="rgba(255, 255, 255, 0.9)" br={16} p={16} ai="center" jc="center" gap={12} elevation={2} shadowColor="#000" shadowOpacity={0.05} shadowRadius={10} shadowOffset={{ width: 0, height: 4 }}>
                            <Image
                                source={require('../../../../assets/images/ariya.png')}
                                style={{ width: 40, height: 40, resizeMode: 'contain' }}
                            />
                            <SizableText size="$3" color={COLORS.textDark} fow="600" f={1}>
                                <SizableText size="$4" color={COLORS.royalBlue} fow="800" mb={4}>
                                    Thank You!
                                </SizableText>
                                {' '}We'd love to hear more about your experience with Articulink.
                            </SizableText>
                        </XStack>
                    </YStack>

                    {/* Main White Sheet Overlapping the Gradient */}
                    <YStack bg="white" borderTopLeftRadius={32} borderTopRightRadius={32} pt={30} px={24} pb={100} f={1} elevation={10} shadowColor="#000" shadowOpacity={0.05} shadowRadius={20} shadowOffset={{ width: 0, height: -5 }}>

                        {/* Stars Section */}
                                <YStack mb={30}>
                                    <SizableText size="$5" fow="700" color={COLORS.textDark} ta="center" mb={16}>
                                        How was your experience?
                                    </SizableText>

                                    <XStack
                                        jc="center"
                                        gap={8}
                                        mb={12}
                                        onStartShouldSetResponder={() => true}
                                        onResponderGrant={(e) => {
                                            const x = e.nativeEvent.locationX;
                                            let calc = (x / 252) * 5;
                                            calc = Math.max(0.5, Math.min(5, Math.ceil(calc * 2) / 2));
                                            vm.setRating(calc);
                                        }}
                                        onResponderMove={(e) => {
                                            const x = e.nativeEvent.locationX;
                                            let calc = (x / 252) * 5;
                                            calc = Math.max(0.5, Math.min(5, Math.ceil(calc * 2) / 2));
                                            vm.setRating(calc);
                                        }}
                                    >
                                        {[1, 2, 3, 4, 5].map((starIndex) => {
                                            let fillWidth: any = "0%";
                                            if (vm.rating >= starIndex) fillWidth = "100%";
                                            else if (vm.rating + 0.5 === starIndex) fillWidth = "50%";

                                            return (
                                                <YStack key={starIndex} width={44} height={44} position="relative" pointerEvents="none">
                                                    <YStack position="absolute" top={0} left={0}>
                                                        <Star size={44} color="#E2E8F0" />
                                                    </YStack>
                                                    <YStack position="absolute" top={0} left={0} width={fillWidth} overflow="hidden">
                                                        <Star size={44} color={COLORS.royalBlue} fill={COLORS.royalBlue} />
                                                    </YStack>
                                                </YStack>
                                            );
                                        })}
                                    </XStack>

                                    <SizableText size="$3" color={COLORS.textMid} ta="center" fow="500">
                                        {getRatingText()}
                                    </SizableText>
                                </YStack>

                                {/* What stood out Section */}
                                <YStack mb={30}>
                                    <SizableText size="$4" fow="600" color={COLORS.textDark} mb={12}>
                                        What stood out?
                                    </SizableText>
                                    <XStack flexWrap="wrap" gap={8}>
                                        {CATEGORIES.map(cat => {
                                            const isSelected = vm.selectedCategories.includes(cat);
                                            return (
                                                <Button
                                                    key={cat}
                                                    size="$3"
                                                    br={20}
                                                    bw={1}
                                                    bc={isSelected ? COLORS.royalBlue : "#E2E8F0"}
                                                    bg={isSelected ? `${COLORS.royalBlue}10` : "transparent"}
                                                    onPress={() => vm.toggleCategory(cat)}
                                                    pressStyle={{ scale: 0.98 }}
                                                >
                                                    <SizableText size="$3" fow={isSelected ? "600" : "400"} color={isSelected ? COLORS.royalBlue : COLORS.textMid}>
                                                        {cat}
                                                    </SizableText>
                                                </Button>
                                            )
                                        })}
                                    </XStack>
                                </YStack>

                                {/* Written Feedback Section */}
                                <YStack mb={30}>
                                    <SizableText size="$4" fow="600" color={COLORS.textDark} mb={12}>
                                        Write your review
                                    </SizableText>

                                    <YStack bg="white" br={16} p={16} bw={1} bc="#E2E8F0">
                                        <SizableText size="$2" fow="600" color="#94A3B8" mb={8} textTransform="uppercase" ls={1}>
                                            Review
                                        </SizableText>
                                        <TextArea
                                            size="$4"
                                            borderWidth={0}
                                            backgroundColor="transparent"
                                            color={COLORS.textDark}
                                            placeholder="Amazing experience! The host was very welcoming and provided all the information we needed..."
                                            placeholderTextColor={"#CBD5E1" as any}
                                            value={vm.feedback}
                                            onChangeText={vm.setFeedback}
                                            minHeight={100}
                                            p={0}
                                            m={0}
                                            textAlignVertical="top"
                                            focusStyle={{ backgroundColor: "transparent", outlineWidth: 0 }}
                                        />
                                    </YStack>
                                </YStack>

                                {/* Attach Images Section */}
                                <YStack mb={40}>
                                    <XStack jc="space-between" ai="center" mb={12}>
                                        <SizableText size="$4" fow="600" color={COLORS.textDark}>
                                            Share some photos of your experience
                                        </SizableText>
                                        <SizableText size="$2" color={COLORS.textMid}>{vm.images.length}/3</SizableText>
                                    </XStack>

                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ overflow: 'visible' }}>
                                        <XStack gap={12}>
                                            {vm.images.map((uri, index) => (
                                                <YStack key={index} position="relative">
                                                    <Image source={{ uri }} style={{ width: 80, height: 80, borderRadius: 12 }} />
                                                    <Button
                                                        size="$2"
                                                        circular
                                                        icon={<X size={12} color="white" />}
                                                        bg="rgba(0,0,0,0.6)"
                                                        position="absolute"
                                                        top={4}
                                                        right={4}
                                                        onPress={() => vm.removeImage(index)}
                                                        p={0}
                                                        w={20}
                                                        h={20}
                                                    />
                                                </YStack>
                                            ))}

                                            {vm.images.length < 3 && (
                                                <Button
                                                    width={80}
                                                    height={80}
                                                    br={12}
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
                                    bg={COLORS.royalBlue}
                                    h={56}
                                    br={16}
                                    onPress={vm.handleSubmit}
                                    disabled={vm.isSubmitting}
                                    opacity={vm.isSubmitting ? 0.7 : 1}
                                    pressStyle={{ scale: 0.97, opacity: 0.9 }}
                                    icon={vm.isSubmitting ? <Spinner size="small" color="white" /> : undefined}
                                >
                                    <SizableText color="white" fow="700" size="$4">
                                        {vm.isSubmitting ? "Submitting..." : "Submit your Review"}
                                    </SizableText>
                                </Button>
                    </YStack>
                </ScrollView>
            </Animated.View>

            {/* Thank You Popup Modal */}
            <Modal visible={vm.isSubmitted} transparent={true} animationType="fade">
                <YStack f={1} bg="rgba(0,0,0,0.6)" ai="center" jc="center" px={30}>
                    <YStack bg="white" w="100%" br={20} pt={75} pb={30} px={24} ai="center" position="relative" elevation={10} shadowColor="#000" shadowOpacity={0.15} shadowRadius={20}>
                        
                        {/* Floating Icon */}
                        <YStack 
                            position="absolute" 
                            top={-60} 
                            alignSelf="center" 
                            width={120} 
                            height={120} 
                            borderRadius={60} 
                            bg="white" 
                            ai="center" 
                            jc="center"
                            elevation={8}
                            shadowColor="#000" 
                            shadowOpacity={0.15} 
                            shadowRadius={15}
                        >
                            <YStack width={104} height={104} borderRadius={52} bg="#EBF8FF" ai="center" jc="center">
                                <Image
                                    source={require('../../../../assets/images/ariya.png')}
                                    style={{ width: 70, height: 70, resizeMode: 'contain', marginTop: 5 }}
                                />
                            </YStack>
                        </YStack>
                        
                        <SizableText size="$6" fow="800" color="#1E293B" ta="center" mb={8} mt={10}>
                            Feedback Received.
                        </SizableText>
                        
                        <SizableText size="$4" color="#94A3B8" ta="center" fow="400" lh={24} mb={32}>
                            Your review has been successfully submitted. We deeply appreciate your insights.
                        </SizableText>
                        
                        <Button
                            bg="transparent"
                            h={44}
                            onPress={() => navigation.goBack()}
                            pressStyle={{ scale: 0.95, opacity: 0.7 }}
                        >
                            <SizableText color="#14B8A6" fow="600" size="$5">Done</SizableText>
                        </Button>
                    </YStack>

                    {/* Bottom Close Button */}
                    <Button 
                        mt={40}
                        circular
                        bg="transparent"
                        icon={<X size={32} color="rgba(255,255,255,0.7)" />}
                        onPress={() => navigation.goBack()}
                        pressStyle={{ scale: 0.9 }}
                    />
                </YStack>
            </Modal>
        </YStack>
    );
};

export default AppReviewScreen;
