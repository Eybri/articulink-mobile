import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';

const HistoryScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [fadeAnim] = useState(new Animated.Value(0));

  // Mock data - replace with actual data from your storage/API
  const translationHistory = [
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
    // Filter history based on search query
    const filtered = translationHistory.filter(item =>
      item.original.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.translated.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredHistory(filtered);
  }, [searchQuery]);

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days === 1 ? '' : 's'} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    } else {
      return 'Just now';
    }
  };

  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 95) return '#10B981'; // Excellent - Emerald
    if (accuracy >= 90) return '#F59E0B'; // Good - Amber
    return '#EF4444'; // Needs improvement - Red
  };

  const getAccuracyLabel = (accuracy) => {
    if (accuracy >= 95) return '🎯 Excellent';
    if (accuracy >= 90) return '👍 Good';
    return '📈 Improving';
  };

  const handlePlayTranslation = (item) => {
    // Here you would implement text-to-speech functionality
    Alert.alert("Playing Translation", `"${item.translated}"`);
  };

  const handleDeleteItem = (id) => {
    Alert.alert(
      "Delete Translation",
      "Are you sure you want to delete this translation from your history?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => {
          // Handle delete logic here
          Alert.alert("Deleted", "Translation removed from history.");
        }}
      ]
    );
  };

  const renderHistoryItem = ({ item, index }) => (
    <Animated.View
      style={[
        styles.historyItem,
        {
          opacity: fadeAnim,
          transform: [{
            translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0],
            })
          }]
        }
      ]}
    >
      <LinearGradient
        colors={['#1F2937', '#374151']}
        style={styles.historyCard}
      >
        {/* Header with timestamp and accuracy */}
        <View style={styles.historyHeader}>
          <View style={styles.timestampContainer}>
            <Ionicons name="time-outline" size={14} color="#9CA3AF" />
            <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
          </View>
          <View style={styles.accuracyContainer}>
            <Text style={[styles.accuracyText, { color: getAccuracyColor(item.accuracy) }]}>
              {item.accuracy}%
            </Text>
            <Text style={styles.accuracyLabel}>{getAccuracyLabel(item.accuracy)}</Text>
          </View>
        </View>

        {/* Translation Content */}
        <View style={styles.translationContent}>
          <View style={styles.originalSection}>
            <Text style={styles.sectionLabel}>📝 Original Speech</Text>
            <Text style={styles.originalText}>"{item.original}"</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.translatedSection}>
            <Text style={styles.sectionLabel}>✨ Clear Translation</Text>
            <Text style={styles.translatedText}>"{item.translated}"</Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="timer-outline" size={16} color="#10B981" />
            <Text style={styles.statText}>{item.duration}s</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="checkmark-circle-outline" size={16} color="#10B981" />
            <Text style={styles.statText}>Processed</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.playButton}
            onPress={() => handlePlayTranslation(item)}
          >
            <LinearGradient
              colors={['#10B981', '#14B8A6']}
              style={styles.playButtonGradient}
            >
              <Ionicons name="play" size={20} color="white" />
              <Text style={styles.playButtonText}>Play</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteItem(item.id)}
          >
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <LinearGradient
        colors={['#10B981', '#14B8A6']}
        style={styles.emptyIcon}
      >
        <Ionicons name="time" size={40} color="white" />
      </LinearGradient>
      <Text style={styles.emptyTitle}>No Translation History</Text>
      <Text style={styles.emptyDescription}>
        Your translation history will appear here after you start using Articulink
      </Text>
    </View>
  );

  return (
    <LinearGradient
      colors={['#111827', '#1F2937', '#111827']}
      style={styles.container}
    >
      {/* Background Effects */}
      <View style={styles.backgroundEffects}>
        <LinearGradient
          colors={['#10B98110', 'transparent']}
          style={[styles.backgroundOrb, { top: 50, left: 20 }]}
        />
        <LinearGradient
          colors={['#14B8A610', 'transparent']}
          style={[styles.backgroundOrb, { bottom: 100, right: 20 }]}
        />
      </View>

      {/* Header Stats */}
      <View style={styles.headerStats}>
        <LinearGradient
          colors={['#1F2937', '#374151']}
          style={styles.statsCard}
        >
          <View style={styles.statColumn}>
            <Text style={styles.statNumber}>{translationHistory.length}</Text>
            <Text style={styles.statLabel}>Total Translations</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statColumn}>
            <Text style={styles.statNumber}>
              {Math.round(translationHistory.reduce((sum, item) => sum + item.accuracy, 0) / translationHistory.length)}%
            </Text>
            <Text style={styles.statLabel}>Avg Accuracy</Text>
          </View>
        </LinearGradient>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search translations..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* History List */}
      <FlatList
        data={filteredHistory}
        renderItem={renderHistoryItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={EmptyState}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundEffects: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backgroundOrb: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  headerStats: {
    padding: 20,
    paddingBottom: 10,
  },
  statsCard: {
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: '#10B98130',
  },
  statColumn: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#10B981',
  },
  statLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#374151',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#374151',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    color: 'white',
    fontSize: 16,
  },
  listContainer: {
    padding: 20,
    paddingTop: 0,
  },
  historyItem: {
    marginBottom: 16,
  },
  historyCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#10B98130',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timestamp: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  accuracyContainer: {
    alignItems: 'flex-end',
  },
  accuracyText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  accuracyLabel: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  translationContent: {
    marginBottom: 16,
  },
  originalSection: {
    marginBottom: 12,
  },
  translatedSection: {
    marginTop: 12,
  },
  sectionLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 6,
  },
  originalText: {
    fontSize: 16,
    color: '#D1D5DB',
    fontStyle: 'italic',
  },
  translatedText: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#374151',
    marginVertical: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  playButton: {
    flex: 1,
    marginRight: 12,
  },
  playButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  playButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#EF444420',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 40,
  },
});

export default HistoryScreen;