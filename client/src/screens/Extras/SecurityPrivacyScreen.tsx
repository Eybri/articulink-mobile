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

// ─── Brand Palette (Royal Light Variant) ─────────────────────────
const COLORS = {
    deepNavy: '#0F2F5F',
    royalBlue: '#1E4E8C',
    tealBlue: '#1F6F8B',
    softAqua: '#4FA7B8',
    bgLight: '#F1F5F9', // Crisp Slate White
    darkSlate: '#1D2A3A',
    white: '#FFFFFF',
    textMuted: '#64748B',
    accentLight: 'rgba(30, 78, 140, 0.08)', // Faint Royal Blue
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

    const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -35] });
    const opacity = anim.interpolate({ inputRange: [0, 0.3, 0.7, 1], outputRange: [0, 0.3, 0.3, 0] });
    const scale = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.7, 1.1, 0.7] });

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
                    <ChevronDown size={20} color={COLORS.textMuted} />
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

    const particles = useMemo(() => {
        return Array.from({ length: 15 }, (_, i) => ({
            key: i,
            color: i % 2 === 0 ? COLORS.royalBlue : COLORS.tealBlue,
            size: 3 + (i % 5),
            x: Math.random() * width,
            y: Math.random() * height,
            duration: 3500 + (Math.random() * 2000),
            delay: Math.random() * 2000,
        }));
    }, [width, height]);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

            {/* ── Background Accents (Royal Concept) ── */}
            <View style={styles.bgOverlay} pointerEvents="none">
                <View style={[styles.depthOrbA, {
                    backgroundColor: COLORS.royalBlue,
                    width: width * 1.1, height: width * 1.1,
                    top: -width * 0.4, right: -width * 0.3,
                }]} />
                <View style={[styles.depthOrbB, {
                    backgroundColor: COLORS.tealBlue,
                    width: width * 0.7, height: width * 0.7,
                    bottom: height * 0.05, left: -width * 0.2,
                }]} />

                <View style={[styles.ringOuter, {
                    borderColor: 'rgba(30, 78, 140, 0.04)',
                    width: width * 1.3, height: width * 1.3,
                    top: -width * 0.1, left: -width * 0.1,
                }]}>
                    <View style={[styles.ringInner, {
                        borderColor: 'rgba(30, 78, 140, 0.02)',
                        width: width * 0.8, height: width * 0.8,
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
                    <Text style={styles.footerLabel}>SYSTEM STATUS: SECURE</Text>
                    <Text style={styles.footerVersion}>© 2026 Articulink Security</Text>
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
        opacity: 0.1,
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
        backgroundColor: COLORS.royalBlue,
        opacity: 0.08,
    },
    logoImage: {
        width: 130,
        height: 130,
        marginBottom: 0,
    },
    heroTitle: {
        fontSize: 26,
        fontWeight: "900",
        color: COLORS.darkSlate,
        marginBottom: 8,
        letterSpacing: -1,
    },
    heroSubtitle: {
        fontSize: 15,
        color: COLORS.textMuted,
        textAlign: "center",
        lineHeight: 22,
        maxWidth: 320,
        fontWeight: "500",
    },

    /* Accordion - ROYAL LIGHT DESIGN */
    accordion: {
        backgroundColor: COLORS.white,
        borderRadius: 24,
        marginBottom: 16,
        overflow: "hidden",
        ...Platform.select({
            ios: {
                shadowColor: COLORS.royalBlue,
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.08,
                shadowRadius: 20,
            },
            android: { elevation: 6 },
        }),
        borderWidth: 1,
        borderColor: 'rgba(30, 78, 140, 0.05)',
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
        color: COLORS.darkSlate,
        letterSpacing: -0.3,
    },
    tag: {
        backgroundColor: 'rgba(30, 78, 140, 0.08)',
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 8,
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
        borderTopColor: 'rgba(30, 78, 140, 0.03)',
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
        color: "#475569",
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
        color: COLORS.textMuted,
        lineHeight: 23,
        marginBottom: 14,
    },
    infoBox: {
        flexDirection: "row",
        alignItems: "flex-start",
        backgroundColor: 'rgba(30, 78, 140, 0.03)',
        padding: 16,
        borderRadius: 16,
        marginTop: 18,
        borderWidth: 1,
        borderColor: 'rgba(30, 78, 140, 0.08)',
    },
    infoBoxWarning: {
        backgroundColor: '#FFFBE6',
        borderColor: '#FFE58F',
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
        borderColor: 'rgba(30, 78, 140, 0.05)',
    },
    statementIcon: {
        marginRight: 14,
        marginTop: 3,
    },
    statementText: {
        flex: 1,
        fontSize: 14,
        color: COLORS.textMuted,
        lineHeight: 22,
        fontStyle: "italic",
        fontWeight: "500",
    },
    footer: {
        alignItems: 'center',
        marginTop: 20,
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
        color: COLORS.textMuted,
        fontWeight: "600",
    },
});

export default SecurityPrivacyScreen;
