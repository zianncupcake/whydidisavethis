// app/(tabs)/settings.tsx (or your settings screen file path)
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    Button,
    ActivityIndicator,
    StyleSheet,
    Alert,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { useAuth } from '@/utils/authContext';

export default function SettingsScreen() {
    const {
        logOut,
        isLoadingAction,
        actionError,
    } = useAuth();

    const handleLogout = async () => {
        await logOut();
    };

    return (
        <View style={styles.container}>
            {actionError && (
                <Text style={styles.errorText}>{actionError}</Text>
            )}

            {isLoadingAction && (
                <ActivityIndicator size="large" color="#007bff" style={styles.loader} />
            )}

            <View style={styles.section}>
                <Button title="Log Out" onPress={handleLogout} color="#E53E3E" disabled={isLoadingAction} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },
    section: {
        marginBottom: 30,
        padding: 20,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        elevation: 3,
        alignItems: 'center',
    },
    errorText: {
        color: '#E53E3E',
        textAlign: 'center',
        marginVertical: 15,
        fontSize: 14,
    },
    loader: {
        marginVertical: 20,
    },
});