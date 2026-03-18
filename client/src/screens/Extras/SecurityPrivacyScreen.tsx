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
  SizableText,
  Card,
  ScrollView,
  Theme,
} from "tamagui";
import {
  Shield,
  Lock,
  Eye,
  Server,
  Bell,
  ChevronLeft,
  ChevronDown,
  FileText,
  Users,
  Mic,
  Database,
  Globe,
  CheckCircle,
  AlertTriangle,
  Key,
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

// ─── Accordion Section ───────────────────────────────────────────
interface AccordionProps {
  icon: React.ReactNode;
  title: string;
  tagText?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const Accordion: React.FC<AccordionProps> = ({ icon, title, tagText, children, defaultOpen = false }) => {
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

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  return (
    <Card bg="white" br={24} mb="$4" ov="hidden" elevation={5} shadowColor="#8A96A4" bw={1} bc={COLORS.sandMid}>
      <XStack ai="center" jc="space-between" p="$4" onPress={toggle}>
        <XStack ai="center" gap="$3" f={1}>
          <YStack w={40} h={40} br={12} bg={`${COLORS.royalBlue}0C`} jc="center" ai="center">
            {icon}
          </YStack>
          <YStack f={1} gap="$1">
            <SizableText fow="800" size="$4" color={COLORS.textDark} ls={-0.3}>
              {title}
            </SizableText>
            {tagText && (
              <XStack>
                <YStack bg={`${COLORS.royalBlue}14`} px="$2" py={2} br={8} bw={1} bc={`${COLORS.royalBlue}20`}>
                  <SizableText size="$1" fow="800" color={COLORS.royalBlue} textTransform="uppercase" ls={0.8}>
                    {tagText}
                  </SizableText>
                </YStack>
              </XStack>
            )}
          </YStack>
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

// ─── Sub Components ──────────────────────────────────────────────
const Bullet: React.FC<{ text: string; color?: string }> = ({ text, color = COLORS.royalBlue }) => (
  <XStack ai="flex-start" mb="$2" gap="$3">
    <Circle size={6} mt={8} bg={color} />
    <SizableText f={1} size="$3" color={COLORS.textMid} lh={22} fow="500">
      {text}
    </SizableText>
  </XStack>
);

const SubHeading: React.FC<{ icon?: React.ReactNode; text: string }> = ({ icon, text }) => (
  <XStack ai="center" mt="$4" mb="$2" gap="$2">
    {icon && <YStack>{icon}</YStack>}
    <SizableText size="$1" fow="800" color={COLORS.royalBlue} textTransform="uppercase" ls={1.2} opacity={0.9}>
      {text}
    </SizableText>
  </XStack>
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
const SecurityPrivacyScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
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
          Security & Privacy
        </SizableText>
        <YStack w={40} />
      </XStack>

      <ScrollView f={1} contentContainerStyle={{ padding: 20, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <YStack ai="center" mb={36} mt={10}>
          <Circle pos="absolute" t={-10} size={160} bg={COLORS.orbTeal} opacity={0.5} />
          <RNImage
            source={require('../../../assets/images/logo2-nobg.png')}
            style={{ width: 130, height: 130, zIndex: 10 }}
            resizeMode="contain"
          />
          <SizableText size="$8" fow="900" color={COLORS.textDark} mb="$2" ls={-1}>
            Security First
          </SizableText>
          <SizableText size="$4" color={COLORS.textMid} ta="center" lh={22} fow="500" maw={320}>
            Your speech data is processed with extreme care. We prioritize your privacy above all else.
          </SizableText>
        </YStack>

        {/* ─── Sections ─── */}
        <Accordion
          icon={<Mic size={18} color={COLORS.royalBlue} />}
          title="User Consent & Control"
          tagText="Top Priority"
          defaultOpen={true}
        >
          <SubHeading
            icon={<Mic size={14} color={COLORS.royalBlue} />}
            text="Voice Recording Management"
          />
          <Paragraph size="$4" color={COLORS.textMid} lh={23} mb="$3">
            We never store your recordings unless you explicitly choose to save them to your history.
          </Paragraph>
          <Bullet text="Choose where your data lives" />
          <Bullet text="Delete any recording instantly" />
          <Bullet text="Opt-out of model training at any time" />

          <SubHeading text="Core Rights:" />
          <Bullet text="Full control over storage permissions" />
          <Bullet text="Transparent data handling policies" />

          <InfoBox text="Privacy is baked into our core architecture. You are always in control." />
        </Accordion>

        <Accordion
          icon={<Database size={18} color={COLORS.royalBlue} />}
          title="Data Protection Layers"
        >
          <SubHeading text="Sensitive Data handling" />
          <Bullet text="Audio files (Biometric data)" color="#F87171" />
          <Bullet text="Transcription text (High protection)" color="#F87171" />

          <SubHeading text="Standard Identity Data" />
          <Bullet text="Encrypted user profile metrics" />
          <Bullet text="Secure authentication tokens" />

          <InfoBox text="Sensitive speech data is isolated and encrypted separately from your profile." />
        </Accordion>

        <Accordion
          icon={<Lock size={18} color={COLORS.royalBlue} />}
          title="Encryption & Integrity"
          tagText="Advanced"
        >
          <SubHeading
            icon={<Lock size={14} color={COLORS.royalBlue} />}
            text="How we secure your voice"
          />
          <Bullet text="End-to-end encryption in transit" />
          <Bullet text="AES-256 at-rest storage standards" />
          <Bullet text="Hardware-level security modules" />

          <InfoBox
            text="No one at Articulink can access your private voice recordings."
            type="warning"
          />
        </Accordion>

        <Accordion
          icon={<Globe size={18} color={COLORS.royalBlue} />}
          title="Legal & Compliance"
          tagText="PH Compliant"
        >
          <SubHeading text="Data Privacy Act of 2012" />
          <Bullet text="Fully strictly regulated by NPC" />
          <Bullet text="Global best practices (GDPR aligned)" />

          <InfoBox text="We undergo regular privacy impact assessments." />
        </Accordion>

        {/* Privacy Statement */}
        <Card bg="white" br={24} p="$5" mt="$2" mb="$5" bw={1} bc={COLORS.sandMid} elevation={5} shadowColor="#8A96A4" ai="flex-start" flexDirection="row" gap="$3">
          <Shield size={16} color={COLORS.royalBlue} mt={4} />
          <SizableText f={1} size="$3" color={COLORS.textMid} lh={22} fontStyle="italic" fow="500">
            "At Articulink, your voice belongs to you. Our mission is to amplify your speech, not compromise your identity."
          </SizableText>
        </Card>

        {/* Footer */}
        <YStack ai="center" mt="$4">
          <XStack ai="center" w="80%" mb="$4" gap="$1">
            <YStack f={1} h={1} bg={COLORS.sandMid} />
            {[4, 8, 12, 8, 4].map((h, i) => (
              <YStack key={i} w={2.5} h={h} br={1} bg={COLORS.teal} opacity={0.45} mx={1.5} />
            ))}
            <YStack f={1} h={1} bg={COLORS.sandMid} />
          </XStack>
          <SizableText size="$1" color={COLORS.royalBlue} fow="800" ls={2} mb="$1">
            SYSTEM STATUS: SECURE
          </SizableText>
          <SizableText size="$2" color={COLORS.textMid} fow="600">
            © 2026 Articulink Security
          </SizableText>
        </YStack>
      </ScrollView>
    </YStack>
  );
};

export default SecurityPrivacyScreen;
