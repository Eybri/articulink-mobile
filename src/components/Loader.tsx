import React from 'react';
import { Animated } from 'react-native';
import { YStack, XStack } from 'tamagui';

export const SkeletonFeedbackCard = () => {
    const opacityAnim = React.useRef(new Animated.Value(0.4)).current;

    React.useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(opacityAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
                Animated.timing(opacityAnim, { toValue: 0.4, duration: 800, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    return (
        <Animated.View style={{ opacity: opacityAnim }}>
            <YStack bg="white" br={16} p={20} mb={20} elevation={2} shadowColor="#000" shadowOpacity={0.06} shadowRadius={12} shadowOffset={{ width: 0, height: 4 }} bw={1} bc="#E2E8F0">
                <XStack jc="space-between" ai="center" mb={16}>
                    <XStack ai="center" gap={8}>
                        <YStack width={32} height={32} bg="#E2E8F0" br={12} />
                        <YStack width={50} height={20} bg="#E2E8F0" br={4} />
                    </XStack>
                    <YStack width={80} height={16} bg="#E2E8F0" br={4} />
                </XStack>

                <YStack width="100%" height={14} bg="#E2E8F0" br={4} mb={8} />
                <YStack width="90%" height={14} bg="#E2E8F0" br={4} mb={8} />
                <YStack width="60%" height={14} bg="#E2E8F0" br={4} mb={16} />

                <XStack gap={8} flexWrap="wrap">
                    <YStack width={100} height={26} bg="#E2E8F0" br={13} />
                    <YStack width={120} height={26} bg="#E2E8F0" br={13} />
                    <YStack width={80} height={26} bg="#E2E8F0" br={13} />
                </XStack>
            </YStack>
        </Animated.View>
    );
};
