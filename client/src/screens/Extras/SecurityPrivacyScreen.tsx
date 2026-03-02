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

// ─── Accordion Section ───────────────────────────────────────────
interface AccordionProps {
    icon: React.ReactNode;
    title: string;
    tagColor?: string;
    tagText?: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
}

const Accordion: React.FC<AccordionProps> = ({ icon, title, tagColor, tagText, children, defaultOpen = false }) => {
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
                            <View style={[styles.tag, { backgroundColor: tagColor || "#eff6ff" }]}>
                                <Text style={[styles.tagText, { color: tagColor === "#fef2f2" ? "#dc2626" : "#2563eb" }]}>
                                    {tagText}
                                </Text>
                            </View>
                        )}
                    </View>
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

const SubHeading: React.FC<{ icon?: React.ReactNode; text: string }> = ({ icon, text }) => (
    <View style={styles.subHeadingRow}>
        {icon && <View style={styles.subHeadingIcon}>{icon}</View>}
        <Text style={styles.subHeading}>{text}</Text>
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
const SecurityPrivacyScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
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
                <Text style={styles.headerTitle}>Security & Privacy</Text>
                <View style={styles.backButton} />
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Hero */}
                <View style={styles.hero}>
                    <View style={styles.heroIconCircle}>
                        <Shield size={32} color="#2563eb" />
                    </View>
                    <Text style={styles.heroTitle}>Your Privacy Matters</Text>
                    <Text style={styles.heroSubtitle}>
                        Articulink respects user privacy. Voice recordings are stored only with
                        explicit consent. All data is encrypted in transit and at rest.
                    </Text>
                </View>

                {/* ─── Section 1: User Consent ─── */}
                <Accordion
                    icon={<Mic size={18} color="#2563eb" />}
                    title="User Consent & Control"
                    tagText="Core Principle"
                    defaultOpen={true}
                >
                    <SubHeading
                        icon={<Mic size={14} color="#64748b" />}
                        text="Voice Recording Storage (Fully Optional)"
                    />
                    <Text style={styles.bodyText}>
                        You choose how your recordings are handled:
                    </Text>
                    <Bullet text="Do not save recordings" />
                    <Bullet text="Save recordings to your private history only" />
                    <Bullet text="Allow anonymized recordings to improve the model" />

                    <SubHeading text="You can always:" />
                    <Bullet text="View your saved recordings" color="#059669" />
                    <Bullet text="Download your recordings" color="#059669" />
                    <Bullet text="Delete them permanently" color="#059669" />
                    <Bullet text="Withdraw training consent at any time" color="#059669" />

                    <InfoBox text="Training contribution is opt-in, never pre-checked, and explained in simple language." />
                </Accordion>

                {/* ─── Section 2: Data Classification ─── */}
                <Accordion
                    icon={<Database size={18} color="#2563eb" />}
                    title="Data Classification"
                >
                    <SubHeading text="A. Public / Non-Sensitive" />
                    <Bullet text="App usage stats (non-identifiable)" />
                    <Bullet text="Feature interaction metrics" />

                    <SubHeading text="B. Personal Data" />
                    <Bullet text="Email address" />
                    <Bullet text="Display name" />
                    <Bullet text="Authentication ID" />

                    <SubHeading text="C. Sensitive Data (High Protection)" />
                    <Bullet text="Voice recordings (biometric data)" color="#dc2626" />
                    <Bullet text="Transcriptions" color="#dc2626" />
                    <Bullet text="Speech correction output" color="#dc2626" />
                    <Bullet text="Training contributions" color="#dc2626" />

                    <InfoBox text="Sensitive data receives the strongest level of encryption and access control." />
                </Accordion>

                {/* ─── Section 3: Encryption ─── */}
                <Accordion
                    icon={<Lock size={18} color="#2563eb" />}
                    title="Encryption Strategy"
                    tagText="Technical"
                >
                    <SubHeading
                        icon={<Lock size={14} color="#64748b" />}
                        text="A. Encryption in Transit"
                    />
                    <Bullet text="HTTPS only — no HTTP endpoints allowed" />
                    <Bullet text="TLS 1.2 or higher" />
                    <Bullet text="SSL certificates on all servers" />
                    <Bullet text="Data protected from your device to our backend" />

                    <SubHeading
                        icon={<Server size={14} color="#64748b" />}
                        text="B. Encryption at Rest"
                    />
                    <Bullet text="Server-side database encryption" />
                    <Bullet text="Encrypted backups" />
                    <Bullet text="Voice files stored with AES-256 encryption" />

                    <SubHeading
                        icon={<Key size={14} color="#64748b" />}
                        text="C. Application-Level Encryption"
                    />
                    <Bullet text="Voice metadata encrypted with AES-256" />
                    <Bullet text="Passwords hashed with bcrypt/Argon2" />
                    <Bullet text="Secure device storage (Expo SecureStore / Keychain)" />

                    <InfoBox
                        text="We never store plain passwords or raw auth tokens in unprotected storage."
                        type="warning"
                    />
                </Accordion>

                {/* ─── Section 4: Anonymization ─── */}
                <Accordion
                    icon={<Eye size={18} color="#2563eb" />}
                    title="Anonymization for Training"
                >
                    <Text style={styles.bodyText}>
                        When you allow training contributions, we strip all identity before use:
                    </Text>

                    <SubHeading text="Removed before training:" />
                    <Bullet text="User ID and email" color="#dc2626" />
                    <Bullet text="Device info" color="#dc2626" />
                    <Bullet text="All personal metadata" color="#dc2626" />
                    <Bullet text="Replaced with a random, untraceable ID" color="#dc2626" />

                    <SubHeading text="Training data contains only:" />
                    <Bullet text="Audio recording" color="#059669" />
                    <Bullet text="Transcription text" color="#059669" />
                    <Bullet text="Language label" color="#059669" />
                    <Bullet text="Speech type (e.g. lisp, nasal)" color="#059669" />

                    <InfoBox text="No identity link. Contributions can never be traced back to you." />
                </Accordion>

                {/* ─── Section 5: RBAC ─── */}
                <Accordion
                    icon={<Users size={18} color="#2563eb" />}
                    title="Access Control (RBAC)"
                >
                    <SubHeading text="👤 User" />
                    <Bullet text="Access only your own recordings" />
                    <Bullet text="Delete your personal data anytime" />

                    <SubHeading text="🛠 Admin (Limited)" />
                    <Bullet text="View anonymized data only" />
                    <Bullet text="Cannot see personal identity with recordings" />

                    <SubHeading text="🔬 ML System" />
                    <Bullet text="Access only anonymized training dataset" />
                    <Bullet text="No access to user profiles or identity" />
                </Accordion>

                {/* ─── Section 6: Notifications ─── */}
                <Accordion
                    icon={<Bell size={18} color="#2563eb" />}
                    title="Permissions & Notifications"
                >
                    <Bullet text="Microphone access only when speech features are active" />
                    <Bullet text="Notifications can be disabled at any time" />
                    <Bullet text="No background data collection" />
                    <Bullet text="Camera access only when explicitly granted" />
                </Accordion>

                {/* ─── Section 7: Compliance ─── */}
                <Accordion
                    icon={<Globe size={18} color="#2563eb" />}
                    title="Legal Compliance"
                    tagText="Philippines"
                >
                    <SubHeading text="Data Privacy Act of 2012" />
                    <Bullet text="Users are informed how data is processed" />
                    <Bullet text="You may request access to your data" />
                    <Bullet text="You may request correction or deletion" />
                    <Bullet text="A privacy policy page is provided" />

                    <InfoBox text="For international users, we also follow GDPR best practices where applicable." />
                </Accordion>

                {/* Privacy Statement */}
                <View style={styles.statement}>
                    <View style={styles.statementIcon}>
                        <FileText size={16} color="#2563eb" />
                    </View>
                    <Text style={styles.statementText}>
                        Articulink respects user privacy. Voice recordings are stored only
                        with explicit consent. Users may delete their data at any time.
                        Contributions to model training are anonymized and cannot be traced
                        back to individuals. All data is encrypted in transit and at rest.
                    </Text>
                </View>

                {/* Footer */}
                <Text style={styles.footerText}>Last updated: March 2026</Text>
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
        fontSize: 22,
        fontWeight: "700",
        color: "#0f172a",
        marginBottom: 8,
        letterSpacing: -0.5,
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
    accordionTitleWrap: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        flexWrap: "wrap",
    },
    accordionTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: "#0f172a",
    },
    tag: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    tagText: {
        fontSize: 11,
        fontWeight: "600",
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

    /* Sub Headings */
    subHeadingRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 14,
        marginBottom: 8,
    },
    subHeadingIcon: {
        marginRight: 6,
    },
    subHeading: {
        fontSize: 13,
        fontWeight: "700",
        color: "#475569",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },

    /* Body Text */
    bodyText: {
        fontSize: 14,
        color: "#64748b",
        lineHeight: 20,
        marginBottom: 10,
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

    /* Privacy Statement */
    statement: {
        flexDirection: "row",
        alignItems: "flex-start",
        backgroundColor: "#f1f5f9",
        padding: 16,
        borderRadius: 14,
        marginTop: 8,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#e2e8f0",
    },
    statementIcon: {
        marginRight: 10,
        marginTop: 2,
    },
    statementText: {
        flex: 1,
        fontSize: 13,
        color: "#475569",
        lineHeight: 20,
        fontStyle: "italic",
    },

    /* Footer */
    footerText: {
        textAlign: "center",
        fontSize: 12,
        color: "#94a3b8",
        fontWeight: "500",
        marginBottom: 8,
    },
});

export default SecurityPrivacyScreen;
