import React, { useState, useRef, useEffect, useMemo } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Platform,
    Animated,
    LayoutAnimation,
    Image,
    UIManager,
    useWindowDimensions,
} from "react-native";
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
} from "lucide-react-native";

// Enable LayoutAnimation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─── Brand Palette (matches StartUpScreen) ───────────────────────
const COLORS = {
    // Backgrounds
    cream: '#FAF8F4',
    warmWhite: '#F5F1EA',
    sandLight: '#EDE8DF',
    sandMid: '#DDD6C8',

    // Brand blues
    deepNavy: '#0F2847',
    royalBlue: '#1A4480',
    mediumBlue: '#2A5FA8',

    // Warm teal accent
    teal: '#2A8FA0',
    tealLight: '#3DAFC4',

    // Soft orb tints
    orbBlue: '#C8D8EE',
    orbTeal: '#BEE4EC',
    orbSand: '#E8E0D0',

    // Text
    textDark: '#1C2B3A',
    textMid: '#4A5A6A',

    white: '#FFFFFF',
};

// ─── Soft Background Orb (from StartUpScreen) ────────────────────
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
        <View style={styles.accordion}>
            <TouchableOpacity
                style={styles.accordionHeader}
                onPress={toggle}
                activeOpacity={0.7}
            >
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
                    <ChevronDown size={20} color={COLORS.textMid} />
                </Animated.View>
            </TouchableOpacity>
            {expanded && <View style={styles.accordionBody}>{children}</View>}
        </View>
    );
};

// ─── Sub Components ──────────────────────────────────────────────
const Bullet: React.FC<{ text: string; color?: string }> = ({ text, color = COLORS.royalBlue }) => (
    <View style={styles.bulletRow}>
        <View style={[styles.bullet, { backgroundColor: color }]} />
        <Text style={styles.bulletText}>{text}</Text>
    </View>
);

const SubHeading: React.FC<{ icon?: React.ReactNode; text: string }> = ({ icon, text }) => (
    <View style={styles.subHeadingRow}>
        {icon && <View style={styles.subHeadingIcon}>{icon}</View>}
        <Text style={styles.subHeading}>{text}</Text>
    </View>
);

const InfoBox: React.FC<{ text: string; type?: "info" | "warning" }> = ({ text, type = "info" }) => (
    <View style={[styles.infoBox, type === "warning" && styles.infoBoxWarning]}>
        {type === "warning" ? (
            <AlertTriangle size={14} color="#D97706" style={{ marginRight: 8 }} />
        ) : (
            <CheckCircle size={14} color={COLORS.royalBlue} style={{ marginRight: 8 }} />
        )}
        <Text style={[styles.infoBoxText, type === "warning" && styles.infoBoxTextWarning]}>{text}</Text>
    </View>
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
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

            {/* ── Background (StartUpScreen style) ── */}
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
                {/* Warm cream base */}
                <View style={[StyleSheet.absoluteFill, { backgroundColor: COLORS.cream }]} />

                {/* Sand bloom — top right */}
                <View style={{
                    position: 'absolute', top: -height * 0.1, right: -width * 0.15,
                    width: width * 0.95, height: width * 0.95, borderRadius: width * 0.475,
                    backgroundColor: COLORS.sandLight, opacity: 0.55,
                }} />

                {/* Sand swell — bottom left */}
                <View style={{
                    position: 'absolute', bottom: -height * 0.06, left: -width * 0.2,
                    width: width * 0.8, height: width * 0.8, borderRadius: width * 0.4,
                    backgroundColor: COLORS.sandMid, opacity: 0.22,
                }} />

                {/* Tinted soft orbs */}
                {orbs.map((orb, i) => <SoftOrb key={i} {...orb} />)}

                {/* Subtle dot grid */}
                <View style={StyleSheet.absoluteFill} pointerEvents="none">
                    {Array.from({ length: 9 }).map((_, row) =>
                        Array.from({ length: 6 }).map((_, col) => (
                            <View key={`${row}-${col}`} style={{
                                position: 'absolute',
                                width: 2, height: 2, borderRadius: 1,
                                backgroundColor: COLORS.royalBlue,
                                opacity: 0.055,
                                left: (width / 6) * col + (width / 12),
                                top: (height / 9) * row + (height / 18),
                            }} />
                        ))
                    )}
                </View>

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

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                    activeOpacity={0.7}
                >
                    <ChevronLeft size={24} color={COLORS.textDark} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Security & Privacy</Text>
                <View style={styles.backButton} />
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Hero */}
                <View style={styles.hero}>
                    <View style={styles.heroGlow} />
                    <Image
                        source={require('../../../assets/images/logo2-nobg.png')}
                        style={styles.logoImage}
                        resizeMode="contain"
                    />
                    <Text style={styles.heroTitle}>Security First</Text>
                    <Text style={styles.heroSubtitle}>
                        Your speech data is processed with extreme care. We prioritize your privacy above all else.
                    </Text>
                </View>

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
                    <Text style={styles.bodyText}>
                        We never store your recordings unless you explicitly choose to save them to your history.
                    </Text>
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
                <View style={styles.statementCard}>
                    <View style={styles.statementIcon}>
                        <Shield size={16} color={COLORS.royalBlue} />
                    </View>
                    <Text style={styles.statementText}>
                        "At Articulink, your voice belongs to you. Our mission is to amplify your speech, not compromise your identity."
                    </Text>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <View style={styles.footerDividerRow}>
                        <View style={styles.footerLine} />
                        {[4, 8, 12, 8, 4].map((h, i) => (
                            <View key={i} style={{ width: 2.5, height: h, borderRadius: 1, backgroundColor: COLORS.teal, opacity: 0.45, marginHorizontal: 1.5 }} />
                        ))}
                        <View style={styles.footerLine} />
                    </View>
                    <Text style={styles.footerLabel}>SYSTEM STATUS: SECURE</Text>
                    <Text style={styles.footerVersion}>© 2026 Articulink Security</Text>
                </View>
            </ScrollView>
        </View>
    );
};

// ─── Styles ──────────────────────────────────────────────────────
const CARD_SHADOW = Platform.select({
    ios: {
        shadowColor: '#8A96A4',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
    },
    android: { elevation: 6 },
}) as any;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.cream,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingTop: Platform.OS === "android" ? 44 : 56,
        paddingBottom: 16,
        zIndex: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: 'rgba(255,255,255,0.7)',
        borderWidth: 1,
        borderColor: COLORS.sandMid,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "800",
        color: COLORS.textDark,
        letterSpacing: -0.4,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 60,
    },

    /* Hero */
    hero: {
        alignItems: "center",
        marginBottom: 36,
        marginTop: 10,
    },
    heroGlow: {
        position: 'absolute',
        top: -10,
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: COLORS.orbTeal,
        opacity: 0.5,
    },
    logoImage: {
        width: 130,
        height: 130,
        marginBottom: 0,
    },
    heroTitle: {
        fontSize: 26,
        fontWeight: "900",
        color: COLORS.textDark,
        marginBottom: 8,
        letterSpacing: -1,
    },
    heroSubtitle: {
        fontSize: 15,
        color: COLORS.textMid,
        textAlign: "center",
        lineHeight: 22,
        maxWidth: 320,
        fontWeight: "500",
    },

    /* Accordion */
    accordion: {
        backgroundColor: COLORS.white,
        borderRadius: 24,
        marginBottom: 16,
        overflow: "hidden",
        ...CARD_SHADOW,
        borderWidth: 1,
        borderColor: COLORS.sandMid,
    },
    accordionHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 18,
        paddingHorizontal: 20,
    },
    accordionLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    accordionIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: `${COLORS.royalBlue}0C`,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
    },
    accordionTitleWrap: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        flexWrap: "wrap",
    },
    accordionTitle: {
        fontSize: 16,
        fontWeight: "800",
        color: COLORS.textDark,
        letterSpacing: -0.3,
    },
    tag: {
        backgroundColor: `${COLORS.royalBlue}14`,
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: `${COLORS.royalBlue}20`,
    },
    tagText: {
        fontSize: 10,
        fontWeight: "800",
        color: COLORS.royalBlue,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    accordionBody: {
        paddingHorizontal: 20,
        paddingBottom: 22,
        paddingTop: 4,
        borderTopWidth: 1,
        borderTopColor: COLORS.sandLight,
    },

    /* Components */
    bulletRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 10,
    },
    bullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginTop: 8,
        marginRight: 12,
    },
    bulletText: {
        flex: 1,
        fontSize: 15,
        color: COLORS.textMid,
        lineHeight: 22,
        fontWeight: "500",
    },
    subHeadingRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 20,
        marginBottom: 12,
    },
    subHeadingIcon: {
        marginRight: 10,
    },
    subHeading: {
        fontSize: 13,
        fontWeight: "800",
        color: COLORS.royalBlue,
        textTransform: "uppercase",
        letterSpacing: 1.2,
        opacity: 0.9,
    },
    bodyText: {
        fontSize: 15,
        color: COLORS.textMid,
        lineHeight: 23,
        marginBottom: 14,
    },
    infoBox: {
        flexDirection: "row",
        alignItems: "flex-start",
        backgroundColor: `${COLORS.royalBlue}08`,
        padding: 16,
        borderRadius: 16,
        marginTop: 18,
        borderWidth: 1,
        borderColor: `${COLORS.royalBlue}15`,
    },
    infoBoxWarning: {
        backgroundColor: '#FFFBEB',
        borderColor: '#FEF3C7',
    },
    infoBoxText: {
        flex: 1,
        fontSize: 14,
        color: COLORS.royalBlue,
        lineHeight: 20,
        fontWeight: "600",
    },
    infoBoxTextWarning: {
        color: "#D48806",
    },
    statementCard: {
        flexDirection: "row",
        alignItems: "flex-start",
        backgroundColor: COLORS.white,
        padding: 22,
        borderRadius: 24,
        marginTop: 10,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: COLORS.sandMid,
        ...CARD_SHADOW,
    },
    statementIcon: {
        marginRight: 14,
        marginTop: 3,
    },
    statementText: {
        flex: 1,
        fontSize: 14,
        color: COLORS.textMid,
        lineHeight: 22,
        fontStyle: "italic",
        fontWeight: "500",
    },
    footer: {
        alignItems: 'center',
        marginTop: 20,
    },
    footerDividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '80%',
        marginBottom: 14,
        gap: 4,
    },
    footerLine: {
        flex: 1,
        height: 1,
        backgroundColor: COLORS.sandMid,
    },
    footerLabel: {
        fontSize: 11,
        color: COLORS.royalBlue,
        fontWeight: "800",
        letterSpacing: 2,
        marginBottom: 6,
    },
    footerVersion: {
        fontSize: 12,
        color: COLORS.textMid,
        fontWeight: "600",
    },
});

export default SecurityPrivacyScreen;
