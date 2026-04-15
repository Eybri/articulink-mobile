import React, { useState, useRef } from "react";
import { Animated, LayoutAnimation } from "react-native";
import {
  XStack,
  YStack,
  Circle,
  SizableText,
  Paragraph,
} from "tamagui";
import {
  ChevronDown,
  AlertTriangle,
  CheckCircle,
} from "@tamagui/lucide-icons";
import { COLORS } from "./../../../../constants/colors";

// ─── Accordion ────────────────────────────────────────────────────
export const Accordion: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ icon, title, children, defaultOpen = false }) => {
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
          <SizableText fow="700" size="$2" color={COLORS.textDark} ls={-0.2} f={1}>
            {title}
          </SizableText>
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
export const Bullet: React.FC<{ text: string; color?: string }> = ({ text, color = COLORS.teal }) => (
  <XStack ai="flex-start" mb="$1.5" gap="$2">
    <Circle size={4} mt={7} bg={color} />
    <SizableText f={1} size="$1" color={COLORS.textMid} lh={17} fow="500">
      {text}
    </SizableText>
  </XStack>
);

export const StepCard: React.FC<{ step: string; icon: React.ReactNode; title: string; desc: string; optional?: boolean }> = ({
  step, icon, title, desc, optional,
}) => (
  <YStack bg={COLORS.cream} br={12} p="$2.5" mb="$2" bw={1} bc={COLORS.sandMid}>
    <XStack ai="center" mb="$1.5" gap="$2">
      <Circle size={18} bg={COLORS.royalBlue} jc="center" ai="center">
        <SizableText color="white" size={9} fow="800">{step}</SizableText>
      </Circle>
      <SizableText size="$2" fow="700" color={COLORS.textDark} f={1}>
        {optional && <SizableText color={COLORS.teal} fow="700" size="$1">Optional · </SizableText>}
        {title}
      </SizableText>
    </XStack>
    <SizableText size="$1" color={COLORS.textMid} lh={16} fow="400" pl={26}>
      {desc}
    </SizableText>
  </YStack>
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
