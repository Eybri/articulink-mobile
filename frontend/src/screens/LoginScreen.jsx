import React, { useState, useContext } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ScrollView,
  Dimensions,
  Animated,
  StatusBar,
  ActivityIndicator
} from "react-native";
import { AuthContext } from "../context/AuthContext";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Shield } from "lucide-react-native";

const { width } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [fadeAnim] = useState(new Animated.Value(0));
    const [slideAnim] = useState(new Animated.Value(30));
    
    const { login } = useContext(AuthContext);

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

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const formatDeactivationMessage = (errorDetail) => {
        const timeMatch = errorDetail.match(/Available in (\d+) days/);
        const reasonMatch = errorDetail.match(/Reason: (.+)$/);
        
        let message = "";
        let title = "Account Deactivated";
        
        if (errorDetail.includes("temporarily deactivated")) {
            title = "Account Temporarily Deactivated";
            
            if (timeMatch) {
                const days = timeMatch[1];
                message = `Your account is temporarily deactivated. It will be automatically reactivated in ${days} day${days > 1 ? 's' : ''}.`;
            } else {
                message = "Your account is temporarily deactivated. Please try again later.";
            }
            
            if (reasonMatch && reasonMatch[1] && reasonMatch[1] !== "No reason provided") {
                message += `\n\nReason: ${reasonMatch[1]}`;
            }
            
        } else if (errorDetail.includes("Account deactivated")) {
            title = "Account Permanently Deactivated";
            message = "Your account has been permanently deactivated.";
            
            if (reasonMatch && reasonMatch[1] && reasonMatch[1] !== "No reason provided") {
                message += `\n\nReason: ${reasonMatch[1]}`;
            }
            
            message += "\n\nPlease contact support for more information.";
        }
        
        return { title, message };
    };

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        if (!validateEmail(email)) {
            Alert.alert("Error", "Please enter a valid email address");
            return;
        }

        if (password.length < 6) {
            Alert.alert("Error", "Password must be at least 6 characters");
            return;
        }

        setIsLoading(true);
        
        try {
            console.log("Attempting login...");
            
            await login({
                email: email.toLowerCase().trim(),
                password: password.trim()
            });

            console.log("Login successful!");
            
            setEmail("");
            setPassword("");
            
        } catch (err) {
            console.error("Login error:", err);
            
            let errorMessage = "Invalid credentials";
            let errorTitle = "Login Failed";
            
            if (err.detail) {
                if (err.detail.includes("deactivated")) {
                    const { title, message } = formatDeactivationMessage(err.detail);
                    errorTitle = title;
                    errorMessage = message;
                } else {
                    errorMessage = err.detail;
                }
            } else if (err.message) {
                errorMessage = err.message;
            } else if (err.error) {
                errorMessage = err.error;
            }
            
            Alert.alert(errorTitle, errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fafafa" />
            
            {/* Background Orbs */}
            <View style={styles.backgroundOrbs}>
                <View style={[styles.orb, styles.orb1]} />
                <View style={[styles.orb, styles.orb2]} />
            </View>

            <ScrollView 
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <Animated.View style={[
                    styles.content,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }]
                    }
                ]}>
                    
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.logoContainer}>
                            <View style={styles.logoCircle}>
                                <Shield size={28} color="#2563eb" />
                            </View>
                            <Text style={styles.logoText}>Articulink</Text>
                        </View>
                        <Text style={styles.welcomeTitle}>Welcome Back</Text>
                        <Text style={styles.welcomeSubtitle}>
                            Sign in to continue your communication journey
                        </Text>
                    </View>

                    {/* Form */}
                    <View style={styles.formContainer}>
                        {/* Email Input */}
                        <View style={styles.inputContainer}>
                            <View style={styles.inputIcon}>
                                <Mail size={20} color="#64748b" />
                            </View>
                            <TextInput 
                                placeholder="Email address" 
                                style={styles.input} 
                                value={email} 
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                placeholderTextColor="#94a3b8"
                                editable={!isLoading}
                                autoCorrect={false}
                                returnKeyType="next"
                            />
                        </View>

                        {/* Password Input */}
                        <View style={styles.inputContainer}>
                            <View style={styles.inputIcon}>
                                <Lock size={20} color="#64748b" />
                            </View>
                            <TextInput 
                                placeholder="Password" 
                                style={styles.input} 
                                secureTextEntry={!showPassword}
                                value={password} 
                                onChangeText={setPassword}
                                placeholderTextColor="#94a3b8"
                                editable={!isLoading}
                                autoCorrect={false}
                                returnKeyType="done"
                                onSubmitEditing={handleLogin}
                            />
                            <TouchableOpacity 
                                style={styles.eyeIcon}
                                onPress={() => setShowPassword(!showPassword)}
                                disabled={isLoading}
                            >
                                {showPassword ? 
                                    <EyeOff size={20} color="#64748b" /> : 
                                    <Eye size={20} color="#64748b" />
                                }
                            </TouchableOpacity>
                        </View>

                        {/* Login Button */}
                        <TouchableOpacity 
                            style={[
                                styles.loginButton, 
                                isLoading && styles.loginButtonDisabled
                            ]} 
                            onPress={handleLogin}
                            disabled={isLoading}
                            activeOpacity={0.9}
                        >
                            {isLoading ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <>
                                    <Text style={styles.loginButtonText}>Sign In</Text>
                                    <View style={styles.buttonIcon}>
                                        <ArrowRight size={20} color="white" />
                                    </View>
                                </>
                            )}
                        </TouchableOpacity>

                        {/* Divider */}
                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>or</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        {/* Register Link */}
                        <TouchableOpacity 
                            onPress={() => navigation.navigate("Register")}
                            style={styles.registerContainer}
                            disabled={isLoading}
                        >
                            <Text style={styles.registerText}>
                                Don't have an account?{" "}
                                <Text style={styles.registerLink}>Create one</Text>
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Security Info */}
                    <View style={styles.securityInfo}>
                        <View style={styles.securityIcon}>
                            <Shield size={16} color="#64748b" />
                        </View>
                        <Text style={styles.securityText}>
                            Your data is securely encrypted and protected
                        </Text>
                    </View>
                </Animated.View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fafafa',
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    backgroundOrbs: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    orb: {
        position: 'absolute',
        borderRadius: 500,
        opacity: 0.6,
    },
    orb1: {
        width: width * 0.7,
        height: width * 0.7,
        top: -width * 0.3,
        right: -width * 0.2,
        backgroundColor: '#dbeafe',
    },
    orb2: {
        width: width * 0.5,
        height: width * 0.5,
        bottom: -width * 0.2,
        left: -width * 0.1,
        backgroundColor: '#f0f9ff',
    },
    content: {
        paddingHorizontal: 24,
        paddingVertical: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    logoCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    logoText: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1e293b',
        letterSpacing: -0.5,
    },
    welcomeTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#0f172a',
        marginBottom: 8,
        textAlign: 'center',
        letterSpacing: -0.5,
    },
    welcomeSubtitle: {
        fontSize: 16,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 22,
        maxWidth: 280,
    },
    formContainer: {
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 8,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        overflow: 'hidden',
    },
    inputIcon: {
        padding: 16,
        paddingRight: 12,
    },
    input: {
        flex: 1,
        height: 56,
        fontSize: 16,
        color: '#0f172a',
        paddingRight: 16,
    },
    eyeIcon: {
        padding: 16,
        paddingLeft: 12,
    },
    loginButton: {
        backgroundColor: '#2563eb',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 16,
        marginTop: 8,
        marginBottom: 24,
        shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    loginButtonDisabled: {
        backgroundColor: '#94a3b8',
        shadowOpacity: 0,
        elevation: 0,
    },
    loginButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
        marginRight: 8,
        letterSpacing: 0.5,
    },
    buttonIcon: {
        opacity: 0.9,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#e2e8f0',
    },
    dividerText: {
        color: '#94a3b8',
        fontSize: 14,
        fontWeight: '500',
        marginHorizontal: 16,
        letterSpacing: 0.5,
    },
    registerContainer: {
        alignItems: 'center',
    },
    registerText: {
        color: '#64748b',
        fontSize: 16,
        textAlign: 'center',
    },
    registerLink: {
        color: '#2563eb',
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    securityInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 32,
        padding: 16,
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    securityIcon: {
        marginRight: 8,
        opacity: 0.7,
    },
    securityText: {
        color: '#64748b',
        fontSize: 14,
        fontWeight: '500',
        letterSpacing: 0.3,
    },
});

export default LoginScreen;