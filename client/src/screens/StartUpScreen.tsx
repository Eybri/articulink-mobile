import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  Animated,
  StatusBar,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Platform,
  useWindowDimensions,
  FlatList,
  Image as RNImage,
} from 'react-native';
import {
  YStack,
  XStack,
  ZStack,
  Button,
  Circle,
  Paragraph,
  H1,
  SizableText,
  Card,
  Theme,
} from 'tamagui';
import { ArrowRight, ChevronRight } from '@tamagui/lucide-icons';

// ─── Brand Palette ───────────────────────────────────────────────
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
  waveColor: string;
}

const slides: Slide[] = [
  {
    id: 'welcome',
    image: require('../../assets/images/logoName-nobg.png'),
    tag: 'SPEECH & COMMUNICATION',
    title: 'Your voice,',
    highlightedTitle: 'perfectly understood',
    description:
      'Breaking communication barriers for those with speech differences through advanced AI technology.',
    accentColor: COLORS.royalBlue,
    orbTint: COLORS.orbBlue,
    waveColor: COLORS.teal,
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
    waveColor: COLORS.teal,
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
    waveColor: COLORS.mediumBlue,
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
    waveColor: COLORS.tealLight,
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
    waveColor: COLORS.teal,
  },
];

// ─── Animated Waveform ───────────────────────────────────────────
interface WaveformProps {
  color: string;
  scrollX: Animated.Value;
  index: number;
  width: number;
}

const WaveformDecoration: React.FC<WaveformProps> = ({ color, scrollX, index, width }) => {
  const barHeights = [6, 14, 26, 18, 36, 24, 10, 30, 20, 40, 26, 12, 32, 16, 8, 28, 22, 38, 14, 8];
  const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
  const opacity = scrollX.interpolate({ inputRange, outputRange: [0, 1, 0], extrapolate: 'clamp' });
  const translateY = scrollX.interpolate({ inputRange, outputRange: [16, 0, 16], extrapolate: 'clamp' });
  const barAnims = useRef(barHeights.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const animations = barAnims.map((anim, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 70),
          Animated.timing(anim, { toValue: 1, duration: 550 + (i % 5) * 110, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 550 + (i % 5) * 110, useNativeDriver: true }),
        ])
      )
    );
    animations.forEach(a => a.start());
    return () => animations.forEach(a => a.stop());
  }, []);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      <XStack ai="center" jc="center" mt="$4" h={48}>
        {barHeights.map((h, i) => {
          const scaleY = barAnims[i].interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] });
          return (
            <Animated.View key={i} style={{
              width: 3, height: h,
              backgroundColor: color,
              borderRadius: 2,
              marginHorizontal: 2,
              opacity: 0.4,
              transform: [{ scaleY }],
            }} />
          );
        })}
      </XStack>
    </Animated.View>
  );
};

// ─── Soft Background Orb ─────────────────────────────────────────
interface OrbProps { color: string; size: number; x: number; y: number; duration: number; delay: number; }

const SoftOrb: React.FC<OrbProps> = ({ color, size, x, y, duration, delay }) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1, duration, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -18] });
  const scale = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.92, 1, 0.92] });

  return (
    <Animated.View style={{
      position: 'absolute',
      left: x - size / 2, top: y - size / 2,
      width: size, height: size,
      borderRadius: size / 2,
      backgroundColor: color,
      opacity: 0.5,
      transform: [{ translateY }, { scale }],
    }}>
      <Circle pos="absolute" t={size * 0.15} l={size * 0.15} size={size * 0.7} bg="white" opacity={0.35} />
    </Animated.View>
  );
};

// ─── Main Component ───────────────────────────────────────────────
const StartUpScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { width, height } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<any>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const currentSlide = slides[activeIndex];
  const isLastSlide = activeIndex === slides.length - 1;

  const orbData = useMemo(() => slides.map(slide => ([
    { color: slide.orbTint, size: width * 0.65, x: width * 0.88, y: height * 0.07, duration: 6000, delay: 0 },
    { color: slide.orbTint, size: width * 0.5, x: width * 0.1, y: height * 0.48, duration: 7200, delay: 1000 },
    { color: slide.orbTint, size: width * 0.38, x: width * 0.62, y: height * 0.8, duration: 5500, delay: 500 },
  ])), [width, height]);

  const onMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      setActiveIndex(Math.round(e.nativeEvent.contentOffset.x / width));
    }, [width],
  );

  const handleNext = useCallback(() => {
    if (isLastSlide) { navigation.navigate('Login'); }
    else {
      const next = activeIndex + 1;
      flatListRef.current?.scrollToIndex({ index: next, animated: true });
      setActiveIndex(next);
    }
  }, [activeIndex, isLastSlide, navigation]);

  const handleSkip = useCallback(() => navigation.navigate('Login'), [navigation]);

  const renderSlide = ({ item, index }: { item: Slide; index: number }) => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
    const isWelcome = item.id === 'welcome';
    const cardOpacity = scrollX.interpolate({ inputRange, outputRange: [0, 1, 0], extrapolate: 'clamp' });
    const cardTranslateY = scrollX.interpolate({ inputRange, outputRange: [70, 0, 70], extrapolate: 'clamp' });
    const cardScale = scrollX.interpolate({ inputRange, outputRange: [0.84, 1, 0.84], extrapolate: 'clamp' });
    const orbs = orbData[index];

    return (
      <YStack w={width} h={height} jc="center" ai="center" ov="hidden">
        {/* Background */}
        <ZStack pos="absolute" fullscreen pointerEvents="none">
          <YStack fullscreen bg={COLORS.cream} />
          <Circle pos="absolute" t={-height * 0.1} r={-width * 0.15} size={width * 0.95} bg={COLORS.sandLight} opacity={0.55} />
          <Circle pos="absolute" b={-height * 0.06} l={-width * 0.2} size={width * 0.8} bg={COLORS.sandMid} opacity={0.22} />
          {orbs.map((orb, i) => <SoftOrb key={i} {...orb} />)}

          {/* Dot grid */}
          {Array.from({ length: 9 }).map((_, row) =>
            Array.from({ length: 6 }).map((_, col) => (
              <Circle
                key={`${row}-${col}`}
                pos="absolute"
                size={2}
                bg={item.accentColor}
                opacity={0.055}
                l={(width / 6) * col + (width / 12)}
                t={(height / 9) * row + (height / 18)}
              />
            ))
          )}

          {/* Brackets */}
          <YStack pos="absolute" t={58} l={22} w={34} h={34} borderTopWidth={1.5} borderLeftWidth={1.5} bc={`${item.accentColor}28`} br={6} />
          <YStack pos="absolute" b={118} r={22} w={34} h={34} borderBottomWidth={1.5} borderRightWidth={1.5} bc={`${item.waveColor}28`} br={6} />
        </ZStack>

        {/* Card */}
        <Animated.View style={{
          opacity: cardOpacity,
          transform: [{ translateY: cardTranslateY }, { scale: cardScale }],
          width: width - 40,
        }}>
          <Card br={28} bw={1} bc={COLORS.sandMid} py="$6" px="$5" ai="center" ov="hidden" bg="white" elevation={8} shadowColor="#8A96A4">
            <YStack pos="absolute" t={0} l={0} r={0} h={65} bg={`${item.accentColor}07`} />
            
            <YStack ai="center" jc="center" mb="$3">
               <Circle pos="absolute" size={150} bg={item.orbTint} opacity={0.5} />
               <RNImage
                source={item.image}
                style={{
                  width: isWelcome ? 200 : Math.min(width * 0.52, 230),
                  height: isWelcome ? 96 : Math.min(width * 0.38, 170),
                }}
                resizeMode="contain"
               />
            </YStack>

            <XStack ai="center" py="$1" px="$3" br={20} bw={1} bc={`${item.accentColor}20`} bg={`${item.accentColor}0C`} mb="$3" gap="$2">
              <Circle size={5} bg={item.accentColor} />
              <SizableText size="$1" fow="800" ls={2.2} tt="uppercase" color={item.accentColor}>{item.tag}</SizableText>
            </XStack>

            <SizableText size="$9" fow="800" color={COLORS.textDark} ta="center" lh={35} mb="$3" ls={-0.4}>
              {item.title}
              {item.highlightedTitle && <SizableText color={item.accentColor}>{'\n'}{item.highlightedTitle}</SizableText>}
            </SizableText>

            <XStack ai="center" w="85%" mb="$3" gap="$1">
              <YStack f={1} h={1} bg={COLORS.sandMid} />
              {[5, 9, 15, 9, 5].map((h, i) => (
                <YStack key={i} w={3} h={h} br={1.5} bg={item.waveColor} opacity={0.45} marginHorizontal={1.5} />
              ))}
              <YStack f={1} h={1} bg={COLORS.sandMid} />
            </XStack>

            <SizableText size="$4" color={COLORS.textMid} ta="center" lh={22} ls={0.15} maxWidth={290}>
              {item.description}
            </SizableText>

            <YStack pos="absolute" b={0} l={0} r={0} h={3} bg={item.accentColor} />
          </Card>
        </Animated.View>

        <WaveformDecoration color={item.waveColor} scrollX={scrollX} index={index} width={width} />
      </YStack>
    );
  };

  const Pagination = () => (
    <XStack jc="center" ai="center" mb="$4" gap="$2">
      {slides.map((slide, i) => {
        const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
        const dotWidth = scrollX.interpolate({ inputRange, outputRange: [7, 32, 7], extrapolate: 'clamp' });
        const dotOpacity = scrollX.interpolate({ inputRange, outputRange: [0.25, 1, 0.25], extrapolate: 'clamp' });
        return (
          <Animated.View key={i} style={{
            height: 7, borderRadius: 3.5,
            width: dotWidth, opacity: dotOpacity,
            backgroundColor: slide.accentColor,
          }} />
        );
      })}
    </XStack>
  );

  const buttonBg = scrollX.interpolate({
    inputRange: slides.map((_, i) => i * width),
    outputRange: slides.map(s => s.accentColor),
    extrapolate: 'clamp',
  });

  return (
    <YStack f={1} bg={COLORS.cream}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <Button
        pos="absolute" t={52} r={20} zIndex={20}
        br={20} bw={1} bc={`${currentSlide.accentColor}28`}
        bg="rgba(255,255,255,0.75)"
        onPress={handleSkip}
        pressStyle={{ scale: 0.95 }}
        elevation={2}
      >
        <SizableText size="$2" fow="600" ls={0.4} color={currentSlide.accentColor}>Skip</SizableText>
      </Button>

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
      />

      <YStack pos="absolute" b={0} l={0} r={0} px="$6" pb="$10" pt="$2">
        <Pagination />
        <Animated.View style={{ borderRadius: 16, overflow: 'hidden', backgroundColor: buttonBg }}>
           <Button
            bg="transparent"
            h={64}
            onPress={handleNext}
            pressStyle={{ scale: 0.98 }}
            iconAfter={isLastSlide ? <ArrowRight size={20} color="white" /> : <ChevronRight size={20} color="white" />}
           >
            <SizableText color="white" fow="700" size="$5">{isLastSlide ? 'Get Started' : 'Continue'}</SizableText>
           </Button>
        </Animated.View>
      </YStack>
    </YStack>
  );
};

export default StartUpScreen;