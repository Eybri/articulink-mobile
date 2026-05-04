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
export const PulseRing = ({ active, color = COLORS.teal }: { active: boolean; color?: string }) => {
    const ring1 = useRef(new Animated.Value(0)).current;
    const ring2 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (!active) {
            ring1.setValue(0);
            ring2.setValue(0);
            return;
        }

        const createPulse = (anim: Animated.Value) => {
            return Animated.loop(
                Animated.timing(anim, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: true,
                })
            );
        };

        const pulse1 = createPulse(ring1);
        const pulse2 = createPulse(ring2);

        pulse1.start();
        setTimeout(() => pulse2.start(), 1000);

        return () => {
            pulse1.stop();
            pulse2.stop();
        };
    }, [active]);

    if (!active) return null;

    const renderRing = (anim: Animated.Value) => {
        return (
            <Animated.View
                style={{
                    position: 'absolute',
                    width: 140,
                    height: 140,
                    borderRadius: 70,
                    borderWidth: 2,
                    borderColor: color,
                    opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] }),
                    transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.5] }) }],
                }}
            />
        );
    };

    return (
        <ZStack pos="absolute" w={140} h={140} jc="center" ai="center">
            {renderRing(ring1)}
            {renderRing(ring2)}
        </ZStack>
    );
};
