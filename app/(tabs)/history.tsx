import { RecordingDetailModal } from '@/components/RecordingDetailModal';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, getEmotionColor, UniversalColors } from '@/constants/theme';
import { useThemeContext } from '@/contexts/ThemeContext';
import { apiService, Recording } from '@/services/api';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
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
  const { colorScheme } = useThemeContext();
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  // Get current theme colors
  const colors = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!loading) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [loading]);

  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const handleRecordingPress = async (recording: Recording) => {
    setSelectedRecording(recording);
    setDetailModalVisible(true);
  };

  const handleCloseModal = () => {
    setDetailModalVisible(false);
    setSelectedRecording(null);
  };

  const handleDeleteRecording = async (recordingId: number) => {
    try {
      await apiService.deleteRecording(recordingId);
      loadData();
      setDetailModalVisible(false);
    } catch (error) {
      console.error('Failed to delete recording:', error);
    }
  };

  const handleReanalyzeRecording = async (recordingId: number) => {
    try {
      setDetailLoading(true);
      await apiService.reanalyzeRecording(recordingId);
      await loadData();
    } catch (error) {
      console.error('Failed to reanalyze recording:', error);
    } finally {
      setDetailLoading(false);
    }
  };

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
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const renderStatCard = (label: string, value: string | number, icon: string, index: number) => (
    <Animated.View 
      style={[
        styles.statCard, 
        { 
          backgroundColor: colors.card,
          transform: [{ translateY: slideAnim }],
          opacity: fadeAnim,
        }
      ]}
    >
      <View style={[styles.statIconContainer, { backgroundColor: colors.tint + '20' }]}>
        <IconSymbol name={icon} size={24} color={colors.tint} />
      </View>
      <Text style={[styles.statValue, { color: colors.text }]}>
        {value}
      </Text>
      <Text style={[styles.statLabel, { color: colors.tabIconDefault }]}>
        {label}
      </Text>
    </Animated.View>
  );

  const renderRecording = ({ item, index }: { item: Recording; index: number }) => (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [
          {
            translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0],
            }),
          },
        ],
      }}
    >
      <TouchableOpacity
        style={[styles.recordingCard, { backgroundColor: colors.card }]}
        activeOpacity={0.8}
        onPress={() => handleRecordingPress(item)}
      >
        <View style={styles.recordingLeft}>
          <View 
            style={[
              styles.emojiCircle, 
              { 
                backgroundColor: getEmotionColor(item.latest_emotion?.emotion || 'neutral', 0.2),
                borderColor: getEmotionColor(item.latest_emotion?.emotion || 'neutral', 0.4),
              }
            ]}
          >
            <Text style={styles.recordingEmoji}>
              {getEmotionEmoji(item.latest_emotion?.emotion || 'neutral')}
            </Text>
          </View>
          
          <View style={styles.recordingInfo}>
            <Text style={[styles.recordingEmotion, { color: colors.text }]}>
              {item.latest_emotion?.emotion?.toUpperCase() || 'UNKNOWN'}
            </Text>
            <Text style={[styles.recordingTime, { color: colors.tabIconDefault }]}>
              {formatDate(item.uploaded_at)}
            </Text>
          </View>
        </View>

        {item.latest_emotion && (
          <View style={styles.confidenceSection}>
            <View style={[styles.confidenceBadge, { backgroundColor: getEmotionColor(item.latest_emotion.emotion, 0.2) }]}>
              <Text style={[styles.confidenceText, { color: getEmotionColor(item.latest_emotion.emotion) }]}>
                {item.latest_emotion.confidence.toFixed(0)}%
              </Text>
            </View>
            <IconSymbol 
              name="chevron.right" 
              size={16} 
              color={colors.tabIconDefault} 
            />
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.tint} />
        <Text style={[styles.loadingText, { color: colors.tabIconDefault }]}>
          Loading your journey...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View 
        style={[
          styles.header,
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <Text style={[styles.title, { color: colors.text }]}>
          Your Emotional Journey
        </Text>
        <Text style={[styles.subtitle, { color: colors.tabIconDefault }]}>
          Track your emotional wellness over time
        </Text>
      </Animated.View>

      {statistics && (
        <View style={styles.statsGrid}>
          {renderStatCard('Recordings', statistics.total_recordings, 'waveform.circle.fill', 0)}
          {renderStatCard('Analyses', statistics.total_analyses, 'chart.bar.fill', 1)}
          {statistics.emotion_statistics && statistics.emotion_statistics.length > 0 && (
            <Animated.View 
              style={[
                styles.statCard, 
                { 
                  backgroundColor: colors.card,
                  transform: [{ translateY: slideAnim }],
                  opacity: fadeAnim,
                }
              ]}
            >
              <View style={[styles.statIconContainer, { backgroundColor: getEmotionColor(statistics.emotion_statistics[0].emotion, 0.2) }]}>
                <Text style={[styles.topEmotionEmoji, { fontSize: 20 }]}>
                  {getEmotionEmoji(statistics.emotion_statistics[0].emotion)}
                </Text>
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {statistics.emotion_statistics[0].emotion}
              </Text>
              <Text style={[styles.statLabel, { color: colors.tabIconDefault }]}>
                Most Frequent
              </Text>
            </Animated.View>
          )}
        </View>
      )}

      <Animated.View 
        style={[
          styles.listHeader,
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <Text style={[styles.listTitle, { color: colors.text }]}>
          Recent Recordings
        </Text>
        <View style={styles.listHeaderRight}>
          <Text style={[styles.recordingsCount, { color: colors.tabIconDefault }]}>
            {recordings.length}
          </Text>
          <IconSymbol name="list.bullet" size={18} color={colors.tabIconDefault} />
        </View>
      </Animated.View>

      <FlatList
        data={recordings}
        renderItem={renderRecording}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.tint}
            colors={[colors.tint]}
          />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Animated.View 
            style={[
              styles.emptyContainer,
              { opacity: fadeAnim }
            ]}
          >
            <View style={[styles.emptyIcon, { backgroundColor: colors.card }]}>
              <IconSymbol name="waveform.path" size={48} color={colors.tabIconDefault} />
            </View>
            <Text style={[styles.emptyText, { color: colors.text }]}>
              No recordings yet
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.tabIconDefault }]}>
              Start recording to track your emotional journey
            </Text>
          </Animated.View>
        }
      />

      <RecordingDetailModal
        visible={detailModalVisible}
        recording={selectedRecording}
        loading={detailLoading}
        onClose={handleCloseModal}
        onDelete={handleDeleteRecording}
        onReanalyze={handleReanalyzeRecording}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    marginHorizontal: 6,
    elevation: 8,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    opacity: 0.8,
  },
  topEmotionEmoji: {
    fontSize: 20,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  listHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  listTitle: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  recordingsCount: {
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    paddingBottom: 30,
  },
  recordingCard: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
  },
  recordingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  emojiCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 2,
  },
  recordingEmoji: {
    fontSize: 24,
  },
  recordingInfo: {
    flex: 1,
  },
  recordingEmotion: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  recordingTime: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.7,
  },
  confidenceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  confidenceBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  confidenceText: {
    fontSize: 14,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    elevation: 4,
    shadowColor: UniversalColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 40,
  },
});