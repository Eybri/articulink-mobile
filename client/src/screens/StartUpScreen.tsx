import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  StatusBar,
  Image,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { ArrowRight, ChevronRight } from 'lucide-react-native';

// ─── Brand Palette ───────────────────────────────────────────────
// Warm cream base — navy logo pops cleanly, professional & approachable
const COLORS = {
  // Backgrounds
  cream: '#FAF8F4',
  warmWhite: '#F5F1EA',
  sandLight: '#EDE8DF',
  sandMid: '#DDD6C8',

  // Brand blues
  deepNavy: '#0F2847',
  royalBlue: '#1A4480',
  mediumBlue: '#2A5FA8',

  // Warm teal accent
  teal: '#2A8FA0',
  tealLight: '#3DAFC4',

  // Soft orb tints (very pale — background depth only)
  orbBlue: '#C8D8EE',
  orbTeal: '#BEE4EC',
  orbSand: '#E8E0D0',

  // Text
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
    <Animated.View style={[styles.waveformContainer, { opacity, transform: [{ translateY }] }]}>
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
      <View style={{
        position: 'absolute',
        top: size * 0.15, left: size * 0.15,
        width: size * 0.7, height: size * 0.7,
        borderRadius: size * 0.35,
        backgroundColor: COLORS.white,
        opacity: 0.35,
      }} />
    </Animated.View>
  );
};

// ─── Main Component ───────────────────────────────────────────────
const StartUpScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { width, height } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
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

  // ─── Render slide ─────────────────────────────────────────────
  const renderSlide = ({ item, index }: { item: Slide; index: number }) => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
    const isWelcome = item.id === 'welcome';

    const cardOpacity = scrollX.interpolate({ inputRange, outputRange: [0, 1, 0], extrapolate: 'clamp' });
    const cardTranslateY = scrollX.interpolate({ inputRange, outputRange: [70, 0, 70], extrapolate: 'clamp' });
    const cardScale = scrollX.interpolate({ inputRange, outputRange: [0.84, 1, 0.84], extrapolate: 'clamp' });
    const orbs = orbData[index];

    return (
      <View style={{ width, height, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>

        {/* Warm cream base */}
        <View style={[StyleSheet.absoluteFill, { backgroundColor: COLORS.cream }]} />

        {/* Warm sand bloom — top right */}
        <View style={{
          position: 'absolute', top: -height * 0.1, right: -width * 0.15,
          width: width * 0.95, height: width * 0.95, borderRadius: width * 0.475,
          backgroundColor: COLORS.sandLight, opacity: 0.55,
        }} />

        {/* Warm sand swell — bottom left */}
        <View style={{
          position: 'absolute', bottom: -height * 0.06, left: -width * 0.2,
          width: width * 0.8, height: width * 0.8, borderRadius: width * 0.4,
          backgroundColor: COLORS.sandMid, opacity: 0.22,
        }} />

        {/* Tinted soft orbs */}
        {orbs.map((orb, i) => <SoftOrb key={i} {...orb} />)}

        {/* Subtle dot grid */}
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {Array.from({ length: 9 }).map((_, row) =>
            Array.from({ length: 6 }).map((_, col) => (
              <View key={`${row}-${col}`} style={{
                position: 'absolute',
                width: 2, height: 2, borderRadius: 1,
                backgroundColor: item.accentColor,
                opacity: 0.055,
                left: (width / 6) * col + (width / 12),
                top: (height / 9) * row + (height / 18),
              }} />
            ))
          )}
        </View>

        {/* Corner bracket — top left */}
        <View style={{
          position: 'absolute', top: 58, left: 22, width: 34, height: 34,
          borderTopWidth: 1.5, borderLeftWidth: 1.5,
          borderColor: `${item.accentColor}28`, borderTopLeftRadius: 6,
        }} />

        {/* Corner bracket — bottom right */}
        <View style={{
          position: 'absolute', bottom: 118, right: 22, width: 34, height: 34,
          borderBottomWidth: 1.5, borderRightWidth: 1.5,
          borderColor: `${item.waveColor}28`, borderBottomRightRadius: 6,
        }} />

        {/* ── White card ── */}
        <Animated.View style={[
          styles.card,
          {
            opacity: cardOpacity,
            transform: [{ translateY: cardTranslateY }, { scale: cardScale }],
            width: width - 40,
            maxWidth: 440,
          }
        ]}>
          {/* Subtle top accent glow */}
          <View style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 65,
            backgroundColor: `${item.accentColor}07`,
            borderTopLeftRadius: 28, borderTopRightRadius: 28,
          }} />

          {/* Image + soft halo */}
          <View style={styles.imageWrapper}>
            <View style={[styles.imageHalo, { backgroundColor: item.orbTint }]} />
            <Image
              source={item.image}
              style={isWelcome
                ? styles.logoImage
                : [styles.slideImage, {
                  width: Math.min(width * 0.52, 230),
                  height: Math.min(width * 0.38, 170),
                }]
              }
              resizeMode="contain"
            />
          </View>

          {/* Tag pill */}
          <View style={[styles.tagPill, {
            borderColor: `${item.accentColor}20`,
            backgroundColor: `${item.accentColor}0C`,
          }]}>
            <View style={[styles.tagDot, { backgroundColor: item.accentColor }]} />
            <Text style={[styles.tag, { color: item.accentColor }]}>{item.tag}</Text>
          </View>

          {/* Title */}
          {isWelcome ? (
            <Text style={styles.cardTitle}>
              {item.title}{'\n'}
              <Text style={{ color: item.accentColor }}>{item.highlightedTitle}</Text>
            </Text>
          ) : (
            <Text style={styles.cardTitle}>
              {item.title}
              {item.highlightedTitle
                ? <Text style={{ color: item.accentColor }}>{'\n'}{item.highlightedTitle}</Text>
                : null}
            </Text>
          )}

          {/* Divider with mini waveform */}
          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: COLORS.sandMid }]} />
            {[5, 9, 15, 9, 5].map((h, i) => (
              <View key={i} style={{
                width: 3, height: h, borderRadius: 1.5,
                backgroundColor: item.waveColor, opacity: 0.45,
                marginHorizontal: 1.5,
              }} />
            ))}
            <View style={[styles.dividerLine, { backgroundColor: COLORS.sandMid }]} />
          </View>

          <Text style={styles.cardDescription}>{item.description}</Text>

          {/* Bottom accent bar */}
          <View style={[styles.cardBottomBar, { backgroundColor: item.accentColor }]} />
        </Animated.View>

        {/* Waveform below card */}
        <WaveformDecoration color={item.waveColor} scrollX={scrollX} index={index} width={width} />

      </View>
    );
  };

  // ─── Pagination ──────────────────────────────────────────────
  const Pagination = () => (
    <View style={styles.pagination}>
      {slides.map((slide, i) => {
        const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
        const dotWidth = scrollX.interpolate({ inputRange, outputRange: [7, 32, 7], extrapolate: 'clamp' });
        const dotOpacity = scrollX.interpolate({ inputRange, outputRange: [0.25, 1, 0.25], extrapolate: 'clamp' });
        return (
          <Animated.View key={i} style={[styles.dot, {
            width: dotWidth, opacity: dotOpacity,
            backgroundColor: slide.accentColor,
          }]} />
        );
      })}
    </View>
  );

  const buttonBg = scrollX.interpolate({
    inputRange: slides.map((_, i) => i * width),
    outputRange: slides.map(s => s.accentColor),
    extrapolate: 'clamp',
  });

  // ─── Render ──────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <TouchableOpacity style={styles.skipButton} onPress={handleSkip} activeOpacity={0.7}>
        <View style={[styles.skipInner, { borderColor: `${currentSlide.accentColor}28` }]}>
          <Text style={[styles.skipText, { color: currentSlide.accentColor }]}>Skip</Text>
        </View>
      </TouchableOpacity>

      <Animated.FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={item => item.id}
        renderItem={renderSlide}
        horizontal pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false },
        )}
        scrollEventThrottle={16}
        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
      />

      <View style={styles.bottomSection}>
        <Pagination />
        <Animated.View style={[styles.primaryButton, { backgroundColor: buttonBg }, BTN_SHADOW]}>
          <TouchableOpacity style={styles.primaryButtonInner} onPress={handleNext} activeOpacity={0.88}>
            <View style={styles.buttonShimmer} />
            <Text style={styles.primaryButtonText}>{isLastSlide ? 'Get Started' : 'Continue'}</Text>
            {isLastSlide
              ? <ArrowRight size={20} color={COLORS.white} strokeWidth={2.5} />
              : <ChevronRight size={20} color={COLORS.white} strokeWidth={2.5} />}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

// ─── Styles ──────────────────────────────────────────────────────
const CARD_SHADOW = Platform.select({
  ios: {
    shadowColor: '#8A96A4',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
  },
  android: { elevation: 8 },
}) as any;

const BTN_SHADOW = Platform.select({
  ios: {
    shadowColor: '#1A4480',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
  },
  android: { elevation: 10 },
}) as any;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.cream },

  skipButton: { position: 'absolute', top: 52, right: 20, zIndex: 20 },
  skipInner: {
    paddingVertical: 7, paddingHorizontal: 16,
    borderRadius: 20, borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.75)',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6 },
      android: { elevation: 2 },
    }),
  },
  skipText: { fontSize: 13, fontWeight: '600', letterSpacing: 0.4 },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: COLORS.sandMid,
    paddingVertical: 26, paddingHorizontal: 22,
    alignItems: 'center', overflow: 'hidden',
    ...CARD_SHADOW,
  },
  cardBottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: 3,
    borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
  },

  imageWrapper: { alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  imageHalo: {
    position: 'absolute',
    width: 150, height: 150, borderRadius: 75,
    opacity: 0.5,
  },
  logoImage: { width: 200, height: 96 },
  slideImage: {},

  tagPill: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 5, paddingHorizontal: 12,
    borderRadius: 20, borderWidth: 1,
    marginBottom: 12, gap: 6,
  },
  tagDot: { width: 5, height: 5, borderRadius: 2.5 },
  tag: { fontSize: 10, fontWeight: '800', letterSpacing: 2.2, textTransform: 'uppercase' },

  cardTitle: {
    fontSize: 27, fontWeight: '800',
    color: COLORS.textDark,
    textAlign: 'center', lineHeight: 35,
    marginBottom: 12, letterSpacing: -0.4,
  },

  dividerRow: {
    flexDirection: 'row', alignItems: 'center',
    width: '85%', marginBottom: 12, gap: 4,
  },
  dividerLine: { flex: 1, height: 1 },

  cardDescription: {
    fontSize: 14.5, color: COLORS.textMid,
    textAlign: 'center', lineHeight: 22,
    letterSpacing: 0.15, maxWidth: 290,
  },

  waveformContainer: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18, height: 48,
  },

  bottomSection: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 24, paddingBottom: 44, paddingTop: 8,
  },
  pagination: {
    flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', marginBottom: 18, gap: 7,
  },
  dot: { height: 7, borderRadius: 3.5 },

  primaryButton: { borderRadius: 16, overflow: 'hidden' },
  primaryButtonInner: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', paddingVertical: 18, gap: 8,
  },
  buttonShimmer: {
    position: 'absolute', top: 0, left: 0,
    width: '45%', height: '100%',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderBottomRightRadius: 80,
  },
  primaryButtonText: {
    color: COLORS.white, fontSize: 17,
    fontWeight: '700', letterSpacing: 0.3,
  },
});

export default StartUpScreen;