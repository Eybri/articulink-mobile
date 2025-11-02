import React, { useState, useContext } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from "react-native";
import { AuthContext } from "../context/AuthContext";

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    
    const { login } = useContext(AuthContext);

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const formatDeactivationMessage = (errorDetail) => {
        // Extract time information
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
        // Input validation
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
            
            // Clear form
            setEmail("");
            setPassword("");
            
        } catch (err) {
            console.error("Login error:", err);
            
            let errorMessage = "Invalid credentials";
            let errorTitle = "Login Failed";
            
            if (err.detail) {
                // Check for deactivation messages
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
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>Sign in to your account</Text>
                
                <TextInput 
                    placeholder="Email" 
                    style={styles.input} 
                    value={email} 
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    placeholderTextColor="#999"
                    editable={!isLoading}
                    autoCorrect={false}
                />
                
                <TextInput 
                    placeholder="Password" 
                    style={styles.input} 
                    secureTextEntry 
                    value={password} 
                    onChangeText={setPassword}
                    placeholderTextColor="#999"
                    editable={!isLoading}
                    autoCorrect={false}
                />
                
                <TouchableOpacity 
                    style={[styles.button, isLoading && styles.buttonDisabled]} 
                    onPress={handleLogin}
                    disabled={isLoading}
                    activeOpacity={0.8}
                >
                    <Text style={styles.buttonText}>
                        {isLoading ? "Logging in..." : "Login"}
                    </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    onPress={() => navigation.navigate("Register")}
                    style={styles.linkContainer}
                    disabled={isLoading}
                >
                    <Text style={styles.link}>Don't have an account? </Text>
                    <Text style={styles.linkBold}>Register</Text>
                </TouchableOpacity>
                
                {/* Information about account status */}
                <View style={styles.infoContainer}>
                    <Text style={styles.infoText}>
                        If your account is deactivated, you'll see the reason and duration here.
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
    },
    container: { 
        flex: 1, 
        justifyContent: "center", 
        alignItems: "center", 
        padding: 20,
        backgroundColor: "#f8f9fa",
        minHeight: '100%',
    },
    title: { 
        fontSize: 32, 
        fontWeight: "bold", 
        marginBottom: 10,
        color: "#333"
    },
    subtitle: {
        fontSize: 16,
        color: "#666",
        marginBottom: 30,
        textAlign: "center"
    },
    input: { 
        width: "100%", 
        height: 55, 
        borderWidth: 1, 
        borderColor: "#ddd",
        paddingHorizontal: 15, 
        marginBottom: 20, 
        borderRadius: 10,
        backgroundColor: "#fff",
        fontSize: 16,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    button: { 
        width: "100%", 
        backgroundColor: "#007bff", 
        padding: 16, 
        borderRadius: 10, 
        alignItems: "center",
        marginTop: 10,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    buttonDisabled: {
        backgroundColor: "#6c757d",
        shadowOpacity: 0,
        elevation: 0,
    },
    buttonText: { 
        color: "#fff", 
        fontSize: 18, 
        fontWeight: "bold" 
    },
    linkContainer: {
        flexDirection: "row",
        marginTop: 25,
        alignItems: "center"
    },
    link: { 
        color: "#666",
        fontSize: 16
    },
    linkBold: {
        color: "#007bff",
        fontSize: 16,
        fontWeight: "bold"
    },
    infoContainer: {
        marginTop: 30,
        padding: 15,
        backgroundColor: "#e9ecef",
        borderRadius: 8,
        width: "100%",
    },
    infoText: {
        color: "#6c757d",
        fontSize: 14,
        textAlign: "center",
        lineHeight: 20,
    }
});

export default LoginScreen;