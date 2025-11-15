import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { apiService, Recording } from '@/services/api';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function HistoryScreen() {
  const colorScheme = useColorScheme();
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [recordingsData, statsData] = await Promise.all([
        apiService.getRecordings(),
        apiService.getStatistics(),
      ]);
      setRecordings(recordingsData);
      setStatistics(statsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const getEmotionColor = (emotion: string): string => {
    const colors: Record<string, string> = {
      happy: '#fbbf24',
      sad: '#6366f1',
      angry: '#ef4444',
      neutral: '#94a3b8',
      calm: '#60a5fa',
      fearful: '#8b5cf6',
      disgust: '#10b981',
      surprised: '#f59e0b',
    };
    return colors[emotion.toLowerCase()] || '#94a3b8';
  };

  const getEmotionEmoji = (emotion: string): string => {
    const emojis: Record<string, string> = {
      happy: '😊',
      sad: '😢',
      angry: '😠',
      neutral: '😐',
      calm: '😌',
      fearful: '😨',
      disgust: '🤢',
      surprised: '😲',
    };
    return emojis[emotion.toLowerCase()] || '😐';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const renderStatCard = (label: string, value: string | number, icon: string) => (
    <View style={[styles.statCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
      <IconSymbol name={icon} size={32} color={Colors[colorScheme ?? 'light'].tint} />
      <Text style={[styles.statValue, { color: Colors[colorScheme ?? 'light'].text }]}>
        {value}
      </Text>
      <Text style={[styles.statLabel, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
        {label}
      </Text>
    </View>
  );

  const renderRecording = ({ item }: { item: Recording }) => (
    <TouchableOpacity
      style={[styles.recordingCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}
      activeOpacity={0.7}
    >
      <View style={styles.recordingLeft}>
        <View style={[styles.emojiCircle, { backgroundColor: getEmotionColor(item.latest_emotion?.emotion || 'neutral') + '20' }]}>
          <Text style={styles.recordingEmoji}>
            {getEmotionEmoji(item.latest_emotion?.emotion || 'neutral')}
          </Text>
        </View>
        
        <View style={styles.recordingInfo}>
          <Text style={[styles.recordingEmotion, { color: Colors[colorScheme ?? 'light'].text }]}>
            {item.latest_emotion?.emotion?.toUpperCase() || 'UNKNOWN'}
          </Text>
          <Text style={[styles.recordingTime, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
            {formatDate(item.uploaded_at)}
          </Text>
        </View>
      </View>

      {item.latest_emotion && (
        <View style={styles.confidenceBadge}>
          <Text style={[styles.confidenceText, { color: getEmotionColor(item.latest_emotion.emotion) }]}>
            {item.latest_emotion.confidence.toFixed(0)}%
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
          Your Journey
        </Text>
        <Text style={[styles.subtitle, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
          Tracking your emotional wellness
        </Text>
      </View>

      {statistics && (
        <View style={styles.statsGrid}>
          {renderStatCard('Recordings', statistics.total_recordings, 'waveform.circle.fill')}
          {renderStatCard('Analyses', statistics.total_analyses, 'chart.bar.fill')}
          {statistics.emotion_statistics && statistics.emotion_statistics.length > 0 && (
            <View style={[styles.statCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
              <Text style={styles.topEmotionEmoji}>
                {getEmotionEmoji(statistics.emotion_statistics[0].emotion)}
              </Text>
              <Text style={[styles.statValue, { color: Colors[colorScheme ?? 'light'].text }]}>
                {statistics.emotion_statistics[0].emotion}
              </Text>
              <Text style={[styles.statLabel, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
                Top Emotion
              </Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.listHeader}>
        <Text style={[styles.listTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
          Recent Recordings
        </Text>
        <IconSymbol name="arrow.down.circle.fill" size={20} color={Colors[colorScheme ?? 'light'].tabIconDefault} />
      </View>

      <FlatList
        data={recordings}
        renderItem={renderRecording}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors[colorScheme ?? 'light'].tint}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <IconSymbol name="mic.slash.fill" size={60} color={Colors[colorScheme ?? 'light'].tabIconDefault} />
            <Text style={[styles.emptyText, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
              No recordings yet
            </Text>
            <Text style={[styles.emptySubtext, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
              Start recording to see your history!
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 40,
  },
  statsContainer: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  statsText: {
    fontSize: 14,
    marginBottom: 5,
  },
  topEmotionsContainer: {
    marginTop: 15,
  },
  topEmotionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  topEmotionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  topEmotionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  topEmotionText: {
    fontSize: 14,
    textTransform: 'capitalize',
  },
  listContainer: {
    paddingBottom: 20,
  },
  recordingCard: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  recordingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  recordingDate: {
    fontSize: 16,
    fontWeight: '600',
  },
  recordingTime: {
    fontSize: 14,
  },
  emotionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  emotionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  emotionBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  confidenceText: {
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 40,
  },    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    statCard: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginHorizontal: 4,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 8,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        textAlign: 'center',
    },
    topEmotionEmoji: {
        fontSize: 32,
    },
    listHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    listTitle: {
        fontSize: 20,
        fontWeight: '600',
    },
    subtitle: {
        fontSize: 14,
        marginBottom: 20,
    },
    recordingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    emojiCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    recordingEmoji: {
        fontSize: 24,
    },
    recordingInfo: {
        flex: 1,
    },
    recordingEmotion: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    confidenceBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        backgroundColor: '#f3f4f6',
    },
    emptySubtext: {
        fontSize: 14,
    },
        header: {
        alignItems: 'center',
        marginBottom: 30,
    },
        emptyContainer: {
        alignItems: 'center',
        paddingVertical: 60,
    },
});