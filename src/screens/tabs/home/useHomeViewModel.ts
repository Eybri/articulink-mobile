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
    const [isRealtime, setIsRealtime] = useState<boolean>(false);
    const [isStreaming, setIsStreaming] = useState<boolean>(false);
    const wsRef = useRef<WebSocket | null>(null);
    const realtimeTimerRef = useRef<NodeJS.Timeout | null>(null);
    const recordingRef = useRef<Audio.Recording | null>(null);
    const isStreamingRef = useRef<boolean>(false);
    const isConnectingRef = useRef<boolean>(false);
    const lastSpeakTimeRef = useRef<number>(0);
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
        if (isConnectingRef.current) return;
        
        if (isRealtime) {
            await startStreaming();
            return;
        }
        
        isConnectingRef.current = true;
        try {
            await Audio.requestPermissionsAsync();
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

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
            if (!token) {
                Alert.alert("Error", "Authentication required");
                return;
            }

            // 1. Setup WebSocket - Ensure prefix /api/v1 is included
            const wsUrl = baseURL.replace("http", "ws") + "/api/v1/stream-transcribe?token=" + token;
            wsRef.current = new WebSocket(wsUrl);

            wsRef.current.onopen = () => {
                console.log("WebSocket Connected");
                isConnectingRef.current = false;
                setIsStreaming(true);
                isStreamingRef.current = true;
                startStreamingCycle();
            };

            wsRef.current.onmessage = (e) => {
                const data = JSON.parse(e.data);
                if (data.type === "transcript" && data.text) {
                    const newText = data.text.trim();
                    setTranscript((prev) => prev + (prev ? " " : "") + newText);
                    
                    // Estimate TTS duration (approx 150 words per min + 2s buffer)
                    const wordCount = newText.split(' ').length;
                    const estimatedDurationMs = (wordCount / 150) * 60 * 1000 + 2000;
                    
                    // Automatic Speech for Simultaneous Mode
                    Speech.stop();
                    lastSpeakTimeRef.current = Date.now() + estimatedDurationMs;
                    
                    Speech.speak(newText, { 
                        language: "fil-PH", 
                        rate: 0.95, 
                        pitch: 1.0 
                    });
                }
            };

            wsRef.current.onerror = (e) => {
                console.error("WS Error", e);
                isConnectingRef.current = false;
            };
            wsRef.current.onclose = () => {
                isConnectingRef.current = false;
                setIsStreaming(false);
                isStreamingRef.current = false;
            };

            await Audio.requestPermissionsAsync();
            await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
            
            setTranscript("");
            setWords([]);
        } catch (err) {
            isConnectingRef.current = false;
            Alert.alert("Error", "Could not start streaming");
        }
    };

    const startStreamingCycle = async () => {
        if (!isStreamingRef.current) return;

        try {
            let isSpeaking = false;
            let silenceTicks = 0;
            let totalTicks = 0;
            let maxMetering = -160;
            
            const TICK_MS = 100; // Update interval in ms
            const SILENCE_TICKS_THRESHOLD = 8; // 800ms of silence
            const MAX_TICKS = 80; // 8 seconds maximum cutoff
            
            let chunkSent = false;

            // Start a recording segment with metering enabled
            const { recording } = await Audio.Recording.createAsync(
                {
                    isMeteringEnabled: true,
                    android: { extension: ".wav", sampleRate: 16000, numberOfChannels: 1, bitRate: 128000 },
                    ios: { extension: ".wav", sampleRate: 16000, numberOfChannels: 1, bitRate: 128000, linearPCMBitDepth: 16 },
                } as any,
                async (status: any) => {
                    // Stop processing if we already sent this chunk or stopped streaming
                    if (chunkSent || !isStreamingRef.current) return;
                    
                    totalTicks++;
                    const metering = status.metering !== undefined ? status.metering : -160;
                    
                    if (metering > maxMetering) {
                        maxMetering = metering;
                    }

                    // Voice Activity Detection Logic
                    if (metering > -45) { // Speaking threshold
                        isSpeaking = true;
                        silenceTicks = 0;
                    } else if (isSpeaking) {
                        silenceTicks++;
                    }

                    const shouldCutForSilence = isSpeaking && silenceTicks >= SILENCE_TICKS_THRESHOLD;
                    const shouldCutForMaxTime = totalTicks >= MAX_TICKS;

                    if (shouldCutForSilence || shouldCutForMaxTime) {
                        chunkSent = true;
                        
                        try {
                            await recording.stopAndUnloadAsync();
                            const uri = recording.getURI();
                            const overlapWithTTS = Date.now() < lastSpeakTimeRef.current;
                            
                            // Only send if they actually spoke and it's not echoing the AI voice
                            if (uri && maxMetering > -45 && !overlapWithTTS) {
                                const response = await fetch(uri);
                                const blob = await response.blob();
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                    if (wsRef.current?.readyState === WebSocket.OPEN) {
                                        wsRef.current.send(reader.result as ArrayBuffer);
                                    }
                                };
                                reader.readAsArrayBuffer(blob);
                            } else {
                                if (overlapWithTTS) console.log("Chunk overlaps with TTS, skipping echo.");
                                else console.log("Silence detected, skipping chunk.");
                            }
                        } catch (err) {
                            console.error("Chunk processing failed:", err);
                        }
                        
                        // Immediately trigger the next recording cycle
                        if (wsRef.current?.readyState === WebSocket.OPEN) {
                            startStreamingCycle();
                        }
                    }
                },
                TICK_MS
            );
            
            recordingRef.current = recording;

        } catch (err) {
            console.error("Streaming cycle failed:", err);
            setIsStreaming(false);
        }
    };

    const stopRecording = async () => {
        if (isStreaming) {
            if (realtimeTimerRef.current) clearTimeout(realtimeTimerRef.current);
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
        recordingRef.current = null;
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
        fadeAnim, slideAnim, orbs, dotGrid, isRealtime, setIsRealtime, isStreaming,
        startRecording, stopRecording, speakText, clearTranscript
    };
};
