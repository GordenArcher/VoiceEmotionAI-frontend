import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, UniversalColors } from '@/constants/theme';
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
    View
} from 'react-native';

export default function RegisterScreen() {
    const { colorScheme } = useThemeContext();
    const router = useRouter();
    const { register } = useAuth();
    
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const colors = Colors[colorScheme ?? 'light'];

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
            await register(username, email, password, confirmPassword);
            router.replace('/login');
        } catch (error: any) {
            console.log(error)
            Alert.alert('Registration Failed', error.message || 'Please try again');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { backgroundColor: colors.background }]}
        >
        <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
        >
            <View style={styles.header}>
            <View style={[styles.logoContainer, { backgroundColor: colors.tint }]}>
                <IconSymbol name="person.crop.circle.fill" size={50} color="#ffffff" />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>
                Create Account
            </Text>
            <Text style={[styles.subtitle, { color: colors.tabIconDefault }]}>
                Sign up to get started
            </Text>
            </View>

            <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
                <IconSymbol
                name="person.fill"
                size={20}
                color={colors.tabIconDefault}
                style={styles.inputIcon}
                />
                <TextInput
                style={[
                    styles.input,
                    {
                    color: colors.text,
                    backgroundColor: colors.inputBackground || colors.card,
                    borderColor: colors.border,
                    },
                ]}
                placeholder="Username"
                placeholderTextColor={colors.tabIconDefault}
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
                color={colors.tabIconDefault}
                style={styles.inputIcon}
                />
                <TextInput
                style={[
                    styles.input,
                    {
                    color: colors.text,
                    backgroundColor: colors.inputBackground || colors.card,
                    borderColor: colors.border,
                    },
                ]}
                placeholder="Email"
                placeholderTextColor={colors.tabIconDefault}
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
                color={colors.tabIconDefault}
                style={styles.inputIcon}
                />
                <TextInput
                style={[
                    styles.input,
                    {
                    color: colors.text,
                    backgroundColor: colors.inputBackground || colors.card,
                    borderColor: colors.border,
                    },
                ]}
                placeholder="Password"
                placeholderTextColor={colors.tabIconDefault}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!isLoading}
                />
                <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                >
                <IconSymbol
                    name={showPassword ? 'eye.slash.fill' : 'eye.fill'}
                    size={20}
                    color={colors.tabIconDefault}
                />
                </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
                <IconSymbol
                name="lock.fill"
                size={20}
                color={colors.tabIconDefault}
                style={styles.inputIcon}
                />
                <TextInput
                style={[
                    styles.input,
                    {
                    color: colors.text,
                    backgroundColor: colors.inputBackground || colors.card,
                    borderColor: colors.border,
                    },
                ]}
                placeholder="Confirm Password"
                placeholderTextColor={colors.tabIconDefault}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                editable={!isLoading}
                />
                <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
                >
                <IconSymbol
                    name={showConfirmPassword ? 'eye.slash.fill' : 'eye.fill'}
                    size={20}
                    color={colors.tabIconDefault}
                />
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={[styles.registerButton, { backgroundColor: colors.tint }]}
                onPress={handleRegister}
                disabled={isLoading}
            >
                {isLoading ? (
                <ActivityIndicator color="#ffffff" />
                ) : (
                <Text style={styles.registerButtonText}>Create Account</Text>
                )}
            </TouchableOpacity>

            <View style={styles.divider}>
                <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                <Text style={[styles.dividerText, { color: colors.tabIconDefault }]}>
                OR
                </Text>
                <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            </View>

            <TouchableOpacity
                style={styles.loginLink}
                onPress={() => router.back()}
                disabled={isLoading}
            >
                <Text style={[styles.loginText, { color: colors.tabIconDefault }]}>
                    Already have an account?{' '}
                <Text style={{ color: colors.tint, fontWeight: '600' }}>
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
        elevation: 4,
        shadowColor: UniversalColors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
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
        borderWidth: 1,
        elevation: 1,
        shadowColor: UniversalColors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    eyeIcon: {
        position: 'absolute',
        right: 15,
        padding: 8,
    },
    registerButton: {
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
        elevation: 3,
        shadowColor: UniversalColors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    registerButtonText: {
        color: UniversalColors.white,
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
    },
    dividerText: {
        marginHorizontal: 16,
        fontSize: 14,
        fontWeight: '500',
    },
    loginLink: {
        alignItems: 'center',
        padding: 8,
    },
    loginText: {
        fontSize: 15,
    },
});