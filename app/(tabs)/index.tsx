// ==================== UPDATED HOME SCREEN WITH PLAYBACK ====================
// app/(tabs)/index.tsx

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AnalysisResponse, apiService } from '@/services/api';
import { Audio } from 'expo-av';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  const slideAnim = useState(new Animated.Value(1000))[0]; // Start off-screen

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
    if (result) {
      // Animate result sliding up from bottom
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
    } else {
      slideAnim.setValue(1000);
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
      // Unload previous sound if exists
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

      // Start timer
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
    
    // Clear timer
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

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
        Voice Emotion Recognition
      </Text>
      <Text style={[styles.subtitle, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
        Record your voice to analyze emotions
      </Text>

      <View style={styles.recordingContainer}>
        {isAnalyzing ? (
          <View style={styles.analyzingContainer}>
            <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
            <Text style={[styles.analyzingText, { color: Colors[colorScheme ?? 'light'].text }]}>
              Analyzing emotion...
            </Text>
          </View>
        ) : recordingUri && !result ? (
          <View style={styles.previewContainer}>
            <Text style={[styles.previewTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Recording Ready!
            </Text>
            <Text style={[styles.previewSubtitle, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
              Duration: {formatTime(recordingDuration)}
            </Text>

            <TouchableOpacity
              style={[
                styles.playButton,
                {
                  backgroundColor: isPlaying 
                    ? '#f59e0b' 
                    : Colors[colorScheme ?? 'light'].tint,
                },
              ]}
              onPress={isPlaying ? stopPlayback : playRecording}
              activeOpacity={0.7}
            >
              <IconSymbol
                name={isPlaying ? 'pause.circle.fill' : 'play.circle.fill'}
                size={60}
                color="#ffffff"
              />
            </TouchableOpacity>

            <View style={styles.previewActions}>
              <TouchableOpacity
                style={[styles.previewActionButton, { backgroundColor: '#ef4444' }]}
                onPress={resetRecording}
              >
                <IconSymbol name="trash.fill" size={20} color="#ffffff" />
                <Text style={styles.previewActionText}>Delete</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.analyzeButton, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}
                onPress={analyzeRecording}
              >
                <IconSymbol name="waveform.circle.fill" size={20} color="#ffffff" />
                <Text style={styles.analyzeButtonText}>Analyze Emotion</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : !result ? (
          <View style={styles.micContainer}>
            {isRecording && (
              <Text style={[styles.timerText, { color: Colors[colorScheme ?? 'light'].text }]}>
                {formatTime(recordingDuration)}
              </Text>
            )}
            <TouchableOpacity
              style={[
                styles.recordButton,
                {
                  backgroundColor: isRecording
                    ? '#ef4444'
                    : Colors[colorScheme ?? 'light'].tint,
                },
              ]}
              onPress={isRecording ? stopRecording : startRecording}
              activeOpacity={0.7}
            >
              <IconSymbol
                name={isRecording ? 'stop.circle.fill' : 'mic.fill'}
                size={60}
                color="#ffffff"
              />
            </TouchableOpacity>
          </View>
        ) : null}
      </View>

      <Text style={[styles.instruction, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
        {isRecording
          ? 'Tap to stop recording'
          : recordingUri && !result
          ? 'Play to preview, then analyze'
          : result
          ? ''
          : 'Tap the microphone to start'}
      </Text>

      {result && (
        <Animated.View
          style={[
            styles.resultCard,
            {
              backgroundColor: Colors[colorScheme ?? 'light'].card,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.resultHeader}>
            <Text style={[styles.resultHeaderText, { color: Colors[colorScheme ?? 'light'].text }]}>
              Analysis Complete
            </Text>
            <TouchableOpacity onPress={resetRecording}>
              <IconSymbol name="xmark.circle.fill" size={28} color={Colors[colorScheme ?? 'light'].tabIconDefault} />
            </TouchableOpacity>
          </View>

          <View style={styles.resultContent}>
            <Text style={styles.emoji}>{getEmotionEmoji(result.analysis.emotion)}</Text>
            <Text
              style={[
                styles.emotionText,
                { color: getEmotionColor(result.analysis.emotion) },
              ]}
            >
              {result.analysis.emotion.toUpperCase()}
            </Text>
            <Text style={[styles.confidenceText, { color: Colors[colorScheme ?? 'light'].text }]}>
              Confidence: {result.analysis.confidence.toFixed(1)}%
            </Text>

            <View style={styles.probabilitiesContainer}>
              <Text style={[styles.probabilitiesTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                All Emotions:
              </Text>
              {Object.entries(result.analysis.probabilities)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([emotion, prob]) => (
                  <View key={emotion} style={styles.probabilityRow}>
                    <Text style={[styles.probabilityLabel, { color: Colors[colorScheme ?? 'light'].text }]}>
                      {emotion}
                    </Text>
                    <View style={styles.probabilityBarContainer}>
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
                    <Text style={[styles.probabilityValue, { color: Colors[colorScheme ?? 'light'].text }]}>
                      {prob.toFixed(1)}%
                    </Text>
                  </View>
                ))}
            </View>

            <TouchableOpacity
              style={[styles.recordAgainButton, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}
              onPress={resetRecording}
            >
              <IconSymbol name="mic.fill" size={20} color="#ffffff" />
              <Text style={styles.recordAgainText}>Record Again</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 40,
    textAlign: 'center',
  },
  recordingContainer: {
    width: '100%',
    minHeight: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  micContainer: {
    alignItems: 'center',
  },
  timerText: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  recordButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  instruction: {
    fontSize: 14,
    marginTop: 20,
    textAlign: 'center',
  },
  analyzingContainer: {
    alignItems: 'center',
  },
  analyzingText: {
    fontSize: 16,
    marginTop: 20,
  },
  previewContainer: {
    alignItems: 'center',
    width: '100%',
  },
  previewTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  previewSubtitle: {
    fontSize: 16,
    marginBottom: 30,
  },
  playButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginBottom: 30,
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
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  previewActionText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  analyzeButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  analyzeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    maxHeight: '80%',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  resultHeaderText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  resultContent: {
    alignItems: 'center',
  },
  emoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  emotionText: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  confidenceText: {
    fontSize: 18,
    marginBottom: 30,
  },
  probabilitiesContainer: {
    width: '100%',
    marginTop: 20,
  },
  probabilitiesTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
  },
  probabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  probabilityLabel: {
    width: 80,
    fontSize: 14,
    textTransform: 'capitalize',
  },
  probabilityBarContainer: {
    flex: 1,
    height: 20,
    backgroundColor: '#e5e7eb',
    borderRadius: 10,
    overflow: 'hidden',
    marginHorizontal: 10,
  },
  probabilityBar: {
    height: '100%',
    borderRadius: 10,
  },
  probabilityValue: {
    width: 50,
    fontSize: 14,
    textAlign: 'right',
  },
  recordAgainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    gap: 8,
  },
  recordAgainText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});