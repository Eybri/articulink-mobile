import React, { useState, useContext, useCallback } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  ScrollView, 
  Image, 
  ActivityIndicator,
  RefreshControl 
} from "react-native";
import { AuthContext } from "../../context/AuthContext";
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getToken, clearAuth } from "../../utils/authToken";

const ProfileScreen = ({ navigation }) => {
  const { logout, user: authUser, fetchUserProfile } = useContext(AuthContext);
  const [user, setUser] = useState(authUser);
  const [loading, setLoading] = useState(!authUser);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadProfile = async () => {
    try {
      setError(null);
      
      if (authUser) {
        setUser(authUser);
        return;
      }
      
      const token = await getToken();
      if (!token) throw new Error("Please log in");
      
      const userData = await fetchUserProfile();
      setUser(userData);
    } catch (error) {
      handleProfileError(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleProfileError = (error) => {
    console.log("Profile error:", error.message);
    
    if (error.message.includes("Session expired") || 
        error.response?.status === 401) {
      setError("Session expired");
      Alert.alert(
        "Session Expired",
        "Please log in again",
        [{ text: "OK", onPress: () => {
          clearAuth();
          navigation.navigate("Login");
        }}]
      );
    } else if (error.message.includes("deactivated")) {
      setError("Account deactivated");
    } else {
      setError("Failed to load profile");
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [authUser])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadProfile();
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure?", [
      { text: "Cancel" },
      { 
        text: "Logout", 
        onPress: async () => {
          await logout();
          navigation.navigate("Login");
        }
      }
    ]);
  };

  const InfoRow = ({ icon, label, value }) => (
    <View style={styles.infoRow}>
      <Icon name={icon} size={20} color="#007AFF" />
      <View style={styles.infoText}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || "Not set"}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error && !user) {
    return (
      <View style={styles.centered}>
        <Icon name="error" size={50} color="#FF3B30" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.button} onPress={loadProfile}>
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.centered}>
        <Text>No profile data</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Login")}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.title}>Profile</Text>
      
      <View style={styles.profileCard}>
        {/* Profile Image */}
        <View style={styles.imageContainer}>
          {user.profile_pic ? (
            <Image source={{ uri: user.profile_pic }} style={styles.image} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Icon name="person" size={40} color="#666" />
            </View>
          )}
          <View style={[styles.statusBadge, { backgroundColor: user.status === "active" ? "#4CD964" : "#FF3B30" }]}>
            <Text style={styles.statusText}>{user.status === "active" ? "Active" : "Inactive"}</Text>
          </View>
        </View>

        {/* Personal Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <InfoRow icon="person" label="Name" 
            value={user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : "Not set"} />
          <InfoRow icon="email" label="Email" value={user.email} />
          <InfoRow icon="cake" label="Birthdate" 
            value={user.birthdate ? new Date(user.birthdate).toLocaleDateString() : "Not set"} />
          <InfoRow icon="wc" label="Gender" 
            value={user.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : "Not set"} />
        </View>

        {/* Account Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          <InfoRow icon="security" label="Role" value={user.role || "User"} />
        </View>

        {/* Action Buttons */}
        <TouchableOpacity 
          style={[styles.actionButton, styles.editButton]}
          onPress={() => navigation.navigate("EditProfile", { user })}
        >
          <Icon name="edit" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.logoutButton]}
          onPress={handleLogout}
        >
          <Icon name="logout" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "#FF3B30",
    marginVertical: 20,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
    color: "#1c1c1e",
  },
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 20,
    position: "relative",
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#007AFF",
  },
  imagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#e9ecef",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#007AFF",
  },
  statusBadge: {
    position: "absolute",
    bottom: 0,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 50,
    alignItems: "center",
  },
  statusText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  section: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
    paddingBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#495057",
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  infoText: {
    marginLeft: 10,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: "#6c757d",
  },
  infoValue: {
    fontSize: 14,
    color: "#1c1c1e",
    fontWeight: "500",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    marginVertical: 5,
  },
  editButton: {
    backgroundColor: "#007AFF",
  },
  logoutButton: {
    backgroundColor: "#FF3B30",
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 8,
  },
});

export default ProfileScreen;