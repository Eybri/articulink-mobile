import React, { useState, useContext, useRef, useEffect } from "react";
import {
    Alert,
    Animated,
    Dimensions,
    StatusBar,
    Platform,
    KeyboardAvoidingView,
    Modal,
    Pressable,
    Image as RNImage,
} from "react-native";
import {
    YStack,
    XStack,
    ZStack,
    Button,
    Input,
    SizableText,
    Circle,
    ScrollView,
    Spinner,
} from "tamagui";
import {
    Eye,
    EyeOff,
    Mail,
    Lock,
    User,
    Check,
    Calendar,
    ChevronDown,
    ArrowRight,
} from "@tamagui/lucide-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { AuthContext, AuthContextType } from "./../context/AuthContext";

const { width, height } = Dimensions.get('window');

// ─── Brand Palette (same as LoginScreen) ──────────────────────────
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
    success: '#10b981',
    error: '#ef4444',
};

const RegisterScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [gender, setGender] = useState("");
    const [birthdate, setBirthdate] = useState<Date | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showGenderSheet, setShowGenderSheet] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useContext(AuthContext) as AuthContextType;

    // ─── Animations (inverse of Login — slides down from top) ────
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideHeight = useRef(new Animated.Value(-height * 0.3)).current;
    const logoFade = useRef(new Animated.Value(0)).current;
    const logoScale = useRef(new Animated.Value(0.8)).current;
    const textFade = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
            Animated.spring(slideHeight, { toValue: 0, tension: 20, friction: 8, useNativeDriver: true }),
        ]).start();

        // Fade in bottom text after card settles
        setTimeout(() => {
            Animated.parallel([
                Animated.timing(logoFade, { toValue: 1, duration: 600, useNativeDriver: true }),
                Animated.spring(logoScale, { toValue: 1, tension: 40, friction: 7, useNativeDriver: true }),
                Animated.timing(textFade, { toValue: 1, duration: 800, useNativeDriver: true }),
            ]).start();
        }, 400);
    }, []);

    const validateForm = () => {
        if (!email || !password || !confirmPassword) return "Email and password fields are required";
        if (password.length < 6) return "Password must be at least 6 characters long";
        if (password !== confirmPassword) return "Passwords do not match";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return "Please enter a valid email address";
        return null;
    };

    const handleRegister = async () => {
        const validationError = validateForm();
        if (validationError) {
            Alert.alert("Error", validationError);
            return;
        }

        setIsLoading(true);
        try {
            const registerData: any = {
                email: email.toLowerCase().trim(),
                password: password,
                first_name: firstName.trim() || undefined,
                last_name: lastName.trim() || undefined,
                gender: gender || undefined,
                birthdate: birthdate ? birthdate.toISOString().split('T')[0] : undefined,
            };
            await register(registerData);
            Alert.alert("Success", "Account created! Please verify your email with the code we sent.", [
                { text: "Verify OTP", onPress: () => navigation.navigate("VerifyOTP", { email: email.toLowerCase().trim() }) }
            ]);
        } catch (err: any) {
            const errorMessage = err.detail || err.message || "Registration failed. Please try again.";
            Alert.alert("Registration Failed", errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const passwordRequirements = {
        minLength: password.length >= 6,
        hasNumber: /\d/.test(password),
        hasUpperCase: /[A-Z]/.test(password),
    };

    const PasswordCheck: React.FC<{ met: boolean; text: string }> = ({ met, text }) => (
        <XStack ai="center" gap="$1.5">
            <YStack w={14} h={14} br={7} bg={met ? COLORS.success : COLORS.sandMid} jc="center" ai="center">
                {met && <Check size={8} color="white" />}
            </YStack>
            <SizableText size="$1" color={met ? COLORS.success : COLORS.textMid}>{text}</SizableText>
        </XStack>
    );

    return (
        <YStack f={1} bg={COLORS.royalBlue}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

            {/* ─── Background Image (bottom, behind card) ──────── */}
            <ZStack pos="absolute" fullscreen pointerEvents="none">
                <RNImage
                    source={require('../../assets/images/bg.jpg')}
                    style={{ width: '100%', height: '100%', position: 'absolute' }}
                    resizeMode="cover"
                />
                <YStack fullscreen bg="black" opacity={0.25} />
                {/* Bottom text + logo — visible below the card */}
                <YStack pos="absolute" b={0} l={0} r={0} h={height * 0.22} jc="center" ai="center" gap="$1">
                    <Animated.View style={{ opacity: logoFade, transform: [{ scale: logoScale }] }}>
                        <RNImage
                            source={require('../../assets/images/whitelogo.png')}
                            style={{ width: 80, height: 80 }}
                            resizeMode="contain"
                        />
                    </Animated.View>
                    <Animated.View style={{ opacity: textFade }}>
                        <YStack ai="center" gap="$1">
                            <SizableText size="$3" fow="700" color="white" ls={0.3}>Join Articulink</SizableText>
                            <SizableText size="$1" color="rgba(255,255,255,0.7)" fow="500">Communication starts here</SizableText>
                        </YStack>
                    </Animated.View>
                </YStack>
            </ZStack>

            {/* ─── Scrollable Form (card from top, slides down) ── */}
            <ScrollView
                f={1}
                contentContainerStyle={{ flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                    <Animated.View style={{ transform: [{ translateY: slideHeight }] }}>
                        <YStack
                            bg={COLORS.white}
                            borderBottomLeftRadius={40}
                            borderBottomRightRadius={40}
                            px="$5"
                            pt="$10"
                            pb="$6"
                            shadowColor="rgba(0,0,0,0.15)"
                            shadowRadius={15}
                            shadowOffset={{ width: 0, height: 8 }}
                            shadowOpacity={0.08}
                        >
                            {/* ── Title ───────────────────────────── */}
                            <YStack gap="$1" mb="$4">
                                <SizableText size="$7" fow="800" color={COLORS.royalBlue}>Create Account</SizableText>
                                <YStack w={30} h={3} bg={COLORS.teal} br={1.5} />
                            </YStack>

                            <YStack gap="$3">
                                {/* ── Name Row ───────────────────── */}
                                <XStack gap="$2">
                                    <YStack f={1} gap="$1.5">
                                        <SizableText size="$1" fow="700" color={COLORS.textMid} ls={0.5} tt="uppercase" opacity={0.8}>First Name</SizableText>
                                        <XStack ai="center" bg={COLORS.cream} br={12} bw={1} bc={COLORS.sandMid} h={48} px="$3" gap="$2.5">
                                            <User size={16} color={COLORS.royalBlue} opacity={0.5} />
                                            <Input
                                                f={1} placeholder="Optional" value={firstName}
                                                onChangeText={setFirstName} autoCapitalize="words"
                                                bg="transparent" bw={0} size="$3" disabled={isLoading}
                                            />
                                        </XStack>
                                    </YStack>
                                    <YStack f={1} gap="$1.5">
                                        <SizableText size="$1" fow="700" color={COLORS.textMid} ls={0.5} tt="uppercase" opacity={0.8}>Last Name</SizableText>
                                        <XStack ai="center" bg={COLORS.cream} br={12} bw={1} bc={COLORS.sandMid} h={48} px="$3" gap="$2.5">
                                            <User size={16} color={COLORS.royalBlue} opacity={0.5} />
                                            <Input
                                                f={1} placeholder="Optional" value={lastName}
                                                onChangeText={setLastName} autoCapitalize="words"
                                                bg="transparent" bw={0} size="$3" disabled={isLoading}
                                            />
                                        </XStack>
                                    </YStack>
                                </XStack>

                                {/* ── Gender & Birthdate Row ─────── */}
                                <XStack gap="$2">
                                    <YStack f={1} gap="$1.5">
                                        <SizableText size="$1" fow="700" color={COLORS.textMid} ls={0.5} tt="uppercase" opacity={0.8}>Gender</SizableText>
                                        <Pressable onPress={() => setShowGenderSheet(true)} disabled={isLoading}>
                                            <XStack
                                                ai="center" jc="space-between" bg={COLORS.cream}
                                                br={12} bw={1} bc={COLORS.sandMid} h={48} px="$3"
                                            >
                                                <SizableText size="$3" color={gender ? COLORS.textDark : COLORS.sandMid} fow={gender ? "500" : "400"}>
                                                    {gender || "Select"}
                                                </SizableText>
                                                <ChevronDown size={16} color={COLORS.textMid} />
                                            </XStack>
                                        </Pressable>
                                    </YStack>
                                    <YStack f={1} gap="$1.5">
                                        <SizableText size="$1" fow="700" color={COLORS.textMid} ls={0.5} tt="uppercase" opacity={0.8}>Birthdate</SizableText>
                                        <Pressable onPress={() => setShowDatePicker(true)} disabled={isLoading}>
                                            <XStack
                                                ai="center" jc="space-between" bg={COLORS.cream}
                                                br={12} bw={1} bc={COLORS.sandMid} h={48} px="$3"
                                            >
                                                <SizableText
                                                    size="$3"
                                                    color={birthdate ? COLORS.textDark : COLORS.sandMid}
                                                    fow={birthdate ? "500" : "400"}
                                                >
                                                    {birthdate
                                                        ? birthdate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                                        : "Select"}
                                                </SizableText>
                                                <Calendar size={16} color={COLORS.textMid} />
                                            </XStack>
                                        </Pressable>
                                    </YStack>
                                </XStack>

                                {/* ── Email ───────────────────────── */}
                                <YStack gap="$1.5">
                                    <SizableText size="$1" fow="700" color={COLORS.textMid} ls={0.5} tt="uppercase" opacity={0.8}>Email address *</SizableText>
                                    <XStack ai="center" bg={COLORS.cream} br={12} bw={1} bc={COLORS.sandMid} h={48} px="$3" gap="$2.5">
                                        <Mail size={16} color={COLORS.royalBlue} opacity={0.5} />
                                        <Input
                                            f={1} placeholder="Enter your email" value={email}
                                            onChangeText={setEmail} autoCapitalize="none"
                                            keyboardType="email-address" bg="transparent" bw={0} size="$3"
                                            disabled={isLoading}
                                        />
                                    </XStack>
                                </YStack>

                                {/* ── Password ───────────────────── */}
                                <YStack gap="$1.5">
                                    <SizableText size="$1" fow="700" color={COLORS.textMid} ls={0.5} tt="uppercase" opacity={0.8}>Password *</SizableText>
                                    <XStack ai="center" bg={COLORS.cream} br={12} bw={1} bc={COLORS.sandMid} h={48} px="$3" gap="$2.5">
                                        <Lock size={16} color={COLORS.royalBlue} opacity={0.5} />
                                        <Input
                                            f={1} placeholder="Min 6 characters" value={password}
                                            onChangeText={setPassword} secureTextEntry={!showPassword}
                                            autoCapitalize="none" bg="transparent" bw={0} size="$3"
                                            disabled={isLoading}
                                        />
                                        <Button
                                            bg="transparent" p={0}
                                            onPress={() => setShowPassword(!showPassword)}
                                            icon={showPassword ? <EyeOff size={16} color={COLORS.textMid} /> : <Eye size={16} color={COLORS.textMid} />}
                                        />
                                    </XStack>
                                    {password.length > 0 && (
                                        <XStack gap="$3" mt="$1" flexWrap="wrap">
                                            <PasswordCheck met={passwordRequirements.minLength} text="6+ chars" />
                                            <PasswordCheck met={passwordRequirements.hasNumber} text="Number" />
                                            <PasswordCheck met={passwordRequirements.hasUpperCase} text="Uppercase" />
                                        </XStack>
                                    )}
                                </YStack>

                                {/* ── Confirm Password ───────────── */}
                                <YStack gap="$1.5">
                                    <SizableText size="$1" fow="700" color={COLORS.textMid} ls={0.5} tt="uppercase" opacity={0.8}>Confirm Password *</SizableText>
                                    <XStack ai="center" bg={COLORS.cream} br={12} bw={1} bc={COLORS.sandMid} h={48} px="$3" gap="$2.5">
                                        <Lock size={16} color={COLORS.royalBlue} opacity={0.5} />
                                        <Input
                                            f={1} placeholder="Re-enter password" value={confirmPassword}
                                            onChangeText={setConfirmPassword} secureTextEntry={!showConfirmPassword}
                                            autoCapitalize="none" bg="transparent" bw={0} size="$3"
                                            disabled={isLoading}
                                        />
                                        <Button
                                            bg="transparent" p={0}
                                            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                            icon={showConfirmPassword ? <EyeOff size={16} color={COLORS.textMid} /> : <Eye size={16} color={COLORS.textMid} />}
                                        />
                                    </XStack>
                                    {confirmPassword.length > 0 && (
                                        <XStack ai="center" gap="$1.5" mt="$1">
                                            <Circle size={6} bg={password === confirmPassword ? COLORS.success : COLORS.error} />
                                            <SizableText size="$1" fow="500" color={password === confirmPassword ? COLORS.success : COLORS.error}>
                                                {password === confirmPassword ? "Passwords match" : "Passwords don't match"}
                                            </SizableText>
                                        </XStack>
                                    )}
                                </YStack>

                                {/* ── Register Button ────────────── */}
                                <Button
                                    bg={COLORS.royalBlue} h={52} br={16} mt="$2"
                                    onPress={handleRegister}
                                    disabled={!email || !password || !confirmPassword || password !== confirmPassword || isLoading}
                                    opacity={(!email || !password || !confirmPassword || password !== confirmPassword) ? 0.5 : 1}
                                    pressStyle={{ scale: 0.98, opacity: 0.9 }}
                                    elevation={4} shadowColor={COLORS.royalBlue}
                                    iconAfter={isLoading ? <Spinner color="white" /> : <ArrowRight size={18} color="white" />}
                                >
                                    <SizableText color="white" fow="700" size="$3" ls={0.5}>
                                        {isLoading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
                                    </SizableText>
                                </Button>

                                {/* ── Login Link ─────────────────── */}
                                <XStack jc="center" ai="center" gap="$2" mt="$1">
                                    <SizableText color={COLORS.textMid} size="$2">Already have an account?</SizableText>
                                    <Button chromeless p={0} h="auto" onPress={() => navigation.navigate("Login")}>
                                        <SizableText color={COLORS.royalBlue} fow="700" size="$2" textDecorationLine="underline">Sign in</SizableText>
                                    </Button>
                                </XStack>
                            </YStack>
                        </YStack>
                    </Animated.View>
                </KeyboardAvoidingView>
            </ScrollView>

            {/* ─── Gender Selection Modal ─────────────────────────── */}
            <Modal
                visible={showGenderSheet}
                transparent
                animationType="fade"
                onRequestClose={() => setShowGenderSheet(false)}
            >
                <Pressable
                    style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' }}
                    onPress={() => setShowGenderSheet(false)}
                >
                    <Pressable onPress={(e) => e.stopPropagation()}>
                        <YStack bg={COLORS.white} borderTopLeftRadius={28} borderTopRightRadius={28} p="$5" pb="$8" gap="$2">
                            <YStack ai="center" mb="$2">
                                <YStack w={36} h={4} bg={COLORS.sandMid} br={2} />
                            </YStack>
                            <SizableText size="$4" fow="700" color={COLORS.textDark} mb="$2">Select Gender</SizableText>
                            {["Male", "Female", "Other", "Prefer not to say"].map((option) => (
                                <Pressable
                                    key={option}
                                    onPress={() => { setGender(option); setShowGenderSheet(false); }}
                                >
                                    <XStack
                                        ai="center" gap="$3" px="$4" py="$3" br={14}
                                        bg={gender === option ? COLORS.warmWhite : "transparent"}
                                        bw={1} bc={gender === option ? COLORS.teal : COLORS.sandMid}
                                    >
                                        <YStack w={18} h={18} br={9} bw={2} bc={gender === option ? COLORS.teal : COLORS.sandMid} jc="center" ai="center">
                                            {gender === option && <Circle size={8} bg={COLORS.teal} />}
                                        </YStack>
                                        <SizableText size="$3" fow={gender === option ? "600" : "400"} color={gender === option ? COLORS.teal : COLORS.textMid}>
                                            {option}
                                        </SizableText>
                                    </XStack>
                                </Pressable>
                            ))}
                        </YStack>
                    </Pressable>
                </Pressable>
            </Modal>

            {/* ─── Date Picker ────────────────────────────────────── */}
            {showDatePicker && (
                Platform.OS === 'ios' ? (
                    <Modal
                        visible={showDatePicker}
                        transparent
                        animationType="fade"
                        onRequestClose={() => setShowDatePicker(false)}
                    >
                        <Pressable
                            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' }}
                            onPress={() => setShowDatePicker(false)}
                        >
                            <Pressable onPress={(e) => e.stopPropagation()}>
                                <YStack bg={COLORS.white} borderTopLeftRadius={28} borderTopRightRadius={28} p="$5" pb="$8">
                                    <XStack jc="space-between" ai="center" mb="$3">
                                        <SizableText size="$4" fow="700" color={COLORS.textDark}>Select Birthdate</SizableText>
                                        <Button size="$3" br={10} bg={COLORS.royalBlue} onPress={() => setShowDatePicker(false)}
                                            pressStyle={{ scale: 0.98, opacity: 0.9 }}
                                        >
                                            <SizableText color="white" fow="600" size="$2">Done</SizableText>
                                        </Button>
                                    </XStack>
                                    <DateTimePicker
                                        value={birthdate || new Date(2000, 0, 1)}
                                        mode="date"
                                        display="spinner"
                                        maximumDate={new Date()}
                                        minimumDate={new Date(1920, 0, 1)}
                                        onChange={(_event: any, selectedDate?: Date) => {
                                            if (selectedDate) setBirthdate(selectedDate);
                                        }}
                                    />
                                </YStack>
                            </Pressable>
                        </Pressable>
                    </Modal>
                ) : (
                    <DateTimePicker
                        value={birthdate || new Date(2000, 0, 1)}
                        mode="date"
                        display="default"
                        maximumDate={new Date()}
                        minimumDate={new Date(1920, 0, 1)}
                        onChange={(_event: any, selectedDate?: Date) => {
                            setShowDatePicker(false);
                            if (selectedDate) setBirthdate(selectedDate);
                        }}
                    />
                )
            )}
        </YStack>
    );
};

export default RegisterScreen;