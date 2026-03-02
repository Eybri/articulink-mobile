import React, { useState, useRef } from "react";
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
                    <ChevronDown size={20} color="#94a3b8" />
                </Animated.View>
            </TouchableOpacity>
            {expanded && <View style={styles.accordionBody}>{children}</View>}
        </View>
    );
};

// ─── Sub Components ──────────────────────────────────────────────
const Bullet: React.FC<{ text: string; color?: string }> = ({ text, color = "#2563eb" }) => (
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
            <AlertTriangle size={14} color="#d97706" style={{ marginRight: 8 }} />
        ) : (
            <CheckCircle size={14} color="#2563eb" style={{ marginRight: 8 }} />
        )}
        <Text style={[styles.infoBoxText, type === "warning" && styles.infoBoxTextWarning]}>{text}</Text>
    </View>
);

// ─── Main Screen ─────────────────────────────────────────────────
const AboutScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fafafa" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                    activeOpacity={0.7}
                >
                    <ChevronLeft size={24} color="#0f172a" />
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
                    <View style={styles.heroIconCircle}>
                        <Info size={32} color="#2563eb" />
                    </View>
                    <Text style={styles.heroTitle}>Articulink</Text>
                    <Text style={styles.heroVersion}>Version 1.0.0</Text>
                    <Text style={styles.heroSubtitle}>
                        Speech assistance powered by AI — helping you communicate clearly and confidently.
                    </Text>
                </View>

                {/* ─── 1: What is Articulink ─── */}
                <Accordion
                    icon={<Heart size={18} color="#2563eb" />}
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
                    icon={<Users size={18} color="#2563eb" />}
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
                    icon={<Mic size={18} color="#2563eb" />}
                    title="How to Use Articulink"
                >
                    <StepCard
                        step="1"
                        icon={<Mic size={18} color="#2563eb" />}
                        title="Tap the Record Button"
                        desc="Press the microphone icon and start speaking normally."
                    />
                    <StepCard
                        step="2"
                        icon={<Brain size={18} color="#2563eb" />}
                        title="Processing"
                        desc="The app analyzes your speech and enhances clarity using AI."
                    />
                    <StepCard
                        step="3"
                        icon={<Volume2 size={18} color="#2563eb" />}
                        title="Hear or Share the Result"
                        desc="Play the improved audio, view the text transcription, or share the output."
                    />
                    <StepCard
                        step="4"
                        icon={<Save size={18} color="#2563eb" />}
                        title="Save to History"
                        desc="Choose whether to save the recording to your private history or discard it."
                        optional={true}
                    />
                    <StepCard
                        step="5"
                        icon={<HandHelping size={18} color="#2563eb" />}
                        title="Contribute to Model Improvement"
                        desc="You may allow anonymized recordings to improve the AI model. This is completely voluntary."
                        optional={true}
                    />
                </Accordion>

                {/* ─── 4: Privacy Summary ─── */}
                <Accordion
                    icon={<Shield size={18} color="#2563eb" />}
                    title="Privacy & Security Summary"
                >
                    <View style={styles.privacyCard}>
                        <Lock size={18} color="#2563eb" style={{ marginRight: 10 }} />
                        <Text style={styles.privacyTitle}>Your Privacy Matters</Text>
                    </View>
                    <Bullet text="Recordings are saved only with your permission" color="#059669" />
                    <Bullet text="You can delete your data anytime" color="#059669" />
                    <Bullet text="Training contributions are anonymized" color="#059669" />
                    <Bullet text="Data is encrypted during transfer and storage" color="#059669" />

                    <InfoBox text="Compliant with the Data Privacy Act of 2012 (Philippines)." />
                </Accordion>

                {/* ─── 5: Accessibility ─── */}
                <Accordion
                    icon={<Accessibility size={18} color="#2563eb" />}
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
                    icon={<AlertTriangle size={18} color="#2563eb" />}
                    title="Safety & Responsible Use"
                >
                    <View style={styles.disclaimerCard}>
                        <AlertTriangle size={16} color="#d97706" style={{ marginRight: 10, marginTop: 2 }} />
                        <Text style={styles.disclaimerText}>
                            Articulink is a communication assistance tool and{" "}
                            <Text style={styles.disclaimerBold}>not a replacement for professional speech therapy.</Text>
                        </Text>
                    </View>
                    <Text style={[styles.bodyText, { marginTop: 10 }]}>
                        If you have a speech condition, we encourage you to work with a qualified
                        speech-language pathologist alongside using Articulink.
                    </Text>
                </Accordion>

                {/* Footer */}
                <Text style={styles.footerText}>
                    Made with ❤️ for clearer communication
                </Text>
            </ScrollView>
        </View>
    );
};

// ─── Styles ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fafafa",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingTop: Platform.OS === "android" ? 44 : 56,
        paddingBottom: 16,
        backgroundColor: "#fafafa",
        borderBottomWidth: 1,
        borderBottomColor: "#f1f5f9",
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
        fontWeight: "700",
        color: "#0f172a",
        letterSpacing: -0.3,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 48,
    },

    /* Hero */
    hero: {
        alignItems: "center",
        marginBottom: 28,
    },
    heroIconCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: "#eff6ff",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 14,
        borderWidth: 1,
        borderColor: "#dbeafe",
    },
    heroTitle: {
        fontSize: 24,
        fontWeight: "700",
        color: "#0f172a",
        letterSpacing: -0.5,
    },
    heroVersion: {
        fontSize: 13,
        color: "#94a3b8",
        fontWeight: "500",
        marginTop: 4,
        marginBottom: 10,
    },
    heroSubtitle: {
        fontSize: 14,
        color: "#64748b",
        textAlign: "center",
        lineHeight: 21,
        maxWidth: 320,
    },

    /* Accordion */
    accordion: {
        backgroundColor: "white",
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#f1f5f9",
        overflow: "hidden",
    },
    accordionHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
    },
    accordionLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    accordionIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: "#eff6ff",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    accordionTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: "#0f172a",
        flex: 1,
    },
    accordionBody: {
        paddingHorizontal: 16,
        paddingBottom: 18,
        paddingTop: 2,
        borderTopWidth: 1,
        borderTopColor: "#f8fafc",
    },

    /* Bullets */
    bulletRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 6,
    },
    bullet: {
        width: 5,
        height: 5,
        borderRadius: 3,
        marginTop: 7,
        marginRight: 10,
    },
    bulletText: {
        flex: 1,
        fontSize: 14,
        color: "#334155",
        lineHeight: 20,
    },

    /* Body Text */
    bodyText: {
        fontSize: 14,
        color: "#64748b",
        lineHeight: 21,
        marginBottom: 10,
    },

    /* Step Cards */
    stepCard: {
        backgroundColor: "#f8fafc",
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#f1f5f9",
    },
    stepHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
        gap: 8,
    },
    stepBadge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: "#2563eb",
        justifyContent: "center",
        alignItems: "center",
    },
    stepBadgeText: {
        color: "white",
        fontSize: 12,
        fontWeight: "700",
    },
    stepIconCircle: {
        width: 30,
        height: 30,
        borderRadius: 8,
        backgroundColor: "#eff6ff",
        justifyContent: "center",
        alignItems: "center",
    },
    stepTitle: {
        fontSize: 15,
        fontWeight: "600",
        color: "#0f172a",
        marginBottom: 4,
    },
    optionalTag: {
        color: "#d97706",
        fontWeight: "700",
        fontStyle: "italic",
    },
    stepDesc: {
        fontSize: 13,
        color: "#64748b",
        lineHeight: 19,
    },

    /* Info Box */
    infoBox: {
        flexDirection: "row",
        alignItems: "flex-start",
        backgroundColor: "#eff6ff",
        padding: 12,
        borderRadius: 10,
        marginTop: 12,
        borderWidth: 1,
        borderColor: "#dbeafe",
    },
    infoBoxWarning: {
        backgroundColor: "#fffbeb",
        borderColor: "#fef3c7",
    },
    infoBoxText: {
        flex: 1,
        fontSize: 13,
        color: "#1e40af",
        lineHeight: 19,
        fontWeight: "500",
    },
    infoBoxTextWarning: {
        color: "#92400e",
    },

    /* Privacy Card */
    privacyCard: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    privacyTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: "#0f172a",
    },

    /* Disclaimer */
    disclaimerCard: {
        flexDirection: "row",
        alignItems: "flex-start",
        backgroundColor: "#fffbeb",
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#fef3c7",
    },
    disclaimerText: {
        flex: 1,
        fontSize: 14,
        color: "#92400e",
        lineHeight: 21,
    },
    disclaimerBold: {
        fontWeight: "700",
    },

    /* Footer */
    footerText: {
        textAlign: "center",
        fontSize: 13,
        color: "#94a3b8",
        fontWeight: "500",
        marginTop: 8,
        marginBottom: 8,
    },
});

export default AboutScreen;
