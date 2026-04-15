import React, { useRef, useEffect } from "react";
import { Animated } from "react-native";
import { XStack, Circle } from "tamagui";
import { COLORS } from "./../../../../constants/colors";

// ─── Soft Orb ─────────────────────────────────────────────────────
// ─── Soft Orb ─────────────────────────────────────────────────────
interface SoftOrbProps { color: string; size: number; x: number; y: number; duration: number; delay: number; }

export const SoftOrb: React.FC<SoftOrbProps> = ({ color, size, x, y, duration, delay }) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { 
          toValue: 1, 
          duration: duration * 1.5, // Slower for sophistication
          useNativeDriver: true 
        }),
        Animated.timing(anim, { 
          toValue: 0, 
          duration: duration * 1.5, 
          useNativeDriver: true 
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);
  
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -30] });
  const scale = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.2, 1] });
  const opacity = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.1, 0.25, 0.1] });

  return (
    <Animated.View style={{
      position: 'absolute',
      left: x - size / 2, top: y - size / 2,
      width: size, height: size,
      borderRadius: size / 2,
      backgroundColor: color,
      opacity, // Dynamic opacity
      transform: [{ translateY }, { scale }],
    }}>
      <Circle pos="absolute" t={size * 0.1} l={size * 0.1} size={size * 0.8} bg="white" opacity={0.2} />
    </Animated.View>
  );
};

// ─── Animated Waveform Bars ───────────────────────────────────────
export const AnimatedWaveform: React.FC<{ color: string }> = ({ color }) => {
  const barHeights = [8, 18, 28, 20, 38, 24, 12, 32, 22, 14];
  const barAnims = useRef(barHeights.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const animations = barAnims.map((anim, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 60),
          Animated.timing(anim, { toValue: 1, duration: 400 + (i % 4) * 100, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 400 + (i % 4) * 100, useNativeDriver: true }),
        ])
      )
    );
    animations.forEach(a => a.start());
    return () => animations.forEach(a => a.stop());
  }, []);

  return (
    <XStack ai="flex-end" h={40} jc="center">
      {barHeights.map((h, i) => {
        const scaleY = barAnims[i].interpolate({ inputRange: [0, 1], outputRange: [0.2, 1] });
        const barOpacity = barAnims[i].interpolate({ inputRange: [0, 1], outputRange: [0.2, 0.6] });
        return (
          <Animated.View key={i} style={{
            width: 4, height: h,
            borderRadius: 2,
            backgroundColor: color,
            opacity: barOpacity,
            marginHorizontal: 3,
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
  const pulse3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (active) {
      const createPulse = (anim: Animated.Value, delay: number) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(anim, { toValue: 1, duration: 2500, useNativeDriver: true }),
          ])
        );
      const a1 = createPulse(pulse1, 0);
      const a2 = createPulse(pulse2, 800);
      const a3 = createPulse(pulse3, 1600);
      a1.start(); a2.start(); a3.start();
      return () => { 
        a1.stop(); a2.stop(); a3.stop();
        pulse1.setValue(0); pulse2.setValue(0); pulse3.setValue(0);
      };
    } else {
      pulse1.setValue(0); pulse2.setValue(0); pulse3.setValue(0);
    }
  }, [active]);

  if (!active) return null;

  const renderRing = (anim: Animated.Value) => {
    const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 2.5] });
    const opacity = anim.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 0.3, 0] });
    return (
      <Animated.View style={{
        position: 'absolute',
        width: 100, height: 100, borderRadius: 50,
        borderWidth: 1.5, borderColor: COLORS.teal,
        transform: [{ scale }],
        opacity,
      }} />
    );
  };

  return (
    <XStack pos="absolute" jc="center" ai="center">
      {renderRing(pulse1)}
      {renderRing(pulse2)}
      {renderRing(pulse3)}
    </XStack>
  );
};
