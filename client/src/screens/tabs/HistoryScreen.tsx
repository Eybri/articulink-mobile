import React, { useState, useEffect, useContext } from 'react';
import {
  StyleSheet,
  StatusBar,
  Platform,
  Animated,
  useWindowDimensions,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import {
  YStack,
  XStack,
  ZStack,
  Button,
  Circle,
  Paragraph,
  H1,
  SizableText,
  Card,
  Image,
  Input,
  Theme,
} from "tamagui";
import {
  History,
  Search,
  ChevronRight,
  Mic,
  Calendar,
  Clock,
  Trash2,
  Filter,
  CheckCircle,
} from "@tamagui/lucide-icons";

// ─── Brand Palette ───────────────────────────────────────────────
const COLORS = {
  cream: '#FAF8F4',
  warmWhite: '#F5F1EA',
  sandLight: '#EDE8DF',
  sandMid: '#DDD6C8',
  deepNavy: '#0F2847',
  royalBlue: '#1A4480',
  mediumBlue: '#2A5FA8',
  teal: '#2A8FA0',
  tealLight: '#3DAFC4',
  orbBlue: '#C8D8EE',
  orbTeal: '#BEE4EC',
  orbSand: '#E8E0D0',
  textDark: '#1C2B3A',
  textMid: '#4A5A6A',
  white: '#FFFFFF',
};

interface HistoryItem {
  id: string;
  user_id: string;
  audio_url?: string;
  transcript?: string;
  corrected_transcript?: string;
  speech_type?: string;
  duration_seconds?: number;
  language?: string;
  confidence_score?: number;
  processing_status?: string;
  created_at?: string;
}

const HistoryScreen = () => {
  const { fetchSpeechHistory, deleteSpeechHistoryItem } = useContext(AuthContext)!;
  const [searchQuery, setSearchQuery] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const { width, height } = useWindowDimensions();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(30)).current;

  const loadHistory = async (isRefreshing = false) => {
    if (isRefreshing) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await fetchSpeechHistory();
      if (Array.isArray(data)) {
        setHistory(data);
        setFilteredHistory(data);
      }
    } catch (error) {
      console.error("Load history error:", error);
    } finally {
      if (isRefreshing) setRefreshing(false);
      else setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
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
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 20,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const formatTimestamp = (dateStr?: string) => {
    if (!dateStr) return 'Just now';
    
    // Ensure the date is parsed correctly. If it lacks a timezone, assume UTC
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
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }: { item: HistoryItem }) => (
    <Card
      bg="white"
      br={20}
      p="$3.5"
      mb="$3"
      bw={1}
      bc={COLORS.sandMid}
      elevation={2}
      shadowColor={COLORS.deepNavy}
      shadowOpacity={0.06}
      pressStyle={{ scale: 0.98, bg: COLORS.warmWhite }}
    >
      <XStack jc="space-between" ai="flex-start" mb="$2">
        <XStack ai="center" gap="$2" f={1}>
          <YStack w={28} h={28} br={8} bg={`${COLORS.teal}0C`} jc="center" ai="center">
            <Mic size={12} color={COLORS.teal} />
          </YStack>
          <SizableText size="$1" fow="800" color={COLORS.textMid} textTransform="uppercase" ls={1} f={1} numberOfLines={1}>
             {item.speech_type === 'unknown' ? 'Speech Record' : (item.speech_type || 'Saved Recording')}
          </SizableText>
        </XStack>
        <XStack ai="center" gap="$2.5">
          <SizableText size="$1" fow="600" color={`${COLORS.textMid}80`}>
            {formatTimestamp(item.created_at)}
          </SizableText>
          <TouchableOpacity onPress={() => handleDelete(item)}>
            <Trash2 size={12} color="#EF4444" opacity={0.6} />
          </TouchableOpacity>
        </XStack>
      </XStack>

      <YStack gap="$1.5" mb="$2.5">
        <XStack gap="$2" ai="flex-start">
          <Circle size={4} mt={8} bg={COLORS.sandMid} />
          <SizableText f={1} size="$2" color={COLORS.textMid} fow="500" fontStyle="italic">
            "{item.transcript}"
          </SizableText>
        </XStack>
        <XStack gap="$2" ai="flex-start">
          <Circle size={4} mt={8} bg={COLORS.royalBlue} />
          <SizableText f={1} size="$3" color={COLORS.textDark} fow="700">
            {item.corrected_transcript}
          </SizableText>
        </XStack>
      </YStack>

      <XStack jc="space-between" ai="center" pt="$2.5" borderTopWidth={1} borderTopColor={COLORS.sandLight} mt="$1">
        <XStack gap="$4">
          <XStack ai="center" gap="$1.5">
            <CheckCircle size={10} color={COLORS.teal} />
            <SizableText size="$1" fow="800" color={COLORS.teal}>{Math.round((item.confidence_score || 0.95) * 100)}% Match</SizableText>
          </XStack>
          <XStack ai="center" gap="$1.5">
            <Clock size={10} color={COLORS.textMid} />
            <SizableText size="$1" fow="700" color={COLORS.textMid}>{item.duration_seconds?.toFixed(1) || '0.0'}s</SizableText>
          </XStack>
        </XStack>
        <ChevronRight size={16} color={COLORS.sandMid} />
      </XStack>
    </Card>
  );

  return (
    <YStack f={1} bg={COLORS.cream}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Background blobs */}
      <ZStack pos="absolute" fullscreen pointerEvents="none">
        <Circle pos="absolute" t={-height * 0.15} r={-width * 0.2} size={width * 0.8} bg={COLORS.orbBlue} opacity={0.3} />
        <Circle pos="absolute" b={-height * 0.1} l={-width * 0.2} size={width * 0.7} bg={COLORS.orbTeal} opacity={0.2} />
      </ZStack>

      {/* Header Area */}
      <YStack pt="$4" px="$4" pb="$4">
        <XStack ai="center" jc="space-between" mb="$4">
          <YStack>
            <H1 size="$7" fow="900" color={COLORS.textDark} ls={-1}>Speech History</H1>
            <SizableText size="$2" color={COLORS.textMid} fow="600" o={0.8}>Review your speech recordings</SizableText>
          </YStack>
          <Circle 
            size={40} 
            bg="white" 
            bw={1} 
            bc={COLORS.sandMid} 
            elevation={2} 
            shadowColor={COLORS.deepNavy}
            shadowOpacity={0.1}
          >
            <History size={18} color={COLORS.royalBlue} />
          </Circle>
        </XStack>

        <XStack 
          bg={COLORS.white} 
          br={18} 
          bw={1.5} 
          bc={isSearchFocused ? COLORS.royalBlue : COLORS.sandMid} 
          px="$4" 
          ai="center" 
          h={48} 
          elevation={isSearchFocused ? 4 : 2}
          shadowColor={COLORS.deepNavy}
          animation="quick"
        >
          <Search size={18} color={isSearchFocused ? COLORS.royalBlue : COLORS.textMid} o={isSearchFocused ? 1 : 0.6} />
          <Input
            flex={1}
            bg="transparent"
            bw={0}
            size="$4"
            placeholder="Search transcriptions..."
            placeholderTextColor={`${COLORS.textMid}80`}
            value={searchQuery}
            onChangeText={setSearchQuery}
            fontWeight="600"
            color={COLORS.textDark}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
          />
          {searchQuery.length > 0 && (
            <Button
              size="$2"
              circular
              unstyled
              onPress={() => setSearchQuery('')}
              icon={<Trash2 size={16} color={COLORS.textMid} />}
            />
          )}
        </XStack>
      </YStack>

      {/* List */}
      <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <FlatList
          data={filteredHistory}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadHistory(true)}
              tintColor={COLORS.royalBlue}
            />
          }
          ListEmptyComponent={
            <YStack ai="center" jc="center" mt="$10" opacity={0.5}>
              <History size={48} color={COLORS.sandMid} mb="$4" />
              <SizableText size="$5" fow="700" color={COLORS.textMid}>
                {loading ? 'Fetching history...' : (searchQuery ? 'No recordings found' : 'No history yet')}
              </SizableText>
              <SizableText size="$2" color={COLORS.textMid}>
                {searchQuery ? 'Try a different search term' : 'Your recordings will appear here'}
              </SizableText>
            </YStack>
          }
        />
      </Animated.View>
    </YStack>
  );
};

export default HistoryScreen;