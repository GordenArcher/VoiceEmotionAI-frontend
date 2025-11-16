import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

const API_BASE_URL = "http://127.0.0.1:8000/api/v1";

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
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: API_BASE_URL,
            timeout: 15000,
        });

        this.client.interceptors.request.use(this.attachToken);
        this.client.interceptors.response.use(
        (res) => res,
            this.handleRefresh
        );
    }

    // Get tokens from AsyncStorage
    private async getTokens() {
        const access = await AsyncStorage.getItem("auth_token");
        const refresh = await AsyncStorage.getItem("refresh_token");
        return { access, refresh };
    }

    // Attach access token to request headers
    private attachToken = async (config: AxiosRequestConfig) => {
        const { access } = await this.getTokens();
        if (access) {
            config.headers = {
                ...config.headers,
                Authorization: `Bearer ${access}`,
            };
        }
        return config;
    };

    // Refresh access token if expired
    private handleRefresh = async (error: any) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const { refresh } = await this.getTokens();
            if (!refresh) return Promise.reject(error);

            try {
                const res = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
                    refresh,
                });

                const newAccess = res.data.access;
                await AsyncStorage.setItem("auth_token", newAccess);

                originalRequest.headers.Authorization = `Bearer ${newAccess}`;
                return this.client(originalRequest);
            } catch (err) {
                return Promise.reject(err);
            }
        }

        return Promise.reject(error);
    };

    // Upload and analyze audio
    async uploadAndAnalyze(audioUri: string): Promise<AnalysisResponse> {
        const form = new FormData();
            form.append("audio_file", {
            uri: audioUri,
            type: "audio/wav",
            name: "recording.wav",
        } as any);

        const res = await this.client.post("/recordings/upload/", form, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        return res.data;
    }

    // Get list of recordings
    async getRecordings(): Promise<Recording[]> {
        const res = await this.client.get("/recordings/");
        return res.data;
    }

    // Get statistics
    async getStatistics() {
        const res = await this.client.get("/recordings/statistics/");
        return res.data;
    }

    // Generate AI response from latest analysis
    async generateAIResponse(recordingId: number) {
        const res = await this.client.post("/ai-responses/generate/", {
            recording_id: recordingId,
        });
        return res.data;
    }

    // Fetch a single recording by ID
    async getRecording(recordingId: number): Promise<Recording> {
        const res = await this.client.get(`/recordings/${recordingId}/`);
        return res.data;
    }

    // Delete recording
    async deleteRecording(recordingId: number): Promise<void> {
        await this.client.delete(`/recordings/${recordingId}/delete/`);
    }

    // Re-run emotion analysis for a recording
    async reanalyzeRecording(recordingId: number) {
        const res = await this.client.post(`/recordings/${recordingId}/reanalyze/`);
        return res.data;
    }

    async logout() {
        const refresh = await AsyncStorage.getItem("refresh_token");
        
        await AsyncStorage.removeItem("auth_token");
        await AsyncStorage.removeItem("refresh_token");

        return await this.client.post('/auth/logout/', { refresh });
    }


    async deleteAccount() {
        return this.client.delete('/auth/delete-account/');
    }

    async getProfile() {
        const res = await this.client.get('/auth/profile/');
        return res.data;
    }

    async updateProfile(updates: any) {
        const res = await this.client.put('/auth/profile/update/', updates);
        return res.data;
    }
}

export const apiService = new ApiService();
