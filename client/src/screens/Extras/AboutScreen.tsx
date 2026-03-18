import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  StyleSheet,
  StatusBar,
  Platform,
  Animated,
  LayoutAnimation,
  UIManager,
  useWindowDimensions,
  Image as RNImage,
} from "react-native";
import {
  YStack,
  XStack,
  ZStack,
  Button,
  Circle,
  Paragraph,
  H1,
  SizableText,
  Card,
  ScrollView,
  Theme,
} from "tamagui";
import {
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Mic,
  Brain,
  Volume2,
  Save,
  Users,
  Heart,
  Shield,
  Lock,
  Accessibility,
  AlertTriangle,
  CheckCircle,
  HandHelping,
  Info,
} from "@tamagui/lucide-icons";

// Enable LayoutAnimation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─── Brand Palette ───────────────────────────────────────────────
const COLORS = {
  cream: '#FAF8F4',
  warmWhite: '#F5F1EA',
  sandLight: '#EDE8DF',
  sandMid: '#DDD6C8',
  deepNavy: '#0F2847',
  royalBlue: '#1A4480',
  mediumBlue: '#2A5FA8',
  teal: '#2A8FA0',
  tealLight: '#3DAFC4',
  orbBlue: '#C8D8EE',
  orbTeal: '#BEE4EC',
  orbSand: '#E8E0D0',
  textDark: '#1C2B3A',
  textMid: '#4A5A6A',
  white: '#FFFFFF',
};

// ─── Soft Orb ─────────────────────────────────────────────────────
interface OrbProps { color: string; size: number; x: number; y: number; duration: number; delay: number; }

const SoftOrb: React.FC<OrbProps> = ({ color, size, x, y, duration, delay }) => {
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

// ─── Accordion ────────────────────────────────────────────────────
interface AccordionProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const Accordion: React.FC<AccordionProps> = ({ icon, title, children, defaultOpen = false }) => {
  const [expanded, setExpanded] = useState(defaultOpen);
  const rotateAnim = useRef(new Animated.Value(defaultOpen ? 1 : 0)).current;

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    Animated.timing(rotateAnim, { toValue: expanded ? 0 : 1, duration: 200, useNativeDriver: true }).start();
    setExpanded(!expanded);
  };

  const rotation = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] });

  return (
    <Card bg="white" br={24} mb="$4" ov="hidden" elevation={5} shadowColor="#8A96A4" bw={1} bc={COLORS.sandMid}>
      <XStack ai="center" jc="space-between" p="$4" onPress={toggle}>
        <XStack ai="center" gap="$3" f={1}>
          <YStack w={40} h={40} br={12} bg={`${COLORS.royalBlue}0C`} jc="center" ai="center">
            {icon}
          </YStack>
          <SizableText fow="800" size="$4" color={COLORS.textDark} ls={-0.3} f={1}>
            {title}
          </SizableText>
        </XStack>
        <Animated.View style={{ transform: [{ rotate: rotation }] }}>
          <ChevronDown size={20} color={COLORS.textMid} />
        </Animated.View>
      </XStack>
      {expanded && (
        <YStack px="$4" pb="$4" pt="$1" borderTopWidth={1} borderTopColor={COLORS.sandLight}>
          {children}
        </YStack>
      )}
    </Card>
  );
};

// ─── Sub Components ───────────────────────────────────────────────
const Bullet: React.FC<{ text: string; color?: string }> = ({ text, color = COLORS.teal }) => (
  <XStack ai="flex-start" mb="$2" gap="$3">
    <Circle size={6} mt={8} bg={color} />
    <SizableText f={1} size="$3" color={COLORS.textMid} lh={22} fow="500">
      {text}
    </SizableText>
  </XStack>
);

const StepCard: React.FC<{ step: string; icon: React.ReactNode; title: string; desc: string; optional?: boolean }> = ({
  step, icon, title, desc, optional,
}) => (
  <YStack bg={`${COLORS.royalBlue}06`} br={16} p="$4" mb="$3" bw={1} bc={`${COLORS.royalBlue}10`}>
    <XStack ai="center" mb="$3" gap="$3">
      <Circle size={24} bg={COLORS.royalBlue} jc="center" ai="center">
        <SizableText color="white" size="$1" fow="800">{step}</SizableText>
      </Circle>
      <YStack w={34} h={34} br={10} bg="white" jc="center" ai="center" bw={1} bc={COLORS.sandMid}>
        {icon}
      </YStack>
    </XStack>
    <SizableText size="$4" fow="700" color={COLORS.textDark} mb="$1">
      {optional && <SizableText color="#D97706" fow="800" fontStyle="italic">Optional: </SizableText>}
      {title}
    </SizableText>
    <SizableText size="$3" color={COLORS.textMid} lh={20}>
      {desc}
    </SizableText>
  </YStack>
);

const InfoBox: React.FC<{ text: string; type?: "info" | "warning" }> = ({ text, type = "info" }) => (
  <XStack ai="flex-start" bg={type === "warning" ? "#FFFBEB" : `${COLORS.royalBlue}08`} p="$4" br={16} mt="$4" bw={1} bc={type === "warning" ? "#FEF3C7" : `${COLORS.royalBlue}15`} gap="$2">
    {type === "warning" ? (
      <AlertTriangle size={14} color="#D97706" mt={4} />
    ) : (
      <CheckCircle size={14} color={COLORS.royalBlue} mt={4} />
    )}
    <SizableText f={1} size="$3" color={type === "warning" ? "#B45309" : COLORS.royalBlue} lh={20} fow="700">
      {text}
    </SizableText>
  </XStack>
);

// ─── Main Screen ─────────────────────────────────────────────────
const AboutScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { width, height } = useWindowDimensions();

  const orbs = useMemo(() => ([
    { color: COLORS.orbBlue, size: width * 0.65, x: width * 0.88, y: height * 0.07, duration: 6000, delay: 0 },
    { color: COLORS.orbTeal, size: width * 0.5, x: width * 0.1, y: height * 0.48, duration: 7200, delay: 1000 },
    { color: COLORS.orbSand, size: width * 0.38, x: width * 0.62, y: height * 0.8, duration: 5500, delay: 500 },
  ]), [width, height]);

  return (
    <YStack f={1} bg={COLORS.cream}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Background */}
      <ZStack pos="absolute" fullscreen pointerEvents="none">
        <Circle pos="absolute" t={-height * 0.1} r={-width * 0.15} size={width * 0.95} bg={COLORS.sandLight} opacity={0.55} />
        <Circle pos="absolute" b={-height * 0.06} l={-width * 0.2} size={width * 0.8} bg={COLORS.sandMid} opacity={0.22} />
        {orbs.map((orb, i) => <SoftOrb key={i} {...orb} />)}
        
        {/* Corner Brackets */}
        <YStack pos="absolute" t={58} l={22} w={34} h={34} borderTopWidth={1.5} borderLeftWidth={1.5} bc={`${COLORS.royalBlue}28`} br={6} />
        <YStack pos="absolute" b={60} r={22} w={34} h={34} borderBottomWidth={1.5} borderRightWidth={1.5} bc={`${COLORS.teal}28`} br={6} />
      </ZStack>

      {/* Header */}
      <XStack jc="space-between" ai="center" px="$4" pt={Platform.OS === "android" ? 44 : 56} pb="$4" zi={10}>
        <Button
          size="$4"
          circular
          bg="rgba(255,255,255,0.7)"
          bw={1}
          bc={COLORS.sandMid}
          icon={<ChevronLeft size={24} color={COLORS.textDark} />}
          onPress={() => navigation.goBack()}
          pressStyle={{ scale: 0.9 }}
        />
        <SizableText size="$5" fow="800" color={COLORS.textDark} ls={-0.4}>
          About Articulink
        </SizableText>
        <YStack w={40} />
      </XStack>

      <ScrollView f={1} contentContainerStyle={{ padding: 20, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <YStack ai="center" mb={36} mt={10}>
          <Circle pos="absolute" t={-10} size={160} bg={COLORS.orbTeal} opacity={0.5} />
          <RNImage
            source={require('../../../assets/images/logo2-nobg.png')}
            style={{ width: 130, height: 130 }}
            resizeMode="contain"
          />
          <SizableText size="$9" fow="900" color={COLORS.textDark} mb="$1" ls={-1}>
            Articulink
          </SizableText>
          <YStack bg={`${COLORS.royalBlue}14`} px="$3" py="$1" br={20} mb="$4" bw={1} bc={`${COLORS.royalBlue}20`}>
            <SizableText size="$1" fow="700" color={COLORS.royalBlue}>Version 1.0.0</SizableText>
          </YStack>
          <SizableText size="$4" color={COLORS.textMid} ta="center" lh={23} fow="500" maw={300}>
            Speech assistance powered by AI — helping you communicate clearly and confidently.
          </SizableText>
        </YStack>

        {/* ─── 1: What is Articulink ─── */}
        <Accordion
          icon={<Heart size={18} color={COLORS.royalBlue} />}
          title="What is Articulink?"
          defaultOpen={true}
        >
          <Paragraph size="$4" color={COLORS.textMid} lh={24} mb="$3">
            Articulink is a speech assistance app designed to help individuals with
            lisp and hypernasal speech communicate more clearly.
          </Paragraph>
          <Paragraph size="$4" color={COLORS.textMid} lh={24}>
            The app processes your voice and converts it into a clearer, more
            understandable speech output — while preserving your intended message.
          </Paragraph>
        </Accordion>

        {/* ─── 2: Who Is It For ─── */}
        <Accordion
          icon={<Users size={18} color={COLORS.royalBlue} />}
          title="Who Is It For?"
        >
          <Bullet text="Individuals with lisp speech patterns" />
          <Bullet text="Individuals with hypernasal speech" />
          <Bullet text="Speech therapy support users" />
          <Bullet text="Students and professionals needing clearer communication" />
          <InfoBox text="Articulink is built for you — we want you to feel seen and understood." />
        </Accordion>

        {/* ─── 3: How to Use ─── */}
        <Accordion
          icon={<Mic size={18} color={COLORS.royalBlue} />}
          title="How to Use Articulink"
        >
          <StepCard
            step="1"
            icon={<Mic size={18} color={COLORS.royalBlue} />}
            title="Tap the Record Button"
            desc="Press the microphone icon and start speaking normally."
          />
          <StepCard
            step="2"
            icon={<Brain size={18} color={COLORS.royalBlue} />}
            title="Processing"
            desc="The app analyzes your speech and enhances clarity using AI."
          />
          <StepCard
            step="3"
            icon={<Volume2 size={18} color={COLORS.royalBlue} />}
            title="Hear or Share the Result"
            desc="Play the improved audio, view the text transcription, or share the output."
          />
          <StepCard
            step="4"
            icon={<Save size={18} color={COLORS.royalBlue} />}
            title="Save to History"
            desc="Choose whether to save the recording to your private history or discard it."
            optional={true}
          />
          <StepCard
            step="5"
            icon={<HandHelping size={18} color={COLORS.royalBlue} />}
            title="Contribute to Model Improvement"
            desc="You may allow anonymized recordings to improve the AI model. This is voluntary."
            optional={true}
          />
        </Accordion>

        {/* ─── 4: Privacy Summary ─── */}
        <Accordion
          icon={<Shield size={18} color={COLORS.royalBlue} />}
          title="Privacy & Security Summary"
        >
          <XStack ai="center" mb="$3" gap="$2">
            <Lock size={18} color={COLORS.royalBlue} />
            <SizableText size="$4" fow="800" color={COLORS.textDark}>Your Privacy Matters</SizableText>
          </XStack>
          <Bullet text="Recordings are saved only with your permission" color="#059669" />
          <Bullet text="You can delete your data anytime" color="#059669" />
          <Bullet text="Training contributions are anonymized" color="#059669" />
          <Bullet text="Data is encrypted during transfer and storage" color="#059669" />
          <InfoBox text="Compliant with the Data Privacy Act of 2012 (Philippines)." />
        </Accordion>

        {/* ─── 5: Accessibility ─── */}
        <Accordion
          icon={<Accessibility size={18} color={COLORS.royalBlue} />}
          title="Accessibility Features"
        >
          <Paragraph size="$4" color={COLORS.textMid} lh={24} mb="$3">
            Since our users may struggle with articulation, we've designed the app to be as accessible as possible:
          </Paragraph>
          <Bullet text="Large, easy-to-tap buttons" />
          <Bullet text="Clear, readable fonts" />
          <Bullet text="High contrast mode support" />
          <Bullet text="Text + audio feedback for all actions" />
          <Bullet text="Slow playback option" />
          <Bullet text="Adjustable playback speed" />
          <Bullet text="Visual waveform display" />
          <Bullet text="Text highlighting while speaking" />
        </Accordion>

        {/* ─── 6: Safety ─── */}
        <Accordion
          icon={<AlertTriangle size={18} color={COLORS.royalBlue} />}
          title="Safety & Responsible Use"
        >
          <XStack bg="#FFFBEB" p="$4" br={16} bw={1} bc="#FEF3C7" gap="$3">
            <AlertTriangle size={18} color="#D97706" mt={2} />
            <SizableText f={1} size="$3" color="#92400E" lh={22}>
              Articulink is a communication assistance tool and{" "}
              <SizableText fow="800">not a replacement for professional speech therapy.</SizableText>
            </SizableText>
          </XStack>
          <Paragraph size="$4" color={COLORS.textMid} lh={24} mt="$4">
            If you have a speech condition, we encourage you to work with a qualified
            speech-language pathologist alongside using Articulink.
          </Paragraph>
        </Accordion>

        {/* Footer */}
        <YStack ai="center" mt="$5">
          <XStack ai="center" w="80%" mb="$4" gap="$1">
            <YStack f={1} h={1} bg={COLORS.sandMid} />
            {[4, 8, 12, 8, 4].map((h, i) => (
              <YStack key={i} w={2.5} h={h} br={1} bg={COLORS.teal} opacity={0.45} mx={1.5} />
            ))}
            <YStack f={1} h={1} bg={COLORS.sandMid} />
          </XStack>
          <SizableText size="$2" color={COLORS.textMid} fow="600" ls={0.5}>
            Articulink © 2026
          </SizableText>
        </YStack>
      </ScrollView>
    </YStack>
  );
};

export default AboutScreen;
