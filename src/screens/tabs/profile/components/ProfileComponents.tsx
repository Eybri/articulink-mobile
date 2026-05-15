import React, { useState, useRef, useEffect } from "react";
import { Animated, LayoutAnimation, TouchableOpacity } from "react-native";
import Slider from '@react-native-community/slider';
import {
  YStack,
  XStack,
  Circle,
  SizableText,
  Button,
  Separator,
  Card,
} from "tamagui";
import {
  ChevronDown,
  ChevronRight,
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
export const StatCard: React.FC<{ icon: React.ReactNode; value: string; label: string; delta?: string; accentColor: string; iconBg: string; loading?: boolean }> = ({ icon, value, label, delta, accentColor, iconBg, loading }) => (
  <YStack bg="white" br={18} p="$3" f={1} bw={1} bc={COLORS.sandMid} ov="hidden">
    <YStack pos="absolute" t={0} l={0} r={0} h={3} bg={accentColor} br={18} />
    {loading ? (
      <YStack gap="$2" py="$1">
        <Circle size={30} bg={`${COLORS.sandMid}40`} />
        <YStack h={24} w="60%" bg={`${COLORS.sandMid}40`} br={6} />
        <YStack h={12} w="40%" bg={`${COLORS.sandMid}20`} br={4} />
      </YStack>
    ) : (
      <>
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
      </>
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

export const SettingRow = ({ icon, title, description, children, isLast = false, onPress }: { icon: any, title: string, description?: string, children: React.ReactNode, isLast?: boolean, onPress?: () => void }) => (
    <TouchableOpacity onPress={onPress} disabled={!onPress} activeOpacity={0.7}>
      <YStack>
        <XStack ai="center" jc="space-between" py="$4" gap="$3">
          <XStack ai="center" gap="$3" f={1}>
            <YStack w={42} h={42} br={14} bg={`${COLORS.royalBlue}0A`} jc="center" ai="center">
              {icon}
            </YStack>
            <YStack f={1}>
              <SizableText size="$4" fow="700" color={COLORS.textDark} ls={-0.4}>{title}</SizableText>
              {description && <SizableText size="$1" color={COLORS.textMid} fow="500" opacity={0.8}>{description}</SizableText>}
            </YStack>
          </XStack>
          {children}
        </XStack>
        {!isLast && <Separator bc="rgba(221, 214, 200, 0.4)" />}
      </YStack>
    </TouchableOpacity>
  );
  
  export const SliderSetting = ({ icon, title, value, onValueChange }: { icon: any, title: string, value: number, onValueChange: (v: number) => void }) => (
    <YStack py="$4" gap="$3">
      <XStack ai="center" jc="space-between">
        <XStack ai="center" gap="$3">
          <YStack w={42} h={42} br={14} bg={`${COLORS.royalBlue}0A`} jc="center" ai="center">
            {icon}
          </YStack>
          <SizableText size="$4" fow="700" color={COLORS.textDark} ls={-0.4}>{title}</SizableText>
        </XStack>
        <SizableText size="$2" fow="800" color={COLORS.royalBlue}>{Math.round(value * 100)}%</SizableText>
      </XStack>
      <YStack px="$1" mt="$1">
        <Slider
          style={{ width: '100%', height: 30 }}
          value={value}
          onValueChange={onValueChange}
          minimumValue={0}
          maximumValue={1}
          minimumTrackTintColor={COLORS.royalBlue}
          maximumTrackTintColor={COLORS.sandMid}
          thumbTintColor={COLORS.royalBlue}
        />
        <XStack jc="space-between" px="$1" mt="$1">
          <SizableText size="$1" color={COLORS.textMid} fow="600" opacity={0.5}>Soft</SizableText>
          <SizableText size="$1" color={COLORS.textMid} fow="600" opacity={0.5}>Strong</SizableText>
        </XStack>
      </YStack>
    </YStack>
  );

export const SettingsItem = ({ 
    icon, 
    title, 
    value, 
    onPress, 
    isLast = false,
    children,
    danger = false
  }: { 
    icon: any, 
    title: string, 
    value?: string, 
    onPress?: () => void, 
    isLast?: boolean,
    children?: React.ReactNode,
    danger?: boolean
  }) => (
    <YStack 
      bg="white" 
      onPress={onPress}
      disabled={!onPress && !children}
      pressStyle={onPress ? { bg: COLORS.sandLight } : undefined}
    >
      <XStack ai="center" jc="space-between" px="$5" h={64}>
        <XStack ai="center" gap="$3" f={1}>
          <YStack w={38} h={38} br={12} bg={danger ? "#FEF2F2" : `${COLORS.royalBlue}08`} ai="center" jc="center">
            {icon}
          </YStack>
          <SizableText size="$4" fow="600" color={danger ? "#DC2626" : COLORS.textDark}>{title}</SizableText>
        </XStack>
        
        <XStack ai="center" gap="$2">
          {value && <SizableText size="$3" color={COLORS.textMid} fow="600" opacity={0.6}>{value}</SizableText>}
          {children}
          {!children && <ChevronRight size={18} color={COLORS.sandMid} opacity={0.7} />}
        </XStack>
      </XStack>
      {!isLast && <Separator ml={65} bc="rgba(221, 214, 200, 0.3)" />}
    </YStack>
  );
  
  export const SettingsSectionHeader = ({ title, icon }: { title: string, icon?: React.ReactNode }) => (
    <XStack ai="center" gap="$2" pt="$6" pb="$3" px="$5">
      {icon && <YStack opacity={0.6}>{icon}</YStack>}
      <SizableText size="$1" fow="800" color={COLORS.textMid} tt="uppercase" ls={1.5} opacity={0.5}>
        {title}
      </SizableText>
    </XStack>
  );

/** Get time-based greeting */
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

/** Word chip with frequency badge */
export const WordChip: React.FC<{ word: string; count: number; index: number }> = ({ word, count, index }) => {
  const chipColors = [
      { bg: `${COLORS.royalBlue}08`, border: `${COLORS.royalBlue}18`, text: COLORS.royalBlue },
      { bg: `${COLORS.teal}08`, border: `${COLORS.teal}18`, text: COLORS.teal },
      { bg: '#F5F3FF', border: '#E9E5FF', text: '#7C3AED' },
      { bg: '#FFF7ED', border: '#FFEDD5', text: '#EA580C' },
      { bg: '#F0FDF4', border: '#DCFCE7', text: '#16A34A' },
      { bg: '#FDF2F8', border: '#FCE7F3', text: '#DB2777' },
      { bg: '#FFFBEB', border: '#FEF3C7', text: '#D97706' },
      { bg: '#F0F9FF', border: '#E0F2FE', text: '#0284C7' },
  ];
  const c = chipColors[index % chipColors.length];

  return (
      <XStack
          bg={c.bg}
          br={100}
          px="$3"
          py="$1.5"
          ai="center"
          gap="$1.5"
          bw={1}
          bc={c.border}
      >
          <SizableText fow="700" size="$2" color={c.text}>
              {word}
          </SizableText>
          <YStack bg={`${c.text}15`} br={100} px="$1.5" py="$0.5">
              <SizableText fow="800" size={10} color={c.text}>
                  {count}×
              </SizableText>
          </YStack>
      </XStack>
  );
};

/** Language pill with percentage bar */
export const LanguagePill: React.FC<{ lang: string; count: number; total: number }> = ({ lang, count, total }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  const langNames: Record<string, string> = {
      en: "English",
      fil: "Filipino",
      tl: "Tagalog",
      unknown: "Other",
  };
  const displayName = langNames[lang] || lang.toUpperCase();

  return (
      <YStack f={1} minWidth={120} gap="$1.5">
          <XStack jc="space-between" ai="center">
              <SizableText fow="700" size="$2" color={COLORS.textDark}>{displayName}</SizableText>
              <SizableText fow="600" size="$1" color={COLORS.textMid}>{pct}%</SizableText>
          </XStack>
          <YStack h={6} bg={`${COLORS.sandMid}40`} br={3} ov="hidden">
              <YStack h={6} w={`${pct}%`} bg="#6366F1" br={3} />
          </YStack>
          <SizableText fow="500" size={10} color={COLORS.textMid} opacity={0.6}>
              {count} recording{count !== 1 ? 's' : ''}
          </SizableText>
      </YStack>
  );
};

/** Skeleton Stats Card */
export const SkeletonCard = () => (
    <Card bg="white" br={24} p="$4" elevation={2} bw={1} bc={COLORS.sandMid} opacity={0.6}>
        <XStack ai="center" gap="$2" mb="$3">
            <YStack w={28} h={28} br={10} bg={`${COLORS.sandMid}20`} />
            <YStack h={20} w={120} bg={`${COLORS.sandMid}20`} br={4} />
        </XStack>
        <YStack gap="$2">
            <YStack h={12} w="90%" bg={`${COLORS.sandMid}10`} br={2} />
            <YStack h={12} w="70%" bg={`${COLORS.sandMid}10`} br={2} />
        </YStack>
    </Card>
);


