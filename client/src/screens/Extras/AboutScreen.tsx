import React, { useState, useRef, useEffect } from "react";
import {
  StatusBar,
  Platform,
  Animated,
  LayoutAnimation,
  UIManager,
  useWindowDimensions,
  Image as RNImage,
  ImageBackground,
  View,
} from "react-native";
import {
  YStack,
  XStack,
  ZStack,
  Button,
  Circle,
  Paragraph,
  SizableText,
  ScrollView,
} from "tamagui";
import {
  ChevronLeft,
  ChevronDown,
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
  Speaker,
} from "@tamagui/lucide-icons";

// Enable LayoutAnimation on Android
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental && !((global as any).nativeFabricUIManager)) {
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
  textDark: '#1C2B3A',
  textMid: '#4A5A6A',
  white: '#FFFFFF',
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
const Bullet: React.FC<{ text: string; color?: string }> = ({ text, color = COLORS.teal }) => (
  <XStack ai="flex-start" mb="$1.5" gap="$2">
    <Circle size={4} mt={7} bg={color} />
    <SizableText f={1} size="$1" color={COLORS.textMid} lh={17} fow="500">
      {text}
    </SizableText>
  </XStack>
);

const StepCard: React.FC<{ step: string; icon: React.ReactNode; title: string; desc: string; optional?: boolean }> = ({
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

const InfoBox: React.FC<{ text: string; type?: "info" | "warning" }> = ({ text, type = "info" }) => (
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

// ─── Main Screen ─────────────────────────────────────────────────
const AboutScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { width, height } = useWindowDimensions();
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 25, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);

  // Parallax: header image moves slower than scroll
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 250],
    outputRange: [0, -60],
    extrapolate: 'clamp',
  });

  // Header fades as you scroll
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 180],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  // Header scales down slightly
  const headerScale = scrollY.interpolate({
    inputRange: [0, 250],
    outputRange: [1, 0.92],
    extrapolate: 'clamp',
  });

  return (
    <YStack f={1} bg={COLORS.cream}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* ── Fixed Back Button (stays on top) ── */}
      <XStack pos="absolute" t={Platform.OS === "android" ? 40 : 52} l={0} r={0} px="$5" zIndex={20} jc="space-between" ai="center">
        <Button
          size="$3"
          br={14}
          bg="rgba(255,255,255,0.15)"
          bw={1}
          bc="rgba(255,255,255,0.2)"
          icon={<ChevronLeft size={20} color="white" />}
          onPress={() => navigation.goBack()}
          pressStyle={{ scale: 0.95, opacity: 0.7 }}
        />
        <SizableText size="$1" fow="700" color="white" ls={3} tt="uppercase" opacity={0.5}>
          About
        </SizableText>
        <YStack w={40} />
      </XStack>

      {/* ── Scrollable Content (everything scrolls) ── */}
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* ── Blue Header (scrolls up with parallax) ── */}
        <Animated.View style={{
          transform: [{ translateY: headerTranslateY }, { scale: headerScale }],
        }}>
          <View style={{
            borderBottomLeftRadius: 35,
            borderBottomRightRadius: 35,
            overflow: 'hidden',
          }}>
            <ImageBackground
              source={require('../../../assets/images/bg.jpg')}
              resizeMode="cover"
              style={{
                paddingTop: Platform.OS === "android" ? 90 : 100,
                paddingBottom: 40,
                alignItems: 'center',
              }}
            >
              <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.15)' }} />
              <Animated.View style={{ opacity: Animated.multiply(fadeAnim, headerOpacity), transform: [{ translateY: slideAnim }], alignItems: 'center' }}>
                <RNImage
                  source={require('../../../assets/images/whitelogo.png')}
                  style={{ width: width * 0.18, height: width * 0.18 }}
                  resizeMode="contain"
                />
                <SizableText size="$6" fow="900" color="white" ls={-0.5} mt="$1.5">
                  articuLink
                </SizableText>
                <YStack w={24} h={2} bg={COLORS.teal} br={1} mt="$1" mb="$1.5" />
                <XStack ai="center" gap="$1">
                  <Speaker size={8} color="white" opacity={0.4} />
                  <SizableText size={10} fow="600" color="white" opacity={0.4} ls={1.5} tt="uppercase">
                    Speech Engine · v1.0.0
                  </SizableText>
                </XStack>
              </Animated.View>
            </ImageBackground>
          </View>
        </Animated.View>

        {/* ── Content Cards ── */}
        <YStack px="$4" pt="$4" pb={60}>
          {/* Tagline */}
          <SizableText size="$2" color={COLORS.textMid} ta="center" lh={18} fow="500" maw={280} als="center" mb="$4">
            Empowering communication through AI — making every voice heard.
          </SizableText>

          <Accordion icon={<Heart size={14} color={COLORS.royalBlue} />} title="What is Articulink?" defaultOpen={true}>
            <Paragraph size="$1" color={COLORS.textMid} lh={17} mb="$1.5" fow="500">
              A speech assistance app designed to help individuals with lisp and hypernasal speech communicate more clearly.
            </Paragraph>
            <Paragraph size="$1" color={COLORS.textMid} lh={17} fow="500">
              The app processes your voice and converts it into a clearer, more understandable speech output — preserving your message.
            </Paragraph>
          </Accordion>

          <Accordion icon={<Users size={14} color={COLORS.royalBlue} />} title="Who Is It For?">
            <Bullet text="Individuals with lisp speech patterns" />
            <Bullet text="Individuals with hypernasal speech" />
            <Bullet text="Speech therapy support users" />
            <Bullet text="Students and professionals needing clearer communication" />
            <InfoBox text="Articulink is built for you — we want you to feel seen and understood." />
          </Accordion>

          <Accordion icon={<Mic size={14} color={COLORS.royalBlue} />} title="How to Use">
            <StepCard step="1" icon={<Mic size={14} color={COLORS.royalBlue} />} title="Tap Record" desc="Press the microphone icon and start speaking naturally." />
            <StepCard step="2" icon={<Brain size={14} color={COLORS.royalBlue} />} title="AI Processing" desc="The app analyzes your speech and enhances clarity using AI." />
            <StepCard step="3" icon={<Volume2 size={14} color={COLORS.royalBlue} />} title="Hear the Result" desc="Play the improved audio, view the text, or share the output." />
            <StepCard step="4" icon={<Save size={14} color={COLORS.royalBlue} />} title="Save to History" desc="Save the recording to your private history or discard it." optional />
            <StepCard step="5" icon={<HandHelping size={14} color={COLORS.royalBlue} />} title="Help Improve" desc="Anonymized recordings may help improve the AI model. Voluntary." optional />
          </Accordion>

          <Accordion icon={<Shield size={14} color={COLORS.royalBlue} />} title="Privacy & Security">
            <XStack ai="center" mb="$2" gap="$1.5">
              <Lock size={12} color={COLORS.teal} />
              <SizableText size="$2" fow="800" color={COLORS.textDark}>Your Privacy Matters</SizableText>
            </XStack>
            <Bullet text="Recordings saved only with permission" color="#059669" />
            <Bullet text="Delete your data anytime" color="#059669" />
            <Bullet text="Training contributions are anonymized" color="#059669" />
            <Bullet text="Encrypted during transfer and storage" color="#059669" />
            <InfoBox text="Compliant with the Data Privacy Act of 2012 (Philippines)." />
          </Accordion>

          <Accordion icon={<Accessibility size={14} color={COLORS.royalBlue} />} title="Accessibility">
            <Paragraph size="$1" color={COLORS.textMid} lh={17} mb="$1.5" fow="500">
              Designed for users who may struggle with articulation:
            </Paragraph>
            <Bullet text="Large, easy-to-tap buttons" />
            <Bullet text="Clear, readable fonts" />
            <Bullet text="Text + audio feedback for all actions" />
            <Bullet text="Adjustable playback speed" />
            <Bullet text="Visual waveform display" />
          </Accordion>

          <Accordion icon={<AlertTriangle size={14} color={COLORS.royalBlue} />} title="Safety & Responsible Use">
            <XStack bg="#FFFBEB" p="$2.5" br={10} bw={1} bc="#FEF3C7" gap="$2">
              <AlertTriangle size={11} color="#D97706" mt={2} />
              <SizableText f={1} size="$1" color="#92400E" lh={16}>
                Articulink is a communication tool and{" "}
                <SizableText fow="800">not a replacement for professional speech therapy.</SizableText>
              </SizableText>
            </XStack>
            <Paragraph size="$1" color={COLORS.textMid} lh={17} mt="$2" fow="500">
              We encourage working with a qualified speech-language pathologist alongside using Articulink.
            </Paragraph>
          </Accordion>

          {/* Footer */}
          <YStack ai="center" mt="$6" pb="$2" opacity={0.5}>
            <XStack ai="center" gap="$1" mb="$1.5">
              <YStack w={12} h={1} bg={COLORS.textMid} />
              <Speaker size={8} color={COLORS.textMid} />
              <YStack w={12} h={1} bg={COLORS.textMid} />
            </XStack>
            <SizableText size="$1" color={COLORS.textMid} fow="600" ls={1}>
              Articulink © 2026
            </SizableText>
          </YStack>
        </YStack>
      </Animated.ScrollView>
    </YStack>
  );
};

export default AboutScreen;
