import React, { useEffect, useState, useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { AuthContext } from "../context/AuthContext";

const ProfileScreen = ({ navigation }) => {
    const { user, logout } = useContext(AuthContext);

    const handleLogout = async () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Logout",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            console.log("Starting logout process...");
                            await logout();
                            console.log("Logout successful");
                            // No need to navigate - AppNavigator will handle this automatically
                        } catch (error) {
                            console.error("Error logging out:", error);
                            Alert.alert("Error", "Failed to logout. Please try again.");
                        }
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Profile</Text>
            {user ? (
                <>
                    <Text style={styles.info}>👤 {user.username || 'User'}</Text>
                    <Text style={styles.info}>📧 {user.email}</Text>
                </>
            ) : (
                <Text style={styles.info}>Loading user info...</Text>
            )}

            <TouchableOpacity style={styles.button} onPress={handleLogout}>
                <Text style={styles.buttonText}>Logout</Text>
            </TouchableOpacity>
        </View>
    );
};

export default ProfileScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9f9f9",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "700",
        color: "#1e90ff",
        marginBottom: 20,
    },
    info: {
        fontSize: 16,
        color: "#333",
        marginBottom: 10,
    },
    button: {
        backgroundColor: "#ff4d4d",
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 8,
        marginTop: 20,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
});