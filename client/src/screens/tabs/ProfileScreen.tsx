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
  ChevronRight,
  CheckCircle,
  AlertTriangle,

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

// ─── Soft Orb (from StartUpScreen) ────────────────────────────────
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
      <View style={{
        position: 'absolute',
        top: size * 0.15, left: size * 0.15,
        width: size * 0.7, height: size * 0.7,
        borderRadius: size * 0.35,
        backgroundColor: COLORS.white,
        opacity: 0.35,
      }} />
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
    <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
      {barHeights.map((h, i) => {
        const scaleY = barAnims[i].interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] });
        return (
          <Animated.View key={i} style={{
            width: 3, height: h,
            borderRadius: 1.5,
            backgroundColor: color,
            opacity: 0.18,
            marginHorizontal: 2,
            transform: [{ scaleY }],
          }} />
        );
      })}
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
    <View style={styles.accordion}>
      {/* Top accent bar */}
      <View style={[styles.accordionTopBar, { backgroundColor: accentColor }]} />
      {/* Subtle top glow */}
      <View style={[styles.accordionTopGlow, { backgroundColor: `${accentColor}07` }]} />
      <TouchableOpacity style={styles.accordionHeader} onPress={toggle} activeOpacity={0.7}>
        <View style={styles.accordionLeft}>
          <View style={[styles.accordionIcon, { backgroundColor: `${accentColor}0C` }]}>{icon}</View>
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

  // SoftOrbs — matching StartUpScreen's layered feel
  const orbs = useMemo(() => ([
    { color: COLORS.orbBlue, size: width * 0.65, x: width * 0.88, y: height * 0.07, duration: 6000, delay: 0 },
    { color: COLORS.orbTeal, size: width * 0.5, x: width * 0.1, y: height * 0.48, duration: 7200, delay: 1000 },
    { color: COLORS.orbSand, size: width * 0.38, x: width * 0.62, y: height * 0.8, duration: 5500, delay: 500 },
  ]), [width, height]);

  // Dot grid — matching StartUpScreen
  const dotGrid = useMemo(() => {
    const items: { left: number; top: number }[] = [];
    for (let row = 0; row < 9; row++)
      for (let col = 0; col < 6; col++)
        items.push({
          left: (width / 6) * col + (width / 12),
          top: (height / 9) * row + (height / 18),
        });
    return items;
  }, [width, height]);

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

  const memberSince = user.created_at
    ? `Member since ${new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
    : null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* ── Layered Background (matches StartUpScreen) ── */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {/* Cream base */}
        <View style={[StyleSheet.absoluteFill, { backgroundColor: COLORS.cream }]} />

        {/* Warm sand bloom — top right */}
        <View style={{
          position: 'absolute', top: -height * 0.1, right: -width * 0.15,
          width: width * 0.95, height: width * 0.95, borderRadius: width * 0.475,
          backgroundColor: COLORS.sandLight, opacity: 0.55,
        }} />

        {/* Warm sand swell — bottom left */}
        <View style={{
          position: 'absolute', bottom: -height * 0.06, left: -width * 0.2,
          width: width * 0.8, height: width * 0.8, borderRadius: width * 0.4,
          backgroundColor: COLORS.sandMid, opacity: 0.22,
        }} />

        {/* Animated soft orbs */}
        {orbs.map((orb, i) => <SoftOrb key={i} {...orb} />)}

        {/* Subtle dot grid */}
        {dotGrid.map((d, i) => (
          <View key={i} style={{
            position: 'absolute', width: 2, height: 2, borderRadius: 1,
            backgroundColor: COLORS.royalBlue, opacity: 0.055,
            left: d.left, top: d.top,
          }} />
        ))}

        {/* Corner bracket — top left */}
        <View style={{
          position: 'absolute', top: 58, left: 22, width: 34, height: 34,
          borderTopWidth: 1.5, borderLeftWidth: 1.5,
          borderColor: `${COLORS.royalBlue}28`, borderTopLeftRadius: 6,
        }} />
        {/* Corner bracket — bottom right */}
        <View style={{
          position: 'absolute', bottom: 60, right: 22, width: 34, height: 34,
          borderBottomWidth: 1.5, borderRightWidth: 1.5,
          borderColor: `${COLORS.teal}28`, borderBottomRightRadius: 6,
        }} />
      </View>



      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.royalBlue} />}
      >
        {/* ── Identity Banner ── */}
        <View style={styles.identityBanner}>
          {/* Left accent bar */}
          <View style={styles.bannerAccentBar} />
          {/* Subtle top glow */}
          <View style={styles.bannerTopGlow} />
          <View style={styles.bannerContent}>
            <View style={styles.bannerTopRow}>
              {/* Avatar with halo */}
              <View style={styles.avatarContainer}>
                <View style={styles.avatarHalo} />
                <View style={styles.bannerAvatar}>
                  {user.profile_pic ? (
                    <Image source={{ uri: user.profile_pic }} style={styles.bannerAvatarImage} />
                  ) : (
                    <Text style={styles.bannerInitialsText}>
                      {user.first_name?.[0] ?? ''}{user.last_name?.[0] ?? ''}
                    </Text>
                  )}
                </View>
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
            {memberSince && (
              <Text style={styles.memberSince}>{memberSince}</Text>
            )}
          </View>
          {/* Animated waveform decoration */}
          <View style={styles.bannerWave}>
            <AnimatedWaveform color={COLORS.royalBlue} />
          </View>
          {/* Bottom accent bar */}
          <View style={styles.bannerBottomBar} />
        </View>

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
        <View style={styles.actionContainer}>
          <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={() => navigation.navigate("EditProfile", { user })} activeOpacity={0.88}>
            <View style={styles.btnShimmer} />
            <Edit size={16} color={COLORS.white} />
            <Text style={styles.editButtonText}>Edit Profile</Text>
            <View style={{ flex: 1 }} />
            <ChevronRight size={18} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, styles.logoutButton]} onPress={handleLogout} activeOpacity={0.88}>
            <LogOut size={16} color="#DC2626" />
            <Text style={styles.logoutButtonText}>Logout</Text>
            <View style={{ flex: 1 }} />
            <ChevronRight size={18} color="rgba(220,38,38,0.4)" />
          </TouchableOpacity>
        </View>


      </ScrollView>
    </View>
  );
};

// ─── Styles ──────────────────────────────────────────────────────
const CARD_SHADOW = Platform.select({
  ios: { shadowColor: '#8A96A4', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 22 },
  android: { elevation: 5 },
}) as any;

const BTN_SHADOW = Platform.select({
  ios: { shadowColor: '#1A4480', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 14 },
  android: { elevation: 6 },
}) as any;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.cream },


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
  bannerTopGlow: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 65,
    backgroundColor: `${COLORS.royalBlue}07`,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
  },
  bannerContent: {
    flex: 1,
    paddingVertical: 22,
    paddingHorizontal: 18,
  },
  bannerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  avatarContainer: {
    position: 'relative',
    width: 68, height: 68,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarHalo: {
    position: 'absolute',
    width: 68, height: 68, borderRadius: 20,
    backgroundColor: COLORS.orbBlue,
    opacity: 0.5,
  },
  bannerAvatar: {
    width: 56, height: 56, borderRadius: 16,
    backgroundColor: `${COLORS.royalBlue}10`,
    borderWidth: 2,
    borderColor: `${COLORS.royalBlue}22`,
    justifyContent: 'center', alignItems: 'center',
    overflow: 'hidden',
  },
  bannerAvatarImage: {
    width: '100%',
    height: '100%',
  },
  bannerInitialsText: {
    fontSize: 20, fontWeight: '900',
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
    fontSize: 24, fontWeight: '900',
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
  memberSince: {
    fontSize: 12, color: COLORS.textMid, fontWeight: '600',
    marginTop: 10, opacity: 0.7, letterSpacing: 0.2,
  },
  bannerWave: {
    position: 'absolute', bottom: 16, right: 16,
  },
  bannerBottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: 3,
    backgroundColor: COLORS.royalBlue,
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
  },

  /* Accordion */
  accordion: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    marginBottom: 12,
    overflow: "hidden",
    ...CARD_SHADOW,
    borderWidth: 1,
    borderColor: COLORS.sandMid,
  },
  accordionTopBar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    height: 3,
    borderTopLeftRadius: 22, borderTopRightRadius: 22,
  },
  accordionTopGlow: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 50,
    borderTopLeftRadius: 22, borderTopRightRadius: 22,
  },
  accordionHeader: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16, paddingHorizontal: 18,
  },
  accordionLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  accordionIcon: {
    width: 36, height: 36, borderRadius: 11,
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
  actionContainer: { marginTop: 6, gap: 10 },
  actionButton: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 17, paddingHorizontal: 18, borderRadius: 18, overflow: 'hidden',
  },
  editButton: {
    backgroundColor: COLORS.royalBlue,
    ...BTN_SHADOW,
  },
  btnShimmer: {
    position: 'absolute', top: 0, left: 0, width: '45%', height: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)', borderBottomRightRadius: 70,
  },
  editButtonText: { color: COLORS.white, fontWeight: "800", marginLeft: 10, fontSize: 15, letterSpacing: -0.1 },
  logoutButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1, borderColor: 'rgba(220,38,38,0.18)',
    ...CARD_SHADOW,
  },
  logoutButtonText: { color: "#DC2626", fontWeight: "800", marginLeft: 10, fontSize: 15, letterSpacing: -0.1 },

  /* Helpers */
  centered: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20, backgroundColor: COLORS.cream },
  errorText: { color: "#DC2626", marginVertical: 20, textAlign: "center", fontWeight: "600" },
  retryButton: { backgroundColor: COLORS.royalBlue, paddingHorizontal: 30, paddingVertical: 12, borderRadius: 12, marginTop: 10 },
  buttonText: { color: COLORS.white, fontWeight: "800" },


});

export default ProfileScreen;