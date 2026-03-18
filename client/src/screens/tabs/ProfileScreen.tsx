import React, { useState, useContext, useCallback, useRef, useEffect, useMemo } from "react";
import {
  StyleSheet,
  Alert,
  Platform,
  StatusBar,
  Animated,
  useWindowDimensions,
  LayoutAnimation,
  RefreshControl,
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
  Spinner,
  Theme,
  AnimatePresence,
} from "tamagui";
import {
  User,
  Mail,
  Cake,
  Shield,
  Edit3,
  LogOut,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
} from "@tamagui/lucide-icons";
import { AuthContext, AuthContextType } from "../../context/AuthContext";
import { useFocusEffect } from '@react-navigation/native';

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
interface SoftOrbProps { color: string; size: number; x: number; y: number; duration: number; delay: number; }

const SoftOrb: React.FC<SoftOrbProps> = ({ color, size, x, y, duration, delay }) => {
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

// ─── Animated Waveform Bars ───────────────────────────────────────
const AnimatedWaveform: React.FC<{ color: string }> = ({ color }) => {
  const barHeights = [6, 12, 20, 14, 28, 18, 8, 24, 16, 10];
  const barAnims = useRef(barHeights.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const animations = barAnims.map((anim, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 80),
          Animated.timing(anim, { toValue: 1, duration: 500 + (i % 4) * 120, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 500 + (i % 4) * 120, useNativeDriver: true }),
        ])
      )
    );
    animations.forEach(a => a.start());
    return () => animations.forEach(a => a.stop());
  }, []);

  return (
    <XStack ai="flex-end" gap="$1">
      {barHeights.map((h, i) => {
        const scaleY = barAnims[i].interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] });
        return (
          <Animated.View key={i} style={{
            width: 3, height: h,
            borderRadius: 1.5,
            backgroundColor: color,
            opacity: 0.18,
            marginHorizontal: 1,
            transform: [{ scaleY }],
          }} />
        );
      })}
    </XStack>
  );
};

// ─── Accordion ────────────────────────────────────────────────────
interface AccordionProps {
  icon: React.ReactNode;
  title: string;
  tagText?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  accentColor?: string;
}

const Accordion: React.FC<AccordionProps> = ({ icon, title, tagText, children, defaultOpen = false, accentColor = COLORS.royalBlue }) => {
  const [expanded, setExpanded] = useState(defaultOpen);
  const rotateAnim = useRef(new Animated.Value(defaultOpen ? 1 : 0)).current;

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    Animated.timing(rotateAnim, { toValue: expanded ? 0 : 1, duration: 200, useNativeDriver: true }).start();
    setExpanded(!expanded);
  };

  const rotation = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] });

  return (
    <YStack bg="white" br={22} mb="$3" ov="hidden" elevation={5} shadowColor="#8A96A4" bw={1} bc={COLORS.sandMid}>
      {/* Top accent */}
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

// ─── Sub Components ───────────────────────────────────────────────
const Bullet: React.FC<{ text: string | undefined; color?: string }> = ({ text, color = COLORS.royalBlue }) => (
  <XStack ai="flex-start" mb="$2" gap="$2">
    <Circle size={5} mt={7} bg={color} />
    <SizableText f={1} size="$3" color={COLORS.textMid} lh={20} fow="500">
      {text}
    </SizableText>
  </XStack>
);

const SubHeading: React.FC<{ text: string }> = ({ text }) => (
  <YStack mt="$3" mb="$2">
    <SizableText size="$1" fow="800" color={COLORS.royalBlue} tt="uppercase" ls={1.2} opacity={0.75}>
      {text}
    </SizableText>
  </YStack>
);

const InfoBox: React.FC<{ text: string; type?: "info" | "warning" }> = ({ text, type = "info" }) => (
  <XStack ai="flex-start" bg={type === "warning" ? '#FFFDF0' : `${COLORS.royalBlue}05`} p="$3" br={12} mt="$3" bw={1} bc={type === "warning" ? '#FFF1B8' : `${COLORS.royalBlue}10`} gap="$2">
    {type === "warning"
      ? <AlertTriangle size={12} color="#D97706" mt={3} />
      : <CheckCircle size={12} color={COLORS.royalBlue} mt={3} />}
    <SizableText f={1} size="$2" color={type === "warning" ? "#B45309" : COLORS.royalBlue} lh={18} fow="600">
      {text}
    </SizableText>
  </XStack>
);

// ─── Main Component ───────────────────────────────────────────────
const ProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const auth = useContext(AuthContext) as AuthContextType;
  const { logout, user, fetchUserProfile, loading: authLoading } = auth;
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { width, height } = useWindowDimensions();

  const orbs = useMemo(() => ([
    { color: COLORS.orbBlue, size: width * 0.65, x: width * 0.88, y: height * 0.07, duration: 6000, delay: 0 },
    { color: COLORS.orbTeal, size: width * 0.5, x: width * 0.1, y: height * 0.48, duration: 7200, delay: 1000 },
    { color: COLORS.orbSand, size: width * 0.38, x: width * 0.62, y: height * 0.8, duration: 5500, delay: 500 },
  ]), [width, height]);

  const loadProfile = async () => {
    try {
      setError(null);
      await fetchUserProfile();
    } catch (error: any) {
      handleProfileError(error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleProfileError = (error: any) => {
    if (error.message?.includes("Session expired") || error.response?.status === 401) {
      setError("Session expired");
      Alert.alert("Session Expired", "Please log in again", [{ text: "OK", onPress: () => logout() }]);
    } else {
      setError("Failed to load profile");
    }
  };

  useFocusEffect(useCallback(() => { loadProfile(); }, []));

  const onRefresh = () => { setRefreshing(true); loadProfile(); };

  if (authLoading || (refreshing && !user)) {
    return (
      <YStack f={1} jc="center" ai="center" bg={COLORS.cream}>
        <Spinner size="large" color={COLORS.royalBlue} />
        <SizableText color={COLORS.textMid} mt="$2">Loading...</SizableText>
      </YStack>
    );
  }

  if (error && !user) {
    return (
      <YStack f={1} jc="center" ai="center" bg={COLORS.cream} p="$5">
        <AlertTriangle size={50} color="#FF3B30" />
        <SizableText color="#DC2626" fow="600" ta="center" mt="$4">{error}</SizableText>
        <Button bg={COLORS.royalBlue} mt="$4" onPress={loadProfile}>
            <SizableText color="white" fow="800">Retry</SizableText>
        </Button>
      </YStack>
    );
  }

  if (!user) {
    return (
      <YStack f={1} jc="center" ai="center" bg={COLORS.cream} p="$5">
        <SizableText color={COLORS.textMid} mb="$4">No profile data</SizableText>
        <Button bg={COLORS.royalBlue} onPress={() => logout()}>
            <SizableText color="white" fow="800">Login</SizableText>
        </Button>
      </YStack>
    );
  }

  const fullName = user.first_name && user.last_name
    ? `${user.first_name} ${user.last_name}`
    : "Articulink User";

  const memberSince = user.created_at
    ? `Member since ${new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
    : null;

  return (
    <YStack f={1} bg={COLORS.cream}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Background Orbs */}
      <ZStack pos="absolute" fullscreen pointerEvents="none">
        <Circle pos="absolute" t={-height * 0.1} r={-width * 0.15} size={width * 0.95} bg={COLORS.sandLight} opacity={0.55} />
        <Circle pos="absolute" b={-height * 0.06} l={-width * 0.2} size={width * 0.8} bg={COLORS.sandMid} opacity={0.22} />
        {orbs.map((orb, i) => <SoftOrb key={i} {...orb} />)}
        
        {/* Corner Brackets */}
        <YStack pos="absolute" t={58} l={22} w={34} h={34} borderTopWidth={1.5} borderLeftWidth={1.5} bc={`${COLORS.royalBlue}28`} br={6} />
        <YStack pos="absolute" b={60} r={22} w={34} h={34} borderBottomWidth={1.5} borderRightWidth={1.5} bc={`${COLORS.teal}28`} br={6} />
      </ZStack>

      <ScrollView
        f={1}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 60, paddingTop: 8 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.royalBlue} />}
      >
        {/* ── Identity Banner ── */}
        <Card bg="white" br={24} bw={1} bc={COLORS.sandMid} mb="$4" flexDirection="row" ov="hidden" elevation={5} shadowColor="#8A96A4">
          <YStack w={4} bg={COLORS.royalBlue} />
          <YStack pos="absolute" t={0} l={0} r={0} h={65} bg={`${COLORS.royalBlue}07`} br={24} />
          
          <YStack f={1} p="$4" pt="$5">
            <XStack ai="center" jc="space-between" mb="$3">
              <YStack w={68} h={68} jc="center" ai="center">
                <Circle pos="absolute" size={68} bg={COLORS.orbBlue} opacity={0.5} />
                <YStack w={56} h={56} br={16} bg={`${COLORS.royalBlue}10`} bw={2} bc={`${COLORS.royalBlue}22`} jc="center" ai="center" ov="hidden">
                  {user.profile_pic ? (
                    <RNImage 
                      key={user.profile_pic}
                      source={{ uri: user.profile_pic }} 
                      style={{ width: 56, height: 56, borderRadius: 14 }}
                      resizeMode="cover"
                    />
                  ) : (
                    <SizableText size="$6" fow="900" color={COLORS.royalBlue} ls={-0.5}>
                      {user.first_name?.[0] ?? ''}{user.last_name?.[0] ?? ''}
                    </SizableText>
                  )}
                </YStack>
              </YStack>
              
              <XStack ai="center" bg={user.status === "active" ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.1)'} px="$3" py="$1" br={20} gap="$2">
                <Circle size={6} bg={user.status === "active" ? '#22C55E' : '#EF4444'} />
                <SizableText size="$1" fow="800" color={user.status === "active" ? '#15803D' : '#DC2626'} ls={0.4}>
                  {user.status === "active" ? "Active" : "Inactive"}
                </SizableText>
              </XStack>
            </XStack>

            <SizableText size="$7" fow="900" color={COLORS.textDark} ls={-0.5} mb="$2">
              {fullName}
            </SizableText>

            <XStack ai="center" gap="$2" fw="wrap">
              <YStack bg={`${COLORS.royalBlue}0E`} bw={1} bc={`${COLORS.royalBlue}18`} px="$3" py="$1" br={10}>
                <SizableText size="$1" fow="800" color={COLORS.royalBlue} tt="uppercase" ls={0.8}>
                  {user.role || "User"}
                </SizableText>
              </YStack>
              {user.email && (
                <SizableText size="$3" color={COLORS.textMid} fow="500" f={1} numberOfLines={1}>
                  {user.email}
                </SizableText>
              )}
            </XStack>

            {memberSince && (
              <SizableText size="$2" color={COLORS.textMid} fow="600" mt="$3" opacity={0.7} ls={0.2}>
                {memberSince}
              </SizableText>
            )}

            <YStack pos="absolute" b={16} r={16}>
              <AnimatedWaveform color={COLORS.royalBlue} />
            </YStack>
          </YStack>
          <YStack pos="absolute" b={0} l={0} r={0} h={3} bg={COLORS.royalBlue} />
        </Card>

        {/* ── Sections ── */}
        <Accordion icon={<User size={16} color={COLORS.royalBlue} />} title="Personal Information" defaultOpen accentColor={COLORS.royalBlue}>
          <SubHeading text="Contact Details" />
          <Bullet text={user.email} />
          <Bullet text={user.birthdate ? `Born: ${new Date(user.birthdate).toLocaleDateString()}` : "Birthdate not set"} />
          <Bullet text={user.gender ? `Gender: ${user.gender.charAt(0).toUpperCase() + user.gender.slice(1)}` : "Gender not set"} />
          <InfoBox text="Your personal information is securely stored and never shared without consent." />
        </Accordion>

        <Accordion icon={<Shield size={16} color={COLORS.teal} />} title="Account Security" accentColor={COLORS.teal}>
          <SubHeading text="Access Levels" />
          <Bullet text={`Role: ${user.role || "Standard User"}`} color={COLORS.teal} />
          <Bullet text={`Account Status: ${user.status === "active" ? "Active" : "Pending/Inactive"}`} color={COLORS.teal} />
          <InfoBox text="Keep your account secure by reviewing your security settings regularly." type="warning" />
        </Accordion>

        {/* ── Actions ── */}
        <YStack gap="$3" mt="$2">
          <Button
            size="$5"
            bg={COLORS.royalBlue}
            br={18}
            onPress={() => navigation.navigate("EditProfile", { user })}
            pressStyle={{ scale: 0.98 }}
            icon={<Edit3 size={16} color="white" />}
            iconAfter={<ChevronRight size={18} color="rgba(255,255,255,0.6)" />}
            elevation={6}
            shadowColor="#1A4480"
          >
            <SizableText color="white" fow="800" size="$4" ml="$2">Edit Profile</SizableText>
          </Button>

          <Button
            size="$5"
            bg="white"
            br={18}
            onPress={() => {
                Alert.alert("Logout", "Are you sure?", [
                    { text: "Cancel" },
                    { text: "Logout", onPress: async () => await logout() }
                ]);
            }}
            pressStyle={{ scale: 0.98 }}
            icon={<LogOut size={16} color="#DC2626" />}
            iconAfter={<ChevronRight size={18} color="rgba(220,38,38,0.4)" />}
            bw={1}
            bc="rgba(220,38,38,0.18)"
            elevation={5}
            shadowColor="#8A96A4"
          >
            <SizableText color="#DC2626" fow="800" size="$4" ml="$2">Logout</SizableText>
          </Button>
        </YStack>
      </ScrollView>
    </YStack>
  );
};

export default ProfileScreen;