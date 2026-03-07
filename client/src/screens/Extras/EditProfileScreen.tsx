import React, { useState, useEffect, useContext, useRef, useMemo } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    Image,
    ActivityIndicator,
    Platform,
    StatusBar,
    Animated,
    useWindowDimensions,
    UIManager,
    LayoutAnimation,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import {
    User,
    Camera,
    Trash2,
    Save,
    X,
    Calendar,
    ChevronDown,
    ChevronLeft,
    UserCircle,
} from "lucide-react-native";
import axios from "axios";
import baseURL from "../../utils/baseurl";
import { getToken, storeUser } from "../../utils/authToken";
import { AuthContext, AuthContextType, User as UserType } from "../../context/AuthContext";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─── Brand Palette (same base as ProfileScreen) ───────────────────
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
    // ── Blue-tinted variants for EditProfile background ──
    orbBlue: '#C8D8EE',
    orbTeal: '#BEE4EC',
    orbSand: '#E8E0D0',
    // Slightly cooler/bluer ambient pools
    ambientBlue: '#D4E5F7',
    ambientMid: '#B8D0EC',
    ambientDeep: '#9BBDE0',
    textDark: '#1C2B3A',
    textMid: '#4A5A6A',
    white: '#FFFFFF',
};

// ─── Ambient Glow Pool ────────────────────────────────────────────
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
    const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -14] });
    const scale = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.95, 1.03, 0.95] });
    return (
        <Animated.View style={{
            position: 'absolute', left: x - size / 2, top: y - size / 2,
            width: size, height: size * 0.68,
            transform: [{ translateY }, { scale }],
        }}>
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: size * 0.34, backgroundColor: color, opacity: 0.13 }} />
            <View style={{ position: 'absolute', top: size * 0.1, left: size * 0.1, right: size * 0.1, bottom: size * 0.1, borderRadius: size * 0.34, backgroundColor: color, opacity: 0.15 }} />
            <View style={{ position: 'absolute', top: size * 0.24, left: size * 0.24, right: size * 0.24, bottom: size * 0.24, borderRadius: size * 0.34, backgroundColor: color, opacity: 0.18 }} />
        </Animated.View>
    );
};

// ─── Ring Accent ──────────────────────────────────────────────────
interface RingAccentProps { color: string; size: number; x: number; y: number; opacity?: number; }
const RingAccent: React.FC<RingAccentProps> = ({ color, size, x, y, opacity = 0.09 }) => (
    <>
        <View style={{ position: 'absolute', left: x - size / 2, top: y - size / 2, width: size, height: size, borderRadius: size / 2, borderWidth: 1, borderColor: color, opacity }} />
        <View style={{ position: 'absolute', left: x - size * 0.65 / 2, top: y - size * 0.65 / 2, width: size * 0.65, height: size * 0.65, borderRadius: size * 0.325, borderWidth: 1, borderColor: color, opacity: opacity * 0.55 }} />
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
                    backgroundColor: color, opacity: 0.025,
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
                items.push({ left: (width / cols) * c + (width / (cols * 2)), top: (height / rows) * r + (height / (rows * 2)), op: (r * cols + c) % 3 === 0 ? 0.055 : (r * cols + c) % 3 === 1 ? 0.028 : 0.013 });
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

// ─── Field Label ──────────────────────────────────────────────────
const FieldLabel: React.FC<{ text: string }> = ({ text }) => (
    <Text style={styles.fieldLabel}>{text}</Text>
);

// ─── Section Header ───────────────────────────────────────────────
const SectionHeader: React.FC<{ icon: React.ReactNode; title: string }> = ({ icon, title }) => (
    <View style={styles.sectionHeader}>
        <View style={styles.sectionIconWrap}>{icon}</View>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.sectionLine} />
    </View>
);

// ─── Main Component ───────────────────────────────────────────────
const EditProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const { user, setUser } = useContext(AuthContext) as AuthContextType;
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [birthdate, setBirthdate] = useState<Date | null>(null);
    const [gender, setGender] = useState("");
    const [profilePic, setProfilePic] = useState<string | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [genderOpen, setGenderOpen] = useState(false);

    const { width, height } = useWindowDimensions();

    // ── Blue-tinted glow pools (cooler / more blue than ProfileScreen) ──
    const glowPools = useMemo(() => ([
        { color: COLORS.ambientBlue, size: width * 0.80, x: width * 0.90, y: height * 0.06, duration: 6000, delay: 0 },
        { color: COLORS.ambientMid, size: width * 0.60, x: width * 0.08, y: height * 0.44, duration: 7200, delay: 900 },
        { color: COLORS.ambientDeep, size: width * 0.48, x: width * 0.65, y: height * 0.82, duration: 5600, delay: 500 },
    ]), [width, height]);

    const rings = useMemo(() => ([
        { color: COLORS.mediumBlue, size: width * 0.58, x: width * 0.92, y: height * 0.09, opacity: 0.07 },
        { color: COLORS.teal, size: width * 0.40, x: width * 0.10, y: height * 0.40, opacity: 0.055 },
        { color: COLORS.royalBlue, size: width * 0.32, x: width * 0.72, y: height * 0.85, opacity: 0.05 },
    ]), [width, height]);

    useEffect(() => {
        if (user) {
            setFirstName(user.first_name || "");
            setLastName(user.last_name || "");
            setGender(user.gender || "");
            setProfilePic(user.profile_pic || null);
            if (user.birthdate) setBirthdate(new Date(user.birthdate));
        }
    }, [user]);

    const handleUpdateProfile = async () => {
        try {
            setLoading(true);
            const updateData: any = {
                first_name: firstName.trim(),
                last_name: lastName.trim(),
                gender,
                birthdate: birthdate ? birthdate.toISOString().split("T")[0] : null,
            };
            Object.keys(updateData).forEach((k) => { if (!updateData[k]) delete updateData[k]; });
            if (Object.keys(updateData).length === 0) {
                Alert.alert("No Changes", "Please make at least one change.");
                setLoading(false);
                return;
            }
            const token = await getToken();
            const response = await axios.put(`${baseURL}/auth/profile`, updateData, {
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            });
            const updatedUser: UserType = {
                ...user,
                first_name: response.data.first_name,
                last_name: response.data.last_name,
                gender: response.data.gender,
                birthdate: response.data.birthdate,
                profile_pic: response.data.profile_pic,
            } as UserType;
            await storeUser(updatedUser);
            if (setUser) setUser(updatedUser);
            Alert.alert("Success", response.data.message || "Profile updated successfully!");
            navigation.goBack();
        } catch (error: any) {
            Alert.alert("Error", error.response?.data?.detail || "Failed to update profile.");
        } finally {
            setLoading(false);
        }
    };

    const handlePickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            Alert.alert("Permission Denied", "Camera roll permissions required.");
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });
        if (!result.canceled && result.assets[0]) await handleUploadImage(result.assets[0].uri);
    };

    const handleUploadImage = async (imageUri: string) => {
        try {
            setUploading(true);
            const formData = new FormData();
            const filename = imageUri.split("/").pop() || "upload.jpg";
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : "image/jpeg";
            formData.append("file", {
                uri: Platform.OS === "ios" ? imageUri.replace("file://", "") : imageUri,
                name: filename,
                type,
            } as any);
            const token = await getToken();
            const response = await axios.post(`${baseURL}/auth/profile/picture`, formData, {
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
                timeout: 30000,
            });
            setProfilePic(response.data.profile_pic);
            if (user) {
                const updatedUser: UserType = { ...user, profile_pic: response.data.profile_pic } as UserType;
                await storeUser(updatedUser);
                if (setUser) setUser(updatedUser);
            }
            Alert.alert("Success", "Profile picture updated!");
        } catch (error: any) {
            Alert.alert("Upload Failed", error.response?.data?.detail || "Failed to upload image.");
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteProfilePic = async () => {
        Alert.alert("Delete Profile Picture", "Are you sure?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete", style: "destructive",
                onPress: async () => {
                    try {
                        setUploading(true);
                        const token = await getToken();
                        await axios.delete(`${baseURL}/auth/profile/picture`, { headers: { Authorization: `Bearer ${token}` } });
                        setProfilePic(null);
                        if (user) {
                            const updatedUser: UserType = { ...user, profile_pic: undefined } as UserType;
                            await storeUser(updatedUser);
                            if (setUser) setUser(updatedUser);
                        }
                        Alert.alert("Success", "Profile picture deleted.");
                    } catch {
                        Alert.alert("Error", "Failed to delete picture.");
                    } finally {
                        setUploading(false);
                    }
                },
            },
        ]);
    };

    const genderOptions = [
        { label: "Select gender", value: "" },
        { label: "Male", value: "male" },
        { label: "Female", value: "female" },
        { label: "Other", value: "other" },
        { label: "Prefer not to say", value: "prefer_not_to_say" },
    ];

    const selectedGenderLabel = genderOptions.find((g) => g.value === gender)?.label || "Select gender";

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

            {/* ── Background (blue-tinted variant of ProfileScreen) ── */}
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
                {/* Base: very light blue-cream instead of warm cream */}
                <View style={[StyleSheet.absoluteFill, { backgroundColor: '#F0F5FB' }]} />
                {/* Sand-blue blobs */}
                <View style={{ position: 'absolute', top: -height * 0.1, right: -width * 0.18, width: width * 1.0, height: width * 1.0, borderRadius: width * 0.5, backgroundColor: COLORS.ambientBlue, opacity: 0.40 }} />
                <View style={{ position: 'absolute', bottom: -height * 0.08, left: -width * 0.22, width: width * 0.9, height: width * 0.9, borderRadius: width * 0.45, backgroundColor: COLORS.ambientMid, opacity: 0.18 }} />
                <View style={{ position: 'absolute', top: height * 0.3, left: -width * 0.35, width: width * 0.75, height: width * 0.75, borderRadius: width * 0.375, backgroundColor: COLORS.mediumBlue, opacity: 0.07 }} />
                <DiagonalStripes color={COLORS.mediumBlue} width={width} height={height} />
                <TextureOverlay accentColor={COLORS.mediumBlue} width={width} height={height} />
                {glowPools.map((p, i) => <GlowPool key={i} {...p} />)}
                {rings.map((r, i) => <RingAccent key={i} {...r} />)}
                {/* Corner brackets */}
                <View style={{ position: 'absolute', top: 58, left: 22, width: 34, height: 34, borderTopWidth: 1.5, borderLeftWidth: 1.5, borderColor: `${COLORS.mediumBlue}30`, borderTopLeftRadius: 6 }} />
                <View style={{ position: 'absolute', bottom: 60, right: 22, width: 34, height: 34, borderBottomWidth: 1.5, borderRightWidth: 1.5, borderColor: `${COLORS.teal}30`, borderBottomRightRadius: 6 }} />
            </View>


            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* ── Avatar Banner ── */}
                <View style={styles.avatarBanner}>
                    <View style={styles.bannerAccentBar} />
                    <View style={styles.bannerContent}>
                        {/* Avatar */}
                        <View style={styles.avatarWrap}>
                            {uploading ? (
                                <View style={styles.avatarPlaceholder}>
                                    <ActivityIndicator size="large" color={COLORS.royalBlue} />
                                </View>
                            ) : profilePic ? (
                                <Image source={{ uri: profilePic }} style={styles.avatarImage} />
                            ) : (
                                <View style={styles.avatarPlaceholder}>
                                    <UserCircle size={38} color={COLORS.royalBlue} strokeWidth={1.5} />
                                </View>
                            )}
                            {/* Camera badge */}
                            <TouchableOpacity style={styles.cameraBadge} onPress={handlePickImage} activeOpacity={0.8} disabled={uploading}>
                                <Camera size={12} color={COLORS.white} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.bannerTextCol}>
                            <Text style={styles.bannerHeading}>
                                {firstName || lastName ? `${firstName} ${lastName}`.trim() : "Your Name"}
                            </Text>
                            <Text style={styles.bannerSub}>Tap the camera to update your photo</Text>
                            {profilePic && (
                                <TouchableOpacity style={styles.removePicBtn} onPress={handleDeleteProfilePic} disabled={uploading} activeOpacity={0.8}>
                                    <Trash2 size={11} color="#DC2626" />
                                    <Text style={styles.removePicText}>Remove photo</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                    {/* Waveform decoration */}
                    <View style={styles.bannerWave}>
                        {[6, 12, 20, 14, 28, 18, 8, 24, 16, 10].map((h, i) => (
                            <View key={i} style={{ width: 3, height: h, borderRadius: 1.5, backgroundColor: COLORS.mediumBlue, opacity: 0.14, marginHorizontal: 2 }} />
                        ))}
                    </View>
                </View>

                {/* ── Personal Info Card ── */}
                <View style={styles.card}>
                    <SectionHeader
                        icon={<User size={15} color={COLORS.royalBlue} />}
                        title="Personal Information"
                    />

                    <FieldLabel text="First Name" />
                    <View style={styles.inputWrap}>
                        <TextInput
                            style={styles.input}
                            value={firstName}
                            onChangeText={setFirstName}
                            placeholder="Enter your first name"
                            placeholderTextColor={`${COLORS.textMid}60`}
                        />
                    </View>

                    <FieldLabel text="Last Name" />
                    <View style={styles.inputWrap}>
                        <TextInput
                            style={styles.input}
                            value={lastName}
                            onChangeText={setLastName}
                            placeholder="Enter your last name"
                            placeholderTextColor={`${COLORS.textMid}60`}
                        />
                    </View>

                    <FieldLabel text="Birthdate" />
                    <TouchableOpacity style={styles.inputWrap} onPress={() => setShowDatePicker(true)} activeOpacity={0.8}>
                        <Text style={[styles.input, { color: birthdate ? COLORS.textDark : `${COLORS.textMid}60` }]}>
                            {birthdate ? birthdate.toLocaleDateString() : "Select birthdate"}
                        </Text>
                        <Calendar size={16} color={COLORS.mediumBlue} style={{ position: 'absolute', right: 14, top: 14 }} />
                    </TouchableOpacity>

                    {showDatePicker && (
                        <DateTimePicker
                            value={birthdate || new Date()}
                            mode="date"
                            display={Platform.OS === "ios" ? "spinner" : "default"}
                            onChange={(event, selectedDate) => {
                                setShowDatePicker(Platform.OS === "ios");
                                if (selectedDate) setBirthdate(selectedDate);
                            }}
                            maximumDate={new Date()}
                        />
                    )}

                    <FieldLabel text="Gender" />
                    <TouchableOpacity
                        style={[styles.inputWrap, styles.pickerTrigger]}
                        onPress={() => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setGenderOpen(!genderOpen); }}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.input, { color: gender ? COLORS.textDark : `${COLORS.textMid}60` }]}>
                            {selectedGenderLabel}
                        </Text>
                        <Animated.View style={{ position: 'absolute', right: 14, top: 14 }}>
                            <ChevronDown size={16} color={COLORS.mediumBlue} />
                        </Animated.View>
                    </TouchableOpacity>

                    {genderOpen && (
                        <View style={styles.pickerDropdown}>
                            {genderOptions.map((opt) => (
                                <TouchableOpacity
                                    key={opt.value}
                                    style={[styles.pickerOption, opt.value === gender && styles.pickerOptionActive]}
                                    onPress={() => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setGender(opt.value); setGenderOpen(false); }}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[styles.pickerOptionText, opt.value === gender && styles.pickerOptionTextActive]}>
                                        {opt.label}
                                    </Text>
                                    {opt.value === gender && <View style={styles.pickerOptionDot} />}
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>

                {/* ── Action Buttons ── */}
                <View style={styles.actionContainer}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.saveButton]}
                        onPress={handleUpdateProfile}
                        disabled={loading}
                        activeOpacity={0.88}
                    >
                        <View style={styles.btnShimmer} />
                        {loading ? (
                            <ActivityIndicator color={COLORS.white} />
                        ) : (
                            <>
                                <Save size={16} color={COLORS.white} />
                                <Text style={styles.saveButtonText}>Save Changes</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.cancelButton]}
                        onPress={() => navigation.goBack()}
                        disabled={loading}
                        activeOpacity={0.88}
                    >
                        <X size={16} color={COLORS.textMid} />
                        <Text style={styles.cancelButtonText}>Cancel</Text>
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

// ─── Styles ───────────────────────────────────────────────────────
const CARD_SHADOW = Platform.select({
    ios: { shadowColor: '#7A90AC', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.11, shadowRadius: 20 },
    android: { elevation: 4 },
}) as any;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0F5FB' },

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
        fontSize: 17, fontWeight: "800",
        color: COLORS.textDark, letterSpacing: -0.3,
    },
    headerBtn: {
        width: 40, height: 40, borderRadius: 20,
        justifyContent: "center", alignItems: "center",
        backgroundColor: 'rgba(255,255,255,0.7)',
        borderWidth: 1, borderColor: COLORS.sandMid,
    },

    scrollContent: { paddingHorizontal: 20, paddingBottom: 60, paddingTop: 8 },

    /* Avatar Banner */
    avatarBanner: {
        backgroundColor: COLORS.white,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#C8D8EE',
        marginBottom: 14,
        overflow: 'hidden',
        flexDirection: 'row',
        ...CARD_SHADOW,
    },
    bannerAccentBar: {
        width: 4,
        backgroundColor: COLORS.mediumBlue,
        borderTopLeftRadius: 24,
        borderBottomLeftRadius: 24,
    },
    bannerContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 18,
        gap: 16,
    },
    avatarWrap: { position: 'relative' },
    avatarImage: {
        width: 72, height: 72, borderRadius: 20,
        borderWidth: 2, borderColor: `${COLORS.mediumBlue}25`,
    },
    avatarPlaceholder: {
        width: 72, height: 72, borderRadius: 20,
        backgroundColor: `${COLORS.mediumBlue}0D`,
        borderWidth: 1.5, borderColor: `${COLORS.mediumBlue}22`,
        justifyContent: 'center', alignItems: 'center',
    },
    cameraBadge: {
        position: 'absolute', bottom: -4, right: -4,
        width: 24, height: 24, borderRadius: 8,
        backgroundColor: COLORS.mediumBlue,
        borderWidth: 2, borderColor: COLORS.white,
        justifyContent: 'center', alignItems: 'center',
    },
    bannerTextCol: { flex: 1 },
    bannerHeading: {
        fontSize: 18, fontWeight: '900',
        color: COLORS.textDark, letterSpacing: -0.4, marginBottom: 3,
    },
    bannerSub: {
        fontSize: 11.5, color: COLORS.textMid, fontWeight: '500', marginBottom: 8,
    },
    removePicBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        alignSelf: 'flex-start',
        paddingHorizontal: 8, paddingVertical: 4,
        borderRadius: 8,
        backgroundColor: 'rgba(220,38,38,0.06)',
        borderWidth: 1, borderColor: 'rgba(220,38,38,0.14)',
    },
    removePicText: { fontSize: 11, fontWeight: '700', color: '#DC2626' },
    bannerWave: {
        position: 'absolute', bottom: 14, right: 16,
        flexDirection: 'row', alignItems: 'flex-end',
    },

    /* Card */
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 20,
        marginBottom: 12,
        overflow: 'hidden',
        ...CARD_SHADOW,
        borderWidth: 1,
        borderColor: '#C8D8EE',
        paddingHorizontal: 18,
        paddingBottom: 18,
    },

    /* Section Header */
    sectionHeader: {
        flexDirection: 'row', alignItems: 'center',
        paddingTop: 16, paddingBottom: 14,
        gap: 10,
    },
    sectionIconWrap: {
        width: 32, height: 32, borderRadius: 9,
        backgroundColor: `${COLORS.royalBlue}0C`,
        justifyContent: 'center', alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 13, fontWeight: '800',
        color: COLORS.textDark, letterSpacing: -0.2,
    },
    sectionLine: {
        flex: 1, height: 1,
        backgroundColor: '#C8D8EE', opacity: 0.7,
    },

    /* Fields */
    fieldLabel: {
        fontSize: 10, fontWeight: '800',
        color: COLORS.mediumBlue, textTransform: 'uppercase',
        letterSpacing: 1.1, marginBottom: 7, marginTop: 2, opacity: 0.85,
    },
    inputWrap: {
        borderWidth: 1.5,
        borderColor: '#C8D8EE',
        borderRadius: 12,
        backgroundColor: `${COLORS.mediumBlue}04`,
        marginBottom: 14,
        overflow: 'hidden',
    },
    input: {
        paddingHorizontal: 14, paddingVertical: 12,
        fontSize: 14, color: COLORS.textDark, fontWeight: '600',
    },
    pickerTrigger: { position: 'relative' },
    pickerDropdown: {
        borderWidth: 1.5, borderColor: '#C8D8EE',
        borderRadius: 12, overflow: 'hidden',
        marginBottom: 14,
        backgroundColor: COLORS.white,
        ...CARD_SHADOW,
    },
    pickerOption: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 14, paddingVertical: 12,
        borderBottomWidth: 1, borderBottomColor: `${COLORS.sandLight}80`,
    },
    pickerOptionActive: { backgroundColor: `${COLORS.mediumBlue}08` },
    pickerOptionText: {
        fontSize: 14, fontWeight: '500', color: COLORS.textMid,
    },
    pickerOptionTextActive: { color: COLORS.royalBlue, fontWeight: '700' },
    pickerOptionDot: {
        width: 7, height: 7, borderRadius: 3.5,
        backgroundColor: COLORS.mediumBlue,
    },

    /* Action Buttons */
    actionContainer: { marginTop: 4, gap: 10 },
    actionButton: {
        flexDirection: "row", alignItems: "center", justifyContent: "center",
        padding: 15, borderRadius: 16, overflow: 'hidden',
        ...CARD_SHADOW,
    },
    saveButton: { backgroundColor: COLORS.mediumBlue },
    btnShimmer: {
        position: 'absolute', top: 0, left: 0, width: '40%', height: '100%',
        backgroundColor: 'rgba(255,255,255,0.1)', borderBottomRightRadius: 60,
    },
    saveButtonText: { color: COLORS.white, fontWeight: "800", marginLeft: 8, fontSize: 14, letterSpacing: -0.1 },
    cancelButton: {
        backgroundColor: COLORS.white,
        borderWidth: 1, borderColor: `${COLORS.sandMid}`,
    },
    cancelButtonText: { color: COLORS.textMid, fontWeight: "800", marginLeft: 8, fontSize: 14 },

    /* Footer */
    footer: { alignItems: 'center', marginTop: 36 },
    footerDividerRow: {
        flexDirection: 'row', alignItems: 'center',
        width: '80%', marginBottom: 14, gap: 4,
    },
    footerLine: { flex: 1, height: 1, backgroundColor: '#C8D8EE' },
    footerLabel: {
        fontSize: 10, color: COLORS.mediumBlue,
        fontWeight: "800", letterSpacing: 2.2, marginBottom: 5,
    },
    footerVersion: { fontSize: 11, color: COLORS.textMid, fontWeight: "600" },
});

export default EditProfileScreen;