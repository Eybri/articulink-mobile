import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from "react-native";
import baseURL from "../utils/baseurl";
import { storeToken } from "../utils/authToken";

const RegisterScreen = ({ navigation }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Email and password are required");
            return;
        }

        setIsLoading(true);
        
        try {
            const response = await fetch(`${baseURL}/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email.toLowerCase().trim(),
                    password: password,
                    first_name: firstName.trim(),
                    last_name: lastName.trim()
                }),
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert("Success", "Registration complete! Please login.");
                navigation.navigate("Login");
            } else {
                Alert.alert("Registration failed", data.detail || "Try again later");
            }
        } catch (err) {
            console.error("Registration error:", err);
            Alert.alert("Error", "Network error. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Create Account</Text>
            
            <TextInput 
                placeholder="First Name (Optional)" 
                style={styles.input} 
                value={firstName} 
                onChangeText={setFirstName}
                autoCapitalize="words"
            />
            
            <TextInput 
                placeholder="Last Name (Optional)" 
                style={styles.input} 
                value={lastName} 
                onChangeText={setLastName}
                autoCapitalize="words"
            />
            
            <TextInput 
                placeholder="Email *" 
                style={styles.input} 
                value={email} 
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
            />
            
            <TextInput 
                placeholder="Password *" 
                style={styles.input} 
                secureTextEntry 
                value={password} 
                onChangeText={setPassword}
                minLength={6}
            />
            
            <TouchableOpacity 
                style={[styles.button, isLoading && styles.buttonDisabled]} 
                onPress={handleRegister}
                disabled={isLoading}
            >
                <Text style={styles.buttonText}>
                    {isLoading ? "Creating Account..." : "Register"}
                </Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={styles.link}>Already have an account? Login</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { 
        flexGrow: 1, 
        justifyContent: "center", 
        alignItems: "center", 
        padding: 20 
    },
    title: { 
        fontSize: 28, 
        fontWeight: "bold", 
        marginBottom: 30,
        color: "#333"
    },
    input: { 
        width: "100%", 
        height: 50, 
        borderWidth: 1, 
        borderColor: "#ddd",
        paddingHorizontal: 15, 
        marginBottom: 15, 
        borderRadius: 8,
        backgroundColor: "#fff",
        fontSize: 16
    },
    button: { 
        width: "100%", 
        backgroundColor: "#1e90ff", 
        padding: 15, 
        borderRadius: 8, 
        alignItems: "center",
        marginTop: 10
    },
    buttonDisabled: {
        backgroundColor: "#ccc"
    },
    buttonText: { 
        color: "#fff", 
        fontSize: 18, 
        fontWeight: "bold" 
    },
    link: { 
        marginTop: 20, 
        color: "#1e90ff",
        fontSize: 16
    },
});

export default RegisterScreen;