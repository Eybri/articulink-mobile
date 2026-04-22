import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Animated,
  StatusBar,
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
import { COLORS } from './../../../constants/colors';

const WAVE_PATH =
  'M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,144C672,139,768,181,864,202.7C960,224,1056,224,1152,208C1248,192,1344,160,1392,144L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z';

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

    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(anims.opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.spring(anims.scale, { toValue: 1, tension: 12, friction: 6, useNativeDriver: true }),
      ]),
    ]).start();

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

interface StartUpViewProps {
  vm: any;
  slides: any[];
  orbConfigs: any[];
}

export const StartUpView: React.FC<StartUpViewProps> = ({ vm, slides, orbConfigs }) => {
  const renderSlide = useCallback(({ item, index }: { item: any; index: number }) => {
    const isWelcome = item.id === 'welcome';

    return (
      <YStack w={vm.width} h={vm.height * 0.74} jc="center" ai="center" px="$6">
        <Animated.View style={{
          opacity: vm.interp(index, [0, 1, 0]),
          transform: [{ scale: vm.interp(index, [0.92, 1, 0.92]) }],
          width: '100%', maxWidth: 340,
        }}>
          <Card br={28} padding="$5" ai="center" bg={COLORS.white}
            elevation={8} shadowColor="rgba(15, 40, 71, 0.06)" bw={1} bc={COLORS.sandMid} ov="hidden">
            
            <XStack ai="center" py="$1" px="$2.5" br={16} bg={`${item.accentColor}08`} mb="$3" gap="$1.5">
              <Circle size={4} bg={item.accentColor} />
              <SizableText size="$1" fow="700" ls={1.2} tt="uppercase" color={item.accentColor}>{item.tag}</SizableText>
            </XStack>

            <YStack ai="center" jc="center" h={140} mb="$3">
              <Circle pos="absolute" size={115} bg={item.orbTint} opacity={0.3} />
              <Animated.View style={{ transform: [{ translateY: vm.interp(index, [15, 0, 15]) }] }}>
                <RNImage
                  source={item.image}
                  style={{ width: isWelcome ? 160 : 140, height: isWelcome ? 80 : 115 }}
                  resizeMode="contain"
                />
              </Animated.View>
            </YStack>

            <Animated.View style={{ transform: [{ translateY: vm.interp(index, [25, 0, 25]) }], width: '100%', alignItems: 'center' }}>
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
  }, [vm]);

  const PaginationDots = useCallback(() => (
    <XStack jc="center" ai="center" mb="$4" gap="$1.5">
      {slides.map((_, i) => (
        <Animated.View key={i} style={{
          height: 4, borderRadius: 2, backgroundColor: 'white',
          width: vm.interp(i, [6, 22, 6]),
          opacity: vm.interp(i, [0.3, 1, 0.3]),
        }} />
      ))}
    </XStack>
  ), [vm, slides]);

  return (
    <YStack f={1} bg={COLORS.white}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Floating Background Orbs */}
      {orbConfigs.map((orb, i) => (
        <FloatingOrb
          key={i}
          size={orb.size}
          color={orb.color}
          initialX={orb.xFn(vm.width)}
          initialY={orb.yFn(vm.height)}
          delay={orb.delay}
          duration={orb.duration}
          driftX={orb.driftX}
          driftY={orb.driftY}
        />
      ))}

      {/* Skip Button */}
      <AnimatePresence>
        {!vm.isLastSlide && (
          <Button
            pos="absolute" t={50} r={16} zIndex={20} br={16}
            bg="rgba(255,255,255,0.7)" onPress={vm.handleSkip}
            pressStyle={{ scale: 0.95, opacity: 0.7 }}
            elevation={1} bw={1} bc={COLORS.sandMid} px="$3" h={28}
          >
            <SizableText size="$1" fow="600" ls={0.4} color={COLORS.textMid}>SKIP</SizableText>
          </Button>
        )}
      </AnimatePresence>

      <Animated.FlatList
        ref={vm.flatListRef}
        data={slides}
        keyExtractor={item => item.id}
        renderItem={renderSlide}
        horizontal pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={vm.onMomentumScrollEnd}
        onScroll={vm.onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ alignItems: 'flex-start' }}
        style={{ paddingTop: vm.height * 0.05 }}
      />

      {/* Bottom Wave Section */}
      <YStack pos="absolute" b={0} l={0} r={0} h={vm.height * 0.26}>
        <YStack pos="absolute" t={-55} l={0} r={0} h={60} zIndex={1}>
          <Svg height="100%" width="100%" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <Path fill={COLORS.royalBlue} d={WAVE_PATH} />
          </Svg>
        </YStack>

        <YStack f={1} bg={COLORS.royalBlue} px="$8" pb={vm.height * 0.035} jc="center" ai="center">
          <SizableText color="white" opacity={0.4} size="$1" fow="600" ls={1.5} tt="uppercase" mb="$1.5">
            {`${vm.activeIndex + 1} of ${slides.length}`}
          </SizableText>

          <PaginationDots />

          <Button
            bg="white" h={50} w="100%" maxWidth={280} br={25}
            onPress={vm.handleNext} pressStyle={{ scale: 0.98, opacity: 0.9 }} elevation={4}
            iconAfter={vm.isLastSlide
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
