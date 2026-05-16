import { useState, useContext, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../../../context/AuthContext";
import * as Speech from "expo-speech";
import { Alert } from "react-native";

export const useTtsSettingsViewModel = () => {
    const { user, updateProfile } = useContext(AuthContext)!;
    const navigation = useNavigation<any>();

    const [rate, setRate] = useState(user?.tts_settings?.rate || 0.9);
    const [pitch, setPitch] = useState(user?.tts_settings?.pitch || 1.0);
    const [language, setLanguage] = useState(user?.tts_settings?.language || 'fil-PH');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user?.tts_settings) {
            setRate(user.tts_settings.rate ?? 0.9);
            setPitch(user.tts_settings.pitch ?? 1.0);
            setLanguage(user.tts_settings.language ?? 'fil-PH');
        }
    }, [user?.tts_settings]);

    const languages = [
        { label: "Filipino (PH)", value: "fil-PH" },
        { label: "English (US)", value: "en-US" },
        { label: "English (UK)", value: "en-GB" },
    ];

    const handleBack = () => {
        navigation.goBack();
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await updateProfile({
                tts_settings: {
                    rate,
                    pitch,
                    language
                }
            });
            Alert.alert("Success", "TTS settings updated successfully");
            navigation.goBack();
        } catch (error) {
            console.error("Update TTS settings error:", error);
            Alert.alert("Error", "Failed to update TTS settings");
        } finally {
            setLoading(false);
        }
    };

    const testVoice = () => {
        Speech.stop();
        const text = language === 'fil-PH' 
            ? "Mabuhay! Ganito ang magiging tunog ng aking boses." 
            : "Hello! This is how my voice will sound with your current settings.";
        
        Speech.speak(text, {
            rate,
            pitch,
            language
        });
    };

    return {
        rate, setRate,
        pitch, setPitch,
        language, setLanguage,
        loading,
        languages,
        handleBack,
        handleSave,
        testVoice
    };
};
