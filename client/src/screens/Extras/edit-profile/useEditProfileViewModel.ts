import { useState, useEffect, useContext, useRef, useMemo } from "react";
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

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [birthdate, setBirthdate] = useState<Date | null>(null);
    const [gender, setGender] = useState("");
    const [profilePic, setProfilePic] = useState<string | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const { width, height } = useWindowDimensions();

    useEffect(() => {
        if (user) {
            setFirstName(user.first_name || "");
            setLastName(user.last_name || "");
            setGender(user.gender || "");
            setProfilePic(user.profile_pic || null);
            if (user.birthdate) setBirthdate(new Date(user.birthdate));
        }
    }, [user]);

    const handleUpdateProfile = async () => {
        try {
            setLoading(true);
            const updateData: any = {
                first_name: firstName.trim(),
                last_name: lastName.trim(),
                gender,
                birthdate: birthdate ? birthdate.toISOString().split("T")[0] : null,
            };
            Object.keys(updateData).forEach((k) => { if (!updateData[k]) delete updateData[k]; });
            if (Object.keys(updateData).length === 0) {
                Alert.alert("No Changes", "Please make at least one change.");
                setLoading(false);
                return;
            }
            const token = await getToken();
            const response = await axios.put(`${baseURL}/auth/profile`, updateData, {
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            });
            const updatedUser: UserType = {
                ...user,
                first_name: response.data.first_name,
                last_name: response.data.last_name,
                gender: response.data.gender,
                birthdate: response.data.birthdate,
                profile_pic: response.data.profile_pic,
            } as UserType;
            await storeUser(updatedUser);
            if (setUser) setUser(updatedUser);
            Alert.alert("Success", response.data.message || "Profile updated successfully!");
            navigation.goBack();
        } catch (error: any) {
            Alert.alert("Error", error.response?.data?.detail || "Failed to update profile.");
        } finally {
            setLoading(false);
        }
    };

    const handlePickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            Alert.alert("Permission Denied", "Camera roll permissions required.");
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });
        if (!result.canceled && result.assets[0]) await handleUploadImage(result.assets[0].uri);
    };

    const handleUploadImage = async (imageUri: string) => {
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
    };

    const handleDeleteProfilePic = async () => {
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
    };

    return {
        firstName, setFirstName,
        lastName, setLastName,
        birthdate, setBirthdate,
        gender, setGender,
        profilePic,
        loading,
        uploading,
        showDatePicker, setShowDatePicker,
        width, height,
        handleUpdateProfile,
        handlePickImage,
        handleDeleteProfilePic,
        user
    };
};
