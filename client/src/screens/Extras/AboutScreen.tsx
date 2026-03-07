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
    UIManager,
    Image,
    useWindowDimensions,
} from "react-native";
import {
    Info,
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

// ─── Accordion ───────────────────────────────────────────────────
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
            <TouchableOpacity style={styles.accordionHeader} onPress={toggle} activeOpacity={0.7}>
                <View style={styles.accordionLeft}>
                    <View style={styles.accordionIcon}>{icon}</View>
                    <Text style={styles.accordionTitle}>{title}</Text>
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
const Bullet: React.FC<{ text: string; color?: string }> = ({ text, color = COLORS.teal }) => (
    <View style={styles.bulletRow}>
        <View style={[styles.bullet, { backgroundColor: color }]} />
        <Text style={styles.bulletText}>{text}</Text>
    </View>
);

const StepCard: React.FC<{ step: string; icon: React.ReactNode; title: string; desc: string; optional?: boolean }> = ({
    step, icon, title, desc, optional,
}) => (
    <View style={styles.stepCard}>
        <View style={styles.stepHeader}>
            <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>{step}</Text>
            </View>
            <View style={styles.stepIconCircle}>{icon}</View>
        </View>
        <Text style={styles.stepTitle}>
            {optional && <Text style={styles.optionalTag}>Optional: </Text>}
            {title}
        </Text>
        <Text style={styles.stepDesc}>{desc}</Text>
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
const AboutScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
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
                <Text style={styles.headerTitle}>About Articulink</Text>
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
                    <Text style={styles.heroTitle}>Articulink</Text>
                    <View style={styles.versionBadge}>
                        <Text style={styles.heroVersion}>Version 1.0.0</Text>
                    </View>
                    <Text style={styles.heroSubtitle}>
                        Speech assistance powered by AI — helping you communicate clearly and confidently.
                    </Text>
                </View>

                {/* ─── 1: What is Articulink ─── */}
                <Accordion
                    icon={<Heart size={18} color={COLORS.royalBlue} />}
                    title="What is Articulink?"
                    defaultOpen={true}
                >
                    <Text style={styles.bodyText}>
                        Articulink is a speech assistance app designed to help individuals with
                        lisp and hypernasal speech communicate more clearly.
                    </Text>
                    <Text style={styles.bodyText}>
                        The app processes your voice and converts it into a clearer, more
                        understandable speech output — while preserving your intended message.
                    </Text>
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
                    <View style={styles.row}>
                        <Lock size={18} color={COLORS.royalBlue} style={{ marginRight: 10 }} />
                        <Text style={styles.sectionHeading}>Your Privacy Matters</Text>
                    </View>
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
                    <Text style={styles.bodyText}>
                        Since our users may struggle with articulation, we've designed the app to be as accessible as possible:
                    </Text>
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
                    <View style={styles.disclaimerCard}>
                        <AlertTriangle size={18} color="#D97706" style={{ marginRight: 12, marginTop: 2 }} />
                        <Text style={styles.disclaimerText}>
                            Articulink is a communication assistance tool and{" "}
                            <Text style={styles.disclaimerBold}>not a replacement for professional speech therapy.</Text>
                        </Text>
                    </View>
                    <Text style={[styles.bodyText, { marginTop: 14 }]}>
                        If you have a speech condition, we encourage you to work with a qualified
                        speech-language pathologist alongside using Articulink.
                    </Text>
                </Accordion>

                {/* Footer */}
                <View style={styles.footer}>
                    <View style={styles.footerDividerRow}>
                        <View style={styles.footerLine} />
                        {[4, 8, 12, 8, 4].map((h, i) => (
                            <View key={i} style={{ width: 2.5, height: h, borderRadius: 1, backgroundColor: COLORS.teal, opacity: 0.45, marginHorizontal: 1.5 }} />
                        ))}
                        <View style={styles.footerLine} />
                    </View>
                    <Text style={styles.footerText}>
                        Articulink © 2026
                    </Text>
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
    },
    heroTitle: {
        fontSize: 28,
        fontWeight: "900",
        color: COLORS.textDark,
        marginBottom: 4,
        letterSpacing: -1,
    },
    versionBadge: {
        backgroundColor: `${COLORS.royalBlue}14`,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: `${COLORS.royalBlue}20`,
    },
    heroVersion: {
        fontSize: 12,
        color: COLORS.royalBlue,
        fontWeight: "700",
    },
    heroSubtitle: {
        fontSize: 15,
        color: COLORS.textMid,
        textAlign: "center",
        lineHeight: 23,
        maxWidth: 300,
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
    accordionTitle: {
        fontSize: 16,
        fontWeight: "800",
        color: COLORS.textDark,
        flex: 1,
        letterSpacing: -0.3,
    },
    accordionBody: {
        paddingHorizontal: 20,
        paddingBottom: 22,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: COLORS.sandLight,
    },

    /* Bullets */
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

    /* Body Text */
    bodyText: {
        fontSize: 15,
        color: COLORS.textMid,
        lineHeight: 24,
        marginBottom: 14,
    },

    /* Step Cards */
    stepCard: {
        backgroundColor: `${COLORS.royalBlue}06`,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: `${COLORS.royalBlue}10`,
    },
    stepHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
        gap: 10,
    },
    stepBadge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: COLORS.royalBlue,
        justifyContent: "center",
        alignItems: "center",
    },
    stepBadgeText: {
        color: "white",
        fontSize: 12,
        fontWeight: "800",
    },
    stepIconCircle: {
        width: 34,
        height: 34,
        borderRadius: 10,
        backgroundColor: COLORS.white,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: COLORS.sandMid,
    },
    stepTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: COLORS.textDark,
        marginBottom: 6,
    },
    optionalTag: {
        color: "#D97706",
        fontWeight: "800",
        fontStyle: "italic",
    },
    stepDesc: {
        fontSize: 14,
        color: COLORS.textMid,
        lineHeight: 20,
    },

    /* Info Box */
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
        backgroundColor: "#FFFBEB",
        borderColor: "#FEF3C7",
    },
    infoBoxText: {
        flex: 1,
        fontSize: 14,
        color: COLORS.royalBlue,
        lineHeight: 20,
        fontWeight: "700",
    },
    infoBoxTextWarning: {
        color: "#B45309",
    },

    /* Privacy Card Helpers */
    row: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    sectionHeading: {
        fontSize: 16,
        fontWeight: "800",
        color: COLORS.textDark,
    },

    /* Disclaimer */
    disclaimerCard: {
        flexDirection: "row",
        alignItems: "flex-start",
        backgroundColor: "#FFFBEB",
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#FEF3C7",
    },
    disclaimerText: {
        flex: 1,
        fontSize: 14,
        color: "#92400E",
        lineHeight: 22,
    },
    disclaimerBold: {
        fontWeight: "800",
    },

    /* Footer */
    footer: {
        marginTop: 20,
        alignItems: 'center',
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
    footerText: {
        fontSize: 13,
        color: COLORS.textMid,
        fontWeight: "600",
        letterSpacing: 0.5,
    },
});

export default AboutScreen;
