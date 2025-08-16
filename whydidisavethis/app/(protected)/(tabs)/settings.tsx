import React from 'react';
import {
    View,
    Text,
    ScrollView,
    ActivityIndicator,
    StyleSheet,
    TouchableOpacity,
    Platform,
} from 'react-native';
import { useAuth } from '@/utils/authContext';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { useActionSheet } from '@expo/react-native-action-sheet';

export default function SettingsScreen() {
    const {
        logOut,
        isLoadingAction,
        actionError,
        deleteUser,
        user
    } = useAuth();
    const colorScheme = useColorScheme();
    const { showActionSheetWithOptions } = useActionSheet();

    const handleLogout = async () => {
        const options = ["Log Out", "Cancel"];
        const destructiveButtonIndex = 0;
        const cancelButtonIndex = 1;

        showActionSheetWithOptions(
            {
                options,
                cancelButtonIndex,
                destructiveButtonIndex,
                message: "Are you sure you want to log out?",
                textStyle: { 
                    color: Colors[colorScheme ?? 'light'].text,
                    fontSize: 17,
                    fontWeight: '400',
                },
                messageTextStyle: {
                    color: Colors[colorScheme ?? 'light'].textSecondary,
                    fontSize: 13,
                },
                destructiveColor: '#EF4444',
                tintColor: Colors[colorScheme ?? 'light'].text,
            },
            (buttonIndex) => {
                if (buttonIndex === 0) {
                    logOut();
                }
            }
        );
    };

    const handleDeleteAccount = async () => {
        const options = ["Delete Account", "Cancel"];
        const destructiveButtonIndex = 0;
        const cancelButtonIndex = 1;

        showActionSheetWithOptions(
            {
                options,
                cancelButtonIndex,
                destructiveButtonIndex,
                message: "This action cannot be undone. All your data will be permanently deleted.",
                textStyle: { 
                    color: Colors[colorScheme ?? 'light'].text,
                    fontSize: 17,
                    fontWeight: '400',
                },
                messageTextStyle: {
                    color: Colors[colorScheme ?? 'light'].textSecondary,
                    fontSize: 13,
                },
                destructiveColor: '#EF4444',
                tintColor: Colors[colorScheme ?? 'light'].text,
            },
            (buttonIndex) => {
                if (buttonIndex === 0) {
                    deleteUser();
                }
            }
        );
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
            <View style={styles.topPadding} />
            
            {actionError && (
                <View style={[styles.errorContainer, { backgroundColor: Colors[colorScheme ?? 'light'].errorBackground }]}>
                    <Text style={[styles.errorText, { color: Colors[colorScheme ?? 'light'].error }]}>{actionError}</Text>
                </View>
            )}

            {isLoadingAction && (
                <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].primary} style={styles.loader} />
            )}

            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].textMuted }]}>ACCOUNT</Text>
                
                <View style={[styles.card, { backgroundColor: Colors[colorScheme ?? 'light'].cardBackground }]}>
                    <View style={[styles.userInfo, { borderBottomColor: Colors[colorScheme ?? 'light'].border }]}>
                        <View style={[styles.avatar, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}>
                            <Text style={styles.avatarText}>
                                {user?.username?.charAt(0).toUpperCase() || 'U'}
                            </Text>
                        </View>
                        <View style={styles.userDetails}>
                            <Text style={[styles.username, { color: Colors[colorScheme ?? 'light'].text }]}>
                                {user?.username || 'User'}
                            </Text>
                            <Text style={[styles.email, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                                Signed in
                            </Text>
                        </View>
                    </View>

                    <TouchableOpacity 
                        style={styles.menuItem}
                        onPress={handleLogout}
                        disabled={isLoadingAction}
                    >
                        <Ionicons name="log-out-outline" size={22} color={Colors[colorScheme ?? 'light'].text} />
                        <Text style={[styles.menuItemText, { color: Colors[colorScheme ?? 'light'].text }]}>Log Out</Text>
                        <Ionicons name="chevron-forward" size={20} color={Colors[colorScheme ?? 'light'].textMuted} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].textMuted }]}>DATA</Text>
                
                <View style={[styles.card, { backgroundColor: Colors[colorScheme ?? 'light'].cardBackground }]}>
                    <TouchableOpacity 
                        style={styles.menuItem}
                        onPress={handleDeleteAccount}
                        disabled={isLoadingAction}
                    >
                        <Ionicons name="trash-outline" size={22} color={Colors[colorScheme ?? 'light'].error} />
                        <Text style={[styles.menuItemText, { color: Colors[colorScheme ?? 'light'].error }]}>Delete Account</Text>
                        <Ionicons name="chevron-forward" size={20} color={Colors[colorScheme ?? 'light'].textMuted} />
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    topPadding: {
        height: Platform.OS === 'ios' ? 60 : 20,
    },
    section: {
        marginBottom: 32,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        letterSpacing: 0.5,
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    card: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
    userDetails: {
        flex: 1,
    },
    username: {
        fontSize: 17,
        fontWeight: '600',
        marginBottom: 2,
    },
    email: {
        fontSize: 15,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        minHeight: 56,
    },
    menuItemText: {
        flex: 1,
        fontSize: 17,
        marginLeft: 12,
        fontWeight: '400',
    },
    errorContainer: {
        margin: 20,
        padding: 12,
        borderRadius: 8,
    },
    errorText: {
        textAlign: 'center',
        fontSize: 14,
        fontWeight: '500',
    },
    loader: {
        marginVertical: 20,
    },
});