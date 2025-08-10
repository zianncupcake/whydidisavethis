import React from 'react';
import {
    View,
    Text,
    Button,
    ActivityIndicator,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { useAuth } from '@/utils/authContext';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function SettingsScreen() {
    const {
        logOut,
        isLoadingAction,
        actionError,
        deleteUser
    } = useAuth();
    const colorScheme = useColorScheme();

    const handleLogout = async () => {
        await logOut();
    };

    const handleDeleteAccount = async () => {
        await deleteUser();
    };

    return (
        <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
            {actionError && (
                <Text style={[styles.errorText, { color: Colors[colorScheme ?? 'light'].error }]}>{actionError}</Text>
            )}

            {isLoadingAction && (
                <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].primary} style={styles.loader} />
            )}

            <TouchableOpacity 
                style={[styles.button, styles.logoutButton, { backgroundColor: Colors[colorScheme ?? 'light'].errorBackground, borderColor: Colors[colorScheme ?? 'light'].errorBorder }, isLoadingAction && styles.disabledButton]} 
                onPress={handleLogout}
                disabled={isLoadingAction}
            >
                <Text style={[styles.buttonText, { color: Colors[colorScheme ?? 'light'].error }]}>Log Out</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={[styles.button, styles.deleteButton, { backgroundColor: Colors[colorScheme ?? 'light'].errorBackground, borderColor: Colors[colorScheme ?? 'light'].error }, isLoadingAction && styles.disabledButton]} 
                onPress={handleDeleteAccount}
                disabled={isLoadingAction}
            >
                <Text style={[styles.buttonText, { color: Colors[colorScheme ?? 'light'].error }]}>Delete Account</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },
    button: {
        marginBottom: 20,
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
        alignItems: 'center',
        borderWidth: 1,
    },
    logoutButton: {},
    deleteButton: {},
    disabledButton: {
        opacity: 0.6,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    errorText: {
        textAlign: 'center',
        marginVertical: 15,
        fontSize: 14,
    },
    loader: {
        marginVertical: 20,
    },
});