import React, { useState, useContext } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { AuthContext } from "../context/AuthContext";

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    
    // Use the login function from AuthContext
    const { login } = useContext(AuthContext);

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
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
            
            // Use AuthContext login function
            await login({
                email: email.toLowerCase().trim(),
                password: password.trim()
            });

            console.log("Login successful!");
            
            // Clear form
            setEmail("");
            setPassword("");
            
            // No need to navigate manually - AppNavigator will handle this
            // when the user state changes in AuthContext
            
        } catch (err) {
            console.error("Login error:", err);
            
            let errorMessage = "Invalid credentials";
            
            if (err.detail) {
                errorMessage = err.detail;
            } else if (err.message) {
                errorMessage = err.message;
            } else if (err.error) {
                errorMessage = err.error;
            }
            
            Alert.alert("Login Failed", errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
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
        </View>
    );
};

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        justifyContent: "center", 
        alignItems: "center", 
        padding: 20,
        backgroundColor: "#f8f9fa"
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
    }
});

export default LoginScreen;