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
  Button,
  Circle,
  Paragraph,
  SizableText,
} from "tamagui";
import {
  Shield,
  Lock,
  ChevronLeft,
  ChevronDown,
  Mic,
  Database,
  Globe,
  CheckCircle,
  AlertTriangle,
  ShieldCheck,
} from "@tamagui/lucide-icons";

// Enable LayoutAnimation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental && !((global as any).nativeFabricUIManager)) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─── Brand Palette ───────────────────────────────────────────────
const COLORS = {
  cream: '#FAF8F4',
  sandLight: '#EDE8DF',
  sandMid: '#DDD6C8',
  royalBlue: '#1A4480',
  teal: '#2A8FA0',
  textDark: '#1C2B3A',
  textMid: '#4A5A6A',
  white: '#FFFFFF',
};

// ─── Accordion ────────────────────────────────────────────────────
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
const Bullet: React.FC<{ text: string; color?: string }> = ({ text, color = COLORS.royalBlue }) => (
  <XStack ai="flex-start" mb="$1.5" gap="$2">
    <Circle size={4} mt={7} bg={color} />
    <SizableText f={1} size="$1" color={COLORS.textMid} lh={17} fow="500">
      {text}
    </SizableText>
  </XStack>
);

const SubHeading: React.FC<{ icon?: React.ReactNode; text: string }> = ({ icon, text }) => (
  <XStack ai="center" mt="$2" mb="$1.5" gap="$1.5">
    {icon && <YStack>{icon}</YStack>}
    <SizableText size={9} fow="800" color={COLORS.royalBlue} tt="uppercase" ls={1} opacity={0.8}>
      {text}
    </SizableText>
  </XStack>
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
const SecurityPrivacyScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
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

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 250],
    outputRange: [0, -60],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 180],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const headerScale = scrollY.interpolate({
    inputRange: [0, 250],
    outputRange: [1, 0.92],
    extrapolate: 'clamp',
  });

  return (
    <YStack f={1} bg={COLORS.cream}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Fixed Back Button */}
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
          Security
        </SizableText>
        <YStack w={40} />
      </XStack>

      {/* Scrollable Content */}
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Blue Header with Parallax */}
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
                <Shield size={40} color="white" opacity={0.9} />
                <SizableText size="$6" fow="900" color="white" ls={-0.5} mt="$2">
                  Security First
                </SizableText>
                <YStack w={24} h={2} bg={COLORS.teal} br={1} mt="$1" mb="$1.5" />
                <XStack ai="center" gap="$1">
                  <ShieldCheck size={8} color="white" opacity={0.4} />
                  <SizableText size={10} fow="600" color="white" opacity={0.4} ls={1.5} tt="uppercase">
                    Privacy Protected
                  </SizableText>
                </XStack>
              </Animated.View>
            </ImageBackground>
          </View>
        </Animated.View>

        {/* Content Cards */}
        <YStack px="$4" pt="$4" pb={60}>
          <SizableText size="$2" color={COLORS.textMid} ta="center" lh={18} fow="500" maw={280} als="center" mb="$4">
            Your speech data is processed with extreme care. We prioritize your privacy above all else.
          </SizableText>

          <Accordion
            icon={<Mic size={14} color={COLORS.royalBlue} />}
            title="User Consent & Control"
            tagText="Top Priority"
            defaultOpen={true}
          >
            <SubHeading icon={<Mic size={10} color={COLORS.royalBlue} />} text="Voice Recording Management" />
            <Paragraph size="$1" color={COLORS.textMid} lh={17} mb="$1.5" fow="500">
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

          {/* Data Protection */}
          <Accordion icon={<Database size={14} color={COLORS.royalBlue} />} title="Data Protection Layers">
            <SubHeading text="Sensitive Data Handling" />
            <Bullet text="Audio files (Biometric data)" color="#F87171" />
            <Bullet text="Transcription text (High protection)" color="#F87171" />

            <SubHeading text="Standard Identity Data" />
            <Bullet text="Encrypted user profile metrics" />
            <Bullet text="Secure authentication tokens" />
            <InfoBox text="Sensitive speech data is isolated and encrypted separately from your profile." />
          </Accordion>

          {/* Encryption */}
          <Accordion icon={<Lock size={14} color={COLORS.royalBlue} />} title="Encryption & Integrity" tagText="Advanced">
            <SubHeading icon={<Lock size={10} color={COLORS.royalBlue} />} text="How We Secure Your Voice" />
            <Bullet text="End-to-end encryption in transit" />
            <Bullet text="AES-256 at-rest storage standards" />
            <Bullet text="Hardware-level security modules" />
            <InfoBox text="No one at Articulink can access your private voice recordings." type="warning" />
          </Accordion>

          {/* Legal */}
          <Accordion icon={<Globe size={14} color={COLORS.royalBlue} />} title="Legal & Compliance" tagText="PH Compliant">
            <SubHeading text="Data Privacy Act of 2012" />
            <Bullet text="Fully strictly regulated by NPC" />
            <Bullet text="Global best practices (GDPR aligned)" />
            <InfoBox text="We undergo regular privacy impact assessments." />
          </Accordion>

          {/* Quote */}
          <YStack bg={COLORS.white} br={16} p="$3.5" mt="$1" mb="$2" bw={1} bc={COLORS.sandMid}>
            <XStack gap="$2.5" ai="flex-start">
              <Shield size={12} color={COLORS.royalBlue} mt={2} />
              <SizableText f={1} size="$1" color={COLORS.textMid} lh={17} fontStyle="italic" fow="500">
                "At Articulink, your voice belongs to you. Our mission is to amplify your speech, not compromise your identity."
              </SizableText>
            </XStack>
          </YStack>

          {/* Footer */}
          <YStack ai="center" mt="$6" pb="$2" opacity={0.5}>
            <XStack ai="center" gap="$1" mb="$1.5">
              <YStack w={12} h={1} bg={COLORS.textMid} />
              <ShieldCheck size={8} color={COLORS.textMid} />
              <YStack w={12} h={1} bg={COLORS.textMid} />
            </XStack>
            <SizableText size="$1" color={COLORS.textMid} fow="600" ls={1}>
              Articulink Security © 2026
            </SizableText>
          </YStack>
        </YStack>
      </Animated.ScrollView>
    </YStack>
  );
};

export default SecurityPrivacyScreen;
