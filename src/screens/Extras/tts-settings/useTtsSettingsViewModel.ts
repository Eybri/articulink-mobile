import { useState, useContext, useEffect, useMemo } from "react";
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
    const [selectedVoice, setSelectedVoice] = useState(user?.tts_settings?.voice || "");
    const [availableVoices, setAvailableVoices] = useState<Speech.Voice[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadVoices = async () => {
            try {
                const voices = await Speech.getAvailableVoicesAsync();
                setAvailableVoices(voices);
            } catch (e) {
                console.error("Error loading voices:", e);
            }
        };
        loadVoices();
    }, []);

    useEffect(() => {
        if (user?.tts_settings) {
            setRate(user.tts_settings.rate ?? 0.9);
            setPitch(user.tts_settings.pitch ?? 1.0);
            setLanguage(user.tts_settings.language ?? 'fil-PH');
            setSelectedVoice(user.tts_settings.voice ?? "");
        }
    }, [user?.tts_settings]);

    const languages = [
        { label: "Filipino (PH)", value: "fil-PH" },
        { label: "English (US/UK)", value: "en-combined" },
    ];

    const categorizedVoices = useMemo(() => {
        const getBaseLang = (lang: string) => {
            const base = lang.split('-')[0].toLowerCase();
            return (base === 'fil' || base === 'tl') ? 'fil-tl' : base;
        };

        const targetBase = getBaseLang(language);
        let filtered: Speech.Voice[] = [];
        if (language === 'en-combined') {
            filtered = availableVoices.filter(v => v.language.startsWith('en'));
        } else {
            filtered = availableVoices.filter(v => getBaseLang(v.language) === targetBase);
        }
        
        const male: any[] = [];
        const female: any[] = [];

        // Manual identification indices from user (1-based)
        const filipinoMaleIndices = [3, 4, 6, 7];
        const englishMaleIndices = [2, 4, 7, 8, 19, 20, 22, 26, 27, 32, 33, 37, 40];

        // Generic descriptions
        const maleDescs = ["Deep & Bold", "Clear & Professional", "Resonant", "Natural Male", "Crisp Tone", "Classic Male"];
        const femaleDescs = ["Soft & Gentle", "Clear & Bright", "Natural Female", "Smooth Tone", "Professional", "Melodic"];

        filtered.forEach((v, i) => {
            const index = i + 1;
            let isMale = false;

            if (language === 'en-combined') {
                isMale = englishMaleIndices.includes(index) || v.name.toLowerCase().includes('-rjs');
            } else if (targetBase === 'fil-tl') {
                isMale = filipinoMaleIndices.includes(index);
            }

            // FILTER REDUNDANTS: User identified 5th Filipino voice as redundant
            if (targetBase === 'fil-tl' && index === 5) return;

            const namePart = v.name.includes('-') 
                ? v.name.split('-').slice(-2, -1)[0] || v.name.split('-').pop() 
                : v.name;
            
            const friendlyName = namePart!.charAt(0).toUpperCase() + namePart!.slice(1);
            
            const item = { 
                ...v, 
                friendlyName, 
                gender: isMale ? 'male' : 'female' as const,
                description: isMale ? maleDescs[male.length % maleDescs.length] : femaleDescs[female.length % femaleDescs.length]
            };

            if (isMale) male.push(item);
            else female.push(item);
        });

        return { 
            male: male.slice(0, 6), 
            female: female.slice(0, 6) 
        };
    }, [availableVoices, language]);

    const handleBack = () => {
        navigation.goBack();
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const saveLang = language === 'en-combined' ? 'en-US' : language;
            await updateProfile({
                tts_settings: {
                    rate,
                    pitch,
                    language: saveLang,
                    voice: selectedVoice
                }
            });
            Alert.alert("Success", "Voice settings updated");
            navigation.goBack();
        } catch (error) {
            console.error("Update TTS error:", error);
            Alert.alert("Error", "Failed to save settings");
        } finally {
            setLoading(false);
        }
    };

    const testVoice = (voiceId?: string) => {
        Speech.stop();
        const text = (language === 'fil-PH') 
            ? "Mabuhay! Ganito ang tunog ng aking boses." 
            : "Hello! This is how I sound.";
        
        Speech.speak(text, {
            rate,
            pitch,
            language: language === 'en-combined' ? 'en-US' : language,
            voice: voiceId || selectedVoice || undefined
        });
    };

    return {
        rate, setRate,
        pitch, setPitch,
        language, setLanguage,
        selectedVoice, setSelectedVoice,
        categorizedVoices,
        loading,
        languages,
        handleBack,
        handleSave,
        testVoice
    };
};
