import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  StatusBar,
  Platform,
  Animated,
  useWindowDimensions,
  FlatList,
} from 'react-native';
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
  original: string;
  translated: string;
  timestamp: Date;
  accuracy: number;
  duration: number;
}

const HistoryScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredHistory, setFilteredHistory] = useState<HistoryItem[]>([]);
  const { width, height } = useWindowDimensions();
  const [fadeAnim] = useState(new Animated.Value(0));

  // Mock data - replace with actual data from your storage/API if available
  const translationHistory: HistoryItem[] = [
    {
      id: '1',
      original: "Helwo, how awe you?",
      translated: "Hello, how are you?",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      accuracy: 96,
      duration: 1.2,
    },
    {
      id: '2',
      original: "I wike thith game",
      translated: "I like this game",
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      accuracy: 94,
      duration: 0.8,
    },
    {
      id: '3',
      original: "Pleath help me",
      translated: "Please help me",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      accuracy: 98,
      duration: 0.9,
    },
    {
      id: '4',
      original: "Thankth you vewy much",
      translated: "Thank you very much",
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      accuracy: 97,
      duration: 1.5,
    },
    {
      id: '5',
      original: "Whewre ith the bathwoom?",
      translated: "Where is the bathroom?",
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      accuracy: 93,
      duration: 1.1,
    },
  ];

  useEffect(() => {
    const filtered = translationHistory.filter(item =>
      item.original.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.translated.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredHistory(filtered);
  }, [searchQuery]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days === 1 ? '' : 's'} ago`;
    if (hours > 0) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    return 'Just now';
  };

  const renderItem = ({ item }: { item: HistoryItem }) => (
    <Card
      bg="white"
      br={24}
      p="$4"
      mb="$3"
      bw={1}
      bc={COLORS.sandMid}
      elevation={2}
      shadowColor="#8A96A4"
      pressStyle={{ scale: 0.98, bg: COLORS.warmWhite }}
    >
      <XStack jc="space-between" ai="flex-start" mb="$2">
        <XStack ai="center" gap="$2">
          <YStack w={32} h={32} br={10} bg={`${COLORS.teal}0C`} jc="center" ai="center">
            <Mic size={14} color={COLORS.teal} />
          </YStack>
          <SizableText size="$1" fow="800" color={COLORS.textMid} textTransform="uppercase" ls={1}>
            Saved Recording
          </SizableText>
        </XStack>
        <SizableText size="$1" fow="600" color={`${COLORS.textMid}80`}>
          {formatTimestamp(item.timestamp)}
        </SizableText>
      </XStack>

      <YStack gap="$2" mb="$3">
        <XStack gap="$2" ai="flex-start">
          <Circle size={6} mt={8} bg={COLORS.sandMid} />
          <SizableText f={1} size="$3" color={COLORS.textMid} fow="500" fontStyle="italic">
            "{item.original}"
          </SizableText>
        </XStack>
        <XStack gap="$2" ai="flex-start">
          <Circle size={6} mt={8} bg={COLORS.royalBlue} />
          <SizableText f={1} size="$4" color={COLORS.textDark} fow="700">
            {item.translated}
          </SizableText>
        </XStack>
      </YStack>

      <XStack jc="space-between" ai="center" pt="$3" borderTopWidth={1} borderTopColor={COLORS.sandLight}>
        <XStack gap="$4">
          <XStack ai="center" gap="$1.5">
            <CheckCircle size={12} color={COLORS.teal} />
            <SizableText size="$1" fow="800" color={COLORS.teal}>{item.accuracy}% Accuracy</SizableText>
          </XStack>
          <XStack ai="center" gap="$1.5">
            <Clock size={12} color={COLORS.textMid} />
            <SizableText size="$1" fow="700" color={COLORS.textMid}>{item.duration}s</SizableText>
          </XStack>
        </XStack>
        <ChevronRight size={18} color={COLORS.sandMid} />
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
      <YStack pt={Platform.OS === 'android' ? 60 : 70} px="$4" pb="$4">
        <XStack ai="center" jc="space-between" mb="$4">
          <YStack>
            <H1 size="$9" fow="900" color={COLORS.textDark} ls={-1}>Speech History</H1>
            <SizableText size="$2" color={COLORS.textMid} fow="600">Review and share your recordings</SizableText>
          </YStack>
          <Circle size={48} bg={COLORS.white} bw={1} bc={COLORS.sandMid} elevation={3}>
            <History size={22} color={COLORS.royalBlue} />
          </Circle>
        </XStack>

        <XStack bg={COLORS.white} br={20} bw={1} bc={COLORS.sandMid} px="$4" ai="center" h={54} elevation={2}>
          <Search size={18} color={COLORS.textMid} />
          <Input
            flex={1}
            bg="transparent"
            bw={0}
            size="$4"
            placeholder="Search recordings..."
            placeholderTextColor={COLORS.textMid as any}
            value={searchQuery}
            onChangeText={setSearchQuery}
            fontWeight="500"
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
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <FlatList
          data={filteredHistory}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          ListEmptyComponent={
            <YStack ai="center" jc="center" mt="$10" opacity={0.5}>
              <History size={48} color={COLORS.sandMid} mb="$4" />
              <SizableText size="$5" fow="700" color={COLORS.textMid}>No recordings found</SizableText>
              <SizableText size="$2" color={COLORS.textMid}>Try a different search term</SizableText>
            </YStack>
          }
        />
      </Animated.View>
    </YStack>
  );
};

export default HistoryScreen;