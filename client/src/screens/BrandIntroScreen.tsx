import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    StatusBar,
    Image as RNImage
} from 'react-native';
import {
    YStack,
    XStack,
    SizableText,
    ZStack,
    Button,
    Circle,
    Card
} from 'tamagui';
import { ArrowRight } from '@tamagui/lucide-icons';
import { useNavigation } from '@react-navigation/native';

import Svg, { Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const BrandIntroScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 20,
                friction: 8,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const COLORS = {
        cream: '#FAF8F4',
        royalBlue: '#1A4480',
        teal: '#2A8FA0',
        textDark: '#1C2B3A',
        textMid: '#4A5A6A',
        white: '#FFFFFF',
        deepNavy: '#0F2847',
    };

    return (
        <YStack f={1} bg={COLORS.cream}>
            <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

            <YStack f={1}>
                {/* Top Section - Brand Identity */}
                <YStack f={0.72} jc="center" ai="center" bg={COLORS.white} px="$8">
                    <Animated.View style={{
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }],
                        alignItems: 'center',
                    }}>
                        <RNImage
                            source={require('../../assets/images/logo2-nobg.png')}
                            style={{ width: width * 0.38, height: width * 0.38 }}
                            resizeMode="contain"
                        />
                        <YStack ai="center" mt="$3" gap="$1">
                            <SizableText size="$9" fow="900" color={COLORS.textDark} ls={-1}>
                                articuLink
                            </SizableText>
                            <YStack w={40} h={3} bg={COLORS.teal} br={2} mt="$1" />
                            <SizableText size="$1" fow="600" color={COLORS.textMid} ls={4} tt="uppercase" opacity={0.35} mt="$1">
                                Speech Engine
                            </SizableText>
                        </YStack>
                    </Animated.View>
                </YStack>

                {/* Bottom Section - Welcome & Action */}
                <YStack f={0.28}>
                    {/* Wave Transition */}
                    <YStack pos="absolute" t={-55} l={0} r={0} h={60} zIndex={1}>
                        <Svg height="100%" width="100%" viewBox="0 0 1440 320" preserveAspectRatio="none">
                            <Path
                                fill={COLORS.royalBlue}
                                d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,144C672,139,768,181,864,202.7C960,224,1056,224,1152,208C1248,192,1344,160,1392,144L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                            />
                        </Svg>
                    </YStack>

                    <YStack
                        f={1}
                        bg={COLORS.royalBlue}
                        px="$7"
                        pb={height * 0.035}
                        jc="space-between"
                    >
                        <Animated.View style={{ opacity: fadeAnim, flex: 1, justifyContent: 'center' }}>
                            <YStack gap="$1.5" mb="$4">
                                <SizableText color="white" size="$7" fow="800">
                                    Welcome
                                </SizableText>
                                <SizableText color="white" opacity={0.7} size="$2" fow="400" lh={18}>
                                    Empowering communication through advanced AI. Break the silence and express yourself naturally.
                                </SizableText>
                            </YStack>

                            <Button
                                bg={COLORS.white}
                                h={50}
                                br={25}
                                onPress={() => navigation.navigate('Login')}
                                pressStyle={{ scale: 0.98, opacity: 0.9 }}
                                elevation={4}
                                iconAfter={<ArrowRight size={16} color={COLORS.royalBlue} />}
                            >
                                <SizableText color={COLORS.royalBlue} fow="800" size="$2" ls={0.8}>
                                    GET STARTED
                                </SizableText>
                            </Button>
                        </Animated.View>
                    </YStack>
                </YStack>
            </YStack>
        </YStack>
    );
};

export default BrandIntroScreen;
