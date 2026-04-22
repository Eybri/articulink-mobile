import React, { useState, useRef } from "react";
import { Animated, LayoutAnimation } from "react-native";
import {
  YStack,
  XStack,
  Circle,
  SizableText,
} from "tamagui";
import {
  ChevronDown,
  CheckCircle,
  AlertTriangle,
} from "@tamagui/lucide-icons";
import { COLORS } from "./../../../../constants/colors";

// ─── Accordion ────────────────────────────────────────────────────
export const Accordion: React.FC<{ icon: React.ReactNode; title: string; tagText?: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ icon, title, tagText, children, defaultOpen = false }) => {
  const [expanded, setExpanded] = useState(defaultOpen);
  const rotateAnim = useRef(new Animated.Value(defaultOpen ? 1 : 0)).current;

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    Animated.timing(rotateAnim, { toValue: expanded ? 0 : 1, duration: 200, useNativeDriver: true }).start();
    setExpanded(!expanded);
  };

  const rotation = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] });

  return (
    <YStack bg={COLORS.white} br={16} mb="$2.5" ov="hidden" bw={1} bc={COLORS.sandMid}>
      <XStack ai="center" jc="space-between" py="$2.5" px="$3" onPress={toggle} pressStyle={{ opacity: 0.7 }}>
        <XStack ai="center" gap="$2.5" f={1}>
          <Circle size={30} bg={`${COLORS.royalBlue}08`} jc="center" ai="center">
            {icon}
          </Circle>
          <YStack f={1} gap="$0.5">
            <SizableText fow="700" size="$2" color={COLORS.textDark} ls={-0.2}>
              {title}
            </SizableText>
            {tagText && (
              <XStack>
                <YStack bg={`${COLORS.royalBlue}10`} px="$1.5" py={1} br={4}>
                  <SizableText size={8} fow="800" color={COLORS.royalBlue} tt="uppercase" ls={0.8}>
                    {tagText}
                  </SizableText>
                </YStack>
              </XStack>
            )}
          </YStack>
        </XStack>
        <Animated.View style={{ transform: [{ rotate: rotation }] }}>
          <ChevronDown size={14} color={COLORS.textMid} opacity={0.5} />
        </Animated.View>
      </XStack>
      {expanded && (
        <YStack px="$3" pb="$3" pt="$1">
          <YStack h={1} bg={COLORS.sandLight} mb="$2.5" />
          {children}
        </YStack>
      )}
    </YStack>
  );
};

// ─── Sub Components ───────────────────────────────────────────────
export const Bullet: React.FC<{ text: string; color?: string }> = ({ text, color = COLORS.royalBlue }) => (
  <XStack ai="flex-start" mb="$1.5" gap="$2">
    <Circle size={4} mt={7} bg={color} />
    <SizableText f={1} size="$1" color={COLORS.textMid} lh={17} fow="500">
      {text}
    </SizableText>
  </XStack>
);

export const SubHeading: React.FC<{ icon?: React.ReactNode; text: string }> = ({ icon, text }) => (
  <XStack ai="center" mt="$2" mb="$1.5" gap="$1.5">
    {icon && <YStack>{icon}</YStack>}
    <SizableText size={9} fow="800" color={COLORS.royalBlue} tt="uppercase" ls={1} opacity={0.8}>
      {text}
    </SizableText>
  </XStack>
);

export const InfoBox: React.FC<{ text: string; type?: "info" | "warning" }> = ({ text, type = "info" }) => (
  <XStack ai="flex-start" bg={type === "warning" ? "#FFFBEB" : `${COLORS.royalBlue}06`} p="$2.5" br={10} mt="$2" bw={1} bc={type === "warning" ? "#FEF3C7" : `${COLORS.royalBlue}12`} gap="$2">
    {type === "warning" ? (
      <AlertTriangle size={11} color="#D97706" mt={2} />
    ) : (
      <CheckCircle size={11} color={COLORS.royalBlue} mt={2} />
    )}
    <SizableText f={1} size="$1" color={type === "warning" ? "#B45309" : COLORS.royalBlue} lh={16} fow="600">
      {text}
    </SizableText>
  </XStack>
);
