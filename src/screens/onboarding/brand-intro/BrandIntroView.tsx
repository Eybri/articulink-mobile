import React from 'react';
import {
    Animated,
    Dimensions,
    StatusBar,
    Image as RNImage
} from 'react-native';
import {
    YStack,
    SizableText,
    Button,
} from 'tamagui';
import { ArrowRight } from '@tamagui/lucide-icons';
import Svg, { Path } from 'react-native-svg';
import { COLORS } from './../../../constants/colors';

const { width, height } = Dimensions.get('window');

interface BrandIntroViewProps {
    vm: any;
}

export const BrandIntroView: React.FC<BrandIntroViewProps> = ({ vm }) => {
    return (
        <YStack f={1} bg={COLORS.cream}>
            <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

            <YStack f={1}>
                {/* Top Section - Brand Identity */}
                <YStack f={0.72} jc="center" ai="center" bg={COLORS.white} px="$8">
                    <Animated.View style={{
                        opacity: vm.animations.fadeAnim,
                        transform: [{ translateY: vm.animations.slideAnim }],
                        alignItems: 'center',
                    }}>
                        <RNImage
                            source={require('../../../../assets/images/icon-blue.png')}
                            style={{ width: width * 0.24, height: width * 0.24 }}
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
                        <Animated.View style={{ opacity: vm.animations.fadeAnim, flex: 1, justifyContent: 'center' }}>
                            <YStack gap="$1.5" mb="$4">
                                <SizableText color="white" size="$7" fow="800">
                                    Welcome
                                </SizableText>
                                <SizableText color="white" opacity={0.7} size="$2" fow="400" lh={18}>
                                    An assistive communication tool tailored for individuals with cleft conditions.
                                </SizableText>
                            </YStack>

                            <Button
                                bg={COLORS.white}
                                h={50}
                                br={25}
                                onPress={vm.handleGetStarted}
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
