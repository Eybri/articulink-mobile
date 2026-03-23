import React, { useState, useRef, useCallback } from 'react';
import {
  Animated,
  StatusBar,
  NativeSyntheticEvent,
  NativeScrollEvent,
  useWindowDimensions,
  Image as RNImage,
} from 'react-native';
import {
  YStack,
  XStack,
  ZStack,
  Button,
  Circle,
  SizableText,
  Card,
  AnimatePresence,
} from 'tamagui';
import { ArrowRight, ChevronRight, Speaker } from '@tamagui/lucide-icons';
import Svg, { Path } from 'react-native-svg';

// ─── Brand Palette (synced with BrandIntroScreen) ────────────────
const COLORS = {
  cream: '#FAF8F4',
  warmWhite: '#F5F1EA',
  sandLight: '#EDE8DF',
  sandMid: '#DDD6C8',
  deepNavy: '#0F2847',
  royalBlue: '#1A4480',
  mediumBlue: '#2A5FA8',
  teal: '#2A8FA0',
  tealLight: '#3DAFC4',
  orbBlue: '#C8D8EE',
  orbTeal: '#BEE4EC',
  orbSand: '#E8E0D0',
  textDark: '#1C2B3A',
  textMid: '#4A5A6A',
  white: '#FFFFFF',
};

// ─── Slide Data ──────────────────────────────────────────────────
interface Slide {
  id: string;
  image: any;
  tag: string;
  title: string;
  highlightedTitle?: string;
  description: string;
  accentColor: string;
  orbTint: string;
}

const slides: Slide[] = [
  {
    id: 'welcome',
    image: require('../../assets/images/logo2-nobg.png'),
    tag: 'SPEECH & COMMUNICATION',
    title: 'Your voice,',
    highlightedTitle: 'perfectly understood',
    description:
      'Breaking communication barriers for those with speech differences through advanced AI technology.',
    accentColor: COLORS.royalBlue,
    orbTint: COLORS.orbBlue,
  },
  {
    id: 'understand',
    image: require('../../assets/images/slide_speech.png'),
    tag: 'AI-POWERED',
    title: 'We Understand',
    highlightedTitle: 'Every Voice',
    description:
      'Advanced AI that accurately interprets nasal and lisp speech patterns with remarkable precision.',
    accentColor: COLORS.teal,
    orbTint: COLORS.orbTeal,
  },
  {
    id: 'correction',
    image: require('../../assets/images/slide_correction.png'),
    tag: 'SMART ENGINE',
    title: 'Smart Correction,',
    highlightedTitle: 'Naturally',
    description:
      'Intelligent auto-correction powered by contextual understanding for clearer communication.',
    accentColor: COLORS.royalBlue,
    orbTint: COLORS.orbBlue,
  },
  {
    id: 'translation',
    image: require('../../assets/images/slide_translation.png'),
    tag: 'MULTILINGUAL',
    title: 'Real-time',
    highlightedTitle: 'Translation',
    description:
      'Seamless English ↔ Tagalog translation in seconds — talk naturally in either language.',
    accentColor: COLORS.teal,
    orbTint: COLORS.orbSand,
  },
  {
    id: 'voice',
    image: require('../../assets/images/slide_voice.png'),
    tag: 'VOICE ENGINE',
    title: 'Natural Voice,',
    highlightedTitle: 'Crystal Clear',
    description:
      'Crystal-clear, natural-sounding speech output in both English and Tagalog.',
    accentColor: COLORS.royalBlue,
    orbTint: COLORS.orbTeal,
  },
];

// ─── Main Component ───────────────────────────────────────────────
const StartUpScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { width, height } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<any>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const currentSlide = slides[activeIndex];
  const isLastSlide = activeIndex === slides.length - 1;

  const onMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      setActiveIndex(Math.round(e.nativeEvent.contentOffset.x / width));
    }, [width],
  );

  const handleNext = useCallback(() => {
    if (isLastSlide) {
      navigation.navigate('BrandIntro');
    } else {
      const next = activeIndex + 1;
      flatListRef.current?.scrollToIndex({ index: next, animated: true });
      setActiveIndex(next);
    }
  }, [activeIndex, isLastSlide, navigation]);

  const handleSkip = useCallback(() => navigation.navigate('BrandIntro'), [navigation]);

  const renderSlide = ({ item, index }: { item: Slide; index: number }) => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
    const isWelcome = item.id === 'welcome';
    const cardOpacity = scrollX.interpolate({ inputRange, outputRange: [0, 1, 0], extrapolate: 'clamp' });
    const cardScale = scrollX.interpolate({ inputRange, outputRange: [0.92, 1, 0.92], extrapolate: 'clamp' });
    const imageTranslateY = scrollX.interpolate({ inputRange, outputRange: [15, 0, 15], extrapolate: 'clamp' });
    const contentTranslateY = scrollX.interpolate({ inputRange, outputRange: [25, 0, 25], extrapolate: 'clamp' });

    return (
      <YStack w={width} h={height * 0.74} jc="center" ai="center" px="$6">
        <Animated.View style={{
          opacity: cardOpacity,
          transform: [{ scale: cardScale }],
          width: '100%',
          maxWidth: 340,
        }}>
          <Card
            br={28}
            padding="$5"
            ai="center"
            bg={COLORS.white}
            elevation={8}
            shadowColor="rgba(15, 40, 71, 0.06)"
            bw={1}
            bc={COLORS.sandMid}
            ov="hidden"
          >
            {/* Header Tag */}
            <XStack ai="center" py="$1" px="$2.5" br={16} bg={`${item.accentColor}08`} mb="$3" gap="$1.5">
              <Circle size={4} bg={item.accentColor} />
              <SizableText size="$1" fow="700" ls={1.2} tt="uppercase" color={item.accentColor}>{item.tag}</SizableText>
            </XStack>

            {/* Illustration */}
            <YStack ai="center" jc="center" h={140} mb="$3">
              <Circle pos="absolute" size={115} bg={item.orbTint} opacity={0.3} />
              <Animated.View style={{ transform: [{ translateY: imageTranslateY }] }}>
                <RNImage
                  source={item.image}
                  style={{ width: isWelcome ? 160 : 140, height: isWelcome ? 80 : 115 }}
                  resizeMode="contain"
                />
              </Animated.View>
            </YStack>

            {/* Text Content */}
            <Animated.View style={{ transform: [{ translateY: contentTranslateY }], width: '100%', alignItems: 'center' }}>
              <SizableText size="$5" fow="800" color={COLORS.textDark} ta="center" lh={22} mb="$1.5" ls={-0.2}>
                {item.title}
                {item.highlightedTitle && (
                  <SizableText color={item.accentColor}>{'\n'}{item.highlightedTitle}</SizableText>
                )}
              </SizableText>

              {/* Decorative Accent */}
              <XStack ai="center" gap="$1" mb="$2.5" opacity={0.25}>
                <YStack w={14} h={1} bg={item.accentColor} />
                <Speaker size={8} color={item.accentColor} />
                <YStack w={14} h={1} bg={item.accentColor} />
              </XStack>

              <SizableText size="$2" color={COLORS.textMid} ta="center" lh={16} fow="400" maxWidth="90%">
                {item.description}
              </SizableText>
            </Animated.View>

            {/* Bottom accent line */}
            <YStack pos="absolute" b={0} l={0} r={0} h={3} bg={item.accentColor} />
          </Card>
        </Animated.View>
      </YStack>
    );
  };

  // Animated pagination dots (scroll-linked for smoothness)
  const Pagination = () => (
    <XStack jc="center" ai="center" mb="$4" gap="$1.5">
      {slides.map((_, i) => {
        const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
        const dotWidth = scrollX.interpolate({ inputRange, outputRange: [6, 22, 6], extrapolate: 'clamp' });
        const dotOpacity = scrollX.interpolate({ inputRange, outputRange: [0.3, 1, 0.3], extrapolate: 'clamp' });
        return (
          <Animated.View key={i} style={{
            height: 4,
            borderRadius: 2,
            width: dotWidth,
            opacity: dotOpacity,
            backgroundColor: 'white',
          }} />
        );
      })}
    </XStack>
  );

  return (
    <YStack f={1} bg={COLORS.white}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Skip Button */}
      <AnimatePresence>
        {!isLastSlide && (
          <Button
            pos="absolute" t={50} r={16} zIndex={20}
            br={16}
            bg="rgba(255,255,255,0.7)"
            onPress={handleSkip}
            pressStyle={{ scale: 0.95, opacity: 0.7 }}
            elevation={1}
            bw={1}
            bc={COLORS.sandMid}
            px="$3"
            h={28}
          >
            <SizableText size="$1" fow="600" ls={0.4} color={COLORS.textMid}>SKIP</SizableText>
          </Button>
        )}
      </AnimatePresence>

      {/* Slides */}
      <Animated.FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={item => item.id}
        renderItem={renderSlide}
        horizontal pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false },
        )}
        scrollEventThrottle={16}
        contentContainerStyle={{ alignItems: 'flex-start' }}
        style={{ paddingTop: height * 0.05 }}
      />

      {/* Bottom Section - Complementary wave style */}
      <YStack pos="absolute" b={0} l={0} r={0} h={height * 0.26}>
        {/* Wave Transition */}
        <YStack pos="absolute" t={-55} l={0} r={0} h={60} zIndex={1}>
          <Svg height="100%" width="100%" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <Path
              fill={COLORS.royalBlue}
              d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,144C672,139,768,181,864,202.7C960,224,1056,224,1152,208C1248,192,1344,160,1392,144L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            />
          </Svg>
        </YStack>

        <YStack f={1} bg={COLORS.royalBlue} px="$8" pb={height * 0.035} jc="center" ai="center">
          {/* Step Counter */}
          <SizableText color="white" opacity={0.4} size="$1" fow="600" ls={1.5} tt="uppercase" mb="$1.5">
            {`${activeIndex + 1} of ${slides.length}`}
          </SizableText>

          <Pagination />


          <Button
            bg="white"
            h={50}
            w="100%"
            maxWidth={280}
            br={25}
            onPress={handleNext}
            pressStyle={{ scale: 0.98, opacity: 0.9 }}
            elevation={4}
            iconAfter={isLastSlide
              ? <ArrowRight size={16} color={COLORS.royalBlue} />
              : <ChevronRight size={16} color={COLORS.royalBlue} />
            }
          >
            <SizableText color={COLORS.royalBlue} fow="800" size="$2" ls={0.8}>
              CONTINUE
            </SizableText>
          </Button>
        </YStack>
      </YStack>
    </YStack>
  );
};

export default StartUpScreen;