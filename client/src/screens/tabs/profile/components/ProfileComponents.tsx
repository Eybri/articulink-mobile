import React, { useState, useRef, useEffect } from "react";
import { Animated, LayoutAnimation } from "react-native";
import {
  YStack,
  XStack,
  Circle,
  SizableText,
  Button,
} from "tamagui";
import {
  ChevronDown,
  CheckCircle,
  AlertTriangle,
} from "@tamagui/lucide-icons";
import Svg, { Path } from "react-native-svg";
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
    <Animated.View
      style={{
        position: "absolute",
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity: 0.5,
        transform: [{ translateY }, { scale }],
      }}
    >
      <Circle pos="absolute" t={size * 0.15} l={size * 0.15} size={size * 0.7} bg="white" opacity={0.35} />
    </Animated.View>
  );
};

// ─── Speech Progress Arc ──────────────────────────────────────────
export const SpeechProgressCard: React.FC<{ sessions: number; hoursToday: number; clarityPct: number; progressPct: number; onContinue?: () => void }> = ({
  sessions,
  hoursToday,
  clarityPct,
  progressPct,
  onContinue,
}) => {
  const arcAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(arcAnim, {
      toValue: progressPct / 100,
      duration: 1200,
      useNativeDriver: false,
    }).start();
  }, [progressPct]);

  const R = 45;
  const totalArcLength = Math.PI * R;

  return (
    <YStack bg={COLORS.royalBlue} br={28} p="$4" mb="$5" ov="hidden" elevation={8} shadowColor={COLORS.deepNavy}>
      <YStack pos="absolute" t={0} l={0} r={0} h={100} bg="rgba(255,255,255,0.03)" style={{ borderBottomLeftRadius: 100, borderBottomRightRadius: 100, transform: [{ scaleX: 2 }] }} />
      
      <XStack jc="space-between" ai="center" mb="$3">
        <SizableText fow="700" size="$4" color={COLORS.orbBlue} ls={0.3}>
          Today Progress
        </SizableText>
        <YStack opacity={0.5}>
          <Circle size={4} bg="white" mb={2} />
          <Circle size={4} bg="white" mb={2} />
          <Circle size={4} bg="white" />
        </YStack>
      </XStack>

      <XStack ai="center" gap="$3" mb="$4">
        <XStack ai="center" gap="$1" opacity={0.9}>
          <SizableText size="$2" color="white" fow="600">
            {sessions} Sessions
          </SizableText>
        </XStack>
        <XStack ai="center" gap="$1" opacity={0.9}>
          <SizableText size="$2" color="white" fow="600">
            {hoursToday.toFixed(1)} Hrs
          </SizableText>
        </XStack>
        <XStack ai="center" gap="$1" opacity={0.9}>
          <SizableText size="$2" color="white" fow="600">
            {clarityPct}% Clarity
          </SizableText>
        </XStack>
      </XStack>

      <XStack ai="flex-end" jc="space-between">
        <YStack w={140} h={85} ai="center" jc="flex-end">
          <Svg width={140} height={85} viewBox="0 0 120 75">
            <Path
              d="M15,65 A45,45 0 0,1 105,65"
              fill="none"
              stroke="rgba(255,255,255,0.15)"
              strokeWidth={10}
              strokeLinecap="round"
              strokeDasharray="4 2"
            />
            <Path
              d="M15,65 A45,45 0 0,1 105,65"
              fill="none"
              stroke={COLORS.tealLight}
              strokeWidth={10}
              strokeLinecap="round"
              strokeDasharray="4 2"
              strokeDashoffset={totalArcLength * (1 - progressPct / 100)}
            />
          </Svg>
          <YStack pos="absolute" b={2} ai="center">
            <SizableText fow="900" size="$8" color="white" ls={-1}>
              {progressPct}%
            </SizableText>
          </YStack>
        </YStack>

        <Button
          bg={COLORS.teal}
          br={24}
          px="$5"
          h={42}
          onPress={onContinue}
          pressStyle={{ scale: 0.95, opacity: 0.9 }}
          elevation={4}
        >
          <SizableText fow="800" size="$3" color="white">
            Continue
          </SizableText>
        </Button>
      </XStack>
    </YStack>
  );
};

// ─── Stat Card ────────────────────────────────────────────────────
export const StatCard: React.FC<{ icon: React.ReactNode; value: string; label: string; delta?: string; accentColor: string; iconBg: string }> = ({ icon, value, label, delta, accentColor, iconBg }) => (
  <YStack bg="white" br={18} p="$3" f={1} bw={1} bc={COLORS.sandMid} ov="hidden">
    <YStack pos="absolute" t={0} l={0} r={0} h={3} bg={accentColor} br={18} />
    <YStack w={30} h={30} br={9} bg={iconBg} jc="center" ai="center" mb="$2">
      {icon}
    </YStack>
    <SizableText fow="900" size="$6" color={COLORS.textDark} ls={-0.5} lh={28}>
      {value}
    </SizableText>
    <SizableText fow="700" size="$1" color={COLORS.textMid} tt="uppercase" ls={0.5} mt="$1">
      {label}
    </SizableText>
    {delta && (
      <SizableText fow="700" size="$1" color={COLORS.teal} mt="$1">
        {delta}
      </SizableText>
    )}
  </YStack>
);

// ─── Accordion ────────────────────────────────────────────────────
export const Accordion: React.FC<{ icon: React.ReactNode; title: string; tagText?: string; children: React.ReactNode; defaultOpen?: boolean; accentColor?: string }> = ({
  icon,
  title,
  tagText,
  children,
  defaultOpen = false,
  accentColor = COLORS.royalBlue,
}) => {
  const [expanded, setExpanded] = useState(defaultOpen);
  const rotateAnim = useRef(new Animated.Value(defaultOpen ? 1 : 0)).current;

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    Animated.timing(rotateAnim, {
      toValue: expanded ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
    setExpanded(!expanded);
  };

  const rotation = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] });

  return (
    <YStack bg="white" br={22} mb="$3" ov="hidden" elevation={5} shadowColor="#8A96A4" bw={1} bc={COLORS.sandMid}>
      <YStack pos="absolute" t={0} l={0} r={0} h={3} bg={accentColor} br={22} />
      <YStack pos="absolute" t={0} l={0} r={0} h={50} bg={`${accentColor}07`} br={22} />

      <XStack ai="center" jc="space-between" p="$4" onPress={toggle}>
        <XStack ai="center" gap="$3" f={1}>
          <YStack w={36} h={36} br={11} bg={`${accentColor}0C`} jc="center" ai="center">
            {icon}
          </YStack>
          <XStack ai="center" gap="$2" fw="wrap" f={1}>
            <SizableText fow="800" size="$3" color={COLORS.textDark} ls={-0.2}>
              {title}
            </SizableText>
            {tagText && (
              <YStack bg={`${COLORS.royalBlue}0A`} px="$2" py="$1" br={6}>
                <SizableText size="$1" fow="800" color={COLORS.royalBlue} tt="uppercase" ls={0.6}>
                  {tagText}
                </SizableText>
              </YStack>
            )}
          </XStack>
        </XStack>
        <Animated.View style={{ transform: [{ rotate: rotation }] }}>
          <ChevronDown size={18} color={COLORS.textMid} />
        </Animated.View>
      </XStack>

      {expanded && (
        <YStack px="$4" pb="$4" pt="$1" borderTopWidth={1} borderTopColor={COLORS.sandLight}>
          {children}
        </YStack>
      )}
    </YStack>
  );
};

export const Bullet: React.FC<{ text: string | undefined; color?: string }> = ({
  text,
  color = COLORS.royalBlue,
}) => (
  <XStack ai="flex-start" mb="$2" gap="$2">
    <Circle size={5} mt={7} bg={color} />
    <SizableText f={1} size="$3" color={COLORS.textMid} lh={20} fow="500">
      {text}
    </SizableText>
  </XStack>
);

export const SubHeading: React.FC<{ text: string }> = ({ text }) => (
  <YStack mt="$3" mb="$2">
    <SizableText size="$1" fow="800" color={COLORS.royalBlue} tt="uppercase" ls={1.2} opacity={0.75}>
      {text}
    </SizableText>
  </YStack>
);

export const InfoBox: React.FC<{ text: string; type?: "info" | "warning" }> = ({ text, type = "info" }) => (
  <XStack
    ai="flex-start"
    bg={type === "warning" ? "#FFFDF0" : `${COLORS.orbBlue}05`}
    p="$3"
    br={12}
    mt="$3"
    bw={1}
    bc={type === "warning" ? "#FFF1B8" : `${COLORS.orbBlue}10`}
    gap="$2"
  >
    {type === "warning" ? (
      <AlertTriangle size={12} color="#D97706" mt={3} />
    ) : (
      <CheckCircle size={12} color={COLORS.royalBlue} mt={3} />
    )}
    <SizableText
      f={1}
      size="$2"
      color={type === "warning" ? "#B45309" : COLORS.royalBlue}
      lh={18}
      fow="600"
    >
      {text}
    </SizableText>
  </XStack>
);

export const SectionLabel: React.FC<{ text: string }> = ({ text }) => (
  <SizableText
    size="$1"
    fow="800"
    color={COLORS.royalBlue}
    tt="uppercase"
    ls={1}
    mb="$2"
    mt="$1"
    ml="$1"
    opacity={0.8}
  >
    {text}
  </SizableText>
);
