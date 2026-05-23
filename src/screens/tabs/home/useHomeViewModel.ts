import { useState, useRef, useEffect, useMemo, useContext, useCallback } from "react";
import { Alert, Animated, useWindowDimensions } from "react-native";
import { Audio } from "expo-av";
import * as Speech from "expo-speech";
import baseURL from "./../../../utils/baseurl";
import { getToken } from "./../../../utils/authToken";
import { COLORS } from "./../../../constants/colors";
import { AuthContext } from "./../../../context/AuthContext";

/**
 * ViewModel for the Home Screen.
 * Handles recording, transcription upload, and speech synthesis.
 */
export const useHomeViewModel = () => {
    const { user, fetchSpeechHistory } = useContext(AuthContext)!;
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [transcript, setTranscript] = useState<string>("");
    const [words, setWords] = useState<any[]>([]);
    const [confidence, setConfidence] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [isRealtime, setIsRealtime] = useState<boolean>(false);
    const [isStreaming, setIsStreaming] = useState<boolean>(false);
    const [rawHistory, setRawHistory] = useState<any[]>([]);
    const [manualPhrases, setManualPhrases] = useState<string[]>([]);
    
    const wsRef = useRef<WebSocket | null>(null);
    const recordingRef = useRef<Audio.Recording | null>(null);
    const isStreamingRef = useRef<boolean>(false);
    const isConnectingRef = useRef<boolean>(false);
    const lastSpeakTimeRef = useRef<number>(0);
    const isTtsSpeakingRef = useRef<boolean>(false);
    const { width, height } = useWindowDimensions();

    // Entry Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, tension: 20, friction: 8, useNativeDriver: true }),
        ]).start();
        
        // Initial history fetch
        refreshHistory();
    }, []);

    const refreshHistory = async () => {
        try {
            const history = await fetchSpeechHistory();
            if (history && Array.isArray(history)) {
                setRawHistory(history);
            }
        } catch (e) {
            console.error("Failed to fetch history:", e);
        }
    };

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

    // OPTIMIZED: Algorithmic phrase generation using useMemo
    const phraseVault = useMemo(() => {
        const currentLang = user?.tts_settings?.language || "fil-PH";
        
        // 1. Calculate frequency from raw history
        const frequencyMap: Record<string, number> = {};
        rawHistory.forEach((item: any) => {
            const text = (item.transcript || item.text || "").trim();
            // Basic language detection or just filter by length
            if (text && text.length > 2) {
                frequencyMap[text] = (frequencyMap[text] || 0) + 1;
            }
        });

        // 2. Get top frequent phrases
        const topFrequent = Object.entries(frequencyMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(entry => entry[0]);

        // 3. Merge with manual phrases and remove duplicates
        const merged = Array.from(new Set([...manualPhrases, ...topFrequent]));

        // 4. Fallback to defaults if still empty
        if (merged.length === 0) {
            return currentLang === "fil-PH" 
                ? ["Kumusta ka?", "Salamat po.", "Magandang umaga."] 
                : ["How are you?", "Thank you.", "Good morning."];
        }

        return merged.slice(0, 3); // Final top 3
    }, [rawHistory, manualPhrases, user?.tts_settings?.language]);

    const startRecording = async () => {
        if (isConnectingRef.current) return;
        if (isRealtime) { await startStreaming(); return; }
        
        isConnectingRef.current = true;
        try {
            await Audio.requestPermissionsAsync();
            await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });

            const { recording } = await Audio.Recording.createAsync({
                android: { extension: ".wav", outputFormat: Audio.AndroidOutputFormat.DEFAULT, audioEncoder: Audio.AndroidAudioEncoder.DEFAULT, sampleRate: 16000, numberOfChannels: 1, bitRate: 128000 },
                ios: { extension: ".wav", outputFormat: Audio.IOSOutputFormat.LINEARPCM, sampleRate: 16000, numberOfChannels: 1, bitRate: 128000, linearPCMBitDepth: 16, linearPCMIsBigEndian: false, linearPCMIsFloat: false },
                web: {}
            } as any);

            setRecording(recording);
            recordingRef.current = recording;
        } catch (err) {
            Alert.alert("Error", "Could not start recording");
        } finally {
            isConnectingRef.current = false;
        }
    };

    const startStreaming = async () => {
        if (isConnectingRef.current || isStreamingRef.current) return;
        isConnectingRef.current = true;
        try {
            const token = await getToken();
            if (!token) return;

            const wsUrl = baseURL.replace("http", "ws") + "/api/v1/stream-transcribe?token=" + token;
            wsRef.current = new WebSocket(wsUrl);
            wsRef.current.onopen = () => {
                isConnectingRef.current = false;
                setIsStreaming(true);
                isStreamingRef.current = true;
                startStreamingCycle();
            };
            wsRef.current.onmessage = async (e) => {
                const data = JSON.parse(e.data);
                if (data.type === "transcript" && data.text) {
                    const newText = data.text.trim();
                    setTranscript((prev) => prev + (prev ? " " : "") + newText);
                    
                    // Stop current recording cycle so we don't listen to our own TTS
                    isTtsSpeakingRef.current = true;
                    if (recordingRef.current) {
                        try {
                            await recordingRef.current.stopAndUnloadAsync();
                        } catch (err) {}
                        recordingRef.current = null;
                    }

                    Speech.stop();
                    const settings = user?.tts_settings || { language: "fil-PH", rate: 0.9, pitch: 1.0 };
                    Speech.speak(newText, {
                        ...settings,
                        onDone: () => {
                            isTtsSpeakingRef.current = false;
                            if (isStreamingRef.current) {
                                startStreamingCycle();
                            }
                        },
                        onStopped: () => {
                            isTtsSpeakingRef.current = false;
                            if (isStreamingRef.current) {
                                startStreamingCycle();
                            }
                        },
                        onError: (error) => {
                            console.error("Speech error:", error);
                            isTtsSpeakingRef.current = false;
                            if (isStreamingRef.current) {
                                startStreamingCycle();
                            }
                        }
                    });
                }
            };
            wsRef.current.onclose = () => { 
                setIsStreaming(false); 
                isStreamingRef.current = false;
                isTtsSpeakingRef.current = false;
            };
            await Audio.requestPermissionsAsync();
            await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
        } catch (err) {
            isConnectingRef.current = false;
        }
    };

    const startStreamingCycle = async () => {
        if (!isStreamingRef.current || isTtsSpeakingRef.current) return;
        try {
            let isSpeaking = false;
            let silenceTicks = 0;
            let totalTicks = 0;
            let maxMetering = -160;
            let chunkSent = false;

            const { recording } = await Audio.Recording.createAsync(
                { isMeteringEnabled: true, android: { extension: ".wav", sampleRate: 16000, numberOfChannels: 1 }, ios: { extension: ".wav", sampleRate: 16000, numberOfChannels: 1, linearPCMBitDepth: 16 } } as any,
                async (status: any) => {
                    if (chunkSent || !isStreamingRef.current || isTtsSpeakingRef.current) return;
                    totalTicks++;
                    const metering = status.metering ?? -160;
                    if (metering > maxMetering) maxMetering = metering;
                    if (metering > -45) { isSpeaking = true; silenceTicks = 0; } else if (isSpeaking) { silenceTicks++; }
                    // Trigger if:
                    // 1. User is speaking and has paused for 1.2 seconds (silenceTicks >= 12)
                    // 2. Or the chunk reaches 12 seconds maximum (totalTicks >= 120) to prevent overflow
                    if ((isSpeaking && silenceTicks >= 12) || totalTicks >= 120) {
                        chunkSent = true;
                        try {
                            await recording.stopAndUnloadAsync();
                            // Restart recording IMMEDIATELY to minimize the gap
                            if (wsRef.current?.readyState === WebSocket.OPEN && !isTtsSpeakingRef.current) {
                                startStreamingCycle();
                            }

                            // Send completed chunk asynchronously in the background
                            if (isSpeaking) {
                                const uri = recording.getURI();
                                if (uri) {
                                    const response = await fetch(uri);
                                    const blob = await response.blob();
                                    const reader = new FileReader();
                                    reader.onloadend = () => { if (wsRef.current?.readyState === WebSocket.OPEN) wsRef.current.send(reader.result as ArrayBuffer); };
                                    reader.readAsArrayBuffer(blob);
                                }
                            }
                        } catch (err) {}
                    }
                },
                100
            );
            recordingRef.current = recording;
        } catch (err) { setIsStreaming(false); }
    };

    const stopRecording = async () => {
        if (isStreaming) {
            if (recordingRef.current) await recordingRef.current.stopAndUnloadAsync();
            wsRef.current?.close();
            setIsStreaming(false);
            return;
        }
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
        const fileName = `speech.wav`;
        formData.append("file", { uri, name: fileName, type: "audio/wav" } as any);

        try {
            const token = await getToken();
            const headers: Record<string, string> = token ? { "Authorization": `Bearer ${token}` } : {};
            const response = await fetch(`${baseURL}/transcribe`, { method: "POST", body: formData, headers });
            const data = await response.json();
            if (response.ok) {
                const text = data.transcript || data.text || "";
                setTranscript(text);
                setWords(data.words || []);
                setConfidence(data.overall_confidence || 0);
                
                // OPTIMIZATION: Update local history count without re-fetching
                if (text) {
                    setRawHistory(prev => [{ transcript: text }, ...prev]);
                    // AUTOMATION: Speak right away in Phrase Mode
                    speakText(text);
                }
            }
        } catch (err) {
            console.error("Upload error:", err);
        }
    };

    const speakText = useCallback(async (textToSpeak?: any) => {
        // Fix: Ensure we only use the string if it's actually a string (not an event object)
        const content = (typeof textToSpeak === 'string' ? textToSpeak : transcript) || "";
        
        if (!content || typeof content !== 'string' || !content.trim()) {
            return;
        }
        
        isTtsSpeakingRef.current = true;
        if (recordingRef.current) {
            try {
                await recordingRef.current.stopAndUnloadAsync();
            } catch (err) {}
            recordingRef.current = null;
        }

        Speech.stop();
        const settings = user?.tts_settings || { language: "fil-PH", rate: 0.9, pitch: 1.0 };
        Speech.speak(content.trim(), {
            ...settings,
            onDone: () => {
                isTtsSpeakingRef.current = false;
                if (isStreamingRef.current) {
                    startStreamingCycle();
                }
            },
            onStopped: () => {
                isTtsSpeakingRef.current = false;
                if (isStreamingRef.current) {
                    startStreamingCycle();
                }
            },
            onError: (error) => {
                console.error("Speech error:", error);
                isTtsSpeakingRef.current = false;
                if (isStreamingRef.current) {
                    startStreamingCycle();
                }
            }
        });
    }, [transcript, user?.tts_settings]);

    const clearTranscript = () => {
        Speech.stop();
        isTtsSpeakingRef.current = false;
        setTranscript("");
        setWords([]);
        setConfidence(0);
    };

    const saveToVault = () => {
        if (!transcript.trim()) return;
        setManualPhrases(prev => {
            if (prev.includes(transcript.trim())) return prev;
            return [transcript.trim(), ...prev];
        });
        Alert.alert("Success", "Phrase pinned to vault");
    };

    const usePhrase = (phrase: string) => {
        setTranscript(phrase);
        setWords([]);
        speakText(phrase);
    };

    const deletePhrase = (phraseToDelete: string) => {
        setManualPhrases(prev => prev.filter(p => p !== phraseToDelete));
    };

    return {
        recording, transcript, setTranscript, words, setWords, confidence, loading, width, height,
        fadeAnim, slideAnim, orbs, dotGrid, isRealtime, setIsRealtime, isStreaming,
        phraseVault, saveToVault, usePhrase, deletePhrase,
        startRecording, stopRecording, speakText, clearTranscript
    };
};
