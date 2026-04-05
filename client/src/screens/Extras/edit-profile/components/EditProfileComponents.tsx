import React, { useRef, useEffect } from "react";
import { Animated } from "react-native";
import {
  YStack,
  XStack,
  Circle,
  SizableText,
} from "tamagui";
import { COLORS } from "./../../../../constants/colors";

// ─── Soft Orb ─────────────────────────────────────────────────────
export const SoftOrb: React.FC<{ color: string; size: number; x: number; y: number; duration: number; delay: number }> = ({ color, size, x, y, duration, delay }) => {
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

export const SectionHeader: React.FC<{ icon: React.ReactNode; title: string }> = ({ icon, title }) => (
  <XStack ai="center" mb="$4" gap="$3">
    <YStack w={32} h={32} br={8} bg={`${COLORS.royalBlue}0C`} jc="center" ai="center">
      {icon}
    </YStack>
    <SizableText size="$4" fow="800" color={COLORS.textDark} ls={-0.3}>{title}</SizableText>
    <YStack f={1} h={1} bg={COLORS.sandMid} opacity={0.5} ml="$2" />
  </XStack>
);

export const FieldLabel: React.FC<{ text: string }> = ({ text }) => (
  <SizableText size="$2" fow="700" color={COLORS.textMid} mb="$1.5" ml="$1" ls={0.2} textTransform="uppercase">
    {text}
  </SizableText>
);
