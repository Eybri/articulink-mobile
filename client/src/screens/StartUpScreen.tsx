import React, { useState, useRef, useCallback, useMemo } from 'react';
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

// ─── Animated Background Layer ──────────────────────────────────
const MorphingBackground = ({ scrollX, width, height }: { scrollX: Animated.Value, width: number, height: number }) => {
  // Interpolate main background color based on scrollX
  const bgColor = scrollX.interpolate({
    inputRange: slides.map((_, i) => i * width),
    outputRange: slides.map(s => s.orbTint),
    extrapolate: 'clamp',
  });

  return (
    <ZStack pos="absolute" fullscreen pointerEvents="none" zIndex={-1}>
      <Animated.View style={{ 
        position: 'absolute', 
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: COLORS.cream 
      }} />
      
      {/* Morphing Orbs that follow scroll with parallax */}
      <Animated.View style={{
        position: 'absolute',
        width: width * 1.5,
        height: width * 1.5,
        borderRadius: width * 0.75,
        backgroundColor: bgColor,
        opacity: 0.15,
        top: -width * 0.4,
        right: -width * 0.3,
        transform: [
          { translateX: Animated.multiply(scrollX, -0.2) },
          { scale: 1.1 }
        ]
      }} />

      <Animated.View style={{
        position: 'absolute',
        width: width * 1.2,
        height: width * 1.2,
        borderRadius: width * 0.6,
        backgroundColor: bgColor,
        opacity: 0.1,
        bottom: -width * 0.3,
        left: -width * 0.3,
        transform: [
          { translateX: Animated.multiply(scrollX, 0.1) },
          { scale: 0.9 }
        ]
      }} />

      {/* Decorative Dots Pattern */}
      <YStack fullscreen opacity={0.03}>
         {Array.from({ length: 12 }).map((_, row) => (
           <XStack key={row} jc="space-around" w="100%" h={height / 12}>
             {Array.from({ length: 8 }).map((_, col) => (
               <Circle key={col} size={4} bg={COLORS.deepNavy} />
             ))}
           </XStack>
         ))}
      </YStack>
    </ZStack>
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

  const onMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      setActiveIndex(Math.round(e.nativeEvent.contentOffset.x / width));
    }, [width],
  );

  const handleNext = useCallback(() => {
    if (isLastSlide) {
      navigation.navigate('Login');
    } else {
      const next = activeIndex + 1;
      flatListRef.current?.scrollToIndex({ index: next, animated: true });
      setActiveIndex(next);
    }
  }, [activeIndex, isLastSlide, navigation]);

  const handleSkip = useCallback(() => navigation.navigate('Login'), [navigation]);

  const renderSlide = ({ item, index }: { item: Slide; index: number }) => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
    const isWelcome = item.id === 'welcome';
    
    // Smooth scroll-linked animations
    const cardOpacity = scrollX.interpolate({ inputRange, outputRange: [0, 1, 0], extrapolate: 'clamp' });
    const cardScale = scrollX.interpolate({ inputRange, outputRange: [0.9, 1, 0.9], extrapolate: 'clamp' });
    const imageTranslateY = scrollX.interpolate({ inputRange, outputRange: [20, 0, 20], extrapolate: 'clamp' });
    const contentTranslateY = scrollX.interpolate({ inputRange, outputRange: [40, 0, 40], extrapolate: 'clamp' });

    return (
      <YStack w={width} h={height} jc="center" ai="center" px="$6">
        <Animated.View style={{
          opacity: cardOpacity,
          transform: [{ scale: cardScale }],
          width: '100%',
          maxWidth: 340,
        }}>
          <Card 
            br={24} 
            padding="$5" 
            ai="center" 
            bg={COLORS.white} 
            elevation={6} 
            shadowColor="rgba(15, 40, 71, 0.08)"
            bw={1}
            bc={COLORS.sandMid}
            ov="hidden"
          >
            {/* Header Tag */}
            <XStack 
              ai="center" 
              py="$1" 
              px="$2.5" 
              br={16} 
              bg={`${item.accentColor}08`} 
              mb="$4" 
              gap="$1.5"
            >
              <Circle size={4} bg={item.accentColor} />
              <SizableText 
                size="$1" 
                fow="700" 
                ls={1.2} 
                tt="uppercase" 
                color={item.accentColor}
              >
                {item.tag}
              </SizableText>
            </XStack>

            {/* Illustration */}
            <YStack ai="center" jc="center" h={160} mb="$4">
               <Circle pos="absolute" size={130} bg={item.orbTint} opacity={0.35} />
               <Animated.View style={{ transform: [{ translateY: imageTranslateY }] }}>
                  <RNImage
                    source={item.image}
                    style={{
                      width: isWelcome ? 180 : 160,
                      height: isWelcome ? 90 : 130,
                    }}
                    resizeMode="contain"
                  />
               </Animated.View>
            </YStack>

            {/* Text Content */}
            <Animated.View style={{ transform: [{ translateY: contentTranslateY }], width: '100%', alignItems: 'center' }}>
              <SizableText 
                size="$6" 
                fow="800" 
                color={COLORS.textDark} 
                ta="center" 
                lh={24} 
                mb="$2"
                ls={-0.2}
              >
                {item.title}
                {item.highlightedTitle && (
                  <SizableText color={item.accentColor}>{'\n'}{item.highlightedTitle}</SizableText>
                )}
              </SizableText>

              {/* Decorative Accent */}
              <XStack ai="center" gap="$1" mb="$3" opacity={0.3}>
                <YStack w={16} h={1} bg={item.accentColor} />
                <Speaker size={10} color={item.accentColor} />
                <YStack w={16} h={1} bg={item.accentColor} />
              </XStack>

              <SizableText 
                size="$3" 
                color={COLORS.textMid} 
                ta="center" 
                lh={18} 
                fow="400"
                maxWidth="90%"
              >
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

  const Pagination = () => (
    <XStack jc="center" ai="center" mb="$4" gap="$1.5">
      {slides.map((slide, i) => {
        const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
        const dotWidth = scrollX.interpolate({ inputRange, outputRange: [5, 20, 5], extrapolate: 'clamp' });
        const dotOpacity = scrollX.interpolate({ inputRange, outputRange: [0.2, 1, 0.2], extrapolate: 'clamp' });
        return (
          <Animated.View key={i} style={{
            height: 5, 
            borderRadius: 2.5,
            width: dotWidth, 
            opacity: dotOpacity,
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

      {/* Floating Morphing Background */}
      <MorphingBackground scrollX={scrollX} width={width} height={height} />

      {/* Skip Button */}
      <AnimatePresence>
        {!isLastSlide && (
          <Button
            pos="absolute" t={50} r={16} zIndex={20}
            br={16} 
            bg="rgba(255,255,255,0.6)"
            onPress={handleSkip}
            pressStyle={{ scale: 0.95 }}
            animation="quick"
            enterStyle={{ opacity: 0, y: -5 }}
            exitStyle={{ opacity: 0, y: -5 }}
            elevation={1}
            bw={1}
            bc={COLORS.sandMid}
            px="$3"
            h={30}
          >
            <SizableText size="$1" fow="600" ls={0.4} color={currentSlide.accentColor}>SKIP</SizableText>
          </Button>
        )}
      </AnimatePresence>

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

      <YStack pos="absolute" b={0} l={0} r={0} px="$10" pb="$8">
        <Pagination />
        
        <Animated.View style={{ 
          borderRadius: 12, 
          overflow: 'hidden', 
          backgroundColor: buttonBg,
          elevation: 3,
        }}>
           <Button
            bg="transparent"
            h={50}
            onPress={handleNext}
            pressStyle={{ scale: 0.98, opacity: 0.85 }}
            iconAfter={
              <XStack animation="bouncy" x={0} enterStyle={{ x: 3, opacity: 0 }}>
                {isLastSlide ? <ArrowRight size={16} color="white" /> : <ChevronRight size={16} color="white" />}
              </XStack>
            }
           >
            <SizableText color="white" fow="700" size="$3" ls={0.2}>
              {isLastSlide ? 'Get Started' : 'Continue'}
            </SizableText>
           </Button>
        </Animated.View>
      </YStack>


    </YStack>
  );
};

export default StartUpScreen;