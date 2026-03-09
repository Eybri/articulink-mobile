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
    ChevronRight,
    UserCircle,
} from "lucide-react-native";
import axios from "axios";
import baseURL from "../../utils/baseurl";
import { getToken, storeUser } from "../../utils/authToken";
import { AuthContext, AuthContextType, User as UserType } from "../../context/AuthContext";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─── Brand Palette (blue-tinted variant of ProfileScreen) ─────────
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
    ambientBlue: '#D4E5F7',
    ambientMid: '#B8D0EC',
    ambientDeep: '#9BBDE0',
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

    // SoftOrbs — blue-tinted variant
    const orbs = useMemo(() => ([
        { color: COLORS.ambientBlue, size: width * 0.65, x: width * 0.88, y: height * 0.07, duration: 6000, delay: 0 },
        { color: COLORS.ambientMid, size: width * 0.5, x: width * 0.08, y: height * 0.46, duration: 7200, delay: 900 },
        { color: COLORS.ambientDeep, size: width * 0.38, x: width * 0.65, y: height * 0.82, duration: 5500, delay: 500 },
    ]), [width, height]);

    // Dot grid
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

            {/* ── Layered Background (blue-tinted, matches StartUpScreen structure) ── */}
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
                {/* Base: light blue-cream */}
                <View style={[StyleSheet.absoluteFill, { backgroundColor: '#F0F5FB' }]} />

                {/* Blue bloom — top right */}
                <View style={{
                    position: 'absolute', top: -height * 0.1, right: -width * 0.15,
                    width: width * 0.95, height: width * 0.95, borderRadius: width * 0.475,
                    backgroundColor: COLORS.ambientBlue, opacity: 0.5,
                }} />

                {/* Blue swell — bottom left */}
                <View style={{
                    position: 'absolute', bottom: -height * 0.06, left: -width * 0.2,
                    width: width * 0.8, height: width * 0.8, borderRadius: width * 0.4,
                    backgroundColor: COLORS.ambientMid, opacity: 0.2,
                }} />

                {/* Animated soft orbs */}
                {orbs.map((orb, i) => <SoftOrb key={i} {...orb} />)}

                {/* Subtle dot grid */}
                {dotGrid.map((d, i) => (
                    <View key={i} style={{
                        position: 'absolute', width: 2, height: 2, borderRadius: 1,
                        backgroundColor: COLORS.mediumBlue, opacity: 0.055,
                        left: d.left, top: d.top,
                    }} />
                ))}

                {/* Corner bracket — top left */}
                <View style={{
                    position: 'absolute', top: 58, left: 22, width: 34, height: 34,
                    borderTopWidth: 1.5, borderLeftWidth: 1.5,
                    borderColor: `${COLORS.mediumBlue}30`, borderTopLeftRadius: 6,
                }} />
                {/* Corner bracket — bottom right */}
                <View style={{
                    position: 'absolute', bottom: 60, right: 22, width: 34, height: 34,
                    borderBottomWidth: 1.5, borderRightWidth: 1.5,
                    borderColor: `${COLORS.teal}30`, borderBottomRightRadius: 6,
                }} />
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* ── Avatar Banner ── */}
                <View style={styles.avatarBanner}>
                    <View style={styles.bannerAccentBar} />
                    {/* Subtle top glow */}
                    <View style={styles.bannerTopGlow} />
                    <View style={styles.bannerContent}>
                        {/* Avatar with halo */}
                        <View style={styles.avatarWrap}>
                            <View style={styles.avatarHalo} />
                            {uploading ? (
                                <View style={styles.avatarPlaceholder}>
                                    <ActivityIndicator size="large" color={COLORS.mediumBlue} />
                                </View>
                            ) : profilePic ? (
                                <Image source={{ uri: profilePic }} style={styles.avatarImage} />
                            ) : (
                                <View style={styles.avatarPlaceholder}>
                                    <UserCircle size={38} color={COLORS.mediumBlue} strokeWidth={1.5} />
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
                    {/* Animated waveform decoration */}
                    <View style={styles.bannerWave}>
                        <AnimatedWaveform color={COLORS.mediumBlue} />
                    </View>
                    {/* Bottom accent bar */}
                    <View style={styles.bannerBottomBar} />
                </View>

                {/* ── Personal Info Card ── */}
                <View style={styles.card}>
                    {/* Top accent bar */}
                    <View style={styles.cardTopBar} />
                    {/* Top glow */}
                    <View style={styles.cardTopGlow} />
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
                                <View style={{ flex: 1 }} />
                                <ChevronRight size={18} color="rgba(255,255,255,0.6)" />
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
                        <View style={{ flex: 1 }} />
                        <ChevronRight size={18} color={`${COLORS.textMid}50`} />
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

// ─── Styles ───────────────────────────────────────────────────────
const CARD_SHADOW = Platform.select({
    ios: { shadowColor: '#7A90AC', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 22 },
    android: { elevation: 5 },
}) as any;

const BTN_SHADOW = Platform.select({
    ios: { shadowColor: '#2A5FA8', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 14 },
    android: { elevation: 6 },
}) as any;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0F5FB' },

    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: Platform.OS === "android" ? 44 : 56, // Added paddingTop for status bar
        paddingBottom: 60
    },

    /* Avatar Banner */
    avatarBanner: {
        backgroundColor: COLORS.white,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: COLORS.orbBlue,
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
    bannerTopGlow: {
        position: 'absolute', top: 0, left: 0, right: 0, height: 65,
        backgroundColor: `${COLORS.mediumBlue}07`,
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
    },
    bannerContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 22,
        paddingHorizontal: 18,
        gap: 16,
    },
    avatarWrap: { position: 'relative', width: 80, height: 80, justifyContent: 'center', alignItems: 'center' },
    avatarHalo: {
        position: 'absolute',
        width: 80, height: 80, borderRadius: 24,
        backgroundColor: COLORS.orbBlue,
        opacity: 0.5,
    },
    avatarImage: {
        width: 68, height: 68, borderRadius: 20,
        borderWidth: 2, borderColor: `${COLORS.mediumBlue}25`,
    },
    avatarPlaceholder: {
        width: 68, height: 68, borderRadius: 20,
        backgroundColor: `${COLORS.mediumBlue}0D`,
        borderWidth: 1.5, borderColor: `${COLORS.mediumBlue}22`,
        justifyContent: 'center', alignItems: 'center',
    },
    cameraBadge: {
        position: 'absolute', bottom: 2, right: 2,
        width: 26, height: 26, borderRadius: 9,
        backgroundColor: COLORS.mediumBlue,
        borderWidth: 2.5, borderColor: COLORS.white,
        justifyContent: 'center', alignItems: 'center',
    },
    bannerTextCol: { flex: 1 },
    bannerHeading: {
        fontSize: 20, fontWeight: '900',
        color: COLORS.textDark, letterSpacing: -0.4, marginBottom: 4,
    },
    bannerSub: {
        fontSize: 12, color: COLORS.textMid, fontWeight: '500', marginBottom: 8,
    },
    removePicBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        alignSelf: 'flex-start',
        paddingHorizontal: 10, paddingVertical: 5,
        borderRadius: 10,
        backgroundColor: 'rgba(220,38,38,0.06)',
        borderWidth: 1, borderColor: 'rgba(220,38,38,0.14)',
    },
    removePicText: { fontSize: 11, fontWeight: '700', color: '#DC2626' },
    bannerWave: {
        position: 'absolute', bottom: 16, right: 16,
    },
    bannerBottomBar: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: 3,
        backgroundColor: COLORS.mediumBlue,
        borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
    },

    /* Card */
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 22,
        marginBottom: 12,
        overflow: 'hidden',
        ...CARD_SHADOW,
        borderWidth: 1,
        borderColor: COLORS.orbBlue,
        paddingHorizontal: 18,
        paddingBottom: 18,
    },
    cardTopBar: {
        position: 'absolute', top: 0, left: 0, right: 0,
        height: 3,
        backgroundColor: COLORS.royalBlue,
        borderTopLeftRadius: 22, borderTopRightRadius: 22,
    },
    cardTopGlow: {
        position: 'absolute', top: 0, left: 0, right: 0, height: 50,
        backgroundColor: `${COLORS.royalBlue}07`,
        borderTopLeftRadius: 22, borderTopRightRadius: 22,
    },

    /* Section Header */
    sectionHeader: {
        flexDirection: 'row', alignItems: 'center',
        paddingTop: 18, paddingBottom: 14,
        gap: 10,
    },
    sectionIconWrap: {
        width: 34, height: 34, borderRadius: 10,
        backgroundColor: `${COLORS.royalBlue}0C`,
        justifyContent: 'center', alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 14, fontWeight: '800',
        color: COLORS.textDark, letterSpacing: -0.2,
    },
    sectionLine: {
        flex: 1, height: 1,
        backgroundColor: COLORS.orbBlue, opacity: 0.7,
    },

    /* Fields */
    fieldLabel: {
        fontSize: 10, fontWeight: '800',
        color: COLORS.mediumBlue, textTransform: 'uppercase',
        letterSpacing: 1.1, marginBottom: 7, marginTop: 2, opacity: 0.85,
    },
    inputWrap: {
        borderWidth: 1.5,
        borderColor: COLORS.orbBlue,
        borderRadius: 14,
        backgroundColor: `${COLORS.mediumBlue}04`,
        marginBottom: 14,
        overflow: 'hidden',
    },
    input: {
        paddingHorizontal: 14, paddingVertical: 13,
        fontSize: 14, color: COLORS.textDark, fontWeight: '600',
    },
    pickerTrigger: { position: 'relative' },
    pickerDropdown: {
        borderWidth: 1.5, borderColor: COLORS.orbBlue,
        borderRadius: 14, overflow: 'hidden',
        marginBottom: 14,
        backgroundColor: COLORS.white,
        ...CARD_SHADOW,
    },
    pickerOption: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 14, paddingVertical: 13,
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
    actionContainer: { marginTop: 6, gap: 10 },
    actionButton: {
        flexDirection: "row", alignItems: "center",
        paddingVertical: 17, paddingHorizontal: 18, borderRadius: 18, overflow: 'hidden',
    },
    saveButton: {
        backgroundColor: COLORS.mediumBlue,
        ...BTN_SHADOW,
    },
    btnShimmer: {
        position: 'absolute', top: 0, left: 0, width: '45%', height: '100%',
        backgroundColor: 'rgba(255,255,255,0.1)', borderBottomRightRadius: 70,
    },
    saveButtonText: { color: COLORS.white, fontWeight: "800", marginLeft: 10, fontSize: 15, letterSpacing: -0.1 },
    cancelButton: {
        backgroundColor: COLORS.white,
        borderWidth: 1, borderColor: COLORS.sandMid,
        ...CARD_SHADOW,
    },
    cancelButtonText: { color: COLORS.textMid, fontWeight: "800", marginLeft: 10, fontSize: 15 },
});

export default EditProfileScreen;