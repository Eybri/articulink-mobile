import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  Animated,
  StatusBar,
  NativeSyntheticEvent,
  NativeScrollEvent,
  useWindowDimensions,
  Image as RNImage,
  Easing,
} from 'react-native';
import {
  YStack,
  XStack,
  Button,
  Circle,
  SizableText,
  Card,
  AnimatePresence,
} from 'tamagui';
import { ArrowRight, ChevronRight, Speaker } from '@tamagui/lucide-icons';
import Svg, { Path } from 'react-native-svg';

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

const WAVE_PATH =
  'M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,144C672,139,768,181,864,202.7C960,224,1056,224,1152,208C1248,192,1344,160,1392,144L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z';

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
    description: 'Breaking communication barriers for those with speech differences through advanced AI technology.',
    accentColor: COLORS.royalBlue,
    orbTint: COLORS.orbBlue,
  },
  {
    id: 'understand',
    image: require('../../assets/images/slide_speech.png'),
    tag: 'AI-POWERED',
    title: 'We Understand',
    highlightedTitle: 'Every Voice',
    description: 'Advanced AI that accurately interprets nasal and lisp speech patterns with remarkable precision.',
    accentColor: COLORS.teal,
    orbTint: COLORS.orbTeal,
  },
  {
    id: 'correction',
    image: require('../../assets/images/slide_correction.png'),
    tag: 'SMART ENGINE',
    title: 'Smart Correction,',
    highlightedTitle: 'Naturally',
    description: 'Intelligent auto-correction powered by contextual understanding for clearer communication.',
    accentColor: COLORS.royalBlue,
    orbTint: COLORS.orbBlue,
  },
  {
    id: 'translation',
    image: require('../../assets/images/slide_translation.png'),
    tag: 'MULTILINGUAL',
    title: 'Real-time',
    highlightedTitle: 'Translation',
    description: 'Seamless English ↔ Tagalog translation in seconds — talk naturally in either language.',
    accentColor: COLORS.teal,
    orbTint: COLORS.orbSand,
  },
  {
    id: 'voice',
    image: require('../../assets/images/slide_voice.png'),
    tag: 'VOICE ENGINE',
    title: 'Natural Voice,',
    highlightedTitle: 'Crystal Clear',
    description: 'Crystal-clear, natural-sounding speech output in both English and Tagalog.',
    accentColor: COLORS.royalBlue,
    orbTint: COLORS.orbTeal,
  },
];

// ─── Orb Configs ─────────────────────────────────────────────────
const ORB_CONFIGS = [
  { size: 90, color: `${COLORS.orbBlue}40`, xFn: () => -20,        yFn: (h: number) => h * 0.08, delay: 300,  duration: 4000, driftX: 20,  driftY: 15 },
  { size: 60, color: `${COLORS.orbTeal}35`, xFn: (w: number) => w - 70, yFn: (h: number) => h * 0.15, delay: 600,  duration: 3500, driftX: -15, driftY: 18 },
  { size: 45, color: `${COLORS.orbSand}50`, xFn: (w: number) => w * 0.3, yFn: (h: number) => h * 0.04, delay: 900,  duration: 5000, driftX: 12,  driftY: 10 },
  { size: 35, color: `${COLORS.tealLight}20`, xFn: (w: number) => w * 0.6, yFn: (h: number) => h * 0.65, delay: 1200, duration: 4500, driftX: -10, driftY: 12 },
] as const;

// ─── Floating Orb ────────────────────────────────────────────────
const sinEase = Easing.inOut(Easing.sin);

const FloatingOrb = React.memo<{
  size: number; color: string; initialX: number; initialY: number;
  delay: number; duration: number; driftX: number; driftY: number;
}>(({ size, color, initialX, initialY, delay, duration, driftX, driftY }) => {
  const anims = useRef({
    tx: new Animated.Value(0),
    ty: new Animated.Value(0),
    scale: new Animated.Value(0.8),
    opacity: new Animated.Value(0),
  }).current;

  useEffect(() => {
    const drift = (val: Animated.Value, to: number, dur: number) =>
      Animated.timing(val, { toValue: to, duration: dur, easing: sinEase, useNativeDriver: true });

    // Fade-in entry
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(anims.opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.spring(anims.scale, { toValue: 1, tension: 12, friction: 6, useNativeDriver: true }),
      ]),
    ]).start();

    // Continuous drift loop
    const timer = setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.parallel([drift(anims.tx, driftX, duration), drift(anims.ty, -driftY, duration * 0.8)]),
          Animated.parallel([drift(anims.tx, -driftX * 0.7, duration * 1.1), drift(anims.ty, driftY * 0.6, duration)]),
          Animated.parallel([drift(anims.tx, 0, duration * 0.9), drift(anims.ty, 0, duration * 1.05)]),
        ])
      ).start();
    }, delay);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute', left: initialX, top: initialY,
        width: size, height: size, borderRadius: size / 2,
        backgroundColor: color, opacity: anims.opacity,
        transform: [{ translateX: anims.tx }, { translateY: anims.ty }, { scale: anims.scale }],
      }}
    />
  );
});

// ─── Main Component ──────────────────────────────────────────────
const StartUpScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { width, height } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<any>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

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

  // Helper: create scroll-linked interpolation
  const interp = useCallback(
    (index: number, out: [number, number, number]) =>
      scrollX.interpolate({
        inputRange: [(index - 1) * width, index * width, (index + 1) * width],
        outputRange: out,
        extrapolate: 'clamp',
      }),
    [scrollX, width],
  );

  const renderSlide = useCallback(({ item, index }: { item: Slide; index: number }) => {
    const isWelcome = item.id === 'welcome';

    return (
      <YStack w={width} h={height * 0.74} jc="center" ai="center" px="$6">
        <Animated.View style={{
          opacity: interp(index, [0, 1, 0]),
          transform: [{ scale: interp(index, [0.92, 1, 0.92]) }],
          width: '100%', maxWidth: 340,
        }}>
          <Card br={28} padding="$5" ai="center" bg={COLORS.white}
            elevation={8} shadowColor="rgba(15, 40, 71, 0.06)" bw={1} bc={COLORS.sandMid} ov="hidden">
            {/* Header Tag */}
            <XStack ai="center" py="$1" px="$2.5" br={16} bg={`${item.accentColor}08`} mb="$3" gap="$1.5">
              <Circle size={4} bg={item.accentColor} />
              <SizableText size="$1" fow="700" ls={1.2} tt="uppercase" color={item.accentColor}>{item.tag}</SizableText>
            </XStack>

            {/* Illustration */}
            <YStack ai="center" jc="center" h={140} mb="$3">
              <Circle pos="absolute" size={115} bg={item.orbTint} opacity={0.3} />
              <Animated.View style={{ transform: [{ translateY: interp(index, [15, 0, 15]) }] }}>
                <RNImage
                  source={item.image}
                  style={{ width: isWelcome ? 160 : 140, height: isWelcome ? 80 : 115 }}
                  resizeMode="contain"
                />
              </Animated.View>
            </YStack>

            {/* Text Content */}
            <Animated.View style={{ transform: [{ translateY: interp(index, [25, 0, 25]) }], width: '100%', alignItems: 'center' }}>
              <SizableText size="$5" fow="800" color={COLORS.textDark} ta="center" lh={22} mb="$1.5" ls={-0.2}>
                {item.title}
                {item.highlightedTitle && (
                  <SizableText color={item.accentColor}>{'\n'}{item.highlightedTitle}</SizableText>
                )}
              </SizableText>

              <XStack ai="center" gap="$1" mb="$2.5" opacity={0.25}>
                <YStack w={14} h={1} bg={item.accentColor} />
                <Speaker size={8} color={item.accentColor} />
                <YStack w={14} h={1} bg={item.accentColor} />
              </XStack>

              <SizableText size="$2" color={COLORS.textMid} ta="center" lh={16} fow="400" maxWidth="90%">
                {item.description}
              </SizableText>
            </Animated.View>

            <YStack pos="absolute" b={0} l={0} r={0} h={3} bg={item.accentColor} />
          </Card>
        </Animated.View>
      </YStack>
    );
  }, [width, height, interp]);

  // Scroll event handler (stable ref)
  const onScroll = useMemo(
    () => Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false }),
    [scrollX],
  );

  // Pagination dots
  const Pagination = useCallback(() => (
    <XStack jc="center" ai="center" mb="$4" gap="$1.5">
      {slides.map((_, i) => (
        <Animated.View key={i} style={{
          height: 4, borderRadius: 2, backgroundColor: 'white',
          width: interp(i, [6, 22, 6]),
          opacity: interp(i, [0.3, 1, 0.3]),
        }} />
      ))}
    </XStack>
  ), [interp]);

  return (
    <YStack f={1} bg={COLORS.white}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Floating Background Orbs */}
      {ORB_CONFIGS.map((orb, i) => (
        <FloatingOrb
          key={i}
          size={orb.size}
          color={orb.color}
          initialX={orb.xFn(width)}
          initialY={orb.yFn(height)}
          delay={orb.delay}
          duration={orb.duration}
          driftX={orb.driftX}
          driftY={orb.driftY}
        />
      ))}

      {/* Skip Button */}
      <AnimatePresence>
        {!isLastSlide && (
          <Button
            pos="absolute" t={50} r={16} zIndex={20} br={16}
            bg="rgba(255,255,255,0.7)" onPress={handleSkip}
            pressStyle={{ scale: 0.95, opacity: 0.7 }}
            elevation={1} bw={1} bc={COLORS.sandMid} px="$3" h={28}
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
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ alignItems: 'flex-start' }}
        style={{ paddingTop: height * 0.05 }}
      />

      {/* Bottom Section */}
      <YStack pos="absolute" b={0} l={0} r={0} h={height * 0.26}>
        <YStack pos="absolute" t={-55} l={0} r={0} h={60} zIndex={1}>
          <Svg height="100%" width="100%" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <Path fill={COLORS.royalBlue} d={WAVE_PATH} />
          </Svg>
        </YStack>

        <YStack f={1} bg={COLORS.royalBlue} px="$8" pb={height * 0.035} jc="center" ai="center">
          <SizableText color="white" opacity={0.4} size="$1" fow="600" ls={1.5} tt="uppercase" mb="$1.5">
            {`${activeIndex + 1} of ${slides.length}`}
          </SizableText>

          <Pagination />

          <Button
            bg="white" h={50} w="100%" maxWidth={280} br={25}
            onPress={handleNext} pressStyle={{ scale: 0.98, opacity: 0.9 }} elevation={4}
            iconAfter={isLastSlide
              ? <ArrowRight size={16} color={COLORS.royalBlue} />
              : <ChevronRight size={16} color={COLORS.royalBlue} />
            }
          >
            <SizableText color={COLORS.royalBlue} fow="800" size="$2" ls={0.8}>CONTINUE</SizableText>
          </Button>
        </YStack>
      </YStack>
    </YStack>
  );
};

export default StartUpScreen;