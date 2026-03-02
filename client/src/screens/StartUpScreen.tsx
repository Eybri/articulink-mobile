import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
  Image,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Platform,
} from 'react-native';
import {
  ArrowRight,
  ChevronRight,
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

// ─── Brand Palette ───────────────────────────────────────────────
const COLORS = {
  deepNavy: '#0F2F5F',
  royalBlue: '#1E4E8C',
  tealBlue: '#1F6F8B',
  softAqua: '#4FA7B8',
  lightGray: '#F2F4F7',
  darkSlate: '#1C2A39',
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
  orbColors: [string, string];
  bgFrom: string;
  bgTo: string;
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
    orbColors: [COLORS.royalBlue, COLORS.softAqua],
    bgFrom: '#E8EEF7',
    bgTo: '#D6E8F0',
  },
  {
    id: 'understand',
    image: require('../../assets/images/slide_speech.png'),
    tag: 'AI-POWERED',
    title: 'We Understand You',
    description:
      'Advanced AI that accurately interprets nasal and lisp speech patterns with remarkable precision.',
    accentColor: COLORS.royalBlue,
    orbColors: [COLORS.royalBlue, COLORS.tealBlue],
    bgFrom: '#E6EDF8',
    bgTo: '#D4E5F2',
  },
  {
    id: 'correction',
    image: require('../../assets/images/slide_correction.png'),
    tag: 'SMART ENGINE',
    title: 'Smart Correction',
    description:
      'Intelligent auto-correction powered by contextual understanding for clearer communication.',
    accentColor: COLORS.tealBlue,
    orbColors: [COLORS.tealBlue, COLORS.softAqua],
    bgFrom: '#E4EEF2',
    bgTo: '#D2E8EC',
  },
  {
    id: 'translation',
    image: require('../../assets/images/slide_translation.png'),
    tag: 'MULTILINGUAL',
    title: 'Real-time Translation',
    description:
      'Seamless English ↔ Tagalog translation in seconds — talk naturally in either language.',
    accentColor: COLORS.deepNavy,
    orbColors: [COLORS.deepNavy, COLORS.royalBlue],
    bgFrom: '#E2E9F4',
    bgTo: '#CDD8ED',
  },
  {
    id: 'voice',
    image: require('../../assets/images/slide_voice.png'),
    tag: 'VOICE ENGINE',
    title: 'Natural Voice Output',
    description:
      'Crystal-clear, natural-sounding speech output in both English and Tagalog.',
    accentColor: COLORS.softAqua,
    orbColors: [COLORS.softAqua, COLORS.tealBlue],
    bgFrom: '#E2EFF3',
    bgTo: '#D0E9EF',
  },
];

// ─── Floating Particle ──────────────────────────────────────────
interface ParticleProps {
  color: string;
  size: number;
  x: number;
  y: number;
  duration: number;
  delay: number;
}

const FloatingParticle: React.FC<ParticleProps> = ({ color, size, x, y, duration, delay }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1, duration, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -18] });
  const opacity = anim.interpolate({ inputRange: [0, 0.3, 0.7, 1], outputRange: [0, 0.5, 0.5, 0] });
  const scale = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.6, 1, 0.6] });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity,
        transform: [{ translateY }, { scale }],
      }}
    />
  );
};

// ─── Particle configs per slide ─────────────────────────────────
const PARTICLE_SETS = slides.map((slide, idx) => {
  const seed = idx * 7;
  return Array.from({ length: 9 }, (_, i) => ({
    key: i,
    color: i % 2 === 0 ? slide.orbColors[0] : slide.orbColors[1],
    size: 4 + ((i * 3 + seed) % 7),
    x: ((i * 67 + seed * 13) % (width - 60)) + 20,
    y: ((i * 89 + seed * 17) % (height * 0.6 - 30)) + 20,
    duration: 2200 + ((i * 300 + seed * 100) % 1800),
    delay: (i * 250 + seed * 50) % 1500,
  }));
});

// ─── Component ───────────────────────────────────────────────────
const StartUpScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const isLastSlide = activeIndex === slides.length - 1;

  const onMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(e.nativeEvent.contentOffset.x / width);
      setActiveIndex(index);
    },
    [],
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

  const handleSkip = useCallback(() => {
    navigation.navigate('Login');
  }, [navigation]);

  // ─── Render one slide ──────────────────────────────────────────
  const renderSlide = ({ item, index }: { item: Slide; index: number }) => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width,
    ];

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0, 1, 0],
      extrapolate: 'clamp',
    });

    const translateY = scrollX.interpolate({
      inputRange,
      outputRange: [60, 0, 60],
      extrapolate: 'clamp',
    });

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.88, 1, 0.88],
      extrapolate: 'clamp',
    });

    const isWelcome = item.id === 'welcome';
    const particles = PARTICLE_SETS[index];

    return (
      <View style={styles.slide}>

        {/* ── Layered background ── */}
        <View style={[styles.bgBase, { backgroundColor: item.bgFrom }]} />
        <View style={[styles.bgOverlay, { backgroundColor: item.bgTo }]} />

        {/* Large soft-glow orbs */}
        <View style={[styles.depthOrbA, { backgroundColor: item.orbColors[0] }]} />
        <View style={[styles.depthOrbB, { backgroundColor: item.orbColors[1] }]} />

        {/* Concentric rings */}
        <View style={[styles.ringOuter, { borderColor: `${item.accentColor}18` }]}>
          <View style={[styles.ringInner, { borderColor: `${item.accentColor}0E` }]} />
        </View>

        {/* Subtle grid */}
        <View style={styles.gridOverlay} pointerEvents="none">
          {Array.from({ length: 7 }).map((_, i) => (
            <View key={`v${i}`} style={[styles.gridLineV, { left: (width / 7) * i, backgroundColor: `${item.accentColor}07` }]} />
          ))}
          {Array.from({ length: 10 }).map((_, i) => (
            <View key={`h${i}`} style={[styles.gridLineH, { top: (height * 0.73 / 10) * i, backgroundColor: `${item.accentColor}07` }]} />
          ))}
        </View>

        {/* Floating particles */}
        {particles.map(({ key, ...p }) => <FloatingParticle key={key} {...p} />)}

        {/* Diamond accents */}
        <View style={[styles.diamond, styles.diamondTopRight, { backgroundColor: `${item.accentColor}15`, borderColor: `${item.accentColor}22` }]} />
        <View style={[styles.diamond, styles.diamondBottomLeft, { backgroundColor: `${item.orbColors[1]}12`, borderColor: `${item.orbColors[1]}18` }]} />

        {/* ── Card ── */}
        <Animated.View
          style={[
            styles.card,
            {
              opacity,
              transform: [{ translateY }, { scale }],
              borderColor: `${item.accentColor}22`,
            },
          ]}
        >
          {/* Inner glow top */}
          <View style={[styles.cardGlowTop, { backgroundColor: `${item.accentColor}08` }]} />

          <Image
            source={item.image}
            style={isWelcome ? styles.logoImage : styles.slideImage}
            resizeMode="contain"
          />

          {/* Divider with center dot */}
          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: `${item.accentColor}20` }]} />
            <View style={[styles.dividerDot, { backgroundColor: item.accentColor }]} />
            <View style={[styles.dividerLine, { backgroundColor: `${item.accentColor}20` }]} />
          </View>

          <Text style={[styles.tag, { color: item.accentColor }]}>{item.tag}</Text>

          {isWelcome ? (
            <Text style={styles.cardTitle}>
              {item.title}{'\n'}
              <Text style={{ color: item.accentColor }}>{item.highlightedTitle}</Text>
            </Text>
          ) : (
            <Text style={styles.cardTitle}>{item.title}</Text>
          )}

          <Text style={styles.cardDescription}>{item.description}</Text>

          {/* Bottom accent bar */}
          <View style={[styles.cardBottomBar, { backgroundColor: `${item.accentColor}14` }]} />
        </Animated.View>

        {/* Ground shadow blob beneath card */}
        <View style={[styles.cardGroundShadow, { backgroundColor: `${item.accentColor}0C` }]} />
      </View>
    );
  };

  // ─── Pagination ──────────────────────────────────────────────
  const Pagination = () => (
    <View style={styles.pagination}>
      {slides.map((_, i) => {
        const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
        const dotWidth = scrollX.interpolate({ inputRange, outputRange: [8, 32, 8], extrapolate: 'clamp' });
        const dotOpacity = scrollX.interpolate({ inputRange, outputRange: [0.25, 1, 0.25], extrapolate: 'clamp' });
        const dotColor = scrollX.interpolate({ inputRange, outputRange: [COLORS.softAqua, slides[i].accentColor, COLORS.softAqua], extrapolate: 'clamp' });
        return (
          <Animated.View key={i} style={[styles.dot, { width: dotWidth, opacity: dotOpacity, backgroundColor: dotColor }]} />
        );
      })}
    </View>
  );

  // ─── Main Render ─────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.lightGray} translucent={false} />

      <TouchableOpacity style={styles.skipButton} onPress={handleSkip} activeOpacity={0.7}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <Animated.FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={(item) => item.id}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
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
        <TouchableOpacity style={styles.primaryButton} onPress={handleNext} activeOpacity={0.9}>
          <View style={styles.buttonShimmer} />
          <Text style={styles.primaryButtonText}>{isLastSlide ? 'Get Started' : 'Next'}</Text>
          {isLastSlide ? <ArrowRight size={20} color={COLORS.white} /> : <ChevronRight size={20} color={COLORS.white} />}
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ─── Styles ──────────────────────────────────────────────────────
const CARD_SHADOW = Platform.select({
  ios: {
    shadowColor: '#1E4E8C',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.13,
    shadowRadius: 28,
  },
  android: { elevation: 14 },
}) as any;

const BTN_SHADOW = Platform.select({
  ios: {
    shadowColor: COLORS.royalBlue,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
  },
  android: { elevation: 10 },
}) as any;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.lightGray },

  // Background
  bgBase: { ...StyleSheet.absoluteFillObject },
  bgOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: height * 0.45, opacity: 0.5 },

  // Depth orbs
  depthOrbA: {
    position: 'absolute',
    width: width * 1.1, height: width * 1.1,
    borderRadius: (width * 1.1) / 2,
    top: -width * 0.45, right: -width * 0.35,
    opacity: 0.13,
  },
  depthOrbB: {
    position: 'absolute',
    width: width * 0.75, height: width * 0.75,
    borderRadius: (width * 0.75) / 2,
    bottom: height * 0.04, left: -width * 0.25,
    opacity: 0.1,
  },

  // Rings
  ringOuter: {
    position: 'absolute',
    width: width * 1.3, height: width * 1.3,
    borderRadius: (width * 1.3) / 2,
    borderWidth: 1,
    top: -(width * 1.3) / 2 + height * 0.2,
    left: -(width * 0.15),
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringInner: {
    width: width * 0.9, height: width * 0.9,
    borderRadius: (width * 0.9) / 2,
    borderWidth: 1,
  },

  // Grid
  gridOverlay: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  gridLineV: { position: 'absolute', width: 1, top: 0, bottom: 0 },
  gridLineH: { position: 'absolute', height: 1, left: 0, right: 0 },

  // Diamonds
  diamond: { position: 'absolute', width: 28, height: 28, borderWidth: 1, transform: [{ rotate: '45deg' }], borderRadius: 4 },
  diamondTopRight: { top: height * 0.08, right: 32 },
  diamondBottomLeft: { bottom: height * 0.06, left: 28 },

  // Skip
  skipButton: {
    position: 'absolute', top: 52, right: 24, zIndex: 10,
    paddingVertical: 8, paddingHorizontal: 18, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.75)',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
      android: { elevation: 3 },
    }),
  },
  skipText: { fontSize: 14, fontWeight: '600', color: COLORS.royalBlue, letterSpacing: 0.4 },

  // Slide
  slide: { width, height: height * 0.73, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24, overflow: 'hidden' },

  // Card
  card: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 28, borderWidth: 1.5,
    paddingVertical: 28, paddingHorizontal: 24,
    width: '100%', alignItems: 'center', overflow: 'hidden',
    ...CARD_SHADOW,
  },
  cardGlowTop: { position: 'absolute', top: 0, left: 0, right: 0, height: 60, borderTopLeftRadius: 28, borderTopRightRadius: 28 },
  cardBottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 4 },
  cardGroundShadow: { position: 'absolute', bottom: 18, left: 48, right: 48, height: 22, borderRadius: 50, zIndex: -1 },

  // Images
  slideImage: { width: width * 0.55, height: width * 0.4, marginBottom: 16 },
  logoImage: { width: 200, height: 110, marginBottom: 16 },

  // Divider
  dividerRow: { flexDirection: 'row', alignItems: 'center', width: '80%', marginBottom: 18, gap: 8 },
  dividerLine: { flex: 1, height: 1 },
  dividerDot: { width: 5, height: 5, borderRadius: 3, opacity: 0.65 },

  // Text
  tag: { fontSize: 11, fontWeight: '800', letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: 10 },
  cardTitle: { fontSize: 26, fontWeight: '800', color: COLORS.darkSlate, textAlign: 'center', lineHeight: 34, marginBottom: 12, letterSpacing: -0.3 },
  cardDescription: { fontSize: 15, color: COLORS.darkSlate, opacity: 0.6, textAlign: 'center', lineHeight: 23, letterSpacing: 0.15, maxWidth: 300, marginBottom: 4 },

  // Bottom
  bottomSection: { paddingHorizontal: 24, paddingBottom: 40, paddingTop: 8, backgroundColor: COLORS.lightGray },

  // Pagination
  pagination: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 24, gap: 8 },
  dot: { height: 8, borderRadius: 4 },

  // Button
  primaryButton: {
    backgroundColor: COLORS.royalBlue,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 18, borderRadius: 16, gap: 6, overflow: 'hidden',
    ...BTN_SHADOW,
  },
  buttonShimmer: { position: 'absolute', top: 0, left: 0, width: '55%', height: '100%', backgroundColor: 'rgba(255,255,255,0.08)', borderBottomRightRadius: 60 },
  primaryButtonText: { color: COLORS.white, fontSize: 17, fontWeight: '700', letterSpacing: 0.3 },
});

export default StartUpScreen;