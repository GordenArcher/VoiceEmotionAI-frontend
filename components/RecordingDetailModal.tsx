import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, getEmotionColor, UniversalColors } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { apiService, Recording } from '@/services/api';
import { formatDate } from '@/utils/formatDate';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
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
    const { colorScheme } = useTheme();
    const slideAnim = React.useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const backdropAnim = React.useRef(new Animated.Value(0)).current;
    
    const colors = Colors[colorScheme ?? 'light'];

    const [detailedRecording, setDetailedRecording] = useState<Recording | null>(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (visible && recording) {
            loadRecordingDetails(recording.id);
        } else {
            setDetailedRecording(null);
            setError(null);
        }
    }, [visible, recording]);

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
    }, [visible, slideAnim, backdropAnim]);

    const loadRecordingDetails = async (recordingId: number) => {
        try {
            setIsLoadingDetails(true);
            setError(null);
            const recordingDetails = await apiService.getRecording(recordingId);
            setDetailedRecording(recordingDetails);
        } catch (error: any) {
            console.error('Failed to load recording details:', error);
            setError('Failed to load recording details');
            Alert.alert('Error', 'Failed to load recording details');
        } finally {
            setIsLoadingDetails(false);
        }
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

    const handleRetry = () => {
        if (recording) {
            loadRecordingDetails(recording.id);
        }
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

    // Use detailed recording data if available, otherwise fall back to the basic recording prop
    const displayRecording = detailedRecording || recording;

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
                        backgroundColor: colors.background,
                        transform: [{ translateY: slideAnim }],
                    }
                ]}
            >
                <View style={styles.dragHandleContainer}>
                    <View style={[styles.dragHandle, { backgroundColor: colors.tabIconDefault + '40' }]} />
                </View>

                {isLoadingDetails ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.tint} />
                        <Text style={[styles.loadingText, { color: colors.text }]}>
                            Loading recording details...
                        </Text>
                    </View>
                ) : error ? (
                    <View style={styles.errorContainer}>
                        <IconSymbol name="exclamationmark.triangle" size={48} color={UniversalColors.error} />
                        <Text style={[styles.errorText, { color: colors.text }]}>
                            {error}
                        </Text>
                        <TouchableOpacity
                            style={[styles.retryButton, { backgroundColor: colors.tint }]}
                            onPress={handleRetry}
                        >
                            <Text style={styles.retryButtonText}>Try Again</Text>
                        </TouchableOpacity>
                    </View>
                ) : displayRecording && (
                    <View style={styles.content}>
                        <View style={styles.header}>
                            <View style={styles.titleRow}>
                                <View style={[styles.emojiContainer, { backgroundColor: getEmotionColor(displayRecording.latest_emotion?.emotion, 0.2) }]}>
                                    <Text style={styles.emoji}>
                                        {getEmotionEmoji(displayRecording.latest_emotion?.emotion)}
                                    </Text>
                                </View>
                                <View style={styles.titleContent}>
                                    <Text style={[styles.emotionText, { color: colors.text }]}>
                                        {displayRecording.latest_emotion?.emotion?.toUpperCase() || 'UNKNOWN'}
                                    </Text>
                                    <Text style={[styles.dateText, { color: colors.tabIconDefault }]}>
                                        {formatDate(displayRecording.uploaded_at)}
                                    </Text>
                                </View>
                            </View>
                        
                            {displayRecording.latest_emotion && (
                                <View style={[styles.confidenceBadge, { backgroundColor: getEmotionColor(displayRecording.latest_emotion.emotion, 0.2) }]}>
                                    <Text style={[styles.confidenceText, { color: getEmotionColor(displayRecording.latest_emotion.emotion) }]}>
                                        {displayRecording.latest_emotion.confidence.toFixed(1)}% confidence
                                    </Text>
                                </View>
                            )}
                        </View>

                        {displayRecording.latest_emotion && displayRecording.latest_emotion.probabilities && (
                            <View style={styles.probabilitiesSection}>
                                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                    Emotion Probabilities
                                </Text>
                                <View style={styles.probabilitiesGrid}>
                                    {Object.entries(displayRecording.latest_emotion.probabilities)
                                        .sort(([, a], [, b]) => b - a)
                                        .slice(0, 6)
                                        .map(([emotion, probability]) => (
                                            <View key={emotion} style={styles.probabilityItem}>
                                                <View style={styles.probabilityHeader}>
                                                    <Text style={[styles.probabilityEmotion, { color: colors.text }]}>
                                                        {emotion}
                                                    </Text>
                                                    <Text style={[styles.probabilityValue, { color: getEmotionColor(emotion) }]}>
                                                        {probability.toFixed(1)}%
                                                    </Text>
                                                </View>
                                                <View style={[styles.probabilityBarContainer, { backgroundColor: colors.tabIconDefault + '20' }]}>
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

                        {displayRecording.emotion_analyses && displayRecording.emotion_analyses.length > 0 && (
                            <View style={styles.analysesSection}>
                                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                    Analysis History
                                </Text>
                                <View style={styles.analysesList}>
                                    {displayRecording.emotion_analyses
                                        .sort((a, b) => new Date(b.analyzed_at).getTime() - new Date(a.analyzed_at).getTime())
                                        .map((analysis, index) => (
                                            <View key={index} style={[styles.analysisItem, { backgroundColor: colors.card }]}>
                                                <View style={styles.analysisHeader}>
                                                    <View style={styles.analysisEmotion}>
                                                        <Text style={[styles.analysisEmoji, { fontSize: 16 }]}>
                                                            {getEmotionEmoji(analysis.emotion)}
                                                        </Text>
                                                        <Text style={[styles.analysisEmotionText, { color: colors.text }]}>
                                                            {analysis.emotion.toUpperCase()}
                                                        </Text>
                                                    </View>
                                                    <Text style={[styles.analysisConfidence, { color: getEmotionColor(analysis.emotion) }]}>
                                                        {analysis.confidence.toFixed(1)}%
                                                    </Text>
                                                </View>
                                                <Text style={[styles.analysisDate, { color: colors.tabIconDefault }]}>
                                                    {new Date(analysis.analyzed_at).toLocaleDateString()} • {new Date(analysis.analyzed_at).toLocaleTimeString()}
                                                </Text>
                                            </View>
                                        ))}
                                </View>
                            </View>
                        )}

                        {displayRecording.ai_responses && displayRecording.ai_responses.length > 0 && (
                            <View style={styles.aiSection}>
                                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                    AI Insights
                                </Text>
                                {displayRecording.ai_responses.map((response, index) => (
                                    <View key={index} style={[styles.aiResponse, { backgroundColor: colors.card }]}>
                                        <Text style={[styles.aiText, { color: colors.text }]}>
                                            {response.response || response}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        <View style={styles.actionsSection}>
                            <TouchableOpacity
                                style={[styles.actionButton, styles.reanalyzeButton, { backgroundColor: colors.tint }]}
                                onPress={handleReanalyze}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator size="small" color={UniversalColors.white} />
                                ) : (
                                    <>
                                        <IconSymbol name="arrow.clockwise" size={20} color={UniversalColors.white} />
                                        <Text style={styles.actionButtonText}>Reanalyze</Text>
                                    </>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.actionButton, styles.deleteButton, { backgroundColor: UniversalColors.error }]}
                                onPress={handleDelete}
                            >
                                <IconSymbol name="trash" size={20} color={UniversalColors.white} />
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
        shadowColor: UniversalColors.black,
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
    errorContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    errorText: {
        marginTop: 16,
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
    },
    retryButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    retryButtonText: {
        color: UniversalColors.white,
        fontSize: 16,
        fontWeight: '600',
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
    analysesSection: {
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
    analysesList: {
        gap: 8,
    },
    probabilityItem: {
        gap: 6,
    },
    analysisItem: {
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    probabilityHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    analysisHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    analysisEmotion: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    analysisEmoji: {
        // Size controlled by inline style
    },
    analysisEmotionText: {
        fontSize: 14,
        fontWeight: '600',
    },
    analysisConfidence: {
        fontSize: 14,
        fontWeight: '600',
    },
    analysisDate: {
        fontSize: 12,
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
        color: UniversalColors.white,
        fontSize: 16,
        fontWeight: '600',
    },
});