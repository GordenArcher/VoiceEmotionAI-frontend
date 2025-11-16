import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeContext } from '@/contexts/ThemeContext';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function LoginScreen() {
    const { colorScheme } = useThemeContext();
    const router = useRouter();
    const { login } = useAuth();
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setIsLoading(true);
        try {
            await login(email, password);
        } catch (error: any) {
            Alert.alert('Login Failed', error.message || 'Invalid credentials');
            console.log(error.message)
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}
        >
        <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
        >
            <View style={styles.header}>
            <View style={[styles.logoContainer, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}>
                <IconSymbol name="mic.fill" size={50} color="#ffffff" />
            </View>
            <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
                Welcome Back
            </Text>
            <Text style={[styles.subtitle, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
                Sign in to continue
            </Text>
            </View>

            <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
                <IconSymbol
                    name="envelope.fill"
                    size={20}
                    color={Colors[colorScheme ?? 'light'].tabIconDefault}
                    style={styles.inputIcon}
                />
                <TextInput
                    style={[
                        styles.input,
                        {
                        color: Colors[colorScheme ?? 'light'].text,
                        backgroundColor: Colors[colorScheme ?? 'light'].card,
                        },
                    ]}
                    placeholder="Email"
                    placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    editable={!isLoading}
                />
            </View>

            <View style={styles.inputContainer}>
                <IconSymbol
                name="lock.fill"
                size={20}
                color={Colors[colorScheme ?? 'light'].tabIconDefault}
                style={styles.inputIcon}
                />
                <TextInput
                style={[
                    styles.input,
                    {
                    color: Colors[colorScheme ?? 'light'].text,
                    backgroundColor: Colors[colorScheme ?? 'light'].card,
                    },
                ]}
                placeholder="Password"
                placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!isLoading}
                />
                <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
                >
                <IconSymbol
                    name={showPassword ? 'eye.slash.fill' : 'eye.fill'}
                    size={20}
                    color={Colors[colorScheme ?? 'light'].tabIconDefault}
                />
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={[styles.loginButton, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}
                onPress={handleLogin}
                disabled={isLoading}
            >
                {isLoading ? (
                <ActivityIndicator color="#ffffff" />
                ) : (
                <Text style={styles.loginButtonText}>Sign In</Text>
                )}
            </TouchableOpacity>

            <View style={styles.divider}>
                <View style={[styles.dividerLine, { backgroundColor: Colors[colorScheme ?? 'light'].tabIconDefault }]} />
                <Text style={[styles.dividerText, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
                OR
                </Text>
                <View style={[styles.dividerLine, { backgroundColor: Colors[colorScheme ?? 'light'].tabIconDefault }]} />
            </View>

            <TouchableOpacity
                style={styles.registerLink}
                onPress={() => router.push('/register')}
                disabled={isLoading}
            >
                <Text style={[styles.registerText, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
                 Don&apos;t have an account?{' '}
                <Text style={{ color: Colors[colorScheme ?? 'light'].tint, fontWeight: '600' }}>
                    Sign Up
                </Text>
                </Text>
            </TouchableOpacity>
            </View>
        </ScrollView>
        </KeyboardAvoidingView>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
    },
    formContainer: {
        width: '100%',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        position: 'relative',
    },
    inputIcon: {
        position: 'absolute',
        left: 15,
        zIndex: 1,
    },
    input: {
        flex: 1,
        height: 56,
        borderRadius: 12,
        paddingHorizontal: 48,
        fontSize: 16,
    },
    eyeIcon: {
        position: 'absolute',
        right: 15,
        padding: 8,
    },
    loginButton: {
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
    },
    loginButtonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '600',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        opacity: 0.3,
    },
    dividerText: {
        marginHorizontal: 16,
        fontSize: 14,
    },
    registerLink: {
        alignItems: 'center',
        padding: 8,
    },
    registerText: {
        fontSize: 15,
    },
});