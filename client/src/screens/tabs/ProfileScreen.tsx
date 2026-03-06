import React, { useState, useContext, useCallback, useRef, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  ActivityIndicator,
  RefreshControl,
  Platform,
  StatusBar,
  Animated,
  useWindowDimensions,
  UIManager,
  LayoutAnimation
} from "react-native";
import {
  User,
  Mail,
  Cake,
  Shield,
  Edit,
  LogOut,
  ChevronDown,
  CheckCircle,
  AlertTriangle,
  Settings,
} from "lucide-react-native";
import { AuthContext, AuthContextType } from "../../context/AuthContext";
import { useFocusEffect } from '@react-navigation/native';

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─── Brand Palette (matches StartUpScreen) ────────────────────────
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

// ─── Ambient Glow Pool (from StartUpScreen) ───────────────────────
interface GlowPoolProps { color: string; size: number; x: number; y: number; duration: number; delay: number; }

const GlowPool: React.FC<GlowPoolProps> = ({ color, size, x, y, duration, delay }) => {
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
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -12] });
  const scale = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.95, 1, 0.95] });

  return (
    <Animated.View style={{
      position: 'absolute',
      left: x - size / 2,
      top: y - size / 2,
      width: size,
      height: size * 0.68,
      transform: [{ translateY }, { scale }],
    }}>
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: size * 0.34, backgroundColor: color, opacity: 0.10 }} />
      <View style={{ position: 'absolute', top: size * 0.1, left: size * 0.1, right: size * 0.1, bottom: size * 0.1, borderRadius: size * 0.34, backgroundColor: color, opacity: 0.12 }} />
      <View style={{ position: 'absolute', top: size * 0.24, left: size * 0.24, right: size * 0.24, bottom: size * 0.24, borderRadius: size * 0.34, backgroundColor: color, opacity: 0.16 }} />
    </Animated.View>
  );
};

// ─── Ring Accent ──────────────────────────────────────────────────
interface RingAccentProps { color: string; size: number; x: number; y: number; opacity?: number; }
const RingAccent: React.FC<RingAccentProps> = ({ color, size, x, y, opacity = 0.07 }) => (
  <>
    <View style={{ position: 'absolute', left: x - size / 2, top: y - size / 2, width: size, height: size, borderRadius: size / 2, borderWidth: 1, borderColor: color, opacity }} />
    <View style={{ position: 'absolute', left: x - size * 0.65 / 2, top: y - size * 0.65 / 2, width: size * 0.65, height: size * 0.65, borderRadius: size * 0.325, borderWidth: 1, borderColor: color, opacity: opacity * 0.6 }} />
  </>
);

// ─── Diagonal Stripes ─────────────────────────────────────────────
const DiagonalStripes: React.FC<{ color: string; width: number; height: number }> = ({ color, width, height }) => {
  const stripes = useMemo(() => {
    const lines: { x1: number }[] = [];
    const gap = 38;
    const count = Math.ceil((width + height) / gap);
    for (let i = -4; i < count; i++) lines.push({ x1: i * gap });
    return lines;
  }, [width, height]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {stripes.map((s, i) => (
        <View key={i} style={{
          position: 'absolute', left: s.x1, top: 0,
          width: 1, height: Math.sqrt(2) * Math.max(width, height),
          backgroundColor: color, opacity: 0.02,
          transform: [{ rotate: '45deg' }, { translateX: -Math.sqrt(2) * Math.max(width, height) / 2 }],
        }} />
      ))}
    </View>
  );
};

// ─── Texture Dot Grid ─────────────────────────────────────────────
const TextureOverlay: React.FC<{ accentColor: string; width: number; height: number }> = ({ accentColor, width, height }) => {
  const dots = useMemo(() => {
    const cols = 14, rows = 22, items: { left: number; top: number; op: number }[] = [];
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++)
        items.push({ left: (width / cols) * c + (width / (cols * 2)), top: (height / rows) * r + (height / (rows * 2)), op: (r * cols + c) % 3 === 0 ? 0.05 : (r * cols + c) % 3 === 1 ? 0.025 : 0.012 });
    return items;
  }, [width, height]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {dots.map((d, i) => (
        <View key={i} style={{ position: 'absolute', left: d.left, top: d.top, width: 1.2, height: 1.2, borderRadius: 0.6, backgroundColor: accentColor, opacity: d.op }} />
      ))}
    </View>
  );
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
    <View style={styles.accordion}>
      <TouchableOpacity style={styles.accordionHeader} onPress={toggle} activeOpacity={0.7}>
        <View style={styles.accordionLeft}>
          <View style={styles.accordionIcon}>{icon}</View>
          <View style={styles.accordionTitleWrap}>
            <Text style={styles.accordionTitle}>{title}</Text>
            {tagText && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>{tagText}</Text>
              </View>
            )}
          </View>
        </View>
        <Animated.View style={{ transform: [{ rotate: rotation }] }}>
          <ChevronDown size={18} color={COLORS.textMid} />
        </Animated.View>
      </TouchableOpacity>
      {expanded && <View style={styles.accordionBody}>{children}</View>}
    </View>
  );
};

// ─── Sub Components ───────────────────────────────────────────────
const Bullet: React.FC<{ text: string; color?: string }> = ({ text, color = COLORS.royalBlue }) => (
  <View style={styles.bulletRow}>
    <View style={[styles.bullet, { backgroundColor: color }]} />
    <Text style={styles.bulletText}>{text}</Text>
  </View>
);

const SubHeading: React.FC<{ text: string }> = ({ text }) => (
  <View style={styles.subHeadingRow}>
    <Text style={styles.subHeading}>{text}</Text>
  </View>
);

const InfoBox: React.FC<{ text: string; type?: "info" | "warning" }> = ({ text, type = "info" }) => (
  <View style={[styles.infoBox, type === "warning" && styles.infoBoxWarning]}>
    {type === "warning"
      ? <AlertTriangle size={12} color="#D97706" style={{ marginRight: 8 }} />
      : <CheckCircle size={12} color={COLORS.royalBlue} style={{ marginRight: 8 }} />}
    <Text style={[styles.infoBoxText, type === "warning" && styles.infoBoxTextWarning]}>{text}</Text>
  </View>
);

// ─── Main Component ───────────────────────────────────────────────
const ProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const auth = useContext(AuthContext) as AuthContextType;
  const { logout, user, fetchUserProfile, loading: authLoading } = auth;
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { width, height } = useWindowDimensions();

  const glowPools = useMemo(() => ([
    { color: COLORS.orbBlue, size: width * 0.75, x: width * 0.92, y: height * 0.05, duration: 6200, delay: 0 },
    { color: COLORS.orbTeal, size: width * 0.55, x: width * 0.06, y: height * 0.45, duration: 7400, delay: 1100 },
    { color: COLORS.orbSand, size: width * 0.44, x: width * 0.68, y: height * 0.84, duration: 5800, delay: 600 },
  ]), [width, height]);

  const rings = useMemo(() => ([
    { color: COLORS.royalBlue, size: width * 0.55, x: width * 0.9, y: height * 0.1, opacity: 0.05 },
    { color: COLORS.teal, size: width * 0.38, x: width * 0.1, y: height * 0.42, opacity: 0.045 },
    { color: COLORS.royalBlue, size: width * 0.3, x: width * 0.75, y: height * 0.86, opacity: 0.04 },
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
    } else if (error.message?.includes("deactivated")) {
      setError("Account deactivated");
    } else {
      setError("Failed to load profile");
    }
  };

  useFocusEffect(useCallback(() => { loadProfile(); }, []));

  const onRefresh = () => { setRefreshing(true); loadProfile(); };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to logout?')) logout();
    } else {
      Alert.alert("Logout", "Are you sure?", [
        { text: "Cancel" },
        { text: "Logout", onPress: async () => await logout() }
      ]);
    }
  };

  if (authLoading || (refreshing && !user)) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.royalBlue} />
        <Text style={{ color: COLORS.textMid, marginTop: 10 }}>Loading...</Text>
      </View>
    );
  }

  if (error && !user) {
    return (
      <View style={styles.centered}>
        <AlertTriangle size={50} color="#FF3B30" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadProfile}>
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: COLORS.textMid, marginBottom: 20 }}>No profile data</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => logout()}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const fullName = user.first_name && user.last_name
    ? `${user.first_name} ${user.last_name}`
    : "Articulink User";

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* ── Background (matches StartUpScreen) ── */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {/* Cream base */}
        <View style={[StyleSheet.absoluteFill, { backgroundColor: COLORS.cream }]} />
        {/* Sand blobs */}
        <View style={{ position: 'absolute', top: -height * 0.1, right: -width * 0.18, width: width * 1.0, height: width * 1.0, borderRadius: width * 0.5, backgroundColor: COLORS.sandLight, opacity: 0.48 }} />
        <View style={{ position: 'absolute', bottom: -height * 0.08, left: -width * 0.22, width: width * 0.9, height: width * 0.9, borderRadius: width * 0.45, backgroundColor: COLORS.sandMid, opacity: 0.20 }} />
        <View style={{ position: 'absolute', top: height * 0.3, left: -width * 0.35, width: width * 0.75, height: width * 0.75, borderRadius: width * 0.375, backgroundColor: COLORS.orbBlue, opacity: 0.10 }} />
        {/* Texture layers */}
        <DiagonalStripes color={COLORS.royalBlue} width={width} height={height} />
        <TextureOverlay accentColor={COLORS.royalBlue} width={width} height={height} />
        {/* Glow pools */}
        {glowPools.map((p, i) => <GlowPool key={i} {...p} />)}
        {/* Ring accents */}
        {rings.map((r, i) => <RingAccent key={i} {...r} />)}
        {/* Corner brackets */}
        <View style={{ position: 'absolute', top: 58, left: 22, width: 34, height: 34, borderTopWidth: 1.5, borderLeftWidth: 1.5, borderColor: `${COLORS.royalBlue}28`, borderTopLeftRadius: 6 }} />
        <View style={{ position: 'absolute', bottom: 60, right: 22, width: 34, height: 34, borderBottomWidth: 1.5, borderRightWidth: 1.5, borderColor: `${COLORS.teal}28`, borderBottomRightRadius: 6 }} />
      </View>

      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={{ width: 40 }} />
        <View style={{ flex: 1 }} />
        <TouchableOpacity onPress={() => navigation.navigate("Settings")} style={styles.headerBtn} activeOpacity={0.7}>
          <Settings size={20} color={COLORS.deepNavy} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.royalBlue} />}
      >
        {/* ── Identity Banner (replaces hero avatar block) ── */}
        <View style={styles.identityBanner}>
          {/* Left accent bar */}
          <View style={styles.bannerAccentBar} />
          <View style={styles.bannerContent}>
            <View style={styles.bannerTopRow}>
              <View style={styles.bannerAvatar}>
                {user.profile_pic ? (
                  <Image source={{ uri: user.profile_pic }} style={styles.bannerAvatarImage} />
                ) : (
                  <Text style={styles.bannerInitialsText}>
                    {user.first_name?.[0] ?? ''}{user.last_name?.[0] ?? ''}
                  </Text>
                )}
              </View>
              <View style={[styles.statusChip, { backgroundColor: user.status === "active" ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.1)' }]}>
                <View style={[styles.statusDot, { backgroundColor: user.status === "active" ? '#22C55E' : '#EF4444' }]} />
                <Text style={[styles.statusChipText, { color: user.status === "active" ? '#15803D' : '#DC2626' }]}>
                  {user.status === "active" ? "Active" : "Inactive"}
                </Text>
              </View>
            </View>
            <Text style={styles.bannerName}>{fullName}</Text>
            <View style={styles.bannerMeta}>
              <View style={styles.rolePill}>
                <Text style={styles.rolePillText}>{user.role || "User"}</Text>
              </View>
              {user.email && (
                <Text style={styles.bannerEmail} numberOfLines={1}>{user.email}</Text>
              )}
            </View>
          </View>
          {/* Decorative waveform bars */}
          <View style={styles.bannerWave}>
            {[6, 12, 20, 14, 28, 18, 8, 24, 16, 10].map((h, i) => (
              <View key={i} style={{ width: 3, height: h, borderRadius: 1.5, backgroundColor: COLORS.royalBlue, opacity: 0.12, marginHorizontal: 2 }} />
            ))}
          </View>
        </View>

        {/* ── Sections ── */}
        <Accordion icon={<User size={16} color={COLORS.royalBlue} />} title="Personal Information" defaultOpen>
          <SubHeading text="Contact Details" />
          <Bullet text={user.email} />
          <Bullet text={user.birthdate ? `Born: ${new Date(user.birthdate).toLocaleDateString()}` : "Birthdate not set"} />
          <Bullet text={user.gender ? `Gender: ${user.gender.charAt(0).toUpperCase() + user.gender.slice(1)}` : "Gender not set"} />
          <InfoBox text="Your personal information is securely stored and never shared without consent." />
        </Accordion>

        <Accordion icon={<Shield size={16} color={COLORS.royalBlue} />} title="Account Security">
          <SubHeading text="Access Levels" />
          <Bullet text={`Role: ${user.role || "Standard User"}`} />
          <Bullet text={`Account Status: ${user.status === "active" ? "Active" : "Pending/Inactive"}`} />
          <InfoBox text="Keep your account secure by reviewing your security settings regularly." type="warning" />
        </Accordion>

        {/* ── Actions ── */}
        <View style={styles.actionContainer}>
          <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={() => navigation.navigate("EditProfile", { user })} activeOpacity={0.88}>
            <View style={styles.btnShimmer} />
            <Edit size={16} color={COLORS.white} />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, styles.logoutButton]} onPress={handleLogout} activeOpacity={0.88}>
            <LogOut size={16} color="#DC2626" />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* ── Footer ── */}
        <View style={styles.footer}>
          <View style={styles.footerDividerRow}>
            <View style={styles.footerLine} />
            {[4, 8, 12, 8, 4].map((h, i) => (
              <View key={i} style={{ width: 2.5, height: h, borderRadius: 1, backgroundColor: COLORS.teal, opacity: 0.3, marginHorizontal: 1.5 }} />
            ))}
            <View style={styles.footerLine} />
          </View>
          <Text style={styles.footerLabel}>ARTICULINK PROFILE ENGINE</Text>
          <Text style={styles.footerVersion}>v1.0.0 · Secure Session</Text>
        </View>
      </ScrollView>
    </View>
  );
};

// ─── Styles ──────────────────────────────────────────────────────
const CARD_SHADOW = Platform.select({
  ios: { shadowColor: '#8A96A4', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.10, shadowRadius: 20 },
  android: { elevation: 4 },
}) as any;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.cream },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 36 : 48,
    paddingBottom: 8,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.textDark,
    letterSpacing: -0.3,
  },
  headerBtn: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: "center", alignItems: "center",
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1, borderColor: COLORS.sandMid,
  },

  scrollContent: { paddingHorizontal: 20, paddingBottom: 60, paddingTop: 8 },

  /* Identity Banner */
  identityBanner: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.sandMid,
    marginBottom: 14,
    overflow: 'hidden',
    flexDirection: 'row',
    ...CARD_SHADOW,
  },
  bannerAccentBar: {
    width: 4,
    backgroundColor: COLORS.royalBlue,
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
  },
  bannerContent: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 18,
  },
  bannerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  bannerAvatar: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: `${COLORS.royalBlue}10`,
    borderWidth: 1.5,
    borderColor: `${COLORS.royalBlue}20`,
    justifyContent: 'center', alignItems: 'center',
    overflow: 'hidden',
  },
  bannerAvatarImage: {
    width: '100%',
    height: '100%',
  },
  bannerInitialsText: {
    fontSize: 18, fontWeight: '900',
    color: COLORS.royalBlue, letterSpacing: -0.5,
  },
  statusChip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 20, gap: 5,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusChipText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.4 },

  bannerName: {
    fontSize: 22, fontWeight: '900',
    color: COLORS.textDark, letterSpacing: -0.5,
    marginBottom: 8,
  },
  bannerMeta: {
    flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap',
  },
  rolePill: {
    backgroundColor: `${COLORS.royalBlue}0E`,
    borderWidth: 1, borderColor: `${COLORS.royalBlue}18`,
    paddingHorizontal: 10, paddingVertical: 3,
    borderRadius: 10,
  },
  rolePillText: {
    fontSize: 10, fontWeight: '800',
    color: COLORS.royalBlue, textTransform: 'uppercase', letterSpacing: 0.8,
  },
  bannerEmail: {
    fontSize: 13, color: COLORS.textMid, fontWeight: '500', flex: 1,
  },
  bannerWave: {
    position: 'absolute', bottom: 14, right: 16,
    flexDirection: 'row', alignItems: 'flex-end',
  },

  /* Accordion */
  accordion: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    marginBottom: 12,
    overflow: "hidden",
    ...CARD_SHADOW,
    borderWidth: 1,
    borderColor: COLORS.sandMid,
  },
  accordionHeader: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15, paddingHorizontal: 18,
  },
  accordionLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  accordionIcon: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: `${COLORS.royalBlue}0C`,
    justifyContent: "center", alignItems: "center", marginRight: 14,
  },
  accordionTitleWrap: {
    flex: 1, flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap",
  },
  accordionTitle: {
    fontSize: 14, fontWeight: "800",
    color: COLORS.textDark, letterSpacing: -0.2,
  },
  tag: {
    backgroundColor: `${COLORS.royalBlue}0A`,
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6,
  },
  tagText: {
    fontSize: 9, fontWeight: "800",
    color: COLORS.royalBlue, textTransform: 'uppercase', letterSpacing: 0.6,
  },
  accordionBody: {
    paddingHorizontal: 18, paddingBottom: 18, paddingTop: 4,
    borderTopWidth: 1, borderTopColor: COLORS.sandLight,
  },

  bulletRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 8 },
  bullet: { width: 5, height: 5, borderRadius: 2.5, marginTop: 7, marginRight: 10 },
  bulletText: { flex: 1, fontSize: 14, color: COLORS.textMid, lineHeight: 20, fontWeight: "500" },

  subHeadingRow: { marginTop: 14, marginBottom: 10 },
  subHeading: {
    fontSize: 10, fontWeight: "800",
    color: COLORS.royalBlue, textTransform: "uppercase",
    letterSpacing: 1.2, opacity: 0.75,
  },

  infoBox: {
    flexDirection: "row", alignItems: "flex-start",
    backgroundColor: `${COLORS.royalBlue}05`,
    padding: 12, borderRadius: 12, marginTop: 14,
    borderWidth: 1, borderColor: `${COLORS.royalBlue}10`,
  },
  infoBoxWarning: { backgroundColor: '#FFFDF0', borderColor: '#FFF1B8' },
  infoBoxText: { flex: 1, fontSize: 12.5, color: COLORS.royalBlue, lineHeight: 18, fontWeight: "600" },
  infoBoxTextWarning: { color: "#B45309" },

  /* Actions */
  actionContainer: { marginTop: 4, gap: 10 },
  actionButton: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    padding: 15, borderRadius: 16, overflow: 'hidden',
    ...CARD_SHADOW,
  },
  editButton: { backgroundColor: COLORS.royalBlue },
  btnShimmer: {
    position: 'absolute', top: 0, left: 0, width: '40%', height: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)', borderBottomRightRadius: 60,
  },
  editButtonText: { color: COLORS.white, fontWeight: "800", marginLeft: 8, fontSize: 14, letterSpacing: -0.1 },
  logoutButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1, borderColor: 'rgba(220,38,38,0.18)',
  },
  logoutButtonText: { color: "#DC2626", fontWeight: "800", marginLeft: 8, fontSize: 14, letterSpacing: -0.1 },

  /* Helpers */
  centered: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20, backgroundColor: COLORS.cream },
  errorText: { color: "#DC2626", marginVertical: 20, textAlign: "center", fontWeight: "600" },
  retryButton: { backgroundColor: COLORS.royalBlue, paddingHorizontal: 30, paddingVertical: 12, borderRadius: 12, marginTop: 10 },
  buttonText: { color: COLORS.white, fontWeight: "800" },

  /* Footer */
  footer: { alignItems: 'center', marginTop: 36 },
  footerDividerRow: {
    flexDirection: 'row', alignItems: 'center',
    width: '80%', marginBottom: 14, gap: 4,
  },
  footerLine: { flex: 1, height: 1, backgroundColor: COLORS.sandMid },
  footerLabel: {
    fontSize: 10, color: COLORS.royalBlue,
    fontWeight: "800", letterSpacing: 2.2, marginBottom: 5,
  },
  footerVersion: { fontSize: 11, color: COLORS.textMid, fontWeight: "600" },
});

export default ProfileScreen;