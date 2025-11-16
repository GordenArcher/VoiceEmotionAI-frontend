
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Recording } from '@/services/api';
import React, { useEffect } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface RecordingDetailModalProps {
    visible: boolean;
    recording: Recording | null;
    loading: boolean;
    onClose: () => void;
    onDelete: (recordingId: number) => void;
    onReanalyze: (recordingId: number) => void;
}

export function RecordingDetailModal({
    visible,
    recording,
    loading,
    onClose,
    onDelete,
    onReanalyze,
}: RecordingDetailModalProps) {
    const colorScheme = useColorScheme();
    const slideAnim = React.useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const backdropAnim = React.useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(backdropAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
                }),
                Animated.spring(slideAnim, {
                toValue: 0,
                tension: 60,
                friction: 10,
                useNativeDriver: true,
                }),
        ]).start();
        } else {
        Animated.parallel([
            Animated.timing(backdropAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
            toValue: SCREEN_HEIGHT,
            duration: 250,
            useNativeDriver: true,
            }),
        ]).start();
        }
    }, [visible]);

    const getEmotionColor = (emotion: string): string => {
        const colors: Record<string, string> = {
            happy: '#f59e0b',
            sad: '#6366f1',
            angry: '#ef4444',
            neutral: '#6b7280',
            calm: '#3b82f6',
            fearful: '#8b5cf6',
            disgust: '#10b981',
            surprised: '#f97316',
        };
        return colors[emotion?.toLowerCase()] || '#6b7280';
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
        return emojis[emotion?.toLowerCase()] || '😐';
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleBackdropPress = () => {
        onClose();
    };

    const handleDelete = () => {
        if (recording) {
            onDelete(recording.id);
        }
    };

    const handleReanalyze = () => {
        if (recording) {
            onReanalyze(recording.id);
        }
    };

    if (!recording && !loading) return null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            statusBarTranslucent
        >
            <Animated.View 
                style={[
                    styles.backdrop,
                    {
                        opacity: backdropAnim,
                    }
                ]}
            >
                <TouchableOpacity 
                    style={styles.backdropTouchable}
                    activeOpacity={1}
                    onPress={handleBackdropPress}
                />
            </Animated.View>

            <Animated.View 
                style={[
                    styles.bottomSheet,
                    {
                        backgroundColor: Colors[colorScheme ?? 'light'].background,
                        transform: [{ translateY: slideAnim }],
                    }
                ]}
            >
                <View style={styles.dragHandleContainer}>
                    <View style={[styles.dragHandle, { backgroundColor: Colors[colorScheme ?? 'light'].tabIconDefault + '40' }]} />
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
                        <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].text }]}>
                            Loading recording...
                        </Text>
                    </View>
                ) : recording && (
                    <View style={styles.content}>
                        <View style={styles.header}>
                            <View style={styles.titleRow}>
                                <View style={[styles.emojiContainer, { backgroundColor: getEmotionColor(recording.latest_emotion?.emotion) + '20' }]}>
                                    <Text style={styles.emoji}>
                                        {getEmotionEmoji(recording.latest_emotion?.emotion)}
                                    </Text>

                                </View>
                                <View style={styles.titleContent}>
                                    <Text style={[styles.emotionText, { color: Colors[colorScheme ?? 'light'].text }]}>
                                        {recording.latest_emotion?.emotion?.toUpperCase() || 'UNKNOWN'}
                                    </Text>

                                    <Text style={[styles.dateText, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
                                        {formatDate(recording.uploaded_at)}
                                    </Text>
                                </View>
                            </View>
                        
                            {recording.latest_emotion && (
                                <View style={[styles.confidenceBadge, { backgroundColor: getEmotionColor(recording.latest_emotion.emotion) + '20' }]}>
                                    <Text style={[styles.confidenceText, { color: getEmotionColor(recording.latest_emotion.emotion) }]}>
                                        {recording.latest_emotion.confidence.toFixed(1)}% confidence
                                    </Text>
                                </View>
                            )}
                        </View>

                        {recording.latest_emotion && recording.latest_emotion.probabilities && (
                            <View style={styles.probabilitiesSection}>
                                <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                                    Emotion Probabilities
                                </Text>
                                <View style={styles.probabilitiesGrid}>
                                {Object.entries(recording.latest_emotion.probabilities)
                                    .sort(([, a], [, b]) => b - a)
                                    .slice(0, 6)
                                    .map(([emotion, probability]) => (
                                        <View key={emotion} style={styles.probabilityItem}>
                                            <View style={styles.probabilityHeader}>
                                                <Text style={[styles.probabilityEmotion, { color: Colors[colorScheme ?? 'light'].text }]}>
                                                    {emotion}
                                                </Text>

                                                <Text style={[styles.probabilityValue, { color: getEmotionColor(emotion) }]}>
                                                    {probability.toFixed(1)}%
                                                </Text>
                                            </View>

                                            <View style={[styles.probabilityBarContainer, { backgroundColor: Colors[colorScheme ?? 'light'].tabIconDefault + '20' }]}>
                                                <View
                                                    style={[
                                                    styles.probabilityBar,
                                                    {
                                                        width: `${probability}%`,
                                                        backgroundColor: getEmotionColor(emotion),
                                                    },
                                                    ]}
                                                />
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}

                        {recording.ai_responses && recording.ai_responses.length > 0 && (
                            <View style={styles.aiSection}>
                                <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                                    AI Insights
                                </Text>
                                {recording.ai_responses.map((response, index) => (
                                    <View key={index} style={[styles.aiResponse, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
                                        <Text style={[styles.aiText, { color: Colors[colorScheme ?? 'light'].text }]}>
                                            {response}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        <View style={styles.actionsSection}>
                            <TouchableOpacity
                                style={[styles.actionButton, styles.reanalyzeButton, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}
                                onPress={handleReanalyze}
                            >
                                <IconSymbol name="arrow.clockwise" size={20} color="#ffffff" />
                                <Text style={styles.actionButtonText}>Reanalyze</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.actionButton, styles.deleteButton, { backgroundColor: '#ef4444' }]}
                                onPress={handleDelete}
                            >
                                <IconSymbol name="trash" size={20} color="#ffffff" />
                                <Text style={styles.actionButtonText}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </Animated.View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    backdropTouchable: {
        flex: 1,
    },
    bottomSheet: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: SCREEN_HEIGHT * 0.85,
        elevation: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
    },
    dragHandleContainer: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    dragHandle: {
        width: 40,
        height: 4,
        borderRadius: 2,
    },
    loadingContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        fontWeight: '500',
    },
    content: {
        padding: 24,
        paddingBottom: 34,
    },
    header: {
        marginBottom: 24,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    emojiContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    emoji: {
        fontSize: 28,
    },
    titleContent: {
        flex: 1,
    },
    emotionText: {
        fontSize: 24,
        fontWeight: '800',
        marginBottom: 4,
    },
    dateText: {
        fontSize: 14,
        fontWeight: '500',
    },
    confidenceBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    confidenceText: {
        fontSize: 14,
        fontWeight: '600',
    },
    probabilitiesSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 16,
    },
    probabilitiesGrid: {
        gap: 12,
    },
    probabilityItem: {
        gap: 6,
    },
    probabilityHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    probabilityEmotion: {
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    probabilityValue: {
        fontSize: 14,
        fontWeight: '600',
    },
    probabilityBarContainer: {
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
    },
    probabilityBar: {
        height: '100%',
        borderRadius: 3,
    },
    aiSection: {
        marginBottom: 24,
    },
    aiResponse: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
    },
    aiText: {
        fontSize: 14,
        lineHeight: 20,
    },
    actionsSection: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 16,
        gap: 8,
    },
    reanalyzeButton: {
        // Uses the tint color from props
    },
    deleteButton: {
        // Uses the red color from props
    },
    actionButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
});