import { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { Animated, Alert, useWindowDimensions } from 'react-native';
import { Audio } from 'expo-av';
import { AuthContext } from './../../../context/AuthContext';
import { Toast } from './../../../components/ToastNotification';

export interface HistoryItem {
  id: string;
  user_id: string;
  audio_url?: string;
  transcript?: string;
  corrected_transcript?: string;
  speech_type?: string;
  duration_seconds?: number;
  language?: string;
  confidence_score?: number;
  overall_confidence?: number;
  words?: { word: string; confidence: number }[];
  processing_status?: string;
  created_at?: string;
}

/**
 * ViewModel for the History Screen.
 */
export const useHistoryViewModel = () => {
    const { fetchSpeechHistory, deleteSpeechHistoryItem, fetchSpeechAnalysis, fetchSpeechStats } = useContext(AuthContext)!;
    const [searchQuery, setSearchQuery] = useState('');
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [filteredHistory, setFilteredHistory] = useState<HistoryItem[]>([]);
    const [serverStats, setServerStats] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [playingId, setPlayingId] = useState<string | null>(null);
    const [analysisReport, setAnalysisReport] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const soundRef = useRef<Audio.Sound | null>(null);
    const { width, height } = useWindowDimensions();

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    const loadHistory = async (isRefreshing = false) => {
        if (isRefreshing) setRefreshing(true);
        else setLoading(true);

        try {
            const [historyData, statsData] = await Promise.all([
                fetchSpeechHistory(),
                fetchSpeechStats()
            ]);

            if (Array.isArray(historyData)) {
                setHistory(historyData);
                setFilteredHistory(historyData);
            }
            if (statsData) {
                setServerStats(statsData);
            }
        } catch (error) {
            console.error("Load history error:", error);
        } finally {
            if (isRefreshing) setRefreshing(false);
            else setLoading(false);
        }
    };

    const generateAIAnalysis = async () => {
        setIsAnalyzing(true);
        try {
            const result = await fetchSpeechAnalysis();
            setAnalysisReport(result.report);
            return result;
        } catch (error) {
            console.error("AI Analysis error:", error);
            Alert.alert("Analysis Error", "Failed to generate AI insights. Please try again with more records.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    useEffect(() => {
        loadHistory().then(() => {
            if (!analysisReport && !isAnalyzing) {
                generateAIAnalysis();
            }
        });
    }, []);

    useEffect(() => {
        const filtered = history.filter(item =>
            (item.transcript || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.corrected_transcript || '').toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredHistory(filtered);
    }, [searchQuery, history]);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, tension: 20, friction: 8, useNativeDriver: true }),
        ]).start();

        return () => {
            if (soundRef.current) {
                soundRef.current.unloadAsync();
            }
        };
    }, []);

    const playAudio = async (url: string, id: string) => {
        try {
            if (playingId === id) {
                if (soundRef.current) {
                    await soundRef.current.stopAsync();
                    setPlayingId(null);
                }
                return;
            }

            if (soundRef.current) {
                await soundRef.current.unloadAsync();
            }

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
                playsInSilentModeIOS: true,
                staysActiveInBackground: false,
                shouldDuckAndroid: true,
            });

            setPlayingId(id);
            const { sound } = await Audio.Sound.createAsync(
                { uri: url },
                { shouldPlay: true }
            );
            soundRef.current = sound;

            sound.setOnPlaybackStatusUpdate((status) => {
                if (status.isLoaded && status.didJustFinish) {
                    setPlayingId(null);
                }
            });
        } catch (error) {
            console.error("Error playing audio:", error);
            Alert.alert("Error", "Could not play audio recording");
            setPlayingId(null);
        }
    };

    const formatTimestamp = (dateStr?: string) => {
        if (!dateStr) return 'Just now';
        
        let dateInput = dateStr;
        if (dateStr.length === 19 && !dateStr.includes('Z') && !dateStr.includes('+')) {
            dateInput = `${dateStr}Z`;
        }
        
        const timestamp = new Date(dateInput);
        const now = new Date();
        const diff = now.getTime() - timestamp.getTime();
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (seconds < 60) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        
        return timestamp.toLocaleDateString(undefined, { 
            month: 'short', 
            day: 'numeric' 
        });
    };

    const handleDelete = (item: HistoryItem) => {
        Alert.alert(
            "Delete Recording",
            "Are you sure you want to delete this recording?",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Delete", 
                    style: "destructive",
                    onPress: async () => {
                        const success = await deleteSpeechHistoryItem(item.id);
                        if (success) {
                            setHistory(prev => prev.filter(h => h.id !== item.id));
                            Toast.show({ message: "Recording deleted", type: "success" });
                        }
                    }
                }
            ]
        );
    };

    const stats = {
        totalRecordings: serverStats?.total_recordings || history.length,
        avgConfidence: serverStats?.avg_confidence || (history.length > 0 
            ? (history.reduce((acc, curr) => acc + (curr.overall_confidence || (curr.confidence_score ? curr.confidence_score * 100 : 95)), 0) / history.length) 
            : 0),
        totalDuration: serverStats?.total_duration_seconds || history.reduce((acc, curr) => acc + (curr.duration_seconds || 0), 0),
        totalWords: serverStats?.total_words || history.reduce((acc, curr) => acc + (curr.corrected_transcript?.split(' ').length || 0), 0)
    };

    return {
        searchQuery, setSearchQuery,
        filteredHistory,
        loading,
        refreshing,
        isSearchFocused, setIsSearchFocused,
        width, height,
        loadHistory,
        handleDelete,
        formatTimestamp,
        playAudio,
        playingId,
        stats,
        analysisReport,
        isAnalyzing,
        generateAIAnalysis,
        setAnalysisReport,
        animations: {
            fadeAnim,
            slideAnim
        }
    };
};
