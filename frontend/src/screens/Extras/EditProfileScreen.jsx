import React, { useState, useEffect, useContext } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    Image,
    ActivityIndicator,
    Platform
} from "react-native";
import axios from "axios";
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import baseURL from "../../utils/baseurl";
import { getToken, storeUser } from "../../utils/authToken";
import { AuthContext } from "../../context/AuthContext";

const EditProfileScreen = ({ navigation }) => {
    const { user, setUser } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    
    // Form fields
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [birthdate, setBirthdate] = useState(null);
    const [gender, setGender] = useState("");
    const [profilePic, setProfilePic] = useState(null);
    
    // Date picker
    const [showDatePicker, setShowDatePicker] = useState(false);

    useEffect(() => {
        if (user) {
            setFirstName(user.first_name || "");
            setLastName(user.last_name || "");
            setGender(user.gender || "");
            setProfilePic(user.profile_pic || null);
            
            if (user.birthdate) {
                setBirthdate(new Date(user.birthdate));
            }
        }
    }, [user]);

    const handleUpdateProfile = async () => {
        try {
            setLoading(true);
            
            // Prepare update data
            const updateData = {
                first_name: firstName.trim(),
                last_name: lastName.trim(),
                gender: gender,
                birthdate: birthdate ? birthdate.toISOString().split('T')[0] : null
            };

            // Remove empty fields
            Object.keys(updateData).forEach(key => {
                if (!updateData[key]) delete updateData[key];
            });

            if (Object.keys(updateData).length === 0) {
                Alert.alert("No Changes", "Please make at least one change to update your profile.");
                setLoading(false);
                return;
            }

            const token = await getToken();
            const response = await axios.put(
                `${baseURL}/auth/profile`,
                updateData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log("Profile updated:", response.data);

            // Update stored user data
            const updatedUser = {
                ...user,
                first_name: response.data.first_name,
                last_name: response.data.last_name,
                gender: response.data.gender,
                birthdate: response.data.birthdate,
                profile_pic: response.data.profile_pic
            };
            
            await storeUser(updatedUser);
            
            // Update context if setUser is available
            if (setUser) {
                setUser(updatedUser);
            }

            Alert.alert("Success", response.data.message || "Profile updated successfully!");
            navigation.goBack();

        } catch (error) {
            console.error("Error updating profile:", error.response?.data || error.message);
            Alert.alert(
                "Error",
                error.response?.data?.detail || "Failed to update profile. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const handlePickImage = async () => {
        try {
            // Request permission
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'We need camera roll permissions to upload a profile picture.');
                return;
            }

            // Pick image
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                await handleUploadImage(result.assets[0].uri);
            }
        } catch (error) {
            console.error("Error picking image:", error);
            Alert.alert("Error", "Failed to pick image. Please try again.");
        }
    };

const handleUploadImage = async (imageUri) => {
    try {
        setUploading(true);

        // Create FormData
        const formData = new FormData();
        
        // Get file info
        const filename = imageUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        console.log('Image URI:', imageUri);
        console.log('Filename:', filename);
        console.log('Type:', type);

        // Append file to FormData
        formData.append('file', {
            uri: Platform.OS === 'ios' ? imageUri.replace('file://', '') : imageUri,
            name: filename || `profile_${Date.now()}.jpg`,
            type: type,
        });

        const token = await getToken();
        
        if (!token) {
            throw new Error('No authentication token found');
        }

        console.log('Sending upload request...');

        const response = await axios.post(
            `${baseURL}/auth/profile/picture`,
            formData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
                timeout: 30000, // 30 second timeout
            }
        );

        console.log("Upload successful:", response.data);

        // Update local state
        setProfilePic(response.data.profile_pic);
        
        const updatedUser = {
            ...user,
            profile_pic: response.data.profile_pic
        };
        
        await storeUser(updatedUser);
        
        if (setUser) {
            setUser(updatedUser);
        }

        Alert.alert("Success", "Profile picture updated successfully!");

    } catch (error) {
        console.error("Upload Error Details:");
        console.error("- Message:", error.message);
        console.error("- Response:", error.response?.data);
        console.error("- Status:", error.response?.status);
        console.error("- Headers:", error.response?.headers);
        
        let errorMessage = "Failed to upload image. Please try again.";
        
        if (error.response?.data?.detail) {
            errorMessage = error.response.data.detail;
        } else if (error.message === 'Network Error') {
            errorMessage = "Network error. Please check your connection.";
        } else if (error.code === 'ECONNABORTED') {
            errorMessage = "Upload timeout. Please try again.";
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        Alert.alert("Upload Failed", errorMessage);
    } finally {
        setUploading(false);
    }
};
    const handleDeleteProfilePic = async () => {
        Alert.alert(
            "Delete Profile Picture",
            "Are you sure you want to delete your profile picture?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            setUploading(true);
                            const token = await getToken();
                            
                            await axios.delete(`${baseURL}/auth/profile/picture`, {
                                headers: {
                                    Authorization: `Bearer ${token}`
                                }
                            });

                            setProfilePic(null);
                            
                            const updatedUser = {
                                ...user,
                                profile_pic: null
                            };
                            
                            await storeUser(updatedUser);
                            
                            if (setUser) {
                                setUser(updatedUser);
                            }

                            Alert.alert("Success", "Profile picture deleted successfully!");
                        } catch (error) {
                            console.error("Error deleting profile picture:", error);
                            Alert.alert("Error", "Failed to delete profile picture.");
                        } finally {
                            setUploading(false);
                        }
                    }
                }
            ]
        );
    };

    const onDateChange = (event, selectedDate) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setBirthdate(selectedDate);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Edit Profile</Text>

            {/* Profile Picture Section */}
            <View style={styles.profilePicSection}>
                {uploading ? (
                    <View style={styles.profilePicLoading}>
                        <ActivityIndicator size="large" color="#007AFF" />
                    </View>
                ) : profilePic ? (
                    <Image source={{ uri: profilePic }} style={styles.profilePic} />
                ) : (
                    <View style={styles.profilePicPlaceholder}>
                        <Icon name="person" size={50} color="#666" />
                    </View>
                )}

                <View style={styles.profilePicButtons}>
                    <TouchableOpacity
                        style={styles.imageButton}
                        onPress={handlePickImage}
                        disabled={uploading}
                    >
                        <Icon name="photo-camera" size={20} color="#fff" />
                        <Text style={styles.imageButtonText}>
                            {profilePic ? "Change" : "Upload"}
                        </Text>
                    </TouchableOpacity>

                    {profilePic && (
                        <TouchableOpacity
                            style={[styles.imageButton, styles.deleteButton]}
                            onPress={handleDeleteProfilePic}
                            disabled={uploading}
                        >
                            <Icon name="delete" size={20} color="#fff" />
                            <Text style={styles.imageButtonText}>Delete</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Form Section */}
            <View style={styles.formSection}>
                {/* First Name */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>First Name</Text>
                    <TextInput
                        style={styles.input}
                        value={firstName}
                        onChangeText={setFirstName}
                        placeholder="Enter your first name"
                        placeholderTextColor="#999"
                    />
                </View>

                {/* Last Name */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Last Name</Text>
                    <TextInput
                        style={styles.input}
                        value={lastName}
                        onChangeText={setLastName}
                        placeholder="Enter your last name"
                        placeholderTextColor="#999"
                    />
                </View>

                {/* Birthdate */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Birthdate</Text>
                    <TouchableOpacity
                        style={styles.dateButton}
                        onPress={() => setShowDatePicker(true)}
                    >
                        <Text style={styles.dateButtonText}>
                            {birthdate ? birthdate.toLocaleDateString() : "Select birthdate"}
                        </Text>
                        <Icon name="calendar-today" size={20} color="#007AFF" />
                    </TouchableOpacity>
                </View>

                {showDatePicker && (
                    <DateTimePicker
                        value={birthdate || new Date()}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={onDateChange}
                        maximumDate={new Date()}
                    />
                )}

                {/* Gender */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Gender</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={gender}
                            onValueChange={(value) => setGender(value)}
                            style={styles.picker}
                        >
                            <Picker.Item label="Select gender" value="" />
                            <Picker.Item label="Male" value="male" />
                            <Picker.Item label="Female" value="female" />
                            <Picker.Item label="Other" value="other" />
                            <Picker.Item label="Prefer not to say" value="prefer_not_to_say" />
                        </Picker>
                    </View>
                </View>

                {/* Action Buttons */}
                <TouchableOpacity
                    style={[styles.button, styles.saveButton]}
                    onPress={handleUpdateProfile}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Icon name="save" size={20} color="#fff" />
                            <Text style={styles.buttonText}>Save Changes</Text>
                        </>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={() => navigation.goBack()}
                    disabled={loading}
                >
                    <Icon name="cancel" size={20} color="#666" />
                    <Text style={[styles.buttonText, { color: "#666" }]}>Cancel</Text>
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
    profilePicSection: {
        alignItems: "center",
        marginBottom: 30,
    },
    profilePic: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 15,
    },
    profilePicPlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: "#e9ecef",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 15,
    },
    profilePicLoading: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: "#e9ecef",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 15,
    },
    profilePicButtons: {
        flexDirection: "row",
        gap: 10,
    },
    imageButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#007AFF",
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 5,
    },
    deleteButton: {
        backgroundColor: "#dc3545",
    },
    imageButtonText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
    },
    formSection: {
        backgroundColor: "#fff",
        borderRadius: 15,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: "600",
        color: "#495057",
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ced4da",
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: "#1c1c1e",
        backgroundColor: "#fff",
    },
    dateButton: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#ced4da",
        borderRadius: 8,
        padding: 12,
        backgroundColor: "#fff",
    },
    dateButtonText: {
        fontSize: 16,
        color: "#1c1c1e",
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: "#ced4da",
        borderRadius: 8,
        overflow: "hidden",
        backgroundColor: "#fff",
    },
    picker: {
        height: 50,
    },
    button: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 15,
        borderRadius: 10,
        marginVertical: 8,
    },
    saveButton: {
        backgroundColor: "#007AFF",
    },
    cancelButton: {
        backgroundColor: "#e9ecef",
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
        marginLeft: 10,
    },
});

export default EditProfileScreen;