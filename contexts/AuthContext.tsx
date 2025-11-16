import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from "expo-constants";
import { useRouter } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';

interface User {
    id: number;
    username: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (username: string, email: string, password: string, confirm_password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = Constants?.expoConfig?.extra?.API_URL;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        loadStoredAuth();
    }, []);

    const loadStoredAuth = async () => {
        try {
            const storedToken = await AsyncStorage.getItem('auth_token');
            const storedUser = await AsyncStorage.getItem('user_data');
        
        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
        } catch (error) {
            console.error('Failed to load auth data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string) => {

        try {
            const response = await axios.post(`${API_BASE_URL}/auth/login/`, { email, password });

            if (response) {
                const data = response.data;
            
                await AsyncStorage.setItem('auth_token', data.tokens.access);
                await AsyncStorage.setItem("refresh_token", data.tokens.refresh);

                await AsyncStorage.setItem('user_data', JSON.stringify(data.user));
                
                setToken(data.tokens.access);
                setUser(data.user);

                router.replace('/(tabs)');
                
            }
            
        } catch (error: any) {
            const errorData = error.response?.data?.message
            Alert.alert(errorData || "Error loggin in")
            return error;
        }
    };

    const register = async (username: string, email: string, password: string, confirm_password: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/register/`, {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password, confirm_password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.log("r ", errorData)
                throw new Error(errorData.detail || 'Registration failed');
            }

            const data = await response.json();

            Alert.alert(data?.message)
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        await AsyncStorage.removeItem('auth_token');
        await AsyncStorage.removeItem('user_data');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
        if (!context) {
            throw new Error('useAuth must be used within AuthProvider');
        }
    return context;
};
