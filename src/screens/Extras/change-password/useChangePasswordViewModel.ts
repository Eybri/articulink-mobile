import { useState, useContext } from 'react';
import { useNavigation } from '@react-navigation/native';
import { AuthContext, AuthContextType } from '../../../context/AuthContext';
import { Alert } from 'react-native';
import axios from 'axios';
import baseURL from '../../../utils/baseurl';
import { getToken } from '../../../utils/authToken';

export const useChangePasswordViewModel = () => {
    const navigation = useNavigation();
    const { user } = useContext(AuthContext) as AuthContextType;
    
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert("Error", "New passwords do not match");
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert("Error", "Password must be at least 6 characters long");
            return;
        }

        setLoading(true);
        try {
            const token = await getToken();
            const response = await axios.put(`${baseURL}/auth/change-password`, {
                current_password: currentPassword,
                new_password: newPassword
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            Alert.alert("Success", "Password changed successfully", [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || "Failed to change password";
            Alert.alert("Error", errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return {
        currentPassword,
        setCurrentPassword,
        newPassword,
        setNewPassword,
        confirmPassword,
        setConfirmPassword,
        loading,
        showCurrent,
        setShowCurrent,
        showNew,
        setShowNew,
        showConfirm,
        setShowConfirm,
        handleChangePassword,
        handleBack: () => navigation.goBack()
    };
};
