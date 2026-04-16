import { useState, useEffect, useContext, useRef, useMemo, useCallback } from "react";
import { Alert, Platform, useWindowDimensions } from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import baseURL from "./../../../utils/baseurl";
import { getToken, storeUser } from "./../../../utils/authToken";
import { AuthContext, AuthContextType, User as UserType } from "./../../../context/AuthContext";

/**
 * ViewModel for the Edit Profile Screen.
 */
export const useEditProfileViewModel = (navigation: any) => {
    const { user, setUser } = useContext(AuthContext) as AuthContextType;
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [username, setUsername] = useState("");
    const [birthdate, setBirthdate] = useState<Date | null>(null);
    const [birthdateText, setBirthdateText] = useState("");
    const [gender, setGender] = useState("");
    const [profilePic, setProfilePic] = useState<string | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showIconModal, setShowIconModal] = useState(false);
    const [showOptionModal, setShowOptionModal] = useState(false);

    const availableIcons = useMemo(() => ["ampalaya.jpg", "banana.jpg", "pineapple.jpg", "strawberry.jpg"], []);

    const { width, height } = useWindowDimensions();

    useEffect(() => {
        if (user) {
            setUsername(user.username || "");
            setGender(user.gender || "");
            setProfilePic(user.profile_pic || null);
            if (user.birthdate) {
                const date = new Date(user.birthdate);
                setBirthdate(date);
                setBirthdateText(user.birthdate); // Assuming user.birthdate is YYYY-MM-DD
            }
        }
    }, [user]);

    const handleUpdateProfile = useCallback(async () => {
        try {
            setLoading(true);
            const updateData: any = {
                username: username.trim(),
                gender,
                birthdate: (birthdate && !isNaN(birthdate.getTime())) 
                    ? birthdate.toISOString().split("T")[0] 
                    : (birthdateText || null),
                profile_pic: profilePic,
            };
            
            // FIX: Only delete if undefined or empty string, allow null for clearing profile_pic
            Object.keys(updateData).forEach((k) => { 
                if (updateData[k] === undefined || updateData[k] === "") delete updateData[k]; 
            });

            if (Object.keys(updateData).length === 0) {
                Alert.alert("No Changes", "Please make at least one change.");
                setLoading(false);
                return;
            }

            const token = await getToken();
            console.log("Saving profile with token:", token ? "Token present" : "MISSING TOKEN");
            console.log("Update Data Payload:", JSON.stringify(updateData, null, 2));

            const response = await axios.put(`${baseURL}/auth/profile`, updateData, {
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            });

            console.log("Update Response Status:", response.status);
            console.log("Update Response Data:", JSON.stringify(response.data, null, 2));

            const updatedUser: UserType = {
                ...user,
                username: response.data.username || username,
                gender: response.data.gender || gender,
                birthdate: response.data.birthdate || (birthdate ? birthdate.toISOString() : birthdateText),
                profile_pic: response.data.profile_pic !== undefined ? response.data.profile_pic : profilePic,
                status: response.data.status || user?.status || "active",
            } as UserType;

            await storeUser(updatedUser);
            if (setUser) setUser(updatedUser);

            Alert.alert("Success", response.data.message || "Profile updated successfully!");
            navigation.goBack();
        } catch (error: any) {
            console.error("Update Profile Error:", error.response?.data || error.message);
            Alert.alert("Error", error.response?.data?.detail || "Failed to update profile.");
        } finally {
            setLoading(false);
        }
    }, [username, gender, birthdateText, profilePic, user, setUser, navigation]);

    const handleUploadImage = useCallback(async (imageUri: string) => {
        try {
            setUploading(true);
            const formData = new FormData();
            const filename = imageUri.split("/").pop() || "upload.jpg";
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : "image/jpeg";
            formData.append("file", {
                uri: Platform.OS === "ios" ? imageUri.replace("file://", "") : imageUri,
                name: filename,
                type,
            } as any);
            const token = await getToken();
            const response = await axios.post(`${baseURL}/auth/profile/picture`, formData, {
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
                timeout: 30000,
            });
            setProfilePic(response.data.profile_pic);
            if (user) {
                const updatedUser: UserType = { ...user, profile_pic: response.data.profile_pic } as UserType;
                await storeUser(updatedUser);
                if (setUser) setUser(updatedUser);
            }
            Alert.alert("Success", "Profile picture updated!");
        } catch (error: any) {
            Alert.alert("Upload Failed", error.response?.data?.detail || "Failed to upload image.");
        } finally {
            setUploading(false);
        }
    }, [user, setUser]);

    const handlePickImage = useCallback(async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            Alert.alert("Permission Denied", "Camera roll permissions required.");
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7, // Slightly lower quality for better responsiveness
        });
        if (!result.canceled && result.assets[0]) await handleUploadImage(result.assets[0].uri);
    }, [handleUploadImage]);

    const handleDeleteProfilePic = useCallback(async () => {
        Alert.alert("Delete Profile Picture", "Are you sure?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete", style: "destructive",
                onPress: async () => {
                    try {
                        setUploading(true);
                        const token = await getToken();
                        await axios.delete(`${baseURL}/auth/profile/picture`, { headers: { Authorization: `Bearer ${token}` } });
                        setProfilePic(null);
                        if (user) {
                            const updatedUser: UserType = { ...user, profile_pic: undefined } as UserType;
                            await storeUser(updatedUser);
                            if (setUser) setUser(updatedUser);
                        }
                        Alert.alert("Success", "Profile picture deleted.");
                    } catch {
                        Alert.alert("Error", "Failed to delete picture.");
                    } finally {
                        setUploading(false);
                    }
                },
            },
        ]);
    }, [user, setUser]);
    
    const handleSelectIcon = useCallback((icon: string) => {
        console.log("Selected Icon:", icon);
        // Toggle logic: if already selected, remove it.
        if (profilePic === icon) {
            console.log("Deselecting icon");
            setProfilePic(null);
        } else {
            console.log("Setting profile pic to:", icon);
            setProfilePic(icon);
        }
        setShowIconModal(false);
    }, [profilePic]);

    const clearProfilePic = useCallback(() => {
        setProfilePic(null);
    }, []);

    return {
        username, setUsername,
        birthdate, setBirthdate,
        birthdateText, setBirthdateText,
        gender, setGender,
        profilePic,
        loading,
        uploading,
        showDatePicker, setShowDatePicker,
        width, height,
        handleUpdateProfile,
        handlePickImage,
        handleDeleteProfilePic,
        handleSelectIcon,
        showIconModal, setShowIconModal,
        showOptionModal, setShowOptionModal,
        availableIcons,
        clearProfilePic,
        user
    };
};
