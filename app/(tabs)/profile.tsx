import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function ProfileScreen() {
    const colorScheme = useColorScheme();
    const router = useRouter();
    const { user, logout } = useAuth();

    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [username, setUsername] = useState(user?.username || '');
    const [email, setEmail] = useState(user?.email || '');
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [darkModeEnabled, setDarkModeEnabled] = useState(colorScheme === 'dark');

    const handleSaveProfile = async () => {
        setIsSaving(true);
        // TODO: Implement API call to update profile
        setTimeout(() => {
        setIsSaving(false);
        setIsEditing(false);
        Alert.alert('Success', 'Profile updated successfully!');
        }, 1000);
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
                    await logout();
                    router.replace('/login');
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

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}
            contentContainerStyle={styles.scrollContent}
        >
            <View style={styles.header}>
                <View style={[styles.avatarContainer, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}>
                    <Text style={styles.avatarText}>
                        {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </Text>
                </View>

                <Text style={[styles.userName, { color: Colors[colorScheme ?? 'light'].text }]}>
                    {user?.username || 'User'}
                </Text>
                <Text style={[styles.userEmail, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
                    {user?.email || 'user@example.com'}
                </Text>
            </View>

        {renderSectionHeader('Account Information', 'person.fill')}
        
        <View style={[styles.infoCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
            <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
                Username
            </Text>
                {isEditing ? (
                    <TextInput
                        style={[styles.infoInput, { color: Colors[colorScheme ?? 'light'].text }]}
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="none"
                    />
                ) : (
                    <Text style={[styles.infoValue, { color: Colors[colorScheme ?? 'light'].text }]}>
                        {username}
                    </Text>
                )}
            </View>

            <View style={[styles.divider, { backgroundColor: Colors[colorScheme ?? 'light'].tabIconDefault }]} />

            <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
                    Email
                </Text>
                {isEditing ? (
                    <TextInput
                        style={[styles.infoInput, { color: Colors[colorScheme ?? 'light'].text }]}
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                ) : (
                    <Text style={[styles.infoValue, { color: Colors[colorScheme ?? 'light'].text }]}>
                        {email}
                    </Text>
                )}
            </View>

            {isEditing ? (
                <View style={styles.editButtons}>
                    <TouchableOpacity
                        style={[styles.cancelButton, { backgroundColor: Colors[colorScheme ?? 'light'].tabIconDefault + '30' }]}
                        onPress={() => {
                            setIsEditing(false);
                            setUsername(user?.username || '');
                            setEmail(user?.email || '');
                        }}
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
                            <ActivityIndicator color="#ffffff" />
                        ) : (
                            <Text style={styles.saveButtonText}>Save Changes</Text>
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
    },
    userEmail: {
        fontSize: 16,
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
        borderRadius: 12,
        padding: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    infoRow: {
        marginBottom: 16,
    },
    infoLabel: {
        fontSize: 14,
        marginBottom: 8,
    },
    infoValue: {
        fontSize: 16,
        fontWeight: '500',
    },
    infoInput: {
        fontSize: 16,
        fontWeight: '500',
        borderBottomWidth: 1,
        borderBottomColor: '#94a3b8',
        paddingBottom: 4,
    },
    divider: {
        height: 1,
        opacity: 0.2,
        marginVertical: 8,
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 8,
    },
    editButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    editButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 16,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    saveButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
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
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        marginTop: 24,
    },
    logoutButtonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '600',
        marginLeft: 8,
    },
    version: {
        textAlign: 'center',
        fontSize: 14,
        marginTop: 24,
        marginBottom: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        marginBottom: 20,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    statCard: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginHorizontal: 4,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 8,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        textAlign: 'center',
    },
    topEmotionEmoji: {
        fontSize: 32,
    },
    listHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    listTitle: {
        fontSize: 20,
        fontWeight: '600',
    },
    listContainer: {
        paddingBottom: 20,
    },
    recordingCard: {
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
    recordingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    emojiCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    recordingEmoji: {
        fontSize: 24,
    },
    recordingInfo: {
        flex: 1,
    },
    recordingEmotion: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    recordingTime: {
        fontSize: 14,
    },
    confidenceBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        backgroundColor: '#f3f4f6',
    },
    confidenceText: {
        fontSize: 14,
        fontWeight: '600',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
    },
});