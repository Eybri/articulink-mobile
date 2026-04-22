import { useState, useRef, useEffect, useMemo } from "react";
import { Alert, Animated, useWindowDimensions } from "react-native";
import { Audio } from "expo-av";
import * as Speech from "expo-speech";
import baseURL from "./../../../utils/baseurl";
import { getToken } from "./../../../utils/authToken";
import { COLORS } from "./../../../constants/colors";

/**
 * ViewModel for the Home Screen.
 * Handles recording, transcription upload, and speech synthesis.
 */
export const useHomeViewModel = () => {
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [transcript, setTranscript] = useState<string>("");
    const [words, setWords] = useState<any[]>([]);
    const [confidence, setConfidence] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const { width, height } = useWindowDimensions();

    // Entry Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, tension: 20, friction: 8, useNativeDriver: true }),
        ]).start();
    }, []);

    const orbs = useMemo(() => ([
        { color: COLORS.orbSand, size: width * 0.7, x: width * 0.85, y: height * 0.08, duration: 6000, delay: 0 },
        { color: COLORS.orbBlue, size: width * 0.55, x: width * 0.1, y: height * 0.5, duration: 7200, delay: 900 },
        { color: COLORS.orbTeal, size: width * 0.4, x: width * 0.6, y: height * 0.85, duration: 5500, delay: 500 },
    ]), [width, height]);

    const dotGrid = useMemo(() => {
        const items: { left: number; top: number }[] = [];
        for (let row = 0; row < 9; row++)
            for (let col = 0; col < 6; col++)
                items.push({
                    left: (width / 6) * col + (width / 12),
                    top: (height / 9) * row + (height / 18),
                });
        return items;
    }, [width, height]);

    const startRecording = async () => {
        try {
            await Audio.requestPermissionsAsync();
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            // Standardize on WAV (Linear PCM) to ensure backend compatibility without FFmpeg
            const { recording } = await Audio.Recording.createAsync({
                android: {
                    extension: ".wav",
                    outputFormat: Audio.AndroidOutputFormat.DEFAULT,
                    audioEncoder: Audio.AndroidAudioEncoder.DEFAULT,
                    sampleRate: 16000,
                    numberOfChannels: 1,
                    bitRate: 128000,
                },
                ios: {
                    extension: ".wav",
                    outputFormat: Audio.IOSOutputFormat.LINEARPCM,
                    sampleRate: 16000,
                    numberOfChannels: 1,
                    bitRate: 128000,
                    linearPCMBitDepth: 16,
                    linearPCMIsBigEndian: false,
                    linearPCMIsFloat: false,
                },
                web: {}
            } as any);

            setRecording(recording);
        } catch (err) {
            Alert.alert("Error", "Could not start recording");
        }
    };

    const stopRecording = async () => {
        if (!recording) return;
        setLoading(true);
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        setRecording(null);
        if (uri) await uploadAudio(uri);
        setLoading(false);
    };

    const uploadAudio = async (uri: string) => {
        const formData = new FormData();
        const uriParts = uri.split(".");
        const uriExtension = uriParts[uriParts.length - 1].toLowerCase();
        const extension = ["wav", "m4a", "caf", "3gp", "mp4"].includes(uriExtension) ? uriExtension : "wav";
        const fileName = `speech.${extension}`;

        let type = "audio/wav";
        if (extension === "m4a") type = "audio/x-m4a";
        else if (extension === "3gp") type = "audio/3gpp";
        else if (extension === "caf") type = "audio/x-caf";
        else if (extension === "mp4") type = "audio/mp4";
        else if (extension === "webm") type = "audio/webm";
        else if (extension === "mp3") type = "audio/mpeg";

        formData.append("file", { uri, name: fileName, type } as any);

        try {
            const token = await getToken();
            const headers: Record<string, string> = {};
            if (token) headers["Authorization"] = `Bearer ${token}`;

            const response = await fetch(`${baseURL}/transcribe`, {
                method: "POST",
                body: formData,
                headers,
            });
            const data = await response.json();
            if (!response.ok) {
                Alert.alert("Transcription Error", data.detail || data.error || "Server failed to process audio");
                setTranscript("");
                return;
            }
            setTranscript(data.transcript || data.text || "");
            setWords(data.words || []);
            setConfidence(data.overall_confidence || 0);
        } catch (err) {
            Alert.alert("Network Error", "Could not connect to the transcription server.");
        }
    };

    const speakText = () => {
        if (!transcript.trim()) {
            Alert.alert("Nothing to speak");
            return;
        }
        Speech.stop();
        Speech.speak(transcript, { language: "fil-PH", rate: 0.9, pitch: 1.0 });
    };

    const clearTranscript = () => {
        Speech.stop();
        setTranscript("");
        setWords([]);
        setConfidence(0);
    };

    return {
        recording, transcript, setTranscript, words, setWords, confidence, loading, width, height,
        fadeAnim, slideAnim, orbs, dotGrid,
        startRecording, stopRecording, speakText, clearTranscript
    };
};
