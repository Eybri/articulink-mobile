import React, { useState, useContext } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ScrollView,
  Animated,
  Dimensions,
  StatusBar,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  ArrowLeft,
  User,
  Sparkles,
  Check
} from "lucide-react-native";
import { AuthContext } from "./../context/AuthContext"; 

const { width, height } = Dimensions.get('window');

const RegisterScreen = ({ navigation }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useContext(AuthContext);

    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const slideAnim = React.useRef(new Animated.Value(30)).current;

    React.useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    const validateForm = () => {
        if (!email || !password || !confirmPassword) {
            return "All fields are required";
        }

        if (password.length < 6) {
            return "Password must be at least 6 characters long";
        }

        if (password !== confirmPassword) {
            return "Passwords do not match";
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return "Please enter a valid email address";
        }

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
            const registerData = {
                email: email.toLowerCase().trim(),
                password: password,
                first_name: firstName.trim(),
                last_name: lastName.trim()
            };

            await register(registerData);
            
            Alert.alert("Success", "Registration complete! Please login.");
            navigation.navigate("Login");
            
        } catch (err) {
            console.error("Registration error:", err);
            const errorMessage = err.detail || err.message || "Registration failed. Please try again.";
            Alert.alert("Registration Failed", errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const PasswordRequirement = ({ met, text }) => (
        <View style={styles.requirementRow}>
            <View style={[
                styles.requirementDot,
                met && styles.requirementDotMet
            ]}>
                {met && <Check size={10} color="white" />}
            </View>
            <Text style={[
                styles.requirementText,
                met && styles.requirementTextMet
            ]}>
                {text}
            </Text>
        </View>
    );

    const passwordRequirements = {
        minLength: password.length >= 6,
        hasNumber: /\d/.test(password),
        hasUpperCase: /[A-Z]/.test(password),
    };

    return (
        <KeyboardAvoidingView 
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <StatusBar barStyle="dark-content" backgroundColor="#fafafa" />
            
            {/* Background */}
            <View style={styles.background}>
                <View style={[styles.orb, styles.orb1]} />
                <View style={[styles.orb, styles.orb2]} />
            </View>

            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity 
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.7}
                    >
                        <ArrowLeft size={24} color="#475569" />
                    </TouchableOpacity>
                    
                    <View style={styles.logoContainer}>
                        <View style={styles.logoCircle}>
                            <Sparkles size={22} color="#2563eb" fill="#2563eb" />
                        </View>
                        <Text style={styles.logoText}>Articulink</Text>
                    </View>
                    
                    <View style={styles.placeholder} />
                </View>

                <Animated.View style={[
                    styles.content,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }]
                    }
                ]}>
                    
                    {/* Welcome Section */}
                    <View style={styles.welcomeSection}>
                        <Text style={styles.title}>Create Account</Text>
                        <Text style={styles.subtitle}>
                            Join thousands experiencing seamless communication
                        </Text>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        {/* Name Row */}
                        <View style={styles.nameRow}>
                            <View style={[styles.inputContainer, styles.nameInput]}>
                                <View style={styles.inputLabelContainer}>
                                    <User size={16} color="#64748b" />
                                    <Text style={styles.inputLabel}>First Name</Text>
                                </View>
                                <TextInput 
                                    style={styles.input}
                                    placeholder="Optional"
                                    placeholderTextColor="#94a3b8"
                                    value={firstName} 
                                    onChangeText={setFirstName}
                                    autoCapitalize="words"
                                    editable={!isLoading}
                                />
                            </View>
                            
                            <View style={[styles.inputContainer, styles.nameInput]}>
                                <View style={styles.inputLabelContainer}>
                                    <User size={16} color="#64748b" />
                                    <Text style={styles.inputLabel}>Last Name</Text>
                                </View>
                                <TextInput 
                                    style={styles.input}
                                    placeholder="Optional"
                                    placeholderTextColor="#94a3b8"
                                    value={lastName} 
                                    onChangeText={setLastName}
                                    autoCapitalize="words"
                                    editable={!isLoading}
                                />
                            </View>
                        </View>

                        {/* Email Input */}
                        <View style={styles.inputContainer}>
                            <View style={styles.inputLabelContainer}>
                                <Mail size={16} color="#64748b" />
                                <Text style={styles.inputLabel}>Email Address *</Text>
                            </View>
                            <TextInput 
                                style={styles.input}
                                placeholder="Enter your email"
                                placeholderTextColor="#94a3b8"
                                value={email} 
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                autoComplete="email"
                                editable={!isLoading}
                            />
                        </View>

                        {/* Password Input */}
                        <View style={styles.inputContainer}>
                            <View style={styles.inputLabelContainer}>
                                <Lock size={16} color="#64748b" />
                                <Text style={styles.inputLabel}>Password *</Text>
                            </View>
                            <View style={styles.passwordInputContainer}>
                                <TextInput 
                                    style={[styles.input, styles.passwordInput]}
                                    placeholder="Minimum 6 characters"
                                    placeholderTextColor="#94a3b8"
                                    value={password} 
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                    autoCapitalize="none"
                                    editable={!isLoading}
                                />
                                <TouchableOpacity 
                                    style={styles.eyeButton}
                                    onPress={() => setShowPassword(!showPassword)}
                                    activeOpacity={0.7}
                                >
                                    {showPassword ? 
                                        <EyeOff size={20} color="#64748b" /> : 
                                        <Eye size={20} color="#64748b" />
                                    }
                                </TouchableOpacity>
                            </View>
                            
                            {/* Password Requirements */}
                            {password.length > 0 && (
                                <View style={styles.requirementsContainer}>
                                    <PasswordRequirement 
                                        met={passwordRequirements.minLength} 
                                        text="At least 6 characters" 
                                    />
                                    <PasswordRequirement 
                                        met={passwordRequirements.hasNumber} 
                                        text="Contains a number" 
                                    />
                                    <PasswordRequirement 
                                        met={passwordRequirements.hasUpperCase} 
                                        text="Contains uppercase letter" 
                                    />
                                </View>
                            )}
                        </View>

                        {/* Confirm Password Input */}
                        <View style={styles.inputContainer}>
                            <View style={styles.inputLabelContainer}>
                                <Lock size={16} color="#64748b" />
                                <Text style={styles.inputLabel}>Confirm Password *</Text>
                            </View>
                            <View style={styles.passwordInputContainer}>
                                <TextInput 
                                    style={[styles.input, styles.passwordInput]}
                                    placeholder="Re-enter your password"
                                    placeholderTextColor="#94a3b8"
                                    value={confirmPassword} 
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry={!showConfirmPassword}
                                    autoCapitalize="none"
                                    editable={!isLoading}
                                />
                                <TouchableOpacity 
                                    style={styles.eyeButton}
                                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                    activeOpacity={0.7}
                                >
                                    {showConfirmPassword ? 
                                        <EyeOff size={20} color="#64748b" /> : 
                                        <Eye size={20} color="#64748b" />
                                    }
                                </TouchableOpacity>
                            </View>
                            
                            {/* Password Match Indicator */}
                            {confirmPassword.length > 0 && (
                                <View style={styles.matchIndicator}>
                                    <View style={[
                                        styles.matchDot,
                                        password === confirmPassword ? styles.matchDotValid : styles.matchDotInvalid
                                    ]} />
                                    <Text style={[
                                        styles.matchText,
                                        password === confirmPassword ? styles.matchTextValid : styles.matchTextInvalid
                                    ]}>
                                        {password === confirmPassword ? "Passwords match" : "Passwords do not match"}
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* Register Button */}
                        <TouchableOpacity 
                            style={[
                                styles.registerButton,
                                (!email || !password || !confirmPassword || password !== confirmPassword) && styles.registerButtonDisabled
                            ]}
                            onPress={handleRegister}
                            disabled={!email || !password || !confirmPassword || password !== confirmPassword || isLoading}
                            activeOpacity={0.9}
                        >
                            <Text style={styles.registerButtonText}>
                                {isLoading ? "Creating Account..." : "Create Account"}
                            </Text>
                        </TouchableOpacity>

                        {/* Login Link */}
                        <View style={styles.loginContainer}>
                            <Text style={styles.loginText}>
                                Already have an account?{' '}
                            </Text>
                            <TouchableOpacity 
                                onPress={() => navigation.navigate("Login")}
                                disabled={isLoading}
                            >
                                <Text style={styles.loginLink}>Sign in</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Security Badge */}
                    <View style={styles.securityBadge}>
                        <Lock size={14} color="#64748b" />
                        <Text style={styles.securityText}>
                            Your data is securely encrypted
                        </Text>
                    </View>
                </Animated.View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fafafa',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    background: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    orb: {
        position: 'absolute',
        borderRadius: 500,
        opacity: 0.4,
    },
    orb1: {
        width: width * 0.6,
        height: width * 0.6,
        top: -width * 0.2,
        right: -width * 0.2,
        backgroundColor: '#dbeafe',
    },
    orb2: {
        width: width * 0.4,
        height: width * 0.4,
        bottom: height * 0.1,
        left: -width * 0.1,
        backgroundColor: '#f0f9ff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    logoText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
        letterSpacing: -0.5,
    },
    placeholder: {
        width: 40,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
    },
    welcomeSection: {
        marginBottom: 32,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#0f172a',
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 15,
        color: '#64748b',
        lineHeight: 22,
    },
    form: {
        marginBottom: 32,
    },
    nameRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    nameInput: {
        width: '48%',
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
        marginLeft: 8,
        letterSpacing: 0.3,
    },
    input: {
        backgroundColor: 'white',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 16,
        fontSize: 16,
        color: '#0f172a',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    passwordInputContainer: {
        position: 'relative',
    },
    passwordInput: {
        paddingRight: 50,
    },
    eyeButton: {
        position: 'absolute',
        right: 16,
        top: 16,
        padding: 4,
    },
    requirementsContainer: {
        marginTop: 12,
        gap: 8,
    },
    requirementRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    requirementDot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#e2e8f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    requirementDotMet: {
        backgroundColor: '#10b981',
    },
    requirementText: {
        fontSize: 13,
        color: '#94a3b8',
    },
    requirementTextMet: {
        color: '#059669',
    },
    matchIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    matchDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    matchDotValid: {
        backgroundColor: '#10b981',
    },
    matchDotInvalid: {
        backgroundColor: '#ef4444',
    },
    matchText: {
        fontSize: 13,
        fontWeight: '500',
    },
    matchTextValid: {
        color: '#059669',
    },
    matchTextInvalid: {
        color: '#dc2626',
    },
    registerButton: {
        backgroundColor: '#2563eb',
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
        shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
        marginBottom: 24,
    },
    registerButtonDisabled: {
        backgroundColor: '#cbd5e1',
        shadowColor: '#64748b',
        shadowOpacity: 0.1,
    },
    registerButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginText: {
        fontSize: 15,
        color: '#64748b',
    },
    loginLink: {
        fontSize: 15,
        fontWeight: '600',
        color: '#2563eb',
    },
    securityBadge: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    securityText: {
        fontSize: 13,
        color: '#64748b',
        marginLeft: 6,
        letterSpacing: 0.3,
    },
});

export default RegisterScreen;