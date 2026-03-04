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

// ─── Brand Palette ───────────────────────────────────────────────
const COLORS = {
    deepNavy: '#0F2F5F',
    royalBlue: '#1E4E8C',
    tealBlue: '#1F6F8B',
    softAqua: '#4FA7B8',
    bgLight: '#F8FAFC',
    darkSlate: '#1D2A3A',
    white: '#FFFFFF',
    textMuted: '#64748B',
    accentLight: 'rgba(79, 167, 184, 0.12)',
};

// ─── Floating Particle ──────────────────────────────────────────
interface ParticleProps {
    color: string;
    size: number;
    x: number;
    y: number;
    duration: number;
    delay: number;
}

const FloatingParticle: React.FC<ParticleProps> = ({ color, size, x, y, duration, delay }) => {
    const anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const loop = Animated.loop(
            Animated.sequence([
                Animated.delay(delay),
                Animated.timing(anim, { toValue: 1, duration, useNativeDriver: true }),
                Animated.timing(anim, { toValue: 0, duration, useNativeDriver: true }),
            ]),
        );
        loop.start();
        return () => loop.stop();
    }, [delay, duration, anim]);

    const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -30] });
    const opacity = anim.interpolate({ inputRange: [0, 0.3, 0.7, 1], outputRange: [0, 0.4, 0.4, 0] });
    const scale = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.6, 1, 0.6] });

    return (
        <Animated.View
            style={{
                position: 'absolute',
                left: x,
                top: y,
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: color,
                opacity,
                transform: [{ translateY }, { scale }],
            }}
        />
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
                    <ChevronDown size={20} color={COLORS.textMuted} />
                </Animated.View>
            </TouchableOpacity>
            {expanded && <View style={styles.accordionBody}>{children}</View>}
        </View>
    );
};

// ─── Sub Components ──────────────────────────────────────────────
const Bullet: React.FC<{ text: string; color?: string }> = ({ text, color = COLORS.softAqua }) => (
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

    const particles = useMemo(() => {
        return Array.from({ length: 12 }, (_, i) => ({
            key: i,
            color: i % 2 === 0 ? COLORS.softAqua : 'rgba(30, 78, 140, 0.4)',
            size: 3 + (i % 4),
            x: Math.random() * width,
            y: Math.random() * height,
            duration: 3000 + (Math.random() * 2000),
            delay: Math.random() * 2000,
        }));
    }, [width, height]);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

            {/* ── Background Accents ── */}
            <View style={styles.bgOverlay} pointerEvents="none">
                <View style={[styles.depthOrbA, {
                    backgroundColor: COLORS.softAqua,
                    width: width * 0.9, height: width * 0.9,
                    top: -width * 0.3, right: -width * 0.2,
                }]} />
                <View style={[styles.depthOrbB, {
                    backgroundColor: COLORS.royalBlue,
                    width: width * 0.6, height: width * 0.6,
                    bottom: height * 0.1, left: -width * 0.1,
                }]} />

                <View style={[styles.ringOuter, {
                    borderColor: 'rgba(30, 78, 140, 0.05)',
                    width: width * 1.2, height: width * 1.2,
                    top: -width * 0.1, left: -width * 0.1,
                }]}>
                    <View style={[styles.ringInner, {
                        borderColor: 'rgba(30, 78, 140, 0.03)',
                        width: width * 0.7, height: width * 0.7,
                    }]} />
                </View>

                {particles.map(({ key, ...p }) => <FloatingParticle key={key} {...p} />)}
            </View>

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                    activeOpacity={0.7}
                >
                    <ChevronLeft size={24} color={COLORS.darkSlate} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>About Articulink</Text>
                <View style={styles.backButton} />
            </View>

            <ScrollView
                className="scroll-container"
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
                    <Text style={styles.footerText}>
                        Articulink © 2026
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
};

// ─── Styles ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bgLight,
    },
    bgOverlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: -1,
    },
    depthOrbA: {
        position: 'absolute',
        opacity: 0.12,
        borderRadius: 9999,
    },
    depthOrbB: {
        position: 'absolute',
        opacity: 0.08,
        borderRadius: 9999,
    },
    ringOuter: {
        position: 'absolute',
        borderRadius: 9999,
        borderWidth: 1.5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    ringInner: {
        borderRadius: 9999,
        borderWidth: 1,
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
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "800",
        color: COLORS.darkSlate,
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
        backgroundColor: COLORS.softAqua,
        opacity: 0.15,
    },
    logoImage: {
        width: 130,
        height: 130,
    },
    heroTitle: {
        fontSize: 28,
        fontWeight: "900",
        color: COLORS.darkSlate,
        marginBottom: 4,
        letterSpacing: -1,
    },
    versionBadge: {
        backgroundColor: 'rgba(30, 78, 140, 0.08)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
        marginBottom: 16,
    },
    heroVersion: {
        fontSize: 12,
        color: COLORS.royalBlue,
        fontWeight: "700",
    },
    heroSubtitle: {
        fontSize: 15,
        color: COLORS.textMuted,
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
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.06,
                shadowRadius: 15,
            },
            android: { elevation: 6 },
        }),
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
        backgroundColor: COLORS.accentLight,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
    },
    accordionTitle: {
        fontSize: 16,
        fontWeight: "800",
        color: COLORS.darkSlate,
        flex: 1,
        letterSpacing: -0.3,
    },
    accordionBody: {
        paddingHorizontal: 20,
        paddingBottom: 22,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.03)',
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
        color: "#475569",
        lineHeight: 22,
        fontWeight: "500",
    },

    /* Body Text */
    bodyText: {
        fontSize: 15,
        color: '#64748B',
        lineHeight: 24,
        marginBottom: 14,
    },

    /* Step Cards */
    stepCard: {
        backgroundColor: 'rgba(30, 78, 140, 0.03)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(30, 78, 140, 0.05)',
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
    },
    stepTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: COLORS.darkSlate,
        marginBottom: 6,
    },
    optionalTag: {
        color: "#D97706",
        fontWeight: "800",
        fontStyle: "italic",
    },
    stepDesc: {
        fontSize: 14,
        color: "#64748B",
        lineHeight: 20,
    },

    /* Info Box */
    infoBox: {
        flexDirection: "row",
        alignItems: "flex-start",
        backgroundColor: "#F0F9FF",
        padding: 16,
        borderRadius: 16,
        marginTop: 18,
        borderWidth: 1,
        borderColor: "#E0F2FE",
    },
    infoBoxWarning: {
        backgroundColor: "#FFFBEB",
        borderColor: "#FEF3C7",
    },
    infoBoxText: {
        flex: 1,
        fontSize: 14,
        color: "#0369A1",
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
        color: COLORS.darkSlate,
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
    footerText: {
        fontSize: 13,
        color: COLORS.textMuted,
        fontWeight: "600",
        letterSpacing: 0.5,
    },
});

export default AboutScreen;
