import React, { useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { AuthContext } from "../context/AuthContext";

const HomeScreen = ({ navigation }) => {
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
                            // AppNavigator will automatically switch to AuthNavigator
                            // when user becomes null
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
            <View style={styles.header}>
                <Text style={styles.title}>Welcome to ArticuLink 🎉</Text>
                <Text style={styles.subtitle}>
                    Hello {user?.username || user?.email || 'User'}!
                </Text>
                <Text style={styles.subtitle}>This is your home dashboard.</Text>
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.navigate("Profile")}
                >
                    <Text style={styles.buttonText}>Go to Profile</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.secondaryButton]}
                    onPress={() => {
                        Alert.alert("Info", "More features coming soon!");
                    }}
                >
                    <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                        Explore Features
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                >
                    <Text style={styles.logoutButtonText}>Logout</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default HomeScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9f9f9",
        padding: 20,
    },
    header: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 50,
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        color: "#1e90ff",
        marginBottom: 10,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 16,
        color: "#333",
        marginBottom: 10,
        textAlign: "center",
        lineHeight: 22,
    },
    buttonContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 15,
    },
    button: {
        backgroundColor: "#1e90ff",
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 10,
        width: "100%",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    secondaryButton: {
        backgroundColor: "#fff",
        borderWidth: 2,
        borderColor: "#1e90ff",
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    secondaryButtonText: {
        color: "#1e90ff",
    },
    footer: {
        alignItems: "center",
        paddingBottom: 30,
    },
    logoutButton: {
        backgroundColor: "transparent",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#dc3545",
    },
    logoutButtonText: {
        color: "#dc3545",
        fontSize: 16,
        fontWeight: "600",
    },
});