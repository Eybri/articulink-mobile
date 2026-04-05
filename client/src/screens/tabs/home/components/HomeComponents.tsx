import React, { useRef, useEffect } from "react";
import { Animated } from "react-native";
import { XStack, Circle } from "tamagui";
import { COLORS } from "./../../../../constants/colors";

// ─── Soft Orb ─────────────────────────────────────────────────────
interface SoftOrbProps { color: string; size: number; x: number; y: number; duration: number; delay: number; }

export const SoftOrb: React.FC<SoftOrbProps> = ({ color, size, x, y, duration, delay }) => {
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

// ─── Animated Waveform Bars ───────────────────────────────────────
export const AnimatedWaveform: React.FC<{ color: string }> = ({ color }) => {
  const barHeights = [6, 14, 22, 16, 30, 20, 10, 26, 18, 12];
  const barAnims = useRef(barHeights.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const animations = barAnims.map((anim, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 80),
          Animated.timing(anim, { toValue: 1, duration: 500 + (i % 4) * 120, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 500 + (i % 4) * 120, useNativeDriver: true }),
        ])
      )
    );
    animations.forEach(a => a.start());
    return () => animations.forEach(a => a.stop());
  }, []);

  return (
    <XStack ai="flex-end">
      {barHeights.map((h, i) => {
        const scaleY = barAnims[i].interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] });
        return (
          <Animated.View key={i} style={{
            width: 3.5, height: h,
            borderRadius: 1.75,
            backgroundColor: color,
            opacity: 0.18,
            marginHorizontal: 2.5,
            transform: [{ scaleY }],
          }} />
        );
      })}
    </XStack>
  );
};

// ─── Pulse Ring ──────────────────────────────────────────────────
export const PulseRing: React.FC<{ active: boolean }> = ({ active }) => {
  const pulse1 = useRef(new Animated.Value(0)).current;
  const pulse2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (active) {
      const createPulse = (anim: Animated.Value, delay: number) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(anim, { toValue: 1, duration: 1400, useNativeDriver: true }),
          ])
        );
      const a1 = createPulse(pulse1, 0);
      const a2 = createPulse(pulse2, 700);
      a1.start(); a2.start();
      return () => { a1.stop(); a2.stop(); pulse1.setValue(0); pulse2.setValue(0); };
    } else {
      pulse1.setValue(0);
      pulse2.setValue(0);
    }
  }, [active]);

  if (!active) return null;

  const renderRing = (anim: Animated.Value) => {
    const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.8] });
    const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0] });
    return (
      <Animated.View style={{
        position: 'absolute',
        width: 120, height: 120, borderRadius: 60,
        borderWidth: 2, borderColor: COLORS.teal,
        transform: [{ scale }],
        opacity,
      }} />
    );
  };

  return (
    <>
      {renderRing(pulse1)}
      {renderRing(pulse2)}
    </>
  );
};
