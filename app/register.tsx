
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
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
    View
} from 'react-native';

export default function RegisterScreen() {
    const colorScheme = useColorScheme();
    const router = useRouter();
    const { register } = useAuth();
    
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async () => {
        if (!username || !email || !password || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
        return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
        return;
        }

        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
        return;
        }

        setIsLoading(true);
        try {
            await register(username, email, password);
            router.replace('/(tabs)');
        } catch (error: any) {
            Alert.alert('Registration Failed', error.message || 'Please try again');
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
                <IconSymbol name="person.crop.circle.fill" size={50} color="#ffffff" />
            </View>
            <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
                Create Account
            </Text>
            <Text style={[styles.subtitle, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
                Sign up to get started
            </Text>
            </View>

            <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
                <IconSymbol
                name="person.fill"
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
                placeholder="Username"
                placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                editable={!isLoading}
                />
            </View>

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
                placeholder="Confirm Password"
                placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                editable={!isLoading}
                />
                <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                <IconSymbol
                    name={showConfirmPassword ? 'eye.slash.fill' : 'eye.fill'}
                    size={20}
                    color={Colors[colorScheme ?? 'light'].tabIconDefault}
                />
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={[styles.loginButton, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}
                onPress={handleRegister}
                disabled={isLoading}
            >
                {isLoading ? (
                <ActivityIndicator color="#ffffff" />
                ) : (
                <Text style={styles.loginButtonText}>Create Account</Text>
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
                onPress={() => router.back()}
                disabled={isLoading}
            >
                <Text style={[styles.registerText, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
                    Already have an account?{' '}
                <Text style={{ color: Colors[colorScheme ?? 'light'].tint, fontWeight: '600' }}>
                    Sign In
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