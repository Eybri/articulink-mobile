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
  Mic,
  Clock,
  TrendingUp,
  Zap,
  Flame,
  BarChart2,
  Bell,
} from "@tamagui/lucide-icons";
import { AuthContext, AuthContextType } from "../../context/AuthContext";
import { useFocusEffect } from "@react-navigation/native";
import Svg, { Path } from "react-native-svg";

// ─── Brand Palette ────────────────────────────────────────────────
const COLORS = {
  cream: "#FAF8F4",
  warmWhite: "#F5F1EA",
  sandLight: "#EDE8DF",
  sandMid: "#DDD6C8",
  deepNavy: "#0F2847",
  royalBlue: "#1A4480",
  mediumBlue: "#2A5FA8",
  teal: "#2A8FA0",
  tealLight: "#3DAFC4",
  orbBlue: "#C8D8EE",
  orbTeal: "#BEE4EC",
  orbSand: "#E8E0D0",
  textDark: "#1C2B3A",
  textMid: "#4A5A6A",
  white: "#FFFFFF",
  amber: "#E8A23D",
  blue: "#3D7EE8",
};

// ─── Soft Orb ─────────────────────────────────────────────────────
interface SoftOrbProps {
  color: string;
  size: number;
  x: number;
  y: number;
  duration: number;
  delay: number;
}

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
    animations.forEach((a) => a.start());
    return () => animations.forEach((a) => a.stop());
  }, []);

  return (
    <XStack ai="flex-end" gap="$1">
      {barHeights.map((h, i) => {
        const scaleY = barAnims[i].interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] });
        return (
          <Animated.View
            key={i}
            style={{
              width: 3,
              height: h,
              borderRadius: 1.5,
              backgroundColor: color,
              opacity: 0.18,
              marginHorizontal: 1,
              transform: [{ scaleY }],
            }}
          />
        );
      })}
    </XStack>
  );
};

// ─── Speech Progress Arc ──────────────────────────────────────────
interface SpeechProgressCardProps {
  sessions: number;
  hoursToday: number;
  clarityPct: number;
  progressPct: number;
  onContinue?: () => void;
}

const SpeechProgressCard: React.FC<SpeechProgressCardProps> = ({
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

  // SVG arc math: segmented semi-circle
  const R = 45;
  const totalArcLength = Math.PI * R; // ~141

  return (
    <YStack bg={COLORS.royalBlue} br={28} p="$4" mb="$5" ov="hidden" elevation={8} shadowColor={COLORS.deepNavy}>
      {/* Glossy top highlight */}
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

      {/* Stats row */}
      <XStack ai="center" gap="$3" mb="$4">
        <XStack ai="center" gap="$1">
          <Mic size={14} color="white" opacity={0.8} />
          <SizableText size="$2" color="white" fow="600" opacity={0.9}>
            {sessions} Sessions
          </SizableText>
        </XStack>
        <XStack ai="center" gap="$1">
          <Clock size={14} color="white" opacity={0.8} />
          <SizableText size="$2" color="white" fow="600" opacity={0.9}>
            {hoursToday.toFixed(1)} Hrs
          </SizableText>
        </XStack>
        <XStack ai="center" gap="$1">
          <TrendingUp size={14} color="white" opacity={0.8} />
          <SizableText size="$2" color="white" fow="600" opacity={0.9}>
            {clarityPct}% Clarity
          </SizableText>
        </XStack>
      </XStack>

      {/* Main Gauge Section */}
      <XStack ai="flex-end" jc="space-between">
        <YStack w={140} h={85} ai="center" jc="flex-end">
          <Svg width={140} height={85} viewBox="0 0 120 75">
            {/* Background segments */}
            <Path
              d="M15,65 A45,45 0 0,1 105,65"
              fill="none"
              stroke="rgba(255,255,255,0.15)"
              strokeWidth={10}
              strokeLinecap="round"
              strokeDasharray="4 2"
            />
            {/* Foreground segments */}
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
interface StatCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  delta?: string;
  accentColor: string;
  iconBg: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label, delta, accentColor, iconBg }) => (
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
interface AccordionProps {
  icon: React.ReactNode;
  title: string;
  tagText?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  accentColor?: string;
}

const Accordion: React.FC<AccordionProps> = ({
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

// ─── Sub Components ───────────────────────────────────────────────
const Bullet: React.FC<{ text: string | undefined; color?: string }> = ({
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

const SubHeading: React.FC<{ text: string }> = ({ text }) => (
  <YStack mt="$3" mb="$2">
    <SizableText size="$1" fow="800" color={COLORS.royalBlue} tt="uppercase" ls={1.2} opacity={0.75}>
      {text}
    </SizableText>
  </YStack>
);

const InfoBox: React.FC<{ text: string; type?: "info" | "warning" }> = ({ text, type = "info" }) => (
  <XStack
    ai="flex-start"
    bg={type === "warning" ? "#FFFDF0" : `${COLORS.royalGreen}05`}
    p="$3"
    br={12}
    mt="$3"
    bw={1}
    bc={type === "warning" ? "#FFF1B8" : `${COLORS.royalGreen}10`}
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

const SectionLabel: React.FC<{ text: string }> = ({ text }) => (
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

// ─── Main Component ───────────────────────────────────────────────
const ProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const auth = useContext(AuthContext) as AuthContextType;
  const { logout, user, fetchUserProfile, loading: authLoading } = auth;
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { width, height } = useWindowDimensions();

  // ── Replace with real analytics from your API ──
  const analytics = {
    clarityScore: 84,
    totalSessions: 147,
    avgResponseSec: 3.2,
    streakDays: 14,
    todaySessions: 12,
    todayHours: 2.3,
    todayClarityPct: 84,
    todayProgressPct: 70,
  };

  const orbs = useMemo(
    () => [
      { color: COLORS.orbBlue, size: width * 0.65, x: width * 0.88, y: height * 0.07, duration: 6000, delay: 0 },
      { color: COLORS.orbTeal, size: width * 0.5, x: width * 0.1, y: height * 0.48, duration: 7200, delay: 1000 },
      { color: COLORS.orbSand, size: width * 0.38, x: width * 0.62, y: height * 0.8, duration: 5500, delay: 500 },
    ],
    [width, height]
  );

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
      Alert.alert("Session Expired", "Please log in again", [
        { text: "OK", onPress: () => logout() },
      ]);
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

  const fullName =
    user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : "Articulink User";

  const memberSince = user.created_at
    ? `Member since ${new Date(user.created_at).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    })}`
    : null;

  return (
    <YStack f={1} bg={COLORS.cream}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Background Orbs */}
      <ZStack pos="absolute" fullscreen pointerEvents="none">
        <Circle pos="absolute" t={-height * 0.1} r={-width * 0.15} size={width * 0.95} bg={COLORS.sandLight} opacity={0.55} />
        <Circle pos="absolute" b={-height * 0.06} l={-width * 0.2} size={width * 0.8} bg={COLORS.sandMid} opacity={0.22} />
        {orbs.map((orb, i) => <SoftOrb key={i} {...orb} />)}
        <YStack pos="absolute" t={58} l={22} w={34} h={34} borderTopWidth={1.5} borderLeftWidth={1.5} bc={`${COLORS.royalBlue}28`} br={6} />
        <YStack pos="absolute" b={60} r={22} w={34} h={34} borderBottomWidth={1.5} borderRightWidth={1.5} bc={`${COLORS.teal}28`} br={6} />
      </ZStack>

      <ScrollView
        f={1}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 60,
          paddingTop: Platform.OS === "android" ? 48 : 54,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.royalBlue} />
        }
      >
        {/* ── Identity Header (Copied from image) ── */}
        <XStack ai="center" jc="space-between" mb="$5" pt="$2">
          <XStack ai="center" gap="$3">
            {/* Avatar Circle */}
            <YStack w={56} h={56} br={28} jc="center" ai="center" bw={1.5} bc={COLORS.sandMid} ov="hidden">
              {user.profile_pic ? (
                <RNImage
                  key={user.profile_pic}
                  source={{ uri: user.profile_pic }}
                  style={{ width: 56, height: 56, borderRadius: 28 }}
                  resizeMode="cover"
                />
              ) : (
                <YStack f={1} w="100%" bg={COLORS.royalBlue} jc="center" ai="center">
                  <SizableText size="$5" fow="900" color="white">
                    {user.first_name?.[0] ?? ""}{user.last_name?.[0] ?? ""}
                  </SizableText>
                </YStack>
              )}
            </YStack>
            
            <YStack>
              <SizableText size="$3" color={COLORS.textMid} fow="600">
                Good Afternoon,
              </SizableText>
              <SizableText size="$7" fow="900" color={COLORS.textDark} ls={-0.5} mt={-4}>
                {user.first_name || "Speaker"}!
              </SizableText>
            </YStack>
          </XStack>

          <Button
            size={48}
            br={24}
            bg="white"
            bw={1}
            bc={COLORS.sandMid}
            pressStyle={{ scale: 0.95, bg: COLORS.cream }}
            icon={<Bell size={20} color={COLORS.textMid} />}
          />
        </XStack>

        {/* ── Speech Progress Arc ── */}
        <SpeechProgressCard
          sessions={analytics.todaySessions}
          hoursToday={analytics.todayHours}
          clarityPct={analytics.todayClarityPct}
          progressPct={analytics.todayProgressPct}
          onContinue={() => navigation.navigate("Session")}
        />

        {/* ── Analytics Stats ── */}
        <SectionLabel text="Analytics" />
        <XStack gap="$3" mb="$3">
          <StatCard
            icon={<TrendingUp size={14} color={COLORS.teal} />}
            value={`${analytics.clarityScore}%`}
            label="Clarity Score"
            delta="↑ +6% this week"
            accentColor={COLORS.teal}
            iconBg={`${COLORS.teal}14`}
          />
          <StatCard
            icon={<BarChart2 size={14} color={COLORS.blue} />}
            value={`${analytics.totalSessions}`}
            label="Total Sessions"
            delta="↑ +12 this week"
            accentColor={COLORS.blue}
            iconBg={`${COLORS.blue}14`}
          />
        </XStack>
        <XStack gap="$3" mb="$4">
          <StatCard
            icon={<Zap size={14} color={COLORS.amber} />}
            value={`${analytics.avgResponseSec}s`}
            label="Avg. Response"
            delta="↓ −0.4s improved"
            accentColor={COLORS.amber}
            iconBg={`${COLORS.amber}14`}
          />
          <StatCard
            icon={<Flame size={14} color={COLORS.royalBlue} />}
            value={`${analytics.streakDays}`}
            label="Day Streak"
            delta="Personal best!"
            accentColor={COLORS.royalBlue}
            iconBg={`${COLORS.royalBlue}10`}
          />
        </XStack>

        {/* ── Personal Info ── */}
        <Accordion
          icon={<User size={16} color={COLORS.royalBlue} />}
          title="Personal Information"
          defaultOpen
          accentColor={COLORS.royalBlue}
        >
          <SubHeading text="Contact Details" />
          <Bullet text={user.email} />
          <Bullet
            text={user.birthdate ? `Born: ${new Date(user.birthdate).toLocaleDateString()}` : "Birthdate not set"}
          />
          <Bullet
            text={user.gender ? `Gender: ${user.gender.charAt(0).toUpperCase() + user.gender.slice(1)}` : "Gender not set"}
          />
          <InfoBox text="Your personal information is securely stored and never shared without consent." />
        </Accordion>

        {/* ── Account Security ── */}
        <Accordion
          icon={<Shield size={16} color={COLORS.teal} />}
          title="Account Security"
          accentColor={COLORS.teal}
        >
          <SubHeading text="Access Levels" />
          <Bullet text={`Role: ${user.role || "Standard User"}`} color={COLORS.teal} />
          <Bullet
            text={`Account Status: ${user.status === "active" ? "Active" : "Pending/Inactive"}`}
            color={COLORS.teal}
          />
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
            shadowColor={COLORS.royalBlue}
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
                { text: "Logout", onPress: async () => await logout() },
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