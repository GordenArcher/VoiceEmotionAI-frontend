import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

export interface EmotionAnalysis {
    id: number;
    emotion: string;
    confidence: number;
    analyzed_at: string;
}

export interface Recording {
    id: number;
    audio_file: string;
    uploaded_at: string;
    latest_emotion?: {
        emotion: string;
        confidence: number;
        analyzed_at: string;
    };
    emotion_analyses: EmotionAnalysis[];
}

export interface AnalysisResponse {
    recording: Recording;
    analysis: {
        id: number;
        emotion: string;
        confidence: number;
        probabilities: Record<string, number>;
        analyzed_at: string;
    };
}

class ApiService {
    private async getToken(): Promise<string | null> {
        return await AsyncStorage.getItem('auth_token');
    }

    private async getHeaders(isMultipart: boolean = false): Promise<HeadersInit> {
        const token = await this.getToken();
        const headers: HeadersInit = {};
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        if (!isMultipart) {
            headers['Content-Type'] = 'application/json';
        }
    
        return headers;
    }

    async uploadAndAnalyze(audioUri: string): Promise<AnalysisResponse> {
        const formData = new FormData();
            formData.append('audio_file', {
            uri: audioUri,
            type: 'audio/wav',
            name: 'recording.wav',
        } as any);

        const response = await fetch(`${API_BASE_URL}/recordings/upload/`, {
            method: 'POST',
            headers: await this.getHeaders(true),
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Failed to upload and analyze');
        }

        const data = response.json(); 
        console.log(data)
        return data
    }

    async getRecordings(): Promise<Recording[]> {
        const response = await fetch(`${API_BASE_URL}/recordings/`, {
            headers: await this.getHeaders(),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch recordings');
        }

        return response.json();
    }

    async getStatistics() {
        const response = await fetch(`${API_BASE_URL}/recordings/statistics/`, {
            headers: await this.getHeaders(),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch statistics');
        }

        return response.json();
    }

    async generateAIResponse(recordingId: number) {
        const response = await fetch(`${API_BASE_URL}/ai-responses/generate/`, {
            method: 'POST',
            headers: await this.getHeaders(),
            body: JSON.stringify({ recording_id: recordingId }),
        });

        if (!response.ok) {
            throw new Error('Failed to generate AI response');
        }

        return response.json();
    }
}

export const apiService = new ApiService();