import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, UniversalColors, getEmotionColor } from '@/constants/theme';
import { useThemeContext } from '@/contexts/ThemeContext';
import { AnalysisResponse, apiService } from '@/services/api';
import { Audio } from 'expo-av';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function HomeScreen() {
  const { colorScheme } = useThemeContext();
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  const slideAnim = useState(new Animated.Value(SCREEN_HEIGHT))[0];
  const pulseAnim = useState(new Animated.Value(1))[0];

  const colors = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    requestPermissions();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, []);

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording]);

  useEffect(() => {
    if (result) {
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } else {
      slideAnim.setValue(SCREEN_HEIGHT);
    }
  }, [result]);

  const requestPermissions = async () => {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please grant microphone permission');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(recording);
      setIsRecording(true);
      setResult(null);
      setRecordingUri(null);
      setRecordingDuration(0);

      const interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      setTimerInterval(interval);
    } catch (err) {
      Alert.alert('Error', 'Failed to start recording');
      console.error(err);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    setIsRecording(false);
    
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }

    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setRecording(null);

    if (uri) {
      setRecordingUri(uri);
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });
    }
  };

  const playRecording = async () => {
    if (!recordingUri) return;

    try {
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: recordingUri },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );
      setSound(newSound);
      setIsPlaying(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to play recording');
      console.error(error);
    }
  };

  const stopPlayback = async () => {
    if (sound) {
      await sound.stopAsync();
      setIsPlaying(false);
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.didJustFinish) {
      setIsPlaying(false);
    }
  };

  const analyzeRecording = async () => {
    if (!recordingUri) return;

    setIsAnalyzing(true);
    try {
      if (sound) {
        await sound.stopAsync();
        setIsPlaying(false);
      }

      const response = await apiService.uploadAndAnalyze(recordingUri);
      setResult(response);
    } catch (error) {
      Alert.alert('Error', 'Failed to analyze recording');
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetRecording = async () => {
    if (sound) {
      await sound.unloadAsync();
      setSound(null);
    }
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    setRecordingUri(null);
    setResult(null);
    setIsPlaying(false);
    setRecordingDuration(0);
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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Voice Emotion
        </Text>
        <Text style={[styles.title, { color: colors.tint }]}>
          Recognition
        </Text>
        <Text style={[styles.subtitle, { color: colors.tabIconDefault }]}>
          Record your voice to discover emotional insights
        </Text>
      </View>

      <View style={styles.recordingContainer}>
        {isAnalyzing ? (
          <View style={styles.analyzingContainer}>
            <View style={[styles.analyzingCircle, { borderColor: colors.tint }]}>
              <ActivityIndicator size="large" color={colors.tint} />
            </View>
            <Text style={[styles.analyzingText, { color: colors.text }]}>
              Analyzing emotions...
            </Text>
            <Text style={[styles.analyzingSubtext, { color: colors.tabIconDefault }]}>
              This may take a few moments
            </Text>
          </View>
        ) : recordingUri && !result ? (
          <View style={styles.previewContainer}>
            <View style={[styles.previewHeader, { backgroundColor: colors.tint + '15' }]}>
              <IconSymbol name="checkmark.circle.fill" size={24} color={colors.tint} />
              <Text style={[styles.previewTitle, { color: colors.text }]}>
                Recording Complete!
              </Text>
            </View>
            
            <Text style={[styles.previewSubtitle, { color: colors.tabIconDefault }]}>
              Duration: {formatTime(recordingDuration)}
            </Text>

            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <TouchableOpacity
                style={[
                  styles.playButton,
                  {
                    backgroundColor: isPlaying 
                      ? UniversalColors.warning
                      : colors.tint,
                  },
                ]}
                onPress={isPlaying ? stopPlayback : playRecording}
                activeOpacity={0.8}
              >
                <IconSymbol
                  name={isPlaying ? 'pause.circle.fill' : 'play.circle.fill'}
                  size={70}
                  color={UniversalColors.white}
                />
                <View style={[styles.playButtonGlow, { 
                  backgroundColor: isPlaying ? UniversalColors.warning : colors.tint 
                }]} />
              </TouchableOpacity>
            </Animated.View>

            <View style={styles.previewActions}>
              <TouchableOpacity
                style={[styles.previewActionButton, { backgroundColor: colors.tabIconDefault + '20' }]}
                onPress={resetRecording}
              >
                <IconSymbol name="x.circle" size={20} color={colors.tabIconDefault} />
                <Text style={[styles.previewActionText, { color: colors.tabIconDefault }]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.analyzeButton, { backgroundColor: colors.tint }]}
                onPress={analyzeRecording}
              >
                <IconSymbol name="sparkles" size={20} color={UniversalColors.white} />
                <Text style={styles.analyzeButtonText}>Analyze Emotion</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : !result ? (
          <View style={styles.micContainer}>
            {isRecording && (
              <View style={styles.timerContainer}>
                <Text style={[styles.timerText, { color: colors.text }]}>
                  {formatTime(recordingDuration)}
                </Text>
                <View style={[styles.recordingIndicator, { backgroundColor: UniversalColors.error }]}>
                  <Text style={styles.recordingIndicatorText}>● RECORDING</Text>
                </View>
              </View>
            )}
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <TouchableOpacity
                style={[
                  styles.recordButton,
                  {
                    backgroundColor: isRecording
                      ? UniversalColors.error
                      : colors.tint,
                  },
                ]}
                onPress={isRecording ? stopRecording : startRecording}
                activeOpacity={0.8}
              >
                <IconSymbol
                  name={isRecording ? 'stop.circle.fill' : 'mic.fill'}
                  size={60}
                  color={UniversalColors.white}
                />
                <View style={[styles.recordButtonGlow, { 
                  backgroundColor: isRecording ? UniversalColors.error : colors.tint 
                }]} />
              </TouchableOpacity>
            </Animated.View>
          </View>
        ) : null}
      </View>

      <Text style={[styles.instruction, { color: colors.tabIconDefault }]}>
        {isRecording
          ? 'Tap to stop recording'
          : recordingUri && !result
          ? 'Preview your recording before analysis'
          : result
          ? 'Analysis complete!'
          : 'Tap the microphone to start recording'}
      </Text>

      {result && (
        <Animated.View
          style={[
            styles.resultCard,
            {
              backgroundColor: colors.background,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.dragHandleContainer}>
            <View style={[styles.dragHandle, { backgroundColor: colors.tabIconDefault + '40' }]} />
          </View>

          <View style={styles.resultContent}>
            <View style={styles.emotionHeader}>
              <View style={[
                styles.emojiCircle, 
                { 
                  backgroundColor: getEmotionColor(result.analysis.emotion, 0.2),
                  borderColor: getEmotionColor(result.analysis.emotion, 0.4),
                }
              ]}>
                <Text style={styles.emoji}>{getEmotionEmoji(result.analysis.emotion)}</Text>
              </View>
              <View style={styles.emotionTextContainer}>
                <Text style={[styles.emotionText, { color: colors.text }]}>
                  {result.analysis.emotion.toUpperCase()}
                </Text>
                <Text style={[styles.confidenceText, { color: getEmotionColor(result.analysis.emotion) }]}>
                  {result.analysis.confidence.toFixed(1)}% confidence
                </Text>
              </View>
            </View>

            <View style={styles.probabilitiesContainer}>
              <View style={styles.sectionHeader}>
                <IconSymbol name="chart.bar.fill" size={20} color={colors.tint} />
                <Text style={[styles.probabilitiesTitle, { color: colors.text }]}>
                  Emotion Breakdown
                </Text>
              </View>
              <View style={styles.probabilitiesGrid}>
                {Object.entries(result.analysis.probabilities)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 6)
                  .map(([emotion, prob]) => (
                    <View key={emotion} style={styles.probabilityItem}>
                      <View style={styles.probabilityHeader}>
                        <View style={styles.probabilityLabelContainer}>
                          <Text style={[styles.probabilityEmoji, { fontSize: 18 }]}>
                            {getEmotionEmoji(emotion)}
                          </Text>
                          <Text style={[styles.probabilityLabel, { color: colors.text }]}>
                            {emotion}
                          </Text>
                        </View>
                        <Text style={[styles.probabilityValue, { color: getEmotionColor(emotion) }]}>
                          {prob.toFixed(1)}%
                        </Text>
                      </View>
                      <View style={[styles.probabilityBarContainer, { backgroundColor: colors.tabIconDefault + '20' }]}>
                        <View
                          style={[
                            styles.probabilityBar,
                            {
                              width: `${prob}%`,
                              backgroundColor: getEmotionColor(emotion),
                            },
                          ]}
                        />
                      </View>
                    </View>
                  ))}
              </View>
            </View>

            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={[styles.recordAgainButton, { backgroundColor: colors.card }]}
                onPress={resetRecording}
              >
                <IconSymbol name="arrow.clockwise" size={20} color={colors.tint} />
                <Text style={[styles.recordAgainText, { color: colors.tint }]}>
                  Record Again
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: colors.tint }]}
                onPress={resetRecording}
              >
                <IconSymbol name="checkmark.circle.fill" size={20} color={UniversalColors.white} />
                <Text style={styles.saveButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  recordingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 400,
  },
  micContainer: {
    alignItems: 'center',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  timerText: {
    fontSize: 42,
    fontWeight: '800',
    marginBottom: 8,
  },
  recordingIndicator: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  recordingIndicatorText: {
    color: UniversalColors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  recordButton: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 12,
    shadowColor: UniversalColors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  recordButtonGlow: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    opacity: 0.3,
    zIndex: -1,
  },
  instruction: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 150,
    fontWeight: '500',
  },
  analyzingContainer: {
    alignItems: 'center',
  },
  analyzingCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderStyle: 'dashed',
    marginBottom: 20,
  },
  analyzingText: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  analyzingSubtext: {
    fontSize: 14,
  },
  previewContainer: {
    alignItems: 'center',
    width: '100%',
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
    gap: 8,
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  previewSubtitle: {
    fontSize: 16,
    marginBottom: 40,
    fontWeight: '500',
  },
  playButton: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 12,
    shadowColor: UniversalColors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    marginBottom: 40,
  },
  playButtonGlow: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    opacity: 0.3,
    zIndex: -1,
  },
  previewActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  previewActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    gap: 8,
  },
  previewActionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  analyzeButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    gap: 8,
    elevation: 6,
    shadowColor: UniversalColors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  analyzeButtonText: {
    color: UniversalColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  // Result Card Styles
  resultCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingBottom: 40,
    elevation: 24,
    shadowColor: UniversalColors.black,
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    maxHeight: '85%',
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  resultContent: {
    padding: 24,
  },
  emotionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  emojiCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
    borderWidth: 3,
  },
  emoji: {
    fontSize: 36,
  },
  emotionTextContainer: {
    flex: 1,
  },
  emotionText: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  confidenceText: {
    fontSize: 16,
    fontWeight: '600',
  },
  probabilitiesContainer: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  probabilitiesTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  probabilitiesGrid: {
    gap: 16,
  },
  probabilityItem: {
    gap: 8,
  },
  probabilityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  probabilityLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  probabilityLabel: {
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  probabilityEmoji: {
    // Size controlled by inline style
  },
  probabilityValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  probabilityBarContainer: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  probabilityBar: {
    height: '100%',
    borderRadius: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    gap: 8,
    elevation: 6,
  },
  saveButtonText: {
    color: UniversalColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  recordAgainButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    gap: 8,
    elevation: 2,
  },
  recordAgainText: {
    fontSize: 16,
    fontWeight: '600',
  },
});