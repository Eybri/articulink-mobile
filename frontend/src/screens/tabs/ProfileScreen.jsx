import React, { useState, useContext, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Image } from "react-native";
import { AuthContext } from "../../context/AuthContext";
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from "axios";
import baseURL from "../../utils/baseurl";

const ProfileScreen = ({ navigation }) => {
    const { logout } = useContext(AuthContext);
    const [user, setUser] = useState(null);

    useFocusEffect(
        useCallback(() => {
            const fetchProfile = async () => {
                try {
                    const { data } = await axios.get(`${baseURL}/auth/me`);
                    setUser(data);
                } catch (error) {
                    Alert.alert("Error", "Failed to load profile");
                }
            };
            fetchProfile();
        }, [])
    );

    const handleLogout = () => {
        Alert.alert("Logout", "Are you sure you want to logout?", [
            { text: "Cancel", style: "cancel" },
            { 
                text: "Logout", 
                style: "destructive",
                onPress: async () => {
                    try {
                        await logout();
                    } catch (error) {
                        Alert.alert("Error", "Failed to logout. Please try again.");
                    }
                }
            }
        ]);
    };

    const InfoRow = ({ icon, label, value }) => (
        <View style={styles.infoRow}>
            <Icon name={icon} size={20} color="#007AFF" />
            <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={styles.infoValue}>{value || "Not set"}</Text>
            </View>
        </View>
    );

    if (!user) return <Text style={styles.loadingText}>Loading...</Text>;

    const fullName = user.first_name && user.last_name 
        ? `${user.first_name} ${user.last_name}` 
        : "Not set";
    
    const birthdate = user.birthdate 
        ? new Date(user.birthdate).toLocaleDateString() 
        : "Not set";
    
    const gender = user.gender 
        ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) 
        : "Not set";

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Profile Information</Text>
            
            <View style={styles.profileContainer}>
                {user.profile_pic ? (
                    <Image source={{ uri: user.profile_pic }} style={styles.profileImage} />
                ) : (
                    <View style={styles.profilePlaceholder}>
                        <Icon name="person" size={50} color="#666" />
                    </View>
                )}

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Personal Information</Text>
                    <InfoRow icon="person" label="Name" value={fullName} />
                    <InfoRow icon="email" label="Email" value={user.email} />
                    <InfoRow icon="cake" label="Birthdate" value={birthdate} />
                    <InfoRow icon="wc" label="Gender" value={gender} />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account Information</Text>
                    <InfoRow icon="security" label="Role" value={user.role} />
                </View>

                <TouchableOpacity 
                    style={[styles.button, styles.editButton]}
                    onPress={() => navigation.navigate("EditProfile")}
                >
                    <Icon name="edit" size={20} color="#fff" />
                    <Text style={styles.buttonText}>Edit Profile</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[styles.button, styles.logoutButton]}
                    onPress={handleLogout}
                >
                    <Icon name="logout" size={20} color="#fff" />
                    <Text style={styles.buttonText}>Logout</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9fa",
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#1c1c1e",
        textAlign: "center",
        marginVertical: 20,
    },
    profileContainer: {
        backgroundColor: "#fff",
        borderRadius: 15,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        alignSelf: "center",
        marginBottom: 20,
    },
    profilePlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: "#e9ecef",
        alignSelf: "center",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
    },
    section: {
        marginBottom: 25,
        borderBottomWidth: 1,
        borderBottomColor: "#e9ecef",
        paddingBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#495057",
        marginBottom: 15,
        paddingLeft: 5,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 15,
        paddingHorizontal: 5,
    },
    infoTextContainer: {
        marginLeft: 15,
        flex: 1,
    },
    infoLabel: {
        fontSize: 14,
        color: "#6c757d",
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 16,
        color: "#1c1c1e",
        fontWeight: "500",
    },
    button: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 15,
        borderRadius: 10,
        marginVertical: 8,
    },
    editButton: {
        backgroundColor: "#007AFF",
    },
    logoutButton: {
        backgroundColor: "#dc3545",
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
        marginLeft: 10,
    },
    loadingText: {
        textAlign: "center",
        fontSize: 16,
        color: "#6c757d",
        marginTop: 50,
    },
});

export default ProfileScreen;