import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, UniversalColors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeContext } from '@/contexts/ThemeContext';
import { apiService } from '@/services/api';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
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
    const { colorScheme, toggleColorScheme } = useThemeContext();
    const router = useRouter();
    const { logout } = useAuth();

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

    const handleDarkModeToggle = (value: boolean) => {
        setDarkModeEnabled(value);
        toggleColorScheme();
    };

    useEffect(() => {
        setDarkModeEnabled(colorScheme === 'dark');
    }, [colorScheme]);

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
            <IconSymbol name={icon} size={20} color={Colors[colorScheme].tint} />
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme].text }]}>
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
        <View style={[styles.settingRow, { backgroundColor: Colors[colorScheme].card }]}>
            <View style={styles.settingLeft}>
                <IconSymbol name={icon} size={24} color={Colors[colorScheme].tabIconDefault} />
                <Text style={[styles.settingLabel, { color: Colors[colorScheme].text }]}>
                    {label}
                </Text>
            </View>
            <Switch
                value={value}
                onValueChange={onValueChange}
                trackColor={{ 
                    false: UniversalColors.gray400, 
                    true: UniversalColors.primaryLight 
                }}
                thumbColor={UniversalColors.white}
                ios_backgroundColor={UniversalColors.gray400}
            />
        </View>
    );

    const renderInfoField = (label: string, value: string, field: string, multiline = false) => (
        <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: Colors[colorScheme].tabIconDefault }]}>
                {label}
            </Text>

            {isEditing ? (
                <TextInput
                    style={[
                        styles.infoInput,
                        multiline && styles.multilineInput,
                        { 
                            color: Colors[colorScheme].text, 
                            backgroundColor: Colors[colorScheme].inputBackground,
                            borderColor: Colors[colorScheme].border,
                        }
                    ]}
                    value={value}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, [field]: text }))}
                    multiline={multiline}
                    numberOfLines={multiline ? 4 : 1}
                    placeholder={`Enter ${label.toLowerCase()}...`}
                    placeholderTextColor={Colors[colorScheme].tabIconDefault + '60'}
                    textAlignVertical={multiline ? 'top' : 'center'}
                />
            ) : (
                <Text style={[styles.infoValue, { color: Colors[colorScheme].text }]}>
                    {value || 'Not set'}
                </Text>
            )}
        </View>
    );

    const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordErrors, setPasswordErrors] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const handlePasswordChange = (field: string, value: string) => {
        setPasswordData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (passwordErrors[field as keyof typeof passwordErrors]) {
            setPasswordErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validatePasswordForm = () => {
        const errors = {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        };

        if (!passwordData.currentPassword.trim()) {
            errors.currentPassword = 'Current password is required';
        }

        if (!passwordData.newPassword.trim()) {
            errors.newPassword = 'New password is required';
        } else if (passwordData.newPassword.length < 6) {
            errors.newPassword = 'Password must be at least 6 characters';
        }

        if (!passwordData.confirmPassword.trim()) {
            errors.confirmPassword = 'Please confirm your new password';
        } else if (passwordData.newPassword !== passwordData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        setPasswordErrors(errors);
        return !Object.values(errors).some(error => error !== '');
    };

    const handleChangePassword = async () => {
        if (!validatePasswordForm()) {
            return;
        }

        setIsChangingPassword(true);
        try {
            const response = await apiService.changePassword({
                current_password: passwordData.currentPassword,
                new_password: passwordData.newPassword,
                confirm_password: passwordData.confirmPassword,
            });

            Alert.alert('Success', response.message || 'Password changed successfully!');
            setIsPasswordModalVisible(false);
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
        } catch (error: any) {
            console.log(error)
            const errorMessage = error.response?.data?.message || 'Failed to change password';
            Alert.alert('Error', errorMessage);
        } finally {
            setIsChangingPassword(false);
        }
    };

    const closePasswordModal = () => {
        setIsPasswordModalVisible(false);
        setPasswordData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        });
        setPasswordErrors({
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        });
    };

    const renderPasswordInput = (label: string, field: keyof typeof passwordData, secureTextEntry = false) => (
        <View style={styles.passwordInputContainer}>
            <Text style={[styles.passwordLabel, { color: Colors[colorScheme].text }]}>
                {label}
            </Text>
            <TextInput
                style={[
                    styles.passwordInput,
                    {
                        color: Colors[colorScheme].text,
                        backgroundColor: Colors[colorScheme].inputBackground,
                        borderColor: passwordErrors[field] ? UniversalColors.error : Colors[colorScheme].border,
                    }
                ]}
                value={passwordData[field]}
                onChangeText={(text) => handlePasswordChange(field, text)}
                secureTextEntry={secureTextEntry}
                placeholder={`Enter ${label.toLowerCase()}`}
                placeholderTextColor={Colors[colorScheme].tabIconDefault + '60'}
                autoCapitalize="none"
                autoCorrect={false}
            />
            {passwordErrors[field] ? (
                <Text style={styles.errorText}>{passwordErrors[field]}</Text>
            ) : null}
        </View>
    );

    const renderPasswordModal = () => (
        <Modal
            visible={isPasswordModalVisible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={closePasswordModal}
        >
            <View style={[styles.modalContainer, { backgroundColor: Colors[colorScheme].background }]}>
                <View style={styles.modalHeader}>
                    <Text style={[styles.modalTitle, { color: Colors[colorScheme].text }]}>
                        Change Password
                    </Text>
                    <TouchableOpacity onPress={closePasswordModal}>
                        <IconSymbol name="xmark" size={24} color={Colors[colorScheme].tabIconDefault} />
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalContent}>
                    {renderPasswordInput('Current Password', 'currentPassword', true)}
                    {renderPasswordInput('New Password', 'newPassword', true)}
                    {renderPasswordInput('Confirm Password', 'confirmPassword', true)}

                    <View style={styles.passwordRequirements}>
                        <Text style={[styles.requirementsTitle, { color: Colors[colorScheme].text }]}>
                            Password Requirements:
                        </Text>
                        <Text style={[styles.requirement, { color: Colors[colorScheme].tabIconDefault }]}>
                            • At least 6 characters long
                        </Text>
                        <Text style={[styles.requirement, { color: Colors[colorScheme].tabIconDefault }]}>
                            • Should not be the same as current password
                        </Text>
                    </View>
                </ScrollView>

                <View style={styles.modalFooter}>
                    <TouchableOpacity
                        style={[styles.cancelButton, { backgroundColor: UniversalColors.gray200 }]}
                        onPress={closePasswordModal}
                        disabled={isChangingPassword}
                    >
                        <Text style={[styles.cancelButtonText, { color: UniversalColors.gray700 }]}>
                            Cancel
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.saveButton,
                            { backgroundColor: Colors[colorScheme].tint },
                            isChangingPassword && styles.disabledButton
                        ]}
                        onPress={handleChangePassword}
                        disabled={isChangingPassword}
                    >
                        {isChangingPassword ? (
                            <ActivityIndicator color={UniversalColors.white} size="small" />
                        ) : (
                            <>
                                <IconSymbol name="checkmark" size={16} color={UniversalColors.white} />
                                <Text style={styles.saveButtonText}>Change Password</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );

    if (isLoading) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: Colors[colorScheme].background }]}>
                <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
                <Text style={[styles.loadingText, { color: Colors[colorScheme].text }]}>
                    Loading profile...
                </Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl
                    refreshing={isRefreshing}
                    onRefresh={onRefresh}
                    tintColor={Colors[colorScheme].tint}
                    colors={[Colors[colorScheme].tint]}
                />
            }
        >
            <View style={styles.header}>
                <View style={[styles.avatarContainer, { backgroundColor: Colors[colorScheme].tint }]}>
                    {profile?.avatar ? (
                        <Text style={styles.avatarText}>IMG</Text>
                    ) : (
                        <Text style={styles.avatarText}>
                            {profile?.display_name?.charAt(0)?.toUpperCase() || 
                             profile?.username?.charAt(0)?.toUpperCase() || 'U'}
                        </Text>
                    )}
                </View>

                <Text style={[styles.userName, { color: Colors[colorScheme].text }]}>
                    {profile?.display_name || profile?.username || 'User'}
                </Text>
                <Text style={[styles.userEmail, { color: Colors[colorScheme].tabIconDefault }]}>
                    {profile?.email || 'user@example.com'}
                </Text>
                
                {profile?.total_recordings !== undefined && (
                    <View style={[styles.recordingsBadge, { backgroundColor: Colors[colorScheme].tint + '20' }]}>
                        <IconSymbol name="waveform" size={16} color={Colors[colorScheme].tint} />
                        <Text style={[styles.recordingsText, { color: Colors[colorScheme].tint }]}>
                            {profile.total_recordings} recordings
                        </Text>
                    </View>
                )}
            </View>

            {renderSectionHeader('Account Information', 'person.fill')}
            
            <View style={[styles.infoCard, { backgroundColor: Colors[colorScheme].card }]}>
                {renderInfoField('Username', formData.username, 'username')}
                <View style={[styles.divider, { backgroundColor: Colors[colorScheme].border }]} />
                {renderInfoField('Email', formData.email, 'email')}
                <View style={[styles.divider, { backgroundColor: Colors[colorScheme].border }]} />
                {renderInfoField('First Name', formData.first_name, 'first_name')}
                <View style={[styles.divider, { backgroundColor: Colors[colorScheme].border }]} />
                {renderInfoField('Last Name', formData.last_name, 'last_name')}
                <View style={[styles.divider, { backgroundColor: Colors[colorScheme].border }]} />
                {renderInfoField('Display Name', formData.display_name, 'display_name')}
                <View style={[styles.divider, { backgroundColor: Colors[colorScheme].border }]} />
                {renderInfoField('Bio', formData.bio, 'bio', true)}

                {isEditing ? (
                    <View style={styles.editButtons}>
                        <TouchableOpacity
                            style={[styles.cancelButton, { backgroundColor: UniversalColors.gray200 }]}
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
                            <Text style={[styles.cancelButtonText, { color: UniversalColors.gray700 }]}>
                                Cancel
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.saveButton, { backgroundColor: Colors[colorScheme].tint }]}
                            onPress={handleSaveProfile}
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <ActivityIndicator color={UniversalColors.white} size="small" />
                            ) : (
                                <>
                                    <IconSymbol name="checkmark" size={16} color={UniversalColors.white} />
                                    <Text style={styles.saveButtonText}>Save</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={[styles.editButton, { backgroundColor: Colors[colorScheme].tint }]}
                        onPress={() => setIsEditing(true)}
                    >
                        <IconSymbol name="pencil" size={16} color={UniversalColors.white} />
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
                handleDarkModeToggle,
                'moon.fill'
            )}

            {renderSectionHeader('Actions', 'exclamationmark.triangle.fill')}

            <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: Colors[colorScheme].card }]}
                onPress={() => setIsPasswordModalVisible(true)}
            >
                <IconSymbol name="key.fill" size={24} color={Colors[colorScheme].tabIconDefault} />
                <Text style={[styles.actionButtonText, { color: Colors[colorScheme].text }]}>
                    Change Password
                </Text>
                <IconSymbol name="chevron.right" size={20} color={Colors[colorScheme].tabIconDefault} />
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: Colors[colorScheme].card }]}
                onPress={() => Alert.alert('Help & Support', 'Contact us at support@example.com')}
            >
                <IconSymbol name="questionmark.circle.fill" size={24} color={Colors[colorScheme].tabIconDefault} />
                <Text style={[styles.actionButtonText, { color: Colors[colorScheme].text }]}>
                    Help & Support
                </Text>
                <IconSymbol name="chevron.right" size={20} color={Colors[colorScheme].tabIconDefault} />
            </TouchableOpacity>

            {renderSectionHeader('Danger Zone', 'exclamationmark.triangle.fill')}

            <TouchableOpacity
                style={[styles.dangerButton, { 
                    backgroundColor: UniversalColors.error + '10', 
                    borderColor: UniversalColors.error + '30' 
                }]}
                onPress={handleDeleteAccount}
            >
                <IconSymbol name="trash.fill" size={24} color={UniversalColors.error} />
                <Text style={[styles.dangerButtonText, { color: UniversalColors.error }]}>
                    Delete Account
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.logoutButton, { backgroundColor: UniversalColors.error }]}
                onPress={handleLogout}
            >
                <IconSymbol name="arrow.right.square.fill" size={24} color={UniversalColors.white} />
                <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>

            <Text style={[styles.version, { color: Colors[colorScheme].tabIconDefault }]}>
                Version 1.0.0
            </Text>

            {renderPasswordModal()}

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
    },
    avatarText: {
        fontSize: 40,
        fontWeight: 'bold',
        color: UniversalColors.white,
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
        borderRadius: 12,
        padding: 20,
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
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
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
        borderRadius: 8,
        marginTop: 8,
        gap: 8,
    },
    editButtonText: {
        color: UniversalColors.white,
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
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    saveButton: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    saveButtonText: {
        color: UniversalColors.white,
        fontSize: 16,
        fontWeight: '600',
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 8,
        marginBottom: 12,
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
        borderRadius: 8,
        marginBottom: 12,
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
        borderRadius: 8,
        marginBottom: 12,
        borderWidth: 1,
        gap: 12,
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
        borderRadius: 8,
        marginTop: 8,
        gap: 8,
    },
    logoutButtonText: {
        color: UniversalColors.white,
        fontSize: 18,
        fontWeight: '600',
    },
    version: {
        textAlign: 'center',
        fontSize: 14,
        marginTop: 24,
        marginBottom: 40,
    },modalContainer: {
        flex: 1,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: UniversalColors.gray300,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    modalContent: {
        flex: 1,
        padding: 20,
    },
    modalFooter: {
        flexDirection: 'row',
        gap: 12,
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: UniversalColors.gray300,
    },
    passwordInputContainer: {
        marginBottom: 20,
    },
    passwordLabel: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 8,
    },
    passwordInput: {
        fontSize: 16,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    errorText: {
        color: UniversalColors.error,
        fontSize: 14,
        marginTop: 4,
    },
    passwordRequirements: {
        marginTop: 20,
        padding: 16,
        borderRadius: 8,
        backgroundColor: UniversalColors.gray300,
    },
    requirementsTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    requirement: {
        fontSize: 14,
        marginBottom: 4,
    },
    disabledButton: {
        opacity: 0.6,
    },
});