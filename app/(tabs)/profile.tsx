import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { apiService } from '@/services/api';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface UserProfile {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    display_name: string;
    bio: string;
    avatar: string | null;
    total_recordings: number;
    created_at: string;
    updated_at: string;
}

export default function ProfileScreen() {
    const colorScheme = useColorScheme();
    const router = useRouter();
    const { user, logout } = useAuth();

    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        display_name: '',
        bio: '',
    });
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [darkModeEnabled, setDarkModeEnabled] = useState(colorScheme === 'dark');

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setIsLoading(true);
            const profileData = await apiService.getProfile();
            setProfile(profileData.user);
            setFormData({
                username: profileData.user.username,
                email: profileData.user.email,
                first_name: profileData.user.first_name,
                last_name: profileData.user.last_name,
                display_name: profileData.user.display_name,
                bio: profileData.user.bio,
            });
        } catch (error) {
            Alert.alert('Error', 'Failed to load profile');
            console.error('Profile load error:', error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    const onRefresh = () => {
        setIsRefreshing(true);
        loadProfile();
    };

    const handleSaveProfile = async () => {
        if (!formData.username.trim() || !formData.email.trim()) {
            Alert.alert('Error', 'Username and email are required');
            return;
        }

        setIsSaving(true);
        try {
            const updatedProfile = await apiService.updateProfile(formData);
            setProfile(updatedProfile.user);
            setIsEditing(false);
            Alert.alert('Success', updatedProfile.message || 'Profile updated successfully!');
        } catch (error) {
            Alert.alert('Error', 'Failed to update profile');
            console.error('Profile update error:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await apiService.logout();
                            await logout();
                            router.replace('/login');
                        } catch (error) {
                            console.error('Logout error:', error);
                            // Force logout even if API call fails
                            await logout();
                            router.replace('/login');
                        }
                    },
                },
            ]
        );
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            'Delete Account',
            'This action cannot be undone. All your data will be permanently deleted.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete Account',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await apiService.deleteAccount();
                            await logout();
                            router.replace('/login');
                            Alert.alert('Success', 'Your account has been deleted');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete account');
                            console.error('Delete account error:', error);
                        }
                    },
                },
            ]
        );
    };

    const renderSectionHeader = (title: string, icon: string) => (
        <View style={styles.sectionHeader}>
            <IconSymbol name={icon} size={20} color={Colors[colorScheme ?? 'light'].tint} />
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                {title}
            </Text>
        </View>
    );

    const renderSettingRow = (
        label: string,
        value: boolean,
        onValueChange: (value: boolean) => void,
        icon: string
    ) => (
        <View style={[styles.settingRow, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
            <View style={styles.settingLeft}>
                <IconSymbol name={icon} size={24} color={Colors[colorScheme ?? 'light'].tabIconDefault} />
                <Text style={[styles.settingLabel, { color: Colors[colorScheme ?? 'light'].text }]}>
                    {label}
                </Text>
            </View>
            <Switch
                value={value}
                onValueChange={onValueChange}
                trackColor={{ false: '#767577', true: Colors[colorScheme ?? 'light'].tint }}
                thumbColor="#ffffff"
            />
        </View>
    );

    const renderInfoField = (label: string, value: string, field: string, multiline = false) => (
        <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
                {label}
            </Text>
            {isEditing ? (
                <TextInput
                    style={[
                        styles.infoInput,
                        multiline && styles.multilineInput,
                        { 
                            color: Colors[colorScheme ?? 'light'].text, 
                            backgroundColor: Colors[colorScheme ?? 'light'].background,
                            borderColor: Colors[colorScheme ?? 'light'].tabIconDefault + '30',
                        }
                    ]}
                    value={value}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, [field]: text }))}
                    multiline={multiline}
                    numberOfLines={multiline ? 4 : 1}
                    placeholder={`Enter ${label.toLowerCase()}...`}
                    placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault + '60'}
                    textAlignVertical={multiline ? 'top' : 'center'}
                />
            ) : (
                <Text style={[styles.infoValue, { color: Colors[colorScheme ?? 'light'].text }]}>
                    {value || 'Not set'}
                </Text>
            )}
        </View>
    );

    if (isLoading) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
                <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
                <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].text }]}>
                    Loading profile...
                </Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl
                    refreshing={isRefreshing}
                    onRefresh={onRefresh}
                    tintColor={Colors[colorScheme ?? 'light'].tint}
                    colors={[Colors[colorScheme ?? 'light'].tint]}
                />
            }
        >
            {/* Header Section */}
            <View style={styles.header}>
                <View style={[styles.avatarContainer, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}>
                    {profile?.avatar ? (
                        <Text style={styles.avatarText}>IMG</Text> // You can replace this with an actual Image component
                    ) : (
                        <Text style={styles.avatarText}>
                            {profile?.display_name?.charAt(0)?.toUpperCase() || 
                             profile?.username?.charAt(0)?.toUpperCase() || 'U'}
                        </Text>
                    )}
                </View>

                <Text style={[styles.userName, { color: Colors[colorScheme ?? 'light'].text }]}>
                    {profile?.display_name || profile?.username || 'User'}
                </Text>
                <Text style={[styles.userEmail, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
                    {profile?.email || 'user@example.com'}
                </Text>
                
                {profile?.total_recordings !== undefined && (
                    <View style={[styles.recordingsBadge, { backgroundColor: Colors[colorScheme ?? 'light'].tint + '20' }]}>
                        <IconSymbol name="waveform" size={16} color={Colors[colorScheme ?? 'light'].tint} />
                        <Text style={[styles.recordingsText, { color: Colors[colorScheme ?? 'light'].tint }]}>
                            {profile.total_recordings} recordings
                        </Text>
                    </View>
                )}
            </View>

            {/* Account Information Section */}
            {renderSectionHeader('Account Information', 'person.fill')}
            
            <View style={[styles.infoCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
                {renderInfoField('Username', formData.username, 'username')}
                <View style={[styles.divider, { backgroundColor: Colors[colorScheme ?? 'light'].tabIconDefault + '20' }]} />
                {renderInfoField('Email', formData.email, 'email')}
                <View style={[styles.divider, { backgroundColor: Colors[colorScheme ?? 'light'].tabIconDefault + '20' }]} />
                {renderInfoField('First Name', formData.first_name, 'first_name')}
                <View style={[styles.divider, { backgroundColor: Colors[colorScheme ?? 'light'].tabIconDefault + '20' }]} />
                {renderInfoField('Last Name', formData.last_name, 'last_name')}
                <View style={[styles.divider, { backgroundColor: Colors[colorScheme ?? 'light'].tabIconDefault + '20' }]} />
                {renderInfoField('Display Name', formData.display_name, 'display_name')}
                <View style={[styles.divider, { backgroundColor: Colors[colorScheme ?? 'light'].tabIconDefault + '20' }]} />
                {renderInfoField('Bio', formData.bio, 'bio', true)}

                {isEditing ? (
                    <View style={styles.editButtons}>
                        <TouchableOpacity
                            style={[styles.cancelButton, { backgroundColor: Colors[colorScheme ?? 'light'].tabIconDefault + '20' }]}
                            onPress={() => {
                                setIsEditing(false);
                                setFormData({
                                    username: profile?.username || '',
                                    email: profile?.email || '',
                                    first_name: profile?.first_name || '',
                                    last_name: profile?.last_name || '',
                                    display_name: profile?.display_name || '',
                                    bio: profile?.bio || '',
                                });
                            }}
                            disabled={isSaving}
                        >
                            <Text style={[styles.cancelButtonText, { color: Colors[colorScheme ?? 'light'].text }]}>
                                Cancel
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.saveButton, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}
                            onPress={handleSaveProfile}
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <ActivityIndicator color="#ffffff" size="small" />
                            ) : (
                                <>
                                    <IconSymbol name="checkmark" size={16} color="#ffffff" />
                                    <Text style={styles.saveButtonText}>Save</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={[styles.editButton, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}
                        onPress={() => setIsEditing(true)}
                    >
                        <IconSymbol name="pencil" size={16} color="#ffffff" />
                        <Text style={styles.editButtonText}>Edit Profile</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Preferences Section */}
            {renderSectionHeader('Preferences', 'gearshape.fill')}
            
            {renderSettingRow(
                'Push Notifications',
                notificationsEnabled,
                setNotificationsEnabled,
                'bell.fill'
            )}

            {renderSettingRow(
                'Dark Mode',
                darkModeEnabled,
                setDarkModeEnabled,
                'moon.fill'
            )}

            {/* Actions Section */}
            {renderSectionHeader('Actions', 'exclamationmark.triangle.fill')}

            <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}
                onPress={() => Alert.alert('Change Password', 'This feature is coming soon!')}
            >
                <IconSymbol name="key.fill" size={24} color={Colors[colorScheme ?? 'light'].tabIconDefault} />
                <Text style={[styles.actionButtonText, { color: Colors[colorScheme ?? 'light'].text }]}>
                    Change Password
                </Text>
                <IconSymbol name="chevron.right" size={20} color={Colors[colorScheme ?? 'light'].tabIconDefault} />
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}
                onPress={() => Alert.alert('Help & Support', 'Contact us at support@example.com')}
            >
                <IconSymbol name="questionmark.circle.fill" size={24} color={Colors[colorScheme ?? 'light'].tabIconDefault} />
                <Text style={[styles.actionButtonText, { color: Colors[colorScheme ?? 'light'].text }]}>
                    Help & Support
                </Text>
                <IconSymbol name="chevron.right" size={20} color={Colors[colorScheme ?? 'light'].tabIconDefault} />
            </TouchableOpacity>

            {/* Danger Zone */}
            {renderSectionHeader('Danger Zone', 'exclamationmark.triangle.fill')}

            <TouchableOpacity
                style={[styles.dangerButton, { backgroundColor: '#fef2f2', borderColor: '#fecaca' }]}
                onPress={handleDeleteAccount}
            >
                <IconSymbol name="trash.fill" size={24} color="#dc2626" />
                <Text style={[styles.dangerButtonText, { color: '#dc2626' }]}>
                    Delete Account
                </Text>
            </TouchableOpacity>

            {/* Logout Button */}
            <TouchableOpacity
                style={[styles.logoutButton, { backgroundColor: '#ef4444' }]}
                onPress={handleLogout}
            >
                <IconSymbol name="arrow.right.square.fill" size={24} color="#ffffff" />
                <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>

            <Text style={[styles.version, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
                Version 1.0.0
            </Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        fontWeight: '500',
    },
    scrollContent: {
        padding: 20,
        paddingTop: 60,
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    avatarText: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
        textAlign: 'center',
    },
    userEmail: {
        fontSize: 16,
        marginBottom: 12,
        textAlign: 'center',
    },
    recordingsBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 6,
    },
    recordingsText: {
        fontSize: 14,
        fontWeight: '600',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginLeft: 8,
    },
    infoCard: {
        borderRadius: 16,
        padding: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    infoRow: {
        marginBottom: 20,
    },
    infoLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    infoValue: {
        fontSize: 16,
        fontWeight: '500',
        paddingVertical: 8,
    },
    infoInput: {
        fontSize: 16,
        fontWeight: '500',
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    multilineInput: {
        minHeight: 100,
        textAlignVertical: 'top',
        paddingTop: 12,
    },
    divider: {
        height: 1,
        marginVertical: 16,
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        marginTop: 8,
        gap: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    editButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    editButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 16,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    saveButton: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    saveButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    settingLabel: {
        fontSize: 16,
        fontWeight: '500',
        marginLeft: 12,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    actionButtonText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
        marginLeft: 12,
    },
    dangerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        gap: 12,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    dangerButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 18,
        borderRadius: 12,
        marginTop: 8,
        gap: 8,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    logoutButtonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '600',
    },
    version: {
        textAlign: 'center',
        fontSize: 14,
        marginTop: 24,
        marginBottom: 40,
    },
});